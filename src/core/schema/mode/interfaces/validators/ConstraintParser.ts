/**
 * Constraint Parser Module
 *
 * Optimized parsing of constraint syntax like "string(3,20)", "number(0,100)?", etc.
 * Uses caching and pre-compiled patterns for better performance.
 */

export interface ParsedConstraints {
  type: string;
  constraints: any;
  optional: boolean;
}

// Cache for parsed constraints to avoid repeated parsing
const parseCache = new Map<string, ParsedConstraints>();

// Pre-compiled regex patterns for better performance
// FIXED: Handle nested parentheses in constraints like string(/^(?=.*[a-z]).*$/)
const CONSTRAINT_PATTERN = /^([a-zA-Z\[\]]+)\((.+)\)$/;
const REGEX_PATTERN = /^\/(.+)\/$/;
const COMMA_SPLIT = /\s*,\s*/;
const NUMERIC_PATTERN = /^-?\d+(\.\d+)?$/;

/**
 * Optimized constraint parser with caching
 */
export class ConstraintParser {
  /**
   * Parse constraint syntax with aggressive caching
   */
  static parseConstraints(fieldType: string): ParsedConstraints {
    // Check cache first
    const cached = parseCache.get(fieldType);
    if (cached) {
      return cached;
    }

    const result = this.parseConstraintsInternal(fieldType);

    // Cache the result (limit cache size to prevent memory leaks)
    if (parseCache.size < 1000) {
      parseCache.set(fieldType, result);
    }

    return result;
  }

  /**
   * Internal parsing logic - optimized for speed
   * FIXED: Handle nested parentheses in regex patterns correctly
   */
  private static parseConstraintsInternal(
    fieldType: string
  ): ParsedConstraints {
    let optional = false;
    let type = fieldType;
    let constraints: any = {};

    // Check if optional (ends with ?) - optimized check
    if (type.charCodeAt(type.length - 1) === 63) {
      // 63 is '?'
      optional = true;
      type = type.slice(0, -1);
    }

    // FIXED: Use balanced parentheses parsing for complex constraints
    const constraintMatch = this.parseBalancedConstraints(type);
    if (constraintMatch) {
      const { baseType, constraintStr } = constraintMatch;
      type = baseType;

      if (constraintStr) {
        constraints = this.parseConstraintString(constraintStr, baseType);
      }
    }

    return { type, constraints, optional };
  }

  /**
   * Parse constraints with balanced parentheses support
   * Handles complex regex patterns like string(/^(?=.*[a-z]).*$/)
   */
  private static parseBalancedConstraints(
    type: string
  ): { baseType: string; constraintStr: string } | null {
    // Find the base type (everything before the first opening parenthesis)
    const openParenIndex = type.indexOf("(");
    if (openParenIndex === -1) {
      return null; // No constraints
    }

    const baseType = type.substring(0, openParenIndex);

    // Validate base type
    if (!/^[a-zA-Z\[\]]+$/.test(baseType)) {
      return null;
    }

    // Find the matching closing parenthesis using balanced counting
    let depth = 0;
    let constraintStart = openParenIndex + 1;
    let constraintEnd = -1;

    for (let i = openParenIndex; i < type.length; i++) {
      if (type[i] === "(") {
        depth++;
      } else if (type[i] === ")") {
        depth--;
        if (depth === 0) {
          constraintEnd = i;
          break;
        }
      }
    }

    // Check if we found a balanced closing parenthesis and it's at the end
    if (constraintEnd === -1 || constraintEnd !== type.length - 1) {
      return null;
    }

    const constraintStr = type.substring(constraintStart, constraintEnd);
    return { baseType, constraintStr };
  }

  /**
   * Parse constraint string efficiently
   */
  private static parseConstraintString(
    constraintStr: string,
    baseType: string
  ): any {
    const constraints: any = {};

    // Handle regex patterns first
    const regexMatch = constraintStr.match(REGEX_PATTERN);
    if (regexMatch) {
      constraints.pattern = new RegExp(regexMatch[1]);
      return constraints;
    }

    // Handle min,max constraints
    if (constraintStr.includes(",")) {
      const parts = constraintStr.split(COMMA_SPLIT);
      const [minStr, maxStr] = parts;

      if (minStr && NUMERIC_PATTERN.test(minStr)) {
        const minVal = parseFloat(minStr);
        this.setConstraintValue(constraints, baseType, "min", minVal);
      }

      if (maxStr && NUMERIC_PATTERN.test(maxStr)) {
        const maxVal = parseFloat(maxStr);
        this.setConstraintValue(constraints, baseType, "max", maxVal);
      }
    } else if (NUMERIC_PATTERN.test(constraintStr)) {
      // Single value constraint
      const val = parseFloat(constraintStr);
      this.setConstraintValue(constraints, baseType, "max", val);
    }

    return constraints;
  }

  /**
   * Set constraint value based on type - optimized logic
   */
  private static setConstraintValue(
    constraints: any,
    baseType: string,
    constraintType: "min" | "max",
    value: number
  ): void {
    if (baseType.includes("[]")) {
      constraints[constraintType === "min" ? "minItems" : "maxItems"] = value;
    } else if (baseType === "string" || baseType.includes("string")) {
      constraints[constraintType === "min" ? "minLength" : "maxLength"] = value;
    } else {
      constraints[constraintType] = value;
    }
  }

