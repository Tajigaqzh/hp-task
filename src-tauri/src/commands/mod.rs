use crate::features::task::{Task, TaskDraft, TaskStore};

/// 返回一段用于验证前后端调用链路的问候文案。
#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

/// 从 Tauri 本地任务缓存读取全部任务。
#[tauri::command]
pub fn list_tasks() -> Result<Vec<Task>, String> {
    TaskStore::default().list()
}

/// 新增任务并写入 Tauri 本地任务缓存。
#[tauri::command]
pub fn add_task(draft: TaskDraft) -> Result<Task, String> {
    TaskStore::default().add(draft)
}

/// 从 Tauri 本地任务缓存删除指定任务。
#[tauri::command]
pub fn remove_task(task_id: &str) -> Result<bool, String> {
    TaskStore::default().remove(task_id)
}
