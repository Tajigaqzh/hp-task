use serde::{Deserialize, Serialize};

/// 命令行创建任务时接收的输入数据。
#[derive(Debug, Clone, Deserialize)]
pub struct TaskDraft {
    pub name: String,
    pub info: String,
    pub tag: Option<String>,
    #[serde(rename = "endDate")]
    pub end_date: Option<String>,
}

/// 编辑任务时接收的输入数据。
#[derive(Debug, Clone, Deserialize)]
pub struct TaskUpdate {
    pub name: String,
    pub info: String,
    pub tag: Option<String>,
    #[serde(rename = "endDate")]
    pub end_date: Option<String>,
}

/// 应用内部和 CLI 输出共用的任务数据结构。
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Task {
    pub id: String,
    pub name: String,
    pub info: String,
    pub tag: Option<String>,
    #[serde(rename = "endDate")]
    pub end_date: Option<String>,
    #[serde(rename = "createdAt")]
    pub created_at: u128,
    #[serde(default, rename = "completedAt")]
    pub completed_at: Option<u128>,
}
