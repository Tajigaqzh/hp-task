pub mod app;
pub mod cli;
pub mod commands;
pub mod features;
pub mod system;

/// 启动桌面端 Tauri 应用。
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    app::run();
}
