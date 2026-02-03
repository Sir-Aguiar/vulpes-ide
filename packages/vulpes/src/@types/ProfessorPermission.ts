export type ProfessorPermissionRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface IProfessorPermissionRequest {
  professorPermissionRequestId: number;
  name: string;
  personalEmail: string;
  institutionalEmail: string;
  institution: string;
  requestFileUrl: string;
  requestStatus: ProfessorPermissionRequestStatus;
  createdAt: string;
  updatedAt: string;
}
