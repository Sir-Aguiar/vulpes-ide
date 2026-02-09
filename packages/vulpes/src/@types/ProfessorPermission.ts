export type ProfessorPermissionRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export interface IProfessorPermissionRequest {
  professorPermissionRequestId: number;
  name: string;
  personalEmail: string;
  institutionalEmail: string;
  institutionId: number | null;
  requestFileUrl: string;
  requestStatus: ProfessorPermissionRequestStatus;
  createdAt: string;
  updatedAt: string;
  institution: any;
}
