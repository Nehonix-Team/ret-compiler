/**
 * rel - ReliantType Compiler Library
 *
 * This library provides the core functionality for compiling .rel files
 * to TypeScript interfaces and validation schemas.
 */

pub mod lexer;
pub mod parser;
pub mod ast;
pub mod generator;
pub mod compiler;
pub mod resolver;
pub mod import_tracker;
pub mod validation;
pub mod colors;

// Re-export main types for easy usage
pub use compiler::{rel, relCompiler, CompilerOptions};
pub use lexer::{Lexer, Token, TokenType};
pub use parser::Parser;