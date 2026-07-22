import { IList } from "./List";

export interface ISubmission {
  submissionId: string;
  studentId: string;
  /** No create: exatamente um entre taskId | classTaskId | classTaskListId */
  taskId?: string;
  classTaskId?: string;
  classTaskListId?: string;
  code: string;
  isCorrect: boolean;
  professorComments?: string;
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
