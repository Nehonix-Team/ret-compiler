/**
 * Enhanced Conditional Evaluator
 *
 * Evaluates parsed conditional AST against actual data
 * Supports all operators and provides detailed debugging information
 */

import { ASTWalker, ASTVisitor } from "../parser/ConditionalAST";
import {
  ConditionalNode,
  LogicalExpressionNode,
  ComparisonNode,
  MethodCallNode,
  FieldAccessNode,
  LiteralNode,
  ConstantNode,
  ArrayNode,
  ValueNode,
  EvaluationContext,
  EvaluationResult,
  TokenType,
  ErrorType,
} from "../types/ConditionalTypes";

export class ConditionalEvaluator {
  /**
   * Evaluate a conditional AST against data
   */
  static evaluate(
    ast: ConditionalNode,
    data: Record<string, any>,
    options: {
      strict?: boolean;
      debug?: boolean;
      schema?: Record<string, any>;
      validatePaths?: boolean;
    } = {}
  ): EvaluationResult {
    const context: EvaluationContext = {
      data,
      schema: options.schema,
      fieldPath: [],
      options: {
        strict: false,
        debug: false,
        validatePaths: false,
        ...options,
      },
    };

    const evaluator = new ConditionalEvaluationVisitor(context);

    try {
      const result = ASTWalker.walk(ast, evaluator);

      return {
        success: true,
        value: result,
        errors: [],
        debugInfo: context.options?.debug
          ? evaluator.getDebugInfo()
          : undefined,
      };
    } catch (error) {
      return {
        success: false,
        errors: [
          `Evaluation error: ${error instanceof Error ? error.message : String(error)}`,
        ],
        debugInfo: context.options?.debug
          ? evaluator.getDebugInfo()
          : undefined,
      };
    }
  }
}

/**
 * AST Visitor for evaluating conditional expressions
 */
class ConditionalEvaluationVisitor implements ASTVisitor<any> {
  private context: EvaluationContext;
  private debugPath: string[] = [];
  private conditionResults: Record<string, boolean> = {};

  constructor(context: EvaluationContext) {
    this.context = context;
  }

  getDebugInfo() {
    return {
      evaluationPath: this.debugPath,
      conditionResults: this.conditionResults,
      finalCondition: Object.values(this.conditionResults).pop() || false,
    };
  }

  visitConditional(node: ConditionalNode): any {
    this.debugPath.push("Evaluating conditional");

    // Evaluate condition
    const conditionResult = ASTWalker.walk(node.condition, this);
    this.conditionResults[`condition_${node.position}`] = conditionResult;

    if (conditionResult) {
      this.debugPath.push("Condition true - evaluating then branch");
      return ASTWalker.walk(node.thenValue, this);
    } else if (node.elseValue) {
      this.debugPath.push("Condition false - evaluating else branch");
      return ASTWalker.walk(node.elseValue, this);
    } else {
      this.debugPath.push("Condition false - no else branch");
      return undefined;
    }
  }

  visitLogicalExpression(node: LogicalExpressionNode): boolean {
    this.debugPath.push(`Evaluating logical ${node.operator}`);

    const leftResult = ASTWalker.walk(node.left, this);

    // Short-circuit evaluation
    if (node.operator === "AND" && !leftResult) {
      this.debugPath.push("AND short-circuit: left is false");
      return false;
    }

    if (node.operator === "OR" && leftResult) {
      this.debugPath.push("OR short-circuit: left is true");
      return true;
    }

    const rightResult = ASTWalker.walk(node.right, this);

    const result =
      node.operator === "AND"
        ? leftResult && rightResult
        : leftResult || rightResult;
    this.debugPath.push(`${node.operator} result: ${result}`);

    return result;
  }

  visitComparison(node: ComparisonNode): boolean {
    const leftValue = ASTWalker.walk(node.left, this);
    const rightValue = ASTWalker.walk(node.right, this);

    this.debugPath.push(
      `Comparing ${leftValue} ${this.getOperatorSymbol(node.operator)} ${rightValue}`
    );

    const result = this.performComparison(leftValue, rightValue, node.operator);
    this.debugPath.push(`Comparison result: ${result}`);

    return result;
  }

  visitMethodCall(node: MethodCallNode): boolean {
    // Use runtime field access for runtime methods, schema validation for legacy methods
    const fieldValue = node.isRuntimeMethod
      ? this.getRuntimeFieldValue(node.field.path)
      : ASTWalker.walk(node.field, this);

    const args = node.arguments
      ? node.arguments.map((arg) => ASTWalker.walk(arg, this))
      : [];

    this.debugPath.push(
      `Calling ${node.isRuntimeMethod ? "runtime" : "legacy"} method ${TokenType[node.method]} on ${fieldValue} with args [${args.join(", ")}]`
    );

    const result = this.performMethodCall(fieldValue, node.method, args);
    this.debugPath.push(`Method result: ${result}`);

    return result;
  }

