/**
 * Validation Helpers Module
 *
 * Contains optimized helper functions for validation operations
 * extracted from InterfaceSchema to improve maintainability.
 */

import { SchemaValidationResult } from "../../../../types/types";
import { SchemaOptions } from "../Interface";
import { TypeValidators } from "./TypeValidators";
import { OptimizedUnionValidator as OUV } from "./UnionCache";

// Cache for parsed constant values to avoid repeated parsing
const constantCache = new Map<string, any>();

// Pre-compiled regex patterns for better performance
const NUMERIC_PATTERN = /^\d+(\.\d+)?$/;
const BOOLEAN_PATTERN = /^(true|false)$/;

/**
 * Helper functions for validation operations
 */
export class ValidationHelpers {
  /**
   * Validate constant types (e.g., "=admin", "=user")
   * Optimized with caching for repeated constant validations
   */
  static validateConstantType(
    constantValue: string,
    value: any
  ): SchemaValidationResult {
    // Check cache first
    let expectedValue = constantCache.get(constantValue);

    if (expectedValue === undefined) {
      // Parse and cache the constant value
      expectedValue = this.parseConstantValue(constantValue);
      constantCache.set(constantValue, expectedValue);
    }

    if (value !== expectedValue) {
      return this.createErrorResult(
        `Expected constant value: ${expectedValue}, got ${value}`,
        value
      );
    }

    return this.createSuccessResult(value);
  }

  /**
   * Parse constant value with type coercion
   */
  private static parseConstantValue(constantValue: string): any {
    // Numeric check
    if (NUMERIC_PATTERN.test(constantValue)) {
      return parseFloat(constantValue);
    }

    // Boolean check
    if (BOOLEAN_PATTERN.test(constantValue)) {
      return constantValue === "true";
    }

    return constantValue;
  }

  /**
   * Validate union types (e.g., "pending|accepted|rejected" or "(user|admin|guest)")
   * OPTIMIZED: Uses caching to eliminate repeated parsing - addresses 3.2x performance gap with Zod
   * Now handles parentheses for grouped unions
   */
  static validateUnionType(
    unionType: string,
    value: any
  ): SchemaValidationResult {
    // Use optimized cached validation
    // const { OUV } = require('./UnionCache');
    const result = OUV.validateUnion(unionType, value);

    if (!result.isValid) {
      return this.createErrorResult(result.error!, value);
    }

    return this.createSuccessResult(value);
  }

  /**
   * Validate record types (e.g., "record<string,any>")
   * Optimized with early returns and better error handling
   */
  static validateRecordType(
    type: string,
    value: any,
    validateFieldType: (fieldType: string, value: any) => SchemaValidationResult
  ): SchemaValidationResult {
    const recordMatch = type.match(/^record<([^,]+),(.+)>$/);

    if (!recordMatch) {
      return this.createErrorResult(
        `Invalid Record type format: ${type}`,
        value
      );
    }

    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return this.createErrorResult("Expected object for Record type", value);
    }

    const [, keyType, valueType] = recordMatch;
    const trimmedValueType = valueType.trim();
    const errors: string[] = [];

    // Batch validation for better performance
    for (const [key, val] of Object.entries(value)) {
      // Validate key type (currently only string keys supported)
      if (keyType === "string" && typeof key !== "string") {
        errors.push(`Record key must be string, got ${typeof key}`);
        continue;
      }

      // Validate value type
      const valueResult = validateFieldType(trimmedValueType, val);
      if (!valueResult.success) {
        errors.push(
          `Record value for key "${key}": ${valueResult.errors.join(", ")}`
        );
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        errors,
        warnings: [],
        data: value,
      };
    }

