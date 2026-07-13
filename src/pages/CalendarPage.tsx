import { useEffect, useMemo } from "react";
import { CalendarDays } from "lucide-react";

import { panelClassName } from "../shared/ui.ts";
import { useTaskSync } from "../hooks/use-task-sync.ts";
import { useTaskStore } from "../stores/task-store.ts";

export function CalendarPage() {
  const { tasks, loading, loadTasks } = useTaskStore();

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);
  useTaskSync(loadTasks);

  const groupedTasks = useMemo(() => {
    const datedTasks = tasks
      .filter((task) => task.endDate)
      .sort((left, right) => String(left.endDate).localeCompare(String(right.endDate)));

    return datedTasks.reduce<Record<string, typeof datedTasks>>((groups, task) => {
      const key = task.endDate ?? "未设置";
      groups[key] = [...(groups[key] ?? []), task];
      return groups;
    }, {});
  }, [tasks]);

  const dates = Object.keys(groupedTasks);

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-4">
      <section className={`${panelClassName} overflow-hidden`}>
        <div className="flex items-center gap-3 border-b border-[var(--app-border)] bg-[var(--app-surface-muted)] px-4 py-3">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-[var(--app-nav-active)] text-[var(--app-accent)]">
            <CalendarDays className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-base font-bold text-[var(--app-text)]">任务日历</h2>
            <p className="text-xs text-[var(--app-text-muted)]">按截止日期归档</p>
          </div>
        </div>

        {loading && !dates.length ? (
          <div className="px-5 py-16 text-center text-sm font-semibold text-[var(--app-text-muted)]">
            正在读取本地缓存
          </div>
        ) : dates.length ? (
          <div className="divide-y divide-[var(--app-border)]">
            {dates.map((date) => (
              <section
                className="grid gap-3 px-4 py-3 sm:grid-cols-[120px_1fr]"
                key={date}
              >
                <div className="text-sm font-bold text-[var(--app-text)]">{date}</div>
                <div className="grid gap-2">
                  {groupedTasks[date].map((task) => (
                    <article
                      className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-3 py-2"
                      key={task.id}
                    >
                      <div className="flex items-center gap-2">
                        {task.tag ? (
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: task.tag }}
                          />
                        ) : null}
                        <h3 className="text-sm font-bold text-[var(--app-text)]">
                          {task.name}
                        </h3>
                      </div>
                      {task.info.trim() ? (
                        <p className="mt-1 text-sm leading-6 text-[var(--app-text-secondary)]">
                          {task.info}
                        </p>
                      ) : null}
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="px-5 py-16 text-center text-sm font-semibold text-[var(--app-text-muted)]">
            暂无带截止日期的任务
          </div>
        )}
      </section>
    </div>
  );
}
