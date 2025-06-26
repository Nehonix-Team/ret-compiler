/**
 * ULTRA-OPTIMIZED Field-Specific Precompilers
 *
 * Each field type gets its own specialized precompiler for maximum performance
 */

import { SchemaValidationResult } from "../../../../types/types";
import { UnionCache } from "../validators/UnionCache";

export interface CompiledFieldValidator {
  (value: any): SchemaValidationResult;
  _fieldType: string;
  _isCompiled: true;
}

export class FieldPrecompilers {
  /**
   * ULTRA-FAST: Precompile union field validators
   * Target: Beat Zod's z.enum() performance
   */
  static precompileUnion(unionType: string): CompiledFieldValidator {
    // Get cached union values at compile time
    const cachedUnion = UnionCache.getCachedUnion(unionType);
    const allowedValues = cachedUnion.allowedValues;
    const valuesArray = cachedUnion.valuesArray;
    const errorTemplate = cachedUnion.errorTemplate;

    // Pre-allocate result objects for zero allocation
    const successResult = Object.freeze({
      success: true as const,
      errors: [] as string[],
      warnings: [] as string[],
      data: null as any,
    });

    // Generate ultra-optimized validator
    const validator = (value: any): SchemaValidationResult => {
      // ULTRA-FAST: Direct Set lookup with minimal overhead
      if (allowedValues.has(String(value))) {
        return {
          ...successResult,
          data: value,
        };
      }

      // Only create error object on failure (hot path optimization)
      return {
        success: false,
        errors: [`${errorTemplate}, got ${value}`],
        warnings: [],
        data: undefined,
      };
    };

    (validator as any)._fieldType = unionType;
    (validator as any)._isCompiled = true;

    return validator as CompiledFieldValidator;
  }

  /**
   * ULTRA-FAST: Precompile string field validators
   */
  static precompileString(
    constraints: {
      minLength?: number;
      maxLength?: number;
      pattern?: RegExp;
    } = {}
  ): CompiledFieldValidator {
    const { minLength, maxLength, pattern } = constraints;

    // Pre-compile validation logic based on constraints
    if (!minLength && !maxLength && !pattern) {
      // ULTRA-FAST: Simple string validation
      const validator = (value: any): SchemaValidationResult => {
        if (typeof value === "string") {
          return {
            success: true,
            errors: [],
            warnings: [],
            data: value,
          };
        }
        return {
          success: false,
          errors: [`Expected string, got ${typeof value}`],
          warnings: [],
          data: undefined,
        };
      };

      (validator as any)._fieldType = "string";
      (validator as any)._isCompiled = true;
      return validator as CompiledFieldValidator;
    }

    // OPTIMIZED: String with constraints
    const validator = (value: any): SchemaValidationResult => {
      if (typeof value !== "string") {
        return {
          success: false,
          errors: [`Expected string, got ${typeof value}`],
          warnings: [],
          data: undefined,
        };
      }

      const errors: string[] = [];

      if (minLength !== undefined && value.length < minLength) {
        errors.push(`String must be at least ${minLength} characters`);
      }

      if (maxLength !== undefined && value.length > maxLength) {
        errors.push(`String must be at most ${maxLength} characters`);
      }

      if (pattern && !pattern.test(value)) {
        errors.push(`String does not match required pattern`);
      }

      if (errors.length > 0) {
        return {
          success: false,
          errors,
          warnings: [],
          data: undefined,
        };
      }

      return {
        success: true,
        errors: [],
        warnings: [],
        data: value,
      };
    };

    (validator as any)._fieldType =
      `string(${minLength || ""},${maxLength || ""})`;
    (validator as any)._isCompiled = true;
    return validator as CompiledFieldValidator;
  }

