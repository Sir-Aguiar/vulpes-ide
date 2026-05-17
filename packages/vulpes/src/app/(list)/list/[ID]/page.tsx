"use client";

import { IList } from "@/@types/List";
import { ITask } from "@/@types/Task";
import AppNavBar from "@/components/AppNavBar";
import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar/Sidebar";
import API from "@/services/API";
import { appendFunctionToCode } from "@/utils/code-formatter";
import {
  executeWithTestInputs,
  ICompileError,
  ITestCaseResult,
  normalizeTestCaseInput,
} from "@/utils/code-tester";
import { baseCode } from "@/utils/mocks";
import { Editor } from "@monaco-editor/react";
import MDEditor from "@uiw/react-md-editor";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { registerPortugolLanguage } from "../../../../../libs/monaco-config";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Collapse,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CodeIcon from "@mui/icons-material/Code";
import TerminalIcon from "@mui/icons-material/Terminal";
import DescriptionIcon from "@mui/icons-material/Description";
import ErrorIcon from "@mui/icons-material/Error";
import SendIcon from "@mui/icons-material/Send";
import { AnimatePresence, motion } from "framer-motion";
import { COLORS } from "@/utils/colors";
import CodeSection from "./components/CodeSection";
import DetailsSection from "./components/DetailsSection";
import TaskView from "./components/TaskView";
import TaskSummaryCard from "./components/TaskSummaryCard";
import FinishedScreen from "./components/FinishedScreen";

export type TaskSubmissionStatus = "idle" | "sending" | "success" | "error";

export default function Page() {
  return (
    <AuthGuard>
      <AppNavBar />
      <ListRunner />
    </AuthGuard>
  );
}

function LayoutBox({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        gap: 2,
        padding: 2,
        bgcolor: "#263238",
        "@media (min-width: 1281px)": {
          flexDirection: "row",
          height: "calc(100vh - 64px)",
        },
        "@media (max-width: 1280px)": {
          flexDirection: "column",
          minHeight: "calc(100vh - 64px)",
        },
      }}
    >
      {children}
    </Box>
  );
}

