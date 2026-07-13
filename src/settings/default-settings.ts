import type { AppSettings } from "../types/settings.ts";

export const DEFAULT_SETTINGS: AppSettings = {
  theme: "system",
  appAccentColor: "#2f6f63",
  widgetStyle: "compact",
  widgetBackgroundColor: "#173b3f",
  widgetOpacity: 0.95,
  desktopWidgetEnabled: false,
  desktopWidgetPinned: false,
  desktopWidgetPosition: null,
};

export function mergeSettings(settings: Partial<AppSettings>): AppSettings {
  return { ...DEFAULT_SETTINGS, ...settings };
}
