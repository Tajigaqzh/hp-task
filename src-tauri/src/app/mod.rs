use crate::{
    commands,
    system::{tray, window},
};

/// 组装插件、系统托盘、窗口事件和前端命令，并运行 Tauri 应用。
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(tray::setup)
        .on_window_event(window::hide_on_close_requested)
        .invoke_handler(tauri::generate_handler![
            commands::greet,
            commands::list_tasks,
            commands::add_task,
            commands::remove_task
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
