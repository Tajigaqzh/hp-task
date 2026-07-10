export interface Task {
  id: string;
  name: string;
  info: string;
  tag?: string | null;
  endDate?: string | null;
  createdAt: number;
}

export interface TaskDraft {
  name: string;
  info: string;
  tag?: string;
  endDate?: string;
}
