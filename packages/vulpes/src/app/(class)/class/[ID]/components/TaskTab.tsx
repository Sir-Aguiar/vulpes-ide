import { ITask } from "@/@types/Task";
import API from "@/services/API";
import {
  Box,
  Button,
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
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import LinkTask from "./LinkTask";

interface ITaskTabProps {
  classId: string;
  isProfessorOrAdmin: boolean;
}

interface IClassTaskItem {
  classTaskId: string;
  task: ITask;
}

export default function TasksTab({
  classId,
  isProfessorOrAdmin,
}: ITaskTabProps) {
  const [classTasks, setClassTasks] = useState<IClassTaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    fetchTasks();
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/class-task/class/${classId}`);
      const items: IClassTaskItem[] = response.data.data.map(
        ({ classTaskId, task }: { classTaskId: string; task: ITask }) => ({
          classTaskId,
          task,
        }),
      );

      setClassTasks(items);
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
    <Box sx={{ position: "relative", overflowX: "hidden", minHeight: 400 }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {isProfessorOrAdmin && (
          <Button onClick={handleOpenModal}>Víncular Novas Tarefas</Button>
        )}

        {loading ? (
          <CircularProgress />
        ) : (
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell width={120}></TableCell>
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
                {classTasks.map(({ classTaskId, task }) => (
                  <TableRow key={classTaskId}>
                    <TableCell>
                      <Link
                        href={`/task?classTaskId=${classTaskId}`}
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
        <LinkTask
          isModalOpen={isModalOpen}
          handleCloseModal={handleCloseModal}
        />
      </Box>
    </Box>
  );
}
