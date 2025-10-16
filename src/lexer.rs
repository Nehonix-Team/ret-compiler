/**
 * rel Lexer - Tokenizes .rel schema language
 *
 * Based on the existing ConditionalLexer but adapted for full .rel syntax
 */


#[derive(Debug, Clone, PartialEq)]
pub enum TokenType {
    // Keywords
    Define,
    Import,
    Export,
    From,
    When,
    Else,
    Mixin,
    Extends,
    With,
    As,
    Extend,
    Type,
    Enum,
    Let,
    Const,
    Return,
    
    // New keywords
    Declare,
    Var,
    Fn,
    For,
    In,
    Print,
    Print,

    // Literals
    Identifier,
    String,
    Number,
    Boolean,
    Null,
    Undefined,

    // Types
    TypeName, // Built-in types like string, number, etc.
    Constraint, // Constraint functions like min, max, etc.

    // Operators
    Equals,
    NotEquals,
    GreaterThan,
    GreaterEqual,
    LessThan,
    LessEqual,
    And,
    Or,
    Not,
    Ampersand, // & for constraint chaining
    Pipe, // | for unions
    DoubleColon,    // ::
    DotDot,         // ..
    Question, // ? for optional
    Colon,
    Dot,
    Comma,
    Semicolon,
    LBrace,
    RBrace,
    LBracket,
    RBracket,
    LParen,
    RParen,

    // Arithmetic Operators
    Plus, // +
    Minus, // -
    Multiply, // *
    Divide, // /
    Modulo, // %

    // Special
    Comment,
    At, // @ for decorators
    Dollar, // $ for runtime methods
    Caret, // ^ for regex
    Matches, // ~ for regex matching
    NotMatches, // !~ for negative regex
    ConditionalThen, // *?
    Arrow, // => or ->
    Range, // ..
    RawString, // r"..." for regex patterns
    If, // if keyword for validation rules

    // End of file
    Eof,
}

#[derive(Debug, Clone)]
pub struct Token {
    pub token_type: TokenType,
    pub value: String,
    pub position: usize,
    pub line: usize,
    pub column: usize,
}

#[derive(Debug)]
pub struct LexerError {
    pub message: String,
    pub position: usize,
    pub line: usize,
    pub column: usize,
}

pub struct Lexer {
    input: Vec<char>,
    position: usize,
    line: usize,
    column: usize,
    current_token_start: usize,
    current_token_line: usize,    // Track line where token started
    current_token_column: usize,  // Track column where token started
    tokens: Vec<Token>,
    errors: Vec<LexerError>,
}

impl Lexer {
    pub fn new(input: &str) -> Self {
        Self {
            input: input.chars().collect(),
            position: 0,
            line: 1,
            column: 1,
            current_token_start: 0,
            current_token_line: 1,
            current_token_column: 1,
            tokens: Vec::new(),
            errors: Vec::new(),
        }
    }

    pub fn tokenize(mut self) -> Result<Vec<Token>, Vec<LexerError>> {
        while !self.is_at_end() {
            self.current_token_start = self.position;
            self.current_token_line = self.line;
            self.current_token_column = self.column;
            self.scan_token();
        }

        // Add EOF token
        self.add_token(TokenType::Eof, "");

        if self.errors.is_empty() {
            Ok(self.tokens)
        } else {
            Err(self.errors)
        }
    }

