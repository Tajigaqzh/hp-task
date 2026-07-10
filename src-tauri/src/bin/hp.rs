/// 运行 hp 命令行入口，供终端、脚本和 MCP 工具调用。
fn main() -> std::process::ExitCode {
    hp_task_lib::cli::run_from_env()
}
