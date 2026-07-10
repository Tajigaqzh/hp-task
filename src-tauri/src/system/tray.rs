use tauri::{
    menu::{MenuBuilder, MenuEvent},
    tray::{MouseButton, MouseButtonState, TrayIcon, TrayIconBuilder, TrayIconEvent},
    App, AppHandle, Runtime,
};

use crate::system::window;

const MENU_SHOW_ID: &str = "show";
const MENU_QUIT_ID: &str = "quit";
const TRAY_TOOLTIP: &str = "hp-task";

/// 初始化系统托盘图标、托盘菜单和托盘事件。
pub fn setup<R: Runtime>(app: &mut App<R>) -> Result<(), Box<dyn std::error::Error>> {
    let menu = MenuBuilder::new(app)
        .text(MENU_SHOW_ID, "Show")
        .separator()
        .text(MENU_QUIT_ID, "Quit")
        .build()?;

    let mut tray = TrayIconBuilder::new()
        .menu(&menu)
        .tooltip(TRAY_TOOLTIP)
        .show_menu_on_left_click(false)
        .on_menu_event(handle_menu_event)
        .on_tray_icon_event(handle_tray_icon_event);

    if let Some(icon) = app.default_window_icon().cloned() {
        tray = tray.icon(icon);
    }

    tray.build(app)?;
    Ok(())
}

/// 根据托盘菜单项执行对应的应用操作。
fn handle_menu_event<R: Runtime>(app: &AppHandle<R>, event: MenuEvent) {
    match event.id().as_ref() {
        MENU_SHOW_ID => window::restore_main_window(app),
        MENU_QUIT_ID => app.exit(0),
        _ => {}
    }
}

/// 处理托盘图标点击事件，左键释放时恢复主窗口。
fn handle_tray_icon_event<R: Runtime>(tray: &TrayIcon<R>, event: TrayIconEvent) {
    if let TrayIconEvent::Click {
        button: MouseButton::Left,
        button_state: MouseButtonState::Up,
        ..
    } = event
    {
        window::restore_main_window(tray.app_handle());
    }
}
