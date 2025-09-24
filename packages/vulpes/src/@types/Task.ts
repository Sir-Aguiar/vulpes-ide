import { CreateTaskDTO } from "@/app/(task)/new-task/schemas/CreateTask.schema";

export interface ITestCase {
  input: string[];
  expectedOutput: string;
}

export interface ITask extends CreateTaskDTO {}
