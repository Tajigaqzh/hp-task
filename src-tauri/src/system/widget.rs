use tauri::{AppHandle, Manager, Runtime, WebviewUrl, WebviewWindowBuilder};

const DESKTOP_WIDGET_LABEL: &str = "desktop-widget";
const DESKTOP_WIDGET_TITLE: &str = "HP Task Widget";

/// 创建或恢复桌面半透明任务组件窗口。
pub fn open<R: Runtime>(app: &AppHandle<R>) -> Result<(), String> {
    if let Some(window) = app.get_webview_window(DESKTOP_WIDGET_LABEL) {
        window.show().map_err(|error| error.to_string())?;
        window.unminimize().map_err(|error| error.to_string())?;
        window.set_focus().map_err(|error| error.to_string())?;
        return Ok(());
    }

    WebviewWindowBuilder::new(
        app,
        DESKTOP_WIDGET_LABEL,
        WebviewUrl::App("index.html".into()),
    )
    .title(DESKTOP_WIDGET_TITLE)
    .inner_size(320.0, 420.0)
    .position(48.0, 88.0)
    .resizable(false)
    .decorations(false)
    .transparent(true)
    .always_on_top(true)
    .skip_taskbar(true)
    .shadow(false)
    .build()
    .map_err(|error| error.to_string())?;

    Ok(())
}
