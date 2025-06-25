/**
 * Enhanced Conditional Parser
 *
 * Parses tokenized conditional syntax into an Abstract Syntax Tree (AST)
 * Supports nested conditions, logical operators, and complex expressions
 */

import { ConditionalLexer } from "./ConditionalLexer";
import { ASTBuilder } from "./ConditionalAST";
import {
  Token,
  TokenType,
  ConditionalNode,
  ConditionNode,
  LogicalExpressionNode,
  ComparisonNode,
  MethodCallNode,
  FieldAccessNode,
  LiteralNode,
  ConstantNode,
  ArrayNode,
  ValueNode,
  ConditionalError,
  ErrorType,
  ParserConfig,
} from "../types/ConditionalTypes";

export class ConditionalParser {
  private tokens: Token[] = [];
  private current: number = 0;
  private errors: ConditionalError[] = [];
  private config: ParserConfig;

  constructor(config: Partial<ParserConfig> = {}) {
    this.config = {
      allowNestedConditionals: true,
      maxNestingDepth: 5,
      strictMode: false,
      enableDebug: false,
      ...config,
    };
  }

  /**
   * Parse conditional expression from string
   */
  parse(input: string): { ast?: ConditionalNode; errors: ConditionalError[] } {
    // Tokenize input
    const lexer = new ConditionalLexer(input);
    const { tokens, errors: lexErrors } = lexer.tokenize();

    this.tokens = tokens;
    this.current = 0;
    this.errors = [...lexErrors];

    try {
      const ast = this.parseConditional();

      // Check for remaining tokens
      if (!this.isAtEnd()) {
        this.addError(
          ErrorType.SYNTAX_ERROR,
          `Unexpected token: ${this.peek().value}`,
          "Remove extra tokens or check syntax"
        );
      }

      return { ast, errors: this.errors };
    } catch (error: any) {
      this.addError(
        ErrorType.SYNTAX_ERROR,
        `Parse error: ${error.message}`,
        "Check conditional syntax"
      );
      return { errors: this.errors };
    }
  }

  /**
   * Parse conditional expression: when condition *? thenValue : elseValue
   */
  private parseConditional(): ConditionalNode {
    const position = this.peek().position;

    // Expect 'when' keyword
    if (!this.match(TokenType.WHEN)) {
      throw new Error('Expected "when" keyword');
    }

    // Parse condition
    const condition = this.parseCondition();

    // Expect '*?' token
    if (!this.match(TokenType.CONDITIONAL_THEN)) {
      throw new Error('Expected "*?" after condition');
    }

    // Parse then value
    const thenValue = this.parseValue();

    // Parse optional else value
    let elseValue: ValueNode | undefined;
    if (this.match(TokenType.COLON)) {
      elseValue = this.parseValue();
    }

    return ASTBuilder.createConditional(
      condition,
      thenValue,
      elseValue,
      position
    );
  }

  /**
   * Parse condition (supports logical expressions)
   */
  private parseCondition(): ConditionNode {
    return this.parseLogicalOr();
  }

  /**
   * Parse logical OR expression
   */
  private parseLogicalOr(): ConditionNode {
    let expr = this.parseLogicalAnd();

    while (this.match(TokenType.OR)) {
      const operator = "OR";
      const right = this.parseLogicalAnd();
      expr = ASTBuilder.createLogicalExpression(
        operator,
        expr,
        right,
        this.previous().position
      );
    }

    return expr;
  }

  /**
   * Parse logical AND expression
   */
  private parseLogicalAnd(): ConditionNode {
    let expr = this.parseComparison();

    while (this.match(TokenType.AND)) {
      const operator = "AND";
      const right = this.parseComparison();
      expr = ASTBuilder.createLogicalExpression(
        operator,
        expr,
        right,
        this.previous().position
      );
    }

    return expr;
  }

