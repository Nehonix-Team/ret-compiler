/**
 * CLI Command Handlers
 *
 * This module contains the handlers for all CLI commands.
 */

use clap::{Parser, Subcommand};
use notify::Watcher;
use std::path::PathBuf;

use crate::lexer;
use crate::parser;
use crate::generator;
use crate::compiler;

#[derive(Parser)]
#[command(name = "rel")]
#[command(about = "Nehonix ReliantType Compiler - Compile .rel files to TypeScript schemas")]
#[command(version = "0.1.0")]
pub struct Cli {
    #[command(subcommand)]
    pub command: Commands,
}

#[derive(Subcommand)]
pub enum Commands {
    /// Compile .rel files to TypeScript
    Build {
        /// Input .rel file or directory
        #[arg(short, long)]
        input: PathBuf,

        /// Output directory for generated TypeScript files
        #[arg(short, long)]
        output: Option<PathBuf>,

        /// Watch mode - rebuild on file changes
        #[arg(long)]
        watch: bool,
    },
    /// Initialize a new rel project
    Init {
        /// Project directory (defaults to current directory)
        #[arg(short, long)]
        dir: Option<PathBuf>,
    },
    /// Check .rel files without generating output
    Check {
        /// Input .rel file or directory
        #[arg(short, long)]
        input: PathBuf,
    },
    /// Watch mode - rebuild on file changes
    Watch {
        /// Input .rel file or directory
        #[arg(short, long)]
        input: PathBuf,

        /// Output directory for generated TypeScript files
        #[arg(short, long)]
        output: Option<PathBuf>,
    },
    /// Validate .rel files without generating output
    Validate {
        /// Input .rel file or directory
        #[arg(short, long)]
        input: PathBuf,
    },
    /// Test the lexer with sample input
    TestLexer {
        /// Input string to tokenize
        input: String,
    },
    /// Test the parser with sample input
    TestParser {
        /// Input string to parse
        input: String,
    },
    /// Test the generator with sample input
    TestGenerator {
        /// Input string to generate TypeScript from
        input: String,
    },
    /// Run a .rel file with the interpreter
    Run {
        /// Input .rel file to execute
        #[arg(short, long)]
        input: PathBuf,
    },
}

pub fn execute_command(cli: Cli) -> Result<(), Box<dyn std::error::Error>> {
    match cli.command {
        Commands::Build { input, output, watch } => {
            let options = compiler::CompilerOptions {
                input_dir: input,
                output_dir: output,
                watch,
            };

            let compiler = compiler::relCompiler::new(options);
            compiler.compile()?;
        }
        Commands::Init { dir } => {
            let dir = dir.unwrap_or_else(|| PathBuf::from("."));
            println!("Initializing rel project in: {:?}", dir);
            crate::project::init_project(&dir)?;
        }
        Commands::Check { input } => {
            println!("Checking rel files in: {:?}", input);
            crate::validation::check_files(&input)?;
        }
        Commands::Validate { input } => {
            println!("Validating rel files in: {:?}", input);
            crate::validation::validate_files(&input)?;
        }
        Commands::Watch { input, output } => {
            println!("Watching rel files in: {:?} for changes", input);
            crate::watch::watch_files(&input, output.as_ref())?;
        }
        Commands::TestLexer { input } => {
            test_lexer(&input);
        }
        Commands::TestParser { input } => {
            test_parser(&input);
        }
        Commands::TestGenerator { input } => {
            test_generator(&input);
        }
        Commands::Run { input } => {
            crate::run::run_file(&input)?;
        }
    }

    Ok(())
}

// ============================================================================
// SECTION: Test Commands
// ============================================================================

fn test_lexer(input: &str) {
    println!("Testing lexer with input: {}", input);
    println!("Input length: {}", input.len());

    let lexer = lexer::Lexer::new(input);
    match lexer.tokenize() {
        Ok(tokens) => {
            println!("Tokenization successful! {} tokens:", tokens.len());
            for (i, token) in tokens.iter().enumerate() {
                println!("  {}. {:?} '{}' at line {}, col {}",
                    i + 1,
                    token.token_type,
                    token.value,
                    token.line,
                    token.column
                );
            }
        }
        Err(errors) => {
            println!("Tokenization failed with {} errors:", errors.len());
            for error in errors {
                println!("  Error at line {}, col {}: {}",
                    error.line,
                    error.column,
                    error.message
                );
            }
        }
    }
}

fn test_parser(input: &str) {
    println!("Testing parser with input: {}", input);
    println!("Input length: {}", input.len());

    let lexer = lexer::Lexer::new(input);
    match lexer.tokenize() {
        Ok(tokens) => {
            println!("Tokenization successful! {} tokens:", tokens.len());

            let mut parser = parser::Parser::new(tokens);
            match parser.parse() {
                Ok(nodes) => {
                    println!("Parsing successful! {} AST nodes:", nodes.len());
                    for (i, node) in nodes.iter().enumerate() {
                        println!("  {}. {:?}", i + 1, node);
                    }
                }
                Err(errors) => {
                    println!("Parsing failed with {} errors:", errors.len());
                    for error in errors {
                        println!("  Error at line {}, col {}: {}",
                            error.line,
                            error.column,
                            error.message
                        );
                    }
                }
            }
        }
        Err(errors) => {
            println!("Tokenization failed with {} errors:", errors.len());
            for error in errors {
                println!("  Error at line {}, col {}: {}",
                    error.line,
                    error.column,
                    error.message
                );
            }
        }
    }
}

fn test_generator(input: &str) {
    println!("Testing generator with input: {}", input);
    println!("Input length: {}", input.len());

    let lexer = lexer::Lexer::new(input);
    match lexer.tokenize() {
        Ok(tokens) => {
            println!("Tokenization successful! {} tokens:", tokens.len());

            let mut parser = parser::Parser::new(tokens);
            match parser.parse() {
                Ok(nodes) => {
                    println!("Parsing successful! {} AST nodes:", nodes.len());

                    let mut generator = generator::TypeScriptGenerator::new();
                    let output = generator.generate(&nodes);

                    println!("Generated TypeScript:");
                    println!("{}", output);
                }
                Err(errors) => {
                    println!("Parsing failed with {} errors:", errors.len());
                    for error in errors {
                        println!("  Error at line {}, col {}: {}",
                            error.line,
                            error.column,
                            error.message
                        );
                    }
                }
            }
        }
        Err(errors) => {
            println!("Tokenization failed with {} errors:", errors.len());
            for error in errors {
                println!("  Error at line {}, col {}: {}",
                    error.line,
                    error.column,
                    error.message
                );
            }
        }
    }
}