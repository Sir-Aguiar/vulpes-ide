import { CreateTaskSchema } from "@/@schemas/CreateTask.schema";
import * as Zod from "zod";

export type CreateTaskDTO = Zod.infer<typeof CreateTaskSchema>;
