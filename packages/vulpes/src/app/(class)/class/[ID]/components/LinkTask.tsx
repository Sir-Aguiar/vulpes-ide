import { ITask } from "@/@types/Task";
import API from "@/services/API";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  MenuItem,
  Modal,
  Paper,
  Select,
  Slide,
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
import { motion } from "framer-motion";
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

export default function LinkTask({ handleCloseModal, isModalOpen }: IProps) {
  const { ID: classId } = useParams();

  const [searchField, setSearchField] = useState("");
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [tasks, setTasks] = useState<ITask[]>([]);

  const [linkLoading, setLinkLoading] = useState(false);

  const fetchTasks = async () => {
    try {
      const response = await API.get(`task/linkable-to-class`, {
        params: { classId },
      });
      setTasks(response.data.tasks);
      console.log(response.data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    }
  };

  const selectTask = (e: ChangeEvent<HTMLInputElement>, task: ITask) => {
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
      fetchTasks();
    }

    return () => setTasks([]);
  }, [isModalOpen]);

  return (
    <Modal open={isModalOpen} onClose={handleCloseModal}>
      <Box sx={modalStyle}>
        <Stack spacing={2}>
          <Stack spacing={2} direction="row">
            <TextField
              fullWidth
              label="Buscar Tarefa"
              variant="outlined"
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
            />
            <Select defaultValue={0} size="small">
              <MenuItem value={0}>Mais recente</MenuItem>
              <MenuItem value={1}>Mais antigo</MenuItem>
            </Select>
          </Stack>
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
          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button fullWidth>Cancelar</Button>
            <Button fullWidth onClick={linkSelectedTasks} variant="contained">
              {linkLoading ? <CircularProgress size={20} /> : "Linkar Tarefas"}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Modal>
  );
}
