import { invoke } from "@tauri-apps/api/core";
import { create } from "zustand";

import type { Task, TaskDraft } from "../types/task";

interface TaskState {
  tasks: Task[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  loadTasks: () => Promise<void>;
  addTask: (draft: TaskDraft) => Promise<void>;
  removeTask: (taskId: string) => Promise<void>;
  clearError: () => void;
}

function toErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  saving: false,
  error: null,

  async loadTasks() {
    set({ loading: true, error: null });

    try {
      const tasks = await invoke<Task[]>("list_tasks");
      set({ tasks, loading: false });
    } catch (error) {
      set({ error: toErrorMessage(error), loading: false });
    }
  },

  async addTask(draft) {
    set({ saving: true, error: null });

    try {
      const task = await invoke<Task>("add_task", { draft });
      set({ tasks: [...get().tasks, task], saving: false });
    } catch (error) {
      set({ error: toErrorMessage(error), saving: false });
    }
  },

  async removeTask(taskId) {
    set({ error: null });

    try {
      const removed = await invoke<boolean>("remove_task", { taskId });

      if (removed) {
        set({ tasks: get().tasks.filter((task) => task.id !== taskId) });
      }
    } catch (error) {
      set({ error: toErrorMessage(error) });
    }
  },

  clearError() {
    set({ error: null });
  },
}));
