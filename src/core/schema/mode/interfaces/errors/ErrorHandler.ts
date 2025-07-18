/**
 * Centralized Error Handler Module
 *
 * Provides a unified system for creating, formatting, and managing validation errors.
 * This makes error handling consistent across the codebase and easier to modify in the future.
 */

import { ValidationError } from "../../../../types/types";
import { ErrorCode, ErrorConfig } from "./types/errors.type";

/**
 * Centralized error handler class with enhanced functionality
 */
export class ErrorHandler {
  private static readonly DEFAULT_CONFIG: ErrorConfig = {
    includeReceivedValue: true,
    maxPathDepth: 10,
    maxMessageLength: 500,
  };

  private static readonly TYPE_MAPPING = new Map([
    ["object", "Object"],
    ["array", "Array"],
    ["string", "String"],
    ["number", "Number"],
    ["boolean", "Boolean"],
    ["function", "Function"],
    ["symbol", "Symbol"],
    ["bigint", "BigInt"],
    ["null", "null"],
    ["undefined", "undefined"],
  ]);

  /**
   * Normalize and validate path input
   */
  private static normalizePath(path: string | string[]): string[] {
    if (typeof path === "string") {
      return path
        .split(".")
        .filter((segment) => segment.length > 0)
        .slice(0, this.DEFAULT_CONFIG.maxPathDepth);
    }

    if (Array.isArray(path)) {
      return path
        .filter((segment) => typeof segment === "string" && segment.length > 0)
        .slice(0, this.DEFAULT_CONFIG.maxPathDepth);
    }

    return [];
  }

  /**
   * Sanitize and truncate message content
   */
  private static sanitizeMessage(message: string): string {
    if (typeof message !== "string") {
      message = String(message);
    }

    // Remove potentially harmful characters and excessive whitespace
    const sanitized = message
      .replace(/[\x00-\x1F\x7F]/g, "") // Remove control characters
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();

    // Truncate if too long
    return sanitized.length > this.DEFAULT_CONFIG.maxMessageLength
      ? sanitized.substring(0, this.DEFAULT_CONFIG.maxMessageLength - 3) + "..."
      : sanitized;
  }

  /**
   * Enhanced value type detection with better precision
   */
  private static detectValueType(value: unknown): string {
    // Handle primitive null/undefined first
    if (value === null) return "null";
    if (value === undefined) return "undefined";

    // Handle built-in objects with instanceof checks
    const builtInChecks = [
      [Array, "array"],
      [Date, "date"],
      [RegExp, "regexp"],
      [Error, "error"],
      [Map, "map"],
      [Set, "set"],
      [WeakMap, "weakmap"],
      [WeakSet, "weakset"],
      [Promise, "promise"],
    ] as const;

    for (const [constructor, typeName] of builtInChecks) {
      if (value instanceof constructor) {
        return typeName;
      }
    }

    // Handle primitives and functions
    const primitiveType = typeof value;
    return this.TYPE_MAPPING.get(primitiveType) || primitiveType;
  }

  /**
   * Create a validation error object with standardized format
   */
  static createError(
    path: string | string[],
    message: string,
    code: ErrorCode | string,
    expected: string,
    received: any,
    context?: {
      suggestion?: string;
      allowedValues?: any[];
      constraints?: Record<string, any>;
    }
  ): ValidationError {
    const normalizedPath = this.normalizePath(path);
    const sanitizedMessage = this.sanitizeMessage(message);
    const detectedType = this.detectValueType(received);

    return {
      path: normalizedPath,
      message: sanitizedMessage,
      code: code,
      expected: typeof expected === "string" ? expected.trim() : "unknown",
      received,
      receivedType: detectedType,
      context: context ? { ...context } : undefined, // Shallow clone for safety
    };
  }

  /**
   * Create a type error (when value is of wrong type)
   */
  static createTypeError(
    path: string | string[],
    expected: string,
    received: unknown
  ): ValidationError {
    const receivedType = this.detectValueType(received);
    const sanitizedValue = this.sanitizeReceivedValue(received);

    // Create a user-friendly message that includes the actual value
    const message =
      expected === "phone"
        ? `Invalid phone number format: received "${sanitizedValue}" instead of valid phone number`
        : `Expected ${this.capitalizeFirstLetter(expected)}, but received ${this.capitalizeFirstLetter(receivedType)}: "${sanitizedValue}"`;

    return this.createError(
      path,
      message,
      ErrorCode.TYPE_ERROR,
      expected,
      received
    );
  }

  /**
   * Create a string validation error
   */
  static createStringError(
    path: string | string[],
    constraint: string,
    received: any,
    code: ErrorCode = ErrorCode.INVALID_STRING_FORMAT
  ): ValidationError {
    const sanitizedConstraint =
      typeof constraint === "string" ? constraint.trim() : "validation failed";

    return this.createError(
      path,
      `String ${sanitizedConstraint}`,
      code,
      `string ${sanitizedConstraint}`,
      received
    );
  }

