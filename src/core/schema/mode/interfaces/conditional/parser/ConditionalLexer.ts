/**
 * Enhanced Conditional Lexer
 *
 * Tokenizes conditional syntax with support for:
 * - Nested conditions
 * - Logical operators (&&, ||)
 * - Method calls (.in(), .exists, etc.)
 * - Complex expressions
 * - Improved error handling and recovery
 * - Performance optimizations
 * - Better memory management
 */

import {
  Token,
  TokenType,
  ConditionalError,
  ErrorType,
} from "../types/ConditionalTypes";

export class ConditionalLexer {
  private readonly _input: string;
  private _position: number = 0;
  private _line: number = 1;
  private _column: number = 1;
  private readonly _tokens: Token[] = [];
  private readonly _errors: ConditionalError[] = [];
  private _currentTokenStart: number = 0;
  private _parenDepth: number = 0; // Track parentheses depth for method arguments

  // Operator patterns for efficient matching (order matters - longest first!)
  private static readonly _OPERATORS = new Map<string, TokenType>([
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
  private static readonly _METHODS = new Map<string, TokenType>([
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
  private static readonly _KEYWORDS = new Map<string, TokenType>([
    ["when", TokenType.WHEN],
    ["true", TokenType.BOOLEAN],
    ["false", TokenType.BOOLEAN],
  ]);

  // Special characters that can appear in regex patterns
  private static readonly _REGEX_SPECIAL_CHARS = new Set(["|", "^", "$", "@"]);

  // Characters that should be treated as special in type syntax
  private static readonly _TYPE_SYNTAX_CHARS = new Map<string, TokenType>([
    ["?", TokenType.UNKNOWN], // Will be handled as part of type syntax
    ["[", TokenType.LBRACKET],
    ["]", TokenType.RBRACKET],
    ["{", TokenType.LBRACE],
    ["}", TokenType.RBRACE],
  ]);

  // Whitespace characters
  private static readonly _WHITESPACE_CHARS = new Set([" ", "\t", "\n", "\r"]);

  // String quote characters
  private static readonly _STRING_QUOTES = new Set(['"', "'"]);

  // Escape sequence mappings
  private static readonly _ESCAPE_SEQUENCES = new Map<string, string>([
    ["n", "\n"],
    ["t", "\t"],
    ["r", "\r"],
    ["\\", "\\"],
    ['"', '"'],
    ["'", "'"],
  ]);

  constructor(input: string) {
    if (typeof input !== "string") {
      throw new TypeError("Input must be a string");
    }
    this._input = input;
  }

  /**
   * Tokenize the input string
   */
  tokenize(): { tokens: Token[]; errors: ConditionalError[] } {
    this._resetState();

    try {
      while (!this._isAtEnd()) {
        this._currentTokenStart = this._position;
        this._scanToken();
      }

      // Add EOF token
      this._addToken(TokenType.EOF, "");
    } catch (error) {
      this._addError(
        ErrorType.SYNTAX_ERROR,
        `Unexpected error during tokenization: ${error instanceof Error ? error.message : "Unknown error"}`,
        "Check the input syntax for correctness"
      );
    }

    return {
      tokens: [...this._tokens],
      errors: [...this._errors],
    };
  }

  /**
   * Reset lexer state for reuse
   */
  private _resetState(): void {
    this._position = 0;
    this._line = 1;
    this._column = 1;
    this._currentTokenStart = 0;
    this._tokens.length = 0;
    this._errors.length = 0;
    this._parenDepth = 0;
  }

  /**
   * Scan next token with improved error recovery
   */
  private _scanToken(): void {
    const char = this._advance();

    // Skip whitespace efficiently
    if (this._isWhitespace(char)) {
      this._skipWhitespace();
      return;
    }

    // Handle constant values (=value) ONLY in type definition contexts
    // This should only trigger after *? operator, not in comparison contexts like role=admin
    if (
      char === "=" &&
      this._peek() !== "=" &&
      this._peek() !== "!" &&
      this._isConstantContext()
    ) {
      this._scanConstant();
      return;
    }

    // Handle unquoted literals in method arguments BEFORE operators
    if (this._parenDepth > 0 && this._isLiteralStartChar(char)) {
      this._scanUnquotedLiteral();
      return;
    }

    // Handle operators (multi-character first)
    if (this._tryOperator()) {
      return;
    }

    // Handle strings
    if (ConditionalLexer._STRING_QUOTES.has(char)) {
      this._scanString(char);
      return;
    }

    // Handle numbers (including negative numbers)
    if (this._isDigit(char)) {
      this._scanNumber();
      return;
    }

    // Handle negative numbers (- followed by digit)
    if (char === "-" && this._isDigit(this._peek())) {
      this._scanNumber();
      return;
    }

    // Handle identifiers and keywords
    if (this._isAlpha(char)) {
      this._scanIdentifier();
      return;
    }

    // Handle method names that start with ! (like !exists, !empty) when after a dot
    if (char === "!" && this._isAfterDotToken()) {
      this._scanMethodName();
      return;
    }

    // Handle special characters that are part of type syntax
    const typeToken = ConditionalLexer._TYPE_SYNTAX_CHARS.get(char);
    if (typeToken) {
      // Track parentheses depth for method argument parsing
      if (char === "(") {
        this._parenDepth++;
      } else if (char === ")") {
        this._parenDepth--;
      }

      this._addToken(typeToken, char);
      return;
    }

    // Handle forward slash patterns (like /secure/, /admin/)
    if (char === "/" && this._isRegexSlashContext()) {
      this._scanSlashPattern();
      return;
    }

    // Handle regex patterns after ~ operator
    if (this._isRegexContext()) {
      this._scanRegexPattern();
      return;
    }

    // Allow special regex characters in certain contexts
    if (ConditionalLexer._REGEX_SPECIAL_CHARS.has(char)) {
      this._addToken(this._getRegexCharToken(char), char);
      return;
    }

    // Unknown character - add error but continue parsing
    this._addError(
      ErrorType.SYNTAX_ERROR,
      `Unexpected character: '${char}'`,
      `Remove or escape the character '${char}'`
    );
  }

  /**
   * Try to match multi-character operators with improved efficiency
   */
  private _tryOperator(): boolean {
    // Get remaining input from current position - 1 (since we already advanced)
    const remaining = this._input.substring(this._position - 1);

    if (remaining.length === 0) return false;

    // Check if we're after a dot - if so, don't treat !exists/!empty as operators
    const isAfterDot = this._isAfterDotToken();

    for (const [op, tokenType] of ConditionalLexer._OPERATORS) {
      if (remaining.startsWith(op)) {
        // Skip !exists and !empty when after a dot (they should be method names)
        if (
          isAfterDot &&
          (op === "!exists" ||
            op === "!empty" ||
            op === "!null" ||
            op === "!in" ||
            op === "!contains")
        ) {
          continue;
        }

        // Advance position for multi-character operators
        for (let i = 1; i < op.length; i++) {
          this._advance();
        }
        this._addToken(tokenType, op);
        return true;
      }
    }

    return false;
  }

  /**
   * Check if the last token is a DOT token
   */
  private _isAfterDotToken(): boolean {
    return (
      this._tokens.length > 0 &&
      this._tokens[this._tokens.length - 1].type === TokenType.DOT
    );
  }

  /**
   * Check if we're in a constant context (after *? operator in type definitions)
   * This prevents treating comparison operators like role=admin as constants
   */
  private _isConstantContext(): boolean {
    if (this._tokens.length === 0) return false;

    // Look for the *? (CONDITIONAL_THEN) token in recent tokens
    // Constants should only appear after *? in patterns like "when condition *? =value : type"
    for (
      let i = this._tokens.length - 1;
      i >= Math.max(0, this._tokens.length - 5);
      i--
    ) {
      const token = this._tokens[i];

      // If we find *? operator, we're in a type definition context
      if (token.type === TokenType.CONDITIONAL_THEN) {
        return true;
      }

      // If we find : (colon), we're past the constant context
      if (token.type === TokenType.COLON) {
        return false;
      }

      // If we find logical operators, we're in a condition context, not type context
      if (token.type === TokenType.AND || token.type === TokenType.OR) {
        return false;
      }
    }

    return false;
  }

  /**
   * Check if character is an operator character that should stop identifier scanning
   */
  private _isOperatorChar(char: string): boolean {
    // Check if the character starts any operator
    for (const [op] of ConditionalLexer._OPERATORS) {
      if (op.startsWith(char)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Scan string literal with improved escape handling
   */
  private _scanString(quote: string): void {
    let value = "";
    const startLine = this._line;
    const startColumn = this._column - 1;

    while (!this._isAtEnd() && this._peek() !== quote) {
      if (this._peek() === "\n") {
        this._line++;
        this._column = 1;
      }

      // Handle escape sequences
      if (this._peek() === "\\") {
        this._advance(); // Skip backslash

        if (this._isAtEnd()) {
          this._addError(
            ErrorType.SYNTAX_ERROR,
            "Unterminated escape sequence in string",
            `Add a character after \\ or close the string with ${quote}`
          );
          return;
        }

        const escaped = this._advance();
        const escapedValue = ConditionalLexer._ESCAPE_SEQUENCES.get(escaped);

        if (escapedValue !== undefined) {
          value += escapedValue;
        } else {
          // Unknown escape sequence - keep the character
          value += escaped;
          this._addError(
            ErrorType.SYNTAX_ERROR,
            `Unknown escape sequence: \\${escaped}`,
            `Use a valid escape sequence or remove the backslash`
          );
        }
      } else {
        value += this._advance();
      }
    }

    if (this._isAtEnd()) {
      this._addError(
        ErrorType.SYNTAX_ERROR,
        `Unterminated string starting at line ${startLine}, column ${startColumn}`,
        `Add closing ${quote} to complete the string`
      );
      return;
    }

    // Consume closing quote
    this._advance();
    this._addToken(TokenType.STRING, value);
  }

  /**
   * Scan numeric literal with improved validation
   */
  private _scanNumber(): void {
    let value = this._input[this._position - 1];
    let hasDecimalPoint = false;

    // If the first character is '-', we're scanning a negative number
    const isNegative = value === "-";

    // Scan integer part
    while (this._isDigit(this._peek())) {
      value += this._advance();
    }

    // Handle decimal point
    if (this._peek() === "." && this._isDigit(this._peekNext())) {
      hasDecimalPoint = true;
      value += this._advance(); // Consume '.'

      while (this._isDigit(this._peek())) {
        value += this._advance();
      }
    }

    // Validate number format
    if (value === "." || value.endsWith(".") || value === "-") {
      this._addError(
        ErrorType.SYNTAX_ERROR,
        "Invalid number format",
        "Ensure the number has digits before and after the decimal point"
      );
      return;
    }

    this._addToken(TokenType.NUMBER, value);
  }

  /**
   * Scan identifier, keyword, or method with improved logic
   */
  private _scanIdentifier(): void {
    let value = this._input[this._position - 1];

    // Handle multi-byte Unicode characters (like emojis)
    // FIXED: Stop at operator characters to prevent consuming "role=admin" as single token
    while (
      (this._isAlphaNumeric(this._peek()) || this._isEmojiContinuation()) &&
      !this._isOperatorChar(this._peek())
    ) {
      value += this._advance();
    }

    // Check if it's a keyword (case-insensitive)
    const keywordType = ConditionalLexer._KEYWORDS.get(value.toLowerCase());
    if (keywordType) {
      this._addToken(keywordType, value);
      return;
    }

    // Check if it's followed by a method call
    if (this._peek() === ".") {
      const methodName = this._peekMethodName();
      if (methodName && ConditionalLexer._METHODS.has(methodName)) {
        // This is a field access followed by a method
        this._addToken(TokenType.IDENTIFIER, value);
        return;
      }
    }

    this._addToken(TokenType.IDENTIFIER, value);
  }

  /**
   * Check if the current character is part of an emoji continuation
   */
  private _isEmojiContinuation(): boolean {
    const char = this._peek();
    const code = char.charCodeAt(0);

    // Low surrogate range (second part of emoji)
    return code >= 0xdc00 && code <= 0xdfff;
  }

  /**
   * Peek ahead to get the method name after a dot
   */
  private _peekMethodName(): string | null {
    const nextPos = this._position + 1;
    if (nextPos >= this._input.length) return null;

    let methodName = "";
    let pos = nextPos;

    // Handle methods that start with ! (like !exists, !empty)
    if (pos < this._input.length && this._input[pos] === "!") {
      methodName += this._input[pos];
      pos++;
    }

    // Scan the rest of the method name
    while (pos < this._input.length && this._isAlphaNumeric(this._input[pos])) {
      methodName += this._input[pos];
      pos++;
    }

    return methodName || null;
  }

  /**
   * Scan method name that starts with ! (like !exists, !empty)
   */
  private _scanMethodName(): void {
    let value = this._input[this._position - 1]; // Start with the '!' character

    // Scan the rest of the method name
    while (this._isAlphaNumeric(this._peek())) {
      value += this._advance();
    }

    // Check if it's a valid method name
    const methodType = ConditionalLexer._METHODS.get(value);
    if (methodType) {
      this._addToken(TokenType.IDENTIFIER, value);
    } else {
      this._addError(
        ErrorType.SYNTAX_ERROR,
        `Unknown method: ${value}`,
        `Check if the method name is correct. Valid methods include: ${Array.from(ConditionalLexer._METHODS.keys()).join(", ")}`
      );
    }
  }

  /**
   * Scan constant value (=value syntax) with improved validation
   */
  private _scanConstant(): void {
    let value = "";

    // Skip the '=' character (already consumed)
    // Handle negative numbers by allowing minus sign at the start
    if (this._peek() === "-") {
      // Check if it's a negative number (- followed by digit or .)
      const nextChar = this._peekNext();
      if (this._isDigit(nextChar) || nextChar === ".") {
        value += this._advance(); // consume '-'
      }
    }

    // Check if this is an array or object literal
    const isArrayLiteral = this._peek() === "[";
    const isObjectLiteral = this._peek() === "{";

    if (isArrayLiteral || isObjectLiteral) {
      // Handle complex literals with bracket/brace matching
      value += this._scanComplexLiteral();
    } else {
      // Handle simple constants (strings, numbers, booleans)
      while (
        !this._isAtEnd() &&
        !this._isWhitespace(this._peek()) &&
        this._peek() !== ":" &&
        this._peek() !== ")" &&
        this._peek() !== "]" &&
        this._peek() !== ","
      ) {
        value += this._advance();
      }
    }

    if (value.length === 0) {
      this._addError(
        ErrorType.SYNTAX_ERROR,
        "Empty constant value after =",
        "Provide a value after = (e.g., =admin, =true, =42, =-1, =[1,2,3])"
      );
      return;
    }

    this._addToken(TokenType.CONSTANT, value);
  }

  /**
   * Scan complex literal (array or object) with proper bracket/brace matching
   */
  private _scanComplexLiteral(): string {
    let value = "";
    let depth = 0;
    const startChar = this._peek();
    const endChar = startChar === "[" ? "]" : "}";

    // Consume the opening bracket/brace
    value += this._advance();
    depth++;

    while (!this._isAtEnd() && depth > 0) {
      const char = this._peek();

      if (char === startChar) {
        depth++;
      } else if (char === endChar) {
        depth--;
      }

      value += this._advance();

      // Stop at whitespace or conditional operators only if we're at depth 0
      if (
        depth === 0 &&
        (this._isWhitespace(char) || char === ":" || char === "*")
      ) {
        break;
      }
    }

    return value;
  }

  /**
   * Skip whitespace characters efficiently
   */
  private _skipWhitespace(): void {
    while (!this._isAtEnd() && this._isWhitespace(this._peek())) {
      if (this._advance() === "\n") {
        this._line++;
        this._column = 1;
      }
    }
  }

  /**
   * Check if we're in a regex context (after ~ or !~ operator)
   */
  private _isRegexContext(): boolean {
    if (this._tokens.length === 0) return false;

    const lastToken = this._tokens[this._tokens.length - 1];
    return (
      lastToken.type === TokenType.MATCHES ||
      lastToken.type === TokenType.NOT_MATCHES
    );
  }

  /**
   * Check if we're in a context where forward slashes should be treated as regex delimiters
   */
  private _isRegexSlashContext(): boolean {
    if (this._tokens.length < 2) return false;

    const lastToken = this._tokens[this._tokens.length - 1];
    const secondLastToken = this._tokens[this._tokens.length - 2];

    // Check if we're inside method arguments like .contains(/pattern/)
    const regexMethodTypes = new Set([
      TokenType.CONTAINS,
      TokenType.NOT_CONTAINS,
      TokenType.STARTS_WITH,
      TokenType.ENDS_WITH,
    ]);

    return (
      lastToken.type === TokenType.LPAREN &&
      regexMethodTypes.has(secondLastToken.type)
    );
  }

  /**
   * Scan slash-delimited pattern (like /secure/, /admin/) with improved error handling
   */
  private _scanSlashPattern(): void {
    let pattern = "";
    const startLine = this._line;
    const startColumn = this._column - 1;

    // Skip the opening slash (already consumed)
    while (!this._isAtEnd() && this._peek() !== "/") {
      if (this._peek() === "\n") {
        this._line++;
        this._column = 1;
      }
      pattern += this._advance();
    }

    if (this._peek() === "/") {
      this._advance(); // Consume closing slash
      this._addToken(TokenType.STRING, pattern);
    } else {
      this._addError(
        ErrorType.SYNTAX_ERROR,
        `Unterminated regex pattern starting at line ${startLine}, column ${startColumn}`,
        "Add closing / to complete the pattern"
      );
    }
  }

  /**
   * Scan regex pattern (handles complex patterns with special characters)
   */
  private _scanRegexPattern(): void {
    let pattern = "";
    let depth = 0;

    while (!this._isAtEnd()) {
      const char = this._peek();

      // Stop at whitespace or conditional operators
      if (this._isWhitespace(char) || char === "*" || char === ":") {
        break;
      }

      // Handle parentheses depth
      if (char === "(") {
        depth++;
      } else if (char === ")") {
        depth--;
        if (depth < 0) break; // Unmatched closing paren
      }

      pattern += this._advance();
    }

    if (pattern.length > 0) {
      this._addToken(TokenType.REGEX_PATTERN, pattern);
    } else {
      this._addError(
        ErrorType.SYNTAX_ERROR,
        "Empty regex pattern",
        "Provide a valid regex pattern after the ~ operator"
      );
    }
  }

  /**
   * Get token type for regex special characters
   */
  private _getRegexCharToken(char: string): TokenType {
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
   * Utility methods with improved type safety
   */
  private _advance(): string {
    if (this._isAtEnd()) return "\0";
    this._column++;
    return this._input[this._position++];
  }

  private _peek(): string {
    if (this._isAtEnd()) return "\0";
    return this._input[this._position];
  }

  private _peekNext(): string { 
    if (this._position + 1 >= this._input.length) return "\0";
    return this._input[this._position + 1];
  } 

  private _isAtEnd(): boolean {
    return this._position >= this._input.length;
  }

  private _isWhitespace(char: string): boolean {
    return ConditionalLexer._WHITESPACE_CHARS.has(char);
  }

  private _isDigit(char: string): boolean {
    return char >= "0" && char <= "9";
  }

  private _isAlpha(char: string): boolean {
    return (
      (char >= "a" && char <= "z") ||
      (char >= "A" && char <= "Z") ||
      char === "_" ||
      this._isUnicodeAlpha(char)
    );
  }

  private _isAlphaNumeric(char: string): boolean {
    return this._isAlpha(char) || this._isDigit(char);
  }

  /**
   * Check if character is Unicode alphabetic (for international identifiers)
   */
  private _isUnicodeAlpha(char: string): boolean {
    try {
      // Enhanced Unicode support including emojis and symbols
      return (
        /\p{L}/u.test(char) || // Letters
        /\p{Emoji}/u.test(char) || // Emojis
        /\p{Symbol}/u.test(char) || // Symbols
        /\p{Mark}/u.test(char) || // Combining marks
        this._isEmojiCharacter(char) // Additional emoji detection
      );
    } catch (error) {
      // Fallback for older environments
      return this._isUnicodeAlphaFallback(char);
    }
  }

  /**
   * Enhanced emoji character detection
   */
  private _isEmojiCharacter(char: string): boolean {
    const code = char.charCodeAt(0);

    // Common emoji ranges
    return (
      // Emoticons
      (code >= 0x1f600 && code <= 0x1f64f) ||
      // Miscellaneous Symbols and Pictographs
      (code >= 0x1f300 && code <= 0x1f5ff) ||
      // Transport and Map Symbols
      (code >= 0x1f680 && code <= 0x1f6ff) ||
      // Additional Symbols
      (code >= 0x1f700 && code <= 0x1f77f) ||
      // Geometric Shapes Extended
      (code >= 0x1f780 && code <= 0x1f7ff) ||
      // Supplemental Arrows-C
      (code >= 0x1f800 && code <= 0x1f8ff) ||
      // Supplemental Symbols and Pictographs
      (code >= 0x1f900 && code <= 0x1f9ff) ||
      // Chess Symbols
      (code >= 0x1fa00 && code <= 0x1fa6f) ||
      // Symbols and Pictographs Extended-A
      (code >= 0x1fa70 && code <= 0x1faff) ||
      // High surrogate range (for multi-byte emojis)
      (code >= 0xd800 && code <= 0xdbff)
    );
  }

  /**
   * Fallback Unicode detection for older environments
   */
  private _isUnicodeAlphaFallback(char: string): boolean {
    const code = char.charCodeAt(0);
    return (
      // Latin Extended
      (code >= 0x00c0 && code <= 0x024f) ||
      // Greek and Coptic
      (code >= 0x0370 && code <= 0x03ff) ||
      // Cyrillic
      (code >= 0x0400 && code <= 0x04ff) ||
      // CJK (Chinese, Japanese, Korean)
      (code >= 0x4e00 && code <= 0x9fff) ||
      // Arabic
      (code >= 0x0600 && code <= 0x06ff) ||
      // Hebrew
      (code >= 0x0590 && code <= 0x05ff) ||
      // Basic emoji ranges
      (code >= 0x1f300 && code <= 0x1f9ff) ||
      // High surrogate range
      (code >= 0xd800 && code <= 0xdbff)
    );
  }

  /**
   * Add token to the list with improved position tracking
   */
  private _addToken(type: TokenType, value: string): void {
    this._tokens.push({
      type,
      value,
      position: this._currentTokenStart,
      line: this._line,
      column: this._column - value.length,
    });
  }

  /**
   * Add error to the list with improved context
   */
  private _addError(
    type: ErrorType,
    message: string,
    suggestion?: string
  ): void {
    this._errors.push({
      type,
      message,
      position: this._currentTokenStart,
      line: this._line,
      column: this._column - (this._position - this._currentTokenStart),
      suggestion,
      context: {
        nearbyTokens: this._tokens.slice(-3), // Last 3 tokens for context
        expectedTokens: [], // Will be filled by parser
      },
    });
  }

  /**
   * Check if character can start an unquoted literal in method arguments
   */
  private _isLiteralStartChar(char: string): boolean {
    // Allow letters, digits, and common special characters as literal starts
    return (
      this._isAlphaNumeric(char) ||
      char === "!" ||
      char === "@" ||
      char === "#" ||
      char === "$" ||
      char === "%" ||
      char === "^" ||
      char === "&" ||
      char === "*" ||
      char === "+" ||
      char === "=" ||
      char === "|" ||
      char === "\\" ||
      char === ":" ||
      char === ";" ||
      char === "<" ||
      char === ">" ||
      char === "?" ||
      char === "/" ||
      char === "~" ||
      char === "`" ||
      char === "[" ||
      char === "]" ||
      char === "{" ||
      char === "}" ||
      char === "_" ||
      char === "-" ||
      char === "."
    );
  }

  /**
   * Scan unquoted literal in method arguments
   */
  private _scanUnquotedLiteral(): void {
    let value = this._input[this._position - 1];

    // Continue scanning until we hit a delimiter
    while (
      !this._isAtEnd() &&
      !this._isWhitespace(this._peek()) &&
      this._peek() !== "," &&
      this._peek() !== ")" &&
      this._peek() !== "("
    ) {
      value += this._advance();
    }

    if (value.length > 0) {
      this._addToken(TokenType.STRING, value);
    }
  }
}
