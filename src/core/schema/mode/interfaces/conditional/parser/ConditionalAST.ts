/**
 * Abstract Syntax Tree definitions for conditional expressions
 *
 * Provides a structured representation of parsed conditional syntax
 * that can be efficiently evaluated and analyzed.
 */

import {
  ASTNode,
  ASTNodeType,
  ConditionalNode,
  LogicalExpressionNode,
  ComparisonNode,
  MethodCallNode,
  FieldAccessNode,
  LiteralNode,
  ConstantNode,
  ArrayNode,
  TokenType,
} from "../types/ConditionalTypes";

/**
 * AST Builder - Factory for creating AST nodes
 */
export class ASTBuilder {
  // Private validation helpers
  private static readonly VALID_LOGICAL_OPERATORS = ["AND", "OR"] as const;
  private static readonly VALID_DATA_TYPES = [
    "string",
    "number",
    "boolean",
  ] as const;
  private static readonly MAX_NESTING_DEPTH = 50;
  private static readonly MAX_ARRAY_SIZE = 1000;

  private static _validatePosition(position: number): void {
    if (position < 0 || !Number.isInteger(position)) {
      throw new Error(
        `Invalid position: ${position}. Position must be a non-negative integer.`
      );
    }
  }

  private static _validatePath(path: string[]): void {
    if (!Array.isArray(path) || path.length === 0) {
      throw new Error(
        "Field access path must be a non-empty array of strings."
      );
    }

    for (const segment of path) {
      if (typeof segment !== "string" || segment.trim() === "") {
        throw new Error(
          `Invalid path segment: ${segment}. All segments must be non-empty strings.`
        );
      }
    }
  }

  private static _validateDataType(
    dataType: string
  ): asserts dataType is "string" | "number" | "boolean" {
    if (!this.VALID_DATA_TYPES.includes(dataType as any)) {
      throw new Error(
        `Invalid data type: ${dataType}. Must be one of: ${this.VALID_DATA_TYPES.join(", ")}`
      );
    }
  }

  private static _validateLogicalOperator(
    operator: string
  ): asserts operator is "AND" | "OR" {
    if (!this.VALID_LOGICAL_OPERATORS.includes(operator as any)) {
      throw new Error(
        `Invalid logical operator: ${operator}. Must be one of: ${this.VALID_LOGICAL_OPERATORS.join(", ")}`
      );
    }
  }

  private static _validateArraySize(elements: any[]): void {
    if (elements.length > this.MAX_ARRAY_SIZE) {
      throw new Error(
        `Array too large: ${elements.length} elements. Maximum allowed: ${this.MAX_ARRAY_SIZE}`
      );
    }
  }

  private static _deepFreeze<T extends object>(obj: T): T {
    Object.freeze(obj);
    Object.getOwnPropertyNames(obj).forEach((prop) => {
      const value = (obj as any)[prop];
      if (value && typeof value === "object") {
        this._deepFreeze(value);
      }
    });
    return obj;
  }

  /**
   * Create a conditional node
   */
  static createConditional(
    condition: ConditionalNode["condition"],
    thenValue: ConditionalNode["thenValue"],
    elseValue?: ConditionalNode["elseValue"],
    position: number = 0
  ): ConditionalNode {
    // Validate inputs
    this._validatePosition(position);

    if (!condition) {
      throw new Error("Conditional node requires a condition.");
    }

    if (!thenValue) {
      throw new Error("Conditional node requires a then value.");
    }

    const node: ConditionalNode = {
      type: ASTNodeType.CONDITIONAL,
      condition,
      thenValue,
      elseValue,
      position,
    };

    return this._deepFreeze(node);
  }

  /**
   * Create a logical expression node (AND/OR)
   */
  static createLogicalExpression(
    operator: "AND" | "OR",
    left: LogicalExpressionNode["left"],
    right: LogicalExpressionNode["right"],
    position: number = 0
  ): LogicalExpressionNode {
    // Validate inputs
    this._validatePosition(position);
    this._validateLogicalOperator(operator);

    if (!left) {
      throw new Error("Logical expression requires a left operand.");
    }

    if (!right) {
      throw new Error("Logical expression requires a right operand.");
    }

    const node: LogicalExpressionNode = {
      type: ASTNodeType.LOGICAL_EXPRESSION,
      operator,
      left,
      right,
      position,
    };

    return this._deepFreeze(node);
  }

