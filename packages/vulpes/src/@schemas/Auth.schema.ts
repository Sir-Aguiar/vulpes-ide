import { z as Zod } from "zod";

export const SignupSchema = Zod.object({
  name: Zod.string().min(3, "Nome deve ter ao menos 3 caracteres"),
  email: Zod.email("Email inválido"),
  password: Zod.string().min(6, "Senha deve ter ao menos 6 caracteres"),
  passwordConfirm: Zod.string().min(1, "Confirmação de senha é obrigatória"),
  institution: Zod.string().optional(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "As senhas não coincidem",
  path: ["passwordConfirm"],
});

export const LoginSchema = Zod.object({
  email: Zod.email("Email inválido"),
  password: Zod.string().min(1, "Senha é obrigatória"),
});

export type ISignupDTO = Zod.infer<typeof SignupSchema>;
export type ILoginDTO = Zod.infer<typeof LoginSchema>;
