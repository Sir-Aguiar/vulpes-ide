"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { toast } from "react-toastify";

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

import {
  resolveAccessMode,
  buildSubmissionPayload,
  resolveTaskEndpoint,
  TaskAccessMode,
} from "./types";
import { TaskAccessGuard } from "./components/TaskAccessGuard";
import { TaskView } from "./components/TaskView";

export default function Page() {
  return (
    <AuthGuard>
      <AppNavBar />
      <Suspense fallback={<LoadingBox />}>
        <TaskPageContent />
      </Suspense>
    </AuthGuard>
  );
}

function LoadingBox() {
  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        height: "calc(100vh - 64px)",
        bgcolor: "#263238",
      }}
    >
      <CircularProgress />
    </Box>
  );
}

function TaskPageContent() {
  const searchParams = useSearchParams();
  const access = resolveAccessMode(searchParams ?? new URLSearchParams());

  return (
    <TaskAccessGuard access={access}>
      {/* access é garantidamente não-null aqui pelo guard acima */}
      <TaskContent access={access!} />
    </TaskAccessGuard>
  );
}

interface ITaskContentProps {
  access: TaskAccessMode;
}

function TaskContent({ access }: ITaskContentProps) {
  const [task, setTask] = useState<ITask | null>(null);
  const [code, setCode] = useState<string>(baseCode);
  const [loadingTask, setLoadingTask] = useState<boolean>(true);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [lastResults, setLastResults] = useState<ITestCaseResult[]>([]);
  const [compileErrors, setCompileErrors] = useState<ICompileError[]>([]);
  const [submissionStatus, setSubmissionStatus] = useState<
    "success" | "error" | null
  >(null);
  const [hasRun, setHasRun] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const accessKey =
    access.mode === "task"
      ? access.taskId
      : access.mode === "classTask"
        ? access.classTaskId
        : access.classTaskListId;

  const fetchTask = async () => {
    setLoadingTask(true);
    try {
      const endpoint = resolveTaskEndpoint(access);
      const response = await API.get(endpoint);

      const taskData: ITask = response.data?.task ?? response.data;
      const formattedTestCases = taskData.taskTests?.map((testCase) => ({
        ...testCase,
        input: normalizeTestCaseInput(testCase.input),
      }));

      const normalizedTask = { ...taskData, taskTests: formattedTestCases };
      setTask(normalizedTask);
      setCode(appendFunctionToCode(baseCode, normalizedTask.functionDef));
    } catch (e) {
      console.error("Falha ao carregar tarefa", e);
      toast.error("Não foi possível carregar a tarefa.");
    } finally {
      setLoadingTask(false);
    }
  };

  useEffect(() => {
    fetchTask();

    if (typeof window !== "undefined" && window.innerWidth > 1280) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessKey]);

  const handleRunCode = async () => {
    if (!code || !task) return;

    setIsRunning(true);
    setSubmissionStatus(null);
    setLastResults([]);
    setCompileErrors([]);

    try {
      const { compileErrors: newCompileErrors, results } =
        await executeWithTestInputs(code, task);

      if (newCompileErrors.length > 0) {
        setCompileErrors(newCompileErrors);
        setSubmissionStatus("error");
        return;
      }

      const resultsArray: ITestCaseResult[] = [];
      for (const key of results.keys()) {
        resultsArray.push(results.get(key)!);
      }

      setLastResults(resultsArray);
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
    } finally {
      setIsRunning(false);
      setHasRun(true);
    }
  };

  const handleSubmit = async () => {
    if (!task || isSubmitting || !hasRun) return;

    const isCorrect =
      compileErrors.length === 0 &&
      lastResults.length > 0 &&
      lastResults.every((r) => r.passed);

    setIsSubmitting(true);
    try {
      const payload = buildSubmissionPayload(access, code, isCorrect);
      await API.post("/submission", payload);
      toast.success("Tarefa enviada com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar tarefa:", error);
      toast.error("Falha ao enviar tarefa. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <Sidebar
        isRunning={isRunning}
        onRunCode={handleRunCode}
        isInList={false}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        canSubmit={hasRun && !isRunning}
        submitDisabledReason="Execute o código ao menos uma vez para habilitar o envio."
      />

      <Box
        sx={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        {loadingTask ? (
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
        ) : task ? (
          <TaskView
            task={task}
            code={code}
            setCode={setCode}
            submissionStatus={submissionStatus}
            lastResults={lastResults}
            compileErrors={compileErrors}
            isRunning={isRunning}
          />
        ) : null}
      </Box>
    </Box>
  );
}
