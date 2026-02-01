import { CreateTaskDTO } from "@/@dtos/Task";
import { IArrayVariableDeclaration } from "@/utils/code-formatter";

export interface ITestCase {
  testId: number;
  input: string[];
  expectedOutput: string;
}

export interface IExecutableTestCase extends ITestCase {
  arraysDeclarations: IArrayVariableDeclaration[];
}

export interface ITask extends CreateTaskDTO {
  taskTests: ITestCase[];
}

export interface ITaskListItem {
  taskId: string;
  title: string;
  description: string;
  creatorId: string;
  isPublic: boolean;
  isVisible: boolean;
  createdAt: string;
}

export interface IGetTasksResponse {
  tasks: ITaskListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
