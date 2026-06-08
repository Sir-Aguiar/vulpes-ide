"use client";

import AppNavBar from "@/components/AppNavBar";
import AuthGuard from "@/components/AuthGuard";
import API from "@/services/API";
import { Editor } from "@monaco-editor/react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CodeIcon from "@mui/icons-material/Code";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RateReviewIcon from "@mui/icons-material/RateReview";
import RefreshIcon from "@mui/icons-material/Refresh";
import TuneIcon from "@mui/icons-material/Tune";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Stack,
  Typography,
} from "@mui/material";
import MDEditor from "@uiw/react-md-editor";
import { AnimatePresence, motion } from "framer-motion";
import { Montserrat } from "next/font/google";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { registerPortugolLanguage } from "../../../../libs/monaco-config";

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

type FeedbackStatusKey = "approved" | "redo";

interface IFeedbackStatus {
  key: FeedbackStatusKey;
  label: string;
  cta: string;
  color: string;
  surface: string;
  icon: React.ReactNode;
}

const SURFACE = {
  page: "#18181b",
  card: "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.16)",
  textPrimary: "rgba(255,255,255,0.92)",
  textSecondary: "rgba(255,255,255,0.55)",
  textMuted: "rgba(255,255,255,0.4)",
  brand: "#FF6D00",
} as const;

const STATUS_COLORS = {
  success: "#22c55e",
  warning: "#f59e0b",
  error: "#ef4444",
} as const;

