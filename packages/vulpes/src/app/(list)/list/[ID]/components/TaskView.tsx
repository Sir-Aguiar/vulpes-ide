import { Box } from "@mui/material";
import CodeSection from "./CodeSection";
import DetailsSection from "./DetailsSection";
import { ICompileError, ITestCaseResult } from "@/utils/code-tester";
import { ITask } from "@/@types/Task";

interface ITaskViewProps {
  task: ITask;
  code: string;
  setCode: (code: string) => void;
  submissionStatus: "success" | "error" | null;
  lastResults: ITestCaseResult[];
  compileErrors: ICompileError[];
  isRunning: boolean;
}

export default function TaskView({
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
