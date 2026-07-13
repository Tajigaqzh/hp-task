import type { MouseEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { motion } from "motion/react";

import { useTaskStore } from "../../stores/task-store.ts";
import { DesktopWidgetHeader } from "./DesktopWidgetHeader.tsx";
import { DesktopWidgetSummary } from "./DesktopWidgetSummary.tsx";
import { DesktopWidgetTaskList } from "./DesktopWidgetTaskList.tsx";

export function DesktopWidgetWindow() {
  const { tasks, loading, error, loadTasks } = useTaskStore();
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("desktop-widget-shell");
    document.body.classList.add("desktop-widget-shell");
    loadTasks();

    return () => {
      document.documentElement.classList.remove("desktop-widget-shell");
      document.body.classList.remove("desktop-widget-shell");
    };
  }, [loadTasks]);

  const recentTasks = useMemo(
    () => [...tasks].sort((left, right) => right.createdAt - left.createdAt).slice(0, 4),
    [tasks],
  );

  function handleDragStart() {
    if (!pinned) {
      getCurrentWindow().startDragging();
    }
  }

  function handleClose() {
    getCurrentWindow().hide();
  }

  function handleToolbarMouseDown(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
  }

  return (
    <main className="flex min-h-screen items-start bg-transparent p-3 text-slate-950">
      <motion.section
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full overflow-hidden rounded-2xl border border-white/25 bg-[#314553]/92 text-white shadow-2xl shadow-slate-950/30 backdrop-blur-2xl"
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      >
        <DesktopWidgetHeader
          onClose={handleClose}
          onDragStart={handleDragStart}
          onPinnedChange={() => setPinned((current) => !current)}
          onToolbarMouseDown={handleToolbarMouseDown}
          pinned={pinned}
        />
        <DesktopWidgetSummary
          onRefresh={loadTasks}
          onToolbarMouseDown={handleToolbarMouseDown}
          taskCount={tasks.length}
        />

        {error ? (
          <div className="mx-4 mb-3 rounded-md border border-red-200 bg-red-50/90 px-3 py-2 text-xs font-medium text-red-700">
            {error}
          </div>
        ) : null}

        <div className="px-3 pb-3">
          <DesktopWidgetTaskList loading={loading} tasks={recentTasks} />
        </div>
      </motion.section>
    </main>
  );
}