    fn scan_token(&mut self) {
        let char = self.advance();
        
        // Update token start position AFTER advancing past whitespace/first char
        // This ensures we capture the correct line/column for the actual token
        self.current_token_line = self.line;
        self.current_token_column = self.column - 1; // -1 because we just advanced

        match char {
            '#' => self.scan_comment(),
            'r' => {
                if self.peek() == Some('"') || self.peek() == Some('\'') {
                    self.scan_raw_string();
                } else {
                    self.scan_identifier_starting_with('r');
                }
            }
            '"' | '\'' => self.scan_string(char),
            '0'..='9' => self.scan_number(),
            '+' => self.add_token(TokenType::Plus, "+"),
            '-' => {
                if self.peek().map_or(false, |c| c.is_ascii_digit()) {
                    self.scan_number();
                } else if self.peek() == Some('>') {
                    self.advance();
                    self.add_token(TokenType::Arrow, "->");
                } else {
                    self.add_token(TokenType::Minus, "-");
                }
            }
            '*' => {
                if self.peek() == Some('?') {
                    self.advance();
                    self.add_token(TokenType::ConditionalThen, "*?");
                } else {
                    self.add_token(TokenType::Multiply, "*");
                }
            }
            '/' => self.add_token(TokenType::Divide, "/"),
            '%' => self.add_token(TokenType::Modulo, "%"),
            '=' => {
                if self.peek() == Some('=') {
                    self.advance();
                    if self.peek() == Some('=') {
                        self.advance();
                        self.add_token(TokenType::Equals, "===");
                    } else {
                        self.add_token(TokenType::Equals, "==");
                    }
                } else if self.peek() == Some('>') {
                    self.advance();
                    self.add_token(TokenType::Arrow, "=>");
                } else {
                    self.add_token(TokenType::Equals, "=");
                }
            }
            '!' => {
                if self.peek() == Some('=') {
                    self.advance();
                    if self.peek() == Some('=') {
                        self.advance();
                        self.add_token(TokenType::NotEquals, "!==");
                    } else {
                        self.add_token(TokenType::NotEquals, "!=");
                    }
                } else if self.peek() == Some('~') {
                    self.advance();
                    self.add_token(TokenType::NotMatches, "!~");
                } else {
                    self.add_token(TokenType::Not, "!");
                }
            }
            '>' => {
                if self.peek() == Some('=') {
                    self.advance();
                    self.add_token(TokenType::GreaterEqual, ">=");
                } else {
                    self.add_token(TokenType::GreaterThan, ">");
                }
            }
            '<' => {
                if self.peek() == Some('=') {
                    self.advance();
                    self.add_token(TokenType::LessEqual, "<=");
                } else {
                    self.add_token(TokenType::LessThan, "<");
                }
            }
            '&' => {
                if self.peek() == Some('&') {
                    self.advance();
                    self.add_token(TokenType::And, "&&");
                } else {
                    self.add_token(TokenType::Ampersand, "&");
                }
            }
            '|' => {
                if self.peek() == Some('|') {
                    self.advance();
                    self.add_token(TokenType::Or, "||");
                } else {
                    self.add_token(TokenType::Pipe, "|");
                }
            }
            '.' => {
                if self.peek() == Some('.') {
                    self.advance();
                    self.add_token(TokenType::Range, "..");
                } else {
                    self.add_token(TokenType::Dot, ".");
                }
            }
            '~' => self.add_token(TokenType::Matches, "~"),
            '@' => self.add_token(TokenType::At, "@"),
            '$' => self.add_token(TokenType::Dollar, "$"),
            '^' => self.add_token(TokenType::Caret, "^"),
            '?' => self.add_token(TokenType::Question, "?"),
            ':' => {
                if self.peek() == Some(':') {
                    self.advance();
                    self.add_token(TokenType::DoubleColon, "::");
                } else {
                    self.add_token(TokenType::Colon, ":");
                }
            }
            ',' => self.add_token(TokenType::Comma, ","),
            ';' => self.add_token(TokenType::Semicolon, ";"),
            '{' => self.add_token(TokenType::LBrace, "{"),
            '}' => self.add_token(TokenType::RBrace, "}"),
            '[' => self.add_token(TokenType::LBracket, "["),
            ']' => self.add_token(TokenType::RBracket, "]"),
            '(' => self.add_token(TokenType::LParen, "("),
            ')' => self.add_token(TokenType::RParen, ")"),
            c if c.is_whitespace() => self.skip_whitespace(),
            c if c.is_alphabetic() || c == '_' => self.scan_identifier(),
            _ => {
                self.add_error(format!("Unexpected character: '{}'", char));
            }
        }
    }