  /**
   * ULTRA-FAST: Precompile number field validators
   */
  static precompileNumber(
    constraints: { min?: number; max?: number; integer?: boolean } = {}
  ): CompiledFieldValidator {
    const { min, max, integer } = constraints;

    const validator = (value: any): SchemaValidationResult => {
      if (typeof value !== "number" || isNaN(value)) {
        return {
          success: false,
          errors: [`Expected number, got ${typeof value}`],
          warnings: [],
          data: undefined,
        };
      }

      const errors: string[] = [];

      if (integer && !Number.isInteger(value)) {
        errors.push("Expected integer");
      }

      if (min !== undefined && value < min) {
        errors.push(`Number must be at least ${min}`);
      }

      if (max !== undefined && value > max) {
        errors.push(`Number must be at most ${max}`);
      }

      if (errors.length > 0) {
        return {
          success: false,
          errors,
          warnings: [],
          data: undefined,
        };
      }

      return {
        success: true,
        errors: [],
        warnings: [],
        data: value,
      };
    };

    (validator as any)._fieldType = `number(${min || ""},${max || ""})`;
    (validator as any)._isCompiled = true;
    return validator as CompiledFieldValidator;
  }

  /**
   * ULTRA-FAST: Precompile boolean field validators
   */
  static precompileBoolean(): CompiledFieldValidator {
    const validator = (value: any): SchemaValidationResult => {
      if (typeof value === "boolean") {
        return {
          success: true,
          errors: [],
          warnings: [],
          data: value,
        };
      }
      return {
        success: false,
        errors: [`Expected boolean, got ${typeof value}`],
        warnings: [],
        data: undefined,
      };
    };

    (validator as any)._fieldType = "boolean";
    (validator as any)._isCompiled = true;
    return validator as CompiledFieldValidator;
  }

  /**
   * ULTRA-FAST: Precompile array field validators
   */
  static precompileArray(
    elementValidator: CompiledFieldValidator,
    constraints: {
      minLength?: number;
      maxLength?: number;
      unique?: boolean;
    } = {}
  ): CompiledFieldValidator {
    const { minLength, maxLength, unique } = constraints;

    const validator = (value: any): SchemaValidationResult => {
      if (!Array.isArray(value)) {
        return {
          success: false,
          errors: [`Expected array, got ${typeof value}`],
          warnings: [],
          data: undefined,
        };
      }

      const errors: string[] = [];

      if (minLength !== undefined && value.length < minLength) {
        errors.push(`Array must have at least ${minLength} elements`);
      }

      if (maxLength !== undefined && value.length > maxLength) {
        errors.push(`Array must have at most ${maxLength} elements`);
      }

      // Validate each element
      const validatedArray: any[] = [];
      for (let i = 0; i < value.length; i++) {
        const elementResult = elementValidator(value[i]);
        if (!elementResult.success) {
          errors.push(`Element ${i}: ${elementResult.errors.join(", ")}`);
        } else {
          validatedArray.push(elementResult.data);
        }
      }

      // Check uniqueness if required
      if (unique && validatedArray.length > 0) {
        const uniqueValues = new Set(
          validatedArray.map((v) => JSON.stringify(v))
        );
        if (uniqueValues.size !== validatedArray.length) {
          errors.push("Array elements must be unique");
        }
      }

      if (errors.length > 0) {
        return {
          success: false,
          errors,
          warnings: [],
          data: undefined,
        };
      }

      return {
        success: true,
        errors: [],
        warnings: [],
        data: validatedArray,
      };
    };

    (validator as any)._fieldType = `${elementValidator._fieldType}[]`;
    (validator as any)._isCompiled = true;
    return validator as CompiledFieldValidator;
  }

  /**
   * ULTRA-FAST: Precompile optional field validators
   */
  static precompileOptional(
    baseValidator: CompiledFieldValidator,
    defaultValue?: any
  ): CompiledFieldValidator {
    const validator = (value: any): SchemaValidationResult => {
      if (value === undefined) {
        return {
          success: true,
          errors: [],
          warnings: [],
          data: defaultValue,
        };
      }

      return baseValidator(value);
    };

    (validator as any)._fieldType = `${baseValidator._fieldType}?`;
    (validator as any)._isCompiled = true;
    return validator as CompiledFieldValidator;
  }

