"use client";

import { Box, CircularProgress, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { useAppTheme } from "@/providers/ColorModeProvider";
import { TaskSubmissionStatus } from "../page";

export default function SubmissionIndicator({
  status,
}: {
  status: TaskSubmissionStatus;
}) {
  const theme = useAppTheme();

  if (status === "idle") return null;

  if (status === "sending") {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        <CircularProgress size={14} sx={{ color: theme.brand }} />
        <Typography variant="caption" sx={{ color: theme.textSecondary }}>
          Enviando...
        </Typography>
      </Box>
    );
  }

  if (status === "success") {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <CheckCircleIcon sx={{ color: "success.main", fontSize: 18 }} />
        <Typography variant="caption" sx={{ color: "success.main" }}>
          Enviada
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <ErrorIcon sx={{ color: "error.main", fontSize: 18 }} />
      <Typography variant="caption" sx={{ color: "error.main" }}>
        Falhou
      </Typography>
    </Box>
  );
}