  /**
   * Create a comparison node
   */
  static createComparison(
    operator: TokenType,
    left: FieldAccessNode,
    right: LiteralNode,
    position: number = 0
  ): ComparisonNode {
    // Validate inputs
    this._validatePosition(position);

    if (!operator) {
      throw new Error("Comparison node requires an operator.");
    }

    if (!left) {
      throw new Error(
        "Comparison node requires a left operand (field access)."
      );
    }

    if (!right) {
      throw new Error("Comparison node requires a right operand (literal).");
    }

    const node: ComparisonNode = {
      type: ASTNodeType.COMPARISON,
      operator,
      left,
      right,
      position,
    };

    return this._deepFreeze(node);
  }

  /**
   * Create a method call node
   */
  static createMethodCall(
    method: TokenType,
    field: FieldAccessNode,
    args?: LiteralNode[],
    position: number = 0,
    isRuntimeMethod: boolean = false
  ): MethodCallNode {
    // Validate inputs
    this._validatePosition(position);

    if (!method) {
      throw new Error("Method call node requires a method.");
    }

    if (!field) {
      throw new Error("Method call node requires a field.");
    }

    if (args) {
      this._validateArraySize(args);

      // Validate each argument
      for (let i = 0; i < args.length; i++) {
        if (!args[i] || args[i].type !== ASTNodeType.LITERAL) {
          throw new Error(
            `Invalid argument at index ${i}: Method call arguments must be literal nodes.`
          );
        }
      }
    }

    const node: MethodCallNode = {
      type: ASTNodeType.METHOD_CALL,
      method,
      field,
      arguments: args ? [...args] : undefined, // Shallow copy for safety
      position,
      isRuntimeMethod,
    };

    return this._deepFreeze(node);
  }

  /**
   * Create a field access node
   */
  static createFieldAccess(
    path: string[],
    position: number = 0
  ): FieldAccessNode {
    // Validate inputs
    this._validatePosition(position);
    this._validatePath(path);

    const node: FieldAccessNode = {
      type: ASTNodeType.FIELD_ACCESS,
      path: [...path], // Create defensive copy
      position,
    };

    return this._deepFreeze(node);
  }

  /**
   * Create a literal node
   */
  static createLiteral(
    value: string | number | boolean,
    dataType: "string" | "number" | "boolean",
    position: number = 0
  ): LiteralNode {
    // Validate inputs
    this._validatePosition(position);
    this._validateDataType(dataType);

    if (value === null || value === undefined) {
      throw new Error("Literal node requires a non-null, non-undefined value.");
    }

    // Type consistency validation
    const actualType = typeof value;
    if (actualType !== dataType) {
      throw new Error(
        `Type mismatch: value type '${actualType}' does not match declared type '${dataType}'.`
      );
    }

    // Additional validations based on type
    if (dataType === "number" && !Number.isFinite(value as number)) {
      throw new Error("Number literal must be finite.");
    }

    if (
      dataType === "string" &&
      typeof value === "string" &&
      value.length > 10000
    ) {
      throw new Error(
        "String literal too long. Maximum length: 10000 characters."
      );
    }

    const node: LiteralNode = {
      type: ASTNodeType.LITERAL,
      value,
      dataType,
      position,
    };

    return this._deepFreeze(node);
  }

  /**
   * Create a constant node
   */
  static createConstant(value: string, position: number = 0): ConstantNode {
    // Validate inputs
    this._validatePosition(position);

    if (typeof value !== "string" || value.trim() === "") {
      throw new Error("Constant node requires a non-empty string value.");
    }

    if (value.length > 1000) {
      throw new Error(
        "Constant value too long. Maximum length: 1000 characters."
      );
    }

    const node: ConstantNode = {
      type: ASTNodeType.CONSTANT,
      value: value.trim(),
      position,
    };

    return this._deepFreeze(node);
  }

  /**
   * Create an array node
   */
  static createArray(elements: LiteralNode[], position: number = 0): ArrayNode {
    // Validate inputs
    this._validatePosition(position);

    if (!Array.isArray(elements)) {
      throw new Error("Array node requires an array of elements.");
    }

    this._validateArraySize(elements);

    // Validate each element
    for (let i = 0; i < elements.length; i++) {
      if (!elements[i] || elements[i].type !== ASTNodeType.LITERAL) {
        throw new Error(
          `Invalid element at index ${i}: Array elements must be literal nodes.`
        );
      }
    }

    const node: ArrayNode = {
      type: ASTNodeType.ARRAY,
      elements: [...elements], // Create defensive copy
      position,
    };

    return this._deepFreeze(node);
  }
}

