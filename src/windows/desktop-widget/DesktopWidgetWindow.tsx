import type { FormEvent, MouseEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { useTaskSync } from "../../hooks/use-task-sync.ts";
import { useTaskStore } from "../../stores/task-store.ts";
import type { AppSettings } from "../../types/settings.ts";
import type { TaskDraft } from "../../types/task.ts";
import { DesktopWidgetHeader } from "./DesktopWidgetHeader.tsx";
import { DesktopWidgetSummary } from "./DesktopWidgetSummary.tsx";
import { DesktopWidgetTaskList } from "./DesktopWidgetTaskList.tsx";

function getTodayDateInputValue() {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);

  return localDate.toISOString().slice(0, 10);
}

export function DesktopWidgetWindow() {
  const {
    tasks,
    loading,
    saving,
    error,
    loadTasks,
    addTask,
    updateTask,
    completeTask,
    reopenTask,
  } = useTaskStore();
  const [pinned, setPinned] = useState(false);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [draft, setDraft] = useState<TaskDraft>(() => ({
    name: "",
    info: "",
    tag: "#314553",
    endDate: getTodayDateInputValue(),
  }));

  useEffect(() => {
    document.documentElement.classList.add("desktop-widget-shell");
    document.body.classList.add("desktop-widget-shell");
    loadTasks();
    invoke<AppSettings>("get_app_settings")
      .then((settings) => {
        setPinned(settings.desktopWidgetPinned);
      })
      .catch((loadError) => {
        console.error("读取桌面组件设置失败", loadError);
      });

    return () => {
      document.documentElement.classList.remove("desktop-widget-shell");
      document.body.classList.remove("desktop-widget-shell");
    };
  }, [loadTasks]);
  useTaskSync(loadTasks);

  const recentActiveTasks = useMemo(
    () =>
      tasks
        .filter((task) => !task.completedAt)
        .sort((left, right) => right.createdAt - left.createdAt)
        .slice(0, 4),
    [tasks],
  );
  const recentCompletedTasks = useMemo(
    () =>
      tasks
        .filter((task) => task.completedAt)
        .sort((left, right) => (right.completedAt ?? 0) - (left.completedAt ?? 0))
        .slice(0, 3),
    [tasks],
  );

  function handleDragStart() {
    if (!pinned) {
      getCurrentWindow().startDragging();
    }
  }

  async function handleClose() {
    await invoke("set_desktop_widget_enabled", { enabled: false });
  }

  function handleToolbarMouseDown(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
  }

  async function handlePinnedChange() {
    const nextPinned = !pinned;
    setPinned(nextPinned);

    try {
      await invoke("set_desktop_widget_pinned", { pinned: nextPinned });
    } catch (changeError) {
      setPinned(!nextPinned);
      console.error("保存桌面组件固定状态失败", changeError);
    }
  }

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
    setDraft((current) => ({
      name: "",
      info: "",
      tag: current.tag,
      endDate: getTodayDateInputValue(),
    }));
    setAddMenuOpen(false);
  }

  return (
    <main className="flex h-screen items-start bg-transparent p-3 text-[#13282b]">
      <motion.section
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="flex max-h-full w-full flex-col overflow-hidden rounded-xl border border-white/30 bg-[#173b3f]/95 text-white shadow-2xl shadow-[#0f2326]/30 backdrop-blur-2xl"
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      >
        <DesktopWidgetHeader
          onClose={() => void handleClose()}
          onDragStart={handleDragStart}
          onPinnedChange={() => void handlePinnedChange()}
          onToolbarMouseDown={handleToolbarMouseDown}
          pinned={pinned}
        />
        <div className="desktop-widget-scrollbar-hidden min-h-0 flex-1 overflow-y-auto">
          <DesktopWidgetSummary
            onRefresh={loadTasks}
            onToolbarMouseDown={handleToolbarMouseDown}
            taskCount={tasks.length}
          />

          <div className="mx-3 mb-3">
            <div className="flex justify-end">
              <button
                aria-expanded={addMenuOpen}
                aria-label={addMenuOpen ? "关闭新增任务" : "新增任务"}
                className="grid h-10 w-10 place-items-center rounded-full border border-[#b9eee4]/50 bg-[#8fc8bd] text-[#10292c] shadow-lg shadow-[#071c1f]/25 transition hover:bg-[#a6d8cf] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8fff7]/70"
                onClick={() => setAddMenuOpen((current) => !current)}
                onMouseDown={handleToolbarMouseDown}
                title={addMenuOpen ? "关闭新增" : "新增任务"}
                type="button"
              >
                <Plus
                  className={`h-5 w-5 transition ${addMenuOpen ? "rotate-45" : ""}`}
                />
              </button>
            </div>

            <AnimatePresence initial={false}>
              {addMenuOpen ? (
                <motion.form
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 rounded-lg border border-white/15 bg-[#102f33]/98 p-2.5 shadow-xl shadow-black/25"
                  exit={{ opacity: 0, y: -4 }}
                  initial={{ opacity: 0, y: -4 }}
                  onSubmit={(event) => void handleSubmit(event)}
                  transition={{ duration: 0.16 }}
                >
                  <div className="grid gap-2">
                    <input
                      aria-label="新增任务名称"
                      className="h-8 rounded-md border border-white/10 bg-white/[0.08] px-2.5 text-sm font-semibold text-white outline-none placeholder:text-white/35 focus:border-[#8fc8bd]"
                      onChange={(event) => {
                        const { value } = event.currentTarget;

                        setDraft((current) => ({ ...current, name: value }));
                      }}
                      placeholder="任务名称"
                      value={draft.name}
                    />
                    <textarea
                      aria-label="新增任务说明"
                      className="min-h-12 resize-none rounded-md border border-white/10 bg-white/[0.08] px-2.5 py-1.5 text-xs leading-5 text-white outline-none placeholder:text-white/35 focus:border-[#8fc8bd]"
                      onChange={(event) => {
                        const { value } = event.currentTarget;

                        setDraft((current) => ({ ...current, info: value }));
                      }}
                      placeholder="说明"
                      value={draft.info}
                    />
                    <div className="flex items-center gap-2">
                      <input
                        aria-label="新增任务截止日期"
                        className="h-8 min-w-0 flex-1 rounded-md border border-white/10 bg-white/[0.08] px-2.5 text-xs text-white outline-none focus:border-[#8fc8bd]"
                        onChange={(event) => {
                          const { value } = event.currentTarget;

                          setDraft((current) => ({ ...current, endDate: value }));
                        }}
                        type="date"
                        value={draft.endDate}
                      />
                      <button
                        className="inline-flex h-8 w-20 shrink-0 items-center justify-center gap-1.5 rounded-md bg-[#8fc8bd] px-2 text-xs font-semibold text-[#10292c] transition hover:bg-[#a6d8cf] disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={saving || !draft.name.trim()}
                        type="submit"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        {saving ? "保存中" : "保存"}
                      </button>
                    </div>
                  </div>
                </motion.form>
              ) : null}
            </AnimatePresence>
          </div>

          {error ? (
            <div className="mx-4 mb-3 rounded-lg border border-red-200 bg-red-50/95 px-3 py-2 text-xs font-semibold text-red-700">
              {error}
            </div>
          ) : null}

          <div className="px-3 pb-3">
            <DesktopWidgetTaskList
              activeTasks={recentActiveTasks}
              completedTasks={recentCompletedTasks}
              loading={loading}
              onComplete={completeTask}
              onReopen={reopenTask}
              onUpdate={updateTask}
              saving={saving}
            />
          </div>
        </div>
      </motion.section>
    </main>
  );
}
