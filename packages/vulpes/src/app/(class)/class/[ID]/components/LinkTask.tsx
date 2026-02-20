import { ITask } from "@/@types/Task";
import API from "@/services/API";
import {
  Box,
  Checkbox,
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
import { useEffect, useState } from "react";

interface IProps {
  handleCloseModal: () => void;
  isModalOpen: boolean;
}

export default function LinkTask({ handleCloseModal, isModalOpen }: IProps) {
  const [searchField, setSearchField] = useState("");
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [tasks, setTasks] = useState<ITask[]>([]);

  const fetchTasks = async () => {
    try {
      const response = await API.get(`/task`);
      setTasks(response.data.tasks);
      console.log(response.data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
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
      <Box
        sx={{
          position: "absolute" as "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: "70%", md: "50%" },
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
        }}
      >
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
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTasks([...selectedTasks, task.taskId]);
                          } else {
                            setSelectedTasks(
                              selectedTasks.filter((id) => id !== task.taskId),
                            );
                          }
                        }}
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
        </Stack>
      </Box>
    </Modal>
  );
}
