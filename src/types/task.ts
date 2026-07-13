export interface Task {
  id: string;
  name: string;
  info: string;
  tag?: string | null;
  endDate?: string | null;
  createdAt: number;
  completedAt?: number | null;
}

export interface TaskDraft {
  name: string;
  info: string;
  tag?: string;
  endDate?: string;
}

export type TaskUpdate = TaskDraft;
