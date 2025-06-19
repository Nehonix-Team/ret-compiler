/**
 * Enhanced Conditional Lexer
 *
 * Tokenizes conditional syntax with support for:
 * - Nested conditions
 * - Logical operators (&&, ||)
 * - Method calls (.in(), .exists, etc.)
 * - Complex expressions
 */

import {
  Token,
  TokenType,
  ConditionalError,
  ErrorType,
} from "../types/ConditionalTypes";

export class ConditionalLexer {
  private input: string;
  private position: number = 0;
  private line: number = 1;
  private column: number = 1;
  private tokens: Token[] = [];
  private errors: ConditionalError[] = [];

  // Operator patterns for efficient matching (order matters - longest first!)
  private static readonly OPERATORS = new Map<string, TokenType>([
    // Multi-character operators first
    ["!~", TokenType.NOT_MATCHES],
    ["!exists", TokenType.NOT_EXISTS],
    ["!empty", TokenType.NOT_EMPTY],
    ["!null", TokenType.NOT_NULL],
    ["!in", TokenType.NOT_IN],
    ["!contains", TokenType.NOT_CONTAINS],
    [">=", TokenType.GREATER_EQUAL],
    ["<=", TokenType.LESS_EQUAL],
    ["!=", TokenType.NOT_EQUALS],
    ["==", TokenType.EQUALS],
    ["*?", TokenType.CONDITIONAL_THEN],
    ["&&", TokenType.AND],
    ["||", TokenType.OR],
    // Single character operators
    ["=", TokenType.EQUALS],
    [">", TokenType.GREATER_THAN],
    ["<", TokenType.LESS_THAN],
    ["~", TokenType.MATCHES],
    ["!", TokenType.NOT],
    [":", TokenType.COLON],
    ["(", TokenType.LPAREN],
    [")", TokenType.RPAREN],
    ["[", TokenType.LBRACKET],
    ["]", TokenType.RBRACKET],
    [",", TokenType.COMMA],
    [".", TokenType.DOT],
    ["|", TokenType.PIPE], // For regex alternation
    ["^", TokenType.CARET], // For regex start anchor
    ["$", TokenType.DOLLAR], // For regex end anchor
    ["@", TokenType.AT], // For email patterns
  ]);

  // Method patterns
  private static readonly METHODS = new Map<string, TokenType>([
    ["in", TokenType.IN],
    ["notIn", TokenType.NOT_IN],
    ["!in", TokenType.NOT_IN], // Support .!in() syntax
    ["exists", TokenType.EXISTS],
    ["notExists", TokenType.NOT_EXISTS],
    ["!exists", TokenType.NOT_EXISTS], // Support .!exists syntax
    ["empty", TokenType.EMPTY],
    ["!empty", TokenType.NOT_EMPTY], // Support .!empty syntax
    ["null", TokenType.NULL], // Support .null syntax
    ["!null", TokenType.NOT_NULL], // Support .!null syntax
    ["contains", TokenType.CONTAINS],
    ["notContains", TokenType.NOT_CONTAINS],
    ["!contains", TokenType.NOT_CONTAINS], // Support .!contains() syntax
    ["startsWith", TokenType.STARTS_WITH],
    ["endsWith", TokenType.ENDS_WITH],
    ["between", TokenType.BETWEEN],
  ]);

  // Keywords
  private static readonly KEYWORDS = new Map<string, TokenType>([
    ["when", TokenType.WHEN],
    ["true", TokenType.BOOLEAN],
    ["false", TokenType.BOOLEAN],
  ]);

  constructor(input: string) {
    this.input = input;
  }

  /**
   * Tokenize the input string
   */
  tokenize(): { tokens: Token[]; errors: ConditionalError[] } {
    this.tokens = [];
    this.errors = [];
    this.position = 0;
    this.line = 1;
    this.column = 1;

    while (!this.isAtEnd()) {
      this.scanToken();
    }

    // Add EOF token
    this.addToken(TokenType.EOF, "");

    return {
      tokens: this.tokens,
      errors: this.errors,
    };
  }

