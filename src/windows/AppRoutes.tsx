import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";

import { AppShell } from "../components/layout/AppShell.tsx";

type WindowRoute = {
  index?: boolean;
  path: string;
  Component: LazyExoticComponent<ComponentType>;
};

const windowRoutes: WindowRoute[] = [
  {
    index: true,
    path: "/",
    Component: lazy(() =>
      import("../pages/TaskPage.tsx").then((module) => ({ default: module.TaskPage })),
    ),
  },
  {
    path: "calendar",
    Component: lazy(() =>
      import("../pages/CalendarPage.tsx").then((module) => ({
        default: module.CalendarPage,
      })),
    ),
  },
  {
    path: "settings",
    Component: lazy(() =>
      import("../pages/SettingsPage.tsx").then((module) => ({
        default: module.SettingsPage,
      })),
    ),
  },
];

export function AppRoutes() {
  return (
    <HashRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route element={<AppShell />} path="/">
            {windowRoutes.map(({ Component, index, path }) => (
              <Route
                element={<Component />}
                index={index}
                key={path}
                path={index ? undefined : path}
              />
            ))}
          </Route>
          <Route element={<Navigate replace to="/" />} path="*" />
        </Routes>
      </Suspense>
    </HashRouter>
  );
}
