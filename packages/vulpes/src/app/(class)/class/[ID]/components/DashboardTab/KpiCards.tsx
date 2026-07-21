import { ClassTaskDashboardKpis } from "@/@types/ClassTaskDashboard";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import TrackChangesOutlinedIcon from "@mui/icons-material/TrackChangesOutlined";
import { alpha, Box, LinearProgress, Paper, Typography, useTheme } from "@mui/material";
import { ReactNode } from "react";

type Accent = "primary" | "success" | "warning" | "info";

interface IKpiCardProps {
  icon: ReactNode;
  label: string;
  caption: string;
  value: string;
  accent: Accent;
  progress?: number;
}

function KpiCard({ icon, label, caption, value, accent, progress }: IKpiCardProps) {
  const theme = useTheme();

  const accentColor =
    accent === "success"
      ? theme.palette.success.main
      : accent === "warning"
        ? theme.palette.warning.main
        : accent === "info"
          ? theme.palette.info.main
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

      <Typography variant="h3" sx={{ fontWeight: 700, lineHeight: 1, letterSpacing: -0.5 }}>
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

interface IKpiCardsProps {
  kpis: ClassTaskDashboardKpis;
}

export default function KpiCards({ kpis }: IKpiCardsProps) {
  const deliveryPct = Math.round(kpis.deliveryRate * 100);
  const accuracyPct = Math.round(kpis.accuracyRate * 100);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" },
        gap: 2,
      }}
    >
      <KpiCard
        icon={<AssignmentTurnedInOutlinedIcon fontSize="small" />}
        label="Taxa de entrega"
        value={`${deliveryPct}%`}
        caption={`${kpis.studentsWithSubmission} de ${kpis.totalStudents} alunos enviaram`}
        accent="primary"
        progress={deliveryPct}
      />
      <KpiCard
        icon={<TrackChangesOutlinedIcon fontSize="small" />}
        label="Taxa de acerto"
        value={kpis.studentsWithSubmission > 0 ? `${accuracyPct}%` : "—"}
        caption={
          kpis.studentsWithSubmission > 0
            ? `${kpis.studentsCorrect} de ${kpis.studentsWithSubmission} envios corretos`
            : "Nenhum envio registrado"
        }
        accent="success"
        progress={kpis.studentsWithSubmission > 0 ? accuracyPct : undefined}
      />
      <KpiCard
        icon={<HourglassEmptyOutlinedIcon fontSize="small" />}
        label="Alunos pendentes"
        value={String(kpis.studentsWithoutSubmission)}
        caption="Sem nenhum envio realizado"
        accent="warning"
      />
      <KpiCard
        icon={<RateReviewOutlinedIcon fontSize="small" />}
        label="Feedbacks pendentes"
        value={String(kpis.pendingFeedbackCount)}
        caption="Envios aguardando correção"
        accent="info"
      />
    </Box>
  );
}