  /**
   * Create a number validation error
   */
  static createNumberError(
    path: string | string[],
    constraint: string,
    received: any,
    code: ErrorCode = ErrorCode.INVALID_TYPE
  ): ValidationError {
    const sanitizedConstraint =
      typeof constraint === "string" ? constraint.trim() : "validation failed";

    return this.createError(
      path,
      `Number ${sanitizedConstraint}`,
      code,
      `number ${sanitizedConstraint}`,
      received
    );
  }

  /**
   * Create an array validation error
   */
  static createArrayError(
    path: string | string[],
    constraint: string,
    received: any,
    code: ErrorCode = ErrorCode.INVALID_TYPE
  ): ValidationError {
    const sanitizedConstraint =
      typeof constraint === "string" ? constraint.trim() : "validation failed";

    return this.createError(
      path,
      `Array ${sanitizedConstraint}`,
      code,
      `array ${sanitizedConstraint}`,
      received
    );
  }

  /**
   * Create a URL validation error
   */
  static createUrlError(
    path: string | string[],
    received: any,
    urlType?: string
  ): ValidationError {
    const sanitizedUrlType = urlType?.trim();
    const expected = sanitizedUrlType ? `url.${sanitizedUrlType}` : "url";
    const message = sanitizedUrlType
      ? `Invalid URL format for ${sanitizedUrlType}`
      : "Invalid URL format";

    return this.createError(
      path,
      message,
      ErrorCode.INVALID_URL,
      expected,
      received
    );
  }

  /**
   * Create an email validation error
   */
  static createEmailError(
    path: string | string[],
    received: any,
    details?: string
  ): ValidationError {
    const sanitizedDetails = details?.trim();
    const message = sanitizedDetails
      ? `Invalid email format: ${sanitizedDetails}`
      : "Invalid email format";

    return this.createError(
      path,
      message,
      ErrorCode.INVALID_EMAIL,
      "email",
      received
    );
  }

  /**
   * Create a union validation error
   */
  static createUnionError(
    path: string | string[],
    allowedValues: any[],
    received: any
  ): ValidationError {
    const safeAllowedValues = Array.isArray(allowedValues) ? allowedValues : [];
    const expected = safeAllowedValues
      .map((val) => (typeof val === "string" ? val : String(val)))
      .join(" | ");

    return this.createError(
      path,
      `Expected one of: ${expected}`,
      ErrorCode.INVALID_UNION,
      expected,
      received,
      { allowedValues: safeAllowedValues }
    );
  }

  /**
   * Get detailed type information for values (legacy method name for compatibility)
   */
  static getValueType(value: unknown): string {
    return this.detectValueType(value);
  }

  /**
   * Convert string errors to ValidationError objects
   * (for backward compatibility)
   */
  static convertStringToError(
    error: string | any,
    code: ErrorCode
  ): ValidationError {
    // If it's already a ValidationError object, return as is
    if (this.isValidationError(error)) {
      return error;
    }
    // console.log("converting string to error. Code: ", code);
    // Handle ValidationError-like objects
    if (
      error &&
      typeof error === "object" &&
      typeof error.message === "string"
    ) {
      return this.createError(
        error.path || [],
        error.message,
        code || ErrorCode.VALIDATION_ERROR,
        error.expected || "unknown",
        error.received
      );
    }

    // Convert to string safely
    const errorString = this.extractErrorMessage(error);

    // Extract path if it exists (format: "path: message")
    const pathMatch = errorString.match(/^([^:]+):\s*(.+)$/);

    if (pathMatch) {
      const [, path, message] = pathMatch;
      return this.createError(
        path.trim(),
        message.trim(),
        code,
        "unknown",
        undefined
      );
    }

    // No path found, use generic error
    return this.createError([], errorString, code, "unknown", undefined);
  }

  /**
   * Check if an object is a valid ValidationError
   */
  private static isValidationError(obj: any): obj is ValidationError {
    return (
      obj &&
      typeof obj === "object" &&
      Array.isArray(obj.path) &&
      typeof obj.message === "string" &&
      typeof obj.code === "string"
    );
  }

  /**
   * Safely extract error message from various error types
   */
  private static extractErrorMessage(error: any): string {
    if (typeof error === "string") {
      return error;
    }

    if (error && typeof error === "object") {
      if (error.message) {
        return String(error.message);
      }

      if (error.toString && error.toString !== Object.prototype.toString) {
        return error.toString();
      }

      try {
        return JSON.stringify(error);
      } catch {
        return "[Object]";
      }
    }

    return String(error);
  }

