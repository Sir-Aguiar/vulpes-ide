"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Container,
  Modal,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import AuthGuard from "@/components/AuthGuard";
import AppNavBar from "@/components/AppNavBar";
import API from "@/services/API";
import { useAuth } from "@/providers/AuthProvider";
import { IClass } from "@/@types/Class";
import { toast } from "react-toastify";
import { ITask } from "@/@types/Task";
import Link from "next/link";
import { map } from "rxjs";

interface IClassRequest {
  classId: string;
  studentId: string;
  message: string | null;
  createdAt: string;
  student?: {
    userId: string;
    name: string;
    email: string;
  };
}

interface IGetClassRequestsResponse {
  requests: IClassRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface IListItem {
  listId: string;
  classId: string;
  title: string;
  deadline: string;
  submissionLimit: number;
}

interface IGetListsResponse {
  lists: IListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ITaskItem {
  taskId: string;
  title: string;
  description: string;
  isPublic: boolean;
  isVisible: boolean;
  creatorId: string;
  creator?: {
    userId: string;
    name: string;
  };
}

interface IGetTasksResponse {
  tasks: ITaskItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const checkboxIcon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkboxCheckedIcon = <CheckBoxIcon fontSize="small" />;

export default function ClassPage() {
  return (
    <AuthGuard requiredRoles={["STUDENT", "PROFESSOR", "ADMIN"]}>
      <AppNavBar />
      <ClassContent />
    </AuthGuard>
  );
}

function ClassContent() {
  const { ID } = useParams();
  const { user } = useAuth();
  const classId = Array.isArray(ID) ? ID[0] : ID;
  const isProfessorOrAdmin =
    user?.role === "PROFESSOR" || user?.role === "ADMIN";

  const [tabIndex, setTabIndex] = useState(0);
  const [classData, setClassData] = useState<IClass | null>(null);
  const [loadingClass, setLoadingClass] = useState(true);
  const [classError, setClassError] = useState<string | null>(null);

  const isOwnerOrAdmin =
    user?.role === "ADMIN" ||
    (classData?.professorId && user?.userId === classData.professorId);

  const tabs = useMemo(() => {
    if (isOwnerOrAdmin) {
      return [
        { key: "tasks", label: "Tarefas" },
        { key: "requests", label: "Solicitações" },
        { key: "create", label: "Criar Lista" },
        { key: "lists", label: "Listas" },
      ];
    }

    return [
      { key: "lists", label: "Listas" },
      { key: "tasks", label: "Tarefas" },
    ];
  }, [isOwnerOrAdmin]);

  useEffect(() => {
    if (tabIndex > tabs.length - 1) {
      setTabIndex(0);
    }
  }, [tabIndex, tabs.length]);

  useEffect(() => {
    const fetchClass = async () => {
      if (!classId) return;
      setLoadingClass(true);
      setClassError(null);
      try {
        const response = await API.get<IClass>(`/class/${classId}`);
        setClassData(response.data);
      } catch (error) {
        console.error("Failed to fetch class:", error);
        setClassError("Não foi possível carregar a turma.");
      } finally {
        setLoadingClass(false);
      }
    };

    fetchClass();
  }, [classId]);

  if (loadingClass) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (classError || !classData) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <Alert severity="error">{classError ?? "Turma não encontrada."}</Alert>
      </Box>
    );
  }

  const activeTab = tabs[tabIndex]?.key ?? "lists";

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          {classData.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Código: {classData.code} • Professor: {classData.professor.name}
        </Typography>
      </Box>

      <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 3 }}>
        {tabs.map((tab) => (
          <Tab key={tab.key} label={tab.label} />
        ))}
      </Tabs>

      {activeTab === "tasks" && (
        <TasksTab
          classId={classData.classId}
          isProfessorOrAdmin={isProfessorOrAdmin}
        />
      )}
      {activeTab === "requests" && <RequestsTab classId={classData.classId} />}
      {activeTab === "create" && (
        <CreateListTab
          classId={classData.classId}
          onCreated={() =>
            setTabIndex(tabs.findIndex((t) => t.key === "lists"))
          }
        />
      )}
      {activeTab === "lists" && <ListsTab classId={classData.classId} />}
    </Container>
  );
}

interface ITaskTabProps {
  classId: string;
  isProfessorOrAdmin: boolean;
}

