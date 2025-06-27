/**
 * IDE Support Utilities for Enhanced Developer Experience
 *
 * Provides autocomplete, hover information, and validation for conditional expressions
 */

import { ConditionalParser } from "../conditional/parser/ConditionalParser";
import { ASTAnalyzer } from "../conditional/parser/ConditionalAST";
import { TypeInferenceAnalyzer } from "./TypeInference";
import {
  ConditionalNode,
  TokenType,
  ConditionalError,
} from "../conditional/types/ConditionalTypes";
import { MAX_OBJECT_DEPTH } from "../../../../../constants/VALIDATION_CONSTANTS";

// IDE completion item types
export interface CompletionItem {
  label: string;
  kind: CompletionItemKind;
  detail?: string;
  documentation?: string;
  insertText?: string;
  sortText?: string;
}

export enum CompletionItemKind {
  Text = 1,
  Method = 2,
  Function = 3,
  Constructor = 4,
  Field = 5,
  Variable = 6,
  Class = 7,
  Interface = 8,
  Module = 9,
  Property = 10,
  Unit = 11,
  Value = 12,
  Enum = 13,
  Keyword = 14,
  Snippet = 15,
  Color = 16,
  File = 17,
  Reference = 18,
  Folder = 19,
  EnumMember = 20,
  Constant = 21,
  Struct = 22,
  Event = 23,
  Operator = 24,
  TypeParameter = 25,
}

// Hover information
export interface HoverInfo {
  contents: string[];
  range?: {
    start: number;
    end: number;
  };
}

// Diagnostic information
export interface Diagnostic {
  range: {
    start: number;
    end: number;
  };
  severity: DiagnosticSeverity;
  message: string;
  source?: string;
  code?: string | number;
}

export enum DiagnosticSeverity {
  Error = 1,
  Warning = 2,
  Information = 3,
  Hint = 4,
}

/**
 * IDE Support Provider for Conditional Expressions
 */
export class ConditionalIDESupport {
  private parser: ConditionalParser;

  constructor() {
    this.parser = new ConditionalParser({
      allowNestedConditionals: true,
      maxNestingDepth: MAX_OBJECT_DEPTH,
      strictMode: false,
      enableDebug: false,
    });
  }

  /**
   * Provide autocomplete suggestions for conditional expressions
   */
  getCompletions(
    expression: string,
    position: number,
    dataSchema?: Record<string, any>
  ): CompletionItem[] {
    const completions: CompletionItem[] = [];

    // Get context at cursor position
    const context = this.getContextAtPosition(expression, position);

    switch (context.type) {
      case "keyword":
        completions.push(...this.getKeywordCompletions());
        break;

      case "field":
        completions.push(...this.getFieldCompletions(dataSchema));
        break;

      case "operator":
        completions.push(...this.getOperatorCompletions(context.fieldType));
        break;

      case "method":
        completions.push(...this.getMethodCompletions(context.fieldType));
        break;

      case "value":
        completions.push(
          ...this.getValueCompletions(context.operator, context.fieldType)
        );
        break;

      case "then_else":
        completions.push(...this.getThenElseCompletions());
        break;
    }

    return completions;
  }

  /**
   * Provide hover information for conditional expressions
   */
  getHoverInfo(expression: string, position: number): HoverInfo | null {
    const { ast, errors } = this.parser.parse(expression);

    if (errors.length > 0) {
      const error = errors.find(
        (e) => position >= e.position && position <= e.position + 10
      );

      if (error) {
        return {
          contents: [
            `**Error**: ${error.message}`,
            error.suggestion ? `**Suggestion**: ${error.suggestion}` : "",
          ].filter(Boolean),
        };
      }
    }

    if (!ast) return null;

    // Find the AST node at the position
    const nodeInfo = this.getNodeAtPosition(ast, position);
    if (!nodeInfo) return null;

    return this.getNodeHoverInfo(nodeInfo);
  }

  /**
   * Provide diagnostic information for conditional expressions
   */
  getDiagnostics(expression: string): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const { ast, errors } = this.parser.parse(expression);

