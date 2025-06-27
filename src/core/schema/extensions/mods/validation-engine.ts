/**
 * Validation Engine - Core validation logic for schema extensions
 *
 * This module provides the core validation engine that powers all schema extensions.
 * It acts as a bridge between extensions and the main validation system, delegating
 * actual validation to the TypeValidators module to avoid duplication.
 */

import { SchemaInterface } from "../../mode/interfaces/Interface";
import { TypeValidators } from "../../mode/interfaces/validators/TypeValidators";
import { ConstraintParser } from "../../mode/interfaces/validators/ConstraintParser";
import { TypeGuards } from "../../mode/interfaces/validators/TypeGuards";
import { ValidationHelpers } from "../../mode/interfaces/validators/ValidationHelpers";
import { SchemaOptions } from "../../../types/SchemaValidator.type";

/**
 * Core validation engine for schema validation
 */
export class ValidationEngine {
  /**
   * Validate a value against a schema field definition
   * Delegates to TypeValidators for actual validation logic
   */
  static validateField(fieldSchema: any, value: any): ValidationFieldResult {
    if (typeof fieldSchema === "string") {
      return this.validateStringSchema(fieldSchema, value);
    }

    if (typeof fieldSchema === "object" && !Array.isArray(fieldSchema)) {
      return this.validateObjectSchema(fieldSchema, value);
    }

    // Default: accept any value
    return { isValid: true, errors: [] };
  }

  /**
   * Validate against string-based schema definitions
   * Uses TypeValidators for consistent validation logic
   */
  private static validateStringSchema(
    fieldSchema: string,
    value: any
  ): ValidationFieldResult {
    // Parse the field schema using ConstraintParser
    const parsed = ConstraintParser.parseConstraints(fieldSchema);
    const { type, constraints, optional } = parsed;

    // Handle null/undefined for optional fields
    if (optional && (value === null || value === undefined)) {
      return { isValid: true, errors: [] };
    }

    // Required field cannot be null/undefined
    if (!optional && (value === null || value === undefined)) {
      return {
        isValid: false,
        errors: [`Field is required but received ${value}`],
      };
    }

    // Use TypeValidators for actual validation
    const options: SchemaOptions = { loose: false }; // Default options
    let validationResult;

    try {
      // Delegate to appropriate TypeValidator method based on type
      switch (type) {
        case "string":
          validationResult = TypeValidators.validateString(
            value,
            options,
            constraints
          );
          break;
        case "number":
        case "float":
        case "double":
          validationResult = TypeValidators.validateNumber(
            value,
            options,
            constraints
          );
          break;
        case "int":
        case "integer":
        case "positive":
        case "negative":
          validationResult = TypeValidators.validateInteger(
            value,
            options,
            constraints,
            type as any
          );
          break;
        case "boolean":
          validationResult = TypeValidators.validateBoolean(value, options, {});
          break;
        case "date":
          validationResult = TypeValidators.validateDate(
            value,
            options,
            {},
            "date"
          );
          break;
        case "email":
          validationResult = TypeValidators.validateEmail(value);
          break;
        case "url":
          validationResult = TypeValidators.validateUrl(value, "url.web");
          break;
        case "uuid":
        case "guid":
          validationResult = TypeValidators.validateUuid(value, type as any);
          break;
        default:
          // Handle arrays and other complex types
          if (type.includes("[]")) {
            // For arrays, use ValidationHelpers.validateArrayWithConstraints
            const elementType = type.replace("[]", "");
            validationResult = ValidationHelpers.validateArrayWithConstraints(
              value,
              elementType,
              constraints,
              (elemType: string, elemValue: any) => {
                // Recursively validate each element and convert result format
                const fieldResult = this.validateStringSchema(
                  elemType,
                  elemValue
                );
                return {
                  success: fieldResult.isValid,
                  errors: fieldResult.errors,
                  warnings: [],
                  data: elemValue,
                };
              }
            );
          } else {
            // Unknown type - accept any value
            validationResult = {
              success: true,
              errors: [],
              warnings: [],
              data: value,
            };
          }
      }

      // Convert TypeValidators result format to ValidationEngine format
      return {
        isValid: validationResult.success,
        errors: validationResult.errors || [],
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [
          `Validation error: ${error instanceof Error ? error.message : "Unknown error"}`,
        ],
      };
    }
  }

  /**
   * Validate against object schema definitions
   */
  private static validateObjectSchema(
    fieldSchema: any,
    value: any
  ): ValidationFieldResult {
    const errors: string[] = [];

    if (typeof value !== "object" || value === null) {
      errors.push("Expected object but received " + typeof value);
      return { isValid: false, errors };
    }

    // Validate all nested fields
    for (const [nestedField, nestedSchema] of Object.entries(fieldSchema)) {
      const nestedResult = this.validateField(nestedSchema, value[nestedField]);
      if (!nestedResult.isValid) {
        errors.push(
          ...nestedResult.errors.map((err) => `${nestedField}: ${err}`)
        );
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  // All individual validation methods removed - now delegated to TypeValidators

  /**
   * Validate entire object against schema
   */
  static validateObject(schema: SchemaInterface, data: any): ValidationResult {
    const errors: Record<string, string[]> = {};
    let isValid = true;

    if (!data || typeof data !== "object") {
      return {
        isValid: false,
        data,
        errors: { _root: ["Expected object but received " + typeof data] },
        timestamp: new Date(),
      };
    }

    // Validate each field in the schema
    for (const [fieldName, fieldSchema] of Object.entries(schema)) {
      const fieldResult = this.validateField(fieldSchema, data[fieldName]);

      if (!fieldResult.isValid) {
        errors[fieldName] = fieldResult.errors;
        isValid = false;
      }
    }

    return {
      isValid,
      data,
      errors,
      timestamp: new Date(),
    };
  }
}

/**
 * Type definitions
 */
export interface ValidationFieldResult {
  isValid: boolean;
  errors: string[];
}

export interface ValidationResult {
  isValid: boolean;
  data: any;
  errors: Record<string, string[]>;
  timestamp: Date;
}
