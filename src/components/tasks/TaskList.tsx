import type { FormEvent } from "react";
import {
  CalendarClock,
  Check,
  CheckCircle2,
  Edit3,
  ListChecks,
  Save,
  Trash2,
  X,
} from "lucide-react";

import {
  fieldClassName,
  iconButtonClassName,
  panelClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
  textareaClassName,
} from "../../shared/ui.ts";
import type { Task, TaskUpdate } from "../../types/task.ts";
import { DatePickerField } from "../ui/DatePickerField.tsx";
import { TAG_OPTIONS } from "./task-options.ts";

interface TaskListProps {
  activeTasks: Task[];
  completedTasks: Task[];
  editDraft: TaskUpdate;
  editingTaskId: string | null;
  loading: boolean;
  saving: boolean;
  onComplete: (taskId: string) => void;
  onEditDraftChange: (draft: TaskUpdate) => void;
  onOpenEditor: (task: Task) => void;
  onRemove: (taskId: string) => void;
  onUpdate: (event: FormEvent<HTMLFormElement>, taskId: string) => void;
  onCloseEditor: () => void;
  onRefresh: () => void;
}

export function TaskList({
  activeTasks,
  completedTasks,
  editDraft,
  editingTaskId,
  loading,
  saving,
  onComplete,
  onEditDraftChange,
  onOpenEditor,
  onRemove,
  onUpdate,
  onCloseEditor,
  onRefresh,
}: TaskListProps) {
  return (
    <section className={`${panelClassName} min-h-96 overflow-hidden`}>
      <div className="flex items-center justify-between border-b border-[var(--app-border)] bg-[var(--app-surface-muted)] px-4 py-3">
        <div>
          <h2 className="text-base font-bold text-[var(--app-text)]">任务列表</h2>
          <p className="mt-0.5 text-xs text-[var(--app-text-muted)]">未完成优先展示</p>
        </div>
        <button
          className={iconButtonClassName}
          onClick={onRefresh}
          title="刷新"
          type="button"
        >
          <ListChecks className="h-4 w-4" />
        </button>
      </div>

      {loading ? (
        <div className="px-5 py-16 text-center text-sm font-semibold text-[var(--app-text-muted)]">
          正在读取本地缓存
        </div>
      ) : activeTasks.length ? (
        <div className="divide-y divide-[var(--app-border)]">
          {activeTasks.map((task) => (
            <article
              className="grid gap-4 px-4 py-3 transition hover:bg-[var(--app-surface-hover)] sm:grid-cols-[1fr_auto] sm:items-start"
              key={task.id}
            >
              {editingTaskId === task.id ? (
                <form
                  className="min-w-0 sm:col-span-2"
                  onSubmit={(event) => onUpdate(event, task.id)}
                >
                  <div className="grid gap-3">
                    <input
                      aria-label="编辑任务名称"
                      className={fieldClassName}
                      onChange={(event) => {
                        const { value } = event.currentTarget;
                        onEditDraftChange({ ...editDraft, name: value });
                      }}
                      value={editDraft.name}
                    />
                    <textarea
                      aria-label="编辑任务说明"
                      className={textareaClassName}
                      onChange={(event) => {
                        const { value } = event.currentTarget;
                        onEditDraftChange({ ...editDraft, info: value });
                      }}
                      value={editDraft.info}
                    />
                    <div className="grid gap-3 sm:grid-cols-[1fr_190px_auto] sm:items-center">
                      <select
                        aria-label="编辑任务分类"
                        className={fieldClassName}
                        onChange={(event) => {
                          const { value } = event.currentTarget;
                          onEditDraftChange({ ...editDraft, tag: value });
                        }}
                        value={editDraft.tag}
                      >
                        {TAG_OPTIONS.map((tag) => (
                          <option key={tag.value} value={tag.value}>
                            {tag.label}
                          </option>
                        ))}
                      </select>
                      <DatePickerField
                        label="编辑任务截止日期"
                        onChange={(value) =>
                          onEditDraftChange({ ...editDraft, endDate: value })
                        }
                        value={editDraft.endDate}
                      />
                      <div className="flex items-center gap-2">
                        <button
                          className={primaryButtonClassName}
                          disabled={saving || !editDraft.name.trim()}
                          type="submit"
                        >
                          <Save className="h-4 w-4" />
                          保存
                        </button>
                        <button
                          className={iconButtonClassName}
                          onClick={onCloseEditor}
                          title="取消"
                          type="button"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                <>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      {task.tag ? (
                        <span
                          className="h-2.5 w-2.5 rounded-full ring-4 ring-[var(--app-nav-active)]"
                          style={{ backgroundColor: task.tag }}
                        />
                      ) : null}
                      <h3 className="break-words text-sm font-bold text-[var(--app-text)]">
                        {task.name}
                      </h3>
                    </div>
                    {task.info.trim() ? (
                      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[var(--app-text-secondary)]">
                        {task.info}
                      </p>
                    ) : null}
                    {task.endDate ? (
                      <p className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700">
                        <CalendarClock className="h-3.5 w-3.5" />
                        截止 {task.endDate}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <button
                      className={secondaryButtonClassName}
                      onClick={() => onOpenEditor(task)}
                      type="button"
                    >
                      <Edit3 className="h-4 w-4" />
                      编辑
                    </button>
                    <button
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-emerald-200 bg-white px-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                      onClick={() => onComplete(task.id)}
                      type="button"
                    >
                      <Check className="h-4 w-4" />
                      完成
                    </button>
                    <button
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      onClick={() => onRemove(task.id)}
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                      删除
                    </button>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="px-5 py-16 text-center">
          <ListChecks className="mx-auto h-8 w-8 text-[var(--app-text-muted)]" />
          <p className="mt-3 text-sm font-semibold text-[var(--app-text-muted)]">
            暂无任务
          </p>
        </div>
      )}

      {completedTasks.length ? (
        <div className="border-t border-[var(--app-border)] bg-[var(--app-surface-muted)]">
          <div className="px-4 py-3">
            <h2 className="text-base font-bold text-[var(--app-text)]">已完成任务</h2>
          </div>
          <div className="divide-y divide-[var(--app-border)] border-t border-[var(--app-border)] bg-white">
            {completedTasks.map((task) => (
              <article
                className="grid gap-4 px-4 py-3 transition hover:bg-[var(--app-surface-hover)] sm:grid-cols-[1fr_auto] sm:items-start"
                key={task.id}
              >
                <div className="min-w-0 opacity-75">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[var(--app-accent)]" />
                    <h3 className="break-words text-sm font-bold text-[var(--app-text)]">
                      {task.name}
                    </h3>
                  </div>
                  {task.info.trim() ? (
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[var(--app-text-secondary)]">
                      {task.info}
                    </p>
                  ) : null}
                </div>
                <button
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  onClick={() => onRemove(task.id)}
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                  删除
                </button>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