  visitFieldAccess(node: FieldAccessNode): any {
    const value = this.getFieldValue(node.path);
    this.debugPath.push(`Field ${node.path.join(".")} = ${value}`);
    return value;
  }

  visitLiteral(node: LiteralNode): any {
    return node.value;
  }

  visitConstant(node: ConstantNode): any {
    // For schema validation, we need to preserve the constant prefix
    // so the validation logic knows this is a constant value
    return `=${node.value}`;
  }

  visitArray(node: ArrayNode): any[] {
    return node.elements.map((element) => ASTWalker.walk(element, this));
  }

  /**
   * Get field value from runtime data without schema validation
   * Used for runtime methods (starting with $)
   */
  private getRuntimeFieldValue(path: string[]): any {
    let current = this.context.data;

    for (const segment of path) {
      if (current === null || current === undefined) {
        return undefined;
      }
      current = current[segment];
    }

    return current;
  }

  /**
   * Get field value from data using path
   * Enhanced with schema path validation
   */
  private getFieldValue(path: string[]): any {
    // Validate path against schema if validation is enabled
    if (this.context.options?.validatePaths && this.context.schema) {
      const pathValidation = this.validateSchemaPath(path);
      if (!pathValidation.isValid) {
        throw new Error(
          `Invalid property path: ${path.join(".")}. ${pathValidation.error}`
        );
      }
    }

    let current = this.context.data;

    for (const segment of path) {
      if (current === null || current === undefined) {
        // If path validation is enabled, this should have been caught above
        if (this.context.options?.validatePaths) {
          throw new Error(
            `Property path ${path.join(".")} references undefined value at segment: ${segment}`
          );
        }
        return undefined;
      }
      current = current[segment];
    }

    return current;
  }

  /**
   * Validate that a property path exists in the schema definition
   */
  private validateSchemaPath(path: string[]): {
    isValid: boolean;
    error?: string;
  } {
    if (!this.context.schema) {
      return { isValid: true }; // No schema to validate against
    }

    let currentSchema = this.context.schema;
    const pathSoFar: string[] = [];

    for (const segment of path) {
      pathSoFar.push(segment);

      if (typeof currentSchema !== "object" || currentSchema === null) {
        return {
          isValid: false,
          error: `Cannot access property "${segment}" on non-object at path: ${pathSoFar.slice(0, -1).join(".")}`,
        };
      }

      if (!(segment in currentSchema)) {
        return {
          isValid: false,
          error: `Property "${segment}" does not exist in schema at path: ${pathSoFar.slice(0, -1).join(".") || "root"}`,
        };
      }

      currentSchema = currentSchema[segment];
    }

    return { isValid: true };
  }

  /**
   * Perform comparison operation
   */
  private performComparison(
    left: any,
    right: any,
    operator: TokenType
  ): boolean {
    switch (operator) {
      case TokenType.EQUALS:
        return left == right; // Loose equality

      case TokenType.NOT_EQUALS:
        return left != right; // Loose inequality

      case TokenType.GREATER_THAN:
        return Number(left) > Number(right);

      case TokenType.GREATER_EQUAL:
        return Number(left) >= Number(right);

      case TokenType.LESS_THAN:
        return Number(left) < Number(right);

      case TokenType.LESS_EQUAL:
        return Number(left) <= Number(right);

      case TokenType.MATCHES:
        return this.performRegexMatch(left, right);

      case TokenType.NOT_MATCHES:
        return !this.performRegexMatch(left, right);

      default:
        throw new Error(`Unknown comparison operator: ${TokenType[operator]}`);
    }
  }

