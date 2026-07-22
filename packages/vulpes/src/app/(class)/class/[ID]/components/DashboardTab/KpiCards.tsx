import { ClassTaskDashboardKpis } from "@/@types/ClassTaskDashboard";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import TrackChangesOutlinedIcon from "@mui/icons-material/TrackChangesOutlined";
import { Box } from "@mui/material";
import KpiCard from "./KpiCard";

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
