use crate::{
    commands,
    system::{task_sync, tray, widget, window},
};

/// 组装插件、系统托盘、窗口事件和前端命令，并运行 Tauri 应用。
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_autostart::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            tray::setup(app)?;

            if let Err(error) = widget::restore_if_enabled(app.handle()) {
                eprintln!("恢复桌面组件失败: {error}");
            }

            task_sync::setup(app.handle().clone());

            Ok(())
        })
        .on_window_event(window::handle_window_event)
        .invoke_handler(tauri::generate_handler![
            commands::list_tasks,
            commands::add_task,
            commands::update_task,
            commands::complete_task,
            commands::remove_task,
            commands::open_desktop_widget,
            commands::get_app_settings,
            commands::update_app_preferences,
            commands::set_desktop_widget_enabled,
            commands::set_desktop_widget_pinned
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
