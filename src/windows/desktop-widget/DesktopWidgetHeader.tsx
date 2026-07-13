import type { MouseEvent } from "react";
import { GripHorizontal, Pin, PinOff, X } from "lucide-react";
import { motion } from "motion/react";

interface DesktopWidgetHeaderProps {
  pinned: boolean;
  onClose: () => void;
  onDragStart: () => void;
  onPinnedChange: () => void;
  onToolbarMouseDown: (event: MouseEvent<HTMLButtonElement>) => void;
}

export function DesktopWidgetHeader({
  pinned,
  onClose,
  onDragStart,
  onPinnedChange,
  onToolbarMouseDown,
}: DesktopWidgetHeaderProps) {
  return (
    <header
      className={`flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-3 ${
        pinned ? "cursor-default" : "cursor-move"
      }`}
      onMouseDown={onDragStart}
    >
      <div className="flex min-w-0 items-center gap-3">
        <GripHorizontal className="h-4 w-4 shrink-0 text-white/35" />
        <motion.div
          animate={{ opacity: 1, x: 0 }}
          initial={{ opacity: 0, x: -8 }}
          transition={{ delay: 0.08, duration: 0.2 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
            HP Task
          </p>
          <h1 className="text-base font-semibold text-white">今日任务</h1>
        </motion.div>
      </div>
      <div className="flex items-center gap-1">
        <motion.button
          aria-label={pinned ? "取消固定" : "固定桌面组件"}
          aria-pressed={pinned}
          className="grid h-8 w-8 place-items-center rounded-full text-white/65 transition hover:bg-white/10 hover:text-white"
          onClick={onPinnedChange}
          onMouseDown={onToolbarMouseDown}
          title={pinned ? "取消固定" : "固定"}
          type="button"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.94 }}
        >
          {pinned ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
        </motion.button>
        <motion.button
          aria-label="关闭桌面组件"
          className="grid h-8 w-8 place-items-center rounded-full text-white/65 transition hover:bg-white/10 hover:text-white"
          onClick={onClose}
          onMouseDown={onToolbarMouseDown}
          title="关闭"
          type="button"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
        >
          <X className="h-4 w-4" />
        </motion.button>
      </div>
    </header>
  );
}
