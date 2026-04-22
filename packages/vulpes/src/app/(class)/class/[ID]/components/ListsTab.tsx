import API from "@/services/API";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { AnimatePresence, motion } from "framer-motion";
import { ITask } from "@/@types/Task";
import Link from "next/link";
import InsertLinkIcon from "@mui/icons-material/InsertLink";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";

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
                              href={`/task/${task.taskId}?listId=${selectedList.listId}`}
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
