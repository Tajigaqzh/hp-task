import { FormEvent, useEffect, useMemo, useState } from "react";

import { useTaskStore } from "./stores/task-store";
import type { TaskDraft } from "./types/task";

const TAG_OPTIONS = [
  { label: "工作", value: "#2563eb" },
  { label: "生活", value: "#16a34a" },
  { label: "紧急", value: "#dc2626" },
  { label: "想法", value: "#7c3aed" },
] as const;

function App() {
  const { tasks, loading, saving, error, loadTasks, addTask, removeTask } =
    useTaskStore();
  const [draft, setDraft] = useState<TaskDraft>({
    name: "",
    info: "",
    tag: TAG_OPTIONS[0].value,
    endDate: "",
  });

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const sortedTasks = useMemo(
    () => [...tasks].sort((left, right) => right.createdAt - left.createdAt),
    [tasks],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draft.name.trim() || !draft.info.trim()) {
      return;
    }

    await addTask({
      name: draft.name.trim(),
      info: draft.info.trim(),
      tag: draft.tag,
      endDate: draft.endDate || undefined,
    });

    setDraft({
      name: "",
      info: "",
      tag: draft.tag,
      endDate: "",
    });
  }

  return (
    <main className="min-h-screen bg-[#f3f6f8] text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-6 sm:px-8">
        <header className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">HP Task</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-slate-950">
              本地任务管理
            </h1>
          </div>
          <div className="text-sm text-slate-500">
            共 <span className="font-semibold text-slate-900">{tasks.length}</span> 个任务
          </div>
        </header>

        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <form
            className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            onSubmit={handleSubmit}
          >
            <div>
              <h2 className="text-lg font-semibold text-slate-950">新增任务</h2>
              <p className="mt-1 text-sm text-slate-500">
                数据通过 Tauri 写入本机缓存文件。
              </p>
            </div>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              名称
              <input
                className="rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    name: event.currentTarget.value,
                  }))
                }
                placeholder="例如：整理今日计划"
                value={draft.name}
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              说明
              <textarea
                className="min-h-24 resize-none rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    info: event.currentTarget.value,
                  }))
                }
                placeholder="补充任务背景、执行事项或验收标准"
                value={draft.info}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                分类
                <select
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      tag: event.currentTarget.value,
                    }))
                  }
                  value={draft.tag}
                >
                  {TAG_OPTIONS.map((tag) => (
                    <option key={tag.value} value={tag.value}>
                      {tag.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                截止日期
                <input
                  className="rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      endDate: event.currentTarget.value,
                    }))
                  }
                  type="date"
                  value={draft.endDate}
                />
              </label>
            </div>

            <button
              className="rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={saving || !draft.name.trim() || !draft.info.trim()}
              type="submit"
            >
              {saving ? "保存中" : "保存任务"}
            </button>
          </form>

          <section className="min-h-96 rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-semibold text-slate-950">任务列表</h2>
              <button
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                onClick={loadTasks}
                type="button"
              >
                刷新
              </button>
            </div>

            {loading ? (
              <div className="px-5 py-12 text-center text-sm text-slate-500">
                正在读取本地缓存
              </div>
            ) : sortedTasks.length ? (
              <div className="divide-y divide-slate-100">
                {sortedTasks.map((task) => (
                  <article
                    className="grid gap-4 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-start"
                    key={task.id}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {task.tag ? (
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: task.tag }}
                          />
                        ) : null}
                        <h3 className="break-words text-base font-semibold text-slate-950">
                          {task.name}
                        </h3>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                        {task.info}
                      </p>
                      {task.endDate ? (
                        <p className="mt-3 text-xs font-medium text-slate-500">
                          截止 {task.endDate}
                        </p>
                      ) : null}
                    </div>
                    <button
                      className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                      onClick={() => removeTask(task.id)}
                      type="button"
                    >
                      删除
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="px-5 py-12 text-center text-sm text-slate-500">
                暂无任务
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

export default App;
