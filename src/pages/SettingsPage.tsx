import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { disable, enable, isEnabled } from "@tauri-apps/plugin-autostart";
import { MonitorCog, Palette, Power } from "lucide-react";

import { DEFAULT_SETTINGS, mergeSettings } from "../settings/default-settings.ts";
import { applyAppTheme } from "../settings/theme.ts";
import {
  fieldClassName,
  panelClassName,
  secondaryButtonClassName,
} from "../shared/ui.ts";
import type { AppSettings } from "../types/settings.ts";

function SwitchControl({
  checked,
  disabled = false,
  label,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      aria-checked={checked}
      aria-label={label}
      className={`relative h-7 w-12 rounded-full border transition ${
        checked
          ? "border-[var(--app-accent-strong)] bg-[var(--app-accent-strong)]"
          : "border-[var(--app-border-strong)] bg-[var(--app-surface-hover)]"
      } disabled:cursor-not-allowed disabled:opacity-60`}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      role="switch"
      type="button"
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: typeof Palette; title: string }) {
  return (
    <div className="border-b border-[var(--app-border)] px-4 py-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-[var(--app-accent)]" />
        <h2 className="text-base font-bold text-[var(--app-text)]">{title}</h2>
      </div>
    </div>
  );
}

export function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [autostartEnabled, setAutostartEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const [loadedSettings, enabled] = await Promise.all([
          invoke<AppSettings>("get_app_settings"),
          isEnabled(),
        ]);
        const nextSettings = mergeSettings(loadedSettings ?? {});

        setSettings(nextSettings);
        applyAppTheme(nextSettings);
        setAutostartEnabled(enabled);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : String(loadError));
      }
    }

    void loadSettings();
  }, []);

  async function handleDesktopWidgetChange(enabled: boolean) {
    setBusy(true);
    setError(null);

    try {
      const nextSettings = await invoke<AppSettings>("set_desktop_widget_enabled", {
        enabled,
      });
      setSettings(mergeSettings(nextSettings ?? {}));
    } catch (changeError) {
      setError(changeError instanceof Error ? changeError.message : String(changeError));
    } finally {
      setBusy(false);
    }
  }

  async function handlePreferenceChange(next: Partial<AppSettings>) {
    const nextSettings = mergeSettings({ ...settings, ...next });
    setSettings(nextSettings);
    applyAppTheme(nextSettings);
    setError(null);

    try {
      const savedSettings = await invoke<AppSettings>("update_app_preferences", {
        theme: nextSettings.theme,
        appAccentColor: nextSettings.appAccentColor,
        widgetStyle: nextSettings.widgetStyle,
        widgetBackgroundColor: nextSettings.widgetBackgroundColor,
        widgetOpacity: nextSettings.widgetOpacity,
      });
      setSettings(mergeSettings(savedSettings ?? {}));
    } catch (changeError) {
      setError(changeError instanceof Error ? changeError.message : String(changeError));
    }
  }

  async function handleAutostartChange(enabled: boolean) {
    setBusy(true);
    setError(null);

    try {
      if (enabled) {
        await enable();
      } else {
        await disable();
      }

      setAutostartEnabled(await isEnabled());
    } catch (changeError) {
      setError(changeError instanceof Error ? changeError.message : String(changeError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-4">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : null}

      <section className={panelClassName}>
        <SectionHeader icon={Palette} title="外观" />
        <div className="grid gap-4 p-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--app-text-secondary)]">
            <span>主题</span>
            <select
              className={fieldClassName}
              onChange={(event) => {
                const { value } = event.currentTarget;
                void handlePreferenceChange({ theme: value });
              }}
              value={settings.theme}
            >
              <option value="system">跟随系统</option>
              <option value="light">浅色</option>
              <option value="dark">深色</option>
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--app-text-secondary)]">
            <span>系统主色</span>
            <div className="flex items-center gap-2">
              <input
                aria-label="系统主色"
                className="h-9 w-12 rounded-md border border-[var(--app-border-strong)] bg-white p-1"
                onChange={(event) => {
                  const { value } = event.currentTarget;
                  void handlePreferenceChange({ appAccentColor: value });
                }}
                type="color"
                value={settings.appAccentColor}
              />
              <input
                className={fieldClassName}
                onChange={(event) => {
                  const { value } = event.currentTarget;
                  void handlePreferenceChange({ appAccentColor: value });
                }}
                value={settings.appAccentColor}
              />
            </div>
          </label>
        </div>
      </section>

      <section className={panelClassName}>
        <SectionHeader icon={MonitorCog} title="桌面组件" />
        <div className="grid gap-4 p-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--app-text-secondary)]">
            <span>桌面组件风格</span>
            <select
              className={fieldClassName}
              onChange={(event) => {
                const { value } = event.currentTarget;
                void handlePreferenceChange({ widgetStyle: value });
              }}
              value={settings.widgetStyle}
            >
              <option value="compact">紧凑</option>
              <option value="comfortable">舒展</option>
              <option value="glass">半透明</option>
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--app-text-secondary)]">
            <span>小窗口背景</span>
            <div className="flex items-center gap-2">
              <input
                aria-label="小窗口背景"
                className="h-9 w-12 rounded-md border border-[var(--app-border-strong)] bg-white p-1"
                onChange={(event) => {
                  const { value } = event.currentTarget;
                  void handlePreferenceChange({ widgetBackgroundColor: value });
                }}
                type="color"
                value={settings.widgetBackgroundColor}
              />
              <input
                className={fieldClassName}
                onChange={(event) => {
                  const { value } = event.currentTarget;
                  void handlePreferenceChange({ widgetBackgroundColor: value });
                }}
                value={settings.widgetBackgroundColor}
              />
            </div>
          </label>

          <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--app-text-secondary)] sm:col-span-2">
            <span className="flex items-center justify-between gap-2">
              小窗口透明度
              <span className="text-xs text-[var(--app-text-muted)]">
                {Math.round(settings.widgetOpacity * 100)}%
              </span>
            </span>
            <input
              className="h-2 accent-[var(--app-accent)]"
              max="1"
              min="0.45"
              onChange={(event) => {
                const { valueAsNumber } = event.currentTarget;
                void handlePreferenceChange({ widgetOpacity: valueAsNumber });
              }}
              step="0.05"
              type="range"
              value={settings.widgetOpacity}
            />
          </label>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-[var(--app-border)] px-4 py-3">
          <div className="min-w-0">
            <p className="text-sm font-bold text-[var(--app-text)]">显示桌面组件</p>
            <p className="mt-1 text-sm leading-6 text-[var(--app-text-secondary)]">
              开启后会恢复到上次的位置，关闭后隐藏桌面组件。
            </p>
          </div>
          <SwitchControl
            checked={settings.desktopWidgetEnabled}
            disabled={busy}
            label="显示桌面组件"
            onChange={(checked) => void handleDesktopWidgetChange(checked)}
          />
        </div>
      </section>

      <section className={panelClassName}>
        <SectionHeader icon={Power} title="启动" />
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="min-w-0">
            <p className="text-sm font-bold text-[var(--app-text)]">开机自动启动</p>
            <p className="mt-1 text-sm leading-6 text-[var(--app-text-secondary)]">
              默认关闭；开启后由系统在登录时自动启动 HP Task。
            </p>
          </div>
          <SwitchControl
            checked={autostartEnabled}
            disabled={busy}
            label="开机自动启动"
            onChange={(checked) => void handleAutostartChange(checked)}
          />
        </div>
      </section>

      <button
        className={`${secondaryButtonClassName} w-fit`}
        onClick={() => {
          setSettings(DEFAULT_SETTINGS);
          applyAppTheme(DEFAULT_SETTINGS);
          void handlePreferenceChange(DEFAULT_SETTINGS);
        }}
        type="button"
      >
        恢复默认外观
      </button>
    </div>
  );
}
