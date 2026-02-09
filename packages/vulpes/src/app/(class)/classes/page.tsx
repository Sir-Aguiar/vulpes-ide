"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  Box,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  CircularProgress,
  Container,
  Pagination,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import AuthGuard from "@/components/AuthGuard";
import AppNavBar from "@/components/AppNavBar";
import API from "@/services/API";
import { AuthContext, useAuth } from "@/providers/AuthProvider";
import {
  IClassListItem,
  IGetClassesResponse,
  IMyClassesResponse,
  IClass,
  IStudentClassPermissionRequest,
} from "@/@types/Class";
import {
  JoinClassByCodeSchema,
  IJoinClassByCodeDTO,
} from "@/@schemas/Class.schema";
import { safeZodResolver } from "@/utils/safeZodResolver";
import { toast } from "react-toastify";
import RHFTextField from "@/components/RHF/TextField";

export default function ClassesPage() {
  return (
    <AuthGuard requiredRoles={["STUDENT", "PROFESSOR", "ADMIN"]}>
      <AppNavBar />
      <ClassesContent />
    </AuthGuard>
  );
}

function ClassesContent() {
  const { user } = useAuth();
  const isProfessorOrAdmin =
    user?.role === "PROFESSOR" || user?.role === "ADMIN";

  if (isProfessorOrAdmin) {
    return <ProfessorClassesView />;
  }

  return <StudentClassesView />;
}

function ProfessorClassesView() {
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Turmas
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push("/classes/new")}
        >
          Nova Turma
        </Button>
      </Box>

      <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 3 }}>
        <Tab label="Minhas Turmas" />
        <Tab label="Buscar por Código" />
        <Tab label="Minhas Solicitações" />
        {isAdmin && <Tab label="Todas as Turmas" />}
      </Tabs>

      {tabIndex === 0 && <MyClassesList />}
      {tabIndex === 1 && <SearchByCodeView />}
      {tabIndex === 2 && <MyRequestsView />}
      {isAdmin && tabIndex === 3 && <AllClassesList />}
    </Container>
  );
}

function MyClassesList() {
  const router = useRouter();
  const [classes, setClasses] = useState<IClassListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyClasses = async () => {
      setLoading(true);
      try {
        const response = await API.get<IMyClassesResponse>("/class/my-classes");
        setClasses(response.data.classes);
      } catch (error) {
        console.error("Failed to fetch my classes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyClasses();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (classes.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography color="text.secondary">
          Você ainda não criou nenhuma turma
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
      {classes.map((classItem) => (
        <ClassCard
          key={classItem.classId}
          classItem={classItem}
          onClick={() => router.push(`/class/${classItem.classId}`)}
        />
      ))}
    </Box>
  );
}

function AllClassesList() {
  const router = useRouter();
  const [classes, setClasses] = useState<IClassListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchDebounce, setSearchDebounce] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      try {
        const params: any = { page, limit: 12 };
        if (searchDebounce) params.search = searchDebounce;

        const response = await API.get<IGetClassesResponse>("/class", {
          params,
        });
        setClasses(response.data.classes);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error("Failed to fetch classes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, [page, searchDebounce]);

  return (
    <>
      <TextField
        fullWidth
        placeholder="Buscar turmas por nome..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          },
        }}
      />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : classes.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography color="text.secondary">
            {searchDebounce
              ? "Nenhuma turma encontrada"
              : "Nenhuma turma cadastrada"}
          </Typography>
        </Box>
      ) : (
        <>
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
            {classes.map((classItem) => (
              <ClassCard
                key={classItem.classId}
                classItem={classItem}
                onClick={() => router.push(`/class/${classItem.classId}`)}
              />
            ))}
          </Box>

          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </>
  );
}

// ============ STUDENT VIEW ============

function StudentClassesView() {
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Turmas
      </Typography>

      <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 3 }}>
        <Tab label="Minhas Turmas" />
        <Tab label="Buscar por Código" />
        <Tab label="Minhas Solicitações" />
      </Tabs>

      {tabIndex === 0 && <StudentMyClassesList />}
      {tabIndex === 1 && <SearchByCodeView />}
      {tabIndex === 2 && <MyRequestsView />}
    </Container>
  );
}

