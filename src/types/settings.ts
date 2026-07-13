export interface WindowPosition {
  x: number;
  y: number;
}

export interface AppSettings {
  theme: string;
  appAccentColor: string;
  widgetStyle: string;
  widgetBackgroundColor: string;
  widgetOpacity: number;
  desktopWidgetEnabled: boolean;
  desktopWidgetPinned: boolean;
  desktopWidgetPosition?: WindowPosition | null;
}
