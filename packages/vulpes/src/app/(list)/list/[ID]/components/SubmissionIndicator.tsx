import { Box, CircularProgress, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { COLORS } from "@/utils/colors";
import { TaskSubmissionStatus } from "../page";

export default function SubmissionIndicator({
  status,
}: {
  status: TaskSubmissionStatus;
}) {
  if (status === "idle") return null;

  if (status === "sending") {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        <CircularProgress size={14} sx={{ color: COLORS.dark.primary[500] }} />
        <Typography variant="caption" sx={{ color: "#cfd8dc" }}>
          Enviando...
        </Typography>
      </Box>
    );
  }

  if (status === "success") {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <CheckCircleIcon sx={{ color: "#66bb6a", fontSize: 18 }} />
        <Typography variant="caption" sx={{ color: "#a5d6a7" }}>
          Enviada
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <ErrorIcon sx={{ color: "#ef5350", fontSize: 18 }} />
      <Typography variant="caption" sx={{ color: "#ef9a9a" }}>
        Falhou
      </Typography>
    </Box>
  );
}