function TasksTab({ classId, isProfessorOrAdmin }: ITaskTabProps) {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/class-task/class/${classId}`);
      const filteredTasks = response.data.classTasks.map(
        ({ task }: { task: ITask }) => task,
      );

      setTasks(filteredTasks);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      toast.error("Erro ao carregar tarefas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [classId]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {isProfessorOrAdmin && (
        <Button onClick={handleOpenModal}>Víncular Novas Tarefas</Button>
      )}

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell width={120}></TableCell>
                <TableCell>Título</TableCell>
                <TableCell align="right">Dificuldade</TableCell>
                <TableCell align="right">Data de Criação</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.taskId}>
                  <TableCell>
                    <Link
                      href={`/task/${task.taskId}`}
                      style={{ textDecoration: "none" }}
                    >
                      <Typography variant="body2" color="primary">
                        Ver Detalhes
                      </Typography>
                    </Link>
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {task.title}
                  </TableCell>
                  <TableCell align="right">Fácil</TableCell>
                  <TableCell align="right">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute" as "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: 500 },
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            Víncular Novas Tarefas
          </Typography>
          <Typography variant="body1">
            Esta funcionalidade ainda está em desenvolvimento.
          </Typography>
        </Box>
      </Modal>
    </Box>
  );
}

function RequestsTab({ classId }: { classId: string }) {
  const [requests, setRequests] = useState<IClassRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await API.get<IGetClassRequestsResponse>(
        `/student-class-permission-request/class/${classId}`,
        { params: { page: 1, limit: 50 } },
      );
      setRequests(response.data.requests);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
      toast.error("Erro ao carregar solicitações.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [classId]);

  const handleApprove = async (studentId: string) => {
    try {
      await API.patch(
        `/student-class-permission-request/${classId}/${studentId}/approve`,
      );
      toast.success("Solicitação aprovada.");
      fetchRequests();
    } catch (error) {
      toast.error("Erro ao aprovar solicitação.");
    }
  };

  const handleReject = async (studentId: string) => {
    try {
      await API.patch(
        `/student-class-permission-request/${classId}/${studentId}/reject`,
      );
      toast.success("Solicitação rejeitada.");
      fetchRequests();
    } catch (error) {
      toast.error("Erro ao rejeitar solicitação.");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (requests.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography color="text.secondary">
          Nenhuma solicitação pendente.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {requests.map((request) => (
        <Card key={`${request.classId}-${request.studentId}`}>
          <CardContent
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h6">
                {request.student?.name ?? "Aluno"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {request.student?.email ?? ""}
              </Typography>
              {request.message && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Mensagem: {request.message}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                Enviada em:{" "}
                {new Date(request.createdAt).toLocaleDateString("pt-BR")}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleReject(request.studentId)}
              >
                Rejeitar
              </Button>
              <Button
                variant="contained"
                onClick={() => handleApprove(request.studentId)}
              >
                Aprovar
              </Button>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}

function CreateListTab({
  classId,
  onCreated,
}: {
  classId: string;
  onCreated: () => void;
}) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [submissionLimit, setSubmissionLimit] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [tasks, setTasks] = useState<ITaskItem[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<ITaskItem[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  // Filter tasks: only show tasks that are (visible AND public) OR owned by the user
  const availableTasks = useMemo(() => {
    return tasks.filter((task) => {
      const isVisibleAndPublic = task.isVisible && task.isPublic;
      const isOwner = task.creatorId === user?.userId;
      return isVisibleAndPublic || isOwner;
    });
  }, [tasks, user?.userId]);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoadingTasks(true);
      try {
        const response = await API.get<IGetTasksResponse>("/task", {
          params: { page: 1, limit: 100 },
        });
        setTasks(response.data.tasks);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
        toast.error("Erro ao carregar tarefas disponíveis.");
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchTasks();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!title.trim()) {
      toast.error("Informe o nome da lista.");
      return;
    }

    if (!deadline) {
      toast.error("Informe a data limite.");
      return;
    }

    const parsedDate = new Date(deadline);
    if (Number.isNaN(parsedDate.getTime())) {
      toast.error("Data limite inválida.");
      return;
    }

    setSubmitting(true);
    try {
      await API.post("/list", {
        classId,
        title: title.trim(),
        deadline: parsedDate.toISOString(),
        submissionLimit: submissionLimit || 1,
        taskIds: selectedTasks.map((t) => t.taskId),
      });
      const taskCount = selectedTasks.length;
      toast.success(
        taskCount > 0
          ? `Lista criada com ${taskCount} tarefa(s)!`
          : "Lista criada com sucesso!",
      );
      setTitle("");
      setDeadline("");
      setSubmissionLimit(1);
      setSelectedTasks([]);
      onCreated();
    } catch (error) {
      toast.error("Erro ao criar lista.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600 }}>
      <TextField
        fullWidth
        label="Nome da lista"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Data limite"
        type="datetime-local"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
        sx={{ mb: 2 }}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        fullWidth
        label="Limite de envios"
        type="number"
        value={submissionLimit}
        onChange={(e) => setSubmissionLimit(Number(e.target.value))}
        inputProps={{ min: 1 }}
        sx={{ mb: 2 }}
      />
      <Autocomplete
        multiple
        options={availableTasks}
        disableCloseOnSelect
        loading={loadingTasks}
        value={selectedTasks}
        onChange={(_, newValue) => setSelectedTasks(newValue)}
        getOptionLabel={(option) => option.title}
        isOptionEqualToValue={(option, value) => option.taskId === value.taskId}
        renderOption={(props, option, { selected }) => {
          const { key, ...otherProps } = props;
          return (
            <li key={option.taskId} {...otherProps}>
              <Checkbox
                icon={checkboxIcon}
                checkedIcon={checkboxCheckedIcon}
                style={{ marginRight: 8 }}
                checked={selected}
              />
              <Box>
                <Typography variant="body1">{option.title}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {option.creator?.name ?? "Autor desconhecido"}
                  {option.isPublic ? " • Pública" : ""}
                </Typography>
              </Box>
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Tarefas (opcional)"
            placeholder={
              selectedTasks.length === 0 ? "Selecione tarefas..." : ""
            }
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loadingTasks ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        sx={{ mb: 3 }}
      />
      <Button type="submit" variant="contained" disabled={submitting}>
        {submitting ? <CircularProgress size={24} /> : "Criar Lista"}
      </Button>
    </Box>
  );
}

function ListsTab({ classId }: { classId: string }) {
  const [lists, setLists] = useState<IListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLists = async () => {
    setLoading(true);
    try {
      const response = await API.get<IGetListsResponse>(
        `/list/class/${classId}`,
        { params: { page: 1, limit: 50 } },
      );
      setLists(response.data.lists);
    } catch (error) {
      console.error("Failed to fetch lists:", error);
      toast.error("Erro ao carregar listas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, [classId]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (lists.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography color="text.secondary">
          Nenhuma lista cadastrada.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
        gap: 2,
      }}
    >
      {lists.map((list) => (
        <Card key={list.listId}>
          <CardContent>
            <Typography variant="h6" noWrap>
              {list.title}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
