import {
  ClassTaskListDashboardColumn,
  ClassTaskListDashboardStudentRow,
} from "@/@types/ClassTaskListDashboard";
import { ISubmission } from "@/@types/Submission";
import API from "@/services/API";
import { Editor } from "@monaco-editor/react";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CloseIcon from "@mui/icons-material/CloseOutlined";
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
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { registerPortugolLanguage } from "../../../../../../../../libs/monaco-config";
import { useAppTheme } from "@/providers/ColorModeProvider";

function initialsFrom(name: string) {
  const parts = name.trim().split(/\s+/);
  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

function unwrapSubmissions(data: unknown): ISubmission[] {
  if (Array.isArray(data)) return data;
  if (
    data &&
    typeof data === "object" &&
    Array.isArray((data as { data?: unknown }).data)
  ) {
    return (data as { data: ISubmission[] }).data;
  }
  return [];
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 0,
  }),
};

function latestStudentSubmission(
  submissions: ISubmission[],
  studentId: string,
) {
  const studentSubmissions = submissions
    .filter((submission) => submission.studentId === studentId)
    .sort(
      (a, b) =>
        new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime(),
    );

  return studentSubmissions[studentSubmissions.length - 1] ?? null;
}

interface ILoadedTask {
  classTaskListId: string;
  title: string;
  index: number;
  submission: ISubmission;
}

interface IListFeedbackDialogProps {
  open: boolean;
  student: ClassTaskListDashboardStudentRow | null;
  columns: ClassTaskListDashboardColumn[];
  onClose: () => void;
  onSubmitted: () => void;
}

