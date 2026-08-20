"use client";

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
import { Box, CircularProgress, IconButton, Typography } from "@mui/material";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CodeIcon from "@mui/icons-material/Code";
import TerminalIcon from "@mui/icons-material/Terminal";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Editor } from "@monaco-editor/react";
import MDEditor from "@uiw/react-md-editor";
import { toast } from "react-toastify";
import { useAppTheme } from "@/providers/ColorModeProvider";
import { ExecutionOutput } from "@/components/ide/ExecutionOutput";
import { usePortugolEditor } from "@/hooks/usePortugolEditor";
import CheckIcon from "../../../../../public/icons/CheckIcon";
import XIcon from "../../../../../public/icons/XIcon";

export default function Page() {
  return (
    <AuthGuard>
      <AppNavBar />
      <TaskContent />
    </AuthGuard>
  );
}

function LayoutBox({ children }: { children: React.ReactNode }) {
  const theme = useAppTheme();

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        gap: 2,
        padding: 2,
        bgcolor: theme.bg,
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

interface ICollapsibleHeaderProps {
  icon: React.ReactNode;
  title: string;
  collapsed: boolean;
  onToggle: () => void;
  trailing?: React.ReactNode;
}

function CollapsibleHeader({
  icon,
  title,
  collapsed,
  onToggle,
  trailing,
}: ICollapsibleHeaderProps) {
  const theme = useAppTheme();

  return (
    <Box
      onClick={onToggle}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2,
        py: 1,
        bgcolor: theme.contentPanel,
        borderBottom: collapsed ? "none" : "1px solid",
        borderColor: theme.contentPanelBorder,
        cursor: "pointer",
        userSelect: "none",
        borderRadius: collapsed ? "8px" : "8px 8px 0 0",
        transition: "background-color 0.15s ease",
        "&:hover": { bgcolor: theme.hover },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box sx={{ color: theme.brand, display: "flex" }}>
          {icon}
        </Box>
        <Typography
          variant="body2"
          sx={{ color: theme.contentPanelText, fontWeight: 600, letterSpacing: 0.2 }}
        >
          {title}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {trailing}
        <IconButton
          size="small"
          sx={{ color: theme.textMuted, p: 0.25 }}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          {collapsed ? (
            <ExpandMoreIcon fontSize="small" />
          ) : (
            <ExpandLessIcon fontSize="small" />
          )}
        </IconButton>
      </Box>
    </Box>
  );
}

interface ICodeSection {
  code: string;
  setCode: (code: string) => void;
  submissionStatus: "success" | "error" | null;
  lastResults: ITestCaseResult[];
  compileErrors: ICompileError[];
  isRunning: boolean;
}

function CodeSection({
  code,
  setCode,
  submissionStatus,
  lastResults,
  compileErrors,
  isRunning,
}: ICodeSection) {
  const theme = useAppTheme();
  const [editorCollapsed, setEditorCollapsed] = useState(false);
  const [outputCollapsed, setOutputCollapsed] = useState(false);
  const { handleEditorDidMount } = usePortugolEditor(compileErrors);

  const statusBadge =
    submissionStatus === "success" ? (
      <span className="flex items-center text-xs font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
        <CheckIcon className="w-3.5 h-3.5 mr-1" /> SUCESSO
      </span>
    ) : submissionStatus === "error" ? (
      <span className="flex items-center text-xs font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
        <XIcon className="w-3.5 h-3.5 mr-1" /> FALHA
      </span>
    ) : null;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        height: "100%",
        gap: 1,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: editorCollapsed ? "0 0 auto" : "1 1 60%",
          minHeight: editorCollapsed ? 0 : 200,
          borderRadius: "8px",
          overflow: "hidden",
          bgcolor: theme.contentPanel,
          border: "1px solid",
          borderColor: theme.contentPanelBorder,
        }}
      >
        <CollapsibleHeader
          icon={<CodeIcon fontSize="small" />}
          title="Editor"
          collapsed={editorCollapsed}
          onToggle={() => setEditorCollapsed((v) => !v)}
        />
        {!editorCollapsed && (
          <Box sx={{ flex: 1, minHeight: 0, bgcolor: theme.codeBg }}>
            <Editor
              height="100%"
              theme="vs-dark"
              language="portugol"
              value={code}
              onChange={(value) => setCode(value || "")}
              onMount={handleEditorDidMount}
              options={{
                fontSize: 14,
                tabSize: 2,
                wordWrap: "on",
                minimap: { enabled: true },
                lineNumbers: "on",
                renderWhitespace: "selection",
                automaticLayout: true,
                tabCompletion: "on",
                cursorStyle: "line",
                scrollBeyondLastLine: false,
              }}
            />
          </Box>
        )}
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: outputCollapsed ? "0 0 auto" : "1 1 40%",
          minHeight: outputCollapsed ? 0 : 240,
          borderRadius: "8px",
          overflow: "hidden",
          bgcolor: theme.contentPanel,
          border: "1px solid",
          borderColor: theme.contentPanelBorder,
        }}
      >
        <CollapsibleHeader
          icon={<TerminalIcon fontSize="small" />}
          title="Terminal / Resultados"
          collapsed={outputCollapsed}
          onToggle={() => setOutputCollapsed((v) => !v)}
          trailing={statusBadge}
        />
        {!outputCollapsed && (
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              p: 2,
              bgcolor: theme.contentPanel,
            }}
          >
            <ExecutionOutput
              compileErrors={compileErrors}
              lastResults={lastResults}
              isRunning={isRunning}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}

