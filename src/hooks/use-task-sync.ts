import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";

const TASKS_CHANGED_EVENT = "tasks://changed";

export function useTaskSync(loadTasks: () => Promise<void>) {
  useEffect(() => {
    let disposed = false;
    let syncing = false;
    let queued = false;
    let syncTimer: number | null = null;
    let unlistenTaskChanges: (() => void) | null = null;

    function runSync() {
      syncTimer = null;

      if (syncing) {
        queued = true;
        return;
      }

      syncing = true;
      void loadTasks()
        .catch((error) => {
          console.error("同步任务数据失败", error);
        })
        .finally(() => {
          syncing = false;

          if (!disposed && queued) {
            queued = false;
            scheduleSync();
          }
        });
    }

    function scheduleSync() {
      if (syncTimer !== null) {
        window.clearTimeout(syncTimer);
      }

      syncTimer = window.setTimeout(runSync, 180);
    }

    listen(TASKS_CHANGED_EVENT, scheduleSync)
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
      if (syncTimer !== null) {
        window.clearTimeout(syncTimer);
      }
      unlistenTaskChanges?.();
    };
  }, [loadTasks]);
}
