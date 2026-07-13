use std::{
    path::{Path, PathBuf},
    thread,
    time::{Duration, Instant},
};

use notify::{Config, Event, EventKind, RecommendedWatcher, RecursiveMode, Watcher};
use tauri::{AppHandle, Emitter};

use crate::features::task::default_data_file;

const TASKS_CHANGED_EVENT: &str = "tasks://changed";
const EMIT_DEBOUNCE: Duration = Duration::from_millis(160);

/// 监听任务数据文件变化，让 CLI 等外部写入也能同步到已打开窗口。
pub fn setup(app: AppHandle) {
    let path = default_data_file();
    let watch_dir = path
        .parent()
        .map(Path::to_path_buf)
        .unwrap_or_else(|| PathBuf::from("."));

    thread::spawn(move || {
        if let Err(error) = run_file_watcher(app, path, watch_dir) {
            eprintln!("监听任务数据变化失败: {error}");
        }
    });
}

fn run_file_watcher(app: AppHandle, path: PathBuf, watch_dir: PathBuf) -> notify::Result<()> {
    std::fs::create_dir_all(&watch_dir)?;

    let file_name = path.file_name().map(|name| name.to_os_string());
    let mut last_emit = Instant::now() - EMIT_DEBOUNCE;
    let mut watcher = RecommendedWatcher::new(
        move |result: notify::Result<Event>| {
            let Ok(event) = result else {
                return;
            };

            if !is_relevant_event(&event) || !matches_target_file(&event, file_name.as_deref()) {
                return;
            }

            if last_emit.elapsed() < EMIT_DEBOUNCE {
                return;
            }

            last_emit = Instant::now();
            let _ = app.emit(TASKS_CHANGED_EVENT, ());
        },
        Config::default(),
    )?;

    watcher.watch(&watch_dir, RecursiveMode::NonRecursive)?;

    loop {
        thread::park();
    }
}

fn is_relevant_event(event: &Event) -> bool {
    matches!(
        event.kind,
        EventKind::Create(_) | EventKind::Modify(_) | EventKind::Remove(_)
    )
}

fn matches_target_file(event: &Event, file_name: Option<&std::ffi::OsStr>) -> bool {
    let Some(file_name) = file_name else {
        return false;
    };

    event
        .paths
        .iter()
        .any(|event_path| event_path.file_name() == Some(file_name))
}
