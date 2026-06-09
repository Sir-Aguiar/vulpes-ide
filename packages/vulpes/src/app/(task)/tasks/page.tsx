"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  CircularProgress,
  InputAdornment,
  Pagination,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import AuthGuard from "@/components/AuthGuard";
import AppNavBar from "@/components/AppNavBar";
import { useAppTheme } from "@/providers/ColorModeProvider";
import TaskCard from "@/components/tasks/TaskCard";
import API from "@/services/API";
import { IGetTasksResponse, ITaskListItem } from "@/@types/Task";
import { useAuth } from "@/providers/AuthProvider";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({ subsets: ["latin"] });

export default function TasksPage() {
  return (
    <AuthGuard requiredRoles={["STUDENT", "PROFESSOR", "ADMIN"]}>
      <AppNavBar />
      <TasksListContent />
    </AuthGuard>
  );
}

function TasksListContent() {
  const router = useRouter();
  const { user } = useAuth();
  const theme = useAppTheme();

  const [tasks, setTasks] = useState<ITaskListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [searchDebounce, setSearchDebounce] = useState("");

  const searchFieldSx = useMemo(
    () => ({
      "& .MuiOutlinedInput-root": {
        bgcolor: theme.bgCard,
        color: theme.text,
        borderRadius: 2,
        "& fieldset": { borderColor: theme.border },
        "&:hover fieldset": { borderColor: theme.borderStrong },
        "&.Mui-focused fieldset": { borderColor: theme.brand },
      },
      "& .MuiInputBase-input::placeholder": {
        color: theme.textMuted,
        opacity: 1,
      },
      "& .MuiInputAdornment-root .MuiSvgIcon-root": { color: theme.textMuted },
    }),
    [theme],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const params: Record<string, string | number> = { page, limit: 12 };
        if (searchDebounce) params.search = searchDebounce;

        const response = await API.get<IGetTasksResponse>("/task", { params });
        setTasks(response.data.data);
        setTotalPages(response.data.totalPages);
        setTotal(response.data.total);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchTasks();
  }, [page, searchDebounce]);

  const canEditTask = (task: ITaskListItem) =>
    user?.userId === task.creatorId || user?.role === "ADMIN";

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Box
      component="main"
      sx={{
        width: "100%",
        minHeight: "calc(100vh - var(--appbar-height))",
        bgcolor: theme.bg,
        px: { xs: 3, md: 6 },
        py: { xs: 4, md: 6 },
        transition: "background-color 0.2s ease",
      }}
    >
      <Box sx={{ maxWidth: theme.maxWidth, mx: "auto" }}>
        <Stack spacing={1} sx={{ mb: 4 }}>
          <Typography
            variant="overline"
            sx={{ color: theme.brand, fontWeight: 700, letterSpacing: 2 }}
          >
            Atividades
          </Typography>
          <Typography
            variant="h4"
            component="h1"
            className={montserrat.className}
            sx={{ color: theme.text, fontWeight: 800 }}
          >
            Tarefas disponíveis
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: theme.textSecondary, maxWidth: 560, lineHeight: 1.6 }}
          >
            Explore e selecione uma tarefa para resolver no editor integrado.
            {total > 0 && !loading && (
              <Box component="span" sx={{ color: theme.textMuted, ml: 0.5 }}>
                ({total} {total === 1 ? "tarefa" : "tarefas"})
              </Box>
            )}
          </Typography>
        </Stack>

        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            placeholder="Buscar tarefas por título ou descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={searchFieldSx}
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
        </Box>

        {loading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 360,
              gap: 2,
              borderRadius: 3,
              border: "1px solid",
              borderColor: theme.border,
              bgcolor: theme.bgElevated,
            }}
          >
            <CircularProgress sx={{ color: theme.brand }} />
            <Typography variant="body2" sx={{ color: theme.textSecondary }}>
              Carregando tarefas...
            </Typography>
          </Box>
        ) : tasks.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 360,
              gap: 2,
              borderRadius: 3,
              border: "1px dashed",
              borderColor: theme.border,
              bgcolor: theme.bgElevated,
              px: 3,
              textAlign: "center",
            }}
          >
            <AssignmentOutlinedIcon sx={{ fontSize: 48, color: theme.textMuted }} />
            <Typography variant="h6" className={montserrat.className} sx={{ color: theme.text, fontWeight: 700 }}>
              {searchDebounce
                ? "Nenhuma tarefa encontrada"
                : "Nenhuma tarefa disponível"}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.textSecondary, maxWidth: 400 }}>
              {searchDebounce
                ? "Tente ajustar os termos da busca ou limpe o filtro."
                : "Novas tarefas aparecerão aqui quando forem publicadas."}
            </Typography>
          </Box>
        ) : (
          <>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  lg: "repeat(3, 1fr)",
                },
                gap: 2,
              }}
            >
              {tasks.map((task, index) => (
                <TaskCard
                  key={task.taskId}
                  task={task}
                  index={index}
                  animate
                  onResolve={(taskId) => router.push(`/task/${taskId}`)}
                  showEdit={canEditTask(task)}
                  onEdit={(event, taskId) => {
                    event.stopPropagation();
                    router.push(`/edit-task/${taskId}`);
                  }}
                />
              ))}
            </Box>

            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  size="large"
                  sx={{
                    "& .MuiPaginationItem-root": {
                      color: theme.textSecondary,
                      borderColor: theme.border,
                    },
                    "& .MuiPaginationItem-root:hover": {
                      bgcolor: "rgba(255,109,0,0.08)",
                    },
                    "& .Mui-selected": {
                      bgcolor: `${theme.brand} !important`,
                      color: "#fff !important",
                      "&:hover": { bgcolor: `${theme.brandDark} !important` },
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
