"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AuthGuard from "@/components/AuthGuard";
import AppNavBar from "@/components/AppNavBar";
import API from "@/services/API";
import { IGetTasksResponse, ITaskListItem } from "@/@types/Task";

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
  const [tasks, setTasks] = useState<ITaskListItem[]>([]);
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
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const params: any = {
          page,
          limit: 12,
        };

        if (searchDebounce) {
          params.search = searchDebounce;
        }

        const response = await API.get<IGetTasksResponse>("/task", { params });
        setTasks(response.data.tasks);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [page, searchDebounce]);

  const handleTaskClick = (taskId: string) => {
    router.push(`/task/${taskId}`);
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Tarefas Disponíveis
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Explore e selecione uma tarefa para começar a resolver
        </Typography>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar tarefas por título ou descrição..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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

      {/* Loading State */}
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
          }}
        >
          <CircularProgress />
        </Box>
      ) : tasks.length === 0 ? (
        /* Empty State */
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
          }}
        >
          <Typography variant="h6" color="text.secondary">
            {searchDebounce
              ? "Nenhuma tarefa encontrada para sua busca"
              : "Nenhuma tarefa disponível"}
          </Typography>
        </Box>
      ) : (
        <>
          {/* Tasks Grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              gap: 3,
            }}
          >
            {tasks.map((task) => (
              <Card
                key={task.taskId}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 6,
                  },
                }}
              >
                <CardActionArea
                  onClick={() => handleTaskClick(task.taskId)}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="h6"
                      component="h2"
                      gutterBottom
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {task.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {task.description}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ mt: 2, display: "block" }}
                    >
                      ID: {task.taskId}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Box>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 4,
              }}
            >
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
}
