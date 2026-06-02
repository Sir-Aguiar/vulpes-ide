import { z as Zod } from "zod";

export const SignupSchema = Zod.object({
  name: Zod.string().min(3, "Nome deve ter ao menos 3 caracteres"),
  email: Zod.email("Email inválido"),
  password: Zod.string().min(6, "Senha deve ter ao menos 6 caracteres"),
  passwordConfirm: Zod.string().min(1, "Confirmação de senha é obrigatória"),
  institutionId: Zod.number().optional(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "As senhas não coincidem",
  path: ["passwordConfirm"],
});

export const LoginSchema = Zod.object({
  email: Zod.email("Email inválido"),
  password: Zod.string().min(1, "Senha é obrigatória"),
});

export const ResetPasswordSchema = Zod.object({
  email: Zod.email("Email inválido"),
});

export const CompleteResetPasswordSchema = Zod.object({
  password: Zod.string().min(6, "Senha deve ter ao menos 6 caracteres"),
  passwordConfirm: Zod.string().min(1, "Confirmação de senha é obrigatória"),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "As senhas não coincidem",
  path: ["passwordConfirm"],
});

export type ISignupDTO = Zod.infer<typeof SignupSchema>;
export type ILoginDTO = Zod.infer<typeof LoginSchema>;
export type IResetPasswordDTO = Zod.infer<typeof ResetPasswordSchema>;
export type ICompleteResetPasswordDTO = Zod.infer<
  typeof CompleteResetPasswordSchema
>;

/** Resposta esperada de GET /auth/reset-password/validate-order */
export type ValidateResetPasswordOrderResponse = {
  orderId: string;
};
