import { CalendarClock, CheckCircle2, ListChecks } from "lucide-react";

import { subtlePanelClassName } from "../../shared/ui.ts";

interface TaskStatsProps {
  activeCount: number;
  completedCount: number;
  datedCount: number;
}

export function TaskStats({ activeCount, completedCount, datedCount }: TaskStatsProps) {
  const items = [
    { icon: ListChecks, label: "未完成", value: activeCount },
    { icon: CalendarClock, label: "有截止", value: datedCount },
    { icon: CheckCircle2, label: "已完成", value: completedCount },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map(({ icon: Icon, label, value }) => (
        <div
          className={`${subtlePanelClassName} flex items-center gap-3 px-4 py-3`}
          key={label}
        >
          <span className="grid h-8 w-8 place-items-center rounded-md bg-[var(--app-nav-active)] text-[var(--app-accent)]">
            <Icon className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-semibold text-[var(--app-text-muted)]">{label}</p>
            <p className="text-lg font-bold leading-6 text-[var(--app-text)]">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