function StudentMyClassesList() {
  const router = useRouter();
  const [classes, setClasses] = useState<IClassListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyClasses = async () => {
      setLoading(true);
      try {
        const response = await API.get<IMyClassesResponse>("/class/my-classes");
        setClasses(response.data.classes);
      } catch (error) {
        console.error("Failed to fetch my classes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyClasses();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (classes.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography color="text.secondary">
          Você ainda não está matriculado em nenhuma turma
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
      {classes.map((classItem) => (
        <ClassCard
          key={classItem.classId}
          classItem={classItem}
          onClick={() => router.push(`/class/${classItem.classId}`)}
        />
      ))}
    </Box>
  );
}

function SearchByCodeView() {
  const [foundClass, setFoundClass] = useState<IClass | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);

  const { user } = useContext(AuthContext)!;

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<IJoinClassByCodeDTO>({
    resolver: safeZodResolver(JoinClassByCodeSchema),
    defaultValues: { code: "", message: "" },
  });

  const codeValue = watch("code");

  const onSearch = async (data: IJoinClassByCodeDTO) => {
    setSearching(true);
    setSearchError(null);
    setFoundClass(null);

    try {
      const response = await API.get<IClass>(`/class/code/${data.code}`);
      setFoundClass(response.data);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setSearchError("Turma não encontrada com este código");
      } else {
        setSearchError("Erro ao buscar turma");
      }
    } finally {
      setSearching(false);
    }
  };

  const handleRequestJoin = () => {
    setRequestDialogOpen(true);
  };

  return (
    <Box sx={{ maxWidth: 500 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Digite o código de 4 dígitos fornecido pelo professor para encontrar a
        turma
      </Typography>

      <form onSubmit={handleSubmit(onSearch)}>
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <RHFTextField
            control={control}
            name="code"
            label="Código da Turma"
            errors={errors}
            placeholder="0000"
            slotProps={{ htmlInput: { maxLength: 4 } }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={searching || codeValue.length !== 4}
            sx={{ minWidth: 100 }}
          >
            {searching ? <CircularProgress size={24} /> : "Buscar"}
          </Button>
        </Box>
      </form>

      {searchError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {searchError}
        </Alert>
      )}

      {foundClass && (
        <Card>
          <CardContent>
            <Typography variant="h6">{foundClass.name}</Typography>
            <Typography color="text.secondary" sx={{ mb: 1 }}>
              Professor: {foundClass.professor.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Código: {foundClass.code}
            </Typography>
            {foundClass.professorId != user?.userId && (
              <Button variant="contained" onClick={handleRequestJoin}>
                Solicitar Participação
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {foundClass && (
        <RequestJoinDialog
          open={requestDialogOpen}
          onClose={() => setRequestDialogOpen(false)}
          classData={foundClass}
        />
      )}
    </Box>
  );
}

function RequestJoinDialog({
  open,
  onClose,
  classData,
}: {
  open: boolean;
  onClose: () => void;
  classData: IClass;
}) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await API.post("/student-class-permission-request", {
        classId: classData.classId,
        message: message || undefined,
      });
      toast.success("Solicitação enviada com sucesso!");
      onClose();
    } catch (error: any) {
      if (error?.response?.status === 409) {
        toast.error(
          error.response.data.message ||
            "Você já solicitou participação nesta turma",
        );
      } else {
        toast.error("Erro ao enviar solicitação");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Solicitar Participação</DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 2 }}>
          Enviar solicitação para participar da turma{" "}
          <strong>{classData.name}</strong>
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Mensagem (opcional)"
          placeholder="Escreva uma mensagem para o professor..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting}
        >
          {submitting ? <CircularProgress size={24} /> : "Enviar Solicitação"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function MyRequestsView() {
  const [requests, setRequests] = useState<IStudentClassPermissionRequest[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await API.get<IStudentClassPermissionRequest[]>(
        "/student-class-permission-request/my-requests",
      );
      setRequests(response.data);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCancel = async (classId: string, studentId: string) => {
    try {
      await API.delete(
        `/student-class-permission-request/${classId}/${studentId}`,
      );
      toast.success("Solicitação cancelada");
      fetchRequests();
    } catch (error) {
      toast.error("Erro ao cancelar solicitação");
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
          Você não tem solicitações pendentes
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
            }}
          >
            <Box>
              <Typography variant="h6">{request.class.name}</Typography>
              <Typography color="text.secondary" variant="body2">
                Professor: {request?.class?.professor?.name}
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
            <Button
              color="error"
              onClick={() => handleCancel(request.classId, request.studentId)}
            >
              Cancelar
            </Button>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}

// ============ SHARED COMPONENTS ============

function ClassCard({
  classItem,
  onClick,
}: {
  classItem: IClassListItem;
  onClick: () => void;
}) {
  return (
    <Card>
      <CardActionArea onClick={onClick}>
        <CardContent>
          <Typography variant="h6" noWrap>
            {classItem.name}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Professor: {classItem.professor.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Código: {classItem.code}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