  /**
   * Parse comparison or method call
   */
  private parseComparison(): ConditionNode {
    const position = this.peek().position;

    // Handle parentheses
    if (this.match(TokenType.LPAREN)) {
      const expr = this.parseCondition();
      if (!this.match(TokenType.RPAREN)) {
        throw new Error('Expected ")" after grouped condition');
      }
      return expr;
    }

    // Handle NOT operator (!) as prefix
    let isNegated = false;
    if (this.match(TokenType.NOT)) {
      isNegated = true;
    }

    // Parse field access
    const field = this.parseFieldAccess();

    // Check for method call
    if (this.match(TokenType.DOT)) {
      return this.parseMethodCall(field, position, isNegated);
    }

    // Parse comparison operator
    if (
      this.matchAny([
        TokenType.EQUALS,
        TokenType.NOT_EQUALS,
        TokenType.GREATER_THAN,
        TokenType.GREATER_EQUAL,
        TokenType.LESS_THAN,
        TokenType.LESS_EQUAL,
        TokenType.MATCHES,
        TokenType.NOT_MATCHES,
      ])
    ) {
      const operator = this.previous().type;
      const right = this.parseComparisonValue();
      return ASTBuilder.createComparison(operator, field, right, position);
    }

    throw new Error(
      `Expected comparison operator or method call after field "${field.path.join(".")}"`
    );
  }

  /**
   * Parse method call: field.$method(args) or field.!method
   */
  private parseMethodCall(
    field: FieldAccessNode,
    position: number,
    isNegated: boolean = false
  ): MethodCallNode {
    let methodName = "";
    let methodType: TokenType | undefined;
    let isRuntimeMethod = false;

    // Only handle runtime methods that start with $ (like $exists, $empty)
    if (this.check(TokenType.DOLLAR)) {
      this.advance(); // consume '$'

      if (!this.check(TokenType.IDENTIFIER)) {
        throw new Error('Expected method name after "$"');
      }

      const baseMethodName = this.advance().value; // consume method name
      methodName = `$${baseMethodName}`;
      methodType = this.getMethodTokenType(baseMethodName); // Map to base method type
      isRuntimeMethod = true;

      // Apply negation if the method call was prefixed with !
      if (isNegated) {
        methodType = this.getNegatedMethodType(methodType);
        methodName = `!${methodName}`;
      }
    } else {
      throw new Error(
        "Only $method() syntax is supported. Use property.$method() instead of property.method"
      );
    }

    if (!methodType) {
      throw new Error(`Unknown method: ${methodName}`);
    }

    // All runtime methods require parentheses
    if (!this.check(TokenType.LPAREN)) {
      throw new Error(
        `Runtime method "${methodName}" requires parentheses: ${methodName}()`
      );
    }

    // Parse method arguments
    this.advance(); // consume '('
    const args: LiteralNode[] = [];

    if (!this.check(TokenType.RPAREN)) {
      do {
        args.push(this.parseLiteral());
      } while (this.match(TokenType.COMMA));
    }

    if (!this.match(TokenType.RPAREN)) {
      throw new Error('Expected ")" after method arguments');
    }

    return ASTBuilder.createMethodCall(
      methodType,
      field,
      args,
      position,
      isRuntimeMethod
    );
  }

  /**
   * Parse field access: field or field.subfield or field["key"]
   */
  private parseFieldAccess(): FieldAccessNode {
    const position = this.peek().position;
    const path: string[] = [];

    if (!this.check(TokenType.IDENTIFIER)) {
      throw new Error("Expected field name");
    }

    path.push(this.advance().value);

    // Handle nested field access (dot notation and bracket notation)
    while (true) {
      // Handle dot notation: field.subfield
      if (
        this.check(TokenType.DOT) &&
        this.peekNext()?.type === TokenType.IDENTIFIER
      ) {
        // Check if the next token is a runtime method ($method)
        if (this.peekNext()?.type === TokenType.DOLLAR) {
          break; // Stop here, let parseComparison handle the runtime method call
        }

        this.advance(); // consume '.'
        path.push(this.advance().value);
      }
      // Handle bracket notation: field["key"] or field[0]
      else if (this.check(TokenType.LBRACKET)) {
        this.advance(); // consume '['

        // FIXED: Accept both string keys and numeric indices
        if (!this.check(TokenType.STRING) && !this.check(TokenType.NUMBER)) {
          throw new Error(
            "Expected string key or numeric index in bracket notation"
          );
        }

        const key = this.advance().value;
        path.push(key);

        if (!this.match(TokenType.RBRACKET)) {
          throw new Error("Expected ']' after bracket notation key");
        }
      } else {
        break; // No more field access patterns
      }
    }

    return ASTBuilder.createFieldAccess(path, position);
  }

