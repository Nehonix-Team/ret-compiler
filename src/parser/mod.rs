/**
 * rel Parser - Converts tokens to AST
 * 
 * This module is organized into sub-modules for better maintainability:
 * - schema: Schema and field parsing
 * - types: Type and constraint parsing
 * - expressions: Expression parsing
 * - statements: Top-level statements (import, export, enum, etc.)
 * - helpers: Utility functions for parsing
 */

mod schema;
mod types;
mod expressions;
mod statements;
mod helpers;

use crate::ast::*;
use crate::lexer::{Token, TokenType};

pub struct Parser {
    tokens: Vec<Token>,
    current: usize,
    errors: Vec<ParseError>,
}

impl Parser {
    pub fn new(tokens: Vec<Token>) -> Self {
        Self {
            tokens,
            current: 0,
            errors: Vec::new(),
        }
    }

    pub fn parse(&mut self) -> Result<Vec<ASTNode>, Vec<ParseError>> {
        let mut nodes = Vec::new();

        while !self.is_at_end() {
            match self.parse_top_level() {
                Ok(node) => nodes.push(node),
                Err(error) => {
                    self.errors.push(error);
                    // Try to recover by skipping to next statement
                    self.synchronize();
                }
            }
        }

        if self.errors.is_empty() {
            Ok(nodes)
        } else {
            Err(self.errors.clone())
        }
    }

    fn parse_top_level(&mut self) -> Result<ASTNode, ParseError> {
        match self.peek().token_type {
            TokenType::Define => self.parse_schema(),
            TokenType::Import => self.parse_import(),
            TokenType::Export => self.parse_export(),
            TokenType::Enum => self.parse_enum(),
            TokenType::Type => self.parse_type_alias(),
            TokenType::Declare => self.parse_declare(),
            TokenType::At => self.parse_decorator(),
            TokenType::Print => self.parse_print(),
            TokenType::Let => self.parse_variable(),
            TokenType::Mixin => self.parse_mixin(),
            TokenType::Identifier if self.peek().value == "validate" => self.parse_top_level_validation(),
            _ => Err(self.error("Expected top-level declaration (define, import, export, enum, type, let, mixin, or validate)")),
        }
    }

    fn synchronize(&mut self) {
        self.advance();

        while !self.is_at_end() {
            if self.previous().token_type == TokenType::Semicolon {
                return;
            }

            match self.peek().token_type {
                TokenType::Define | TokenType::Import | TokenType::Export |
                TokenType::Enum | TokenType::Type => {
                    return;
                }
                _ => {
                    self.advance();
                }
            }
        }
    }
}