    fn scan_comment(&mut self) {
        while !self.is_at_end() && self.peek() != Some('\n') {
            self.advance();
        }
        // Don't add comment tokens to the stream
    }

    fn scan_string(&mut self, quote: char) {
        let mut value = String::new();
        let start_line = self.line;
        let start_column = self.column - 1;

        while !self.is_at_end() && self.peek() != Some(quote) {
            if self.peek() == Some('\n') {
                self.line += 1;
                self.column = 1;
            }

            // Handle escape sequences
            if self.peek() == Some('\\') {
                self.advance(); // Skip backslash

                if self.is_at_end() {
                    self.add_error("Unterminated escape sequence in string".to_string());
                    return;
                }

                match self.advance() {
                    'n' => value.push('\n'),
                    't' => value.push('\t'),
                    'r' => value.push('\r'),
                    '\\' => value.push('\\'),
                    '"' => value.push('"'),
                    '\'' => value.push('\''),
                    c => {
                        value.push(c);
                        self.add_error(format!("Unknown escape sequence: \\{}", c));
                    }
                }
            } else {
                value.push(self.advance());
            }
        }

        if self.is_at_end() {
            self.add_error(format!(
                "Unterminated string starting at line {}, column {}",
                start_line, start_column
            ));
            return;
        }

        // Consume closing quote
        self.advance();
        self.add_token(TokenType::String, &value);
    }

    fn scan_raw_string(&mut self) {
        let quote = self.advance(); // consume the quote after 'r'
        let mut value = String::new();
        let start_line = self.line;
        let start_column = self.column - 2; // account for 'r' and quote

        while !self.is_at_end() && self.peek() != Some(quote) {
            if self.peek() == Some('\n') {
                self.line += 1;
                self.column = 1;
            }
            value.push(self.advance());
        }

        if self.is_at_end() {
            self.add_error(format!(
                "Unterminated raw string starting at line {}, column {}",
                start_line, start_column
            ));
            return;
        }

        // Consume closing quote
        self.advance();
        self.add_token(TokenType::RawString, &value);
    }

    fn scan_identifier_starting_with(&mut self, first_char: char) {
        let mut value = String::new();
        value.push(first_char);

        while self.peek().map_or(false, |c| c.is_alphanumeric() || c == '_') {
            value.push(self.advance());
        }

        // Check if it's a keyword
        let token_type = match value.as_str() {
            "define" => TokenType::Define,
            "when" => TokenType::When,
            "else" => TokenType::Else,
            "extends" => TokenType::Extends,
            "mixin" => TokenType::Mixin,
            "with" => TokenType::With,
            "enum" => TokenType::Enum,
            "type" => TokenType::Type,
            "export" => TokenType::Export,
            "from" => TokenType::From,
            "import" => TokenType::Import,
            "as" => TokenType::As,
            "let" => TokenType::Let,
            "return" => TokenType::Return,
            "declare" => TokenType::Declare,
            "var" => TokenType::Var,
            "fn" => TokenType::Fn,
            "for" => TokenType::For,
            "print" => TokenType::Print,
            "in" => TokenType::In,
            "true" | "false" => TokenType::Boolean,
            "null" => TokenType::Null,
            "undefined" => TokenType::Undefined,
            _ => TokenType::Identifier,
        };

        self.add_token(token_type, &value);
    }

    fn scan_number(&mut self) {
        let mut value = String::new();
        let start_char = self.input[self.position - 1];
        value.push(start_char);

        // Scan integer part
        while self.peek().map_or(false, |c| c.is_ascii_digit()) {
            value.push(self.advance());
        }

        // Handle decimal point
        if self.peek() == Some('.') && self.peek_next().map_or(false, |c| c.is_ascii_digit()) {
            value.push(self.advance()); // Consume '.'

            while self.peek().map_or(false, |c| c.is_ascii_digit()) {
                value.push(self.advance());
            }
        }

        // Validate number format
        if value == "." || value.ends_with('.') || value == "-" {
            self.add_error("Invalid number format".to_string());
            return;
        }

        self.add_token(TokenType::Number, &value);
    }