function getFeedbackStatus(feedback: IFeedbackResponse): IFeedbackStatus {
  if (feedback.isCorrect) {
    return {
      key: "approved",
      label: "Aprovado",
      cta: "Refazer Tarefa",
      color: STATUS_COLORS.success,
      surface: "rgba(34,197,94,0.12)",
      icon: <CheckCircleIcon fontSize="small" />,
    };
  }

  return {
    key: "redo",
    label: "Corrigir",
    cta: "Corrigir Código",
    color: STATUS_COLORS.warning,
    surface: "rgba(245,158,11,0.12)",
    icon: <WarningAmberIcon fontSize="small" />,
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
  const orderedFeedbacks = [...feedbacks].sort(
    (left, right) =>
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );

  const uniqueByTask = new Map<string, IFeedbackResponse>();

  for (const feedback of orderedFeedbacks) {
    if (!uniqueByTask.has(feedback.taskId)) {
      uniqueByTask.set(feedback.taskId, feedback);
    }
  }

  return Array.from(uniqueByTask.values());
}

function FiltersDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <Box
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: SURFACE.border,
        bgcolor: SURFACE.card,
        overflow: "hidden",
      }}
    >
      <Box
        component="button"
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        sx={{
          all: "unset",
          boxSizing: "border-box",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          px: 2,
          py: 1.5,
          cursor: "pointer",
          color: SURFACE.textPrimary,
          transition: "background-color 0.2s ease",
          "&:hover": { bgcolor: "rgba(255,255,255,0.04)" },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <TuneIcon fontSize="small" sx={{ color: SURFACE.brand }} />
          <Typography
            variant="subtitle2"
            className={montserrat.className}
            sx={{ fontWeight: 700 }}
          >
            Filtros
          </Typography>
        </Stack>
        <ExpandMoreIcon
          fontSize="small"
          sx={{
            color: SURFACE.textSecondary,
            transition: "transform 0.2s ease",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </Box>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <Box
          sx={{
            px: 2,
            pb: 2,
            pt: 0.5,
            borderTop: "1px solid",
            borderColor: SURFACE.border,
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: SURFACE.textMuted, display: "block", py: 1 }}
          >
            Em breve: filtrar por status, disciplina e data.
          </Typography>
        </Box>
      </Collapse>
    </Box>
  );
}

interface IFeedbackSidebarProps {
  feedbacks: IFeedbackResponse[];
  selectedTaskId: string | null;
  onSelect: (taskId: string) => void;
}

function FeedbackSidebar({
  feedbacks,
  selectedTaskId,
  onSelect,
}: IFeedbackSidebarProps) {
  return (
    <Box
      sx={{
        gridColumn: { xs: "1 / -1", md: "span 3" },
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
      }}
    >
      <FiltersDropdown />

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          borderRadius: 3,
          border: "1px solid",
          borderColor: SURFACE.border,
          bgcolor: SURFACE.card,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: "1px solid",
            borderColor: SURFACE.border,
          }}
        >
          <Typography
            variant="subtitle2"
            className={montserrat.className}
            sx={{ color: SURFACE.textPrimary, fontWeight: 700 }}
          >
            Feedbacks
          </Typography>
          <Typography variant="caption" sx={{ color: SURFACE.textMuted }}>
            {feedbacks.length} registro{feedbacks.length === 1 ? "" : "s"}
          </Typography>
        </Stack>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            scrollBehavior: "smooth",
            p: 1.5,
            "&::-webkit-scrollbar": { width: 6 },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(255,255,255,0.15)",
              borderRadius: 8,
            },
          }}
        >
          {feedbacks.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                height: "100%",
                minHeight: 160,
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                px: 2,
                borderRadius: 2,
                border: "1px dashed",
                borderColor: SURFACE.border,
                color: SURFACE.textSecondary,
                typography: "body2",
              }}
            >
              Nenhum feedback disponível no momento.
            </Box>
          ) : (
            <Stack spacing={1}>
              {feedbacks.map((feedback, index) => {
                const status = getFeedbackStatus(feedback);
                const isSelected = feedback.taskId === selectedTaskId;

                return (
                  <Box
                    component={motion.button}
                    type="button"
                    key={feedback.taskId}
                    onClick={() => onSelect(feedback.taskId)}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.25,
                      delay: Math.min(index * 0.05, 0.4),
                    }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    sx={{
                      all: "unset",
                      boxSizing: "border-box",
                      width: "100%",
                      cursor: "pointer",
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: isSelected ? SURFACE.brand : SURFACE.border,
                      bgcolor: isSelected
                        ? "rgba(255,109,0,0.08)"
                        : "transparent",
                      p: 1.5,
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.75,
                      transition:
                        "border-color 0.2s ease, background-color 0.2s ease",
                      "&:hover": {
                        borderColor: isSelected
                          ? SURFACE.brand
                          : SURFACE.borderStrong,
                        bgcolor: isSelected
                          ? "rgba(255,109,0,0.1)"
                          : "rgba(255,255,255,0.04)",
                      },
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ minWidth: 0 }}
                    >
                      <Box sx={{ color: status.color, display: "flex" }}>
                        {status.icon}
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: SURFACE.textPrimary,
                          fontWeight: 600,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {feedback.task?.title || "Atividade sem título"}
                      </Typography>
                    </Stack>
                    <Typography
                      variant="caption"
                      sx={{ color: SURFACE.textMuted, pl: 3.5 }}
                    >
                      {formatFeedbackDate(feedback.updatedAt)}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Box>
      </Box>
    </Box>
  );
}

interface IInfoCardProps {
  feedback: IFeedbackResponse;
  onRetry: () => void;
}

function InfoCard({ feedback, onRetry }: IInfoCardProps) {
  const status = getFeedbackStatus(feedback);

  return (
    <Box
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: SURFACE.border,
        bgcolor: SURFACE.card,
        p: { xs: 2, md: 3 },
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: { md: "center" },
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
          <Typography
            variant="h6"
            className={montserrat.className}
            sx={{ color: SURFACE.textPrimary, fontWeight: 700 }}
          >
            {feedback.task?.title || "Atividade sem título"}
          </Typography>
          <Chip
            icon={
              <Box
                sx={{ display: "flex", color: `${status.color} !important` }}
              >
                {status.icon}
              </Box>
            }
            label={status.label}
            size="small"
            sx={{
              bgcolor: status.surface,
              color: status.color,
              fontWeight: 700,
              border: "1px solid",
              borderColor: status.color,
              "& .MuiChip-icon": { color: status.color },
            }}
          />
        </Stack>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 0.5, sm: 3 }}
          sx={{ color: SURFACE.textSecondary }}
        >
          <Typography variant="body2">
            Enviado em {formatFeedbackDate(feedback.submittedAt)}
          </Typography>
          <Typography variant="body2">
            Feedback atualizado em {formatFeedbackDate(feedback.updatedAt)}
          </Typography>
        </Stack>
      </Box>

      <Button
        onClick={onRetry}
        variant="contained"
        startIcon={status.key === "approved" ? <RefreshIcon /> : <CodeIcon />}
        sx={{
          flexShrink: 0,
          bgcolor: SURFACE.brand,
          color: "#fff",
          fontWeight: 700,
          textTransform: "none",
          px: 3,
          py: 1.25,
          borderRadius: 2,
          "&:hover": { bgcolor: "#e36c1c" },
        }}
      >
        {status.cta}
      </Button>
    </Box>
  );
}

