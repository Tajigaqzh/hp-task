import { invoke } from "@tauri-apps/api/core";
import { create } from "zustand";

import type { Task, TaskDraft, TaskUpdate } from "../types/task";

interface TaskState {
  tasks: Task[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  loadTasks: () => Promise<void>;
  addTask: (draft: TaskDraft) => Promise<void>;
  updateTask: (taskId: string, update: TaskUpdate) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  reopenTask: (taskId: string) => Promise<void>;
  removeTask: (taskId: string) => Promise<void>;
  clearError: () => void;
}

function toErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function areTasksEqual(left: Task[], right: Task[]) {
  return JSON.stringify(left) === JSON.stringify(right);
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  saving: false,
  error: null,

  async loadTasks() {
    if (!get().tasks.length && !get().loading) {
      set({ loading: true, error: null });
    }

    try {
      const tasks = await invoke<Task[]>("list_tasks");
      set((state) => {
        const tasksChanged = !areTasksEqual(state.tasks, tasks);

        if (!tasksChanged && !state.loading && state.error === null) {
          return state;
        }

        return {
          tasks: tasksChanged ? tasks : state.tasks,
          loading: false,
          error: null,
        };
      });
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

  async updateTask(taskId, update) {
    set({ saving: true, error: null });

    try {
      const task = await invoke<Task | null>("update_task", { taskId, update });

      if (task) {
        set({
          tasks: get().tasks.map((current) => (current.id === task.id ? task : current)),
          saving: false,
        });
      } else {
        set({ saving: false });
      }
    } catch (error) {
      set({ error: toErrorMessage(error), saving: false });
    }
  },

  async completeTask(taskId) {
    set({ error: null });

    try {
      const task = await invoke<Task | null>("complete_task", { taskId });

      if (task) {
        set({
          tasks: get().tasks.map((current) => (current.id === task.id ? task : current)),
        });
      }
    } catch (error) {
      set({ error: toErrorMessage(error) });
    }
  },

  async reopenTask(taskId) {
    set({ error: null });

    try {
      const task = await invoke<Task | null>("reopen_task", { taskId });

      if (task) {
        set({
          tasks: get().tasks.map((current) => (current.id === task.id ? task : current)),
        });
      }
    } catch (error) {
      set({ error: toErrorMessage(error) });
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