  /**
   * Scan next token
   */
  private scanToken(): void {
    const start = this.position;
    const char = this.advance();

    // Skip whitespace
    if (this.isWhitespace(char)) {
      this.skipWhitespace();
      return;
    }

    // Handle operators (multi-character first)
    if (this.tryOperator(start)) {
      return;
    }

    // Handle strings
    if (char === '"' || char === "'") {
      this.scanString(char);
      return;
    }

    // Handle numbers
    if (this.isDigit(char)) {
      this.scanNumber();
      return;
    }

    // Handle identifiers and keywords
    if (this.isAlpha(char)) {
      this.scanIdentifier();
      return;
    }

    // Handle method names that start with ! (like !exists, !empty) when after a dot
    if (
      char === "!" &&
      this.tokens.length > 0 &&
      this.tokens[this.tokens.length - 1].type === TokenType.DOT
    ) {
      this.scanMethodName();
      return;
    }

    // Handle special characters that are part of type syntax
    if (char === "?" || char === "[" || char === "]") {
      this.addToken(this.getSpecialCharToken(char), char);
      return;
    }

    // Handle constant values (=value)
    if (char === "=" && this.peek() !== "=" && this.peek() !== "!") {
      this.scanConstant();
      return;
    }

    // Handle regex patterns after ~ operator
    if (this.isRegexContext()) {
      this.scanRegexPattern();
      return;
    }

    // Allow special regex characters in certain contexts
    if (this.isSpecialRegexChar(char)) {
      this.addToken(this.getRegexCharToken(char), char);
      return;
    }

    // Unknown character
    this.addError(
      ErrorType.SYNTAX_ERROR,
      `Unexpected character: '${char}'`,
      `Remove or escape the character '${char}'`
    );
  }

  /**
   * Try to match multi-character operators
   */
  private tryOperator(start: number): boolean {
    // Try longest operators first
    const remaining = this.input.substring(this.position - 1);

    // Check if we're after a dot - if so, don't treat !exists/!empty as operators
    const isAfterDot =
      this.tokens.length > 0 &&
      this.tokens[this.tokens.length - 1].type === TokenType.DOT;

    for (const [op, tokenType] of ConditionalLexer.OPERATORS) {
      if (remaining.startsWith(op)) {
        // Skip !exists and !empty when after a dot (they should be method names)
        if (isAfterDot && (op === "!exists" || op === "!empty")) {
          continue;
        }

        // Advance position for multi-character operators
        for (let i = 1; i < op.length; i++) {
          this.advance();
        }
        this.addToken(tokenType, op);
        return true;
      }
    }

    return false;
  }

  /**
   * Scan string literal
   */
  private scanString(quote: string): void {
    const start = this.position - 1;
    let value = "";

    while (!this.isAtEnd() && this.peek() !== quote) {
      if (this.peek() === "\n") {
        this.line++;
        this.column = 1;
      }

      // Handle escape sequences
      if (this.peek() === "\\") {
        this.advance(); // Skip backslash
        const escaped = this.advance();
        switch (escaped) {
          case "n":
            value += "\n";
            break;
          case "t":
            value += "\t";
            break;
          case "r":
            value += "\r";
            break;
          case "\\":
            value += "\\";
            break;
          case '"':
            value += '"';
            break;
          case "'":
            value += "'";
            break;
          default:
            value += escaped;
            break;
        }
      } else {
        value += this.advance();
      }
    }

    if (this.isAtEnd()) {
      this.addError(
        ErrorType.SYNTAX_ERROR,
        "Unterminated string",
        `Add closing ${quote} to complete the string`
      );
      return;
    }

    // Consume closing quote
    this.advance();
    this.addToken(TokenType.STRING, value);
  }

  /**
   * Scan numeric literal
   */
  private scanNumber(): void {
    let value = this.input[this.position - 1];

    // Scan integer part
    while (this.isDigit(this.peek())) {
      value += this.advance();
    }

    // Handle decimal point
    if (this.peek() === "." && this.isDigit(this.peekNext())) {
      value += this.advance(); // Consume '.'

      while (this.isDigit(this.peek())) {
        value += this.advance();
      }
    }

    this.addToken(TokenType.NUMBER, value);
  }

  /**
   * Scan identifier, keyword, or method
   */
  private scanIdentifier(): void {
    let value = this.input[this.position - 1];

    while (this.isAlphaNumeric(this.peek())) {
      value += this.advance();
    }

    // Check if it's a keyword
    const keywordType = ConditionalLexer.KEYWORDS.get(value.toLowerCase());
    if (keywordType) {
      this.addToken(keywordType, value);
      return;
    }

    // Check if it's followed by a method call
    if (this.peek() === ".") {
      const nextPos = this.position + 1;
      let methodName = "";
      let pos = nextPos;

      // Handle methods that start with ! (like !exists, !empty)
      if (pos < this.input.length && this.input[pos] === "!") {
        methodName += this.input[pos];
        pos++;
      }

      // Scan the rest of the method name
      while (pos < this.input.length && this.isAlphaNumeric(this.input[pos])) {
        methodName += this.input[pos];
        pos++;
      }

      const methodType = ConditionalLexer.METHODS.get(methodName);
      if (methodType) {
        // This is a field access followed by a method
        this.addToken(TokenType.IDENTIFIER, value);
        return;
      }
    }

    this.addToken(TokenType.IDENTIFIER, value);
  }

