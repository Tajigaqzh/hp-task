import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  Check,
  CheckCircle2,
  Edit3,
  ListChecks,
  Plus,
  RefreshCw,
  Save,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useTaskSync } from "../hooks/use-task-sync.ts";
import { useTaskStore } from "../stores/task-store.ts";
import type { Task, TaskDraft, TaskUpdate } from "../types/task.ts";

const TAG_OPTIONS = [
  { label: "工作", value: "#2563eb" },
  { label: "生活", value: "#16a34a" },
  { label: "紧急", value: "#dc2626" },
  { label: "想法", value: "#7c3aed" },
] as const;

function getTodayDateInputValue() {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);

  return localDate.toISOString().slice(0, 10);
}

export function MainWindow() {
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
  const completedTaskCount = useMemo(
    () => tasks.filter((task) => Boolean(task.completedAt)).length,
    [tasks],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const endDate = draft.endDate || getTodayDateInputValue();

    if (!draft.name.trim() || !endDate) {
      return;
    }

    await addTask({
      name: draft.name.trim(),
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
    <main className="min-h-screen bg-[#edf3f1] text-[#162427]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-5 py-6 sm:px-8">
        <header className="rounded-lg border border-[#d4dedb] bg-white/90 px-5 py-4 shadow-sm shadow-[#17312e]/5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase text-[#66807b]">HP Task</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-normal text-[#13282b] sm:text-3xl">
                本地任务管理
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 rounded-lg border border-[#d4dedb] bg-[#f7faf9] px-3 py-2">
                <ListChecks className="h-4 w-4 text-[#2f6f63]" />
                <span className="text-sm font-medium text-[#48635f]">
                  未完成
                  <span className="ml-1 font-semibold text-[#13282b]">
                    {activeTasks.length}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-[#d4dedb] bg-[#f7faf9] px-3 py-2">
                <CalendarClock className="h-4 w-4 text-[#b15c36]" />
                <span className="text-sm font-medium text-[#48635f]">
                  有截止
                  <span className="ml-1 font-semibold text-[#13282b]">
                    {datedTaskCount}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-[#d4dedb] bg-[#f7faf9] px-3 py-2">
                <CheckCircle2 className="h-4 w-4 text-[#2f6f63]" />
                <span className="text-sm font-medium text-[#48635f]">
                  已完成
                  <span className="ml-1 font-semibold text-[#13282b]">
                    {completedTaskCount}
                  </span>
                </span>
              </div>
              <Link
                aria-label="设置"
                className="grid h-10 w-10 place-items-center rounded-lg border border-[#cbd9d5] bg-white text-[#48635f] transition hover:border-[#9fb3ae] hover:bg-[#f2f7f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f6f63]/20"
                title="设置"
                to="/settings"
              >
                <Settings className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </header>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}

        <section className="grid gap-5 lg:grid-cols-[360px_1fr]">
          <form
            className="flex flex-col gap-4 rounded-lg border border-[#d4dedb] bg-white p-5 shadow-sm shadow-[#17312e]/5"
            onSubmit={handleSubmit}
          >
            <div className="border-b border-[#edf2f0] pb-4">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#e2f0ec] text-[#2f6f63]">
                  <Plus className="h-4 w-4" />
                </span>
                <h2 className="text-lg font-semibold text-[#13282b]">新增任务</h2>
              </div>
              <p className="mt-2 text-sm leading-6 text-[#667a76]">
                数据通过 Tauri 写入本机缓存文件。
              </p>
            </div>

            <label className="flex flex-col gap-2 text-sm font-semibold text-[#344f4b]">
              <span>名称</span>
              <input
                className="h-10 rounded-lg border border-[#cbd9d5] bg-[#fbfdfc] px-3 text-[#13282b] outline-none transition placeholder:text-[#8da09c] hover:border-[#aebfba] focus:border-[#2f6f63] focus:bg-white focus:ring-2 focus:ring-[#2f6f63]/15"
                onChange={(event) => {
                  const { value } = event.currentTarget;

                  setDraft((current) => ({
                    ...current,
                    name: value,
                  }));
                }}
                placeholder="例如：整理今日计划"
                value={draft.name}
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-semibold text-[#344f4b]">
              <span>说明</span>
              <textarea
                className="min-h-28 resize-none rounded-lg border border-[#cbd9d5] bg-[#fbfdfc] px-3 py-2.5 leading-6 text-[#13282b] outline-none transition placeholder:text-[#8da09c] hover:border-[#aebfba] focus:border-[#2f6f63] focus:bg-white focus:ring-2 focus:ring-[#2f6f63]/15"
                onChange={(event) => {
                  const { value } = event.currentTarget;

                  setDraft((current) => ({
                    ...current,
                    info: value,
                  }));
                }}
                placeholder="补充任务背景、执行事项或验收标准"
                value={draft.info}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <label className="flex flex-col gap-2 text-sm font-semibold text-[#344f4b]">
                <span>分类</span>
                <select
                  className="h-10 rounded-lg border border-[#cbd9d5] bg-[#fbfdfc] px-3 text-[#13282b] outline-none transition hover:border-[#aebfba] focus:border-[#2f6f63] focus:bg-white focus:ring-2 focus:ring-[#2f6f63]/15"
                  onChange={(event) => {
                    const { value } = event.currentTarget;

                    setDraft((current) => ({
                      ...current,
                      tag: value,
                    }));
                  }}
                  value={draft.tag}
                >
                  {TAG_OPTIONS.map((tag) => (
                    <option key={tag.value} value={tag.value}>
                      {tag.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-semibold text-[#344f4b]">
                <span className="flex items-center justify-between gap-2">
                  截止日期
                  <span className="text-xs font-medium text-[#7c8f8b]">必填</span>
                </span>
                <input
                  className="h-10 rounded-lg border border-[#cbd9d5] bg-[#fbfdfc] px-3 text-[#13282b] outline-none transition hover:border-[#aebfba] focus:border-[#2f6f63] focus:bg-white focus:ring-2 focus:ring-[#2f6f63]/15"
                  onChange={(event) => {
                    const { value } = event.currentTarget;

                    setDraft((current) => ({
                      ...current,
                      endDate: value,
                    }));
                  }}
                  required
                  type="date"
                  value={draft.endDate}
                />
              </label>
            </div>

            <button
              className="mt-1 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#173b3f] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#23545a] disabled:cursor-not-allowed disabled:bg-[#a8b8b4]"
              disabled={saving || !draft.name.trim() || !draft.endDate}
              type="submit"
            >
              <Plus className="h-4 w-4" />
              {saving ? "保存中" : "保存任务"}
            </button>
          </form>

          <section className="min-h-96 overflow-hidden rounded-lg border border-[#d4dedb] bg-white shadow-sm shadow-[#17312e]/5">
            <div className="flex items-center justify-between border-b border-[#edf2f0] bg-[#fbfdfc] px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-[#13282b]">未完成任务</h2>
                <p className="mt-1 text-sm text-[#667a76]">按创建时间倒序排列</p>
              </div>
              <button
                className="grid h-9 w-9 place-items-center rounded-lg border border-[#cbd9d5] bg-white text-[#48635f] transition hover:border-[#9fb3ae] hover:bg-[#f2f7f5]"
                onClick={loadTasks}
                title="刷新"
                type="button"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            {loading ? (
              <div className="px-5 py-16 text-center text-sm font-medium text-[#667a76]">
                正在读取本地缓存
              </div>
            ) : activeTasks.length ? (
              <div className="divide-y divide-[#edf2f0]">
                {activeTasks.map((task) => (
                  <article
                    className="grid gap-4 px-5 py-4 transition hover:bg-[#f8fbfa] sm:grid-cols-[1fr_auto] sm:items-start"
                    key={task.id}
                  >
                    {editingTaskId === task.id ? (
                      <form
                        className="min-w-0 sm:col-span-2"
                        onSubmit={(event) => void handleUpdate(event, task.id)}
                      >
                        <div className="grid gap-3">
                          <input
                            aria-label="编辑任务名称"
                            className="h-10 rounded-lg border border-[#cbd9d5] bg-[#fbfdfc] px-3 text-[#13282b] outline-none transition hover:border-[#aebfba] focus:border-[#2f6f63] focus:bg-white focus:ring-2 focus:ring-[#2f6f63]/15"
                            onChange={(event) => {
                              const { value } = event.currentTarget;

                              setEditDraft((current) => ({ ...current, name: value }));
                            }}
                            value={editDraft.name}
                          />
                          <textarea
                            aria-label="编辑任务说明"
                            className="min-h-24 resize-none rounded-lg border border-[#cbd9d5] bg-[#fbfdfc] px-3 py-2.5 leading-6 text-[#13282b] outline-none transition hover:border-[#aebfba] focus:border-[#2f6f63] focus:bg-white focus:ring-2 focus:ring-[#2f6f63]/15"
                            onChange={(event) => {
                              const { value } = event.currentTarget;

                              setEditDraft((current) => ({ ...current, info: value }));
                            }}
                            value={editDraft.info}
                          />
                          <div className="grid gap-3 sm:grid-cols-[1fr_160px_auto] sm:items-center">
                            <select
                              aria-label="编辑任务分类"
                              className="h-10 rounded-lg border border-[#cbd9d5] bg-[#fbfdfc] px-3 text-[#13282b] outline-none transition hover:border-[#aebfba] focus:border-[#2f6f63] focus:bg-white focus:ring-2 focus:ring-[#2f6f63]/15"
                              onChange={(event) => {
                                const { value } = event.currentTarget;

                                setEditDraft((current) => ({
                                  ...current,
                                  tag: value,
                                }));
                              }}
                              value={editDraft.tag}
                            >
                              {TAG_OPTIONS.map((tag) => (
                                <option key={tag.value} value={tag.value}>
                                  {tag.label}
                                </option>
                              ))}
                            </select>
                            <input
                              aria-label="编辑任务截止日期"
                              className="h-10 rounded-lg border border-[#cbd9d5] bg-[#fbfdfc] px-3 text-[#13282b] outline-none transition hover:border-[#aebfba] focus:border-[#2f6f63] focus:bg-white focus:ring-2 focus:ring-[#2f6f63]/15"
                              onChange={(event) => {
                                const { value } = event.currentTarget;

                                setEditDraft((current) => ({
                                  ...current,
                                  endDate: value,
                                }));
                              }}
                              type="date"
                              value={editDraft.endDate}
                            />
                            <div className="flex items-center gap-2">
                              <button
                                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-[#173b3f] px-3 text-sm font-semibold text-white transition hover:bg-[#23545a] disabled:cursor-not-allowed disabled:bg-[#a8b8b4]"
                                disabled={saving || !editDraft.name.trim()}
                                type="submit"
                              >
                                <Save className="h-4 w-4" />
                                保存
                              </button>
                              <button
                                className="grid h-10 w-10 place-items-center rounded-lg border border-[#cbd9d5] bg-white text-[#48635f] transition hover:border-[#9fb3ae] hover:bg-[#f2f7f5]"
                                onClick={closeEditor}
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
                                className="h-2.5 w-2.5 rounded-full ring-4 ring-[#edf3f1]"
                                style={{ backgroundColor: task.tag }}
                              />
                            ) : null}
                            <h3 className="break-words text-base font-semibold text-[#13282b]">
                              {task.name}
                            </h3>
                          </div>
                          {task.info.trim() ? (
                            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[#5f7470]">
                              {task.info}
                            </p>
                          ) : null}
                          {task.endDate ? (
                            <p className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-[#fff4ed] px-2 py-1 text-xs font-semibold text-[#9b4f2e]">
                              <CalendarClock className="h-3.5 w-3.5" />
                              截止 {task.endDate}
                            </p>
                          ) : null}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                          <button
                            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#cbd9d5] px-3 text-sm font-semibold text-[#48635f] transition hover:bg-[#f2f7f5]"
                            onClick={() => openEditor(task)}
                            type="button"
                          >
                            <Edit3 className="h-4 w-4" />
                            编辑
                          </button>
                          <button
                            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-emerald-200 px-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                            onClick={() => void completeTask(task.id)}
                            type="button"
                          >
                            <Check className="h-4 w-4" />
                            完成
                          </button>
                          <button
                            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-red-200 px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                            onClick={() => removeTask(task.id)}
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
                <ListChecks className="mx-auto h-8 w-8 text-[#9fb3ae]" />
                <p className="mt-3 text-sm font-medium text-[#667a76]">暂无任务</p>
              </div>
            )}

            {completedTasks.length ? (
              <div className="border-t border-[#edf2f0] bg-[#fbfdfc]">
                <div className="px-5 py-4">
                  <h2 className="text-lg font-semibold text-[#13282b]">已完成任务</h2>
                </div>
                <div className="divide-y divide-[#edf2f0] border-t border-[#edf2f0] bg-white">
                  {completedTasks.map((task) => (
                    <article
                      className="grid gap-4 px-5 py-4 transition hover:bg-[#f8fbfa] sm:grid-cols-[1fr_auto] sm:items-start"
                      key={task.id}
                    >
                      <div className="min-w-0 opacity-75">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <CheckCircle2 className="h-4 w-4 text-[#2f6f63]" />
                          <h3 className="break-words text-base font-semibold text-[#13282b]">
                            {task.name}
                          </h3>
                        </div>
                        {task.info.trim() ? (
                          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[#5f7470]">
                            {task.info}
                          </p>
                        ) : null}
                      </div>
                      <button
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-red-200 px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                        onClick={() => removeTask(task.id)}
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
        </section>
      </div>
    </main>
  );
}
