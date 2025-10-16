/**
 * rel Compiler - Main entry point
 */

use clap::Parser;

fn main() {
    let cli = rel::commands::Cli::parse();

    if let Err(e) = rel::commands::execute_command(cli) {
        eprintln!("Error: {}", e);
        std::process::exit(1);
    }
}
