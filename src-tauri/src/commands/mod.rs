use crate::features::{
    settings::{AppSettings, SettingsStore},
    task::{Task, TaskDraft, TaskStore, TaskUpdate},
};
use crate::system::widget;
use tauri::Emitter;

const TASKS_CHANGED_EVENT: &str = "tasks://changed";

/// 从 Tauri 本地任务缓存读取全部任务。
#[tauri::command]
pub fn list_tasks() -> Result<Vec<Task>, String> {
    TaskStore::default().list()
}

/// 新增任务并写入 Tauri 本地任务缓存。
#[tauri::command]
pub fn add_task(app: tauri::AppHandle, draft: TaskDraft) -> Result<Task, String> {
    let task = TaskStore::default().add(draft)?;
    emit_tasks_changed(&app);
    Ok(task)
}

/// 编辑指定任务。
#[tauri::command]
pub fn update_task(
    app: tauri::AppHandle,
    task_id: &str,
    update: TaskUpdate,
) -> Result<Option<Task>, String> {
    let task = TaskStore::default().update(task_id, update)?;
    if task.is_some() {
        emit_tasks_changed(&app);
    }
    Ok(task)
}

/// 把任务标记为已完成。
#[tauri::command]
pub fn complete_task(app: tauri::AppHandle, task_id: &str) -> Result<Option<Task>, String> {
    let task = TaskStore::default().complete(task_id)?;
    if task.is_some() {
        emit_tasks_changed(&app);
    }
    Ok(task)
}

/// 把已完成任务移回未完成。
#[tauri::command]
pub fn reopen_task(app: tauri::AppHandle, task_id: &str) -> Result<Option<Task>, String> {
    let task = TaskStore::default().reopen(task_id)?;
    if task.is_some() {
        emit_tasks_changed(&app);
    }
    Ok(task)
}

/// 从 Tauri 本地任务缓存删除指定任务。
#[tauri::command]
pub fn remove_task(app: tauri::AppHandle, task_id: &str) -> Result<bool, String> {
    let removed = TaskStore::default().remove(task_id)?;
    if removed {
        emit_tasks_changed(&app);
    }
    Ok(removed)
}

/// 打开或恢复桌面半透明任务组件窗口。
#[tauri::command]
pub async fn open_desktop_widget(app: tauri::AppHandle) -> Result<(), String> {
    widget::open(&app)
}

/// 读取应用设置。
#[tauri::command]
pub fn get_app_settings() -> Result<AppSettings, String> {
    SettingsStore::default().load()
}

/// 保存主题和桌面组件风格设置。
#[tauri::command]
pub fn update_app_preferences(theme: String, widget_style: String) -> Result<AppSettings, String> {
    SettingsStore::default().update(|settings| {
        settings.theme = theme;
        settings.widget_style = widget_style;
    })
}

/// 切换桌面组件开关。
#[tauri::command]
pub async fn set_desktop_widget_enabled(
    app: tauri::AppHandle,
    enabled: bool,
) -> Result<AppSettings, String> {
    widget::set_enabled(&app, enabled)?;
    SettingsStore::default().load()
}

/// 保存桌面组件固定状态。
#[tauri::command]
pub fn set_desktop_widget_pinned(pinned: bool) -> Result<(), String> {
    widget::set_pinned(pinned)
}

fn emit_tasks_changed(app: &tauri::AppHandle) {
    let _ = app.emit(TASKS_CHANGED_EVENT, ());
}