/**
 * AST Visitor pattern for traversing and analyzing AST
 */
export interface ASTVisitor<T> {
  visitConditional(node: ConditionalNode): T;
  visitLogicalExpression(node: LogicalExpressionNode): T;
  visitComparison(node: ComparisonNode): T;
  visitMethodCall(node: MethodCallNode): T;
  visitFieldAccess(node: FieldAccessNode): T;
  visitLiteral(node: LiteralNode): T;
  visitConstant(node: ConstantNode): T;
  visitArray(node: ArrayNode): T;
}

/**
 * AST Walker - Traverses AST nodes using visitor pattern
 */
export class ASTWalker {
  private static readonly MAX_DEPTH = 1000;
  private static _currentDepth = 0;

  private static _checkDepth(): void {
    if (this._currentDepth >= this.MAX_DEPTH) {
      throw new Error(
        `Maximum traversal depth exceeded: ${this.MAX_DEPTH}. Possible circular reference or deeply nested structure.`
      );
    }
  }

  private static _validateNode(node: ASTNode): void {
    if (!node || typeof node !== "object") {
      throw new Error("Invalid AST node: node must be a non-null object.");
    }

    if (!node.type || !Object.values(ASTNodeType).includes(node.type)) {
      throw new Error(`Invalid AST node type: ${node.type}`);
    }
  }

  private static _validateVisitor<T>(visitor: ASTVisitor<T>): void {
    if (!visitor || typeof visitor !== "object") {
      throw new Error("Visitor must be a non-null object.");
    }

    const requiredMethods = [
      "visitConditional",
      "visitLogicalExpression",
      "visitComparison",
      "visitMethodCall",
      "visitFieldAccess",
      "visitLiteral",
      "visitConstant",
      "visitArray",
    ];

    for (const method of requiredMethods) {
      if (typeof (visitor as any)[method] !== "function") {
        throw new Error(`Visitor missing required method: ${method}`);
      }
    }
  }

  static walk<T>(node: ASTNode, visitor: ASTVisitor<T>): T {
    this._validateNode(node);
    this._validateVisitor(visitor);
    this._checkDepth();

    this._currentDepth++;

    try {
      switch (node.type) {
        case ASTNodeType.CONDITIONAL:
          return visitor.visitConditional(node as ConditionalNode);

        case ASTNodeType.LOGICAL_EXPRESSION:
          return visitor.visitLogicalExpression(node as LogicalExpressionNode);

        case ASTNodeType.COMPARISON:
          return visitor.visitComparison(node as ComparisonNode);

        case ASTNodeType.METHOD_CALL:
          return visitor.visitMethodCall(node as MethodCallNode);

        case ASTNodeType.FIELD_ACCESS:
          return visitor.visitFieldAccess(node as FieldAccessNode);

        case ASTNodeType.LITERAL:
          return visitor.visitLiteral(node as LiteralNode);

        case ASTNodeType.CONSTANT:
          return visitor.visitConstant(node as ConstantNode);

        case ASTNodeType.ARRAY:
          return visitor.visitArray(node as ArrayNode);

        default:
          throw new Error(`Unknown AST node type: ${(node as any).type}`);
      }
    } catch (error: any) {
      // Add context to errors
      const contextError = new Error(
        `Error walking AST at position ${node.position}: ${(error as Error).message}`
      );
      contextError.message = error;
      throw contextError;
    } finally {
      this._currentDepth--;
    }
  }
}

/**
 * AST Analyzer - Provides analysis utilities for AST
 */
export class ASTAnalyzer {
  private static readonly FIELD_CACHE = new Map<ASTNode, string[]>();
  private static readonly COMPLEXITY_CACHE = new Map<ASTNode, number>();

  private static _clearCaches(): void {
    this.FIELD_CACHE.clear();
    this.COMPLEXITY_CACHE.clear();
  }

  private static _safeWalk<T>(node: ASTNode, visitor: ASTVisitor<T>): T {
    try {
      return ASTWalker.walk(node, visitor);
    } catch (error) {
      throw new Error(`AST analysis failed: ${(error as Error).message}`);
    }
  }

