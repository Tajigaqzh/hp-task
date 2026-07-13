import { CalendarClock, ListTodo } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import type { Task } from "../../types/task.ts";
import { formatTaskDate, getTaskDateClass } from "./desktop-widget-utils.ts";

interface DesktopWidgetTaskListProps {
  loading: boolean;
  tasks: Task[];
}

export function DesktopWidgetTaskList({ loading, tasks }: DesktopWidgetTaskListProps) {
  if (loading) {
    return (
      <motion.div
        animate={{ opacity: 1 }}
        className="rounded-xl border border-white/10 bg-white/10 px-3 py-8 text-center text-sm font-medium text-white/65"
        initial={{ opacity: 0 }}
      >
        正在读取
      </motion.div>
    );
  }

  if (!tasks.length) {
    return (
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-white/10 bg-white/10 px-3 py-8 text-center text-sm font-medium text-white/65"
        initial={{ opacity: 0, y: 8 }}
      >
        <ListTodo className="mx-auto mb-2 h-5 w-5 text-white/45" />
        暂无任务
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {tasks.map((task, index) => (
          <motion.article
            animate={{ opacity: 1, x: 0 }}
            className="rounded-xl border border-white/10 bg-white/[0.09] px-3 py-2.5 shadow-sm shadow-slate-950/10 transition hover:bg-white/[0.13]"
            exit={{ opacity: 0, x: 12 }}
            initial={{ opacity: 0, x: -12 }}
            key={task.id}
            transition={{ delay: index * 0.04, duration: 0.2 }}
          >
            <div className="flex items-center gap-2">
              {task.tag ? (
                <span
                  className="h-8 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: task.tag }}
                />
              ) : null}
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-sm font-semibold text-white">{task.name}</h2>
                <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-white/65">
                  {task.info}
                </p>
              </div>
            </div>
            <p
              className={`mt-2 flex items-center gap-1.5 text-[11px] font-semibold ${getTaskDateClass(
                task.endDate,
              )}`}
            >
              <CalendarClock className="h-3 w-3" />
              {formatTaskDate(task.endDate)}
            </p>
          </motion.article>
        ))}
      </AnimatePresence>
    </div>
  );
}
