"use client";

import { ITask } from "@/@types/Task";
import AppNavBar from "@/components/AppNavBar";
import API from "@/services/API";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import {
  Box,
  Chip,
  CircularProgress,
  List,
  ListItemButton,
  ListItemText,
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
import { Montserrat } from "next/font/google";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const montserrat = Montserrat({ subsets: ["latin"] });

interface IFeedbackResponse {
  submissionId: string;
  studentId: string;
  taskId: string;
  listId: string | null;
  code: string;
  isCorrect: boolean;
  submittedAt: string;
  professorComments: string | null;
  updatedAt: string;
  task?: {
    taskId: string;
    title: string;
  };
}

function formatFeedbackDate(dateValue: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateValue));
}

function normalizeFeedbackResponse(payload: unknown): IFeedbackResponse[] {
  if (Array.isArray(payload)) {
    return payload as IFeedbackResponse[];
  }

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray((payload as { data: unknown }).data)
  ) {
    return (payload as { data: IFeedbackResponse[] }).data;
  }

  return [];
}

function groupFeedbacksByTask(feedbacks: IFeedbackResponse[]) {
  const orderedFeedbacks = [...feedbacks].sort((left, right) => {
    return (
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
    );
  });

  const uniqueByTask = new Map<string, IFeedbackResponse>();

  for (const feedback of orderedFeedbacks) {
    if (!uniqueByTask.has(feedback.taskId)) {
      uniqueByTask.set(feedback.taskId, feedback);
    }
  }

  return Array.from(uniqueByTask.values());
}

