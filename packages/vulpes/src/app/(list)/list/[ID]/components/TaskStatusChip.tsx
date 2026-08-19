"use client";

import { Chip } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { alpha, useTheme } from "@mui/material/styles";

export default function TaskStatusChip({
  hasResults,
  isCorrect,
}: {
  hasResults: boolean;
  isCorrect: boolean;
}) {
  const theme = useTheme();

  if (!hasResults) {
    return (
      <Chip
        label="Não executada"
        size="small"
        sx={{
          bgcolor: alpha(theme.palette.text.primary, 0.06),
          color: "text.secondary",
          border: "1px solid",
          borderColor: "divider",
          fontWeight: 600,
        }}
      />
    );
  }

  if (isCorrect) {
    return (
      <Chip
        icon={<CheckCircleIcon sx={{ color: `${theme.palette.success.main} !important` }} />}
        label="Correta"
        size="small"
        sx={{
          bgcolor: alpha(theme.palette.success.main, 0.12),
          color: "success.main",
          border: "1px solid",
          borderColor: alpha(theme.palette.success.main, 0.25),
          fontWeight: 600,
        }}
      />
    );
  }

  return (
    <Chip
      icon={<ErrorIcon sx={{ color: `${theme.palette.error.main} !important` }} />}
      label="Incorreta"
      size="small"
      sx={{
        bgcolor: alpha(theme.palette.error.main, 0.12),
        color: "error.main",
        border: "1px solid",
        borderColor: alpha(theme.palette.error.main, 0.25),
        fontWeight: 600,
      }}
    />
  );
}
