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
import { AnimatePresence, motion } from "framer-motion";
import { COLORS } from "@/utils/colors";

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

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
  return (
    <Box
      onClick={onToggle}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2,
        py: 1,
        bgcolor: "#252526",
        borderBottom: collapsed ? "none" : "1px solid",
        borderColor: "rgba(255,255,255,0.08)",
        cursor: "pointer",
        userSelect: "none",
        borderRadius: collapsed ? "8px" : "8px 8px 0 0",
        transition: "background-color 0.15s ease",
        "&:hover": { bgcolor: "#2d2d30" },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box sx={{ color: COLORS.dark.primary[500], display: "flex" }}>
          {icon}
        </Box>
        <Typography
          variant="body2"
          sx={{ color: "#d4d4d4", fontWeight: 600, letterSpacing: 0.2 }}
        >
          {title}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {trailing}
        <IconButton
          size="small"
          sx={{ color: "#9e9e9e", p: 0.25 }}
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
  const [editorCollapsed, setEditorCollapsed] = useState(false);
  const [outputCollapsed, setOutputCollapsed] = useState(false);

  function handleEditorDidMount(_editor: any, monacoInstance: any) {
    registerPortugolLanguage(monacoInstance);
    monacoInstance.editor.setTheme("vs-dark");
  }

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
          flex: editorCollapsed ? "0 0 auto" : "1 1 70%",
          minHeight: 0,
          borderRadius: "8px",
          overflow: "hidden",
          bgcolor: "#1e1e1e",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <CollapsibleHeader
          icon={<CodeIcon fontSize="small" />}
          title="Editor"
          collapsed={editorCollapsed}
          onToggle={() => setEditorCollapsed((v) => !v)}
        />
        {!editorCollapsed && (
          <Box sx={{ flex: 1, minHeight: 240 }}>
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
          flex: outputCollapsed ? "0 0 auto" : "1 1 30%",
          minHeight: 0,
          borderRadius: "8px",
          overflow: "hidden",
          bgcolor: "#1e1e1e",
          border: "1px solid rgba(255,255,255,0.05)",
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
          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#1e1e1e] min-h-[160px]">
            {compileErrors.length === 0 &&
              lastResults.length === 0 &&
              !isRunning && (
                <div className="flex h-full items-center justify-center text-gray-500 text-sm">
                  Execute o código para ver os resultados.
                </div>
              )}
            {isRunning && (
              <div className="flex h-full items-center justify-center text-gray-400 text-sm animate-pulse">
                Executando testes...
              </div>
            )}

            {!isRunning && compileErrors.length > 0 && (
              <div className="bg-[#1e1e1e] rounded border border-red-500/30 overflow-hidden">
                <div className="flex items-center px-3 py-2 bg-red-500/10 border-b border-red-500/20">
                  <XIcon className="w-4 h-4 text-red-500 mr-2" />
                  <span className="text-sm font-semibold text-red-400">
                    {compileErrors.length === 1
                      ? "1 erro de compilação"
                      : `${compileErrors.length} erros de compilação`}
                  </span>
                </div>
                <ul className="px-4 py-2 space-y-1 text-xs font-mono text-red-300">
                  {compileErrors.map((err, idx) => (
                    <li key={idx} className="leading-relaxed">
                      <span className="text-gray-500 mr-2">
                        [{err.kind === "parse" ? "sintaxe" : "semântico"}]
                      </span>
                      <span className="text-gray-400 mr-2">
                        linha {err.line}, coluna {err.column}:
                      </span>
                      <span>{err.message}</span>
                    </li>
                  ))}
                </ul>
                <div className="px-4 py-2 text-[11px] text-gray-500 border-t border-gray-700">
                  Corrija os erros acima para que os testes sejam executados.
                </div>
              </div>
            )}

            {!isRunning &&
              compileErrors.length === 0 &&
              lastResults.map((result, index) => (
              <div
                key={index}
                className="flex flex-col bg-[#2d2d2d] rounded bg-opacity-40 overflow-hidden"
              >
                <div
                  className={`flex items-center px-3 py-2 border-l-4 ${
                    result.passed
                      ? "border-green-500 bg-green-500/5"
                      : "border-red-500 bg-red-500/5"
                  }`}
                >
                  <span className="mr-3">
                    {result.passed ? (
                      <CheckIcon className="w-5 h-5 text-green-500" />
                    ) : (
                      <XIcon className="w-5 h-5 text-red-500" />
                    )}
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      result.passed ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    Teste {index + 1}
                  </span>
                  <span className="ml-auto text-xs text-gray-500">
                    {result.passed ? "Passou" : "Falhou"}
                  </span>
                </div>

                {!result.passed && (
                  <div className="px-4 py-2 bg-[#1e1e1e] bg-opacity-50 text-xs font-mono border-t border-gray-700 text-gray-300">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="block text-gray-500 mb-0.5">
                          Esperado:
                        </span>
                        <div className="bg-gray-800 p-1 rounded text-green-300">
                          {result.expectedOutput}
                        </div>
                      </div>
                      <div>
                        <span className="block text-gray-500 mb-0.5">
                          Obtido:
                        </span>
                        <div className="bg-gray-800 p-1 rounded text-red-300">
                          {result.actualOutput}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Box>
    </Box>
  );
}

interface IDetailsSection {
  task: ITask | null;
}

function DetailsSection({ task }: IDetailsSection) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        borderRadius: "8px",
        overflow: "hidden",
        backgroundColor: "transparent",
        color: "white",
      }}
    >
      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
        <MDEditor.Markdown
          source={task?.description || ""}
          style={{
            padding: "8px 16px",
            backgroundColor: "transparent",
            color: "white",
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

interface ITaskSummaryCardProps {
  task: ITask;
  index: number;
  code: string;
  onReview: () => void;
}

function TaskSummaryCard({
  task,
  index,
  code,
  onReview,
}: ITaskSummaryCardProps) {
  const [codeCollapsed, setCodeCollapsed] = useState(true);
  const lines = code.split("\n").length;

  return (
    <Card
      sx={{
        bgcolor: "#1e272c",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 2,
        color: "#fff",
      }}
    >
      <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            px: 2.5,
            py: 2,
            borderBottom: codeCollapsed
              ? "none"
              : "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              bgcolor: COLORS.dark.primary[500],
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {index + 1}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, color: "#fff", lineHeight: 1.2 }}
              noWrap
            >
              {task.title}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "#90a4ae", display: "block" }}
            >
              Tarefa {index + 1} · {lines} linha{lines === 1 ? "" : "s"} de
              código
            </Typography>
          </Box>
          <Chip
            icon={<CheckCircleIcon sx={{ color: "#66bb6a !important" }} />}
            label="Concluída"
            size="small"
            sx={{
              bgcolor: "rgba(102,187,106,0.12)",
              color: "#a5d6a7",
              border: "1px solid rgba(102,187,106,0.25)",
              fontWeight: 600,
            }}
          />
          <Tooltip title="Revisar tarefa">
            <IconButton
              size="small"
              onClick={onReview}
              sx={{ color: "#90a4ae" }}
            >
              <CodeIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton
            size="small"
            onClick={() => setCodeCollapsed((v) => !v)}
            sx={{ color: "#90a4ae" }}
          >
            {codeCollapsed ? (
              <ExpandMoreIcon fontSize="small" />
            ) : (
              <ExpandLessIcon fontSize="small" />
            )}
          </IconButton>
        </Box>

        <Collapse in={!codeCollapsed} unmountOnExit>
          <Box sx={{ bgcolor: "#1e1e1e", height: 260 }}>
            <Editor
              height="100%"
              theme="vs-dark"
              language="portugol"
              value={code}
              onMount={(_e, monacoInstance) => {
                registerPortugolLanguage(monacoInstance);
                monacoInstance.editor.setTheme("vs-dark");
              }}
              options={{
                readOnly: true,
                fontSize: 13,
                tabSize: 2,
                wordWrap: "on",
                minimap: { enabled: false },
                lineNumbers: "on",
                automaticLayout: true,
                scrollBeyondLastLine: false,
              }}
            />
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}

interface IFinishedScreenProps {
  tasks: ITask[];
  codesByTaskId: Record<string, string>;
  onReviewTask: (index: number) => void;
}

function FinishedScreen({
  tasks,
  codesByTaskId,
  onReviewTask,
}: IFinishedScreenProps) {
  const totalLines = tasks.reduce(
    (acc, t) => acc + (codesByTaskId[t.taskId]?.split("\n").length ?? 0),
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
            gap: 2,
            mb: 1,
            color: COLORS.dark.primary[500],
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 40 }} />
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#fff" }}>
            Lista finalizada!
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: "#cfd8dc", mb: 3 }}>
          Você concluiu todas as tarefas desta lista. Abaixo está um resumo
          ilustrativo do seu progresso — em breve esta tela apresentará métricas
          detalhadas de desempenho.
        </Typography>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(3, 1fr)",
            },
            mb: 3,
          }}
        >
          <Card sx={{ bgcolor: "#1e272c", color: "#fff", borderRadius: 2 }}>
            <CardContent>
              <Typography variant="caption" sx={{ color: "#90a4ae" }}>
                Tarefas concluídas
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {tasks.length}
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
                Progresso
              </Typography>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: COLORS.dark.primary[500] }}
              >
                100%
              </Typography>
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
          {tasks.map((task, index) => (
            <TaskSummaryCard
              key={task.taskId}
              task={task}
              index={index}
              code={codesByTaskId[task.taskId] ?? ""}
              onReview={() => onReviewTask(index)}
            />
          ))}
        </Box>
      </Box>
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
  };

  const blockSubmissions = () => {
    setCanRegisterSubmission(false);
    toast.info(
      "O limite de envios para esta lista foi atingido, você pode executar o código, mas não enviar para avaliação",
    );
  };

  const checkIfListIsValid = (pList: IList) => {
    const submissionLimit = pList.submissionLimit;
    const currentSubmissions = pList.submissions ?? [];

    if (submissionLimit) {
      return currentSubmissions.length < submissionLimit;
    }

    return true;
  };

  const getList = async (pListId: string) => {
    try {
      const response = await API.get(`/list/${pListId}`);
      const responseList: IList = response.data;

      if (!checkIfListIsValid(responseList)) blockSubmissions();

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
          input:
            typeof testCase.input === "string"
              ? JSON.parse(testCase.input)
              : testCase.input,
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

    try {
      const { compileErrors: newCompileErrors, results } =
        await executeWithTestInputs(currentCode, currentTask);

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
    if (index < 0 || index >= tasksInList.length) return;
    if (finished) setFinished(false);
    if (index === currentIndex) return;
    setCurrentIndex(index);
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
        disableAdvance={finished || loadingTasks || tasksInList.length === 0}
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
                  onReviewTask={handleStepClick}
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