const FeedbackSection = () => {
  const [feedbacks, setFeedbacks] = useState<IFeedbackResponse[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const fetchFeedback = async () => {
    setLoadingFeedbacks(true);
    setFeedbackError(null);

    try {
      const response = await API.get("/submission/feedbacks");
      const normalizedFeedbacks = normalizeFeedbackResponse(response.data);
      setFeedbacks(normalizedFeedbacks);
    } catch (error) {
      setFeedbacks([]);
      setFeedbackError("Não foi possível carregar os feedbacks agora.");
      console.error("Erro ao buscar feedbacks:", error);
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  useEffect(() => {
    void fetchFeedback();
  }, []);

  const feedbackItems = useMemo(
    () => groupFeedbacksByTask(feedbacks),
    [feedbacks],
  );

  const selectedFeedback = useMemo(
    () =>
      feedbackItems.find((feedback) => feedback.taskId === selectedTaskId) ??
      null,
    [feedbackItems, selectedTaskId],
  );

  useEffect(() => {
    if (
      selectedTaskId !== null &&
      !feedbackItems.some((feedback) => feedback.taskId === selectedTaskId)
    ) {
      setSelectedTaskId(null);
    }
  }, [feedbackItems, selectedTaskId]);

  if (loadingFeedbacks) {
    return (
      <Box
        component="section"
        sx={{
          width: "100%",
          height: "100vh",
          maxHeight: 512,
          bgcolor: "#18181b",
          px: 4,
          py: 6,
        }}
      >
        <Box
          sx={{
            mx: "auto",
            display: "flex",
            height: "100%",
            width: "100%",
            maxWidth: "lg",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 4,
            border: "1px solid rgba(255,255,255,0.1)",
            bgcolor: "rgba(0,0,0,0.2)",
          }}
        >
          <Stack
            alignItems="center"
            spacing={2}
            textAlign="center"
            color="white"
          >
            <CircularProgress size={34} sx={{ color: "#ff6d00" }} />
            <Stack spacing={0.5}>
              <Typography variant="h6" className={montserrat.className}>
                Carregando feedbacks...
              </Typography>
              <Typography
                variant="body2"
                className={montserrat.className}
                sx={{ color: "rgba(255,255,255,0.7)" }}
              >
                Buscando os registros enviados pelo professor.
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      component="section"
      sx={{
        width: "100%",
        height: "100vh",
        maxHeight: 512,
        bgcolor: "#18181b", // zinc-900
        px: 4,
        py: 6,
        overflow: "hidden",
      }}
    >
      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={2}
        sx={{
          mx: "auto",
          height: "100%",
          width: "100%",
          maxWidth: "lg",
          overflow: "hidden",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            width: "100%",
            flex: { lg: "none" },
            maxWidth: { lg: 340 },
            borderRadius: 4,
            border: "1px solid rgba(255,255,255,0.1)",
            bgcolor: "rgba(0,0,0,0.4)",
            p: 2,
            overflow: "hidden",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
            sx={{ px: 1, mb: 1.5 }}
          >
            <Typography
              variant="subtitle1"
              className={montserrat.className}
              sx={{ color: "rgba(255,255,255,0.8)", fontWeight: 700 }}
            >
              Feedbacks
            </Typography>
            <Typography
              variant="caption"
              className={montserrat.className}
              sx={{ color: "rgba(255,255,255,0.45)" }}
            >
              {feedbackItems.length} registro
              {feedbackItems.length === 1 ? "" : "s"}
            </Typography>
          </Stack>

          <Box sx={{ minHeight: 0, flex: 1, overflowY: "auto", pr: 1 }}>
            {feedbackItems.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 3,
                  border: "1px dashed rgba(255,255,255,0.1)",
                  px: 2,
                  textAlign: "center",
                  color: "rgba(255,255,255,0.55)",
                  typography: "body2",
                }}
              >
                Nenhum feedback disponível no momento.
              </Box>
            ) : (
              <List
                sx={{ display: "flex", flexDirection: "column", gap: 1, p: 0 }}
              >
                {feedbackItems.map((feedback) => {
                  const isSelected = feedback.taskId === selectedTaskId;

                  return (
                    <ListItemButton
                      key={feedback.taskId}
                      onClick={() => setSelectedTaskId(feedback.taskId)}
                      disableRipple
                      sx={{
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: isSelected
                          ? "rgba(255, 109, 0, 0.7)"
                          : "rgba(255, 255, 255, 0.1)",
                        bgcolor: isSelected
                          ? "rgba(255, 255, 255, 0.1)"
                          : "transparent",
                        "&:hover": {
                          borderColor: "rgba(255, 255, 255, 0.2)",
                          bgcolor: "rgba(255, 255, 255, 0.05)",
                        },
                        transition: "all 0.2s",
                        alignItems: "center",
                        gap: 2,
                        py: 1.5,
                        px: 2,
                        cursor: "pointer",
                      }}
                    >
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          flexShrink: 0,
                          bgcolor: isSelected
                            ? "#ff6d00"
                            : "rgba(255, 255, 255, 0.6)",
                        }}
                      />
                      <ListItemText
                        primary={feedback.task?.title || "Atividade sem título"}
                        secondary={`Atualizado em ${formatFeedbackDate(
                          feedback.updatedAt,
                        )}`}
                        primaryTypographyProps={{
                          sx: {
                            color: "white",
                            fontWeight: 600,
                            display: "block",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          },
                        }}
                        secondaryTypographyProps={{
                          sx: {
                            color: "rgba(255, 255, 255, 0.55)",
                            fontSize: "0.75rem",
                          },
                        }}
                        sx={{ my: 0 }}
                      />
                    </ListItemButton>
                  );
                })}
              </List>
            )}
          </Box>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
            borderRadius: 4,
            border: "1px solid rgba(255,255,255,0.1)",
            p: 2,
            boxShadow: "0 12px 32px rgba(0,0,0,0.28)",
          }}
        >
          {feedbackError ? (
            <Box
              sx={{
                display: "flex",
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 3,
                border: "1px dashed #d4d4d8", // zinc-300
                bgcolor: "rgba(255,255,255,0.6)",
                px: 4,
                textAlign: "center",
              }}
            >
              <Typography
                variant="body1"
                className={montserrat.className}
                sx={{ color: "#4b5563" }}
              >
                {feedbackError}
              </Typography>
            </Box>
          ) : (
            <AnimatePresence mode="wait" initial={false}>
              {selectedFeedback ? (
                <Box
                  component={motion.div}
                  key={selectedFeedback.submissionId}
                  initial={{ x: 32, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -32, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    minHeight: 0,
                    gap: 1.5,
                    overflow: "hidden",
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="flex-start"
                    justifyContent="space-between"
                    spacing={1.5}
                    sx={{ pb: 1.5, borderBottom: "1px solid #d4d4d8" }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="h6"
                        className={montserrat.className}
                        sx={{ color: "#111827", fontWeight: 700 }}
                      >
                        {selectedFeedback.task?.title || "Atividade sem título"}
                      </Typography>
                      <Typography
                        variant="body2"
                        className={montserrat.className}
                        sx={{ color: "#6b7280" }}
                      >
                        Enviado em{" "}
                        {formatFeedbackDate(selectedFeedback.submittedAt)}
                      </Typography>
                    </Box>

                    <Chip
                      label={
                        selectedFeedback.isCorrect ? "Correta" : "Incorreta"
                      }
                      variant="outlined"
                      size="small"
                      sx={{
                        bgcolor: "white",
                        borderColor: "#d4d4d8",
                        color: "#3f3f46",
                        fontWeight: 500,
                      }}
                    />
                  </Stack>

                  <Box
                    sx={{
                      minHeight: 0,
                      flex: 1,
                      overflowY: "auto",
                      borderRadius: 3,
                      border: "1px solid #e4e4e7",
                      bgcolor: "white",
                    }}
                  >
                    <MDEditor.Markdown
                      source={
                        selectedFeedback.professorComments?.trim() ||
                        "_Nenhum feedback foi registrado para esta atividade ainda._"
                      }
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "transparent",
                      }}
                    />
                  </Box>
                </Box>
              ) : (
                <Box
                  component={motion.div}
                  key="empty-feedback"
                  initial={{ x: 16, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -16, opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  sx={{
                    display: "flex",
                    height: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 3,
                    border: "1px dashed #d4d4d8",
                    bgcolor: "rgba(255,255,255,0.6)",
                    px: 4,
                    textAlign: "center",
                  }}
                >
                  <Stack spacing={1} sx={{ maxWidth: 400 }}>
                    <Typography
                      variant="h6"
                      className={montserrat.className}
                      sx={{ color: "#111827", fontWeight: 700 }}
                    >
                      Selecione um feedback
                    </Typography>
                    <Typography
                      variant="body2"
                      className={montserrat.className}
                      sx={{ color: "#4b5563" }}
                    >
                      Clique em alguma atividade na lista à esquerda para ver o
                      comentário enviado pelo professor.
                    </Typography>
                  </Stack>
                </Box>
              )}
            </AnimatePresence>
          )}
        </Paper>
      </Stack>
    </Box>
  );
};

export default function Home() {
  const [Tasks, setTasks] = useState<ITask[]>([]);

  useEffect(() => {
    API.get("/task").then((response) => {
      setTasks(response.data.data);
    });
  }, []);

  return (
    <>
      <AppNavBar position="sticky" />
      <div className={`w-full min-h-[200vh] flex flex-col`}>
        <div className="w-full h-screen pb-24 pt-64 flex flex-col items-center justify-center gap-4">
          <Typography
            className={montserrat.className}
            variant="h2"
            sx={{ fontWeight: 500 }}
          >
            Bem-vindos
          </Typography>
          <Typography className={montserrat.className} variant="h5">
            O ambiente de desenvolvimento integrado para Portugol
          </Typography>

          <div className="flex flex-col items-center mt-auto">
            <Typography className={montserrat.className} variant="h6">
              Descubra Mais
            </Typography>
            <KeyboardArrowDownIcon fontSize="large" />
          </div>
        </div>

        <FeedbackSection />
        <div className="w-full h-screen py-12 px-8 flex flex-col items-center gap-8">
          <Typography className={montserrat.className} variant="h4">
            Tarefas Públicas
          </Typography>

          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell width={120}></TableCell>
                  <TableCell>Título</TableCell>
                  <TableCell align="right">Dificuldade</TableCell>
                  <TableCell align="right">Data de Criação</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Tasks.map((task) => (
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
        </div>
      </div>
    </>
  );
}
