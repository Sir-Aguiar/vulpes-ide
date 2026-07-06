import { useAuth } from "@/providers/AuthProvider";
import API from "@/services/API";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  MenuItem,
  Modal,
  Pagination,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";

interface IProps {
  handleCloseModal: () => void;
  isModalOpen: boolean;
}

const modalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "90%", sm: "70%", md: "50%" },
  bgcolor: "background.paper",
  boxShadow: 24,
  maxHeight: "80vh",
  overflowY: "auto",
  p: 4,
};

interface ITaskResponse {
  taskId: string;
  creatorId: string;
  title: string;
  description: string;
  updatedAt: Date;
  createdAt: Date;
  isPublic: boolean;
  isVisible: boolean;
}

interface IResponse {
  data: ITaskResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function LinkTask({ handleCloseModal, isModalOpen }: IProps) {
  const { ID: classId } = useParams();
  const { user } = useAuth();

  const [searchField, setSearchField] = useState("");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [tasks, setTasks] = useState<ITaskResponse[]>([]);

  const [linkLoading, setLinkLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await API.get<IResponse>(`task/linkable-to-class`, {
        params: {
          classId,
          page,
          limit: 10,
          search: searchField || undefined,
          order,
        },
      });
      setTasks(response.data.data);
      setTotalPages(response.data.totalPages || 1);
      console.log(response.data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilter = () => {
    if (page === 1) {
      fetchTasks();
    } else {
      setPage(1);
    }
  };

  const selectTask = (
    e: ChangeEvent<HTMLInputElement>,
    task: ITaskResponse,
  ) => {
    if (e.target.checked) {
      setSelectedTasks([...selectedTasks, task.taskId]);
    } else {
      setSelectedTasks(selectedTasks.filter((id) => id !== task.taskId));
    }
  };

  const linkSelectedTasks = async () => {
    setLinkLoading(true);
    try {
      for (const taskId of selectedTasks) {
        const response = await API.post(`/class-task`, { classId, taskId });
        console.log(`Linked Task ${taskId}:`, response.data);
      }

      handleCloseModal();
    } catch (error) {
      console.error("Failed to link tasks:", error);
    } finally {
      setLinkLoading(false);
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      if (page === 1) {
        fetchTasks();
      } else {
        setPage(1);
      }
    }
  }, [isModalOpen, order]);

  useEffect(() => {
    if (isModalOpen) {
      fetchTasks();
    }
  }, [page]);

  return (
    <Modal open={isModalOpen} onClose={handleCloseModal}>
      <Box sx={modalStyle}>
        <Stack spacing={2}>
          <Stack spacing={2} direction="row">
            <TextField
              fullWidth
              label="Buscar Tarefa"
              variant="outlined"
              size="small"
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
            />
            <Button
              variant="contained"
              sx={{ minWidth: 100 }}
              onClick={handleFilter}
              disabled={isLoading}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Filtrar"
              )}
            </Button>
            <Select
              value={order}
              onChange={(e) => setOrder(e.target.value as "asc" | "desc")}
              size="small"
              disabled={isLoading}
            >
              <MenuItem value="desc">Mais recente</MenuItem>
              <MenuItem value="asc">Mais antigo</MenuItem>
            </Select>
          </Stack>
          {isLoading ? (
            <Stack
              alignItems="center"
              justifyContent="center"
              minHeight={200}
              component={Paper}
            >
              <CircularProgress />
            </Stack>
          ) : (
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell width={10}></TableCell>
                    <TableCell width={120}></TableCell>
                    <TableCell>Título</TableCell>
                    <TableCell align="center">Dificuldade</TableCell>
                    <TableCell align="right">Data de Criação</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.taskId}>
                      <TableCell>
                        <Checkbox
                          checked={selectedTasks.includes(task.taskId)}
                          onChange={(e) => selectTask(e, task)}
                        />
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/task?taskId=${task.taskId}`}
                          style={{ textDecoration: "none" }}
                        >
                          <Typography variant="body2" color="primary">
                            Ver Detalhes
                          </Typography>
                        </Link>
                      </TableCell>
                      <TableCell component="th" scope="row">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography>{task.title}</Typography>
                          {task.creatorId === user?.userId ? (
                            <Chip
                              label="Minha tarefa"
                              size="small"
                              color="primary"
                            />
                          ) : (
                            <Chip
                              label="Pública"
                              size="small"
                              color="secondary"
                            />
                          )}
                        </Stack>
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
          {totalPages > 1 && (
            <Stack direction="row" justifyContent="center">
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
                disabled={isLoading}
              />
            </Stack>
          )}
          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button fullWidth onClick={handleCloseModal} disabled={linkLoading}>
              Cancelar
            </Button>
            <Button
              fullWidth
              onClick={linkSelectedTasks}
              variant="contained"
              disabled={linkLoading || isLoading}
            >
              {linkLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Linkar Tarefas"
              )}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Modal>
  );
}
