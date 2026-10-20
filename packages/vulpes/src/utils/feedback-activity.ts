interface IFeedbackTaskRef {
  taskId: string;
  title: string;
}

export interface IFeedbackActivity {
  submissionId: string;
  taskId?: string | null;
  classTaskId?: string | null;
  classTaskListId?: string | null;
  task?: IFeedbackTaskRef | null;
  classTask?: { task?: IFeedbackTaskRef | null } | null;
  classTaskList?: {
    listId?: string | null;
    classTask?: { task?: IFeedbackTaskRef | null } | null;
  } | null;
}

export function getFeedbackActivityId(feedback: IFeedbackActivity) {
  return (
    feedback.taskId ||
    feedback.classTaskId ||
    feedback.classTaskListId ||
    feedback.submissionId
  );
}

export function getFeedbackTitle(feedback: IFeedbackActivity) {
  return (
    feedback.task?.title ||
    feedback.classTask?.task?.title ||
    feedback.classTaskList?.classTask?.task?.title ||
    "Atividade sem título"
  );
}

export function getFeedbackRetryHref(feedback: IFeedbackActivity) {
  if (feedback.taskId) return `/task?taskId=${feedback.taskId}`;
  if (feedback.classTaskId) return `/task?classTaskId=${feedback.classTaskId}`;
  if (feedback.classTaskList?.listId) {
    return `/list/${feedback.classTaskList.listId}`;
  }
  return null;
}