  /**
   * Convert string array to ValidationError array
   * (for backward compatibility)
   */
  static convertStringArrayToErrors(
    errors: string[],
    code: string
  ): ValidationError[] {
    if (!Array.isArray(errors)) {
      return [];
    }
    return errors.map((error) => this.convertStringToError(error, code as any));
  }

  /**
   * Create a simple validation error with minimal information
   */
  static createSimpleError(
    message: string,
    path: string | string[] = [],
    code: ErrorCode | string = ErrorCode.VALIDATION_ERROR
  ): ValidationError {
    return this.createError(path, message, code, "valid value", undefined);
  }

  /**
   * Create an error for missing required fields
   */
  static createMissingFieldError(
    path: string | string[],
    fieldName: string
  ): ValidationError {
    const sanitizedFieldName =
      typeof fieldName === "string" ? fieldName.trim() : "unknown";

    return this.createError(
      path,
      `Missing required field: ${sanitizedFieldName}`,
      ErrorCode.MISSING_REQUIRED_FIELD,
      `required field: ${sanitizedFieldName}`,
      undefined
    );
  }

  /**
   * create constant error
   */
  static createConstantError(
    path: string | string[],
    expected: string | number | boolean,
    received: any,
    constantValue: any
  ): ValidationError {
    const safeConstantValue =
      constantValue !== null && constantValue !== undefined
        ? String(constantValue)
        : "null";

    return this.createError(
      path,
      `Expected constant value: ${safeConstantValue}, received ${String(received)}`,
      ErrorCode.CONSTANT_ERROR,
      `constant: ${safeConstantValue}`,
      received
    );
  }

  /**
   * Create an error for unknown fields
   */
  static createUnknownFieldError(
    path: string | string[],
    fieldName: string
  ): ValidationError {
    const sanitizedFieldName =
      typeof fieldName === "string" ? fieldName.trim() : "unknown";

    return this.createError(
      path,
      `Unknown field: ${sanitizedFieldName}`,
      ErrorCode.UNKNOWN_FIELD,
      "known field",
      fieldName
    );
  }

  /**
   * Create an error for invalid fields
   */
  static createInvalidFieldError(
    path: string | string[],
    fieldName: string,
    expected: string,
    received: any
  ): ValidationError {
    const sanitizedFieldName =
      typeof fieldName === "string" ? fieldName.trim() : "unknown";

    return this.createError(
      path,
      `Invalid field: ${sanitizedFieldName}`,
      ErrorCode.INVALID_FIELD,
      expected,
      received
    );
  }

  /**
   * conditional error
   */
  static createConditionalError(
    path: string | string[],
    message: string,
    received: any
  ): ValidationError {
    return this.createError(
      path,
      message,
      ErrorCode.CONDITION_ERROR,
      "condition met",
      received
    );
  }

  /**
   * Create a syntax error
   */
  static createSyntaxError(
    path: string | string[],
    message: string,
    received: any
  ): ValidationError {
    return this.createError(
      path,
      message,
      ErrorCode.SYNTAX_ERROR,
      "valid syntax",
      received
    );
  }

  /**
   * password error
   */
  static createPasswordError(
    path: string | string[],
    message: string,
    received: any
  ): ValidationError {
    return this.createError(
      path,
      message,
      ErrorCode.INVALID_PASSWORD,
      "strong password",
      received
    );
  }

  /**
   * createDateError
   */
  static createDateError(
    path: string | string[],
    received: any
  ): ValidationError {
    return this.createError(
      path,
      "Invalid date format",
      ErrorCode.INVALID_DATE,
      "valid date format",
      received
    );
  }

  /**
   * Validation error
   */
  static createValidationError(
    path: string | string[],
    message: string,
    received: any
  ): ValidationError {
    // console.log("createValidationError", message);
    return this.createError(
      path,
      `Validation failed: ${message}`,
      ErrorCode.VALIDATION_ERROR,
      "valid value",
      received
    );
  }

  /**
   * Url components validation error
   */
  static createUrlCValidationErr(
    path: string | string[],
    message: string,
    received: any
  ): ValidationError {
    return this.createError(
      path,
      message,
      ErrorCode.INVALID_URL_ARGS,
      "valid url components",
      received
    );
  }

  /**
   * Safely capitalize first letter of a string
   */
  private static capitalizeFirstLetter(str: string): string {
    if (typeof str !== "string" || str.length === 0) {
      return str;
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Sanitize received value for safe display in error messages
   */
  private static sanitizeReceivedValue(value: any): string {
    if (value === null) return "null";
    if (value === undefined) return "undefined";
    if (typeof value === "string") {
      return value.length > 50
        ? `"${value.substring(0, 47)}..."`
        : `"${value}"`;
    }
    if (typeof value === "object") {
      return `[${this.detectValueType(value)}]`;
    }
    return String(value);
  }
}
