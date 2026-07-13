import { useEffect, type ReactNode } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { LucideIcon } from "lucide-react";
import { CalendarDays, CheckSquare, Home, Settings2 } from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

import { applyAppTheme } from "../../settings/theme.ts";
import type { AppSettings } from "../../types/settings.ts";

type ShellNavItemConfig = {
  end?: boolean;
  icon: LucideIcon;
  label: string;
  path: string;
};

const navItems: ShellNavItemConfig[] = [
  {
    end: true,
    icon: Home,
    label: "首页",
    path: "/",
  },
  {
    icon: CalendarDays,
    label: "日历",
    path: "/calendar",
  },
  {
    icon: Settings2,
    label: "设置",
    path: "/settings",
  },
] as const;

function ShellNavItem({
  children,
  end,
  icon: Icon,
  to,
}: {
  children: ReactNode;
  end?: boolean;
  icon: LucideIcon;
  to: string;
}) {
  return (
    <NavLink
      aria-label={String(children)}
      className={({ isActive }) =>
        `grid h-10 w-10 place-items-center rounded-lg border text-sm font-semibold transition ${
          isActive
            ? "border-[var(--app-accent)] bg-[var(--app-nav-active)] text-[var(--app-accent)]"
            : "border-[var(--app-border-strong)] bg-white text-[var(--app-text-secondary)] hover:border-[var(--app-border-hover)] hover:bg-[var(--app-surface-hover)] hover:text-[var(--app-text)]"
        }`
      }
      end={end}
      title={String(children)}
      to={to}
    >
      <Icon className="h-4 w-4" />
    </NavLink>
  );
}

export function AppShell() {
  const location = useLocation();
  const title =
    location.pathname === "/settings"
      ? "设置"
      : location.pathname === "/calendar"
        ? "日历"
        : "本地任务管理";

  useEffect(() => {
    invoke<AppSettings>("get_app_settings")
      .then((settings) => {
        applyAppTheme(settings ?? {});
      })
      .catch(() => {
        applyAppTheme({});
      });
  }, []);

  return (
    <main className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)]">
      <div className="grid min-h-screen grid-cols-[64px_1fr]">
        <aside className="flex flex-col items-center border-r border-[var(--app-border)] bg-[var(--app-sidebar)] px-3 py-4">
          <div className="mb-5">
            <div
              className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--app-accent-strong)] text-white shadow-sm"
              title="HP Task"
            >
              <CheckSquare className="h-4 w-4" />
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <ShellNavItem
                end={item.end}
                icon={item.icon}
                key={item.path}
                to={item.path}
              >
                {item.label}
              </ShellNavItem>
            ))}
          </nav>
        </aside>

        <section className="min-w-0">
          <header className="flex h-14 items-center justify-between border-b border-[var(--app-border)] bg-[var(--app-surface)] px-5">
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-[var(--app-text)]">
                {title}
              </h1>
            </div>
            <div className="h-2 w-2 rounded-full bg-[var(--app-accent)]" />
          </header>

          <div className="px-4 py-4 sm:px-5 lg:px-6">
            <Outlet />
          </div>
        </section>
      </div>
    </main>
  );
}
