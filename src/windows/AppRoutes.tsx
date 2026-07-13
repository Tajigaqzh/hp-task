import { HashRouter, Navigate, Route, Routes } from "react-router-dom";

import { MainWindow } from "./MainWindow.tsx";
import { SettingsWindow } from "./SettingsWindow.tsx";

export function AppRoutes() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<MainWindow />} path="/" />
        <Route element={<SettingsWindow />} path="/settings" />
        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    </HashRouter>
  );
}
