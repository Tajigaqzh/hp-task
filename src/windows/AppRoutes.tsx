import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";

type WindowRoute = {
  path: string;
  Component: LazyExoticComponent<ComponentType>;
};

const windowRoutes: WindowRoute[] = [
  {
    path: "/",
    Component: lazy(() =>
      import("./MainWindow.tsx").then((module) => ({ default: module.MainWindow })),
    ),
  },
  {
    path: "/settings",
    Component: lazy(() =>
      import("./SettingsWindow.tsx").then((module) => ({
        default: module.SettingsWindow,
      })),
    ),
  },
];

export function AppRoutes() {
  return (
    <HashRouter>
      <Suspense fallback={null}>
        <Routes>
          {windowRoutes.map(({ Component, path }) => (
            <Route element={<Component />} key={path} path={path} />
          ))}
          <Route element={<Navigate replace to="/" />} path="*" />
        </Routes>
      </Suspense>
    </HashRouter>
  );
}
