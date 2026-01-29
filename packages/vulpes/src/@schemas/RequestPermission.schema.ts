import * as Zod from "zod";

export const CreateTeacherPermissionSchema = Zod.object({
  name: Zod.string().min(1, "Nome completo é obrigatório"),
  personalEmail: Zod.string().email("Email pessoal inválido").min(1, "Email pessoal é obrigatório"),
  institutionalEmail: Zod.string().email("Email institucional inválido").min(1, "Email institucional é obrigatório"),
  institution: Zod.string().min(1, "Instituição de ensino é obrigatória"),
  document: Zod.instanceof(File, { message: "Documento é obrigatório" }),
});

export type ICreateTeacherPermissionDTO = Zod.infer<
  typeof CreateTeacherPermissionSchema
>;
