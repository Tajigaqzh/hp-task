use std::{env, process::ExitCode};

use crate::features::task::{TaskDraft, TaskStore, TaskUpdate};

/// 从当前进程参数执行 CLI，并把结果写入标准输出或标准错误。
pub fn run_from_env() -> ExitCode {
    let args = env::args().skip(1).collect::<Vec<_>>();

    match run(args) {
        Ok(message) => {
            println!("{message}");
            ExitCode::SUCCESS
        }
        Err(error) => {
            eprintln!("{error}");
            eprintln!();
            eprintln!("{}", usage());
            ExitCode::FAILURE
        }
    }
}

/// 执行 CLI 参数并返回可被 MCP 解析的文本结果。
pub fn run(args: Vec<String>) -> Result<String, String> {
    let Some(command) = args.first().map(String::as_str) else {
        return Ok(usage());
    };

    match command {
        "task" => run_task_command(&args[1..]),
        "-h" | "--help" | "help" => Ok(usage()),
        _ => Err(format!("未知命令: {command}")),
    }
}

/// 分发 task 子命令。
fn run_task_command(args: &[String]) -> Result<String, String> {
    let Some(command) = args.first().map(String::as_str) else {
        return Err("缺少 task 子命令".to_string());
    };

    let store = TaskStore::default();

    match command {
        "add" => {
            let draft = parse_task_add_args(&args[1..])?;
            let task = store.add(draft)?;
            serde_json::to_string_pretty(&task).map_err(|error| error.to_string())
        }
        "list" => {
            let tasks = store.list()?;
            serde_json::to_string_pretty(&tasks).map_err(|error| error.to_string())
        }
        "remove" => {
            let task_id = parse_task_remove_args(&args[1..])?;
            let removed = store.remove(&task_id)?;
            serde_json::to_string_pretty(&serde_json::json!({
                "id": task_id,
                "removed": removed
            }))
            .map_err(|error| error.to_string())
        }
        "update" => {
            let (task_id, update) = parse_task_update_args(&store, &args[1..])?;
            let task = store.update(&task_id, update)?;
            serde_json::to_string_pretty(&task).map_err(|error| error.to_string())
        }
        "complete" => {
            let task_id = parse_task_remove_args(&args[1..])?;
            let task = store.complete(&task_id)?;
            serde_json::to_string_pretty(&task).map_err(|error| error.to_string())
        }
        "-h" | "--help" | "help" => Ok(usage()),
        _ => Err(format!("未知 task 子命令: {command}")),
    }
}

/// 解析 task add 的命令行参数。
fn parse_task_add_args(args: &[String]) -> Result<TaskDraft, String> {
    let mut name = None;
    let mut info = None;
    let mut tag = None;
    let mut end_date = None;
    let mut index = 0;

    while index < args.len() {
        match args[index].as_str() {
            "--name" => name = Some(read_flag_value(args, &mut index, "--name")?),
            "--info" => info = Some(read_flag_value(args, &mut index, "--info")?),
            "--tag" => tag = Some(read_flag_value(args, &mut index, "--tag")?),
            "--endDate" | "--end-date" => {
                end_date = Some(read_flag_value(args, &mut index, "--endDate")?)
            }
            unknown => return Err(format!("未知参数: {unknown}")),
        }

        index += 1;
    }

    Ok(TaskDraft {
        name: required_value(name, "--name")?,
        info: required_value(info, "--info")?,
        tag,
        end_date,
    })
}

/// 解析 task remove 的任务 id 参数。
fn parse_task_remove_args(args: &[String]) -> Result<String, String> {
    match args {
        [id] => Ok(id.clone()),
        [flag, id] if flag == "--id" => Ok(id.clone()),
        [] => Err("缺少要删除的任务 id".to_string()),
        _ => Err("remove 只支持 `hp task remove <id>` 或 `hp task remove --id <id>`".to_string()),
    }
}

/// 解析 task update 的命令行参数，未传入字段沿用原任务内容。
fn parse_task_update_args(
    store: &TaskStore,
    args: &[String],
) -> Result<(String, TaskUpdate), String> {
    let mut task_id = None;
    let mut name = None;
    let mut info = None;
    let mut tag = None;
    let mut end_date = None;
    let mut index = 0;

    while index < args.len() {
        match args[index].as_str() {
            "--id" => task_id = Some(read_flag_value(args, &mut index, "--id")?),
            "--name" => name = Some(read_flag_value(args, &mut index, "--name")?),
            "--info" => info = Some(read_flag_value(args, &mut index, "--info")?),
            "--tag" => tag = Some(read_flag_value(args, &mut index, "--tag")?),
            "--endDate" | "--end-date" => {
                end_date = Some(read_flag_value(args, &mut index, "--endDate")?)
            }
            unknown if task_id.is_none() && !unknown.starts_with("--") => {
                task_id = Some(unknown.to_string());
            }
            unknown => return Err(format!("未知参数: {unknown}")),
        }

        index += 1;
    }

    let task_id = required_value(task_id, "--id")?;
    let task = store
        .list()?
        .into_iter()
        .find(|task| task.id == task_id)
        .ok_or_else(|| format!("任务不存在: {task_id}"))?;

    Ok((
        task_id,
        TaskUpdate {
            name: name.unwrap_or(task.name),
            info: info.unwrap_or(task.info),
            tag: tag.or(task.tag),
            end_date: end_date.or(task.end_date),
        },
    ))
}

/// 读取形如 `--name value` 的参数值，并把索引推进到值的位置。
fn read_flag_value(args: &[String], index: &mut usize, flag: &str) -> Result<String, String> {
    let value_index = *index + 1;
    let Some(value) = args.get(value_index) else {
        return Err(format!("参数 {flag} 缺少值"));
    };

    if value.starts_with("--") {
        return Err(format!("参数 {flag} 缺少值"));
    }

    *index = value_index;
    Ok(value.clone())
}

/// 校验必填参数已经传入。
fn required_value(value: Option<String>, flag: &str) -> Result<String, String> {
    value.ok_or_else(|| format!("缺少必填参数: {flag}"))
}

/// 返回 CLI 使用说明。
fn usage() -> String {
    [
        "用法:",
        "  hp task add --name <名称> --info <说明> [--tag <颜色>] [--endDate <日期>]",
        "  hp task list",
        "  hp task update <id> [--name <名称>] [--info <说明>] [--tag <颜色>] [--endDate <日期>]",
        "  hp task complete <id>",
        "  hp task remove <id>",
        "",
        "示例:",
        "  hp task add --name 初始化任务 --info 初始化事件 --tag \"#1ff\" --endDate 2026-07-03",
        "  hp task update task-1 --name 调整任务 --endDate 2026-07-14",
        "  hp task complete task-1",
    ]
    .join("\n")
}
