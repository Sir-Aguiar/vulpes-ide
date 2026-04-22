"use client";

import { IList } from "@/@types/List";
import { ITask } from "@/@types/Task";
import AppNavBar from "@/components/AppNavBar";
import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar/Sidebar";
import API from "@/services/API";
import { appendFunctionToCode } from "@/utils/code-formatter";
import { executeWithTestInputs, ITestCaseResult } from "@/utils/code-tester";
import { baseCode } from "@/utils/mocks";
import { Box } from "@mui/material";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { registerPortugolLanguage } from "../../../../../libs/monaco-config";
import { Editor } from "@monaco-editor/react";
import MDEditor from "@uiw/react-md-editor";

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
      <TaskContent />
    </AuthGuard>
  );
}

function LayoutBox({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: "grid",
        width: "100%",
        gap: 4,
        padding: 2,
        bgcolor: "#263238",
        // Telas > 1280px
        "@media (min-width: 1281px)": {
          gridTemplateColumns: "repeat(12, 1fr)",
          gridTemplateRows: "repeat(12, 1fr)",
          height: "calc(100vh - 64px)",
        },
        // Telas <= 1280px
        "@media (max-width: 1280px)": {
          gridTemplateColumns: "repeat(10, 1fr)",
          gridTemplateRows: "repeat(16, 1fr)",
          height: "calc(200vh - 64px)",
        },
      }}
    >
      {children}
    </Box>
  );
}

interface ICodeSection {
  code: string;
  setCode: (code: string) => void;
  submissionStatus: "success" | "error" | null;
  lastResults: ITestCaseResult[];
  isRunning: boolean;
}

