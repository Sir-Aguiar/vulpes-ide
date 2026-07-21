export interface IMyClassTaskItem {
  classTaskId: string;
  taskId: string;
  createdAt: string;
  task: {
    taskId: string;
    title: string;
    description: string;
    creator: {
      userId: string;
      name: string;
    };
  };
}

export interface IMyTasksClassSection {
  class: {
    classId: string;
    name: string;
    code: number;
  };
  tasks: IMyClassTaskItem[];
  totalTasks: number;
  hasMore: boolean;
}

export interface IMyTasksResponse {
  classes: IMyTasksClassSection[];
}
