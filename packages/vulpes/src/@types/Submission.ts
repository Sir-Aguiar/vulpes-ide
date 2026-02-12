import { IList } from "./List";

export interface ISubmission {
  submissionId: string;
  studentId: string;
  taskId: string;
  listId?: string;
  code: string;
  isCorrect: boolean;
  submittedAt: string;
  student: {
    name: string;
    email: string;
    institution: {
      institutionId: number;
      name: string;
    };
  };
  list: IList;
}