function PanelHeader({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{
        px: 2,
        py: 1.25,
        borderBottom: "1px solid",
        borderColor: SURFACE.border,
      }}
    >
      <Box sx={{ color: SURFACE.brand, display: "flex" }}>{icon}</Box>
      <Typography
        variant="body2"
        className={montserrat.className}
        sx={{ color: SURFACE.textPrimary, fontWeight: 600 }}
      >
        {title}
      </Typography>
    </Stack>
  );
}

function FeedbackDetail({
  feedback,
  onRetry,
}: {
  feedback: IFeedbackResponse;
  onRetry: () => void;
}) {
  const handleEditorDidMount = (_editor: unknown, monacoInstance: any) => {
    registerPortugolLanguage(monacoInstance);
    monacoInstance.editor.setTheme("vs-dark");
  };

  return (
    <Box
      component={motion.div}
      key={feedback.submissionId}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      sx={{
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <InfoCard feedback={feedback} onRetry={onRetry} />

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", xl: "1fr 1fr" },
        }}
      >
        <Box
          sx={{
            minHeight: 240,
            display: "flex",
            flexDirection: "column",
            borderRadius: 3,
            border: "1px solid",
            borderColor: SURFACE.border,
            bgcolor: SURFACE.card,
            overflow: "hidden",
          }}
        >
          <PanelHeader
            icon={<RateReviewIcon fontSize="small" />}
            title="Feedback do professor"
          />
          <Box
            data-color-mode="dark"
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              p: 4,
              "& .wmde-markdown": {
                backgroundColor: "transparent",
                fontSize: "0.95rem",
                lineHeight: 1.6,
              },
              "& .wmde-markdown p, & .wmde-markdown li": { lineHeight: 1.6 },
            }}
          >
            <MDEditor.Markdown
              source={
                feedback.professorComments?.trim() ||
                "_Nenhum feedback foi registrado para esta atividade ainda._"
              }
              style={{ backgroundColor: "transparent" }}
            />
          </Box>
        </Box>

        <Box
          sx={{
            minHeight: 240,
            display: "flex",
            flexDirection: "column",
            borderRadius: 3,
            border: "1px solid",
            borderColor: SURFACE.border,
            bgcolor: SURFACE.card,
            overflow: "hidden",
          }}
        >
          <PanelHeader
            icon={<CodeIcon fontSize="small" />}
            title="Código enviado"
          />
          <Box sx={{ flex: 1, minHeight: 0, bgcolor: "#1e1e1e" }}>
            <Editor
              height="100%"
              theme="vs-dark"
              language="portugol"
              value={feedback.code}
              onMount={handleEditorDidMount}
              options={{
                readOnly: true,
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                wordWrap: "on",
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function EmptyDetail() {
  return (
    <Box
      component={motion.div}
      key="empty"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      sx={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        borderRadius: 3,
        border: "1px dashed",
        borderColor: SURFACE.border,
        bgcolor: SURFACE.card,
        px: 4,
      }}
    >
      <Stack spacing={1} sx={{ maxWidth: 420 }}>
        <Typography
          variant="h6"
          className={montserrat.className}
          sx={{ color: SURFACE.textPrimary, fontWeight: 700 }}
        >
          Selecione um feedback
        </Typography>
        <Typography variant="body2" sx={{ color: SURFACE.textSecondary }}>
          Escolha uma atividade na lista à esquerda para ver o comentário do
          professor e o código enviado.
        </Typography>
      </Stack>
    </Box>
  );
}

function FeedbacksContent() {
  const router = useRouter();

  const [feedbacks, setFeedbacks] = useState<IFeedbackResponse[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await API.get("/submission/feedbacks");
        setFeedbacks(normalizeFeedbackResponse(response.data));
      } catch (err) {
        console.error("Erro ao buscar feedbacks:", err);
        setFeedbacks([]);
        setError("Não foi possível carregar os feedbacks agora.");
      } finally {
        setLoading(false);
      }
    };

    void fetchFeedbacks();
  }, []);

  const feedbackItems = useMemo(
    () => groupFeedbacksByTask(feedbacks),
    [feedbacks],
  );

  const selectedFeedback = useMemo(
    () => feedbackItems.find((item) => item.taskId === selectedTaskId) ?? null,
    [feedbackItems, selectedTaskId],
  );

  useEffect(() => {
    if (!selectedTaskId && feedbackItems.length > 0) {
      setSelectedTaskId(feedbackItems[0].taskId);
    }
  }, [feedbackItems, selectedTaskId]);

  const handleRetry = (feedback: IFeedbackResponse) => {
    const query = feedback.listId ? `?listId=${feedback.listId}` : "";
    router.push(`/task/${feedback.taskId}${query}`);
  };

  return (
    <Box
      component="section"
      sx={{
        width: "100%",
        height: "calc(100vh - var(--appbar-height))",
        bgcolor: SURFACE.page,
        px: { xs: 2, md: 4 },
        py: { xs: 2, md: 3 },
      }}
    >
      <Box
        sx={{
          height: "100%",
          mx: "auto",
          maxWidth: 1400,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(12, 1fr)" },
          gap: 2,
          minHeight: 0,
        }}
      >
        {loading ? (
          <Box
            sx={{
              gridColumn: "1 / -1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress sx={{ color: SURFACE.brand }} />
          </Box>
        ) : (
          <>
            <FeedbackSidebar
              feedbacks={feedbackItems}
              selectedTaskId={selectedTaskId}
              onSelect={setSelectedTaskId}
            />

            <Box
              sx={{
                gridColumn: { xs: "1 / -1", md: "span 9" },
                minHeight: 0,
                minWidth: 0,
              }}
            >
              {error ? (
                <Box
                  sx={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    borderRadius: 3,
                    border: "1px dashed",
                    borderColor: SURFACE.border,
                    bgcolor: SURFACE.card,
                    px: 4,
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{ color: SURFACE.textSecondary }}
                  >
                    {error}
                  </Typography>
                </Box>
              ) : (
                <AnimatePresence mode="wait" initial={false}>
                  {selectedFeedback ? (
                    <FeedbackDetail
                      feedback={selectedFeedback}
                      onRetry={() => handleRetry(selectedFeedback)}
                    />
                  ) : (
                    <EmptyDetail />
                  )}
                </AnimatePresence>
              )}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}

export default function Page() {
  return (
    <AuthGuard requiredRoles={["STUDENT", "PROFESSOR", "ADMIN"]}>
      <AppNavBar />
      <FeedbacksContent />
    </AuthGuard>
  );
}