    // Add parse errors
    errors.forEach((error) => {
      diagnostics.push({
        range: {
          start: error.position,
          end: error.position + 1,
        },
        severity:
          error.type === "SYNTAX_ERROR"
            ? DiagnosticSeverity.Error
            : DiagnosticSeverity.Warning,
        message: error.message,
        source: "fortify-conditional",
        code: error.type,
      });
    });

    // Add semantic warnings
    if (ast) {
      const complexity = ASTAnalyzer.getComplexityScore(ast);
      if (complexity > 20) {
        diagnostics.push({
          range: { start: 0, end: expression.length },
          severity: DiagnosticSeverity.Warning,
          message: `High complexity (${complexity}). Consider simplifying the expression.`,
          source: "fortify-conditional",
          code: "high-complexity",
        });
      }

      const hasNested = ASTAnalyzer.hasNestedConditionals(ast);
      if (hasNested) {
        diagnostics.push({
          range: { start: 0, end: expression.length },
          severity: DiagnosticSeverity.Information,
          message:
            "Expression contains nested conditionals. Ensure proper testing.",
          source: "fortify-conditional",
          code: "nested-conditionals",
        });
      }
    }

    return diagnostics;
  }

  /**
   * Format conditional expression
   */
  formatExpression(expression: string): string {
    const { ast } = this.parser.parse(expression);
    if (!ast) return expression;

    return this.formatConditionalNode(ast);
  }

  /**
   * Get context at cursor position
   */
  private getContextAtPosition(
    expression: string,
    position: number
  ): {
    type: string;
    fieldType?: string;
    operator?: string;
  } {
    const beforeCursor = expression.substring(0, position);
    const afterCursor = expression.substring(position);

    // Check if we're at the beginning or after 'when'
    if (beforeCursor.trim() === "" || beforeCursor.trim() === "when") {
      return { type: "keyword" };
    }

    // Check if we're typing a field name
    if (/when\s+\w*$/.test(beforeCursor)) {
      return { type: "field" };
    }

    // Check if we're typing an operator
    if (/when\s+\w+\s*[><=!~]*$/.test(beforeCursor)) {
      return { type: "operator" };
    }

    // Check if we're typing a method
    if (/when\s+\w+\.\w*$/.test(beforeCursor)) {
      return { type: "method" };
    }

    // Check if we're typing a value
    if (/when\s+\w+\s*[><=!~]+\s*\w*$/.test(beforeCursor)) {
      return { type: "value" };
    }

    // Check if we're in then/else clause
    if (beforeCursor.includes("*?")) {
      return { type: "then_else" };
    }

    return { type: "unknown" };
  }

  /**
   * Get keyword completions
   */
  private getKeywordCompletions(): CompletionItem[] {
    return [
      {
        label: "when",
        kind: CompletionItemKind.Keyword,
        detail: "Start a conditional expression",
        documentation: "Begin a conditional validation rule",
        insertText: "when ",
      },
    ];
  }

  /**
   * Get field completions
   */
  private getFieldCompletions(
    dataSchema?: Record<string, any>
  ): CompletionItem[] {
    const completions: CompletionItem[] = [];

    if (dataSchema) {
      Object.keys(dataSchema).forEach((field) => {
        completions.push({
          label: field,
          kind: CompletionItemKind.Field,
          detail: `Field: ${field}`,
          documentation: `Access the ${field} field`,
        });
      });
    }

    // Add common field examples
    const commonFields = [
      "id",
      "name",
      "email",
      "age",
      "role",
      "status",
      "type",
      "level",
    ];
    commonFields.forEach((field) => {
      if (!dataSchema || !dataSchema[field]) {
        completions.push({
          label: field,
          kind: CompletionItemKind.Field,
          detail: `Common field: ${field}`,
          sortText: "z" + field, // Sort after schema fields
        });
      }
    });

    return completions;
  }

  /**
   * Get operator completions
   */
  private getOperatorCompletions(fieldType?: string): CompletionItem[] {
    const operators = [
      { label: "=", detail: "Equals", doc: "Check if field equals value" },
      {
        label: "!=",
        detail: "Not equals",
        doc: "Check if field does not equal value",
      },
      {
        label: ">",
        detail: "Greater than",
        doc: "Check if field is greater than value (numbers)",
      },
      {
        label: ">=",
        detail: "Greater or equal",
        doc: "Check if field is greater than or equal to value (numbers)",
      },
      {
        label: "<",
        detail: "Less than",
        doc: "Check if field is less than value (numbers)",
      },
      {
        label: "<=",
        detail: "Less or equal",
        doc: "Check if field is less than or equal to value (numbers)",
      },
      {
        label: "~",
        detail: "Matches regex",
        doc: "Check if field matches regular expression (strings)",
      },
    ];

    return operators.map((op) => ({
      label: op.label,
      kind: CompletionItemKind.Operator,
      detail: op.detail,
      documentation: op.doc,
      insertText: op.label + " ",
    }));
  }

  /**
   * Get method completions
   */
  private getMethodCompletions(fieldType?: string): CompletionItem[] {
    const methods = [
      {
        label: "in",
        detail: "In array",
        doc: "Check if field value is in array",
        snippet: "in(${1:value1,value2})",
      },
      {
        label: "exists",
        detail: "Exists",
        doc: "Check if field exists and is not null",
      },
      {
        label: "contains",
        detail: "Contains",
        doc: "Check if field contains value",
        snippet: "contains(${1:value})",
      },
      {
        label: "startsWith",
        detail: "Starts with",
        doc: "Check if string field starts with value",
        snippet: "startsWith(${1:prefix})",
      },
      {
        label: "endsWith",
        detail: "Ends with",
        doc: "Check if string field ends with value",
        snippet: "endsWith(${1:suffix})",
      },
      {
        label: "between",
        detail: "Between",
        doc: "Check if number field is between two values",
        snippet: "between(${1:min,max})",
      },
    ];

    return methods.map((method) => ({
      label: method.label,
      kind: CompletionItemKind.Method,
      detail: method.detail,
      documentation: method.doc,
      insertText: method.snippet || method.label,
    }));
  }

  /**
   * Get value completions
   */
  private getValueCompletions(
    operator?: string,
    fieldType?: string
  ): CompletionItem[] {
    const completions: CompletionItem[] = [];

    // Add common boolean values
    completions.push(
      {
        label: "true",
        kind: CompletionItemKind.Value,
        detail: "Boolean true",
      },
      {
        label: "false",
        kind: CompletionItemKind.Value,
        detail: "Boolean false",
      }
    );

    // Add common string values
    const commonStrings = [
      "admin",
      "user",
      "guest",
      "active",
      "inactive",
      "pending",
    ];
    commonStrings.forEach((str) => {
      completions.push({
        label: str,
        kind: CompletionItemKind.Value,
        detail: `String: ${str}`,
      });
    });

    return completions;
  }

  /**
   * Get then/else completions
   */
  private getThenElseCompletions(): CompletionItem[] {
    return [
      {
        label: "=value",
        kind: CompletionItemKind.Snippet,
        detail: "Constant value",
        documentation: "Return a constant value",
        insertText: "=${1:value}",
      },
      {
        label: "string[]",
        kind: CompletionItemKind.Snippet,
        detail: "String array",
        insertText: "string[]",
      },
      {
        label: "boolean",
        kind: CompletionItemKind.Snippet,
        detail: "Boolean type",
        insertText: "boolean",
      },
    ];
  }

  /**
   * Get AST node at position
   */
  private getNodeAtPosition(ast: ConditionalNode, position: number): any {
    // This would need a more sophisticated implementation
    // to traverse the AST and find the node at the exact position
    return null;
  }

  /**
   * Get hover info for AST node
   */
  private getNodeHoverInfo(nodeInfo: any): HoverInfo {
    return {
      contents: ["Node information would go here"],
    };
  }

  /**
   * Format conditional node to string
   */
  private formatConditionalNode(node: ConditionalNode): string {
    // This would implement proper formatting logic
    return "Formatted expression";
  }
}
