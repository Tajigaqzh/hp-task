import { lazy, Suspense } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

import { DESKTOP_WIDGET_WINDOW_LABEL } from "./window-labels.ts";

const AppRoutes = lazy(() =>
  import("./AppRoutes.tsx").then((module) => ({ default: module.AppRoutes })),
);

const DesktopWidgetWindow = lazy(() =>
  import("./desktop-widget/DesktopWidgetWindow.tsx").then((module) => ({
    default: module.DesktopWidgetWindow,
  })),
);

export default function WindowRoot() {
  const Component =
    getCurrentWindow().label === DESKTOP_WIDGET_WINDOW_LABEL
      ? DesktopWidgetWindow
      : AppRoutes;

  return (
    <Suspense fallback={null}>
      <Component />
    </Suspense>
  );
}
