/**
 * Parser helper functions
 */

use crate::ast::ParseError;
use crate::lexer::{Token, TokenType};
use super::Parser;

impl Parser {
    // Token navigation
    pub(super) fn match_token(&mut self, token_type: TokenType) -> bool {
        if self.check(token_type) {
            self.advance();
            true
        } else {
            false
        }
    }

    pub(super) fn check(&self, token_type: TokenType) -> bool {
        !self.is_at_end() && self.peek().token_type == token_type
    }

    pub(super) fn advance(&mut self) -> Token {
        if !self.is_at_end() {
            self.current += 1;
        }
        self.previous()
    }

    pub(super) fn peek(&self) -> &Token {
        &self.tokens[self.current]
    }

    pub(super) fn previous(&self) -> Token {
        self.tokens[self.current - 1].clone()
    }

    pub(super) fn is_at_end(&self) -> bool {
        self.current >= self.tokens.len() || self.peek().token_type == TokenType::Eof
    }

    // Token consumption
    pub(super) fn consume(&mut self, token_type: TokenType, message: &str) -> Result<String, ParseError> {
        if self.check(token_type) {
            Ok(self.advance().value)
        } else {
            Err(self.error(message))
        }
    }

    pub(super) fn consume_identifier(&mut self, message: &str) -> Result<String, ParseError> {
        // Accept both Identifier and TypeName tokens as identifiers
        // This allows using type names as field names (e.g., email: email)
        if self.check(TokenType::Identifier) || self.check(TokenType::TypeName) {
            Ok(self.advance().value)
        } else {
            Err(self.error(message))
        }
    }

    pub(super) fn consume_string(&mut self, message: &str) -> Result<String, ParseError> {
        if self.check(TokenType::String) {
            Ok(self.advance().value)
        } else {
            Err(self.error(message))
        }
    }

    // Error handling
    pub(super) fn error(&self, message: &str) -> ParseError {
        let token = self.peek();
        ParseError {
            message: message.to_string(),
            position: token.position,
            line: token.line,
            column: token.column,
            context: None,
            file_path: None,
        }
    }

    // Expression checking
    pub(super) fn is_expression_start(&self) -> bool {
        matches!(
            self.peek().token_type,
            TokenType::String
                | TokenType::RawString
                | TokenType::Number
                | TokenType::Boolean
                | TokenType::Null
                | TokenType::Undefined
                | TokenType::Identifier
                | TokenType::LParen
                | TokenType::LBracket
                | TokenType::Minus
                | TokenType::Not
        )
    }
}
