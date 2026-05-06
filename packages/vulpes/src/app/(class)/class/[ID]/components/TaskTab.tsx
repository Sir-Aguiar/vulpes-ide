import { ISubmission } from "@/@types/Submission";
import { ITask } from "@/@types/Task";
import { useAuth } from "@/providers/AuthProvider";
import API from "@/services/API";
import { Editor } from "@monaco-editor/react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
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
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { registerPortugolLanguage } from "../../../../../../libs/monaco-config";
import LinkTask from "./LinkTask";

interface ITaskTabProps {
  classId: string;
  isProfessorOrAdmin: boolean;
}

export default function TasksTab({
  classId,
  isProfessorOrAdmin,
}: ITaskTabProps) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
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
      const filteredTasks = response.data.data.map(
        ({ task }: { task: ITask }) => task,
      );

      setTasks(filteredTasks);
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

  function SubmissionsContent({
    onBack,
    taskId,
  }: {
    onBack: () => void;
    taskId: string;
  }) {
    const [submissions, setSubmissions] = useState<ISubmission[]>([]);
    const [selectedSubmission, setSelectedSubmission] =
      useState<ISubmission | null>(null);
    const [professorComments, setProfessorComments] = useState<string>("");
    const [feedbackLoading, setFeedbackLoading] = useState(false);

    const fetchSubmissions = async () => {
      try {
        const response = await API.get(`/submission/task/${taskId}`);
        setSubmissions(response.data);
      } catch (error) {
        console.error("Failed to fetch submissions:", error);
        toast.error("Erro ao carregar submissões.");
      }
    };

    useEffect(() => {
      fetchSubmissions();

      return () => {
        setSubmissions([]);
      };
    }, [taskId]);

    const handleEditorDidMount = (editorInstance: any, monacoInstance: any) => {
      registerPortugolLanguage(monacoInstance);
      monacoInstance.editor.setTheme("vs-dark");
    };

    const sendFeedback = async () => {
      if (!professorComments.trim()) {
        toast.error("Defina o comentário do professor");
        return;
      }

      setFeedbackLoading(true);
      try {
        await API.put(
          `/submission/feedback/${selectedSubmission?.submissionId}`,
          {
            professorComments,
          },
        );
        await fetchSubmissions();
        toast.success("Feedback enviado com sucesso!");
        setSelectedSubmission(null);
        setProfessorComments("");
      } catch (error: any) {
        console.error("Failed to send feedback:", error);
        toast.error(
          error.response?.data?.message || "Erro ao enviar feedback.",
        );
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
          {selectedSubmission && (
            <motion.div
              key="sbumission-review"
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" gap={1} sx={{ height: 300 }}>
                <Editor
                  height="100%"
                  theme="vs-dark"
                  language="portugol"
                  onMount={handleEditorDidMount}
                  value={selectedSubmission ? selectedSubmission.code : ""}
                />
                <MDEditor
                  height="100%"
                  style={{ width: "100%" }}
                  value={professorComments}
                  onChange={(val) => setProfessorComments(val || "")}
                />
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
                    setSelectedSubmission(null);
                    setProfessorComments("");
                  }}
                  disabled={feedbackLoading}
                >
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  onClick={sendFeedback}
                  disabled={feedbackLoading}
                >
                  {feedbackLoading ? (
                    <CircularProgress size={24} />
                  ) : (
                    "Enviar Feedback"
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
                  Resultado
                </TableCell>
                <TableCell width={130} align="center">
                  Código
                </TableCell>
                <TableCell width={250}>Data</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow key={submission.submissionId}>
                  <TableCell>{submission.student.name}</TableCell>
                  <TableCell>{submission.student.email}</TableCell>
                  <TableCell align="center">
                    {submission.isCorrect ? (
                      <Typography color="success.main">Correto</Typography>
                    ) : (
                      <Typography color="error.main">Incorreto</Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Button onClick={() => {
                      setSelectedSubmission(submission);
                      setProfessorComments(submission.professorComments || "");
                    }}>
                      Analisar
                    </Button>
                  </TableCell>
                  <TableCell>
                    {new Date(submission.submittedAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }

  return (
    <Box sx={{ position: "relative", overflowX: "hidden", minHeight: 400 }}>
      <AnimatePresence mode="wait" initial={false}>
        {!showSubmissions ? (
          <motion.div
            key="list"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {isProfessorOrAdmin && (
                <Button onClick={handleOpenModal}>
                  Víncular Novas Tarefas
                </Button>
              )}

              {loading ? (
                <CircularProgress />
              ) : (
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell width={120}></TableCell>

                        {user?.role !== "STUDENT" && (
                          <TableCell width={40}>Envios</TableCell>
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
                      {tasks.map((task) => (
                        <TableRow key={task.taskId}>
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
                          {user?.role !== "STUDENT" && (
                            <TableCell align="center">
                              <Box
                                onClick={() => {
                                  setShowSubmissions(true);
                                  setSelectedTaskId(task.taskId);
                                }}
                                sx={{
                                  cursor: "pointer",
                                  textDecoration: "underline",
                                  color: "primary.main",
                                  "&:hover": { fontWeight: "bold" },
                                }}
                              >
                                Ver
                              </Box>
                            </TableCell>
                          )}

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
          </motion.div>
        ) : (
          <motion.div
            key="submissions"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SubmissionsContent
              onBack={() => setShowSubmissions(false)}
              taskId={selectedTaskId!}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
