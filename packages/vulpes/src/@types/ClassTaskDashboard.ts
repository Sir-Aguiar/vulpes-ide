export type SubmissionStatus = "NOT_SUBMITTED" | "CORRECT" | "INCORRECT";

export interface ClassTaskDashboardStudentRow {
  studentId: string;
  name: string;
  status: SubmissionStatus;
  submissionsCount: number;
  lastSubmissionId: string | null;
  // Serialized as ISO string over HTTP even though the backend types it as `Date`.
  lastSubmittedAt: string | null;
  professorComments: string | null;
  hasPendingFeedback: boolean;
}

export interface ClassTaskDashboardKpis {
  totalStudents: number;
  studentsWithSubmission: number;
  studentsWithoutSubmission: number;
  studentsCorrect: number;
  deliveryRate: number;
  accuracyRate: number;
  pendingFeedbackCount: number;
}

export interface ClassTaskDashboardData {
  kpis: ClassTaskDashboardKpis;
  students: ClassTaskDashboardStudentRow[];
}
