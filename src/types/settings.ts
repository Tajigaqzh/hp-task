export interface WindowPosition {
  x: number;
  y: number;
}

export interface AppSettings {
  theme: string;
  widgetStyle: string;
  desktopWidgetEnabled: boolean;
  desktopWidgetPinned: boolean;
  desktopWidgetPosition?: WindowPosition | null;
}
