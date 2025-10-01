import * as Zod from "zod";

export const CodeTestSchema = Zod.array(
  Zod.object({
    input: Zod.array(Zod.string()).min(1, "Defina ao menos uma entrada"),
    expectedOutput: Zod.string().min(1, "Defina uma saída esperada"),
  }),
).min(1, "Adicione ao menos um caso de teste");

export const CreateTaskSchema = Zod.object({
  title: Zod.string().min(1, "Defina um título"),
  description: Zod.string().min(1, "Defina uma descrição"),
  functionDef: Zod.string().min(1, "Defina a assinatura da função"),
  inputPattern: Zod.string(),
  isVisible: Zod.boolean().default(true),
  templateCode: Zod.string().optional(),
});

export type CreateTaskDTO = Zod.infer<typeof CreateTaskSchema>;
