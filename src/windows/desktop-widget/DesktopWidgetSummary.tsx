import type { MouseEvent } from "react";
import { RefreshCw } from "lucide-react";
import { motion } from "motion/react";

interface DesktopWidgetSummaryProps {
  taskCount: number;
  onRefresh: () => void;
  onToolbarMouseDown: (event: MouseEvent<HTMLButtonElement>) => void;
}

export function DesktopWidgetSummary({
  taskCount,
  onRefresh,
  onToolbarMouseDown,
}: DesktopWidgetSummaryProps) {
  return (
    <div className="px-4 py-3.5">
      <div className="flex items-end justify-between">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="flex items-end gap-2"
          initial={{ opacity: 0, y: 8 }}
          transition={{ delay: 0.12, duration: 0.2 }}
        >
          <span className="text-4xl font-semibold leading-none text-white">
            {taskCount}
          </span>
          <span className="pb-1 text-xs font-semibold text-white/45">本地任务</span>
        </motion.div>
        <motion.button
          aria-label="刷新任务"
          className="grid h-8 w-8 place-items-center rounded-full border border-white/15 bg-white/10 text-white/75 transition hover:bg-white/20 hover:text-white"
          onClick={onRefresh}
          onMouseDown={onToolbarMouseDown}
          title="刷新"
          type="button"
          whileTap={{ scale: 0.96 }}
        >
          <RefreshCw className="h-4 w-4" />
        </motion.button>
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[#79d2bb]"
          style={{ width: `${Math.min(taskCount * 16, 100)}%` }}
        />
      </div>
    </div>
  );
}
