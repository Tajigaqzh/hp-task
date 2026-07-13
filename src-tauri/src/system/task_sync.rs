use std::{
    fs, thread,
    time::{Duration, SystemTime},
};

use tauri::{AppHandle, Emitter};

use crate::features::task::default_data_file;

const TASKS_CHANGED_EVENT: &str = "tasks://changed";
const POLL_INTERVAL: Duration = Duration::from_millis(800);

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
struct FileState {
    modified: Option<SystemTime>,
    len: u64,
    exists: bool,
}

/// 监听任务数据文件变化，让 CLI 等外部写入也能同步到已打开窗口。
pub fn setup(app: AppHandle) {
    let path = default_data_file();
    let mut last_state = read_file_state(&path);

    thread::spawn(move || loop {
        thread::sleep(POLL_INTERVAL);

        let next_state = read_file_state(&path);
        if next_state != last_state {
            last_state = next_state;
            let _ = app.emit(TASKS_CHANGED_EVENT, ());
        }
    });
}

fn read_file_state(path: &std::path::Path) -> FileState {
    match fs::metadata(path) {
        Ok(metadata) => FileState {
            modified: metadata.modified().ok(),
            len: metadata.len(),
            exists: true,
        },
        Err(_) => FileState {
            modified: None,
            len: 0,
            exists: false,
        },
    }
}