  /**
   * ULTRA-FAST: Precompile constant field validators
   */
  static precompileConstant(constantValue: any): CompiledFieldValidator {
    const stringValue = String(constantValue);

    const validator = (value: any): SchemaValidationResult => {
      if (value === constantValue || String(value) === stringValue) {
        return {
          success: true,
          errors: [],
          warnings: [],
          data: constantValue,
        };
      }

      return {
        success: false,
        errors: [`Expected constant value ${constantValue}, got ${value}`],
        warnings: [],
        data: undefined,
      };
    };

    (validator as any)._fieldType = `=${constantValue}`;
    (validator as any)._isCompiled = true;
    return validator as CompiledFieldValidator;
  }

  /**
   * Parse field type and create appropriate precompiled validator
   */
  static parseAndCompile(fieldType: string): CompiledFieldValidator {
    // Handle optional fields
    const isOptional = fieldType.endsWith("?");
    const baseType = isOptional ? fieldType.slice(0, -1) : fieldType;

    // Handle constants
    if (baseType.startsWith("=")) {
      const constantValue = baseType.slice(1);
      const validator = this.precompileConstant(constantValue);
      return isOptional ? this.precompileOptional(validator) : validator;
    }

    // Handle unions
    if (baseType.includes("|")) {
      const validator = this.precompileUnion(baseType);
      return isOptional ? this.precompileOptional(validator) : validator;
    }

    // Handle arrays
    if (baseType.endsWith("[]")) {
      const elementType = baseType.slice(0, -2);
      const elementValidator = this.parseAndCompile(elementType);
      const validator = this.precompileArray(elementValidator);
      return isOptional ? this.precompileOptional(validator) : validator;
    }

    // Handle basic types with constraints
    const constraintMatch = baseType.match(/^(\w+)(?:\(([^)]*)\))?$/);
    if (constraintMatch) {
      const [, type, constraintsStr] = constraintMatch;

      switch (type) {
        case "string":
          const stringConstraints = this.parseStringConstraints(constraintsStr);
          const stringValidator = this.precompileString(stringConstraints);
          return isOptional
            ? this.precompileOptional(stringValidator)
            : stringValidator;

        case "number":
        case "int":
        case "integer":
        case "positive":
        case "negative":
          const numberConstraints = this.parseNumberConstraints(
            constraintsStr,
            type
          );
          const numberValidator = this.precompileNumber(numberConstraints);
          return isOptional
            ? this.precompileOptional(numberValidator)
            : numberValidator;

        case "boolean":
        case "bool":
          const boolValidator = this.precompileBoolean();
          return isOptional
            ? this.precompileOptional(boolValidator)
            : boolValidator;

        default:
          // Fallback for unknown types
          return this.createFallbackValidator(fieldType);
      }
    }

    return this.createFallbackValidator(fieldType);
  }

  private static parseStringConstraints(constraintsStr?: string): {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
  } {
    if (!constraintsStr) return {};

    const parts = constraintsStr.split(",");
    const constraints: any = {};

    if (parts[0] && parts[0].trim()) {
      constraints.minLength = parseInt(parts[0].trim());
    }
    if (parts[1] && parts[1].trim()) {
      constraints.maxLength = parseInt(parts[1].trim());
    }

    return constraints;
  }

  private static parseNumberConstraints(
    constraintsStr?: string,
    type?: string
  ): { min?: number; max?: number; integer?: boolean } {
    const constraints: any = {};

    if (type === "int" || type === "integer") {
      constraints.integer = true;
    }
    if (type === "positive") {
      constraints.min = 0;
      constraints.integer = true;
    }
    if (type === "negative") {
      constraints.max = 0;
      constraints.integer = true;
    }

    if (constraintsStr) {
      const parts = constraintsStr.split(",");
      if (parts[0] && parts[0].trim()) {
        constraints.min = parseFloat(parts[0].trim());
      }
      if (parts[1] && parts[1].trim()) {
        constraints.max = parseFloat(parts[1].trim());
      }
    }

    return constraints;
  }

  private static createFallbackValidator(
    fieldType: string
  ): CompiledFieldValidator {
    const validator = (value: any): SchemaValidationResult => {
      // Basic fallback validation
      return {
        success: true,
        errors: [],
        warnings: [`Fallback validation used for type: ${fieldType}`],
        data: value,
      };
    };

    (validator as any)._fieldType = fieldType;
    (validator as any)._isCompiled = true;
    return validator as CompiledFieldValidator;
  }
}