  /**
   * Parse value (literal, constant, array, or nested conditional)
   */
  private parseValue(): ValueNode {
    const position = this.peek().position;

    // DEBUG: Log current token
    if (this.config.enableDebug) {
      console.log(
        `parseValue: current token = ${this.peek().type} "${this.peek().value}" at position ${this.peek().position}`
      );
    }

    // Handle nested conditional
    if (this.check(TokenType.WHEN) && this.config.allowNestedConditionals) {
      return this.parseConditional();
    }

    // Handle constant value (=value syntax)
    if (this.check(TokenType.CONSTANT)) {
      const value = this.advance().value;
      return ASTBuilder.createConstant(value, position);
    }

    // Handle constant value with equals prefix
    if (this.check(TokenType.EQUALS)) {
      if (this.config.enableDebug) {
        console.log(`parseValue: Found EQUALS token, advancing...`);
      }
      this.advance(); // consume '='

      // Check if it's an array literal
      if (this.check(TokenType.LBRACKET)) {
        if (this.config.enableDebug) {
          console.log(
            `parseValue: Found LBRACKET after EQUALS, parsing array...`
          );
        }
        this.advance(); // consume the '[' token
        const arrayNode = this.parseArray(position);
        // Convert array to string representation for constant
        const arrayValue = JSON.stringify(
          arrayNode.elements.map((el) => el.value)
        );
        return ASTBuilder.createConstant(arrayValue, position);
      }

      // ENHANCED: Check if it's an object literal
      if (this.check(TokenType.LBRACE)) {
        if (this.config.enableDebug) {
          console.log(
            `parseValue: Found LBRACE after EQUALS, parsing object...`
          );
        }
        const objectLiteral = this.parseObjectLiteral();
        return ASTBuilder.createConstant(objectLiteral, position);
      }

      // Handle regular literal
      const literal = this.parseLiteral();
      return ASTBuilder.createConstant(literal.value.toString(), position);
    }

    // Handle array
    if (this.match(TokenType.LBRACKET)) {
      return this.parseArray(position);
    }

    // Handle literal
    return this.parseLiteral();
  }

  /**
   * Parse array: [value1, value2, ...]
   */
  private parseArray(position: number): ArrayNode {
    const elements: LiteralNode[] = [];

    if (!this.check(TokenType.RBRACKET)) {
      do {
        elements.push(this.parseLiteral());
      } while (this.match(TokenType.COMMA));
    }

    if (!this.match(TokenType.RBRACKET)) {
      throw new Error('Expected "]" after array elements');
    }

    return ASTBuilder.createArray(elements, position);
  }

  /**
   * Parse object literal: {key: value, key2: value2}
   * ENHANCED: Support for complex object constants like ={test: [1]}
   * FIXED: Generate proper JSON format for validation
   */
  private parseObjectLiteral(): string {
    this.advance(); // consume '{'

    const objectParts: any = {};

    // Parse object properties
    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      // Parse key
      if (!this.check(TokenType.IDENTIFIER) && !this.check(TokenType.STRING)) {
        throw new Error("Expected property name in object literal");
      }

      const keyToken = this.advance();
      let key = keyToken.value;

      // STRING tokens from lexer already have quotes removed, no need to slice
      // FIXED: Don't remove characters from already-unquoted string tokens

      // Expect colon
      if (!this.match(TokenType.COLON)) {
        throw new Error('Expected ":" after property name');
      }

      // Parse value
      let value: any;

      if (this.check(TokenType.LBRACKET)) {
        // Handle array value
        this.advance(); // consume '['
        const arrayNode = this.parseArray(this.peek().position);
        value = arrayNode.elements.map((el) => el.value);
      } else if (this.check(TokenType.LBRACE)) {
        // Handle nested object (recursive)
        const nestedObject = this.parseObjectLiteral();
        value = JSON.parse(nestedObject);
      } else {
        // Handle primitive value (including null)
        if (this.check(TokenType.IDENTIFIER) && this.peek().value === "null") {
          this.advance(); // consume 'null'
          value = null;
        } else {
          const literal = this.parseLiteral();
          value = literal.value;
        }
      }

      objectParts[key] = value;

      // Check for comma (optional for last property)
      if (this.check(TokenType.COMMA)) {
        this.advance();
      }
    }

