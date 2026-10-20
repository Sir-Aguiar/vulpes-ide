export type SearchType = "tasks" | "lists";

export interface ISearchOption {
  id: string;
  title: string;
  /** Presente quando a opção é uma tarefa da turma. */
  classTaskId?: string;
}
