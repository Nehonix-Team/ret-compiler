/**
 * ANSI Color Codes for Terminal Output
 */

pub struct Colors;

impl Colors {
    // Basic colors
    pub const RESET: &'static str = "\x1b[0m";
    pub const BOLD: &'static str = "\x1b[1m";
    pub const DIM: &'static str = "\x1b[2m";
    
    // Foreground colors
    pub const RED: &'static str = "\x1b[31m";
    pub const GREEN: &'static str = "\x1b[32m";
    pub const YELLOW: &'static str = "\x1b[33m";
    pub const BLUE: &'static str = "\x1b[34m";
    pub const MAGENTA: &'static str = "\x1b[35m";
    pub const CYAN: &'static str = "\x1b[36m";
    pub const WHITE: &'static str = "\x1b[37m";
    pub const GRAY: &'static str = "\x1b[90m";
    
    // Bright colors
    pub const BRIGHT_RED: &'static str = "\x1b[91m";
    pub const BRIGHT_GREEN: &'static str = "\x1b[92m";
    pub const BRIGHT_YELLOW: &'static str = "\x1b[93m";
    pub const BRIGHT_BLUE: &'static str = "\x1b[94m";
    pub const BRIGHT_CYAN: &'static str = "\x1b[96m";
}

/// Format error message with color
pub fn error(msg: &str) -> String {
    format!("{}{}✗{} {}{}{}", 
        Colors::BOLD, Colors::RED, Colors::RESET,
        Colors::RED, msg, Colors::RESET)
}

/// Format success message with color
pub fn success(msg: &str) -> String {
    format!("{}{}✓{} {}{}{}", 
        Colors::BOLD, Colors::GREEN, Colors::RESET,
        Colors::GREEN, msg, Colors::RESET)
}

/// Format warning message with color
pub fn warning(msg: &str) -> String {
    format!("{}{}⚠{} {}{}{}", 
        Colors::BOLD, Colors::YELLOW, Colors::RESET,
        Colors::YELLOW, msg, Colors::RESET)
}

/// Format info message with color
pub fn info(msg: &str) -> String {
    format!("{}{}ℹ{} {}{}{}", 
        Colors::BOLD, Colors::CYAN, Colors::RESET,
        Colors::CYAN, msg, Colors::RESET)
}

/// Format file path with color
pub fn path(p: &str) -> String {
    format!("{}{}{}", Colors::BRIGHT_BLUE, p, Colors::RESET)
}

/// Format schema/type name with color
pub fn schema_name(name: &str) -> String {
    format!("{}{}{}", Colors::BRIGHT_CYAN, name, Colors::RESET)
}

/// Format dim text (for less important info)
pub fn dim(text: &str) -> String {
    format!("{}{}{}", Colors::DIM, text, Colors::RESET)
}

/// Format bold text
pub fn bold(text: &str) -> String {
    format!("{}{}{}", Colors::BOLD, text, Colors::RESET)
}
