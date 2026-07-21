import { ClassTaskDashboardStudentRow } from "@/@types/ClassTaskDashboard";
import { ISubmission } from "@/@types/Submission";
import API from "@/services/API";
import { Editor } from "@monaco-editor/react";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/CloseOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import {
  alpha,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import MDEditor from "@uiw/react-md-editor";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { registerPortugolLanguage } from "../../../../../../../libs/monaco-config";

function initialsFrom(name: string) {
  const parts = name.trim().split(/\s+/);
  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

interface IFeedbackDialogProps {
  open: boolean;
  student: ClassTaskDashboardStudentRow | null;
  attempts: ISubmission[];
  onClose: () => void;
  onSubmitted: () => void;
}

export default function FeedbackDialog({
  open,
  student,
  attempts,
  onClose,
  onSubmitted,
}: IFeedbackDialogProps) {
  const theme = useTheme();
  const [attemptIndex, setAttemptIndex] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (attempts.length > 0) {
      setAttemptIndex(attempts.length - 1);
    }
  }, [student, attempts]);

  const selectedAttempt = useMemo(() => attempts[attemptIndex] ?? null, [attempts, attemptIndex]);

  useEffect(() => {
    setFeedback(selectedAttempt?.professorComments ?? student?.professorComments ?? "");
  }, [selectedAttempt, student]);

  const handleEditorMount = (_editor: unknown, monacoInstance: any) => {
    registerPortugolLanguage(monacoInstance);
    monacoInstance.editor.setTheme("vs-dark");
  };

  const handleSend = async () => {
    if (!selectedAttempt) {
      toast.error("Não há envio disponível para este aluno.");
      return;
    }

    if (!feedback.trim()) {
      toast.error("Escreva um feedback antes de enviar.");
      return;
    }

    setSending(true);
    try {
      await API.put(`/submission/feedback/${selectedAttempt.submissionId}`, {
        professorComments: feedback,
      });
      toast.success("Feedback enviado com sucesso!");
      onSubmitted();
    } catch (error: any) {
      console.error("Failed to send feedback:", error);
      toast.error(error.response?.data?.message || "Erro ao enviar feedback.");
    } finally {
      setSending(false);
    }
  };

  if (!student) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
    >
      <DialogTitle sx={{ py: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.16),
                color: theme.palette.primary.main,
                fontWeight: 600,
              }}
            >
              {initialsFrom(student.name)}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" fontWeight={600} noWrap>
                {student.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {student.submissionsCount} envio{student.submissionsCount !== 1 ? "s" : ""} registrado
                {student.submissionsCount !== 1 ? "s" : ""}
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={onClose} size="small" sx={{ flexShrink: 0 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{ display: "flex", flexDirection: "column", gap: 2, bgcolor: "background.default" }}
      >
        {attempts.length > 1 && (
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", rowGap: 1 }}>
            {attempts.map((attempt, index) => {
              const selected = index === attemptIndex;
              return (
                <Chip
                  key={attempt.submissionId}
                  label={`Tentativa ${index + 1}`}
                  size="small"
                  icon={
                    attempt.isCorrect ? (
                      <CheckCircleOutlineIcon sx={{ fontSize: 14 }} />
                    ) : (
                      <WarningAmberOutlinedIcon sx={{ fontSize: 14 }} />
                    )
                  }
                  onClick={() => setAttemptIndex(index)}
                  sx={{
                    fontWeight: 500,
                    bgcolor: selected
                      ? alpha(theme.palette.primary.main, 0.16)
                      : alpha(theme.palette.text.primary, 0.06),
                    color: selected ? theme.palette.primary.main : "text.secondary",
                    border: "none",
                    "& .MuiChip-icon": {
                      color: selected
                        ? theme.palette.primary.main
                        : attempt.isCorrect
                          ? theme.palette.success.main
                          : theme.palette.error.main,
                    },
                  }}
                />
              );
            })}
          </Stack>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2,
            minHeight: 380,
          }}
        >
          <Box
            sx={{
              borderRadius: 2,
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ px: 1.5, py: 1, bgcolor: "background.paper" }}
            >
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                Código enviado
              </Typography>
              {selectedAttempt && (
                <Chip
                  size="small"
                  label={selectedAttempt.isCorrect ? "Correto" : "Incorreto"}
                  sx={{
                    height: 20,
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                    bgcolor: alpha(
                      selectedAttempt.isCorrect
                        ? theme.palette.success.main
                        : theme.palette.error.main,
                      0.14,
                    ),
                    color: selectedAttempt.isCorrect
                      ? theme.palette.success.main
                      : theme.palette.error.main,
                  }}
                />
              )}
            </Stack>
            <Box sx={{ flex: 1, minHeight: 320 }}>
              {selectedAttempt ? (
                <Editor
                  height="100%"
                  theme="vs-dark"
                  language="portugol"
                  onMount={handleEditorMount}
                  value={selectedAttempt.code}
                  options={{ readOnly: true, minimap: { enabled: false } }}
                />
              ) : (
                <Box
                  sx={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "#1e1e1e",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Não foi possível carregar o código enviado.
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          <Box
            sx={{
              borderRadius: 2,
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box sx={{ px: 1.5, py: 1, bgcolor: "background.paper" }}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                Feedback para o aluno
              </Typography>
            </Box>
            <Box sx={{ flex: 1, minHeight: 320, "& .w-md-editor": { height: "100% !important" } }}>
              <MDEditor
                height="100%"
                style={{ width: "100%" }}
                value={feedback}
                onChange={(value) => setFeedback(value ?? "")}
              />
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button color="inherit" onClick={onClose} disabled={sending}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSend} disabled={sending || !selectedAttempt}>
          {sending ? <CircularProgress size={20} color="inherit" /> : "Enviar feedback"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
