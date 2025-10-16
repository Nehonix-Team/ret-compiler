/**
 * Run Module
 *
 * Handles execution of .rel files with the interpreter.
 */

use std::fs;
use std::path::PathBuf;

use crate::lexer;
use crate::parser;
use crate::interpreter;

/// Run a .rel file with the interpreter
pub fn run_file(input: &PathBuf) -> Result<(), Box<dyn std::error::Error>> {
    println!("Running rel file: {:?}", input);

    // Read the file
    let content = fs::read_to_string(input)?;

    // Tokenize
    let lexer = lexer::Lexer::new(&content);
    let tokens = lexer.tokenize().map_err(|errors| {
        let error_messages: Vec<String> = errors
            .iter()
            .map(|e| format!("Line {}, Col {}: {}", e.line, e.column, e.message))
            .collect();
        format!("Tokenization failed:\n{}", error_messages.join("\n"))
    })?;

    // Parse
    let mut parser = parser::Parser::new(tokens);
    let ast_nodes = parser.parse().map_err(|errors| {
        let error_messages: Vec<String> = errors
            .iter()
            .map(|e| format!("Line {}, Col {}: {}", e.line, e.column, e.message))
            .collect();
        format!("Parsing failed:\n{}", error_messages.join("\n"))
    })?;

    // Execute
    let mut interpreter = interpreter::Interpreter::new();
    interpreter.execute(&ast_nodes).map_err(|errors| {
        let error_messages: Vec<String> = errors
            .iter()
            .map(|e| format!("Line {}, Col {}: {}", e.line, e.column, e.message))
            .collect();
        format!("Runtime error:\n{}", error_messages.join("\n"))
    })?;

    Ok(())
}