    fn scan_identifier(&mut self) {
        let mut value = String::new();
        value.push(self.input[self.position - 1]);

        while self.peek().map_or(false, |c| c.is_alphanumeric() || c == '_') {
            value.push(self.advance());
        }

        // Check if it's a keyword
        let token_type = match value.as_str() {
            "define" => TokenType::Define,
            "when" => TokenType::When,
            "else" => TokenType::Else,
            "extends" => TokenType::Extends,
            "mixin" => TokenType::Mixin,
            "with" => TokenType::With,
            "enum" => TokenType::Enum,
            "type" => TokenType::Type,
            "export" => TokenType::Export,
            "from" => TokenType::From,
            "import" => TokenType::Import,
            "as" => TokenType::As,
            "let" => TokenType::Let,
            "return" => TokenType::Return,
            "declare" => TokenType::Declare,
            "var" => TokenType::Var,
            "fn" => TokenType::Fn,
            "for" => TokenType::For,
            "print" => TokenType::Print,
            "in" => TokenType::In,
            "if" => TokenType::If,
            "true" | "false" => TokenType::Boolean,
            "null" => TokenType::Null,
            "undefined" => TokenType::Undefined,
            _ => {
                // Check if it's a built-in type or constraint function
                if Self::is_builtin_type(&value) {
                    TokenType::TypeName
                } else if Self::is_constraint_function(&value) {
                    TokenType::Constraint
                } else {
                    TokenType::Identifier
                }
            }
        };

        self.add_token(token_type, &value);
    }

    fn is_builtin_type(name: &str) -> bool {
        matches!(
            name,
            // Basic types
            "string" | "number" | "boolean" | "object" | "array" | "date" | "any" | "unknown" |
            // Format types
            "email" | "url" | "uuid" | "phone" | "ip" | "json" | "hexcolor" | "base64" | "jwt" | "semver" | "slug" | "text" | "password" | "username" |
            // Number types
            "positive" | "negative" | "integer" | "float" | "int" | "double" |
            // Special types
            "record"
        )
    }

    fn is_constraint_function(name: &str) -> bool {
        matches!(
            name,
            "min" | "max" | "minLength" | "maxLength" | "matches" | "contains" |
            "startsWith" | "endsWith" | "hasUppercase" | "hasLowercase" | "hasNumber" |
            "hasSpecialChar" | "between" | "in" | "notIn" | "exists" | "empty" |
            "null" | "future" | "past" | "before" | "after" | "integer" | "positive" | "negative" | "float" |
            "literal"
        )
    }

    fn skip_whitespace(&mut self) {
        while !self.is_at_end() && self.peek().map_or(false, |c| c.is_whitespace()) {
            if self.advance() == '\n' {
                self.line += 1;
                self.column = 1;
            }
        }
    }

    fn advance(&mut self) -> char {
        if self.is_at_end() {
            return '\0';
        }
        let char = self.input[self.position];
        self.position += 1;
        self.column += 1;
        char
    }

    fn peek(&self) -> Option<char> {
        if self.is_at_end() {
            None
        } else {
            Some(self.input[self.position])
        }
    }

    fn peek_next(&self) -> Option<char> {
        if self.position + 1 >= self.input.len() {
            None
        } else {
            Some(self.input[self.position + 1])
        }
    }

    fn is_at_end(&self) -> bool {
        self.position >= self.input.len()
    }

    fn add_token(&mut self, token_type: TokenType, value: &str) {
        // For most tokens, current_token_line/column are set correctly in tokenize()
        // But we need to handle the case where whitespace was skipped
        // The token actually starts at current_token_start position
        // So we should use the line/column that were captured there
        self.tokens.push(Token {
            token_type,
            value: value.to_string(),
            position: self.current_token_start,
            line: self.current_token_line,
            column: self.current_token_column,
        });
    }

    fn add_error(&mut self, message: String) {
        self.errors.push(LexerError {
            message,
            position: self.current_token_start,
            line: self.current_token_line,      // Use line where token/error started
            column: self.current_token_column,  // Use column where token/error started
        });
    }
}