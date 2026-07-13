# Repository Guidelines

## 项目概览

这是一个 Tauri 2 + React 19 + TypeScript + Vite 7 的桌面任务应用。前端负责主任务界面和桌面半透明组件，Rust 侧负责 Tauri 启动、命令、系统托盘、窗口管理、CLI 和本地任务数据读写。

当前项目不是 Nx/NestJS 多应用仓库；不要沿用 `apps/web`、`apps/api`、Jest、Playwright 或 CSS Module 目录约定，除非后续明确引入。

## 项目结构与模块组织

- `src/`：React 前端源码。
  - `App.tsx`：主窗口入口，根据 Tauri 当前窗口 label 切换主应用或桌面组件。
  - `DesktopWidget.tsx`：桌面半透明任务组件，使用 `motion/react` 做入场和列表动画。
  - `stores/task-store.ts`：Zustand 任务状态，使用 `@tauri-apps/api/core` 的 `invoke` 调用 Rust 命令。
  - `types/task.ts`：前后端共享含义的任务类型。
  - `styles.css`：Tailwind v4 入口和全局样式。
- `src-tauri/`：Tauri/Rust 桌面端源码。
  - `src/app/mod.rs`：组装插件、托盘、窗口事件和命令。
  - `src/commands/mod.rs`：暴露给前端的 Tauri command。
  - `src/system/tray.rs`：系统托盘初始化和菜单事件。
  - `src/system/window.rs`：窗口恢复、关闭改隐藏等通用窗口行为。
  - `src/system/widget.rs`：创建或恢复 `desktop-widget` 桌面组件窗口。
  - `src/features/task/`：任务模型和本地 JSON 存储。
  - `src/bin/hp.rs`、`src/cli/mod.rs`：`hp` CLI。
  - `capabilities/default.json`：Tauri 权限配置，新窗口或新前端 API 必须在这里授权。
- `public/`：静态资源。
- `ui/`：设计或截图参考资料，当前包含桌面组件相关截图。

## 构建、检查与本地开发命令

本仓库统一使用 `pnpm` 管理前端依赖。

- `pnpm dev`：只启动 Vite 前端开发服务器。
- `pnpm tauri dev`：启动完整 Tauri 桌面应用开发环境。
- `pnpm build`：执行 `tsc && vite build`，构建前端产物。
- `pnpm lint`：运行 ESLint 检查 `src`。
- `pnpm lint:fix`：自动修复前端 lint 问题。
- `pnpm format`：对 `src` 执行 Prettier 写入。
- `pnpm format:check`：检查 `src` 格式。
- `pnpm preview`：预览 Vite 构建产物。
- `cargo check`：在 `src-tauri/` 下运行，检查 Rust/Tauri 代码。

`src-tauri/Cargo.toml` 里有两个 binary：默认桌面应用 `hp-task` 和 CLI `hp`。`default-run = "hp-task"` 用于让 `pnpm tauri dev` 内部的 `cargo run` 选择桌面应用。

如果 `pnpm add` 出现 `ERR_PNPM_UNEXPECTED_STORE`，应沿用当前 `node_modules` 指向的 pnpm store；不要为了装一个包重装整个依赖树。若沙箱阻止访问 npm registry 或 Vite/esbuild 读取配置路径，应按工具权限流程请求批准后重跑同一命令。

## 编码风格与命名约定

- 所有文本文件按 UTF-8 读取和写入，尤其是中文注释、文档和提交信息。
- 前端使用 TypeScript、React 函数组件和 Tailwind 工具类。
- Prettier 当前配置：双引号、分号、尾随逗号、`printWidth: 90`。
- React 状态优先保持在局部组件或 Zustand store 中；不要为小功能引入新的全局状态层。
- 组件文件使用 PascalCase，例如 `DesktopWidget.tsx`；store 文件使用 kebab-case，例如 `task-store.ts`。
- Rust 模块按领域拆分到 `src-tauri/src/system`、`commands`、`features`、`cli`；新增 Tauri command 放在 `commands/mod.rs`，具体实现优先落到对应领域模块。
- 注释只写能降低理解成本的内容。已有中文注释风格可以沿用，但不要给显而易见的赋值或 JSX 重复解释。

