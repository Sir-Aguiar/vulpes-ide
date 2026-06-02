import * as Zod from "zod";

export const UpdateUserSchema = Zod.object({
  name: Zod.string().min(3, "Nome deve ter ao menos 3 caracteres"),
  email: Zod.email("Email inválido"),
});

export const ChangePasswordSchema = Zod.object({
  currentPassword: Zod.string().min(1, "Senha atual é obrigatória"),
  password: Zod.string().min(6, "Senha deve ter ao menos 6 caracteres"),
  passwordConfirm: Zod.string().min(1, "Confirmação de senha é obrigatória"),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "As senhas não coincidem",
  path: ["passwordConfirm"],
});
