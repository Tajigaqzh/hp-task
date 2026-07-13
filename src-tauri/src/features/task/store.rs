use std::{
    env, fs,
    path::{Path, PathBuf},
    time::{SystemTime, UNIX_EPOCH},
};

use super::{Task, TaskDraft, TaskUpdate};

const DATA_DIR_ENV: &str = "HP_TASK_DATA_DIR";
const DATA_FILE_NAME: &str = "tasks.json";

/// 负责把任务数据读写到本机用户数据目录。
pub struct TaskStore {
    path: PathBuf,
}

impl Default for TaskStore {
    /// 创建使用默认数据路径的任务存储。
    fn default() -> Self {
        Self::new(default_data_file())
    }
}

impl TaskStore {
    /// 创建指定数据文件路径的任务存储。
    pub fn new(path: PathBuf) -> Self {
        Self { path }
    }

    /// 新增任务并返回完整任务数据。
    pub fn add(&self, draft: TaskDraft) -> Result<Task, String> {
        let mut tasks = self.load_all()?;
        let now = current_timestamp_millis()?;
        let task = Task {
            id: format!("task-{now}"),
            name: draft.name,
            info: draft.info,
            tag: draft.tag,
            end_date: draft.end_date,
            created_at: now,
            completed_at: None,
        };

        tasks.push(task.clone());
        self.save_all(&tasks)?;
        Ok(task)
    }

    /// 读取全部任务。
    pub fn list(&self) -> Result<Vec<Task>, String> {
        self.load_all()
    }

    /// 编辑指定任务，返回更新后的任务。
    pub fn update(&self, task_id: &str, update: TaskUpdate) -> Result<Option<Task>, String> {
        let mut tasks = self.load_all()?;
        let mut updated_task = None;

        if let Some(task) = tasks.iter_mut().find(|task| task.id == task_id) {
            task.name = update.name;
            task.info = update.info;
            task.tag = update.tag;
            task.end_date = update.end_date;
            updated_task = Some(task.clone());
        }

        if updated_task.is_some() {
            self.save_all(&tasks)?;
        }

        Ok(updated_task)
    }

    /// 把任务标记为已完成。
    pub fn complete(&self, task_id: &str) -> Result<Option<Task>, String> {
        let mut tasks = self.load_all()?;
        let now = current_timestamp_millis()?;
        let mut completed_task = None;

        if let Some(task) = tasks.iter_mut().find(|task| task.id == task_id) {
            task.completed_at = Some(now);
            completed_task = Some(task.clone());
        }

        if completed_task.is_some() {
            self.save_all(&tasks)?;
        }

        Ok(completed_task)
    }

    /// 把已完成任务移回未完成。
    pub fn reopen(&self, task_id: &str) -> Result<Option<Task>, String> {
        let mut tasks = self.load_all()?;
        let mut reopened_task = None;

        if let Some(task) = tasks.iter_mut().find(|task| task.id == task_id) {
            task.completed_at = None;
            reopened_task = Some(task.clone());
        }

        if reopened_task.is_some() {
            self.save_all(&tasks)?;
        }

        Ok(reopened_task)
    }

    /// 按任务 id 删除任务，返回是否确实删除了数据。
    pub fn remove(&self, task_id: &str) -> Result<bool, String> {
        let mut tasks = self.load_all()?;
        let original_len = tasks.len();

        tasks.retain(|task| task.id != task_id);
        let removed = tasks.len() != original_len;

        if removed {
            self.save_all(&tasks)?;
        }

        Ok(removed)
    }

    /// 从磁盘读取全部任务数据。
    fn load_all(&self) -> Result<Vec<Task>, String> {
        if !self.path.exists() {
            return Ok(Vec::new());
        }

        let content = fs::read_to_string(&self.path)
            .map_err(|error| format!("读取任务数据失败 {}: {error}", self.path.display()))?;

        if content.trim().is_empty() {
            return Ok(Vec::new());
        }

        serde_json::from_str(&content)
            .map_err(|error| format!("解析任务数据失败 {}: {error}", self.path.display()))
    }

    /// 把全部任务数据写回磁盘。
    fn save_all(&self, tasks: &[Task]) -> Result<(), String> {
        if let Some(parent) = self.path.parent() {
            fs::create_dir_all(parent)
                .map_err(|error| format!("创建任务数据目录失败 {}: {error}", parent.display()))?;
        }

        let content = serde_json::to_string_pretty(tasks).map_err(|error| error.to_string())?;
        fs::write(&self.path, content)
            .map_err(|error| format!("写入任务数据失败 {}: {error}", self.path.display()))
    }
}

/// 生成默认任务数据文件路径。
pub fn default_data_file() -> PathBuf {
    data_dir().join(DATA_FILE_NAME)
}

/// 生成应用默认用户数据目录。
fn data_dir() -> PathBuf {
    if let Some(path) = env::var_os(DATA_DIR_ENV) {
        return PathBuf::from(path);
    }

    if let Some(path) = env::var_os("APPDATA") {
        return Path::new(&path).join("hp-task");
    }

    if let Some(path) = env::var_os("XDG_DATA_HOME") {
        return Path::new(&path).join("hp-task");
    }

    if let Some(path) = env::var_os("HOME") {
        return Path::new(&path)
            .join(".local")
            .join("share")
            .join("hp-task");
    }

    PathBuf::from(".hp-task")
}

/// 返回当前 Unix 毫秒时间戳。
fn current_timestamp_millis() -> Result<u128, String> {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis())
        .map_err(|error| format!("获取系统时间失败: {error}"))
}
