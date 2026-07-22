import { alpha, Box, LinearProgress, Paper, Typography, useTheme } from "@mui/material";
import { ReactNode } from "react";

export type KpiAccent = "primary" | "success" | "warning" | "info" | "error";

interface IKpiCardProps {
  icon: ReactNode;
  label: string;
  caption: string;
  value: string;
  accent: KpiAccent;
  progress?: number;
}

export default function KpiCard({ icon, label, caption, value, accent, progress }: IKpiCardProps) {
  const theme = useTheme();

  const accentColor =
    accent === "success"
      ? theme.palette.success.main
      : accent === "warning"
        ? theme.palette.warning.main
        : accent === "info"
          ? theme.palette.info.main
          : accent === "error"
            ? theme.palette.error.main
            : theme.palette.primary.main;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        p: 2.25,
        display: "flex",
        flexDirection: "column",
        gap: 1.25,
        minWidth: 0,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: alpha(accentColor, 0.12),
            color: accentColor,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      </Box>

      <Typography
        variant="h3"
        noWrap
        title={value}
        sx={{ fontWeight: 700, lineHeight: 1, letterSpacing: -0.5 }}
      >
        {value}
      </Typography>

      {typeof progress === "number" ? (
        <LinearProgress
          variant="determinate"
          value={Math.min(100, Math.max(0, progress))}
          sx={{
            height: 6,
            borderRadius: 3,
            bgcolor: alpha(accentColor, 0.12),
            "& .MuiLinearProgress-bar": { borderRadius: 3, bgcolor: accentColor },
          }}
        />
      ) : null}

      <Typography variant="caption" color="text.secondary">
        {caption}
      </Typography>
    </Paper>
  );
}