export default function ListFeedbackDialog({
  open,
  student,
  columns,
  onClose,
  onSubmitted,
}: IListFeedbackDialogProps) {
  const theme = useTheme();
  const appTheme = useAppTheme();
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [taskIndex, setTaskIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [tasks, setTasks] = useState<ILoadedTask[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open || !student) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setTasks([]);
      setDrafts({});
      setTaskIndex(0);

      const submittedIds = student.cells
        .filter((cell) => cell.status !== "NOT_SUBMITTED")
        .map((cell) => cell.classTaskListId);

      const classTaskListIds =
        submittedIds.length > 0
          ? submittedIds
          : columns.map((column) => column.classTaskListId);

      if (classTaskListIds.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const results = await Promise.allSettled(
          classTaskListIds.map(async (classTaskListId) => {
            const response = await API.get(
              `/submission/class-task-list/${classTaskListId}`,
            );
            const submission = latestStudentSubmission(
              unwrapSubmissions(response.data),
              student.studentId,
            );
            if (!submission) return null;

            const column = columns.find(
              (item) => item.classTaskListId === classTaskListId,
            );

            return {
              classTaskListId,
              title: column?.title ?? "Tarefa",
              index: column?.index ?? Number.MAX_SAFE_INTEGER,
              submission,
            } satisfies ILoadedTask;
          }),
        );

        if (cancelled) return;

        const loaded = results
          .flatMap((result) =>
            result.status === "fulfilled" && result.value ? [result.value] : [],
          )
          .sort((a, b) => a.index - b.index);

        const initialDrafts: Record<string, string> = {};
        loaded.forEach((task) => {
          initialDrafts[task.classTaskListId] =
            task.submission.professorComments ?? "";
        });

        if (results.some((result) => result.status === "rejected")) {
          toast.error("Algumas submissões não puderam ser carregadas.");
        }

        setTasks(loaded);
        setDrafts(initialDrafts);
      } catch (error) {
        console.error("Failed to load list submissions:", error);
        toast.error("Erro ao carregar submissões do aluno.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [open, student, columns]);

  const currentTask = tasks[taskIndex] ?? null;
  const currentDraft = currentTask
    ? (drafts[currentTask.classTaskListId] ?? "")
    : "";

  const filledCount = useMemo(
    () =>
      tasks.filter((task) => drafts[task.classTaskListId]?.trim()).length,
    [tasks, drafts],
  );

  const handleEditorMount = (_editor: unknown, monacoInstance: any) => {
    registerPortugolLanguage(monacoInstance);
    monacoInstance.editor.setTheme("vs-dark");
  };

  const handleDraftChange = (value: string) => {
    if (!currentTask) return;
    setDrafts((prev) => ({
      ...prev,
      [currentTask.classTaskListId]: value,
    }));
  };

  const goToTask = (nextIndex: number) => {
    if (nextIndex === taskIndex || nextIndex < 0 || nextIndex >= tasks.length) {
      return;
    }
    setDirection(nextIndex > taskIndex ? 1 : -1);
    setTaskIndex(nextIndex);
  };

  const handleSend = async () => {
    const payloads = tasks
      .map((task) => ({
        submissionId: task.submission.submissionId,
        professorComments: drafts[task.classTaskListId] ?? "",
      }))
      .filter((payload) => payload.professorComments.trim());

    if (payloads.length === 0) {
      toast.error("Escreva um feedback antes de enviar.");
      return;
    }

    setSending(true);
    try {
      await Promise.all(
        payloads.map((payload) =>
          API.put(`/submission/feedback/${payload.submissionId}`, {
            professorComments: payload.professorComments,
          }),
        ),
      );
      toast.success(
        payloads.length === 1
          ? "Feedback enviado com sucesso!"
          : `Feedbacks enviados para ${payloads.length} tarefas.`,
      );
      onSubmitted();
    } catch (error: any) {
      console.error("Failed to send list feedback:", error);
      toast.error(error.response?.data?.message || "Erro ao enviar feedbacks.");
    } finally {
      setSending(false);
    }
  };

  if (!student) return null;

  return (
    <Dialog
      open={open}
      onClose={sending ? undefined : onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
    >
      <DialogTitle sx={{ py: 2 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
        >
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{ minWidth: 0 }}
          >
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
                {student.submissionsCount} envio
                {student.submissionsCount !== 1 ? "s" : ""} registrado
                {student.submissionsCount !== 1 ? "s" : ""} na lista
              </Typography>
              <br/>
              <Typography variant="caption" color="text.secondary" noWrap>
                Se a sua lista permitir múltiplos envios, esteja ciente que apenas a última submissão é considerada.
              </Typography>
            </Box>
          </Stack>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ flexShrink: 0 }}
            disabled={sending}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          bgcolor: "background.default",
          overflowX: "hidden",
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
              py: 10,
            }}
          >
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              Carregando submissões do aluno...
            </Typography>
          </Box>
        ) : !currentTask ? (
          <Box sx={{ py: 10, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Não há envios disponíveis para este aluno.
            </Typography>
          </Box>
        ) : (
          <>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={2}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle1" fontWeight={600} noWrap>
                  Tarefa {taskIndex + 1} de {tasks.length}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {currentTask.title}
                </Typography>
              </Box>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <IconButton
                  size="small"
                  disabled={taskIndex === 0 || sending}
                  onClick={() => goToTask(taskIndex - 1)}
                >
                  <ArrowBackIosIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  disabled={taskIndex === tasks.length - 1 || sending}
                  onClick={() => goToTask(taskIndex + 1)}
                >
                  <ArrowForwardIosIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Stack>

            {tasks.length > 1 && (
              <Stack
                direction="row"
                spacing={1}
                sx={{ flexWrap: "wrap", rowGap: 1 }}
              >
                {tasks.map((task, index) => {
                  const selected = index === taskIndex;
                  const hasDraft = Boolean(drafts[task.classTaskListId]?.trim());
                  return (
                    <Chip
                      key={task.classTaskListId}
                      label={`T${task.index}`}
                      size="small"
                      onClick={() => goToTask(index)}
                      sx={{
                        fontWeight: 500,
                        bgcolor: selected
                          ? alpha(theme.palette.primary.main, 0.16)
                          : alpha(theme.palette.text.primary, 0.06),
                        color: selected
                          ? theme.palette.primary.main
                          : "text.secondary",
                        border: hasDraft
                          ? `1px solid ${alpha(theme.palette.primary.main, 0.4)}`
                          : "none",
                      }}
                    />
                  );
                })}
              </Stack>
            )}

            <Box sx={{ position: "relative", overflow: "hidden", minHeight: 380 }}>
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.div
                  key={currentTask.classTaskListId}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
                  style={{ width: "100%" }}
                >
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
                        <Chip
                          size="small"
                          label={
                            currentTask.submission.isCorrect
                              ? "Correto"
                              : "Incorreto"
                          }
                          sx={{
                            height: 20,
                            fontSize: "0.6875rem",
                            fontWeight: 600,
                            bgcolor: alpha(
                              currentTask.submission.isCorrect
                                ? theme.palette.success.main
                                : theme.palette.error.main,
                              0.14,
                            ),
                            color: currentTask.submission.isCorrect
                              ? theme.palette.success.main
                              : theme.palette.error.main,
                          }}
                        />
                      </Stack>
                      <Box sx={{ flex: 1, minHeight: 320, bgcolor: appTheme.codeBg }}>
                        <Editor
                          key={currentTask.submission.submissionId}
                          height="100%"
                          theme="vs-dark"
                          language="portugol"
                          onMount={handleEditorMount}
                          value={currentTask.submission.code}
                          options={{
                            readOnly: true,
                            minimap: { enabled: false },
                          }}
                        />
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
                      <Box
                        sx={{ px: 1.5, py: 1, bgcolor: "background.paper" }}
                      >
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          Feedback para o aluno
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          flex: 1,
                          minHeight: 320,
                          "& .w-md-editor": { height: "100% !important" },
                        }}
                        data-color-mode={appTheme.mode}
                      >
                        <MDEditor
                          key={currentTask.classTaskListId}
                          height="100%"
                          style={{ width: "100%" }}
                          value={currentDraft}
                          onChange={(value) => handleDraftChange(value ?? "")}
                        />
                      </Box>
                    </Box>
                  </Box>
                </motion.div>
              </AnimatePresence>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {loading || tasks.length === 0
            ? ""
            : `${filledCount} de ${tasks.length} tarefa${tasks.length !== 1 ? "s" : ""} com feedback`}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button color="inherit" onClick={onClose} disabled={sending}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSend}
            disabled={sending || loading || tasks.length === 0}
          >
            {sending ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Enviar feedbacks"
            )}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
