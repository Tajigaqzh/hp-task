import { useEffect, useRef, useState } from "react";
import { CalendarDays } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { secondaryButtonClassName } from "../../shared/ui.ts";

interface DatePickerFieldProps {
  className?: string;
  id?: string;
  label?: string;
  required?: boolean;
  value?: string;
  onChange: (value: string) => void;
}

function parseDateInput(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) {
    return undefined;
  }

  return new Date(year, month - 1, day);
}

function formatDateInput(date: Date | undefined) {
  if (!date) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function DatePickerField({
  className = "",
  id,
  label = "选择日期",
  required = false,
  value,
  onChange,
}: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const selectedDate = parseDateInput(value);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <button
        aria-expanded={open}
        aria-label={label}
        className={`${secondaryButtonClassName} w-full justify-between bg-[var(--app-input)] text-left font-medium`}
        id={id}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span
          className={value ? "text-[var(--app-text)]" : "text-[var(--app-text-muted)]"}
        >
          {value || "选择日期"}
        </span>
        <CalendarDays className="h-4 w-4 text-[var(--app-accent)]" />
      </button>

      <input
        aria-hidden="true"
        className="sr-only"
        readOnly
        required={required}
        tabIndex={-1}
        value={value ?? ""}
      />

      {open ? (
        <div className="app-date-picker absolute left-0 top-10 z-30 rounded-lg border border-[var(--app-border)] bg-white p-2 shadow-xl shadow-slate-900/15">
          <DayPicker
            mode="single"
            onSelect={(date) => {
              onChange(formatDateInput(date));
              setOpen(false);
            }}
            selected={selectedDate}
            showOutsideDays
            weekStartsOn={1}
          />
        </div>
      ) : null}
    </div>
  );
}
