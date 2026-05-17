import { Chip } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

export default function TaskStatusChip({
  hasResults,
  isCorrect,
}: {
  hasResults: boolean;
  isCorrect: boolean;
}) {
  if (!hasResults) {
    return (
      <Chip
        label="Não executada"
        size="small"
        sx={{
          bgcolor: "rgba(255,255,255,0.06)",
          color: "#cfd8dc",
          border: "1px solid rgba(255,255,255,0.12)",
          fontWeight: 600,
        }}
      />
    );
  }

  if (isCorrect) {
    return (
      <Chip
        icon={<CheckCircleIcon sx={{ color: "#66bb6a !important" }} />}
        label="Correta"
        size="small"
        sx={{
          bgcolor: "rgba(102,187,106,0.12)",
          color: "#a5d6a7",
          border: "1px solid rgba(102,187,106,0.25)",
          fontWeight: 600,
        }}
      />
    );
  }

  return (
    <Chip
      icon={<ErrorIcon sx={{ color: "#ef5350 !important" }} />}
      label="Incorreta"
      size="small"
      sx={{
        bgcolor: "rgba(239,83,80,0.12)",
        color: "#ef9a9a",
        border: "1px solid rgba(239,83,80,0.25)",
        fontWeight: 600,
      }}
    />
  );
}
