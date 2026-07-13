import { expect, test } from "@playwright/test";

const tasks = [
  {
    id: "task-1",
    name: "整理桌面组件",
    info: "验证浏览器 e2e 环境下的 Tauri API mock",
    tag: "#314553",
    endDate: "2026-07-12",
    createdAt: 2,
  },
];

type MockTask = (typeof tasks)[number];
type AddTaskArgs = {
  draft?: Pick<MockTask, "name" | "info" | "tag" | "endDate">;
};
type TauriInternalsMock = {
  metadata: {
    currentWindow: { label: string };
  };
  invoke: (
    command: string,
    args?: AddTaskArgs,
  ) => Promise<MockTask[] | MockTask | null | void>;
  transformCallback: () => number;
  unregisterCallback: () => void;
};

declare global {
  interface Window {
    __TAURI_INTERNALS__: TauriInternalsMock;
  }
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript((mockTasks: MockTask[]) => {
    window.__TAURI_INTERNALS__ = {
      metadata: {
        currentWindow: { label: "main" },
      },
      invoke(command: string, args?: AddTaskArgs) {
        if (command === "list_tasks") {
          return Promise.resolve(mockTasks);
        }

        if (command === "add_task" && args?.draft) {
          return Promise.resolve({
            ...args.draft,
            id: "task-added",
            createdAt: 3,
          });
        }

        if (command === "open_desktop_widget") {
          window.dispatchEvent(new CustomEvent("desktop-widget-opened"));
          return Promise.resolve();
        }

        return Promise.resolve(null);
      },
      transformCallback() {
        return 1;
      },
      unregisterCallback() {},
    };
  }, tasks);
});

test("renders tasks and keeps settings available", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "本地任务管理" })).toBeVisible();
  await expect(page.getByText("整理桌面组件")).toBeVisible();
  await expect(page.getByRole("link", { name: "设置" })).toBeVisible();
  await expect(page.getByRole("button", { name: "桌面组件" })).toHaveCount(0);
});

test("accepts task form edits without losing event targets", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("名称").fill("修复表单输入");
  await page.getByLabel("说明").fill("先读取输入值再更新状态");
  await page.getByLabel("分类").selectOption("#dc2626");
  await page.getByLabel("截止日期").fill("2026-07-14");

  await page.getByRole("button", { name: "保存任务" }).click();

  await expect(page.getByText("修复表单输入")).toBeVisible();
  await expect(page.getByText("先读取输入值再更新状态")).toBeVisible();
  await expect(page.getByText("截止 2026-07-14")).toBeVisible();
});
