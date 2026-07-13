import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { disable, enable, isEnabled } from "@tauri-apps/plugin-autostart";
import { ArrowLeft, MonitorCog, Palette, Power, Settings2 } from "lucide-react";
import { Link } from "react-router-dom";

import type { AppSettings } from "../types/settings.ts";

const DEFAULT_SETTINGS: AppSettings = {
  theme: "system",
  widgetStyle: "compact",
  desktopWidgetEnabled: false,
  desktopWidgetPinned: false,
  desktopWidgetPosition: null,
};

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
        checked ? "border-[#173b3f] bg-[#173b3f]" : "border-[#cbd9d5] bg-[#eef4f2]"
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

export function SettingsWindow() {
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

        setSettings({ ...DEFAULT_SETTINGS, ...loadedSettings });
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
      setSettings({ ...DEFAULT_SETTINGS, ...nextSettings });
    } catch (changeError) {
      setError(changeError instanceof Error ? changeError.message : String(changeError));
    } finally {
      setBusy(false);
    }
  }

  async function handlePreferenceChange(next: Partial<AppSettings>) {
    const nextSettings = { ...settings, ...next };
    setSettings(nextSettings);
    setError(null);

    try {
      const savedSettings = await invoke<AppSettings>("update_app_preferences", {
        theme: nextSettings.theme,
        widgetStyle: nextSettings.widgetStyle,
      });
      setSettings({ ...DEFAULT_SETTINGS, ...savedSettings });
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
    <main className="min-h-screen bg-[#edf3f1] text-[#162427]">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-5 py-6 sm:px-8">
        <header className="flex items-center justify-between rounded-lg border border-[#d4dedb] bg-white/90 px-5 py-4 shadow-sm shadow-[#17312e]/5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#e2f0ec] text-[#2f6f63]">
              <Settings2 className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase text-[#66807b]">HP Task</p>
              <h1 className="text-2xl font-semibold tracking-normal text-[#13282b]">
                设置
              </h1>
            </div>
          </div>
          <Link
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#cbd9d5] bg-white px-3 text-sm font-semibold text-[#48635f] transition hover:border-[#9fb3ae] hover:bg-[#f2f7f5]"
            to="/"
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </Link>
        </header>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}

        <section className="rounded-lg border border-[#d4dedb] bg-white shadow-sm shadow-[#17312e]/5">
          <div className="border-b border-[#edf2f0] px-5 py-4">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-[#2f6f63]" />
              <h2 className="text-lg font-semibold text-[#13282b]">外观</h2>
            </div>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-semibold text-[#344f4b]">
              <span>主题</span>
              <select
                className="h-10 rounded-lg border border-[#cbd9d5] bg-[#fbfdfc] px-3 text-[#13282b] outline-none transition hover:border-[#aebfba] focus:border-[#2f6f63] focus:bg-white focus:ring-2 focus:ring-[#2f6f63]/15"
                onChange={(event) =>
                  void handlePreferenceChange({ theme: event.currentTarget.value })
                }
                value={settings.theme}
              >
                <option value="system">跟随系统</option>
                <option value="light">浅色</option>
                <option value="dark">深色</option>
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-semibold text-[#344f4b]">
              <span>桌面组件风格</span>
              <select
                className="h-10 rounded-lg border border-[#cbd9d5] bg-[#fbfdfc] px-3 text-[#13282b] outline-none transition hover:border-[#aebfba] focus:border-[#2f6f63] focus:bg-white focus:ring-2 focus:ring-[#2f6f63]/15"
                onChange={(event) =>
                  void handlePreferenceChange({ widgetStyle: event.currentTarget.value })
                }
                value={settings.widgetStyle}
              >
                <option value="compact">紧凑</option>
                <option value="comfortable">舒展</option>
                <option value="glass">半透明</option>
              </select>
            </label>
          </div>
        </section>

        <section className="rounded-lg border border-[#d4dedb] bg-white shadow-sm shadow-[#17312e]/5">
          <div className="border-b border-[#edf2f0] px-5 py-4">
            <div className="flex items-center gap-2">
              <MonitorCog className="h-4 w-4 text-[#2f6f63]" />
              <h2 className="text-lg font-semibold text-[#13282b]">桌面组件</h2>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#13282b]">显示桌面组件</p>
              <p className="mt-1 text-sm leading-6 text-[#667a76]">
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

        <section className="rounded-lg border border-[#d4dedb] bg-white shadow-sm shadow-[#17312e]/5">
          <div className="border-b border-[#edf2f0] px-5 py-4">
            <div className="flex items-center gap-2">
              <Power className="h-4 w-4 text-[#2f6f63]" />
              <h2 className="text-lg font-semibold text-[#13282b]">启动</h2>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#13282b]">开机自动启动</p>
              <p className="mt-1 text-sm leading-6 text-[#667a76]">
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
      </div>
    </main>
  );
}