function CodeSection({
  code,
  setCode,
  submissionStatus,
  lastResults,
  isRunning,
}: ICodeSection) {
  const editorBoxStyle = {
    gridColumn: "2 / 8",
    gridRow: "1 / 10",
    "@media (max-width: 1280px)": {
      gridColumn: "1 / 11",
      gridRow: "8 / 14",
    },
  };

  const outputBoxStyle = {
    gridColumn: "2 / 8",
    gridRow: "10 / 13",
    display: "flex",
    flexDirection: "column",
    "@media (max-width: 1280px)": {
      gridColumn: "1 / 11",
      gridRow: "14 / 17",
    },
  };

  function handleEditorDidMount(editorInstance: any, monacoInstance: any) {
    registerPortugolLanguage(monacoInstance);
    monacoInstance.editor.setTheme("vs-dark");
  }

  return (
    <>
      <Box sx={editorBoxStyle}>
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
      <Box sx={outputBoxStyle}>
        <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-gray-700">
          <span className="text-sm font-semibold text-gray-300">
            Terminal / Resultados
          </span>
          <div className="flex items-center gap-2">
            {submissionStatus === "success" && (
              <span className="flex items-center text-xs font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                <CheckIcon className="w-3.5 h-3.5 mr-1" /> SUCESSO
              </span>
            )}
            {submissionStatus === "error" && (
              <span className="flex items-center text-xs font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                <XIcon className="w-3.5 h-3.5 mr-1" /> FALHA
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {lastResults.length === 0 && !isRunning && (
            <div className="flex h-full items-center justify-center text-gray-500 text-sm">
              Execute o código para ver os resultados.
            </div>
          )}
          {isRunning && (
            <div className="flex h-full items-center justify-center text-gray-400 text-sm animate-pulse">
              Executando testes...
            </div>
          )}

          {lastResults.map((result, index) => (
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
      </Box>
    </>
  );
}

interface IDetailsSection {
  task: ITask | null;
}

function DetailsSection({ task }: IDetailsSection) {
  const boxStyle = {
    gridColumn: "8 / 13",
    gridRow: "1 / 13",
    "@media (max-width: 1280px)": {
      gridColumn: "1 / 11",
      gridRow: "1 / 7",
    },
    overflowY: "auto",
  };

  return (
    <Box sx={boxStyle}>
      <MDEditor.Markdown
        source={task?.description || ""}
        style={{
          padding: "8px 16px",
          overflowY: "auto",
          backgroundColor: "#263238",
        }}
      />
    </Box>
  );
}

function TaskContent() {
  const { ID } = useParams();

  // Pega o parâmetro de lista (caso seja redirecionado) e apaga da URL
  const searchParams = useSearchParams();
  const [listId, setListId] = useState<string | null>(null);

  useEffect(() => {
    const storageKey = `task_context_list_${ID}`;

    const listIdFromParams = searchParams.get("listId");
    const storedListId = sessionStorage.getItem(storageKey);

    const currentListId = listIdFromParams || storedListId;

    if (currentListId) {
      setListId(currentListId);
      sessionStorage.setItem(storageKey, currentListId);
      getList(currentListId);
      getTasksInList(currentListId);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [searchParams, ID]);

  const [task, setTask] = useState<ITask | null>(null);
  const [tasksInList, setTasksInList] = useState<ITask[]>([]);
  const [code, setCode] = useState<string>(baseCode);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [lastResults, setLastResults] = useState<ITestCaseResult[]>([]);
  const [isForbiddenToSubmit, setIsForbiddenToSubmit] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<
    "success" | "error" | null
  >(null);
  const [canRegisterSubmission, setCanRegisterSubmission] = useState(false);

  const getTask = async () => {
    try {
      const response = await API.get(`/task/${ID}`);

      // Converter os inputs dos testCases de string para array, se necessário
      const taskTestCases = response.data.data;
      const formattedTestCases = taskTestCases?.map((testCase: any) => ({
        ...testCase,
        input:
          typeof testCase.input === "string"
            ? JSON.parse(testCase.input)
            : testCase.input,
      }));

      const taskData = { ...response.data, taskTests: formattedTestCases };
      setTask(taskData);
      setCode(appendFunctionToCode(baseCode, taskData.functionDef));
    } catch (e) {
      console.error("Failed to load task", e);
    }
  };

  const getTasksInList = async (pListId: string) => {
    console.log("Loading tasks for list", pListId);

    try {
      const response = await API.get(`/class-task-list/task/${pListId}`);
      console.log(response);
      const formatedTasks = response.data.data.map((task: ITask) => {
        // Converter os inputs dos testCases de string para array, se necessário
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

      setTasksInList(formatedTasks);
      setCode(appendFunctionToCode(baseCode, formatedTasks[0].functionDef));
    } catch (e) {
      console.error("Failed to load task", e);
    }
  };

  const [list, setList] = useState<IList | null>(null);

  const getList = async (pListId: string) => {
    if (!pListId) return;

    try {
      const response = await API.get(`/list/${pListId}/${ID}`);
      const resposeList = response.data;

      const isListValid = checkIfListIsValid(resposeList);

      if (!isListValid) blockSubmissions();

      setList(resposeList);
    } catch (e) {
      console.error("Failed to load list", e);
    }
  };

  const blockSubmissions = () => {
    setCanRegisterSubmission(false);
    setIsForbiddenToSubmit(true);
    toast.info(
      "O limite de envios para esta tarefa foi atingido, você pode executar o código, mas não enviar para avaliação",
    );
  };

  const checkIfListIsValid = (list: IList) => {
    const submissionLimit = list.submissionLimit;
    const currentSubmissions = list.submissions;

    if (submissionLimit) {
      return currentSubmissions.length < submissionLimit;
    }

    return true;
  };

  useEffect(() => {
    if (ID) getTask();

    if (window.innerWidth > 1280) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [ID]);

  const registerSubmission = async (results: ITestCaseResult[]) => {
    const isListValid = !!list && checkIfListIsValid(list);

    if (!isListValid) return;

    const isCorrect = results.every((res) => res.passed);
    const result = await API.post("/submission", {
      taskId: ID,
      listId: listId || undefined,
      code,
      isCorrect,
    });

    if (listId) {
      await getList(listId);
    }

    return result;
  };

  const handleRunCode = async () => {
    if (code && task) {
      setIsRunning(true);
      setSubmissionStatus(null);
      setLastResults([]);

      try {
        const results = await executeWithTestInputs(code, task);
        const resultsArray: ITestCaseResult[] = [];

        results.keys().forEach((key) => {
          const result = results.get(key);
          resultsArray.push(result!);
        });

        setLastResults(resultsArray);

        if (canRegisterSubmission) await registerSubmission(resultsArray);

        const allPassed = resultsArray.every((r) => r.passed);
        setSubmissionStatus(allPassed ? "success" : "error");
      } catch (error) {
        console.error("Erro ao executar testes:", error);
        setSubmissionStatus("error");
      } finally {
        setIsRunning(false);
      }
    }
  };

  const activeTaskIndex = useMemo(() => {
    if (!list || !tasksInList.length) return 0;
    return tasksInList.findIndex((t) => t.taskId === task?.taskId) || 0;
  }, [list, tasksInList, task]);

  return (
    <LayoutBox>
      <Sidebar
        isRunning={isRunning}
        onRunCode={handleRunCode}
        registerSubmission={canRegisterSubmission}
        handleRegisterSubmissionChange={() => {
          setCanRegisterSubmission((prev) => !prev);
        }}
        isInList={!!list}
        tasksInList={tasksInList}
        activeTaskIndex={activeTaskIndex}
        listId={listId || undefined}
      />
      <CodeSection
        code={code}
        setCode={setCode}
        submissionStatus={submissionStatus}
        lastResults={lastResults}
        isRunning={isRunning}
      />
      <DetailsSection task={task} />
    </LayoutBox>
  );
}
