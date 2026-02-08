import { IArrayVariableDeclaration } from "@/utils/code-formatter";

export interface ITestCase {
  testId: number;
  input: string[];
  expectedOutput: string;
}

export interface IExecutableTestCase extends ITestCase {
  arraysDeclarations: IArrayVariableDeclaration[];
}

export interface ITaskParam {
  paramId: string;
  name: string;
  type: string;
  isArray: boolean;
}

export interface ITaskTest {
  testId: string;
  input: string[];
  expectedOutput: string;
  expectedOutputType: string;
}

export interface ITask {
  taskId: string;
  title: string;
  description: string;
  functionDef: string;
  inputMode: "PARAM" | "LEIA";
  isVisible: boolean;
  isPublic: boolean;
  creatorId: string;
  taskParams: ITaskParam[];
  taskTests: ITestCase[];
  createdAt: string;
  updatedAt: string;
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
