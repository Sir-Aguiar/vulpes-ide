import { ClassTaskListDashboardKpis } from "@/@types/ClassTaskListDashboard";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import { Box } from "@mui/material";
import KpiCard from "../KpiCard";

interface IListKpiCardsProps {
  kpis: ClassTaskListDashboardKpis;
}

export default function ListKpiCards({ kpis }: IListKpiCardsProps) {
  const completionPct = Math.round(kpis.completionRate * 100);
  const hardestAccuracyPct = kpis.hardestTask ? Math.round(kpis.hardestTask.accuracyRate * 100) : null;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" },
        gap: 2,
      }}
    >
      <KpiCard
        icon={<EmojiEventsOutlinedIcon fontSize="small" />}
        label="Nota média"
        value={`${kpis.averageScore}`}
        caption={`Média entre ${kpis.totalStudents} aluno${kpis.totalStudents !== 1 ? "s" : ""} matriculados`}
        accent="primary"
        progress={kpis.averageScore}
      />
      <KpiCard
        icon={<TaskAltOutlinedIcon fontSize="small" />}
        label="Taxa de conclusão"
        value={`${completionPct}%`}
        caption="Alunos que enviaram todas as tarefas"
        accent="success"
        progress={completionPct}
      />
      <KpiCard
        icon={<HourglassEmptyOutlinedIcon fontSize="small" />}
        label="Alunos pendentes"
        value={String(kpis.studentsWithoutSubmission)}
        caption="Sem nenhum envio na lista"
        accent="warning"
      />
      <KpiCard
        icon={<WarningAmberOutlinedIcon fontSize="small" />}
        label="Tarefa mais difícil"
        value={hardestAccuracyPct !== null ? `${hardestAccuracyPct}%` : "—"}
        caption={
          kpis.hardestTask
            ? `Tarefa ${kpis.hardestTask.index} · ${kpis.hardestTask.title}`
            : "Nenhum envio registrado ainda"
        }
        accent="error"
        progress={hardestAccuracyPct ?? undefined}
      />
    </Box>
  );
}
