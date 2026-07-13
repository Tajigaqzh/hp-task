use tauri::{
    AppHandle, Manager, PhysicalPosition, Position, Runtime, WebviewUrl, WebviewWindowBuilder,
    Window, WindowEvent,
};

use crate::features::settings::{SettingsStore, WindowPosition};

const DESKTOP_WIDGET_LABEL: &str = "desktop-widget";
const DESKTOP_WIDGET_TITLE: &str = "HP Task Widget";

/// 创建或恢复桌面半透明任务组件窗口。
pub fn open<R: Runtime>(app: &AppHandle<R>) -> Result<(), String> {
    show(app, true)
}

/// 应用启动时按用户设置恢复桌面组件。
pub fn restore_if_enabled<R: Runtime>(app: &AppHandle<R>) -> Result<(), String> {
    if SettingsStore::default().load()?.desktop_widget_enabled {
        show(app, false)?;
    }

    Ok(())
}

/// 切换桌面组件显示状态。
pub fn set_enabled<R: Runtime>(app: &AppHandle<R>, enabled: bool) -> Result<(), String> {
    if enabled {
        return open(app);
    }

    if let Some(window) = app.get_webview_window(DESKTOP_WIDGET_LABEL) {
        if let Ok(position) = window.outer_position() {
            save_position(position.x, position.y)?;
        }

        window.hide().map_err(|error| error.to_string())?;
    }

    SettingsStore::default().update(|settings| {
        settings.desktop_widget_enabled = false;
    })?;

    Ok(())
}

/// 保存桌面组件固定状态。
pub fn set_pinned(pinned: bool) -> Result<(), String> {
    SettingsStore::default().update(|settings| {
        settings.desktop_widget_pinned = pinned;
    })?;

    Ok(())
}

/// 监听桌面组件窗口移动和关闭，保存位置并同步显示状态。
pub fn handle_window_event<R: Runtime>(window: &Window<R>, event: &WindowEvent) {
    if window.label() != DESKTOP_WIDGET_LABEL {
        return;
    }

    match event {
        WindowEvent::Moved(position) => {
            let _ = save_position(position.x, position.y);
        }
        WindowEvent::CloseRequested { api, .. } => {
            api.prevent_close();
            if let Ok(position) = window.outer_position() {
                let _ = save_position(position.x, position.y);
            }
            let _ = SettingsStore::default().update(|settings| {
                settings.desktop_widget_enabled = false;
            });
            let _ = window.hide();
        }
        _ => {}
    }
}

fn show<R: Runtime>(app: &AppHandle<R>, focus: bool) -> Result<(), String> {
    let settings = SettingsStore::default().update(|settings| {
        settings.desktop_widget_enabled = true;
    })?;

    if let Some(window) = app.get_webview_window(DESKTOP_WIDGET_LABEL) {
        window.show().map_err(|error| error.to_string())?;
        window.unminimize().map_err(|error| error.to_string())?;
        if let Some(position) = settings.desktop_widget_position {
            window
                .set_position(Position::Physical(PhysicalPosition::new(
                    position.x, position.y,
                )))
                .map_err(|error| error.to_string())?;
        }
        if focus {
            window.set_focus().map_err(|error| error.to_string())?;
        }
        return Ok(());
    }

    let mut builder = WebviewWindowBuilder::new(
        app,
        DESKTOP_WIDGET_LABEL,
        WebviewUrl::App("index.html".into()),
    );

    builder = builder
        .title(DESKTOP_WIDGET_TITLE)
        .inner_size(320.0, 420.0)
        .resizable(false)
        .decorations(false)
        .transparent(true)
        .always_on_top(true)
        .skip_taskbar(true)
        .shadow(false);

    if let Some(position) = settings.desktop_widget_position {
        builder = builder.position(position.x as f64, position.y as f64);
    } else {
        builder = builder.position(48.0, 88.0);
    }

    let window = builder.build().map_err(|error| error.to_string())?;

    if focus {
        window.set_focus().map_err(|error| error.to_string())?;
    }

    Ok(())
}

fn save_position(x: i32, y: i32) -> Result<(), String> {
    SettingsStore::default().update(|settings| {
        settings.desktop_widget_position = Some(WindowPosition { x, y });
    })?;

    Ok(())
}
