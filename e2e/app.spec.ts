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

test.beforeEach(async ({ page }) => {
  await page.addInitScript((mockTasks) => {
    window.__TAURI_INTERNALS__ = {
      metadata: {
        currentWindow: { label: "main" },
      },
      invoke(command: string) {
        if (command === "list_tasks") {
          return Promise.resolve(mockTasks);
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

test("renders tasks and requests the desktop widget", async ({ page }) => {
  let widgetOpened = false;
  await page.exposeFunction("markWidgetOpened", () => {
    widgetOpened = true;
  });
  await page.addInitScript(() => {
    window.addEventListener("desktop-widget-opened", () => {
      window.markWidgetOpened();
    });
  });

  await page.goto("/");

  await expect(page.getByRole("heading", { name: "本地任务管理" })).toBeVisible();
  await expect(page.getByText("整理桌面组件")).toBeVisible();

  await page.getByRole("button", { name: "桌面组件" }).click();

  await expect.poll(() => widgetOpened).toBe(true);
});
