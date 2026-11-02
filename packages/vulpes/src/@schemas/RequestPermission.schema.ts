import * as Zod from "zod";

export const CreateTeacherPermissionSchema = Zod.object({
  name: Zod.string().min(1, "Nome completo é obrigatório"),
  personalEmail: Zod.email("Email pessoal inválido").min(
    1,
    "Email pessoal é obrigatório",
  ),
  institutionalEmail: Zod.email("Email institucional inválido").min(
    1,
    "Email institucional é obrigatório",
  ),
  institutionId: Zod.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined;
      }

      const parsed = typeof value === "number" ? value : Number(value);
      return Number.isNaN(parsed) ? value : parsed;
    },
    Zod.number({ error: "Instituição de ensino é obrigatória" }).min(
      1,
      "Instituição de ensino é obrigatória",
    ),
  ),
  document: Zod.instanceof(File, { message: "Documento é obrigatório" }),
});

export type ICreateTeacherPermissionDTO = Zod.infer<
  typeof CreateTeacherPermissionSchema
>;
