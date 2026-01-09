import { CreateTaskSchema } from "@/@schemas/Task.schema";
import * as Zod from "zod";

export type CreateTaskDTO = Zod.infer<typeof CreateTaskSchema>;
