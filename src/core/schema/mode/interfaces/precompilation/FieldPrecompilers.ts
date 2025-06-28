/**
 * Field-Specific Precompilers
 *
 * Each field type gets its own specialized precompiler for maximum performance
 */

import { SchemaValidationResult } from "../../../../types/types";
import { UnionCache } from "../validators/UnionCache";
import { ValidationHelpers } from "../validators/ValidationHelpers";

export interface CompiledFieldValidator {
  (value: any): SchemaValidationResult;
  _fieldType: string;
  _isCompiled: true;
}

export class FieldPrecompilers {
  /**
   *  Precompile union field validators
   *
   */
  static precompileUnion(unionType: string): CompiledFieldValidator {
    // Use the fixed union validation from ValidationHelpers
    const validator = (value: any): SchemaValidationResult => {
      return ValidationHelpers.validateUnionType(unionType, value);
    };

    (validator as any)._fieldType = unionType;
    (validator as any)._isCompiled = true;

    return validator as CompiledFieldValidator;
  }

  /**
   *  Precompile string field validators
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
      //  Simple string validation
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
   *  Precompile float field validators (for float and double types)
   */
  static precompileFloat(
    constraints: { min?: number; max?: number } = {}
  ): CompiledFieldValidator {
    const { min, max } = constraints;

    const validator = (value: any): SchemaValidationResult => {
      // DEBUG: Add logging to see what's happening
      console.log("🔍 precompileFloat validator executing:");
      console.log("  - value:", value, "type:", typeof value);
      console.log("  - constraints: min =", min, ", max =", max);

      if (typeof value !== "number" || isNaN(value) || !isFinite(value)) {
        console.log("  - FAIL: not a valid number");
        return {
          success: false,
          errors: [`Expected float, got ${typeof value}`],
          warnings: [],
          data: undefined,
        };
      }

      const errors: string[] = [];

      if (min !== undefined && value < min) {
        console.log("  - FAIL: value", value, "< min", min);
        errors.push(`Float must be at least ${min}`);
      }

      if (max !== undefined && value > max) {
        console.log("  - FAIL: value", value, "> max", max);
        errors.push(`Float must be at most ${max}`);
      }

      if (errors.length > 0) {
        console.log("  - FINAL RESULT: FAIL with errors:", errors);
        return {
          success: false,
          errors,
          warnings: [],
          data: undefined,
        };
      }

      console.log("  - FINAL RESULT: PASS");
      return {
        success: true,
        errors: [],
        warnings: [],
        data: value,
      };
    };

    (validator as any)._fieldType = `float(${min || ""},${max || ""})`;
    (validator as any)._isCompiled = true;
    return validator as CompiledFieldValidator;
  }

  /**
   *  Precompile number field validators
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
   *  Precompile boolean field validators
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
   *  Precompile array field validators
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
   *  Precompile optional field validators
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
   *  Precompile constant field validators
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
   *  Precompile special field types (email, url, json, etc.)
   */
  static precompileSpecialType(type: string): CompiledFieldValidator {
    const validator = (value: any): SchemaValidationResult => {
      // CRITICAL FIX: Parse constraints from the type string for proper validation
      const ConstraintParser =
        require("../validators/ConstraintParser").ConstraintParser;
      const parsed = ConstraintParser.parseConstraints(type);

      // Use the imported ValidationHelpers with proper constraints
      return ValidationHelpers.routeTypeValidation(
        parsed.type,
        value,
        { ...parsed.constraints },
        parsed.constraints
      );
    };

    (validator as any)._fieldType = type;
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

    // Handle basic types with constraints (including URL args like url.https)
    const constraintMatch = baseType.match(/^([\w.]+)(?:\(([^)]*)\))?$/);
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
        case "float":
          const numberConstraints = this.parseNumberConstraints(
            constraintsStr,
            type
          );
          const numberValidator = this.precompileNumber(numberConstraints);
          return isOptional
            ? this.precompileOptional(numberValidator)
            : numberValidator;

        case "double":
          // Handle double with special type to force unoptimized path
          const doubleValidator = this.precompileSpecialType(
            constraintsStr ? `double(${constraintsStr})` : "double"
          );
          return isOptional
            ? this.precompileOptional(doubleValidator)
            : doubleValidator;

        case "boolean":
        case "bool":
          const boolValidator = this.precompileBoolean();
          return isOptional
            ? this.precompileOptional(boolValidator)
            : boolValidator;

        // Handle new field types by delegating to ValidationHelpers
        case "json":
        case "ip":
        case "password":
        case "text":
        case "object":
        case "url":
        case "email":
        case "uuid":
        case "phone":
        case "slug":
        case "username":
        case "hexcolor":
        case "base64":
        case "jwt":
        case "semver":
        case "date":
        case "any":
          const specialValidator = this.precompileSpecialType(type);
          return isOptional
            ? this.precompileOptional(specialValidator)
            : specialValidator;

        default:
          // Check if it's a URL arg (url.https, url.http, etc.)
          if (type.startsWith("url.")) {
            const urlArgValidator = this.precompileSpecialType(type);
            return isOptional
              ? this.precompileOptional(urlArgValidator)
              : urlArgValidator;
          }

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