  /**
   * Scan method name that starts with ! (like !exists, !empty)
   */
  private scanMethodName(): void {
    let value = this.input[this.position - 1]; // Start with the '!' character

    // Scan the rest of the method name
    while (this.isAlphaNumeric(this.peek())) {
      value += this.advance();
    }

    // Check if it's a valid method name
    const methodType = ConditionalLexer.METHODS.get(value);
    if (methodType) {
      this.addToken(TokenType.IDENTIFIER, value);
    } else {
      this.addError(
        ErrorType.SYNTAX_ERROR,
        `Unknown method: ${value}`,
        `Check if the method name is correct`
      );
    }
  }

  /**
   * Scan constant value (=value syntax)
   */
  private scanConstant(): void {
    let value = "";

    // Skip the '=' character (already consumed)
    while (
      !this.isAtEnd() &&
      !this.isWhitespace(this.peek()) &&
      this.peek() !== ":" &&
      this.peek() !== ")" &&
      this.peek() !== "]"
    ) {
      value += this.advance();
    }

    if (value.length === 0) {
      this.addError(
        ErrorType.SYNTAX_ERROR,
        "Empty constant value after =",
        "Provide a value after = (e.g., =admin, =true, =42)"
      );
      return;
    }

    this.addToken(TokenType.CONSTANT, value);
  }

  /**
   * Skip whitespace characters
   */
  private skipWhitespace(): void {
    while (!this.isAtEnd() && this.isWhitespace(this.peek())) {
      if (this.advance() === "\n") {
        this.line++;
        this.column = 1;
      }
    }
  }

  /**
   * Check if we're in a regex context (after ~ or !~ operator)
   */
  private isRegexContext(): boolean {
    // Look at the last few tokens to see if we just had a MATCHES or NOT_MATCHES
    if (this.tokens.length === 0) return false;

    const lastToken = this.tokens[this.tokens.length - 1];
    return (
      lastToken.type === TokenType.MATCHES ||
      lastToken.type === TokenType.NOT_MATCHES
    );
  }

  /**
   * Scan regex pattern (handles complex patterns with special characters)
   */
  private scanRegexPattern(): void {
    let pattern = "";
    let depth = 0;

    while (!this.isAtEnd()) {
      const char = this.peek();

      // Stop at whitespace or conditional operators
      if (this.isWhitespace(char) || char === "*" || char === ":") {
        break;
      }

      // Handle parentheses depth
      if (char === "(") depth++;
      if (char === ")") {
        depth--;
        if (depth < 0) break; // Unmatched closing paren
      }

      pattern += this.advance();
    }

    if (pattern.length > 0) {
      this.addToken(TokenType.REGEX_PATTERN, pattern);
    }
  }

  /**
   * Check if character is a special regex character
   */
  private isSpecialRegexChar(char: string): boolean {
    return char === "|" || char === "^" || char === "$" || char === "@";
  }

  /**
   * Get token type for regex special characters
   */
  private getRegexCharToken(char: string): TokenType {
    switch (char) {
      case "|":
        return TokenType.PIPE;
      case "^":
        return TokenType.CARET;
      case "$":
        return TokenType.DOLLAR;
      case "@":
        return TokenType.AT;
      default:
        return TokenType.UNKNOWN;
    }
  }

  /**
   * Utility methods
   */
  private advance(): string {
    if (this.isAtEnd()) return "\0";
    this.column++;
    return this.input[this.position++];
  }

  private peek(): string {
    if (this.isAtEnd()) return "\0";
    return this.input[this.position];
  }

  private peekNext(): string {
    if (this.position + 1 >= this.input.length) return "\0";
    return this.input[this.position + 1];
  }

  private isAtEnd(): boolean {
    return this.position >= this.input.length;
  }

  private isWhitespace(char: string): boolean {
    return char === " " || char === "\t" || char === "\n" || char === "\r";
  }

  private isDigit(char: string): boolean {
    return char >= "0" && char <= "9";
  }

  private isAlpha(char: string): boolean {
    return (
      (char >= "a" && char <= "z") ||
      (char >= "A" && char <= "Z") ||
      char === "_"
    );
  }

  private isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char);
  }

  /**
   * Get token type for special characters
   */
  private getSpecialCharToken(char: string): TokenType {
    switch (char) {
      case "?":
        return TokenType.UNKNOWN; // Will be handled as part of type syntax
      case "[":
        return TokenType.LBRACKET;
      case "]":
        return TokenType.RBRACKET;
      default:
        return TokenType.UNKNOWN;
    }
  }

  /**
   * Add token to the list
   */
  private addToken(type: TokenType, value: string): void {
    this.tokens.push({
      type,
      value,
      position: this.position - value.length,
      line: this.line,
      column: this.column - value.length,
    });
  }

  /**
   * Add error to the list
   */
  private addError(
    type: ErrorType,
    message: string,
    suggestion?: string
  ): void {
    this.errors.push({
      type,
      message,
      position: this.position,
      line: this.line,
      column: this.column,
      suggestion,
      context: {
        nearbyTokens: this.tokens.slice(-3), // Last 3 tokens for context
        expectedTokens: [], // Will be filled by parser
      },
    });
  }
}