## Tauri 与窗口能力约定

- 主窗口 label 为 `main`。
- 桌面半透明组件窗口 label 为 `desktop-widget`，由 `system/widget.rs` 创建，前端由 `DesktopWidget.tsx` 渲染。
- 系统托盘由 `system/tray.rs` 管理；窗口关闭改隐藏由 `system/window.rs` 处理。
- 新增窗口时必须同步更新 `src-tauri/capabilities/default.json` 的 `windows` 列表。
- 前端使用新的 Tauri API 时必须确认 capability 权限，例如桌面组件拖动需要 `core:window:allow-start-dragging`。
- 创建窗口时优先复用已有 label 的窗口，避免重复创建多个桌面组件实例。
- 透明窗口样式应由 React/CSS 控制，Rust 侧只负责 `transparent(true)`、无边框、置顶、任务栏隐藏等窗口属性。

## 前端 UI 与交互约定

- 主应用是任务管理工具，界面应保持工作型、清晰、紧凑，不做营销页。
- 桌面组件应以半透明、轻量、可快速扫视为主；当前主色为 `#314553`。
- 已引入 `motion`，动画使用 `motion/react`。动画应服务于状态变化和空间反馈，避免过度装饰。
- 桌面组件支持拖动和固定：固定状态下不应触发 `startDragging()`。
- 需要新依赖时先确认是否已有本地能力可以满足；确需安装时使用 `pnpm add <pkg>`，并说明用途。

## 测试与验证规范

当前仓库已集成 Vitest 和 Playwright。不要使用 Jest 命令。

按改动范围选择验证：

- 只改文档：通常无需跑构建；可说明未运行命令。
- 改前端 `src`：运行 `pnpm lint`、`pnpm format:check` 和 `pnpm test`；涉及类型、依赖或构建产物时运行 `pnpm build`。
- 改 Rust/Tauri：在 `src-tauri/` 运行 `cargo check`。
- 改 Tauri command、窗口、capability 或前后端调用链：运行 `cargo check`、`pnpm lint`、`pnpm format:check`、`pnpm test`，必要时运行 `pnpm build` 和 `pnpm e2e`。
- 改 `package.json` 或 `pnpm-lock.yaml`：运行前端相关检查，确认 lockfile 是依赖安装自然更新。

测试目录约定：

- `src/**/*.spec.tsx`：Vitest + Testing Library 的组件/单元测试。
- `test/setup.ts`：Vitest 测试初始化，当前加载 `@testing-library/jest-dom/vitest`。
- `e2e/**/*.spec.ts`：Playwright 浏览器流程测试。
- 浏览器 e2e 在普通 Web 环境运行时，需要 mock `window.__TAURI_INTERNALS__`，避免 Tauri API 在非 Tauri WebView 中不可用。

## 提交与 Pull Request 规范

提交信息使用简洁的 Conventional Commit，例如：

- `feat: add desktop widget`
- `fix: enable widget window dragging`
- `docs: update repository guidelines`

当用户要求提交、commit、amend 或提交并推送时，必须先执行受保护提交流程：

- 检查 `git status --short --branch`。
- 检查 staged 和 unstaged diff，避免纳入无关用户变更。
- 运行项目适用的检查命令。
- 运行禁止 `mock: true`、冲突标记等提交保护检查。
- 展示拟定提交信息并等待用户明确确认后再 `git commit`。

提交成功或失败的最终回复必须列出关键检查结果；如果 staged 检查有非阻断 warning，也要列出。

## Agent 注意事项

- 不要回退或覆盖用户已有改动。工作区可能是 dirty 状态，只处理本次任务相关文件。
- 修改前先理解现有结构，优先复用当前 Tauri、React、Zustand、Tailwind、motion 约定。
- 不要把不适用的外部仓库规则带入本项目。
- 不要主动删除 `.codex/`、`ui/`、截图、lockfile 或 IDE 配置，除非用户明确要求。
- 在有 `.codegraph/` 的仓库中，理解或定位代码时优先使用 CodeGraph。
- Windows/PowerShell 下读取中文文档和源码时必须显式使用 UTF-8，例如 `Get-Content -Encoding UTF8`。
