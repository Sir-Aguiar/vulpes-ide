import * as Zod from "zod";

export const UpdateUserSchema = Zod.object({
  name: Zod.string().min(3, "Nome deve ter ao menos 3 caracteres"),
  email: Zod.email("Email inválido"),
});

export const EDITOR_THEMES = [
  "vs-dark",
  "vs",
  "portugol-dark",
  "portugol-light",
] as const;

export const UserPreferencesSchema = Zod.object({
  editorTheme: Zod.enum(EDITOR_THEMES),
  editorFontSize: Zod.number()
    .int("O tamanho da fonte deve ser um inteiro")
    .min(8, "O tamanho da fonte deve ser no mínimo 8")
    .max(32, "O tamanho da fonte deve ser no máximo 32"),
  editorWordWrap: Zod.boolean(),
  adminNotifyBugReport: Zod.boolean(),
});

export const ChangePasswordSchema = Zod.object({
  currentPassword: Zod.string().min(1, "Senha atual é obrigatória"),
  password: Zod.string().min(6, "Senha deve ter ao menos 6 caracteres"),
  passwordConfirm: Zod.string().min(1, "Confirmação de senha é obrigatória"),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "As senhas não coincidem",
  path: ["passwordConfirm"],
});
