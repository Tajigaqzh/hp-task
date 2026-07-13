import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";

const TASKS_CHANGED_EVENT = "tasks://changed";

export function useTaskSync(loadTasks: () => Promise<void>) {
  useEffect(() => {
    let disposed = false;
    let unlistenTaskChanges: (() => void) | null = null;

    listen(TASKS_CHANGED_EVENT, () => {
      void loadTasks();
    })
      .then((unlisten) => {
        if (disposed) {
          unlisten();
          return;
        }

        unlistenTaskChanges = unlisten;
      })
      .catch((error) => {
        console.error("监听任务同步事件失败", error);
      });

    return () => {
      disposed = true;
      unlistenTaskChanges?.();
    };
  }, [loadTasks]);
}