    return this.createSuccessResult(value);
  }

  /**
   * Validate array with constraints
   * Optimized with pre-checks and batch validation
   */
  static validateArrayWithConstraints(
    value: any,
    elementType: string,
    constraints: any,
    validateElementType: (
      elementType: string,
      value: any
    ) => SchemaValidationResult
  ): SchemaValidationResult {
    if (!Array.isArray(value)) {
      return this.createErrorResult("Expected array", value);
    }

    // Pre-check constraints to fail fast
    const constraintErrors = this.validateArrayConstraints(value, constraints);
    if (constraintErrors.length > 0) {
      return {
        success: false,
        errors: constraintErrors,
        warnings: [],
        data: value,
      };
    }

    // Validate elements
    const validatedArray: any[] = [];
    const errors: string[] = [];

    for (let i = 0; i < value.length; i++) {
      const elementResult = validateElementType(elementType, value[i]);
      if (!elementResult.success) {
        errors.push(`Element ${i}: ${elementResult.errors.join(", ")}`);
      } else {
        validatedArray.push(elementResult.data);
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        errors,
        warnings: [],
        data: value,
      };
    }

    // Check uniqueness constraint efficiently
    if (constraints.unique) {
      const uniqueCheck = this.checkArrayUniqueness(validatedArray);
      if (!uniqueCheck.success) {
        return uniqueCheck;
      }
    }

    return this.createSuccessResult(validatedArray);
  }

  /**
   * Validate array constraints separately for better modularity
   */
  private static validateArrayConstraints(
    value: any[],
    constraints: any
  ): string[] {
    const errors: string[] = [];

    if (
      constraints.minItems !== undefined &&
      value.length < constraints.minItems
    ) {
      errors.push(`Array must have at least ${constraints.minItems} items`);
    }

    if (
      constraints.maxItems !== undefined &&
      value.length > constraints.maxItems
    ) {
      errors.push(`Array must have at most ${constraints.maxItems} items`);
    }

    return errors;
  }

  /**
   * Check array uniqueness efficiently
   */
  private static checkArrayUniqueness(array: any[]): SchemaValidationResult {
    const seen = new Set();
    for (const item of array) {
      const key = typeof item === "object" ? JSON.stringify(item) : item;
      if (seen.has(key)) {
        return this.createErrorResult("Array values must be unique", array);
      }
      seen.add(key);
    }
    return this.createSuccessResult(array);
  }

  /**
   * Handle undefined and null values based on optional flag
   * Optimized with early returns
   */
  static handleOptionalValue(
    value: any,
    isOptional: boolean,
    defaultValue?: any
  ): SchemaValidationResult | null {
    if (value === undefined) {
      return isOptional
        ? this.createSuccessResult(defaultValue)
        : this.createErrorResult("Required field is missing");
    }

    if (value === null) {
      return isOptional
        ? this.createSuccessResult(null)
        : this.createErrorResult("Field cannot be null");
    }

    return null; // Continue with normal validation
  }

  /**
   * Route validation to appropriate type validator
   * Optimized with Map-based lookup for better performance
   */
  static routeTypeValidation(
    type: string,
    value: any,
    options: SchemaOptions,
    constraints: any
  ): SchemaValidationResult {
    // Handle array types first (e.g., "string[]", "number[]", etc.)
    if (type.endsWith("[]")) {
      const elementType = type.slice(0, -2); // Remove "[]" suffix
      return this.validateArrayWithConstraints(
        value,
        elementType,
        constraints,
        (elementType: string, elementValue: any) =>
          this.routeTypeValidation(elementType, elementValue, options, {})
      );
    }

    // Use switch with grouped cases for better optimization
    switch (type) {
      case "string":
        return TypeValidators.validateString(value, options, constraints);

      case "number":
      case "float":
        return TypeValidators.validateNumber(
          value,
          options,
          constraints,
          type as "number" | "float"
        );

      case "int":
      case "integer":
      case "positive":
      case "negative":
        return TypeValidators.validateInteger(
          value,
          options,
          constraints,
          type as "int" | "integer" | "positive" | "negative"
        );

      case "double":
        return TypeValidators.validateFloat(
          value,
          options,
          constraints,
          "double"
        );

      case "boolean":
      case "bool":
        return TypeValidators.validateBoolean(value, options, constraints);

      case "date":
      case "datetime":
      case "timestamp":
        return TypeValidators.validateDate(
          value,
          options,
          constraints,
          type as "date" | "datetime" | "timestamp"
        );

      case "email":
        return TypeValidators.validateEmail(value);

      case "url":
      case "uri":
        return TypeValidators.validateUrl(value, type as "url" | "uri");

      case "uuid":
      case "guid":
        return TypeValidators.validateUuid(value, type as "uuid" | "guid");

      case "phone":
        return TypeValidators.validatePhone(value);

      case "slug":
        return TypeValidators.validateSlug(value);

      case "username":
        return TypeValidators.validateUsername(value);

      case "password":
        return TypeValidators.validatePassword(value);

      case "text":
        return TypeValidators.validateText(value);

      case "json":
        return TypeValidators.validateJson(value);

      case "object":
        return TypeValidators.validateObject(value);

      case "unknown":
      case "void":
      case "null":
      case "undefined":
      case "any":
        return TypeValidators.validateSpecialType(
          value,
          type as "unknown" | "void" | "null" | "undefined" | "any"
        );

      default:
        return this.createErrorResult(`Unknown type: ${type}`, value);
    }
  }

  /**
   * Merge validation results efficiently
   * Optimized to avoid unnecessary array operations
   */
  static mergeResults(
    results: SchemaValidationResult[]
  ): SchemaValidationResult {
    if (results.length === 0) {
      return this.createSuccessResult(undefined);
    }

    if (results.length === 1) {
      return results[0];
    }

    let success = true;
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const result of results) {
      if (!result.success) {
        success = false;
      }
      if (result.errors.length > 0) {
        errors.push(...result.errors);
      }
      if (result.warnings.length > 0) {
        warnings.push(...result.warnings);
      }
    }

    return {
      success,
      errors,
      warnings,
      data: undefined,
    };
  }

  /**
   * Create error result efficiently
   */
  static createErrorResult(error: string, value?: any): SchemaValidationResult {
    return {
      success: false,
      errors: [error],
      warnings: [],
      data: value,
    };
  }

  /**
   * Create success result efficiently
   */
  static createSuccessResult(
    data: any,
    warnings: string[] = []
  ): SchemaValidationResult {
    return {
      success: true,
      errors: [],
      warnings,
      data,
    };
  }

  /**
   * Clear caches for memory management in long-running applications
   */
  static clearCaches(): void {
    constantCache.clear();
  }

  /**
   * Get cache statistics for monitoring
   */
  static getCacheStats(): { constantCacheSize: number } {
    return {
      constantCacheSize: constantCache.size,
    };
  }
}