interface IDetailsSection {
  task: ITask | null;
}

function DetailsSection({ task }: IDetailsSection) {
  const theme = useAppTheme();

  return (
    <Box
      data-color-mode={theme.mode}
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        borderRadius: "8px",
        overflow: "hidden",
        backgroundColor: theme.contentPanel,
        color: theme.contentPanelText,
        border: "1px solid",
        borderColor: theme.contentPanelBorder,
      }}
    >
      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
        <MDEditor.Markdown
          source={task?.description || ""}
          style={{
            padding: "8px 16px",
            backgroundColor: "transparent",
            color: theme.contentPanelText,
          }}
        />
      </Box>
    </Box>
  );
}

interface ITaskViewProps {
  task: ITask;
  code: string;
  setCode: (code: string) => void;
  submissionStatus: "success" | "error" | null;
  lastResults: ITestCaseResult[];
  compileErrors: ICompileError[];
  isRunning: boolean;
}

function TaskView({
  task,
  code,
  setCode,
  submissionStatus,
  lastResults,
  compileErrors,
  isRunning,
}: ITaskViewProps) {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "grid",
        gap: 2,
        "@media (min-width: 1281px)": {
          gridTemplateColumns: "minmax(0, 3fr) minmax(0, 2fr)",
          gridTemplateRows: "1fr",
        },
        "@media (max-width: 1280px)": {
          gridTemplateColumns: "1fr",
          gridTemplateRows: "auto 1fr",
        },
      }}
    >
      <CodeSection
        code={code}
        setCode={setCode}
        submissionStatus={submissionStatus}
        lastResults={lastResults}
        compileErrors={compileErrors}
        isRunning={isRunning}
      />
      <DetailsSection task={task} />
    </Box>
  );
}

function TaskContent() {
  const { ID } = useParams();
  const searchParams = useSearchParams();
  const listId = searchParams?.get("listId") || undefined;

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

  const getTask = async () => {
    setLoadingTask(true);
    try {
      const response = await API.get(`/task/${ID}`);

      // Converter os inputs dos testCases de string para array, se necessário
      const taskTestCases = response.data.taskTests;
      const formattedTestCases = taskTestCases?.map((testCase: any) => ({
        ...testCase,
        // Normalização robusta contra double-encoding do backend — garante
        // sempre um array plano de strings, um item por parâmetro.
        input: normalizeTestCaseInput(testCase.input),
      }));

      const taskData = { ...response.data, taskTests: formattedTestCases };
      setTask(taskData);
      setCode(appendFunctionToCode(baseCode, taskData.functionDef));
    } catch (e) {
      console.error("Failed to load task", e);
    } finally {
      setLoadingTask(false);
    }
  };

  useEffect(() => {
    if (ID) getTask();

    if (typeof window !== "undefined" && window.innerWidth > 1280) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [ID]);

  const handleRunCode = async () => {
    if (!code || !task) return;

    setIsRunning(true);
    setSubmissionStatus(null);
    setLastResults([]);
    setCompileErrors([]);

    try {
      const { compileErrors: newCompileErrors, results } =
        await executeWithTestInputs(code, task);

      // Se o compilador acusou erros, exibe apenas o log do compilador
      // no terminal e não prossegue para os testes.
      if (newCompileErrors.length > 0) {
        setCompileErrors(newCompileErrors);
        setSubmissionStatus("error");
        return;
      }

      const resultsArray: ITestCaseResult[] = [];

      for (const key of results.keys()) {
        const result = results.get(key);
        resultsArray.push(result!);
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
    if (!task || !ID || isSubmitting || !hasRun) return;

    const isCorrect =
      compileErrors.length === 0 &&
      lastResults.length > 0 &&
      lastResults.every((r) => r.passed);

    setIsSubmitting(true);
    try {
      await API.post("/submission", {
        taskId: ID,
        ...(listId ? { listId } : {}),
        code,
        isCorrect,
      });

      toast.success("Tarefa enviada com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar tarefa:", error);
      toast.error("Falha ao enviar tarefa. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LayoutBox>
      <Sidebar
        isRunning={isRunning}
        onRunCode={handleRunCode}
        isInList={false}
        listId={listId}
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
    </LayoutBox>
  );
}
