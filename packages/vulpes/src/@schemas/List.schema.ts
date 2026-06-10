import * as Zod from "zod";

const datetimeString = (message: string) =>
  Zod.string()
    .min(1, message)
    .refine(
      (value) => !Number.isNaN(new Date(value).getTime()),
      "Data inválida",
    );

export const ListTaskFormSchema = Zod.object({
  taskId: Zod.string(),
  title: Zod.string(),
  weight: Zod.coerce
    .number()
    .min(0.1, "O peso deve ser no mínimo 0.1")
    .default(1),
});

export const CreateListFormSchema = Zod.object({
  title: Zod.string().min(1, "Informe o nome da lista"),
  deadline: datetimeString("Informe a data limite"),
  releaseDate: datetimeString("Informe a data de lançamento"),
  submissionLimit: Zod.coerce
    .number()
    .int()
    .min(1, "Mínimo de 1 envio")
    .default(1),
  selectedTasks: Zod.array(ListTaskFormSchema).default([]),
});

export type IListTaskFormItem = Zod.infer<typeof ListTaskFormSchema>;
export type ICreateListFormDTO = Zod.infer<typeof CreateListFormSchema>;

export interface ICreateListPayload {
  classId: string;
  title: string;
  deadline: string;
  releaseDate: string;
  submissionLimit: number;
  tasks: Array<{ taskId: string; weight: number }>;
}

export function toDatetimeLocalValue(date = new Date()) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

export function getCreateListDefaultValues(): ICreateListFormDTO {
  return {
    title: "",
    deadline: "",
    releaseDate: toDatetimeLocalValue(),
    submissionLimit: 1,
    selectedTasks: [],
  };
}

export function toCreateListPayload(
  classId: string,
  data: ICreateListFormDTO,
): ICreateListPayload {
  return {
    classId,
    title: data.title.trim(),
    deadline: new Date(data.deadline).toISOString(),
    releaseDate: new Date(data.releaseDate).toISOString(),
    submissionLimit: data.submissionLimit || 1,
    tasks: data.selectedTasks.map(({ taskId, weight }) => ({
      taskId,
      weight: weight ?? 1,
    })),
  };
}
