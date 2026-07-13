import type { AppSettings } from "../types/settings.ts";
import { DEFAULT_SETTINGS } from "./default-settings.ts";

function clampChannel(value: number) {
  return Math.max(0, Math.min(255, value));
}

function normalizeHexColor(value: string | null | undefined, fallback: string) {
  if (!value) {
    return fallback;
  }

  const color = value.trim();
  if (/^#[0-9a-f]{6}$/i.test(color)) {
    return color;
  }

  return fallback;
}

function hexToRgb(hex: string) {
  const normalized = normalizeHexColor(hex, DEFAULT_SETTINGS.appAccentColor);
  const value = Number.parseInt(normalized.slice(1), 16);

  return {
    r: clampChannel((value >> 16) & 255),
    g: clampChannel((value >> 8) & 255),
    b: clampChannel(value & 255),
  };
}

function mixWithWhite(hex: string, amount: number) {
  const { r, g, b } = hexToRgb(hex);
  const mix = (channel: number) => Math.round(channel + (255 - channel) * amount);

  return `rgb(${mix(r)} ${mix(g)} ${mix(b)})`;
}

export function getNormalizedAppSettings(settings: Partial<AppSettings>) {
  return {
    ...DEFAULT_SETTINGS,
    ...settings,
    appAccentColor: normalizeHexColor(
      settings.appAccentColor,
      DEFAULT_SETTINGS.appAccentColor,
    ),
    widgetBackgroundColor: normalizeHexColor(
      settings.widgetBackgroundColor,
      DEFAULT_SETTINGS.widgetBackgroundColor,
    ),
    widgetOpacity: Math.max(
      0.45,
      Math.min(1, settings.widgetOpacity ?? DEFAULT_SETTINGS.widgetOpacity),
    ),
  };
}

export function applyAppTheme(settings: Partial<AppSettings>) {
  const nextSettings = getNormalizedAppSettings(settings);
  const root = document.documentElement;

  root.style.setProperty("--app-accent", nextSettings.appAccentColor);
  root.style.setProperty("--app-accent-strong", nextSettings.appAccentColor);
  root.style.setProperty("--app-accent-soft", `${nextSettings.appAccentColor}26`);
  root.style.setProperty(
    "--app-nav-active",
    mixWithWhite(nextSettings.appAccentColor, 0.84),
  );
}

export function getWidgetStyle(settings: Partial<AppSettings>) {
  const nextSettings = getNormalizedAppSettings(settings);
  const { r, g, b } = hexToRgb(nextSettings.widgetBackgroundColor);

  return {
    backgroundColor: `rgb(${r} ${g} ${b} / ${nextSettings.widgetOpacity})`,
  };
}
