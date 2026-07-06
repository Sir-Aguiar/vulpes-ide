export type TaskAccessMode =
  | { mode: "task"; taskId: string }
  | { mode: "classTask"; classTaskId: string };

export function resolveAccessMode(
  params: URLSearchParams,
): TaskAccessMode | null {
  const taskId = params.get("taskId");
  if (taskId) return { mode: "task", taskId };

  const classTaskId = params.get("classTaskId");
  if (classTaskId) return { mode: "classTask", classTaskId };

  return null;
}

export function buildSubmissionPayload(
  access: TaskAccessMode,
  code: string,
  isCorrect: boolean,
): Record<string, unknown> {
  switch (access.mode) {
    case "task": {
      return { taskId: access.taskId, code, isCorrect };
    }
    case "classTask": {
      return { classTaskId: access.classTaskId, code, isCorrect };
    }
  }
}

export function resolveTaskEndpoint(access: TaskAccessMode): string {
  switch (access.mode) {
    case "task": {
      return `/task/${access.taskId}`;
    }
    case "classTask": {
      return `/class-task/${access.classTaskId}`;
    }
  }
}
