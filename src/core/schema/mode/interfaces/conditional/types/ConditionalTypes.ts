/**
 * Type definitions for enhanced conditional validation system
 */

import { ValidationError } from "../../../../../types/types";

// Token types for lexical analysis
export enum TokenType {
  // Keywords
  WHEN = "WHEN",

  // Operators
  EQUALS = "EQUALS", // =
  NOT_EQUALS = "NOT_EQUALS", // !=
  GREATER_THAN = "GREATER_THAN", // >
  GREATER_EQUAL = "GREATER_EQUAL", // >=
  LESS_THAN = "LESS_THAN", // <
  LESS_EQUAL = "LESS_EQUAL", // <=
  MATCHES = "MATCHES", // ~
  NOT_MATCHES = "NOT_MATCHES", // !~

  // Logical operators
  AND = "AND", // &&
  OR = "OR", // ||
  NOT = "NOT", // !

  // State operators
  NOT_EXISTS = "NOT_EXISTS", // !exists
  NOT_EMPTY = "NOT_EMPTY", // !empty
  NOT_NULL = "NOT_NULL", // !null

  // Method operators
  IN = "IN", // .in()
  NOT_IN = "NOT_IN", // .notIn()
  EXISTS = "EXISTS", // .exists
  EMPTY = "EMPTY", // .empty
  NULL = "NULL", // .null
  CONTAINS = "CONTAINS", // .contains()
  NOT_CONTAINS = "NOT_CONTAINS", // .notContains()
  STARTS_WITH = "STARTS_WITH", // .startsWith()
  ENDS_WITH = "ENDS_WITH", // .endsWith()
  BETWEEN = "BETWEEN", // .between()

  // Conditional syntax
  CONDITIONAL_THEN = "CONDITIONAL_THEN", // *?
  COLON = "COLON", // :

  // Grouping
  LPAREN = "LPAREN", // (
  RPAREN = "RPAREN", // )
  LBRACKET = "LBRACKET", // [
  RBRACKET = "RBRACKET", // ]
  LBRACE = "LBRACE", // {
  RBRACE = "RBRACE", // }

  // Values
  IDENTIFIER = "IDENTIFIER", // field names, values
  STRING = "STRING", // quoted strings
  NUMBER = "NUMBER", // numeric values
  BOOLEAN = "BOOLEAN", // true/false
  CONSTANT = "CONSTANT", // =value syntax

  // Separators
  COMMA = "COMMA", // ,
  DOT = "DOT", // .
  PIPE = "PIPE", // | (for regex alternation)
  CARET = "CARET", // ^ (for regex start anchor)
  DOLLAR = "DOLLAR", // $ (for regex end anchor)
  AT = "AT", // @ (for email patterns)

  // Special
  EOF = "EOF", // End of input
  WHITESPACE = "WHITESPACE", // Spaces, tabs
  UNKNOWN = "UNKNOWN", // Unknown token
  REGEX_PATTERN = "REGEX_PATTERN", // Complex regex patterns
}

// Token structure
export interface Token {
  type: TokenType;
  value: string;
  position: number;
  line: number;
  column: number;
}

// AST Node types
export enum ASTNodeType {
  CONDITIONAL = "CONDITIONAL",
  CONDITION = "CONDITION",
  LOGICAL_EXPRESSION = "LOGICAL_EXPRESSION",
  COMPARISON = "COMPARISON",
  METHOD_CALL = "METHOD_CALL",
  FIELD_ACCESS = "FIELD_ACCESS",
  LITERAL = "LITERAL",
  CONSTANT = "CONSTANT",
  ARRAY = "ARRAY",
}

// Base AST node
export interface ASTNode {
  type: ASTNodeType;
  position: number;
}

// Conditional expression: when condition *? thenValue : elseValue
export interface ConditionalNode extends ASTNode {
  type: ASTNodeType.CONDITIONAL;
  condition: ConditionNode;
  thenValue: ValueNode;
  elseValue?: ValueNode;
}

// Condition node (can be logical expression or simple comparison)
export type ConditionNode =
  | LogicalExpressionNode
  | ComparisonNode
  | MethodCallNode;

