import { describe, expect, it } from "vitest";

import { formatTaskDate, getTaskDateClass } from "./desktop-widget-utils.ts";

describe("desktop widget date helpers", () => {
  it("formats missing and present task end dates", () => {
    expect(formatTaskDate()).toBe("未设置截止");
    expect(formatTaskDate("2026-07-12")).toBe("截止 2026-07-12");
  });

  it("classifies missing, past, and future task end dates", () => {
    expect(getTaskDateClass()).toBe("text-white/45");
    expect(getTaskDateClass("0001-01-01")).toBe("text-rose-100");
    expect(getTaskDateClass("9999-12-31")).toBe("text-emerald-100");
  });
});