  /**
   * Check if a field type has constraints
   */
  static hasConstraints(fieldType: string): boolean {
    // Remove optional marker
    const type = fieldType.endsWith("?") ? fieldType.slice(0, -1) : fieldType;
    return /^[a-zA-Z\[\]]+\([^)]*\)$/.test(type);
  }

  /**
   * Extract base type without constraints
   */
  static getBaseType(fieldType: string): string {
    const parsed = this.parseConstraints(fieldType);
    return parsed.type;
  }

  /**
   * Check if field type is optional
   */
  static isOptional(fieldType: string): boolean {
    return fieldType.endsWith("?");
  }

  /**
   * Check if field type is an array
   */
  static isArrayType(fieldType: string): boolean {
    const parsed = this.parseConstraints(fieldType);
    return parsed.type.endsWith("[]");
  }

  /**
   * Get element type for array types
   */
  static getElementType(fieldType: string): string {
    const parsed = this.parseConstraints(fieldType);
    if (parsed.type.endsWith("[]")) {
      return parsed.type.slice(0, -2);
    }
    return parsed.type;
  }

  /**
   * Validate constraint values
   */
  static validateConstraints(constraints: any, type: string): string[] {
    const errors: string[] = [];

    // Validate numeric constraints
    if (constraints.min !== undefined && constraints.max !== undefined) {
      if (constraints.min > constraints.max) {
        errors.push("Minimum value cannot be greater than maximum value");
      }
    }

    // Validate length constraints
    if (
      constraints.minLength !== undefined &&
      constraints.maxLength !== undefined
    ) {
      if (constraints.minLength > constraints.maxLength) {
        errors.push("Minimum length cannot be greater than maximum length");
      }
    }

    // Validate array constraints
    if (
      constraints.minItems !== undefined &&
      constraints.maxItems !== undefined
    ) {
      if (constraints.minItems > constraints.maxItems) {
        errors.push("Minimum items cannot be greater than maximum items");
      }
    }

    // Validate negative constraints
    if (
      constraints.min !== undefined &&
      constraints.min < 0 &&
      type === "positive"
    ) {
      errors.push("Positive type cannot have negative minimum value");
    }

    if (
      constraints.max !== undefined &&
      constraints.max > 0 &&
      type === "negative"
    ) {
      errors.push("Negative type cannot have positive maximum value");
    }

    return errors;
  }

  /**
   * Merge constraints with options
   */
  static mergeConstraints(baseOptions: any, constraints: any): any {
    return { ...baseOptions, ...constraints };
  }

  /**
   * Clear cache for memory management
   */
  static clearCache(): void {
    parseCache.clear();
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): { size: number; hitRate: number } {
    return {
      size: parseCache.size,
      hitRate: 0, // Would need hit/miss tracking for accurate rate
    };
  }

  /**
   * Get constraint description for error messages
   */
  static getConstraintDescription(constraints: any, _type?: string): string {
    const descriptions: string[] = [];

    if (constraints.min !== undefined) {
      descriptions.push(`min: ${constraints.min}`);
    }
    if (constraints.max !== undefined) {
      descriptions.push(`max: ${constraints.max}`);
    }
    if (constraints.minLength !== undefined) {
      descriptions.push(`minLength: ${constraints.minLength}`);
    }
    if (constraints.maxLength !== undefined) {
      descriptions.push(`maxLength: ${constraints.maxLength}`);
    }
    if (constraints.minItems !== undefined) {
      descriptions.push(`minItems: ${constraints.minItems}`);
    }
    if (constraints.maxItems !== undefined) {
      descriptions.push(`maxItems: ${constraints.maxItems}`);
    }
    if (constraints.pattern) {
      descriptions.push(`pattern: ${constraints.pattern.source}`);
    }
    if (constraints.unique) {
      descriptions.push("unique: true");
    }

    return descriptions.length > 0 ? `(${descriptions.join(", ")})` : "";
  }

  /**
   * Parse complex constraint expressions
   */
  static parseComplexConstraints(constraintStr: string): any {
    const constraints: any = {};

    // Handle multiple constraints separated by semicolons
    // Example: "min:0;max:100;pattern:/^[a-z]+$/"
    if (constraintStr.includes(";")) {
      const parts = constraintStr.split(";");
      for (const part of parts) {
        const [key, value] = part.split(":").map((s) => s.trim());
        if (key && value) {
          switch (key) {
            case "min":
            case "max":
            case "minLength":
            case "maxLength":
            case "minItems":
            case "maxItems":
              const numValue = parseFloat(value);
              if (!isNaN(numValue)) {
                constraints[key] = numValue;
              }
              break;
            case "pattern":
              if (value.startsWith("/") && value.endsWith("/")) {
                constraints.pattern = new RegExp(value.slice(1, -1));
              }
              break;
            case "unique":
              constraints.unique = value.toLowerCase() === "true";
              break;
          }
        }
      }
    }

    return constraints;
  }
}
