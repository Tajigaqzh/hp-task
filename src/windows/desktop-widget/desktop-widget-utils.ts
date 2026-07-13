const TODAY = new Date().toISOString().slice(0, 10);

export function formatTaskDate(endDate?: string | null) {
  return endDate ? `截止 ${endDate}` : "未设置截止";
}

export function getTaskDateClass(endDate?: string | null) {
  if (!endDate) {
    return "text-white/45";
  }

  if (endDate < TODAY) {
    return "text-rose-100";
  }

  if (endDate === TODAY) {
    return "text-amber-100";
  }

  return "text-emerald-100";
}
