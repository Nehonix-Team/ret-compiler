/**
 * Internal Syntax Parser for Conditional Validation
 *
 * This is an internal utility used by the schema validation engine
 * to parse clean syntax conditional validation strings.
 *
 * NOT part of the public API - used internally by InterfaceSchema.
 */

import { ConditionalPattern } from "../../../../../types/types";
import { ConditionalBuilder } from "../ConditionalBuilder";

/**
 * Internal syntax parser for conditional validation
 * Used by InterfaceSchema to parse clean syntax strings
 */
export class InternalSyntaxParser {
  /**
   * Parse clean syntax string into conditional configuration
   *
   * Supports multiple syntax formats:
   * 1. New clear syntax: "when(role=admin) then(string[]) else(number)"
   * 2. Legacy syntax: "when:role=admin:string[]:number" (for backward compatibility)
   *
   * @internal - Not part of public API
   */
  static parseConditionalSyntax(cleanSyntax: string): any | null {
    // Try revolutionary syntax first: "when condition *? schema : schema"
    if (cleanSyntax.includes("when ") && cleanSyntax.includes(" *? ")) {
      return this.parseRevolutionarySyntax(cleanSyntax);
    }

    // Try parentheses syntax: "when(condition) then(schema) else(schema)"
    if (cleanSyntax.includes("when(") && cleanSyntax.includes(") then(")) {
      return this.parseNewClearSyntax(cleanSyntax);
    }

    // Fall back to legacy syntax for backward compatibility
    if (cleanSyntax.startsWith("when:")) {
      return this.parseLegacySyntax(cleanSyntax);
    }

    return null;
  }

  /**
   * Parse revolutionary syntax: "when condition *? schema : schema"
   *
   * Your brilliant syntax design! Much clearer than alternatives:
   * - "when role=admin *? string[] : number"
   * - "when age>=18 *? string : string?"
   * - "when userType.in(admin,teacher) *? string[] : string[]?"
   *
   * @internal
   */
  private static parseRevolutionarySyntax(cleanSyntax: string): any | null {
    // Match pattern: when condition *? thenSchema : elseSchema
    const match = cleanSyntax.match(
      /^when\s+(.+?)\s+\*\?\s+(.+?)(?:\s*:\s*(.+))?$/
    );

    if (!match) {
      return null;
    }

    const [, conditionPart, thenSchema, elseSchema] = match;

    // Parse the condition part
    const pattern = this.parseConditionPart(conditionPart);
    if (!pattern) {
      return null;
    }

    pattern.thenSchema = thenSchema;
    pattern.elseSchema = elseSchema;

    // Convert to conditional builder format
    return this.convertToConditionalConfig(pattern);
  }

  /**
   * Parse parentheses syntax: "when(condition) then(schema) else(schema)"
   *
   * @internal
   */
  private static parseNewClearSyntax(cleanSyntax: string): any | null {
    // Use a more sophisticated parsing approach to handle nested parentheses
    const result = this.parseParenthesesSyntax(cleanSyntax);

    if (!result) {
      return null;
    }

    const { condition, thenSchema, elseSchema } = result;

    // Parse the condition part
    const pattern = this.parseConditionPart(condition);
    if (!pattern) {
      return null;
    }

    pattern.thenSchema = thenSchema;
    pattern.elseSchema = elseSchema;

    // Convert to conditional builder format
    return this.convertToConditionalConfig(pattern);
  }

