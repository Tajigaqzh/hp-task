use tauri::{AppHandle, Manager, Runtime, Window, WindowEvent};

const MAIN_WINDOW_LABEL: &str = "main";

/// 恢复主窗口显示，并把焦点切回主窗口。
pub fn restore_main_window<R: Runtime>(app: &AppHandle<R>) {
    if let Some(window) = app.get_webview_window(MAIN_WINDOW_LABEL) {
        let _ = window.show();
        let _ = window.unminimize();
        let _ = window.set_focus();
    }
}

/// 拦截窗口关闭事件，改为隐藏窗口，让应用继续保留在系统托盘中。
pub fn hide_on_close_requested<R: Runtime>(window: &Window<R>, event: &WindowEvent) {
    if let WindowEvent::CloseRequested { api, .. } = event {
        api.prevent_close();
        let _ = window.hide();
    }
}
