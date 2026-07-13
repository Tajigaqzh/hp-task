import { getCurrentWindow } from "@tauri-apps/api/window";

import { MainWindow } from "./MainWindow.tsx";
import { DesktopWidgetWindow } from "./desktop-widget/DesktopWidgetWindow.tsx";
import { DESKTOP_WIDGET_WINDOW_LABEL } from "./window-labels.ts";

export default function WindowRoot() {
  if (getCurrentWindow().label === DESKTOP_WIDGET_WINDOW_LABEL) {
    return <DesktopWidgetWindow />;
  }

  return <MainWindow />;
}
