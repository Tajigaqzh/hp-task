import type { FormEvent } from "react";
import { Plus } from "lucide-react";

import {
  fieldClassName,
  panelClassName,
  primaryButtonClassName,
  textareaClassName,
} from "../../shared/ui.ts";
import type { TaskDraft } from "../../types/task.ts";
import { DatePickerField } from "../ui/DatePickerField.tsx";
import { TAG_OPTIONS } from "./task-options.ts";

interface TaskCreateFormProps {
  draft: TaskDraft;
  saving: boolean;
  onChange: (draft: TaskDraft) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function TaskCreateForm({
  draft,
  saving,
  onChange,
  onSubmit,
}: TaskCreateFormProps) {
  return (
    <form className={`${panelClassName} flex flex-col gap-4 p-4`} onSubmit={onSubmit}>
      <div className="border-b border-[var(--app-border)] pb-3">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-[var(--app-nav-active)] text-[var(--app-accent)]">
            <Plus className="h-4 w-4" />
          </span>
          <h2 className="text-base font-bold text-[var(--app-text)]">新增任务</h2>
        </div>
      </div>

      <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--app-text-secondary)]">
        <span>名称</span>
        <input
          className={fieldClassName}
          onChange={(event) => {
            const { value } = event.currentTarget;
            onChange({ ...draft, name: value });
          }}
          placeholder="例如：整理今日计划"
          value={draft.name}
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--app-text-secondary)]">
        <span>说明</span>
        <textarea
          className={textareaClassName}
          onChange={(event) => {
            const { value } = event.currentTarget;
            onChange({ ...draft, info: value });
          }}
          placeholder="补充任务背景、执行事项或验收标准"
          value={draft.info}
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--app-text-secondary)]">
          <span>分类</span>
          <select
            className={fieldClassName}
            onChange={(event) => {
              const { value } = event.currentTarget;
              onChange({ ...draft, tag: value });
            }}
            value={draft.tag}
          >
            {TAG_OPTIONS.map((tag) => (
              <option key={tag.value} value={tag.value}>
                {tag.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--app-text-secondary)]">
          <span>截止日期</span>
          <DatePickerField
            label="截止日期"
            onChange={(value) => onChange({ ...draft, endDate: value })}
            required
            value={draft.endDate}
          />
        </label>
      </div>

      <button
        className={`${primaryButtonClassName} h-10`}
        disabled={saving || !draft.name.trim() || !draft.endDate}
        type="submit"
      >
        <Plus className="h-4 w-4" />
        {saving ? "保存中" : "保存任务"}
      </button>
    </form>
  );
}
