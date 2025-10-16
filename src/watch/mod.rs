/**
 * Watch Module
 *
 * Handles file watching and automatic recompilation.
 */

use notify::{Config, RecommendedWatcher, RecursiveMode, Watcher};
use std::path::PathBuf;
use std::sync::mpsc::channel;

/// Watch .rel files for changes and recompile automatically
pub fn watch_files(input: &PathBuf, output: Option<&PathBuf>) -> Result<(), Box<dyn std::error::Error>> {
    println!("Watching rel files in: {:?} for changes", input);

    let (tx, rx) = channel();

    let mut watcher = RecommendedWatcher::new(tx, Config::default())?;

    watcher.watch(input, RecursiveMode::Recursive)?;

    println!("👀 Watching for file changes... Press Ctrl+C to stop");

    loop {
        match rx.recv() {
            Ok(Ok(event)) => {
                match event {
                    notify::Event { kind: notify::EventKind::Modify(_), paths, .. } => {
                        for path in paths {
                            if let Some(ext) = path.extension() {
                                if ext == "rel" {
                                    println!("🔄 File changed: {:?}", path);
                                    println!("🔨 Recompiling...");

                                    let options = crate::compiler::CompilerOptions {
                                        input_dir: input.clone(),
                                        output_dir: output.cloned(),
                                        watch: false,
                                    };

                                    let compiler = crate::compiler::relCompiler::new(options);
                                    if let Err(e) = compiler.compile() {
                                        eprintln!("❌ Compilation failed: {}", e);
                                    } else {
                                        println!("✅ Compilation successful");
                                    }
                                }
                            }
                        }
                    }
                    _ => {} // Ignore other event types
                }
            }
            Ok(Err(e)) => {
                eprintln!("Watch event error: {:?}", e);
            }
            Err(e) => {
                eprintln!("Watch error: {:?}", e);
                break;
            }
        }
    }

    Ok(())
}