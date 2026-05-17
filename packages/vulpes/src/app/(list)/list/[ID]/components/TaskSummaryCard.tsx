import { ITask } from "@/@types/Task";
import {
  Box,
  Card,
  CardContent,
  Collapse,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import SubmissionIndicator from "./SubmissionIndicator";
import TaskStatusChip from "./TaskStatusChip";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { Editor } from "@monaco-editor/react";
import CodeIcon from "@mui/icons-material/Code";
import { registerPortugolLanguage } from "../../../../../../libs/monaco-config";
import { COLORS } from "@/utils/colors";
import { TaskSubmissionStatus } from "../page";

interface ITaskSummaryCardProps {
  task: ITask;
  index: number;
  code: string;
  hasResults: boolean;
  isCorrect: boolean;
  submissionStatus: TaskSubmissionStatus;
  onReview: () => void;
}

export default function TaskSummaryCard({
  task,
  index,
  code,
  hasResults,
  isCorrect,
  submissionStatus,
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
          <SubmissionIndicator status={submissionStatus} />
          <TaskStatusChip hasResults={hasResults} isCorrect={isCorrect} />
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