    // Expect closing brace
    if (!this.match(TokenType.RBRACE)) {
      throw new Error('Expected "}" to close object literal');
    }

    // Return proper JSON string
    return JSON.stringify(objectParts);
  }

  /**
   * Parse comparison value (handles regex patterns and complex values)
   */
  private parseComparisonValue(): LiteralNode {
    const position = this.peek().position;

    // Handle regex patterns
    if (this.check(TokenType.REGEX_PATTERN)) {
      const pattern = this.advance().value;
      return ASTBuilder.createLiteral(pattern, "string", position);
    }

    // Handle parentheses patterns (like (temp|disposable|10min) or @(company|org|gov))
    if (this.check(TokenType.LPAREN) || this.check(TokenType.AT)) {
      return this.parseComplexPattern();
    }

    // Handle complex patterns with special characters
    if (
      this.check(TokenType.CARET) ||
      this.check(TokenType.AT) ||
      this.check(TokenType.IDENTIFIER)
    ) {
      let pattern = "";

      // Build complex pattern by consuming tokens until we hit a delimiter
      while (
        !this.isAtEnd() &&
        !this.check(TokenType.CONDITIONAL_THEN) &&
        !this.check(TokenType.COLON) &&
        !this.check(TokenType.AND) &&
        !this.check(TokenType.OR) &&
        !this.check(TokenType.RPAREN)
      ) {
        const token = this.advance();
        pattern += token.value;
      }

      if (pattern.length > 0) {
        return ASTBuilder.createLiteral(pattern, "string", position);
      }
    }

    // Fall back to regular literal parsing
    return this.parseLiteral();
  }

  /**
   * Parse literal value
   */
  private parseLiteral(): LiteralNode {
    const position = this.peek().position;

    if (this.match(TokenType.STRING)) {
      return ASTBuilder.createLiteral(
        this.previous().value,
        "string",
        position
      );
    }

    if (this.match(TokenType.NUMBER)) {
      const value = parseFloat(this.previous().value);
      return ASTBuilder.createLiteral(value, "number", position);
    }

    if (this.match(TokenType.BOOLEAN)) {
      const value = this.previous().value === "true";
      return ASTBuilder.createLiteral(value, "boolean", position);
    }

    // Handle DOT followed by identifier (like .tmp in method arguments)
    if (this.match(TokenType.DOT)) {
      let value = ".";

      // Consume following tokens to build the complete value
      while (
        !this.isAtEnd() &&
        !this.check(TokenType.COMMA) &&
        !this.check(TokenType.RPAREN) &&
        !this.check(TokenType.CONDITIONAL_THEN) &&
        !this.check(TokenType.COLON)
      ) {
        const token = this.advance();
        value += token.value;
      }

      return ASTBuilder.createLiteral(value, "string", position);
    }

    // Handle complex patterns with parentheses (like @(company|org|gov))
    if (
      this.check(TokenType.AT) ||
      this.check(TokenType.CARET) ||
      this.check(TokenType.IDENTIFIER)
    ) {
      return this.parseComplexPattern();
    }

    if (this.match(TokenType.IDENTIFIER)) {
      const identifier = this.previous().value;

      // Check for type with constraints (e.g., number(0.1,0.3))
      if (this.check(TokenType.LPAREN)) {
        this.advance(); // consume '('
        let typeWithConstraints = `${identifier}(`;

        // Parse constraint parameters
        while (!this.check(TokenType.RPAREN) && !this.isAtEnd()) {
          const token = this.advance();
          typeWithConstraints += token.value;
        }

        if (this.match(TokenType.RPAREN)) {
          typeWithConstraints += ")";
        }

        return ASTBuilder.createLiteral(
          typeWithConstraints,
          "string",
          position
        );
      }

      // Check if this is a schema type with array notation (e.g., string[], number[])
      if (
        this.check(TokenType.LBRACKET) &&
        this.peekNext()?.type === TokenType.RBRACKET
      ) {
        this.advance(); // consume '['
        this.advance(); // consume ']'

        // Check for optional array notation (e.g., string[]?)
        let schemaType = `${identifier}[]`;
        if (this.check(TokenType.UNKNOWN) && this.peek().value === "?") {
          this.advance(); // consume '?'
          schemaType += "?";
        }

        return ASTBuilder.createLiteral(schemaType, "string", position);
      }

      // Check for optional notation (e.g., string?)
      if (this.check(TokenType.UNKNOWN) && this.peek().value === "?") {
        this.advance(); // consume '?'
        return ASTBuilder.createLiteral(`${identifier}?`, "string", position);
      }

      // Treat identifier as string literal in this context
      return ASTBuilder.createLiteral(identifier, "string", position);
    }

    throw new Error(`Expected literal value, got ${this.peek().type}`);
  }

  /**
   * Parse complex patterns with parentheses and special characters
   * Handles patterns like @(company|org|gov), (temp|disposable|10min), etc.
   */
  private parseComplexPattern(): LiteralNode {
    const position = this.peek().position;
    let pattern = "";
    let depth = 0;

    // Build the complete pattern by consuming tokens
    while (!this.isAtEnd()) {
      const token = this.peek();

      // Stop at conditional operators or end of expression
      if (
        token.type === TokenType.CONDITIONAL_THEN ||
        token.type === TokenType.COLON ||
        token.type === TokenType.AND ||
        token.type === TokenType.OR
      ) {
        break;
      }

      // Handle parentheses depth tracking
      if (token.type === TokenType.LPAREN) {
        depth++;
      } else if (token.type === TokenType.RPAREN) {
        depth--;
        // If we close all parentheses, include this token and stop
        if (depth < 0) {
          break;
        }
      }

      // Add token to pattern
      pattern += this.advance().value;

      // If we've closed all parentheses, we're done
      if (depth === 0 && pattern.includes(")")) {
        break;
      }
    }

    return ASTBuilder.createLiteral(pattern, "string", position);
  }

  /**
   * Utility methods
   */
  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private matchAny(types: TokenType[]): boolean {
    return this.match(...types);
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private peekNext(): Token | undefined {
    if (this.current + 1 >= this.tokens.length) return undefined;
    return this.tokens[this.current + 1];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private getMethodTokenType(methodName: string): TokenType | undefined {
    const methodMap: Record<string, TokenType> = {
      in: TokenType.IN,
      notIn: TokenType.NOT_IN,
      "!in": TokenType.NOT_IN, // Support .!in() syntax
      exists: TokenType.EXISTS,
      notExists: TokenType.NOT_EXISTS,
      "!exists": TokenType.NOT_EXISTS, // Support .!exists syntax
      empty: TokenType.EMPTY,
      "!empty": TokenType.NOT_EMPTY, // Support .!empty syntax
      null: TokenType.NULL, // Support .null syntax
      "!null": TokenType.NOT_NULL, // Support .!null syntax
      contains: TokenType.CONTAINS,
      notContains: TokenType.NOT_CONTAINS,
      "!contains": TokenType.NOT_CONTAINS, // Support .!contains() syntax
      startsWith: TokenType.STARTS_WITH,
      endsWith: TokenType.ENDS_WITH,
      between: TokenType.BETWEEN,
    };

    return methodMap[methodName];
  }

  /**
   * Get the negated version of a method type
   */
  private getNegatedMethodType(
    methodType: TokenType | undefined
  ): TokenType | undefined {
    const negationMap: Partial<Record<TokenType, TokenType>> = {
      [TokenType.EXISTS]: TokenType.NOT_EXISTS,
      [TokenType.EMPTY]: TokenType.NOT_EMPTY,
      [TokenType.NULL]: TokenType.NOT_NULL,
      [TokenType.IN]: TokenType.NOT_IN,
      [TokenType.CONTAINS]: TokenType.NOT_CONTAINS,
    };

    return methodType ? negationMap[methodType] : undefined;
  }

  private addError(
    type: ErrorType,
    message: string,
    suggestion?: string
  ): void {
    const token = this.peek();
    this.errors.push({
      type,
      message,
      position: token.position,
      line: token.line,
      column: token.column,
      suggestion,
      context: {
        nearbyTokens: this.tokens.slice(
          Math.max(0, this.current - 2),
          this.current + 3
        ),
        expectedTokens: [],
      },
    });
  }
}
