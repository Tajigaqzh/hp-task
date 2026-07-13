use std::{
    env, fs,
    path::{Path, PathBuf},
};

use serde::{Deserialize, Serialize};

const DATA_DIR_ENV: &str = "HP_TASK_DATA_DIR";
const SETTINGS_FILE_NAME: &str = "settings.json";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WindowPosition {
    pub x: i32,
    pub y: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    #[serde(default)]
    pub theme: String,
    #[serde(default, rename = "widgetStyle")]
    pub widget_style: String,
    #[serde(default, rename = "desktopWidgetEnabled")]
    pub desktop_widget_enabled: bool,
    #[serde(default, rename = "desktopWidgetPinned")]
    pub desktop_widget_pinned: bool,
    #[serde(default, rename = "desktopWidgetPosition")]
    pub desktop_widget_position: Option<WindowPosition>,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            theme: "system".to_string(),
            widget_style: "compact".to_string(),
            desktop_widget_enabled: false,
            desktop_widget_pinned: false,
            desktop_widget_position: None,
        }
    }
}

pub struct SettingsStore {
    path: PathBuf,
}

impl Default for SettingsStore {
    fn default() -> Self {
        Self::new(default_settings_file())
    }
}

impl SettingsStore {
    pub fn new(path: PathBuf) -> Self {
        Self { path }
    }

    pub fn load(&self) -> Result<AppSettings, String> {
        if !self.path.exists() {
            return Ok(AppSettings::default());
        }

        let content = fs::read_to_string(&self.path)
            .map_err(|error| format!("读取设置失败 {}: {error}", self.path.display()))?;

        if content.trim().is_empty() {
            return Ok(AppSettings::default());
        }

        serde_json::from_str(&content)
            .map_err(|error| format!("解析设置失败 {}: {error}", self.path.display()))
    }

    pub fn save(&self, settings: &AppSettings) -> Result<(), String> {
        if let Some(parent) = self.path.parent() {
            fs::create_dir_all(parent)
                .map_err(|error| format!("创建设置目录失败 {}: {error}", parent.display()))?;
        }

        let content = serde_json::to_string_pretty(settings).map_err(|error| error.to_string())?;
        fs::write(&self.path, content)
            .map_err(|error| format!("写入设置失败 {}: {error}", self.path.display()))
    }

    pub fn update<F>(&self, update: F) -> Result<AppSettings, String>
    where
        F: FnOnce(&mut AppSettings),
    {
        let mut settings = self.load()?;
        update(&mut settings);
        self.save(&settings)?;
        Ok(settings)
    }
}

fn default_settings_file() -> PathBuf {
    data_dir().join(SETTINGS_FILE_NAME)
}

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
