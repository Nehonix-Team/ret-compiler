mod lexer;
mod ast;
mod parser;
mod generator;
mod compiler;
mod resolver;
mod import_tracker;
mod validation;
mod colors;

use clap::{Parser, Subcommand};
use notify::{Config, RecommendedWatcher, RecursiveMode, Watcher};
use std::fs;
use std::path::PathBuf;
use std::sync::mpsc::channel;

#[derive(Parser)]
#[command(name = "rel")]
#[command(about = "Nehonix ReliantType Compiler - Compile .rel files to TypeScript schemas")]
#[command(version = "0.1.0")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
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
}

fn main() {
    let cli = Cli::parse();

    match cli.command {
        Commands::Build { input, output, watch } => {
            let options = compiler::CompilerOptions {
                input_dir: input,
                output_dir: output,
                watch,
            };

            let compiler = compiler::relCompiler::new(options);
            if let Err(e) = compiler.compile() {
                eprintln!("Compilation failed: {}", e);
                std::process::exit(1);
            }
        }
        Commands::Init { dir } => {
            let dir = dir.unwrap_or_else(|| PathBuf::from("."));
            println!("Initializing rel project in: {:?}", dir);
            if let Err(e) = init_project(&dir) {
                eprintln!("Failed to initialize project: {}", e);
                std::process::exit(1);
            }
        }
        Commands::Check { input } => {
            println!("Checking rel files in: {:?}", input);
            if let Err(e) = check_files(&input) {
                eprintln!("Check failed: {}", e);
                std::process::exit(1);
            }
        }
        Commands::Validate { input } => {
            println!("Validating rel files in: {:?}", input);
            if let Err(e) = validate_files(&input) {
                eprintln!("Validation failed: {}", e);
                std::process::exit(1);
            }
        }
        Commands::Watch { input, output } => {
            println!("Watching rel files in: {:?} for changes", input);
            if let Err(e) = watch_files(&input, output.as_ref()) {
                eprintln!("Watch failed: {}", e);
                std::process::exit(1);
            }
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
    }
}

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

fn init_project(dir: &PathBuf) -> Result<(), Box<dyn std::error::Error>> {
    println!("Creating rel project structure...");

    // Create schemas directory
    let schemas_dir = dir.join("schemas");
    fs::create_dir_all(&schemas_dir)?;

    // Create example schema file
    let example_schema = schemas_dir.join("User.rel");
    let example_content = r#"# Example User Schema
define User {
  id: number
  email: string & matches(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
  name: string & minLength(2)
  age: number & positive & integer & min(13) & max(120)
  role: admin | user | guest
  createdAt: date
  isActive: boolean = true
}

export User
"#;
    fs::write(&example_schema, example_content)?;

    // Create rel.json config file
    let config_content = r#"{
  "name": "my-rel-project",
  "version": "1.0.0",
  "schemas": "./schemas",
  "output": "./generated"
}"#;
    fs::write(dir.join("rel.json"), config_content)?;

    // Create README
    let readme_content = r#"# rel Project

This is a ReliantType Compiler project.

## Usage

```bash
# Build schemas
rel build

# Watch for changes
rel watch

# Validate schemas
rel check
```

## Project Structure

- `schemas/` - Your .rel schema files
- `generated/` - Generated TypeScript interfaces and schemas
- `rel.json` - Project configuration
"#;
    fs::write(dir.join("README.md"), readme_content)?;

    println!("✅ rel project initialized successfully!");
    println!("📁 Created directories: schemas/");
    println!("📄 Created files: schemas/User.rel, rel.json, README.md");

    Ok(())
}

fn check_files(input: &PathBuf) -> Result<(), Box<dyn std::error::Error>> {
    println!("Checking rel files...");

    let compiler = compiler::relCompiler::new(compiler::CompilerOptions {
        input_dir: input.clone(),
        output_dir: None,
        watch: false,
    });

    // For check, we just validate parsing without generating output
    let rel_files = compiler.find_rel_files(input)?;

    for file_path in rel_files {
        println!("Checking: {:?}", file_path);

        let content = fs::read_to_string(&file_path)?;
        let lexer = lexer::Lexer::new(&content);
        let tokens = lexer.tokenize().map_err(|errors| {
            format!("Tokenization failed for {:?}: {:?}", file_path, errors)
        })?;

        let mut parser = parser::Parser::new(tokens);
        parser.parse().map_err(|errors| {
            format!("Parsing failed for {:?}: {:?}", file_path, errors)
        })?;
    }

    println!("✅ All files checked successfully!");
    Ok(())
}

fn validate_files(input: &PathBuf) -> Result<(), Box<dyn std::error::Error>> {
    println!("Validating rel files with enhanced validation...");

    let compiler = compiler::relCompiler::new(compiler::CompilerOptions {
        input_dir: input.clone(),
        output_dir: None,
        watch: false,
    });

    // For validation, we compile to check for semantic errors
    let rel_files = compiler.find_rel_files(input)?;

    for file_path in rel_files {
        println!("Validating: {:?}", file_path);

        let content = fs::read_to_string(&file_path)?;
        let lexer = lexer::Lexer::new(&content);
        let tokens = lexer.tokenize().map_err(|errors| {
            format!("Tokenization failed for {:?}: {:?}", file_path, errors)
        })?;

        let mut parser = parser::Parser::new(tokens);
        let ast_nodes = parser.parse().map_err(|errors| {
            format!("Parsing failed for {:?}: {:?}", file_path, errors)
        })?;

        // Additional semantic validation
        // Check for undefined types, circular references, etc.
        if let Err(semantic_errors) = perform_semantic_validation(&ast_nodes) {
            for error in semantic_errors {
                println!("  Semantic error at line {}, col {}: {}",
                    error.line,
                    error.column,
                    error.message
                );
            }
            return Err(format!("Semantic validation failed for {:?}", file_path).into());
        }

        println!("✅ File is syntactically and semantically valid");
    }

    println!("✅ All files validated successfully!");
    Ok(())
}

fn watch_files(input: &PathBuf, output: Option<&PathBuf>) -> Result<(), Box<dyn std::error::Error>> {
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

                                    let options = compiler::CompilerOptions {
                                        input_dir: input.clone(),
                                        output_dir: output.cloned(),
                                        watch: false,
                                    };

                                    let compiler = compiler::relCompiler::new(options);
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

fn perform_semantic_validation(ast_nodes: &[crate::ast::ASTNode]) -> Result<(), Vec<crate::ast::ParseError>> {
    let mut errors = Vec::new();
    let mut defined_types = std::collections::HashSet::new();
    let mut used_types = std::collections::HashSet::new();

    // Collect defined types and check for basic semantic issues
    for node in ast_nodes {
        match node {
            crate::ast::ASTNode::Schema(schema) => {
                defined_types.insert(schema.name.clone());

                // Check for duplicate field names
                let mut field_names = std::collections::HashSet::new();
                for field in &schema.fields {
                    if !field_names.insert(field.name.clone()) {
                        errors.push(crate::ast::ParseError {
                            message: format!("Duplicate field name '{}' in schema '{}'", field.name, schema.name),
                            position: 0,
                            line: 0, // TODO: Track actual line numbers in AST nodes
                            column: 0,
                            context: Some(format!("Field '{}' already defined in schema '{}'", field.name, schema.name)),
                            file_path: None,
                        });
                    }

                    // Collect used types
                    collect_used_types(&field.field_type, &mut used_types);
                }
            }
            crate::ast::ASTNode::Enum(enum_node) => {
                defined_types.insert(enum_node.name.clone());

                // Check for duplicate enum values
                let mut values = std::collections::HashSet::new();
                for value in &enum_node.values {
                    if !values.insert(value.clone()) {
                        errors.push(crate::ast::ParseError {
                            message: format!("Duplicate enum value '{}' in enum '{}'", value, enum_node.name),
                            position: 0,
                            line: 0,
                            column: 0,
                            context: Some(format!("Value '{}' already defined in enum '{}'", value, enum_node.name)),
                            file_path: None,
                        });
                    }
                }
            }
            crate::ast::ASTNode::TypeAlias(type_alias) => {
                defined_types.insert(type_alias.name.clone());
                collect_used_types(&type_alias.type_definition, &mut used_types);
            }
            _ => {} // Other node types don't define types
        }
    }

    // Check for undefined types
    for used_type in &used_types {
        if !defined_types.contains(used_type) && !is_builtin_type(used_type) {
            errors.push(crate::ast::ParseError {
                message: format!("Undefined type '{}'", used_type),
                position: 0,
                line: 0,
                column: 0,
                context: Some(format!("Type '{}' is not defined in this scope", used_type)),
                file_path: None,
            });
        }
    }

    if errors.is_empty() {
        Ok(())
    } else {
        Err(errors)
    }
}

fn collect_used_types(type_node: &crate::ast::TypeNode, used_types: &mut std::collections::HashSet<String>) {
    match type_node {
        crate::ast::TypeNode::Identifier(name) => {
            used_types.insert(name.clone());
        }
        crate::ast::TypeNode::Array(inner) => {
            collect_used_types(inner, used_types);
        }
        crate::ast::TypeNode::Union(types) => {
            for t in types {
                collect_used_types(t, used_types);
            }
        }
        crate::ast::TypeNode::Generic(name, type_args) => {
            used_types.insert(name.clone());
            for arg in type_args {
                collect_used_types(arg, used_types);
            }
        }
        crate::ast::TypeNode::Conditional(conditional) => {
            collect_used_types(&conditional.then_value, used_types);
            if let Some(else_type) = &conditional.else_value {
                collect_used_types(else_type, used_types);
            }
        }
        _ => {} // Other types don't reference user-defined types
    }
}

fn is_builtin_type(name: &str) -> bool {
    matches!(
        name,
        "string" | "number" | "boolean" | "object" | "array" | "date" | "email" | "url" |
        "uuid" | "positive" | "negative" | "integer" | "float" | "any" | "unknown" | "null" | "undefined"
    )
}