  /**
   * Get all field references in the AST
   */
  static getFieldReferences(node: ASTNode): string[] {
    // Check cache first
    if (this.FIELD_CACHE.has(node)) {
      return [...this.FIELD_CACHE.get(node)!]; // Return defensive copy
    }

    const fields: string[] = [];

    const visitor: ASTVisitor<void> = {
      visitConditional: (n) => {
        this._safeWalk(n.condition, visitor);
        this._safeWalk(n.thenValue, visitor);
        if (n.elseValue) this._safeWalk(n.elseValue, visitor);
      },

      visitLogicalExpression: (n) => {
        this._safeWalk(n.left, visitor);
        this._safeWalk(n.right, visitor);
      },

      visitComparison: (n) => {
        this._safeWalk(n.left, visitor);
        this._safeWalk(n.right, visitor);
      },

      visitMethodCall: (n) => {
        this._safeWalk(n.field, visitor);
        if (n.arguments) {
          n.arguments.forEach((arg) => this._safeWalk(arg, visitor));
        }
      },

      visitFieldAccess: (n) => {
        const fieldPath = n.path.join(".");
        if (!fields.includes(fieldPath)) {
          fields.push(fieldPath);
        }
      },

      visitLiteral: () => {},
      visitConstant: () => {},
      visitArray: (n) => {
        n.elements.forEach((el) => this._safeWalk(el, visitor));
      },
    };

    this._safeWalk(node, visitor);

    const uniqueFields = [...new Set(fields)];
    this.FIELD_CACHE.set(node, uniqueFields);

    return [...uniqueFields]; // Return defensive copy
  }

  /**
   * Get complexity score of the AST
   */
  static getComplexityScore(node: ASTNode): number {
    // Check cache first
    if (this.COMPLEXITY_CACHE.has(node)) {
      return this.COMPLEXITY_CACHE.get(node)!;
    }

    let totalScore = 0;

    const visitor: ASTVisitor<number> = {
      visitConditional: (n) => {
        let score = 2; // Base complexity for conditional
        score += this._safeWalk(n.condition, visitor);
        score += this._safeWalk(n.thenValue, visitor);
        if (n.elseValue) score += this._safeWalk(n.elseValue, visitor);
        return score;
      },

      visitLogicalExpression: (n) => {
        let score = 1; // Logical operators add complexity
        score += this._safeWalk(n.left, visitor);
        score += this._safeWalk(n.right, visitor);
        return score;
      },

      visitComparison: () => 1, // Simple comparison

      visitMethodCall: (n) => {
        let score = 2; // Method calls are more complex
        if (n.arguments) score += n.arguments.length;
        return score;
      },

      visitFieldAccess: () => 0,
      visitLiteral: () => 0,
      visitConstant: () => 0,
      visitArray: (n) => Math.ceil(n.elements.length * 0.5), // Arrays add some complexity
    };

    totalScore = this._safeWalk(node, visitor);
    this.COMPLEXITY_CACHE.set(node, totalScore);

    return totalScore;
  }

  /**
   * Check if AST contains nested conditionals
   */
  static hasNestedConditionals(node: ASTNode): boolean {
    let hasNested = false;
    let depth = 0;

    const visitor: ASTVisitor<void> = {
      visitConditional: (n) => {
        depth++;
        if (depth > 1) {
          hasNested = true;
          return; // Early exit
        }

        this._safeWalk(n.condition, visitor);
        if (!hasNested) this._safeWalk(n.thenValue, visitor);
        if (!hasNested && n.elseValue) this._safeWalk(n.elseValue, visitor);

        depth--;
      },

      visitLogicalExpression: (n) => {
        if (!hasNested) this._safeWalk(n.left, visitor);
        if (!hasNested) this._safeWalk(n.right, visitor);
      },

      visitComparison: (n) => {
        if (!hasNested) this._safeWalk(n.left, visitor);
        if (!hasNested) this._safeWalk(n.right, visitor);
      },

      visitMethodCall: (n) => {
        if (!hasNested) this._safeWalk(n.field, visitor);
        if (!hasNested && n.arguments) {
          n.arguments.forEach((arg) => this._safeWalk(arg, visitor));
        }
      },

      visitFieldAccess: () => {},
      visitLiteral: () => {},
      visitConstant: () => {},
      visitArray: (n) => {
        if (!hasNested) {
          n.elements.forEach((el) => this._safeWalk(el, visitor));
        }
      },
    };

    this._safeWalk(node, visitor);
    return hasNested;
  }

