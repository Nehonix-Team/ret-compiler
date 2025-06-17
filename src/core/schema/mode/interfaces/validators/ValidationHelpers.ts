/**
 * Validation Helpers Module
 * 
 * Contains helper functions for validation operations
 * extracted from InterfaceSchema to improve maintainability.
 */
 
import { SchemaValidationResult,  } from "../../../../types/types";
import { SchemaOptions } from "../Interface";
import { TypeValidators } from "./TypeValidators";

/**
 * Helper functions for validation operations
 */
export class ValidationHelpers {
  /**
   * Validate constant types (e.g., "=admin", "=user")
   */
  static validateConstantType(constantValue: string, value: any): SchemaValidationResult {
    const result: SchemaValidationResult = {
      success: true,
      errors: [],
      warnings: [],
      data: value,
    };

    // Convert the constant value to the appropriate type
    let expectedValue: any = constantValue;

    // Try to parse as number if it looks like a number
    if (/^\d+(\.\d+)?$/.test(constantValue)) {
      expectedValue = parseFloat(constantValue);
    }
    // Try to parse as boolean
    else if (constantValue === "true" || constantValue === "false") {
      expectedValue = constantValue === "true";
    }

    if (value !== expectedValue) {
      result.success = false;
      result.errors.push(`Expected constant value: ${expectedValue}, got ${value}`);
    }

    return result;
  }

  /**
   * Validate union types (e.g., "pending|accepted|rejected")
   */
  static validateUnionType(unionType: string, value: any): SchemaValidationResult {
    const result: SchemaValidationResult = {
      success: true,
      errors: [],
      warnings: [],
      data: value,
    };

    const allowedValues = unionType.split("|").map((v) => v.trim());

    if (!allowedValues.includes(String(value))) {
      result.success = false;
      result.errors.push(`Expected one of: ${allowedValues.join(", ")}, got ${value}`);
    }

    return result;
  }

  /**
   * Validate record types (e.g., "record<string,any>")
   */
  static validateRecordType(
    type: string,
    value: any,
    validateFieldType: (fieldType: string, value: any) => SchemaValidationResult
  ): SchemaValidationResult {
    const result: SchemaValidationResult = {
      success: true,
      errors: [],
      warnings: [],
      data: value,
    };

    const recordMatch = type.match(/^record<([^,]+),(.+)>$/);
    if (recordMatch) {
      const [, keyType, valueType] = recordMatch;

      if (typeof value !== "object" || value === null || Array.isArray(value)) {
        result.success = false;
        result.errors.push("Expected object for Record type");
        return result;
      }

      // Validate each key-value pair
      for (const [key, val] of Object.entries(value)) {
        // For now, we only support string keys
        if (keyType === "string" && typeof key !== "string") {
          result.success = false;
          result.errors.push(`Record key must be string, got ${typeof key}`);
          break;
        }

        // Validate the value type
        const valueResult = validateFieldType(valueType.trim(), val);
        if (!valueResult.success) {
          result.success = false;
          result.errors.push(`Record value for key "${key}": ${valueResult.errors.join(", ")}`);
          break;
        }
      }
    } else {
      result.success = false;
      result.errors.push(`Invalid Record type format: ${type}`);
    }

    return result;
  }

  /**
   * Validate array with constraints
   */
  static validateArrayWithConstraints(
    value: any,
    elementType: string,
    constraints: any,
    validateElementType: (elementType: string, value: any) => SchemaValidationResult
  ): SchemaValidationResult {
    const result: SchemaValidationResult = {
      success: true,
      errors: [],
      warnings: [],
      data: value,
    };

    if (!Array.isArray(value)) {
      result.success = false;
      result.errors.push("Expected array");
      return result;
    }

    // Check array constraints
    if (constraints.minItems !== undefined && value.length < constraints.minItems) {
      result.success = false;
      result.errors.push(`Array must have at least ${constraints.minItems} items`);
      return result;
    }

    if (constraints.maxItems !== undefined && value.length > constraints.maxItems) {
      result.success = false;
      result.errors.push(`Array must have at most ${constraints.maxItems} items`);
      return result;
    }

    const validatedArray: any[] = [];
    for (let i = 0; i < value.length; i++) {
      const elementResult = validateElementType(elementType, value[i]);
      if (!elementResult.success) {
        result.success = false;
        result.errors.push(`Element ${i}: ${elementResult.errors.join(", ")}`);
      } else {
        validatedArray.push(elementResult.data);
      }
    }

    // Check uniqueness if required
    if (constraints.unique && result.success) {
      const uniqueValues = new Set(validatedArray);
      if (uniqueValues.size !== validatedArray.length) {
        result.success = false;
        result.errors.push("Array values must be unique");
      }
    }

    if (result.success) {
      result.data = validatedArray;
    }

    return result;
  }

  /**
   * Handle undefined and null values based on optional flag
   */
  static handleOptionalValue(
    value: any,
    isOptional: boolean,
    defaultValue?: any
  ): SchemaValidationResult | null {
    // Handle undefined values
    if (value === undefined) {
      if (isOptional) {
        return {
          success: true,
          errors: [],
          warnings: [],
          data: defaultValue,
        };
      }
      return {
        success: false,
        errors: ["Required field is missing"],
        warnings: [],
        data: undefined,
      };
    }

    // Handle null values
    if (value === null) {
      if (isOptional) {
        return {
          success: true,
          errors: [],
          warnings: [],
          data: null,
        };
      }
      return {
        success: false,
        errors: ["Field cannot be null"],
        warnings: [],
        data: undefined,
      };
    }

    return null; // Continue with normal validation
  }

  /**
   * Route validation to appropriate type validator
   */
  static routeTypeValidation(
    type: string,
    value: any,
    options: SchemaOptions,
    constraints: any
  ): SchemaValidationResult {
    switch (type) {
      case "string":
        return TypeValidators.validateString(value, options, constraints);
      
      case "number":
      case "float":
        return TypeValidators.validateNumber(value, options, constraints, type as "number" | "float");
      
      case "int":
      case "integer":
      case "positive":
      case "negative":
        return TypeValidators.validateInteger(value, options, constraints, type as "int" | "integer" | "positive" | "negative");
      
      case "double":
        return TypeValidators.validateFloat(value, options, constraints, "double");
      
      case "boolean":
      case "bool":
        return TypeValidators.validateBoolean(value, options, constraints);
      
      case "date":
      case "datetime":
      case "timestamp":
        return TypeValidators.validateDate(value, options, constraints, type as "date" | "datetime" | "timestamp");
      
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
        return TypeValidators.validateSpecialType(value, type as "unknown" | "void" | "null" | "undefined" | "any");
      
      default:
        return {
          success: false,
          errors: [`Unknown type: ${type}`],
          warnings: [],
          data: value,
        };
    }
  }

  /**
   * Merge validation results
   */
  static mergeResults(results: SchemaValidationResult[]): SchemaValidationResult {
    const merged: SchemaValidationResult = {
      success: true,
      errors: [],
      warnings: [],
      data: undefined,
    };

    for (const result of results) {
      if (!result.success) {
        merged.success = false;
      }
      merged.errors.push(...result.errors);
      merged.warnings.push(...result.warnings);
    }

    return merged;
  }

  /**
   * Create error result
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
   * Create success result
   */
  static createSuccessResult(data: any, warnings: string[] = []): SchemaValidationResult {
    return {
      success: true,
      errors: [],
      warnings,
      data,
    };
  }
}
