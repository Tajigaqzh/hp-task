import type { FormEvent } from "react";
import { useState } from "react";
import {
  CalendarClock,
  CalendarPlus,
  Check,
  CheckCircle2,
  ListTodo,
  RotateCcw,
  Save,
  Settings2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { DatePickerField } from "../../components/ui/DatePickerField.tsx";
import type { Task, TaskUpdate } from "../../types/task.ts";
import { formatTaskDate, getTaskDateClass } from "./desktop-widget-utils.ts";

interface DesktopWidgetTaskListProps {
  activeTasks: Task[];
  completedTasks: Task[];
  loading: boolean;
  saving: boolean;
  onComplete: (taskId: string) => Promise<void>;
  onReopen: (taskId: string) => Promise<void>;
  onUpdate: (taskId: string, update: TaskUpdate) => Promise<void>;
}

type EditorMode = "edit" | "delay";

interface TaskFormState {
  name: string;
  info: string;
  tag?: string;
  endDate: string;
}

function toTaskFormState(task: Task): TaskFormState {
  return {
    name: task.name,
    info: task.info,
    tag: task.tag ?? undefined,
    endDate: task.endDate ?? "",
  };
}

export function DesktopWidgetTaskList({
  activeTasks,
  completedTasks,
  loading,
  saving,
  onComplete,
  onReopen,
  onUpdate,
}: DesktopWidgetTaskListProps) {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<EditorMode>("edit");
  const [form, setForm] = useState<TaskFormState>({
    name: "",
    info: "",
    endDate: "",
  });

  function openEditor(task: Task, mode: EditorMode) {
    setEditingTaskId(task.id);
    setEditorMode(mode);
    setForm(toTaskFormState(task));
  }

  function closeEditor() {
    setEditingTaskId(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>, task: Task) {
    event.preventDefault();

    const nextName = editorMode === "delay" ? task.name : form.name.trim();
    const nextInfo = editorMode === "delay" ? task.info : form.info.trim();

    if (!nextName || !form.endDate) {
      return;
    }

    await onUpdate(task.id, {
      name: nextName,
      info: nextInfo,
      tag: task.tag ?? undefined,
      endDate: form.endDate,
    });
    closeEditor();
  }

  function renderTask(task: Task, index: number, isCompleted: boolean) {
    return (
      <motion.article
        animate={{ opacity: 1, x: 0 }}
        className={`rounded-lg border px-3 py-2.5 shadow-sm shadow-[#0f2326]/10 transition hover:border-white/20 ${
          isCompleted
            ? "border-emerald-100/10 bg-white/[0.045] hover:bg-white/[0.07]"
            : "border-white/10 bg-white/[0.08] hover:bg-white/[0.12]"
        }`}
        exit={{ opacity: 0, x: 12 }}
        initial={{ opacity: 0, x: -12 }}
        key={task.id}
        transition={{ delay: index * 0.04, duration: 0.2 }}
      >
        <div className="flex items-start gap-2">
          {task.tag ? (
            <span
              className={`mt-1 h-8 w-1.5 shrink-0 rounded-full shadow-sm shadow-black/20 ${
                isCompleted ? "opacity-45" : ""
              }`}
              style={{ backgroundColor: task.tag }}
            />
          ) : null}
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <h2
                className={`min-w-0 flex-1 truncate text-sm font-semibold ${
                  isCompleted ? "text-white/50 line-through" : "text-white"
                }`}
              >
                {task.name}
              </h2>
              <span
                className={`inline-flex h-5 shrink-0 items-center gap-1 rounded-full border px-2 text-[10px] font-semibold ${
                  isCompleted
                    ? "border-emerald-100/20 bg-emerald-100/10 text-emerald-50"
                    : "border-amber-100/20 bg-amber-100/10 text-amber-50"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <ListTodo className="h-3 w-3" />
                )}
                {isCompleted ? "已完成" : "未完成"}
              </span>
            </div>
            <p
              className={`mt-0.5 line-clamp-2 text-xs leading-5 ${
                isCompleted ? "text-white/38" : "text-white/62"
              }`}
            >
              {task.info}
            </p>
          </div>
        </div>

        <p
          className={`mt-2 flex items-center gap-1.5 text-[11px] font-semibold ${
            isCompleted ? "text-white/35" : getTaskDateClass(task.endDate)
          }`}
        >
          <CalendarClock className="h-3 w-3" />
          {formatTaskDate(task.endDate)}
        </p>

        <div className={`mt-2 grid gap-1 ${isCompleted ? "grid-cols-2" : "grid-cols-3"}`}>
          <button
            className="grid h-8 place-items-center rounded-md border border-white/10 bg-white/[0.08] text-white/70 transition hover:bg-white/[0.14] hover:text-white"
            onClick={() => openEditor(task, "edit")}
            title="设置"
            type="button"
          >
            <Settings2 className="h-3.5 w-3.5" />
          </button>

          {isCompleted ? (
            <button
              className="grid h-8 place-items-center rounded-md border border-amber-100/20 bg-amber-100/10 text-amber-50 transition hover:bg-amber-100/20 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={saving}
              onClick={() => void onReopen(task.id)}
              title="移回未完成"
              type="button"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          ) : (
            <>
              <button
                className="grid h-8 place-items-center rounded-md border border-emerald-100/20 bg-emerald-100/10 text-emerald-50 transition hover:bg-emerald-100/20 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={saving}
                onClick={() => void onComplete(task.id)}
                title="完成"
                type="button"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
              </button>
              <button
                className="grid h-8 place-items-center rounded-md border border-amber-100/20 bg-amber-100/10 text-amber-50 transition hover:bg-amber-100/20"
                onClick={() => openEditor(task, "delay")}
                title="延后"
                type="button"
              >
                <CalendarPlus className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>

        {editingTaskId === task.id ? (
          <form
            className="mt-2 rounded-lg border border-white/10 bg-black/10 p-2"
            onSubmit={(event) => void handleSubmit(event, task)}
          >
            {editorMode === "edit" ? (
              <div className="grid gap-2">
                <input
                  className="h-8 rounded-md border border-white/10 bg-white/[0.08] px-2 text-xs font-semibold text-white outline-none placeholder:text-white/35 focus:border-[#8fc8bd]"
                  onChange={(event) => {
                    const { value } = event.currentTarget;

                    setForm((current) => ({
                      ...current,
                      name: value,
                    }));
                  }}
                  placeholder="名称"
                  required
                  value={form.name}
                />
                <textarea
                  className="min-h-16 resize-none rounded-md border border-white/10 bg-white/[0.08] px-2 py-1.5 text-xs leading-5 text-white outline-none placeholder:text-white/35 focus:border-[#8fc8bd]"
                  onChange={(event) => {
                    const { value } = event.currentTarget;

                    setForm((current) => ({
                      ...current,
                      info: value,
                    }));
                  }}
                  placeholder="说明"
                  value={form.info}
                />
              </div>
            ) : null}
            <div className="mt-2 flex items-center gap-1">
              <DatePickerField
                className="min-w-0 flex-1"
                label="编辑任务截止日期"
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    endDate: value,
                  }))
                }
                required
                value={form.endDate}
              />
              <button
                className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[#8fc8bd] text-[#10292c] transition hover:bg-[#a6d8cf] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={saving}
                title="保存"
                type="submit"
              >
                {editorMode === "delay" ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
              </button>
              <button
                className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-white/10 text-white/65 transition hover:bg-white/10 hover:text-white"
                onClick={closeEditor}
                title="取消"
                type="button"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        ) : null}
      </motion.article>
    );
  }

  if (loading) {
    return (
      <motion.div
        animate={{ opacity: 1 }}
        className="rounded-lg border border-white/10 bg-white/[0.08] px-3 py-8 text-center text-sm font-semibold text-white/65"
        initial={{ opacity: 0 }}
      >
        正在读取
      </motion.div>
    );
  }

  if (!activeTasks.length && !completedTasks.length) {
    return (
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-white/10 bg-white/[0.08] px-3 py-8 text-center text-sm font-semibold text-white/65"
        initial={{ opacity: 0, y: 8 }}
      >
        <ListTodo className="mx-auto mb-2 h-5 w-5 text-[#8fc8bd]" />
        暂无任务
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {activeTasks.length ? (
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-semibold text-white/72">未完成</h2>
            <span className="text-[11px] font-semibold text-white/45">
              {activeTasks.length}
            </span>
          </div>
          <AnimatePresence mode="popLayout">
            {activeTasks.map((task, index) => renderTask(task, index, false))}
          </AnimatePresence>
        </section>
      ) : null}

      {completedTasks.length ? (
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-semibold text-emerald-50/72">已完成</h2>
            <span className="text-[11px] font-semibold text-emerald-50/45">
              {completedTasks.length}
            </span>
          </div>
          <AnimatePresence mode="popLayout">
            {completedTasks.map((task, index) => renderTask(task, index, true))}
          </AnimatePresence>
        </section>
      ) : null}
    </div>
  );
}
