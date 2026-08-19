import { ISubmission } from "@/@types/Submission";
import { ITask } from "@/@types/Task";
import { useAppTheme } from "@/providers/ColorModeProvider";
import { useAuth } from "@/providers/AuthProvider";
import API from "@/services/API";
import { Editor } from "@monaco-editor/react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import InsertLinkIcon from "@mui/icons-material/InsertLink";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import MDEditor from "@uiw/react-md-editor";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { registerPortugolLanguage } from "../../../../../../libs/monaco-config";

interface IListItem {
  listId: string;
  classId: string;
  title: string;
  deadline: string;
  submissionLimit: number;
}

interface IGetListsResponse {
  data: IListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ISubmissionGroup {
  submittedAt: string;
  student: ISubmission["student"];
  submissions: ISubmission[];
}

function ListSubmissionsContent({
  onBack,
  listId,
}: {
  onBack: () => void;
  listId: string;
}) {
  const appTheme = useAppTheme();
  const [submissionGroups, setSubmissionGroups] = useState<ISubmissionGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<ISubmissionGroup | null>(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [professorComments, setProfessorComments] = useState<string>("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const fetchSubmissions = async () => {
    try {
      const response = await API.get(`/submission/list/${listId}`);
      const groupsMap: Record<string, ISubmissionGroup> = {};

      response.data.forEach((sub: ISubmission) => {
        if (!groupsMap[sub.submittedAt]) {
          groupsMap[sub.submittedAt] = {
            submittedAt: sub.submittedAt,
            student: sub.student,
            submissions: [],
          };
        }
        groupsMap[sub.submittedAt].submissions.push(sub);
      });

      const groups = Object.values(groupsMap).sort(
        (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );
      setSubmissionGroups(groups);
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
      toast.error("Erro ao carregar submissões.");
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [listId]);

  const handleEditorDidMount = (editorInstance: any, monacoInstance: any) => {
    registerPortugolLanguage(monacoInstance);
    monacoInstance.editor.setTheme("vs-dark");
  };

  const currentSubmission = selectedGroup?.submissions[currentTaskIndex];

  useEffect(() => {
    if (currentSubmission) {
      setProfessorComments(currentSubmission.professorComments || "");
    }
  }, [currentSubmission]);

  const sendFeedback = async () => {
    if (!currentSubmission) return;
    if (!professorComments.trim()) {
      toast.error("Defina o comentário do professor");
      return;
    }

    setFeedbackLoading(true);
    try {
      await API.put(`/submission/feedback/${currentSubmission.submissionId}`, {
        professorComments,
      });
      await fetchSubmissions();

      // Update local state to reflect change without closing the modal
      const updatedGroup = { ...selectedGroup! };
      updatedGroup.submissions[currentTaskIndex].professorComments = professorComments;
      setSelectedGroup(updatedGroup);

      toast.success("Feedback enviado com sucesso!");
    } catch (error: any) {
      console.error("Failed to send feedback:", error);
      toast.error(error.response?.data?.message || "Erro ao enviar feedback.");
    } finally {
      setFeedbackLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={onBack}
        variant="outlined"
        sx={{ maxWidth: 128 }}
      >
        Voltar
      </Button>
      <AnimatePresence mode="wait" initial={false}>
        {selectedGroup && (
          <motion.div
            key="submission-review"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="h6">
                Tarefa {currentTaskIndex + 1} de {selectedGroup.submissions.length}
              </Typography>
              <Box>
                <IconButton
                  disabled={currentTaskIndex === 0}
                  onClick={() => setCurrentTaskIndex(prev => prev - 1)}
                >
                  <ArrowBackIosIcon />
                </IconButton>
                <IconButton
                  disabled={currentTaskIndex === selectedGroup.submissions.length - 1}
                  onClick={() => setCurrentTaskIndex(prev => prev + 1)}
                >
                  <ArrowForwardIosIcon />
                </IconButton>
              </Box>
            </Box>
            <Stack direction="row" gap={1} sx={{ height: 300 }}>
              <Box sx={{ flex: 1, bgcolor: appTheme.codeBg, borderRadius: 1, overflow: "hidden" }}>
                <Editor
                  height="100%"
                  theme="vs-dark"
                  language="portugol"
                  onMount={handleEditorDidMount}
                  value={currentSubmission ? currentSubmission.code : ""}
                  options={{ readOnly: true }}
                />
              </Box>
              <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography variant="subtitle2">
                  Status: {currentSubmission?.isCorrect ? (
                    <Box component="span" sx={{ color: "success.main" }}>Correto</Box>
                  ) : (
                    <Box component="span" sx={{ color: "error.main" }}>Incorreto</Box>
                  )}
                </Typography>
                <Box data-color-mode={appTheme.mode} sx={{ flexGrow: 1 }}>
                  <MDEditor
                    height="100%"
                    style={{ width: "100%", flexGrow: 1 }}
                    value={professorComments}
                    onChange={(val) => setProfessorComments(val || "")}
                  />
                </Box>
              </Box>
            </Stack>
            <Stack
              direction="row"
              gap={1}
              alignItems="center"
              justifyContent="flex-end"
              sx={{ my: 2 }}
            >
              <Button
                onClick={() => {
                  setSelectedGroup(null);
                  setCurrentTaskIndex(0);
                  setProfessorComments("");
                }}
                disabled={feedbackLoading}
              >
                Fechar
              </Button>
              <Button
                variant="contained"
                onClick={sendFeedback}
                disabled={feedbackLoading}
              >
                {feedbackLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  "Enviar Feedback para esta tarefa"
                )}
              </Button>
            </Stack>
            <Divider />
          </motion.div>
        )}
      </AnimatePresence>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width={320}>Nome</TableCell>
              <TableCell>Email</TableCell>
              <TableCell width={130} align="center">
                Tarefas
              </TableCell>
              <TableCell width={130} align="center">
                Código
              </TableCell>
              <TableCell width={250}>Data</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {submissionGroups.map((group) => {
              const correctCount = group.submissions.filter(s => s.isCorrect).length;
              return (
                <TableRow key={group.submittedAt + group.student.email}>
                  <TableCell>{group.student.name}</TableCell>
                  <TableCell>{group.student.email}</TableCell>
                  <TableCell align="center">
                    {correctCount} / {group.submissions.length} corretas
                  </TableCell>
                  <TableCell align="center">
                    <Button onClick={() => {
                      setSelectedGroup(group);
                      setCurrentTaskIndex(0);
                    }}>
                      Analisar
                    </Button>
                  </TableCell>
                  <TableCell>
                    {new Date(group.submittedAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default function ListsTab({ classId }: { classId: string }) {
  const [lists, setLists] = useState<IListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedList, setSelectedList] = useState<IListItem | null>(null);

  const fetchLists = async () => {
    setLoading(true);
    try {
      const response = await API.get<IGetListsResponse>(
        `/list/class/${classId}`,
        { params: { page: 1, limit: 50 } },
      );
      setLists(response.data.data);
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

  const handleListSelect = (listId: string) => {
    const foundList = lists.find((list) => list.listId === listId) ?? null;
    setSelectedList(foundList);
  };

  function ListContent() {
    const { user } = useAuth();
    const router = useRouter();
    const [tasksInList, setTasksInList] = useState<ITask[]>([]);
    const [loading, setLoading] = useState(false);
    const [showSubmissions, setShowSubmissions] = useState(false);

    const fetchTasks = async () => {
      setLoading(true);
      const result = await API.get(
        `/class-task-list/task/${selectedList?.listId}`,
      );
      setTasksInList(result.data.data);
      setLoading(false);
    };

    useEffect(() => {
      if (selectedList) fetchTasks();

      return () => {
        setTasksInList([]);
      };
    }, []);

    if (showSubmissions && selectedList) {
      return (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key="list-submissions"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ListSubmissionsContent
              onBack={() => setShowSubmissions(false)}
              listId={selectedList.listId}
            />
          </motion.div>
        </AnimatePresence>
      );
    }

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Stack direction="row" gap={2} justifyContent="space-between">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => setSelectedList(null)}
            variant="outlined"
            sx={{ maxWidth: 128 }}
          >
            Voltar
          </Button>
          {(user?.role === "PROFESSOR" || user?.role === "ADMIN") && (
            <Button
              variant="contained"
              onClick={() => setShowSubmissions(true)}
            >
              Envios
            </Button>
          )}
        </Stack>
        <Button
          variant="outlined"
          fullWidth
          sx={{ maxWidth: 328, marginX: "auto" }}
          onClick={() => router.push(`/list/${selectedList?.listId}`)}
        >
          Executar Lista
        </Button>
        <AnimatePresence mode="wait" initial={false}>
          {selectedList && (
            <motion.div
              key="list-content"
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {loading ? (
                <CircularProgress sx={{ marginX: "auto" }} size={20} />
              ) : (
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                      <TableRow>
                        {user?.role === "STUDENT" ? (
                          <TableCell width={120}>Link</TableCell>
                        ) : (
                          <TableCell width={120}>Ver Envios</TableCell>
                        )}
                        <TableCell>Título</TableCell>
                        <TableCell align="center" width={100}>
                          Dificuldade
                        </TableCell>
                        <TableCell align="center" width={150}>
                          Data de Criação
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tasksInList.map((task) => (
                        <TableRow key={task.taskId}>
                          <TableCell>
                            <Link
                              href={`/task?taskId=${task.taskId}`}
                              style={{ textDecoration: "none" }}
                            >
                              <Typography variant="body2" color="primary">
                                <InsertLinkIcon />
                              </Typography>
                            </Link>
                          </TableCell>
                          <TableCell component="th" scope="row">
                            {task.title}
                          </TableCell>
                          <TableCell align="center">Fácil</TableCell>
                          <TableCell align="center">
                            {new Date(task.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <AnimatePresence mode="wait" initial={false}>
        {selectedList ? (
          <motion.div
            key="list"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ListContent />
          </motion.div>
        ) : (
          <motion.div
            key="lists"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                  md: "1fr 1fr 1fr",
                },
                gap: 2,
              }}
            >
              {lists.map((list) => (
                <Card
                  key={list.listId}
                  sx={{ cursor: "pointer" }}
                  onClick={() => handleListSelect(list.listId)}
                >
                  <CardContent>
                    <Typography variant="h6" noWrap>
                      {list.title}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
