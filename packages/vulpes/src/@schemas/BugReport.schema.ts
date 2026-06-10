import { z } from "zod";

const optionalMultiline = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : undefined))
  .optional();

const screenshotFile = z
  .instanceof(File)
  .refine((file) => file.size <= 5 * 1024 * 1024, {
    message: "Cada imagem deve ter no máximo 5 MB",
  })
  .refine((file) => /^image\/(jpeg|png|webp|gif)$/.test(file.type), {
    message: "Formato inválido. Use JPEG, PNG, WebP ou GIF",
  });

export const BugReportSchema = z.object({
  path: z.string().trim().min(1, "Rota não identificada"),
  description: z.string().trim().min(1, "Informe a descrição do bug"),
  expectedBehavior: optionalMultiline,
  actualBehavior: optionalMultiline,
  stepsToReproduce: optionalMultiline,
  screenshots: z.array(screenshotFile).max(5).default([]),
});

export type IBugReportForm = z.infer<typeof BugReportSchema>;

export const UpdateBugReportSchema = z
  .object({
    status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
    severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  })
  .refine((data) => data.status !== undefined || data.severity !== undefined, {
    message: "Informe ao menos status ou prioridade para atualizar",
  });

export type IUpdateBugReportDTO = z.infer<typeof UpdateBugReportSchema>;
