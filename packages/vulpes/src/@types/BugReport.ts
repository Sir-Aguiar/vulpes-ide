export type BugReportStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export type BugReportSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface IBugReportUser {
  userId: string;
  name: string;
  email: string;
  role: string;
}

export interface IBugReport {
  bugReportId: number;
  path: string;
  description: string;
  expectedBehavior?: string | null;
  actualBehavior?: string | null;
  stepsToReproduce?: string | null;
  screenshots: string[];
  os?: string | null;
  browser?: string | null;
  status: BugReportStatus;
  severity: BugReportSeverity;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user: IBugReportUser;
}