// Logical expression: condition && condition, condition || condition
export interface LogicalExpressionNode extends ASTNode {
  type: ASTNodeType.LOGICAL_EXPRESSION;
  operator: "AND" | "OR";
  left: ConditionNode;
  right: ConditionNode;
}

// Comparison: field = value, field > value, etc.
export interface ComparisonNode extends ASTNode {
  type: ASTNodeType.COMPARISON;
  operator: TokenType;
  left: FieldAccessNode;
  right: LiteralNode;
}

// Method call: field.in(values), field.exists, field.$exists(), etc.
export interface MethodCallNode extends ASTNode {
  type: ASTNodeType.METHOD_CALL;
  method: TokenType;
  field: FieldAccessNode;
  arguments?: LiteralNode[];
  isRuntimeMethod?: boolean; // Flag to indicate runtime methods (starting with $)
}

// Field access: simple field or nested field.subfield
export interface FieldAccessNode extends ASTNode {
  type: ASTNodeType.FIELD_ACCESS;
  path: string[];
}

// Literal values: strings, numbers, booleans
export interface LiteralNode extends ASTNode {
  type: ASTNodeType.LITERAL;
  value: string | number | boolean;
  dataType: "string" | "number" | "boolean";
}

// Constant values: =value syntax
export interface ConstantNode extends ASTNode {
  type: ASTNodeType.CONSTANT;
  value: string;
}

// Array of values: [value1, value2]
export interface ArrayNode extends ASTNode {
  type: ASTNodeType.ARRAY;
  elements: LiteralNode[];
}

// Value types for then/else clauses
export type ValueNode =
  | LiteralNode
  | ConstantNode
  | ArrayNode
  | ConditionalNode;

// Evaluation context
export interface EvaluationContext {
  data: Record<string, any>;
  schema?: Record<string, any>; // Add schema for path validation
  fieldPath: string[];
  parentContext?: Record<string, any>; // NEW: Parent context for nested field resolution
  options?: {
    strict?: boolean;
    debug?: boolean;
    validatePaths?: boolean; // New option to enable path validation
    enableCaching?: boolean; // Performance optimization option
  };
}

// Evaluation result
export interface EvaluationResult {
  success: boolean;
  value?: any;
  errors: ValidationError[];
  debugInfo?: {
    evaluationPath: string[];
    conditionResults: Record<string, boolean>;
    finalCondition: boolean;
  };
}

// Parser configuration
export interface ParserConfig {
  allowNestedConditionals: boolean;
  maxNestingDepth: number;
  strictMode: boolean;
  enableDebug: boolean;
}

// Error types
export enum ErrorType {
  SYNTAX_ERROR = "SYNTAX_ERROR",
  SEMANTIC_ERROR = "SEMANTIC_ERROR",
  EVALUATION_ERROR = "EVALUATION_ERROR",
  TYPE_ERROR = "TYPE_ERROR",
}

// Enhanced error information
export interface ConditionalError {
  type: ErrorType;
  message: string;
  position: number;
  line: number;
  column: number;
  suggestion?: string;
  context?: {
    nearbyTokens: Token[];
    expectedTokens: TokenType[];
  };
}

// Operator metadata
export interface OperatorInfo {
  symbol: string;
  precedence: number;
  associativity: "left" | "right";
  operandCount: number;
  supportedTypes: string[];
  description: string;
  examples: string[];
}

// Method metadata
export interface MethodInfo {
  name: string;
  parameterCount: number;
  parameterTypes: string[];
  returnType: string;
  description: string;
  examples: string[];
  supportedFieldTypes: string[];
}

// Schema introspection result
export interface SchemaIntrospection {
  fieldName: string;
  conditionalSyntax: string;
  parsedAST: ConditionalNode;
  possibleValues: any[];
  requiredConditions: string[];
  optionalConditions: string[];
  nullabilityRules: string[];
}

// Validation result for schema pre-validation
export interface SchemaValidationResult {
  valid: boolean;
  errors: ConditionalError[];
  warnings: string[];
  suggestions: string[];
  introspection: SchemaIntrospection[];
}
