import { ITask } from "@/@types/Task";
import { useAppTheme } from "@/providers/ColorModeProvider";
import { useAuth } from "@/providers/AuthProvider";
import API from "@/services/API";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import InsertLinkIcon from "@mui/icons-material/InsertLink";
import ListAltIcon from "@mui/icons-material/ListAlt";
import {
  Box,
  Button,
  CircularProgress,
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
import { AnimatePresence, motion } from "framer-motion";
import { Montserrat } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const montserrat = Montserrat({ subsets: ["latin"] });

function formatListDeadline(dateValue: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateValue));
}

function ListCard({
  list,
  index = 0,
  onClick,
}: {
  list: IListItem;
  index?: number;
  onClick: () => void;
}) {
  const theme = useAppTheme();
  const closed = new Date(list.deadline).getTime() < Date.now();
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index, 8) * 0.05 }}
      sx={{ height: "100%" }}
    >
      <Box
        component="button"
        type="button"
        onClick={onClick}
        sx={{
          appearance: "none",
          font: "inherit",
          color: "inherit",
          textAlign: "left",
          cursor: "pointer",
          width: "100%",
          height: "100%",
          p: 2.5,
          borderRadius: 3,
          border: "1px solid",
          borderColor: theme.border,
          bgcolor: theme.bgCard,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
          "&:hover": {
            borderColor: "rgba(255,109,0,0.4)",
            transform: "translateY(-3px)",
            boxShadow:
              theme.mode === "dark"
                ? "0 12px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,109,0,0.1)"
                : "0 12px 32px rgba(15,23,42,0.08), 0 0 0 1px rgba(255,109,0,0.08)",
          },
          "&:focus-visible": {
            outline: `2px solid ${theme.brand}`,
            outlineOffset: 2,
          },
        }}
      >
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(255,109,0,0.1)",
              color: theme.brand,
              flexShrink: 0,
            }}
          >
            <ListAltIcon fontSize="small" />
          </Box>
        </Stack>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="subtitle1"
            className={montserrat.className}
            sx={{
              color: theme.text,
              fontWeight: 700,
              mb: 0.5,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {list.title}
          </Typography>
          <Typography
            variant="body2"
            noWrap
            sx={{ color: theme.textSecondary, fontSize: "0.8125rem" }}
          >
            Prazo · {formatListDeadline(list.deadline)}
          </Typography>
        </Box>

        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="caption" sx={{ color: theme.textMuted }}>
            {closed ? "Encerrada" : "Em aberto"}
          </Typography>
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            sx={{ color: theme.brand, fontWeight: 600, fontSize: "0.8125rem" }}
          >
            <span>Abrir</span>
            <ArrowForwardIcon sx={{ fontSize: 16 }} />
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}

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

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => setSelectedList(null)}
          variant="outlined"
          sx={{ maxWidth: 128 }}
        >
          Voltar
        </Button>
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
                gap: 2.5,
              }}
            >
              {lists.map((list, index) => (
                <ListCard
                  key={list.listId}
                  list={list}
                  index={index}
                  onClick={() => handleListSelect(list.listId)}
                />
              ))}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
