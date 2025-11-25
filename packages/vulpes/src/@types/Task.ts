import { CreateTaskDTO } from "@/app/(task)/new-task/schemas/CreateTask.schema";
import { IArrayVariableDeclaration } from "@/utils/code-formatter";

export interface ITestCase {
  id: number;
  input: string[];
  expectedOutput: string;
}

export interface IExecutableTestCase extends ITestCase {
  arraysDeclarations: IArrayVariableDeclaration[];
}

export interface ITask extends CreateTaskDTO {
  testCases: ITestCase[];
}