  /**
   * Validate AST structure
   */
  static validateAST(node: ASTNode): string[] {
    const errors: string[] = [];

    const visitor: ASTVisitor<void> = {
      visitConditional: (n) => {
        if (!n.condition) {
          errors.push(
            `Conditional node at position ${n.position} missing condition`
          );
        }
        if (!n.thenValue) {
          errors.push(
            `Conditional node at position ${n.position} missing then value`
          );
        }

        try {
          if (n.condition) this._safeWalk(n.condition, visitor);
          if (n.thenValue) this._safeWalk(n.thenValue, visitor);
          if (n.elseValue) this._safeWalk(n.elseValue, visitor);
        } catch (error) {
          errors.push(
            `Error validating conditional at position ${n.position}: ${(error as Error).message}`
          );
        }
      },

      visitLogicalExpression: (n) => {
        if (!n.left || !n.right) {
          errors.push(
            `Logical expression at position ${n.position} missing operands`
          );
        }
        if (!["AND", "OR"].includes(n.operator)) {
          errors.push(
            `Invalid logical operator at position ${n.position}: ${n.operator}`
          );
        }

        try {
          if (n.left) this._safeWalk(n.left, visitor);
          if (n.right) this._safeWalk(n.right, visitor);
        } catch (error) {
          errors.push(
            `Error validating logical expression at position ${n.position}: ${(error as Error).message}`
          );
        }
      },

      visitComparison: (n) => {
        if (!n.left || !n.right) {
          errors.push(`Comparison at position ${n.position} missing operands`);
        }

        try {
          if (n.left) this._safeWalk(n.left, visitor);
          if (n.right) this._safeWalk(n.right, visitor);
        } catch (error) {
          errors.push(
            `Error validating comparison at position ${n.position}: ${(error as Error).message}`
          );
        }
      },

      visitMethodCall: (n) => {
        if (!n.field) {
          errors.push(`Method call at position ${n.position} missing field`);
        }

        try {
          if (n.field) this._safeWalk(n.field, visitor);
          if (n.arguments) {
            n.arguments.forEach((arg) => this._safeWalk(arg, visitor));
          }
        } catch (error) {
          errors.push(
            `Error validating method call at position ${n.position}: ${(error as Error).message}`
          );
        }
      },

      visitFieldAccess: (n) => {
        if (!n.path || n.path.length === 0) {
          errors.push(`Field access at position ${n.position} missing path`);
        } else {
          // Validate path segments
          for (const segment of n.path) {
            if (typeof segment !== "string" || segment.trim() === "") {
              errors.push(
                `Invalid path segment in field access at position ${n.position}: "${segment}"`
              );
            }
          }
        }
      },

      visitLiteral: (n) => {
        if (n.value === undefined || n.value === null) {
          errors.push(`Literal node at position ${n.position} missing value`);
        }

        const actualType = typeof n.value;
        if (actualType !== n.dataType) {
          errors.push(
            `Type mismatch in literal at position ${n.position}: expected ${n.dataType}, got ${actualType}`
          );
        }
      },

      visitConstant: (n) => {
        if (!n.value || typeof n.value !== "string") {
          errors.push(
            `Constant node at position ${n.position} missing or invalid value`
          );
        }
      },

      visitArray: (n) => {
        if (!n.elements || !Array.isArray(n.elements)) {
          errors.push(
            `Array node at position ${n.position} missing or invalid elements`
          );
        } else {
          for (let i = 0; i < n.elements.length; i++) {
            if (!n.elements[i] || n.elements[i].type !== ASTNodeType.LITERAL) {
              errors.push(
                `Invalid element at index ${i} in array at position ${n.position}`
              );
            }
          }
        }
      },
    };

    try {
      this._safeWalk(node, visitor);
    } catch (error) {
      errors.push(`Critical validation error: ${(error as Error).message}`);
    }

    return errors;
  }

  /**
   * Clear internal caches - useful for memory management
   */
  static clearCaches(): void {
    this._clearCaches();
  }

  /**
   * Get cache statistics for debugging
   */
  static getCacheStats(): {
    fieldCacheSize: number;
    complexityCacheSize: number;
  } {
    return {
      fieldCacheSize: this.FIELD_CACHE.size,
      complexityCacheSize: this.COMPLEXITY_CACHE.size,
    };
  }
}
