/**
 * Constraint Parser Module
 *
 * Optimized parsing of constraint syntax like "string(3,20)", "number(0,100)?", etc.
 * Uses caching and pre-compiled patterns for better performance.
 */

import { VALID_CONDITIONNAL_TYPES } from "../../../../types/ValidatorTypes";

export interface ParsedConstraints {
  type: string;
  constraints: any;
  optional: boolean;
}

enum ConstraintType {
  Min = "min",
  Max = "max",
  MinLength = "minLength",
  MaxLength = "maxLength",
  MinItems = "minItems",
  MaxItems = "maxItems",
}

/**
 * Optimized constraint parser with caching and robust error handling
 */
export class ConstraintParser {
  // Private static properties for better encapsulation
  private static readonly _parseCache = new Map<string, ParsedConstraints>();
  private static readonly _maxCacheSize = 1000;
  private static _cacheHits = 0;
  private static _cacheMisses = 0;

  // Pre-compiled regex patterns for better performance
  private static readonly _patterns = {
    constraint: /^([a-zA-Z\[\]]+)\((.+)\)$/,
    regex: /^\/(.+)\/([gimsuvy]*)$/,
    commaSplit: /\s*,\s*/,
    numeric: /^-?\d+(\.\d+)?$/,
    baseType: /^[a-zA-Z\[\]]+$/,
    complexConstraint: /^[a-zA-Z\[\]]+\([^)]*\)$/,
  } as const;

  // Private constants
  private static readonly _questionMarkCharCode = 63; // '?'
  private static readonly _openParenCharCode = 40; // '('
  private static readonly _closeParenCharCode = 41; // ')'

  /**
   * Parse constraint syntax with aggressive caching
   */
  static parseConstraints(fieldType: string): ParsedConstraints {
    if (!fieldType || typeof fieldType !== "string") {
      throw new Error("Invalid field type: must be a non-empty string");
    }

    // Check cache first
    const cached = this._parseCache.get(fieldType);
    if (cached) {
      this._cacheHits++;
      return { ...cached }; // Return a copy to prevent mutation
    }

    this._cacheMisses++;
    const result = this._parseConstraintsInternal(fieldType);

    // Cache the result with size limit
    this._addToCache(fieldType, result);

    return result;
  }

  /**
   * Internal parsing logic - optimized for speed and robustness
   */
  private static _parseConstraintsInternal(
    fieldType: string
  ): ParsedConstraints {
    let optional = false;
    let type = fieldType.trim();
    let constraints: any = {};

    if (!type) {
      throw new Error("Field type cannot be empty");
    }

    // Check if optional (ends with ?) - optimized check
    if (type.charCodeAt(type.length - 1) === this._questionMarkCharCode) {
      optional = true;
      type = type.slice(0, -1).trim();

      if (!type) {
        throw new Error('Invalid field type: cannot be only "?"');
      }
    }

    // Parse constraints with balanced parentheses support
    const constraintMatch = this._parseBalancedConstraints(type);
    if (constraintMatch) {
      const { baseType, constraintStr } = constraintMatch;
      type = baseType;

      if (constraintStr) {
        try {
          constraints = this._parseConstraintString(constraintStr, baseType);
        } catch (error) {
          throw new Error(
            `Invalid constraint syntax in "${fieldType}": ${error instanceof Error ? error.message : "Unknown error"}`
          );
        }
      }
    }

    // Validate the final type
    if (!this._isValidBaseType(type)) {
      throw new Error(`Invalid base type: "${type}"`);
    }

    return { type, constraints, optional };
  }

  /**
   * Parse constraints with balanced parentheses support
   * Handles complex regex patterns like string(/^(?=.*[a-z]).*$/)
   */
  private static _parseBalancedConstraints(
    type: string
  ): { baseType: string; constraintStr: string } | null {
    const openParenIndex = type.indexOf("(");
    if (openParenIndex === -1) {
      return null; // No constraints
    }

    const baseType = type.substring(0, openParenIndex);

    // Validate base type format
    if (!this._patterns.baseType.test(baseType)) {
      throw new Error(`Invalid base type format: "${baseType}"`);
    }

    // Find matching closing parenthesis using balanced counting
    const { constraintStr, isValid } = this._extractBalancedContent(
      type,
      openParenIndex
    );

    if (!isValid) {
      throw new Error(`Unbalanced parentheses in constraint: "${type}"`);
    }

    return { baseType, constraintStr };
  }

  /**
   * Extract content within balanced parentheses
   */
  private static _extractBalancedContent(
    input: string,
    startIndex: number
  ): { constraintStr: string; isValid: boolean } {
    let depth = 0;
    let constraintStart = startIndex + 1;
    let constraintEnd = -1;

    for (let i = startIndex; i < input.length; i++) {
      const charCode = input.charCodeAt(i);

      if (charCode === this._openParenCharCode) {
        depth++;
      } else if (charCode === this._closeParenCharCode) {
        depth--;
        if (depth === 0) {
          constraintEnd = i;
          break;
        }
      }
    }

    // Validate balanced parentheses and position
    const isValid =
      constraintEnd !== -1 && constraintEnd === input.length - 1 && depth === 0;
    const constraintStr = isValid
      ? input.substring(constraintStart, constraintEnd)
      : "";

    return { constraintStr, isValid };
  }

  /**
   * Parse constraint string efficiently with better error handling
   */
  private static _parseConstraintString(
    constraintStr: string,
    baseType: string
  ): any {
    if (!constraintStr.trim()) {
      return {};
    }

    const constraints: any = {};

    // Handle regex patterns first
    const regexMatch = constraintStr.match(this._patterns.regex);
    if (regexMatch) {
      try {
        const [, pattern, flags] = regexMatch;
        constraints.pattern = new RegExp(pattern, flags || "");
        return constraints;
      } catch (error) {
        throw new Error(
          `Invalid regex pattern: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    // Handle semicolon-separated complex constraints
    if (constraintStr.includes(";")) {
      return this._parseComplexConstraints(constraintStr);
    }

    // Handle min,max constraints
    if (constraintStr.includes(",")) {
      return this._parseMinMaxConstraints(constraintStr, baseType);
    }

    // Handle single value constraint
    if (this._patterns.numeric.test(constraintStr)) {
      const val = parseFloat(constraintStr);
      if (isNaN(val)) {
        throw new Error(`Invalid numeric constraint: "${constraintStr}"`);
      }
      this._setConstraintValue(constraints, baseType, ConstraintType.Max, val);
      return constraints;
    }

    // If we reach here, the constraint format is unrecognized
    throw new Error(`Unrecognized constraint format: "${constraintStr}"`);
  }

  /**
   * Parse min,max constraint format
   */
  private static _parseMinMaxConstraints(
    constraintStr: string,
    baseType: string
  ): any {
    const constraints: any = {};
    const parts = constraintStr.split(this._patterns.commaSplit);

    if (parts.length > 2) {
      throw new Error(
        `Too many constraint values. Expected format: "min,max" but got: "${constraintStr}"`
      );
    }

    const [minStr, maxStr] = parts;

    // Parse minimum value
    if (minStr && minStr.trim()) {
      if (!this._patterns.numeric.test(minStr)) {
        throw new Error(`Invalid minimum value: "${minStr}"`);
      }
      const minVal = parseFloat(minStr);
      if (isNaN(minVal)) {
        throw new Error(`Invalid minimum value: "${minStr}"`);
      }
      this._setConstraintValue(
        constraints,
        baseType,
        ConstraintType.Min,
        minVal
      );
    }

    // Parse maximum value
    if (maxStr && maxStr.trim()) {
      if (!this._patterns.numeric.test(maxStr)) {
        throw new Error(`Invalid maximum value: "${maxStr}"`);
      }
      const maxVal = parseFloat(maxStr);
      if (isNaN(maxVal)) {
        throw new Error(`Invalid maximum value: "${maxStr}"`);
      }
      this._setConstraintValue(
        constraints,
        baseType,
        ConstraintType.Max,
        maxVal
      );
    }

    // Validate min/max relationship
    if (
      constraints.min !== undefined &&
      constraints.max !== undefined &&
      constraints.min > constraints.max
    ) {
      throw new Error(
        `Minimum value (${constraints.min}) cannot be greater than maximum value (${constraints.max})`
      );
    }

    return constraints;
  }

  /**
   * Set constraint value based on type - optimized logic
   */
  private static _setConstraintValue(
    constraints: any,
    baseType: string,
    constraintType: ConstraintType.Min | ConstraintType.Max,
    value: number
  ): void {
    if (
      value < 0 &&
      (constraintType === ConstraintType.Min ||
        constraintType === ConstraintType.Max)
    ) {
      // Allow negative values but validate they make sense for the type
      if (
        baseType.includes("string") &&
        constraintType === ConstraintType.Min &&
        value < 0
      ) {
        throw new Error("String length constraints cannot be negative");
      }
      if (baseType.includes("[]") && value < 0) {
        throw new Error("Array length constraints cannot be negative");
      }
    }

    if (baseType.includes("[]")) {
      constraints[
        constraintType === ConstraintType.Min
          ? ConstraintType.MinItems
          : ConstraintType.MaxItems
      ] = value;
    } else if (baseType === "string" || baseType.includes("string")) {
      constraints[
        constraintType === ConstraintType.Min
          ? ConstraintType.MinLength
          : ConstraintType.MaxLength
      ] = value;
    } else {
      constraints[constraintType] = value;
    }
  }

  /**
   * Validate if a base type is valid
   */
  private static _isValidBaseType(type: string): boolean {
    if (!type || typeof type !== "string") {
      return false;
    }

    // Allow basic types and array types

    // Check if it's a valid basic type or union type
    if (
      VALID_CONDITIONNAL_TYPES.includes(type) ||
      type.includes("|") ||
      type.startsWith("=")
    ) {
      return true;
    }

    // Check if it matches the general pattern for custom types
    return this._patterns.baseType.test(type);
  }

  /**
   * Add item to cache with size management
   */
  private static _addToCache(key: string, value: ParsedConstraints): void {
    if (this._parseCache.size >= this._maxCacheSize) {
      // Remove oldest entries (simple FIFO strategy)
      const firstKey = this._parseCache.keys().next().value;
      if (firstKey) {
        this._parseCache.delete(firstKey);
      }
    }

    // Store a deep copy to prevent external mutations
    this._parseCache.set(key, {
      type: value.type,
      constraints: { ...value.constraints },
      optional: value.optional,
    });
  }

  /**
   * Parse complex constraint expressions
   */
  private static _parseComplexConstraints(constraintStr: string): any {
    const constraints: any = {};
    const parts = constraintStr
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean);

    for (const part of parts) {
      const colonIndex = part.indexOf(":");
      if (colonIndex === -1) {
        throw new Error(
          `Invalid constraint format. Expected "key:value" but got: "${part}"`
        );
      }

      const key = part.substring(0, colonIndex).trim();
      const value = part.substring(colonIndex + 1).trim();

      if (!key || !value) {
        throw new Error(
          `Invalid constraint format. Both key and value must be non-empty: "${part}"`
        );
      }

      try {
        this._parseComplexConstraintPair(constraints, key, value);
      } catch (error) {
        throw new Error(
          `Error parsing constraint "${part}": ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    return constraints;
  }

  /**
   * Parse individual constraint key-value pair
   */
  private static _parseComplexConstraintPair(
    constraints: any,
    key: string,
    value: string
  ): void {
    switch (key) {
      case ConstraintType.Min:
      case ConstraintType.Max:
      case ConstraintType.MinLength:
      case ConstraintType.MaxLength:
      case ConstraintType.MinItems:
      case ConstraintType.MaxItems:
        if (!this._patterns.numeric.test(value)) {
          throw new Error(`"${key}" must be a valid number, got: "${value}"`);
        }
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          throw new Error(`"${key}" must be a valid number, got: "${value}"`);
        }
        if (numValue < 0 && (key.includes("Length") || key.includes("Items"))) {
          throw new Error(`"${key}" cannot be negative`);
        }
        constraints[key] = numValue;
        break;

      case "pattern":
        if (value.startsWith("/") && value.includes("/")) {
          const lastSlashIndex = value.lastIndexOf("/");
          if (lastSlashIndex > 0) {
            const pattern = value.substring(1, lastSlashIndex);
            const flags = value.substring(lastSlashIndex + 1);
            constraints.pattern = new RegExp(pattern, flags);
          } else {
            throw new Error(`Invalid regex format: "${value}"`);
          }
        } else {
          throw new Error(
            `Pattern must be in regex format (/pattern/flags): "${value}"`
          );
        }
        break;

      case "unique":
        const lowerValue = value.toLowerCase();
        if (lowerValue !== "true" && lowerValue !== "false") {
          throw new Error(
            `"unique" must be "true" or "false", got: "${value}"`
          );
        }
        constraints.unique = lowerValue === "true";
        break;

      default:
        throw new Error(`Unknown constraint key: "${key}"`);
    }
  }

  // Public utility methods (keep existing API)

  /**
   * Check if a field type has constraints
   */
  static hasConstraints(fieldType: string): boolean {
    if (!fieldType || typeof fieldType !== "string") {
      return false;
    }

    const type = fieldType.endsWith("?") ? fieldType.slice(0, -1) : fieldType;
    return this._patterns.complexConstraint.test(type);
  }

  /**
   * Extract base type without constraints
   */
  static getBaseType(fieldType: string): string {
    try {
      const parsed = this.parseConstraints(fieldType);
      return parsed.type;
    } catch {
      // Fallback for invalid types
      return fieldType.replace(/\([^)]*\)\??$/, "").replace(/\?$/, "");
    }
  }

  /**
   * Check if field type is optional
   */
  static isOptional(fieldType: string): boolean {
    return typeof fieldType === "string" && fieldType.endsWith("?");
  }

  /**
   * Check if field type is an array
   */
  static isArrayType(fieldType: string): boolean {
    try {
      const parsed = this.parseConstraints(fieldType);
      return parsed.type.endsWith("[]");
    } catch {
      return false;
    }
  }

  /**
   * Get element type for array types
   */
  static getElementType(fieldType: string): string {
    try {
      const parsed = this.parseConstraints(fieldType);
      if (parsed.type.endsWith("[]")) {
        return parsed.type.slice(0, -2);
      }
      return parsed.type;
    } catch {
      return fieldType;
    }
  }

  /**
   * Validate constraint values
   */
  static validateConstraints(constraints: any, type: string): string[] {
    if (!constraints || typeof constraints !== "object") {
      return [];
    }

    const errors: string[] = [];

    try {
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

      // Validate type-specific constraints
      if (
        type === "positive" &&
        constraints.min !== undefined &&
        constraints.min < 0
      ) {
        errors.push("Positive type cannot have negative minimum value");
      }

      if (
        type === "negative" &&
        constraints.max !== undefined &&
        constraints.max > 0
      ) {
        errors.push("Negative type cannot have positive maximum value");
      }

      // Validate regex pattern
      if (constraints.pattern && !(constraints.pattern instanceof RegExp)) {
        errors.push("Pattern constraint must be a RegExp object");
      }

      // Validate negative values for length/item constraints
      [
        ConstraintType.MinLength,
        ConstraintType.MaxLength,
        ConstraintType.MinItems,
        ConstraintType.MaxItems,
      ].forEach((key) => {
        if (constraints[key] !== undefined && constraints[key] < 0) {
          errors.push(`${key} cannot be negative`);
        }
      });
    } catch (error) {
      errors.push(
        `Constraint validation error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }

    return errors;
  }

  /**
   * Merge constraints with options
   */
  static mergeConstraints(baseOptions: any, constraints: any): any {
    if (!baseOptions && !constraints) {
      return {};
    }
    if (!baseOptions) {
      return { ...constraints };
    }
    if (!constraints) {
      return { ...baseOptions };
    }

    return { ...baseOptions, ...constraints };
  }

  /**
   * Clear cache for memory management
   */
  static clearCache(): void {
    this._parseCache.clear();
    this._cacheHits = 0;
    this._cacheMisses = 0;
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): {
    size: number;
    hitRate: number;
    hits: number;
    misses: number;
  } {
    const total = this._cacheHits + this._cacheMisses;
    const hitRate = total > 0 ? this._cacheHits / total : 0;

    return {
      size: this._parseCache.size,
      hitRate: Number(hitRate.toFixed(4)),
      hits: this._cacheHits,
      misses: this._cacheMisses,
    };
  }

  /**
   * Get constraint description for error messages
   */
  static getConstraintDescription(constraints: any, _type?: string): string {
    if (!constraints || typeof constraints !== "object") {
      return "";
    }

    const descriptions: string[] = [];

    try {
      const constraintKeys = [
        ConstraintType.Min,
        ConstraintType.Max,
        ConstraintType.MinLength,
        ConstraintType.MaxLength,
        ConstraintType.MinItems,
        ConstraintType.MaxItems,
      ] as const;

      constraintKeys.forEach((key) => {
        if (constraints[key] !== undefined) {
          descriptions.push(`${key}: ${constraints[key]}`);
        }
      });

      if (constraints.pattern instanceof RegExp) {
        descriptions.push(`pattern: ${constraints.pattern.source}`);
      }

      if (constraints.unique === true) {
        descriptions.push("unique: true");
      }
    } catch (error) {
      return `(invalid constraints: ${error instanceof Error ? error.message : "Unknown error"})`;
    }

    return descriptions.length > 0 ? `(${descriptions.join(", ")})` : "";
  }

  /**
   * Parse complex constraint expressions (enhanced version)
   */
  static parseComplexConstraints(constraintStr: string): any {
    if (!constraintStr || typeof constraintStr !== "string") {
      return {};
    }

    try {
      return this._parseComplexConstraints(constraintStr);
    } catch (error) {
      throw new Error(
        `Failed to parse complex constraints "${constraintStr}": ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}
