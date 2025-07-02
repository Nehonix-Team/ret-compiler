/**
 * Field-Specific Precompilers
 *
 * Each field type gets its own specialized precompiler for maximum performance
 */

import {
  SchemaValidationResult,
  ValidationError,
} from "../../../../types/types";
import { ConstraintParser } from "../validators";
import { UnionCache } from "../validators/UnionCache";
import { ValidationHelpers } from "../validators/ValidationHelpers";
import { ErrorHandler,  } from "../errors/ErrorHandler";
import { ErrorCode } from "../errors/types/errors.type";

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
          errors: [ErrorHandler.createTypeError([], "string", value)],
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
          errors: [ErrorHandler.createTypeError([], "string", value)],
          warnings: [],
          data: undefined,
        };
      }

      const errors: ValidationError[] = [];

      if (minLength !== undefined && value.length < minLength) {
        errors.push({
          code: "STRING_TOO_SHORT",
          message: `String must be at least ${minLength} characters`,
          path: [],
          expected: `string(minLength: ${minLength})`,
          received: value,
          receivedType: "string",
        });
      }

      if (maxLength !== undefined && value.length > maxLength) {
        errors.push({
          code: "STRING_TOO_LONG",
          message: `String must be at most ${maxLength} characters`,
          path: [],
          expected: `string(maxLength: ${maxLength})`,
          received: value,
          receivedType: "string",
        });
      }

      if (pattern && !pattern.test(value)) {
        errors.push({
          code: "STRING_PATTERN_MISMATCH",
          message: `String does not match required pattern`,
          path: [],
          expected: `string(pattern: ${pattern})`,
          received: value,
          receivedType: "string",
        });
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
      // console.log("🔍 precompileFloat validator executing:");
      // console.log("  - value:", value, "type:", typeof value);
      // console.log("  - constraints: min =", min, ", max =", max);

      if (typeof value !== "number" || isNaN(value) || !isFinite(value)) {
        // console.log("  - FAIL: not a valid number");
        return {
          success: false,
          errors: [ErrorHandler.createTypeError([], "float", value)],
          warnings: [],
          data: undefined,
        };
      }

      const errors: ValidationError[] = [];

      if (min !== undefined && value < min) {
        // console.log("  - FAIL: value", value, "< min", min);
        errors.push({
          code: ErrorCode.NUMBER_TOO_SMALL,
          message: `Float must be at least ${min}`,
          path: [],
          expected: `float(min: ${min})`,
          received: value,
          receivedType: "number",
        });
      }

      if (max !== undefined && value > max) {
        // console.log("  - FAIL: value", value, "> max", max);
        errors.push({
          code: ErrorCode.NUMBER_TOO_LARGE,
          message: `Float must be at most ${max}`,
          path: [],
          expected: `float(max: ${max})`,
          received: value,
          receivedType: "number",
        });
      }

      if (errors.length > 0) {
        // console.log("  - FINAL RESULT: FAIL with errors:", errors);
        return {
          success: false,
          errors,
          warnings: [],
          data: undefined,
        };
      }

      // console.log("  - FINAL RESULT: PASS");
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
   *  Precompile positive number field validators
   */
  static precompilePositiveNumber(
    constraints: { min?: number; max?: number } = {}
  ): CompiledFieldValidator {
    const { min, max } = constraints;

    const validator = (value: any): SchemaValidationResult => {
      if (typeof value !== "number" || isNaN(value) || !isFinite(value)) {
        return {
          success: false,
          errors: [ErrorHandler.createTypeError([], "positive number", value)],
          warnings: [],
          data: undefined,
        };
      }

      const errors: ValidationError[] = [];

      // CRITICAL: Positive validation - must be > 0
      if (value <= 0) {
        errors.push({
          code: "NUMBER_NOT_POSITIVE",
          message: "Number must be positive",
          path: [],
          expected: "positive",
          received: value,
          receivedType: "number",
        });
      }

      if (min !== undefined && value < min) {
        errors.push({
          code: ErrorCode.NUMBER_TOO_SMALL,
          message: `Number must be at least ${min}`,
          path: [],
          expected: `positive(min: ${min})`,
          received: value,
          receivedType: "number",
        });
      }

      if (max !== undefined && value > max) {
        errors.push({
          code: ErrorCode.NUMBER_TOO_LARGE,
          message: `Number must be at most ${max}`,
          path: [],
          expected: `positive(max: ${max})`,
          received: value,
          receivedType: "number",
        });
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

    (validator as any)._fieldType = `positive(${min || ""},${max || ""})`;
    (validator as any)._isCompiled = true;
    return validator as CompiledFieldValidator;
  }

  /**
   *  Precompile negative number field validators
   */
  static precompileNegativeNumber(
    constraints: { min?: number; max?: number } = {}
  ): CompiledFieldValidator {
    const { min, max } = constraints;

    const validator = (value: any): SchemaValidationResult => {
      if (typeof value !== "number" || isNaN(value) || !isFinite(value)) {
        return {
          success: false,
          errors: [ErrorHandler.createTypeError([], "negative number", value)],
          warnings: [],
          data: undefined,
        };
      }

      const errors: ValidationError[] = [];

      // CRITICAL: Negative validation - must be < 0
      if (value >= 0) {
        errors.push({
          code: ErrorCode.NOT_NEGATIVE,
          message: "Number must be negative",
          path: [],
          expected: "negative",
          received: value,
          receivedType: "number",
        });
      }

      if (min !== undefined && value < min) {
        errors.push({
          code: ErrorCode.NUMBER_TOO_SMALL,
          message: `Number must be at least ${min}`,
          path: [],
          expected: `negative(min: ${min})`,
          received: value,
          receivedType: "number",
        });
      }

      if (max !== undefined && value > max) {
        errors.push({
          code: ErrorCode.NUMBER_TOO_LARGE,
          message: `Number must be at most ${max}`,
          path: [],
          expected: `negative(max: ${max})`,
          received: value,
          receivedType: "number",
        });
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

    (validator as any)._fieldType = `negative(${min || ""},${max || ""})`;
    (validator as any)._isCompiled = true;
    return validator as CompiledFieldValidator;
  }

  /**
   *  Precompile number field validators
   */
  static precompileNumber(
    constraints: {
      min?: number;
      max?: number;
      integer?: boolean;
      strictlyPositive?: boolean;
      strictlyNegative?: boolean;
    } = {}
  ): CompiledFieldValidator {
    const { min, max, integer, strictlyPositive, strictlyNegative } =
      constraints;

    const validator = (value: any): SchemaValidationResult => {
      // DEBUG: Add logging to see if validator is being called
      // // console.log("🔍 precompileNumber validator executing:");
      // // console.log("  - value:", value, "type:", typeof value);
      // // console.log(
      //   "  - constraints: strictlyPositive =",
      //   strictlyPositive,
      //   ", strictlyNegative =",
      //   strictlyNegative
      // );

      if (typeof value !== "number" || isNaN(value)) {
        // // console.log("  - FAIL: not a number");
        return {
          success: false,
          errors: [ErrorHandler.createTypeError([], "number", value)],
          warnings: [],
          data: undefined,
        };
      }

      const errors: ValidationError[] = [];

      if (integer && !Number.isInteger(value)) {
        // // console.log("  - FAIL: not an integer");
        errors.push({
          code: ErrorCode.NOT_INTEGER,
          message: "Number must be an integer",
          path: [],
          expected: "integer",
          received: value,
          receivedType: "number",
        });
      }

      // CRITICAL FIX: Handle strict positive/negative validation
      if (strictlyPositive && value <= 0) {
        // console.log("  - FAIL: not strictly positive (value <= 0)");
        errors.push({
          code: ErrorCode.NOT_POSITIVE,
          message: "Number must be positive",
          path: [],
          expected: "positive",
          received: value,
          receivedType: "number",
        });
      }

      if (strictlyNegative && value >= 0) {
        // console.log("  - FAIL: not strictly negative (value >= 0)");
        errors.push({
          code: ErrorCode.NOT_NEGATIVE,
          message: "Number must be negative",
          path: [],
          expected: "negative",
          received: value,
          receivedType: "number",
        });
      }

      if (min !== undefined && value < min) {
        // console.log("  - FAIL: value < min");
        errors.push({
          code: ErrorCode.NUMBER_TOO_SMALL,
          message: `Number must be at least ${min}`,
          path: [],
          expected: `number(min: ${min})`,
          received: value,
          receivedType: "number",
        });
      }

      if (max !== undefined && value > max) {
        // console.log("  - FAIL: value > max");
        errors.push({
          code: ErrorCode.NUMBER_TOO_LARGE,
          message: `Number must be at most ${max}`,
          path: [],
          expected: `number(max: ${max})`,
          received: value,
          receivedType: "number",
        });
      }

      if (errors.length > 0) {
        // console.log("  - FINAL RESULT: FAIL with errors:", errors);
        return {
          success: false,
          errors,
          warnings: [],
          data: undefined,
        };
      }

      // console.log("  - FINAL RESULT: PASS");
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
        errors: [ErrorHandler.createTypeError([], "boolean", value)],
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
          errors: [ErrorHandler.createTypeError([], "array", value)],
          warnings: [],
          data: undefined,
        };
      }

      const errors: ValidationError[] = [];

      if (minLength !== undefined && value.length < minLength) {
        errors.push({
          code: ErrorCode.ARRAY_TOO_SHORT,
          message: `Array must have at least ${minLength} elements`,
          path: [],
          expected: `array(minLength: ${minLength})`,
          received: value,
          receivedType: "array",
        });
      }

      if (maxLength !== undefined && value.length > maxLength) {
        errors.push({
          code: ErrorCode.ARRAY_TOO_LONG,
          message: `Array must have at most ${maxLength} elements`,
          path: [],
          expected: `array(maxLength: ${maxLength})`,
          received: value,
          receivedType: "array",
        });
      }

      // Validate each element
      const validatedArray: any[] = [];
      for (let i = 0; i < value.length; i++) {
        const elementResult = elementValidator(value[i]);
        if (!elementResult.success) {
          errors.push(
            ...elementResult.errors.map((error) => ({
              ...error,
              path: [i.toString(), ...error.path],
            }))
          );
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
          errors.push({
            code: ErrorCode.ARRAY_VALUES_NOT_UNIQUE,
            message: "Array elements must be unique",
            path: [],
            expected: "unique",
            received: value,
            receivedType: "array",
          });
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
        errors: [
          ErrorHandler.createConstantError(
            [],
            "constant",
            value,
            constantValue
          ),
        ],
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
        case "float":
          const numberConstraints = this.parseNumberConstraints(
            constraintsStr,
            type
          );
          const numberValidator = this.precompileNumber(numberConstraints);
          return isOptional
            ? this.precompileOptional(numberValidator)
            : numberValidator;

        case "positive":
          // CRITICAL FIX: Handle positive numbers with proper validation
          const positiveConstraints = this.parseNumberConstraints(
            constraintsStr,
            type
          );
          const positiveValidator =
            this.precompilePositiveNumber(positiveConstraints);
          return isOptional
            ? this.precompileOptional(positiveValidator)
            : positiveValidator;

        case "negative":
          // CRITICAL FIX: Handle negative numbers with proper validation
          const negativeConstraints = this.parseNumberConstraints(
            constraintsStr,
            type
          );
          const negativeValidator =
            this.precompileNegativeNumber(negativeConstraints);
          return isOptional
            ? this.precompileOptional(negativeValidator)
            : negativeValidator;

        case "double":
          // CRITICAL FIX: Handle double with float constraints to match ValidationHelpers routing
          const doubleConstraints = this.parseNumberConstraints(
            constraintsStr,
            type
          );
          const doubleValidator = this.precompileFloat(doubleConstraints);
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

    // CRITICAL FIX: Use ConstraintParser to properly handle regex patterns
    const ConstraintParser =
      require("../validators/ConstraintParser").ConstraintParser;

    try {
      // Parse the full constraint string using the proper parser
      const fullType = `string(${constraintsStr})`;
      const parsed = ConstraintParser.parseConstraints(fullType);

      // Extract the constraints we need
      const constraints: any = {};

      if (parsed.constraints.minLength !== undefined) {
        constraints.minLength = parsed.constraints.minLength;
      }
      if (parsed.constraints.maxLength !== undefined) {
        constraints.maxLength = parsed.constraints.maxLength;
      }
      if (parsed.constraints.pattern) {
        constraints.pattern = parsed.constraints.pattern;
      }

      return constraints;
    } catch (error) {
      // Fallback to simple parsing for backward compatibility
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
  }

  private static parseNumberConstraints(
    constraintsStr?: string,
    type?: string
  ): { min?: number; max?: number; integer?: boolean } {
    const constraints: any = {};

    if (type === "int" || type === "integer") {
      constraints.integer = true;
    }
    // NOTE: positive and negative types are now handled by separate precompilers
    // No need to set special constraints here

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
