import { ISubmission } from "./Submission";

export interface IList {
  listId: string;
  classId: string;
  title: string;
  deadline: string;
  submissionLimit?: number;
  createdAt: string;
  updatedAt: string;
  submissions: ISubmission[];
}