  /**
   * Perform method call operation
   */
  private performMethodCall(
    fieldValue: any,
    method: TokenType,
    args: any[]
  ): boolean {
    switch (method) {
      case TokenType.IN:
        if (args.length === 0) {
          return false; // No values to check against
        }
        // Handle comma-separated values that were parsed as a single string
        const inValues = this.expandCommaSeparatedArgs(args);
        return inValues.includes(fieldValue);

      case TokenType.NOT_IN:
        if (args.length === 0) {
          return true; // If no values provided, field is not in empty set
        }
        // Handle comma-separated values that were parsed as a single string
        const notInValues = this.expandCommaSeparatedArgs(args);
        return !notInValues.includes(fieldValue);

      case TokenType.EXISTS:
        return fieldValue !== undefined && fieldValue !== null;

      case TokenType.NOT_EXISTS:
        return fieldValue === undefined || fieldValue === null;

      case TokenType.EMPTY:
        if (typeof fieldValue === "string") {
          return fieldValue.trim().length === 0;
        }
        if (Array.isArray(fieldValue)) {
          return fieldValue.length === 0;
        }
        if (typeof fieldValue === "object" && fieldValue !== null) {
          return Object.keys(fieldValue).length === 0;
        }
        return fieldValue === null || fieldValue === undefined;

      case TokenType.NOT_EMPTY:
        if (typeof fieldValue === "string") {
          return fieldValue.trim().length > 0;
        }
        if (Array.isArray(fieldValue)) {
          return fieldValue.length > 0;
        }
        if (typeof fieldValue === "object" && fieldValue !== null) {
          return Object.keys(fieldValue).length > 0;
        }
        return fieldValue !== null && fieldValue !== undefined;

      case TokenType.NULL:
        return fieldValue === null;

      case TokenType.NOT_NULL:
        return fieldValue !== null;

      case TokenType.CONTAINS:
        if (args.length === 0) {
          return false; // No argument provided
        }
        if (typeof fieldValue === "string") {
          return fieldValue.includes(String(args[0]));
        }
        if (Array.isArray(fieldValue)) {
          // For arrays, check if any of the expanded arguments are contained
          const containsValues = this.expandCommaSeparatedArgs(args);
          return containsValues.some((value) => fieldValue.includes(value));
        }
        return false;

      case TokenType.NOT_CONTAINS:
        return !this.performMethodCall(fieldValue, TokenType.CONTAINS, args);

      case TokenType.STARTS_WITH:
        if (args.length === 0) {
          return false; // No argument provided
        }
        if (typeof fieldValue === "string") {
          return fieldValue.startsWith(String(args[0]));
        }
        return false;

      case TokenType.ENDS_WITH:
        if (args.length === 0) {
          return false; // No argument provided
        }
        if (typeof fieldValue === "string") {
          return fieldValue.endsWith(String(args[0]));
        }
        return false;

      case TokenType.BETWEEN:
        if (args.length >= 2) {
          const num = Number(fieldValue);
          const min = Number(args[0]);
          const max = Number(args[1]);

          // Validate that all values are valid numbers
          if (isNaN(num) || isNaN(min) || isNaN(max)) {
            return false;
          }

          return num >= min && num <= max;
        }
        return false;

      default:
        throw new Error(`Unknown method: ${TokenType[method]}`);
    }
  }

  /**
   * Perform regex matching with enhanced pattern support
   */
  private performRegexMatch(value: any, pattern: any): boolean {
    const valueStr = String(value);
    const patternStr = String(pattern);

    try {
      // Handle common patterns that might not be valid regex
      if (
        patternStr.includes("^") ||
        patternStr.includes("$") ||
        patternStr.includes("|")
      ) {
        // This looks like a regex pattern
        const regex = new RegExp(patternStr);
        return regex.test(valueStr);
      } else {
        // Simple string matching
        return valueStr.includes(patternStr);
      }
    } catch (error) {
      // Invalid regex, fall back to string contains
      return valueStr.includes(patternStr);
    }
  }

  /**
   * Expand comma-separated arguments for .in() and .!in() methods
   * Handles cases where "admin,manager" is parsed as a single string
   */
  private expandCommaSeparatedArgs(args: any[]): any[] {
    const expandedArgs: any[] = [];

    for (const arg of args) {
      if (typeof arg === "string" && arg.includes(",")) {
        // Split comma-separated values and trim whitespace
        const splitValues = arg.split(",").map((v) => v.trim());
        expandedArgs.push(...splitValues);
      } else {
        expandedArgs.push(arg);
      }
    }

    return expandedArgs;
  }

  /**
   * Get operator symbol for debugging
   */
  private getOperatorSymbol(operator: TokenType): string {
    switch (operator) {
      case TokenType.EQUALS:
        return "=";
      case TokenType.NOT_EQUALS:
        return "!=";
      case TokenType.GREATER_THAN:
        return ">";
      case TokenType.GREATER_EQUAL:
        return ">=";
      case TokenType.LESS_THAN:
        return "<";
      case TokenType.LESS_EQUAL:
        return "<=";
      case TokenType.MATCHES:
        return "~";
      case TokenType.NOT_MATCHES:
        return "!~";
      default:
        return TokenType[operator];
    }
  }
}
