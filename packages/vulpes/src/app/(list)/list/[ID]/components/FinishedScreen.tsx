import { ITask } from "@/@types/Task";
import TaskSummaryCard from "./TaskSummaryCard";
import { ITestCaseResult } from "@/utils/code-tester";
import { TaskSubmissionStatus } from "../page";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Tooltip,
  Typography,
} from "@mui/material";
import { COLORS } from "@/utils/colors";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SendIcon from "@mui/icons-material/Send";

interface IFinishedScreenProps {
  tasks: ITask[];
  codesByTaskId: Record<string, string>;
  resultsByTaskId: Record<string, ITestCaseResult[]>;
  submissionStatusByTaskId: Record<string, TaskSubmissionStatus>;
  isSubmittingList: boolean;
  canRegisterSubmission: boolean;
  hasSubmittedList: boolean;
  onReviewTask: (index: number) => void;
  onSubmitList: () => void;
}

export default function FinishedScreen({
  tasks,
  codesByTaskId,
  resultsByTaskId,
  submissionStatusByTaskId,
  isSubmittingList,
  hasSubmittedList,
  onReviewTask,
  onSubmitList,
  canRegisterSubmission,
}: IFinishedScreenProps) {
  const totalLines = tasks.reduce(
    (acc, t) => acc + (codesByTaskId[t.taskId]?.split("\n").length ?? 0),
    0,
  );

  const correctCount = tasks.reduce((acc, t) => {
    const results = resultsByTaskId[t.taskId];
    if (!results || results.length === 0) return acc;
    return acc + (results.every((r) => r.passed) ? 1 : 0);
  }, 0);

  const sentCount = tasks.reduce(
    (acc, t) =>
      acc + (submissionStatusByTaskId[t.taskId] === "success" ? 1 : 0),
    0,
  );
  const failedCount = tasks.reduce(
    (acc, t) => acc + (submissionStatusByTaskId[t.taskId] === "error" ? 1 : 0),
    0,
  );

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        overflowY: "auto",
        px: { xs: 2, md: 4 },
        py: 4,
      }}
    >
      <Box sx={{ maxWidth: 920, mx: "auto" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            mb: 1,
            flexWrap: "wrap",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              color: COLORS.dark.primary[500],
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 40 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: "#fff" }}>
              Lista finalizada!
            </Typography>
          </Box>

          <Tooltip
            title={
              !canRegisterSubmission
                ? "Limite de envios desta lista atingido"
                : tasks.length === 0
                  ? "Nenhuma tarefa para enviar"
                  : ""
            }
          >
            <span>
              <Button
                variant="contained"
                size="large"
                onClick={onSubmitList}
                disabled={
                  isSubmittingList ||
                  tasks.length === 0 ||
                  !canRegisterSubmission
                }
                startIcon={
                  isSubmittingList ? (
                    <CircularProgress size={18} sx={{ color: "#fff" }} />
                  ) : (
                    <SendIcon />
                  )
                }
                sx={{
                  bgcolor: COLORS.dark.primary[500],
                  "&:hover": { bgcolor: COLORS.dark.primary[600] },
                  fontWeight: 600,
                  textTransform: "none",
                  px: 3,
                }}
              >
                {isSubmittingList
                  ? "Enviando lista..."
                  : hasSubmittedList
                    ? "Reenviar lista"
                    : "Enviar lista"}
              </Button>
            </span>
          </Tooltip>
        </Box>

        <Typography variant="body1" sx={{ color: "#cfd8dc", mb: 3 }}>
          Você concluiu todas as tarefas desta lista. Revise suas soluções
          abaixo e clique em <b>Enviar lista</b> para submeter cada tarefa
          individualmente.
        </Typography>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)",
            },
            mb: 3,
          }}
        >
          <Card sx={{ bgcolor: "#1e272c", color: "#fff", borderRadius: 2 }}>
            <CardContent>
              <Typography variant="caption" sx={{ color: "#90a4ae" }}>
                Tarefas
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {tasks.length}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ bgcolor: "#1e272c", color: "#fff", borderRadius: 2 }}>
            <CardContent>
              <Typography variant="caption" sx={{ color: "#90a4ae" }}>
                Corretas
              </Typography>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "#a5d6a7" }}
              >
                {correctCount}
                <Typography
                  component="span"
                  variant="body2"
                  sx={{ color: "#90a4ae", ml: 0.5 }}
                >
                  / {tasks.length}
                </Typography>
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ bgcolor: "#1e272c", color: "#fff", borderRadius: 2 }}>
            <CardContent>
              <Typography variant="caption" sx={{ color: "#90a4ae" }}>
                Linhas de código
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {totalLines}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ bgcolor: "#1e272c", color: "#fff", borderRadius: 2 }}>
            <CardContent>
              <Typography variant="caption" sx={{ color: "#90a4ae" }}>
                Enviadas
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: failedCount > 0 ? "#ef9a9a" : "#a5d6a7",
                }}
              >
                {sentCount}
                <Typography
                  component="span"
                  variant="body2"
                  sx={{ color: "#90a4ae", ml: 0.5 }}
                >
                  / {tasks.length}
                </Typography>
              </Typography>
              {failedCount > 0 && (
                <Typography
                  variant="caption"
                  sx={{ color: "#ef9a9a", display: "block" }}
                >
                  {failedCount} falha{failedCount === 1 ? "" : "s"}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>

        <Typography
          variant="h6"
          sx={{ color: "#fff", fontWeight: 600, mb: 1.5 }}
        >
          Suas soluções
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {tasks.map((task, index) => {
            const results = resultsByTaskId[task.taskId] ?? [];
            const hasResults = results.length > 0;
            const isCorrect = hasResults && results.every((r) => r.passed);

            return (
              <TaskSummaryCard
                key={task.taskId}
                task={task}
                index={index}
                code={codesByTaskId[task.taskId] ?? ""}
                hasResults={hasResults}
                isCorrect={isCorrect}
                submissionStatus={
                  submissionStatusByTaskId[task.taskId] ?? "idle"
                }
                onReview={() => onReviewTask(index)}
              />
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