  /**
   * Parse parentheses-based syntax with proper nesting support
   *
   * @internal
   */
  private static parseParenthesesSyntax(
    syntax: string
  ): { condition: string; thenSchema: string; elseSchema?: string } | null {
    if (!syntax.startsWith("when(")) {
      return null;
    }

    let pos = 5; // Start after "when("
    let depth = 1;
    let condition = "";

    // Extract condition (handle nested parentheses)
    while (pos < syntax.length && depth > 0) {
      const char = syntax[pos];
      if (char === "(") depth++;
      else if (char === ")") depth--;

      if (depth > 0) {
        condition += char;
      }
      pos++;
    }

    if (depth !== 0) return null;

    // Look for " then("
    const thenMatch = syntax.slice(pos).match(/^\s*then\(/);
    if (!thenMatch) return null;

    pos += thenMatch[0].length;
    depth = 1;
    let thenSchema = "";

    // Extract then schema (handle nested parentheses)
    while (pos < syntax.length && depth > 0) {
      const char = syntax[pos];
      if (char === "(") depth++;
      else if (char === ")") depth--;

      if (depth > 0) {
        thenSchema += char;
      }
      pos++;
    }

    if (depth !== 0) return null;

    // Look for optional " else("
    const elseMatch = syntax.slice(pos).match(/^\s*else\(/);
    if (!elseMatch) {
      return { condition, thenSchema };
    }

    pos += elseMatch[0].length;
    depth = 1;
    let elseSchema = "";

    // Extract else schema (handle nested parentheses)
    while (pos < syntax.length && depth > 0) {
      const char = syntax[pos];
      if (char === "(") depth++;
      else if (char === ")") depth--;

      if (depth > 0) {
        elseSchema += char;
      }
      pos++;
    }

    if (depth !== 0) return null;

    return { condition, thenSchema, elseSchema };
  }

  /**
   * Parse legacy syntax: "when:condition:then:else"
   *
   * @internal - For backward compatibility
   */
  private static parseLegacySyntax(cleanSyntax: string): any | null {
    const content = cleanSyntax.slice(5); // Remove "when:"
    const parts = content.split(":");

    if (parts.length < 2) {
      return null;
    }

    const [conditionPart, thenSchema, elseSchema] = parts;

    // Parse the condition part
    const pattern = this.parseConditionPart(conditionPart);
    if (!pattern) {
      return null;
    }

    pattern.thenSchema = thenSchema;
    pattern.elseSchema = elseSchema;

    // Convert to conditional builder format
    return this.convertToConditionalConfig(pattern);
  }

  /**
   * Parse condition part of the syntax
   *
   * @internal
   */
  private static parseConditionPart(
    condition: string
  ): ConditionalPattern | null {
    // Handle special methods like .exists, .in()
    if (condition.includes(".exists")) {
      const field = condition.replace(".exists", "");
      return {
        field,
        operator: "exists",
        thenSchema: "",
      };
    }

    if (condition.includes(".!exists")) {
      const field = condition.replace(".!exists", "");
      return {
        field,
        operator: "!exists",
        thenSchema: "",
      };
    }

    if (condition.includes(".empty")) {
      const field = condition.replace(".empty", "");
      return {
        field,
        operator: "empty",
        thenSchema: "",
      };
    }

    if (condition.includes(".!empty")) {
      const field = condition.replace(".!empty", "");
      return {
        field,
        operator: "!empty",
        thenSchema: "",
      };
    }

    if (condition.includes(".null")) {
      const field = condition.replace(".null", "");
      return {
        field,
        operator: "null",
        thenSchema: "",
      };
    }

    if (condition.includes(".!null")) {
      const field = condition.replace(".!null", "");
      return {
        field,
        operator: "!null",
        thenSchema: "",
      };
    }

    if (condition.includes(".in(")) {
      const match = condition.match(/(.+)\.in\(([^)]+)\)/);
      if (match) {
        const [, field, valuesList] = match;
        const values = valuesList.split(",").map((v) => v.trim());
        return {
          field,
          operator: "in",
          value: values,
          thenSchema: "",
        };
      }
    }

    if (condition.includes(".!in(")) {
      const match = condition.match(/(.+)\.!in\(([^)]+)\)/);
      if (match) {
        const [, field, valuesList] = match;
        const values = valuesList.split(",").map((v) => v.trim());
        return {
          field,
          operator: "!in",
          value: values,
          thenSchema: "",
        };
      }
    }

    if (condition.includes(".startsWith(")) {
      const match = condition.match(/(.+)\.startsWith\(([^)]+)\)/);
      if (match) {
        const [, field, value] = match;
        return {
          field,
          operator: "startsWith",
          value: value.trim(),
          thenSchema: "",
        };
      }
    }

