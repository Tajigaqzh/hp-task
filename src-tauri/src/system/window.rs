use tauri::{AppHandle, Manager, Runtime, Window, WindowEvent};

use crate::system::widget;

const MAIN_WINDOW_LABEL: &str = "main";

/// 恢复主窗口显示，并把焦点切回主窗口。
pub fn restore_main_window<R: Runtime>(app: &AppHandle<R>) {
    if let Some(window) = app.get_webview_window(MAIN_WINDOW_LABEL) {
        let _ = window.show();
        let _ = window.unminimize();
        let _ = window.set_focus();
    }
}

/// 处理窗口事件，主窗口关闭改为隐藏，桌面组件事件交给组件模块同步状态。
pub fn handle_window_event<R: Runtime>(window: &Window<R>, event: &WindowEvent) {
    widget::handle_window_event(window, event);

    if let WindowEvent::CloseRequested { api, .. } = event {
        api.prevent_close();
        let _ = window.hide();
    }
}