function ListRunner() {
  const { ID: listId } = useParams();

  const [list, setList] = useState<IList | null>(null);
  const [tasksInList, setTasksInList] = useState<ITask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [finished, setFinished] = useState(false);

  const [codesByTaskId, setCodesByTaskId] = useState<Record<string, string>>(
    {},
  );
  const [resultsByTaskId, setResultsByTaskId] = useState<
    Record<string, ITestCaseResult[]>
  >({});
  const [submissionStatusByTaskId, setSubmissionStatusByTaskId] = useState<
    Record<string, TaskSubmissionStatus>
  >({});
  const [isSubmittingList, setIsSubmittingList] = useState(false);
  const [hasSubmittedList, setHasSubmittedList] = useState(false);

  const [isRunning, setIsRunning] = useState(false);
  const [lastResults, setLastResults] = useState<ITestCaseResult[]>([]);
  const [compileErrors, setCompileErrors] = useState<ICompileError[]>([]);
  const [submissionStatus, setSubmissionStatus] = useState<
    "success" | "error" | null
  >(null);
  const [canRegisterSubmission, setCanRegisterSubmission] = useState(false);

  const currentTask = tasksInList[currentIndex] ?? null;

  const currentCode = useMemo(() => {
    if (!currentTask) return baseCode;
    const stored = codesByTaskId[currentTask.taskId];
    if (stored !== undefined) return stored;
    return appendFunctionToCode(baseCode, currentTask.functionDef);
  }, [codesByTaskId, currentTask]);

  const setCurrentCode = (newCode: string) => {
    if (!currentTask) return;
    setCodesByTaskId((prev) => ({ ...prev, [currentTask.taskId]: newCode }));

    // Invalida os resultados do teste se o código foi alterado
    setResultsByTaskId((prev) => ({ ...prev, [currentTask.taskId]: [] }));
    setSubmissionStatus(null);
  };

  const blockSubmissions = () => {
    setCanRegisterSubmission(false);
    toast.info(
      "O limite de envios para esta lista foi atingido, você pode executar o código, mas não enviar para avaliação",
    );
  };

  const checkIfListIsValid = (pList: IList) => {
    const submissionLimit = pList.submissionLimit;
    // currentSubmissions deve ser o agrupamento de submissões feitas com diferentes submittedAt
    const submissionsTime = pList.submissions.map(
      (submission) => new Date(submission.submittedAt),
    );
    const uniqueSubmissionTimes = new Set(
      submissionsTime.map((date) => date.getTime()),
    );
    const currentSubmissions = Array.from(uniqueSubmissionTimes);

    if (submissionLimit) {
      return currentSubmissions.length < submissionLimit;
    }

    return true;
  };

  const getList = async (pListId: string) => {
    try {
      // Se o usuário for um estudante, as submissões buscadas serão somente as que pertencem a ele
      const response = await API.get(`/list/${pListId}`);
      const responseList: IList = response.data;

      const isListValid = checkIfListIsValid(responseList);

      if (!isListValid) {
        blockSubmissions();
      } else {
        setCanRegisterSubmission(true);
      }

      setList(responseList);
    } catch (e) {
      console.error("Failed to load list", e);
    }
  };

  const getTasksInList = async (pListId: string) => {
    setLoadingTasks(true);
    try {
      const response = await API.get(`/class-task-list/task/${pListId}`);
      const formattedTasks: ITask[] = response.data.data.map((task: ITask) => {
        const taskTestCases = task.taskTests;
        const formattedTestCases = taskTestCases?.map((testCase: any) => ({
          ...testCase,
          // Aplica normalização robusta contra double-encoding / envelopamentos
          // do backend. Garante que `input` sempre seja um array plano de strings
          // com um item por parâmetro esperado pela função.
          input: normalizeTestCaseInput(testCase.input),
        }));

        return { ...task, taskTests: formattedTestCases };
      });

      setTasksInList(formattedTasks);

      const initialCodes: Record<string, string> = {};
      formattedTasks.forEach((task) => {
        initialCodes[task.taskId] = appendFunctionToCode(
          baseCode,
          task.functionDef,
        );
      });
      setCodesByTaskId(initialCodes);
    } catch (e) {
      console.error("Failed to load tasks", e);
      toast.error("Erro ao carregar tarefas da lista.");
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    if (listId) {
      getList(listId as string);
      getTasksInList(listId as string);
    }

    if (typeof window !== "undefined" && window.innerWidth > 1280) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [listId]);

  // Reseta estado específico da tarefa ao trocar de tarefa
  useEffect(() => {
    setLastResults([]);
    setCompileErrors([]);
    setSubmissionStatus(null);
    setIsRunning(false);
  }, [currentIndex]);

  const handleRunCode = async () => {
    if (!currentCode || !currentTask) return;

    setIsRunning(true);
    setLastResults([]);
    setCompileErrors([]);
    setSubmissionStatus(null);

    const runningTaskId = currentTask.taskId;

    try {
      const { compileErrors: newCompileErrors, results } =
        await executeWithTestInputs(currentCode, currentTask);

      if (newCompileErrors.length > 0) {
        setCompileErrors(newCompileErrors);
        setSubmissionStatus("error");
        setResultsByTaskId((prev) => ({ ...prev, [runningTaskId]: [] }));
        return;
      }

      const resultsArray: ITestCaseResult[] = [];

      for (const key of results.keys()) {
        const result = results.get(key);
        resultsArray.push(result!);
      }

      setLastResults(resultsArray);
      setResultsByTaskId((prev) => ({
        ...prev,
        [runningTaskId]: resultsArray,
      }));

      const allPassed = resultsArray.every((r) => r.passed);
      setSubmissionStatus(allPassed ? "success" : "error");
    } catch (error) {
      console.error("Erro ao executar testes:", error);
      setCompileErrors([
        {
          message:
            (error as Error)?.message ??
            "Falha inesperada ao executar o código.",
          line: 0,
          column: 0,
          kind: "parse",
        },
      ]);
      setSubmissionStatus("error");
      setResultsByTaskId((prev) => ({ ...prev, [runningTaskId]: [] }));
    } finally {
      setIsRunning(false);
    }
  };

  const handleAdvance = () => {
    if (!tasksInList.length) return;

    if (currentIndex + 1 >= tasksInList.length) {
      setFinished(true);
      return;
    }

    setCurrentIndex((i) => i + 1);
  };

  const handleStepClick = (index: number) => {
    if (isSubmittingList) return;
    if (index < 0 || index >= tasksInList.length) return;
    if (finished) setFinished(false);
    if (index === currentIndex) return;
    setCurrentIndex(index);
  };

  const handleSubmitList = async () => {
    if (
      isSubmittingList ||
      !listId ||
      tasksInList.length === 0 ||
      !canRegisterSubmission
    )
      return;

    setIsSubmittingList(true);

    const initialStatus: Record<string, TaskSubmissionStatus> = {};
    tasksInList.forEach((t) => {
      initialStatus[t.taskId] = "idle";
    });
    setSubmissionStatusByTaskId(initialStatus);

    let successCount = 0;
    let errorCount = 0;

    const submittedAt = new Date().toISOString();

    for (const task of tasksInList) {
      setSubmissionStatusByTaskId((prev) => ({
        ...prev,
        [task.taskId]: "sending",
      }));

      try {
        const taskResults = resultsByTaskId[task.taskId] ?? [];
        const isCorrect =
          taskResults.length > 0 && taskResults.every((r) => r.passed);

        await API.post("/submission", {
          taskId: task.taskId,
          listId: listId as string,
          code: codesByTaskId[task.taskId] ?? "",
          submittedAt,
          isCorrect,
        });

        successCount += 1;
        setSubmissionStatusByTaskId((prev) => ({
          ...prev,
          [task.taskId]: "success",
        }));
      } catch (e) {
        console.error(`Falha ao enviar submissão da tarefa ${task.taskId}`, e);
        errorCount += 1;
        setSubmissionStatusByTaskId((prev) => ({
          ...prev,
          [task.taskId]: "error",
        }));
      }
    }

    await getList(listId as string);

    setIsSubmittingList(false);
    setHasSubmittedList(true);

    if (errorCount === 0) {
      toast.success(
        `Lista enviada com sucesso! ${successCount} tarefa${successCount === 1 ? "" : "s"} submetida${successCount === 1 ? "" : "s"}.`,
      );
    } else {
      toast.warning(
        `Envio concluído com ${errorCount} falha${errorCount === 1 ? "" : "s"}. Você pode reenviar a lista.`,
      );
    }
  };

  const isLastTask =
    tasksInList.length > 0 && currentIndex === tasksInList.length - 1;

  return (
    <LayoutBox>
      <Sidebar
        isRunning={isRunning}
        onRunCode={handleRunCode}
        registerSubmission={canRegisterSubmission}
        handleRegisterSubmissionChange={() => {
          setCanRegisterSubmission((prev) => !prev);
        }}
        isInList={true}
        tasksInList={tasksInList}
        activeTaskIndex={currentIndex}
        listId={(listId as string) || undefined}
        onAdvance={handleAdvance}
        advanceLabel={isLastTask ? "Finalizar" : "Avançar"}
        disableAdvance={
          finished ||
          loadingTasks ||
          tasksInList.length === 0 ||
          isSubmittingList
        }
        onStepClick={handleStepClick}
      />

      <Box
        sx={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        {loadingTasks ? (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            {finished ? (
              <motion.div
                key="finished"
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "-100%", opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                }}
              >
                <FinishedScreen
                  tasks={tasksInList}
                  codesByTaskId={codesByTaskId}
                  resultsByTaskId={resultsByTaskId}
                  submissionStatusByTaskId={submissionStatusByTaskId}
                  isSubmittingList={isSubmittingList}
                  hasSubmittedList={hasSubmittedList}
                  onReviewTask={handleStepClick}
                  onSubmitList={handleSubmitList}
                  canRegisterSubmission={canRegisterSubmission}
                />
              </motion.div>
            ) : currentTask ? (
              <motion.div
                key={currentTask.taskId}
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "-100%", opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                }}
              >
                <TaskView
                  task={currentTask}
                  code={currentCode}
                  setCode={setCurrentCode}
                  submissionStatus={submissionStatus}
                  lastResults={lastResults}
                  compileErrors={compileErrors}
                  isRunning={isRunning}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        )}
      </Box>
    </LayoutBox>
  );
}
