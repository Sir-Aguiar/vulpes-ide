import { BugReportSeverity, BugReportStatus } from "@/@types/BugReport";

export const BUG_REPORT_STATUS_LABELS: Record<BugReportStatus, string> = {
  OPEN: "Aberto",
  IN_PROGRESS: "Em andamento",
  RESOLVED: "Resolvido",
  CLOSED: "Fechado",
};

export const BUG_REPORT_SEVERITY_LABELS: Record<BugReportSeverity, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
  CRITICAL: "Crítica",
};

export const BUG_REPORT_STATUS_COLORS: Record<
  BugReportStatus,
  "default" | "info" | "warning" | "success" | "error"
> = {
  OPEN: "info",
  IN_PROGRESS: "warning",
  RESOLVED: "success",
  CLOSED: "default",
};

export const BUG_REPORT_SEVERITY_COLORS: Record<
  BugReportSeverity,
  "default" | "info" | "warning" | "error"
> = {
  LOW: "default",
  MEDIUM: "info",
  HIGH: "warning",
  CRITICAL: "error",
};
