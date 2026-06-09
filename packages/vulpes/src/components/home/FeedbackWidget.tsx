"use client";

import API from "@/services/API";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RateReviewIcon from "@mui/icons-material/RateReview";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import MDEditor from "@uiw/react-md-editor";
import { AnimatePresence, motion } from "framer-motion";
import { Montserrat } from "next/font/google";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAppTheme } from "@/providers/ColorModeProvider";

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
  task?: { taskId: string; title: string };
}

function formatFeedbackDate(dateValue: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateValue));
}

function normalizeFeedbackResponse(payload: unknown): IFeedbackResponse[] {
  if (Array.isArray(payload)) return payload as IFeedbackResponse[];
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
  const ordered = [...feedbacks].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
  const map = new Map<string, IFeedbackResponse>();
  for (const fb of ordered) {
    if (!map.has(fb.taskId)) map.set(fb.taskId, fb);
  }
  return Array.from(map.values());
}

export default function FeedbackWidget() {
  const router = useRouter();
  const theme = useAppTheme();
  const [feedbacks, setFeedbacks] = useState<IFeedbackResponse[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await API.get("/submission/feedbacks", {
          params: { isWidget: true },
        });
        setFeedbacks(normalizeFeedbackResponse(response.data));
      } catch (err) {
        setFeedbacks([]);
        setError("Não foi possível carregar os feedbacks agora.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    void fetchFeedback();
  }, []);

  const feedbackItems = useMemo(
    () => groupFeedbacksByTask(feedbacks),
    [feedbacks],
  );

  const selectedFeedback = useMemo(
    () => feedbackItems.find((f) => f.taskId === selectedTaskId) ?? null,
    [feedbackItems, selectedTaskId],
  );


  // TODO: Verificar problemas de desempenho
  // Este efeito pode acabar em looping infinito
  useEffect(() => {
    if (!selectedTaskId && feedbackItems.length > 0) {
      setSelectedTaskId(feedbackItems[0].taskId);
    }
  }, [feedbackItems, selectedTaskId]);

  return (
    <Box
      component="section"
      sx={{
        width: "100%",
        bgcolor: theme.bgCard,
        px: { xs: 3, md: 6 },
        py: { xs: 8, md: 10 },
        borderTop: "1px solid",
        borderColor: theme.border,
      }}
    >
      <Box sx={{ maxWidth: theme.maxWidth, mx: "auto" }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ sm: "flex-end" }}
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 4 }}
        >
          <Stack spacing={1}>
            <Typography
              variant="overline"
              sx={{ color: theme.brand, fontWeight: 700, letterSpacing: 2 }}
            >
              Seus feedbacks
            </Typography>
            <Typography
              variant="h4"
              className={montserrat.className}
              sx={{ color: theme.text, fontWeight: 800 }}
            >
              Acompanhe as orientações do professor
            </Typography>
            <Typography variant="body1" sx={{ color: theme.textSecondary, maxWidth: 520, lineHeight: 1.6 }}>
              Veja os comentários mais recentes sobre suas submissões e saiba
              o que corrigir em cada atividade.
            </Typography>
          </Stack>
          {!loading && feedbackItems.length > 0 && (
            <Chip
              icon={<RateReviewIcon sx={{ color: `${theme.brand} !important` }} />}
              label={`${feedbackItems.length} atividade${feedbackItems.length === 1 ? "" : "s"}`}
              sx={{
                bgcolor: "rgba(255,109,0,0.1)",
                color: theme.brand,
                fontWeight: 600,
                border: "1px solid rgba(255,109,0,0.2)",
              }}
            />
          )}
        </Stack>

        {loading ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 320,
              borderRadius: 3,
              border: "1px solid",
              borderColor: theme.border,
              bgcolor: theme.bgElevated,
            }}
          >
            <Stack alignItems="center" spacing={2}>
              <CircularProgress size={32} sx={{ color: theme.brand }} />
              <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                Carregando feedbacks...
              </Typography>
            </Stack>
          </Box>
        ) : (
          <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={2}
            sx={{ minHeight: 380 }}
          >
            <Paper
              elevation={0}
              sx={{
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
                width: "100%",
                flex: { lg: "0 0 300px" },
                borderRadius: 3,
                border: "1px solid",
                borderColor: theme.border,
                bgcolor: theme.bgElevated,
                p: 2,
                overflow: "hidden",
              }}
            >
              <Typography
                variant="subtitle2"
                className={montserrat.className}
                sx={{ color: theme.text, fontWeight: 700, px: 1, mb: 1.5 }}
              >
                Atividades
              </Typography>

              <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", pr: 0.5 }}>
                {feedbackItems.length === 0 ? (
                  <Box
                    sx={{
                      display: "flex",
                      height: "100%",
                      minHeight: 160,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 2,
                      border: "1px dashed",
                      borderColor: theme.border,
                      px: 2,
                      textAlign: "center",
                      color: theme.textSecondary,
                      typography: "body2",
                    }}
                  >
                    Nenhum feedback disponível no momento.
                  </Box>
                ) : (
                  <List sx={{ display: "flex", flexDirection: "column", gap: 1, p: 0 }}>
                    {feedbackItems.map((feedback) => {
                      const isSelected = feedback.taskId === selectedTaskId;
                      const StatusIcon = feedback.isCorrect
                        ? CheckCircleIcon
                        : WarningAmberIcon;
                      const statusColor = feedback.isCorrect
                        ? theme.success
                        : "#f59e0b";

                      return (
                        <ListItemButton
                          key={feedback.taskId}
                          onClick={() => setSelectedTaskId(feedback.taskId)}
                          sx={{
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: isSelected
                              ? theme.brand
                              : theme.border,
                            bgcolor: isSelected
                              ? "rgba(255,109,0,0.08)"
                              : "transparent",
                            py: 1.25,
                            px: 1.5,
                            gap: 1.5,
                            transition: "all 0.2s",
                            "&:hover": {
                              borderColor: isSelected ? theme.brand : theme.borderStrong,
                            bgcolor: isSelected
                              ? "rgba(255,109,0,0.1)"
                              : theme.hover,
                            },
                          }}
                        >
                          <StatusIcon sx={{ fontSize: 18, color: statusColor, flexShrink: 0 }} />
                          <ListItemText
                            primary={feedback.task?.title || "Atividade sem título"}
                            secondary={formatFeedbackDate(feedback.updatedAt)}
                            primaryTypographyProps={{
                              sx: {
                                color: theme.text,
                                fontWeight: 600,
                                fontSize: "0.875rem",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              },
                            }}
                            secondaryTypographyProps={{
                              sx: { color: theme.textMuted, fontSize: "0.75rem" },
                            }}
                          />
                        </ListItemButton>
                      );
                    })}
                  </List>
                )}
              </Box>

              <Button
                fullWidth
                variant="outlined"
                onClick={() => router.push("/feedbacks")}
                sx={{
                  mt: 1.5,
                  textTransform: "none",
                  fontWeight: 600,
                  color: theme.brand,
                  borderColor: "rgba(255,109,0,0.4)",
                  borderRadius: 2,
                  "&:hover": {
                    borderColor: theme.brand,
                    bgcolor: "rgba(255,109,0,0.08)",
                  },
                }}
              >
                Ver todos os feedbacks
              </Button>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                flex: 1,
                minHeight: 320,
                borderRadius: 3,
                border: "1px solid",
                borderColor: theme.border,
                bgcolor: theme.contentPanel,
                transition: "background-color 0.2s ease",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {error ? (
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    px: 4,
                    textAlign: "center",
                  }}
                >
                  <Typography sx={{ color: theme.contentPanelTextSecondary }}>{error}</Typography>
                </Box>
              ) : (
                <AnimatePresence mode="wait" initial={false}>
                  {selectedFeedback ? (
                    <Box
                      component={motion.div}
                      key={selectedFeedback.submissionId}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.22 }}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        p: 2.5,
                        gap: 2,
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="flex-start"
                        justifyContent="space-between"
                        spacing={2}
                        sx={{ pb: 2, borderBottom: `1px solid ${theme.contentPanelBorder}` }}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            variant="h6"
                            className={montserrat.className}
                            sx={{ color: theme.contentPanelText, fontWeight: 700 }}
                          >
                            {selectedFeedback.task?.title || "Atividade sem título"}
                          </Typography>
                          <Typography variant="body2" sx={{ color: theme.contentPanelTextSecondary, mt: 0.5 }}>
                            Enviado em {formatFeedbackDate(selectedFeedback.submittedAt)}
                          </Typography>
                        </Box>
                        <Chip
                          icon={
                            selectedFeedback.isCorrect ? (
                              <CheckCircleIcon sx={{ color: `${theme.success} !important` }} />
                            ) : (
                              <WarningAmberIcon sx={{ color: "#f59e0b !important" }} />
                            )
                          }
                          label={selectedFeedback.isCorrect ? "Correta" : "A corrigir"}
                          size="small"
                          sx={{
                            bgcolor: selectedFeedback.isCorrect
                              ? "rgba(34,197,94,0.1)"
                              : "rgba(245,158,11,0.1)",
                            color: selectedFeedback.isCorrect ? theme.success : "#f59e0b",
                            fontWeight: 600,
                            border: "1px solid",
                            borderColor: selectedFeedback.isCorrect
                              ? theme.success
                              : "#f59e0b",
                          }}
                        />
                      </Stack>

                      <Box
                        data-color-mode={theme.mode}
                        sx={{
                          flex: 1,
                          overflowY: "auto",
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: theme.contentPanelBorder,
                          bgcolor: theme.mode === "dark" ? theme.bgElevated : theme.contentPanel,
                          p: 3,
                          "& .wmde-markdown": {
                            lineHeight: 1.6,
                            fontSize: "0.9375rem",
                            color: theme.contentPanelText,
                          },
                        }}
                      >
                        <MDEditor.Markdown
                          source={
                            selectedFeedback.professorComments?.trim() ||
                            "_Nenhum feedback foi registrado para esta atividade ainda._"
                          }
                          style={{ backgroundColor: "transparent" }}
                        />
                      </Box>
                    </Box>
                  ) : (
                    <Box
                      component={motion.div}
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      sx={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        px: 4,
                        textAlign: "center",
                      }}
                    >
                      <Stack spacing={1} sx={{ maxWidth: 360 }}>
                        <RateReviewIcon sx={{ fontSize: 40, color: theme.textMuted, mx: "auto" }} />
                        <Typography
                          variant="subtitle1"
                          className={montserrat.className}
                          sx={{ color: theme.contentPanelText, fontWeight: 700 }}
                        >
                          Selecione uma atividade
                        </Typography>
                        <Typography variant="body2" sx={{ color: theme.contentPanelTextSecondary }}>
                          Clique em uma atividade na lista para ver o comentário
                          do professor.
                        </Typography>
                      </Stack>
                    </Box>
                  )}
                </AnimatePresence>
              )}
            </Paper>
          </Stack>
        )}
      </Box>
    </Box>
  );
}