    if (condition.includes(".endsWith(")) {
      const match = condition.match(/(.+)\.endsWith\(([^)]+)\)/);
      if (match) {
        const [, field, value] = match;
        return {
          field,
          operator: "endsWith",
          value: value.trim(),
          thenSchema: "",
        };
      }
    }

    if (condition.includes(".contains(")) {
      const match = condition.match(/(.+)\.contains\(([^)]+)\)/);
      if (match) {
        const [, field, value] = match;
        return {
          field,
          operator: "contains",
          value: value.trim(),
          thenSchema: "",
        };
      }
    }

    if (condition.includes(".!contains(")) {
      const match = condition.match(/(.+)\.!contains\(([^)]+)\)/);
      if (match) {
        const [, field, value] = match;
        return {
          field,
          operator: "!contains",
          value: value.trim(),
          thenSchema: "",
        };
      }
    }

    // Handle operators in order of specificity
    const operators = ["!~", "!=", ">=", "<=", "=", ">", "<", "~"];

    for (const op of operators) {
      if (condition.includes(op)) {
        const [field, value] = condition.split(op);

        let parsedValue: any = value?.trim();

        // Parse value based on operator
        if (op !== "~") {
          // Don't parse regex patterns
          if (parsedValue === "true") parsedValue = true;
          else if (parsedValue === "false") parsedValue = false;
          else if (parsedValue === "null") parsedValue = null;
          else if (parsedValue === "undefined") parsedValue = undefined;
          else if (/^\d+(\.\d+)?$/.test(parsedValue))
            parsedValue = parseFloat(parsedValue);
        }

        return {
          field: field.trim(),
          operator: op as any,
          value: parsedValue,
          thenSchema: "",
        };
      }
    }

    return null;
  }

  /**
   * Convert parsed pattern to conditional builder configuration
   *
   * @internal
   */
  private static convertToConditionalConfig(pattern: ConditionalPattern): any {
    const builder = new ConditionalBuilder(pattern.field);

    // Apply the condition based on operator
    let conditionalThen;

    switch (pattern.operator) {
      case "=":
        conditionalThen = builder.is(pattern.value);
        break;
      case "!=":
        conditionalThen = builder.isNot(pattern.value);
        break;
      case ">":
        conditionalThen = builder.when(
          (val) => typeof val === "number" && val > pattern.value
        );
        break;
      case "<":
        conditionalThen = builder.when(
          (val) => typeof val === "number" && val < pattern.value
        );
        break;
      case ">=":
        conditionalThen = builder.when(
          (val) => typeof val === "number" && val >= pattern.value
        );
        break;
      case "<=":
        conditionalThen = builder.when(
          (val) => typeof val === "number" && val <= pattern.value
        );
        break;
      case "~":
        const regex = new RegExp(pattern.value);
        conditionalThen = builder.matches(regex);
        break;
      case "in":
        conditionalThen = builder.in(pattern.value);
        break;
      case "!in":
        conditionalThen = builder.when((val) => !pattern.value.includes(val));
        break;
      case "exists":
        conditionalThen = builder.exists();
        break;
      case "!exists":
        conditionalThen = builder.when((val) => val == null);
        break;
      case "!~":
        const notRegex = new RegExp(pattern.value);
        conditionalThen = builder.when(
          (val) => typeof val === "string" && !notRegex.test(val)
        );
        break;
      case "empty":
        conditionalThen = builder.when((val) => {
          if (val === null || val === undefined) return true;
          if (typeof val === "string") return val.length === 0;
          if (Array.isArray(val)) return val.length === 0;
          if (typeof val === "object") return Object.keys(val).length === 0;
          return false;
        });
        break;
      case "!empty":
        conditionalThen = builder.when((val) => {
          if (val === null || val === undefined) return false;
          if (typeof val === "string") return val.length > 0;
          if (Array.isArray(val)) return val.length > 0;
          if (typeof val === "object") return Object.keys(val).length > 0;
          return true;
        });
        break;
      case "null":
        conditionalThen = builder.when((val) => val === null);
        break;
      case "!null":
        conditionalThen = builder.when((val) => val !== null);
        break;
      case "startsWith":
        conditionalThen = builder.when(
          (val) => typeof val === "string" && val.startsWith(pattern.value)
        );
        break;
      case "endsWith":
        conditionalThen = builder.when(
          (val) => typeof val === "string" && val.endsWith(pattern.value)
        );
        break;
      case "contains":
        conditionalThen = builder.when(
          (val) => typeof val === "string" && val.includes(pattern.value)
        );
        break;
      case "!contains":
        conditionalThen = builder.when(
          (val) => typeof val === "string" && !val.includes(pattern.value)
        );
        break;
      default:
        return null;
    }

    // Apply then schema
    const builderWithThen = conditionalThen.then(pattern.thenSchema);

    // Apply else schema if provided
    if (pattern.elseSchema) {
      return builderWithThen.default(pattern.elseSchema);
    }

    return builderWithThen.build();
  }

  /**
   * Check if a string uses conditional syntax
   *
   * Supports revolutionary, parentheses, and legacy syntax
   *
   * @internal
   */
  static isConditionalSyntax(value: string): boolean {
    return (
      typeof value === "string" &&
      (value.startsWith("when:") || // Legacy syntax
        (value.includes("when(") && value.includes(") then(")) || // Parentheses syntax
        (value.includes("when ") && value.includes(" *? "))) // Revolutionary *? syntax
    );
  }
}

/**
 * Internal utilities for conditional validation syntax parsing
 * Used by InterfaceSchema - not part of public API
 */
export const ConditionalSyntaxUtils = {
  parse: InternalSyntaxParser.parseConditionalSyntax.bind(InternalSyntaxParser),
  isConditional:
    InternalSyntaxParser.isConditionalSyntax.bind(InternalSyntaxParser),
};
