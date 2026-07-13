import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

import { TaskCreateForm } from "../components/tasks/TaskCreateForm.tsx";
import { TAG_OPTIONS } from "../components/tasks/task-options.ts";
import { TaskList } from "../components/tasks/TaskList.tsx";
import { TaskStats } from "../components/tasks/TaskStats.tsx";
import { useTaskSync } from "../hooks/use-task-sync.ts";
import { useTaskStore } from "../stores/task-store.ts";
import type { Task, TaskDraft, TaskUpdate } from "../types/task.ts";
import { getTodayDateInputValue } from "../utils/task-date.ts";

export function TaskPage() {
  const {
    tasks,
    loading,
    saving,
    error,
    loadTasks,
    addTask,
    updateTask,
    completeTask,
    removeTask,
  } = useTaskStore();
  const [draft, setDraft] = useState<TaskDraft>(() => ({
    name: "",
    info: "",
    tag: TAG_OPTIONS[0].value,
    endDate: getTodayDateInputValue(),
  }));
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<TaskUpdate>({
    name: "",
    info: "",
    tag: TAG_OPTIONS[0].value,
    endDate: getTodayDateInputValue(),
  });

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);
  useTaskSync(loadTasks);

  const activeTasks = useMemo(
    () =>
      tasks
        .filter((task) => !task.completedAt)
        .sort((left, right) => right.createdAt - left.createdAt),
    [tasks],
  );
  const completedTasks = useMemo(
    () =>
      tasks
        .filter((task) => task.completedAt)
        .sort((left, right) => (right.completedAt ?? 0) - (left.completedAt ?? 0)),
    [tasks],
  );
  const datedTaskCount = useMemo(
    () => activeTasks.filter((task) => Boolean(task.endDate)).length,
    [activeTasks],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const endDate = draft.endDate || getTodayDateInputValue();
    const name = draft.name.trim();

    if (!name || !endDate) {
      return;
    }

    await addTask({
      name,
      info: draft.info.trim(),
      tag: draft.tag,
      endDate,
    });

    setDraft({
      name: "",
      info: "",
      tag: draft.tag,
      endDate: getTodayDateInputValue(),
    });
  }

  function openEditor(task: Task) {
    setEditingTaskId(task.id);
    setEditDraft({
      name: task.name,
      info: task.info,
      tag: task.tag ?? TAG_OPTIONS[0].value,
      endDate: task.endDate ?? getTodayDateInputValue(),
    });
  }

  function closeEditor() {
    setEditingTaskId(null);
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>, taskId: string) {
    event.preventDefault();

    const name = editDraft.name.trim();
    const endDate = editDraft.endDate || getTodayDateInputValue();

    if (!name || !endDate) {
      return;
    }

    await updateTask(taskId, {
      name,
      info: editDraft.info.trim(),
      tag: editDraft.tag,
      endDate,
    });
    closeEditor();
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-4">
      <TaskStats
        activeCount={activeTasks.length}
        completedCount={completedTasks.length}
        datedCount={datedTaskCount}
      />

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-[340px_1fr]">
        <TaskCreateForm
          draft={draft}
          onChange={setDraft}
          onSubmit={handleSubmit}
          saving={saving}
        />
        <TaskList
          activeTasks={activeTasks}
          completedTasks={completedTasks}
          editDraft={editDraft}
          editingTaskId={editingTaskId}
          loading={loading}
          onCloseEditor={closeEditor}
          onComplete={(taskId) => void completeTask(taskId)}
          onEditDraftChange={setEditDraft}
          onOpenEditor={openEditor}
          onRefresh={() => void loadTasks()}
          onRemove={(taskId) => void removeTask(taskId)}
          onUpdate={(event, taskId) => void handleUpdate(event, taskId)}
          saving={saving}
        />
      </section>
    </div>
  );
}
