import * as Zod from "zod";

export const CreateClassSchema = Zod.object({
  name: Zod.string().min(1, "Defina um nome para a turma"),
});

export const JoinClassByCodeSchema = Zod.object({
  code: Zod.string()
    .min(4, "Código deve ter 4 dígitos")
    .max(4, "Código deve ter 4 dígitos")
    .regex(/^\d{4}$/, "Código deve conter apenas números"),
  message: Zod.string().optional(),
});

export type ICreateClassDTO = Zod.infer<typeof CreateClassSchema>;
export type IJoinClassByCodeDTO = Zod.infer<typeof JoinClassByCodeSchema>;
