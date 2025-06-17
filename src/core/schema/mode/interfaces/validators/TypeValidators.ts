/**
 * Type Validators Module
 *
 * Contains all basic type validation logic extracted from InterfaceSchema
 * to improve maintainability and reduce file size.
 */

import { SchemaValidationResult } from "../../../../types/types";
import { SchemaOptions } from "../Interface";

/**
 * Validates basic types with enhanced constraints
 */
export class TypeValidators {
  /**
   * Validate string type with constraints
   */
  static validateString(
    value: any,
    options: SchemaOptions,
    constraints: any
  ): SchemaValidationResult {
    const result: SchemaValidationResult = {
      success: true,
      errors: [],
      warnings: [],
      data: value,
    };

    if (typeof value !== "string") {
      result.success = false;
      result.errors.push(`Expected string, got ${typeof value}`);
      return result;
    }

    // Apply string constraints
    if (
      constraints.minLength !== undefined &&
      value.length < constraints.minLength
    ) {
      result.success = false;
      result.errors.push(
        `String must be at least ${constraints.minLength} characters`
      );
    }

    if (
      constraints.maxLength !== undefined &&
      value.length > constraints.maxLength
    ) {
      result.success = false;
      result.errors.push(
        `String must be at most ${constraints.maxLength} characters`
      );
    }

    if (constraints.pattern && !constraints.pattern.test(value)) {
      result.success = false;
      result.errors.push("String does not match required pattern");
    }

    return result;
  }

  /**
   * Validate number type with constraints
   */
  static validateNumber(
    value: any,
    options: SchemaOptions,
    constraints: any,
    type: "number" | "float" = "number"
  ): SchemaValidationResult {
    const result: SchemaValidationResult = {
      success: true,
      errors: [],
      warnings: [],
      data: value,
    };

    if (typeof value === "string" && options.loose) {
      if (!isNaN(Number(value))) {
        const num = parseFloat(value);
        result.data = num;
        result.warnings.push("String converted to number (loose mode)");
        value = num;
      } else {
        result.success = false;
        result.errors.push("Expected number");
        return result;
      }
    } else if (typeof value !== "number" || !isFinite(value)) {
      result.success = false;
      result.errors.push(`Expected number, got ${typeof value}`);
      return result;
    }

    // Apply number constraints
    if (constraints.min !== undefined && value < constraints.min) {
      result.success = false;
      result.errors.push(`Number must be at least ${constraints.min}`);
    }

    if (constraints.max !== undefined && value > constraints.max) {
      result.success = false;
      result.errors.push(`Number must be at most ${constraints.max}`);
    }

    return result;
  }

  /**
   * Validate integer types (int, integer, positive, negative)
   */
  static validateInteger(
    value: any,
    options: SchemaOptions,
    constraints: any,
    type: "int" | "integer" | "positive" | "negative"
  ): SchemaValidationResult {
    const result: SchemaValidationResult = {
      success: true,
      errors: [],
      warnings: [],
      data: value,
    };

    if (typeof value === "string" && options.loose) {
      if (!isNaN(Number(value))) {
        const num = parseInt(value, 10);
        result.data = num;
        result.warnings.push("String converted to integer (loose mode)");
        value = num;
      } else {
        result.success = false;
        result.errors.push("Expected integer");
        return result;
      }
    } else if (
      typeof value !== "number" ||
      !isFinite(value) ||
      value % 1 !== 0
    ) {
      result.success = false;
      result.errors.push(`Expected integer, got ${typeof value}`);
      return result;
    }

    if (type === "positive" && value <= 0) {
      result.success = false;
      result.errors.push("Expected positive number");
    }

    if (type === "negative" && value >= 0) {
      result.success = false;
      result.errors.push("Expected negative number");
    }

    // Apply number constraints
    if (constraints.min !== undefined && value < constraints.min) {
      result.success = false;
      result.errors.push(`Integer must be at least ${constraints.min}`);
    }

    if (constraints.max !== undefined && value > constraints.max) {
      result.success = false;
      result.errors.push(`Integer must be at most ${constraints.max}`);
    }

    return result;
  }

  /**
   * Validate float types (float, double)
   */
  static validateFloat(
    value: any,
    options: SchemaOptions,
    constraints: any,
    type: "float" | "double"
  ): SchemaValidationResult {
    const result: SchemaValidationResult = {
      success: true,
      errors: [],
      warnings: [],
      data: value,
    };

    if (typeof value === "string" && options.loose) {
      if (!isNaN(Number(value))) {
        const num = parseFloat(value);
        result.data = num;
        result.warnings.push("String converted to float (loose mode)");
        value = num;
      } else {
        result.success = false;
        result.errors.push("Expected float");
        return result;
      }
    } else if (typeof value !== "number" || !isFinite(value)) {
      result.success = false;
      result.errors.push(`Expected float, got ${typeof value}`);
      return result;
    }

    // Apply number constraints
    if (constraints.min !== undefined && value < constraints.min) {
      result.success = false;
      result.errors.push(`Float must be at least ${constraints.min}`);
    }

    if (constraints.max !== undefined && value > constraints.max) {
      result.success = false;
      result.errors.push(`Float must be at most ${constraints.max}`);
    }

    return result;
  }

  /**
   * Validate boolean types (boolean, bool)
   */
  static validateBoolean(
    value: any,
    options: SchemaOptions,
    constraints: any
  ): SchemaValidationResult {
    const result: SchemaValidationResult = {
      success: true,
      errors: [],
      warnings: [],
      data: value,
    };

    if (typeof value === "boolean") {
      result.data = value;
    } else if (options.loose) {
      if (typeof value === "string") {
        const lower = value.toLowerCase();
        if (["true", "1", "yes", "on"].includes(lower)) {
          result.data = true;
          result.warnings.push("String converted to boolean (loose mode)");
        } else if (["false", "0", "no", "off"].includes(lower)) {
          result.data = false;
          result.warnings.push("String converted to boolean (loose mode)");
        } else {
          result.success = false;
          result.errors.push("Expected boolean");
        }
      } else if (typeof value === "number") {
        result.data = Boolean(value);
        result.warnings.push("Number converted to boolean (loose mode)");
      } else {
        result.success = false;
        result.errors.push(`Expected boolean, got ${typeof value}`);
      }
    } else {
      result.success = false;
      result.errors.push(`Expected boolean, got ${typeof value}`);
    }

    return result;
  }

  /**
   * Validate date types (date, datetime, timestamp)
   */
  static validateDate(
    value: any,
    options: SchemaOptions,
    constraints: any,
    type: "date" | "datetime" | "timestamp"
  ): SchemaValidationResult {
    const result: SchemaValidationResult = {
      success: true,
      errors: [],
      warnings: [],
      data: value,
    };

    if (!(value instanceof Date)) {
      if (options.loose && typeof value === "string") {
        const parsedDate = new Date(value);
        if (!isNaN(parsedDate.getTime())) {
          result.data = parsedDate;
          result.warnings.push("String converted to Date (loose mode)");
        } else {
          result.success = false;
          result.errors.push("Invalid date string");
        }
      } else if (options.loose && typeof value === "number") {
        const parsedDate = new Date(value);
        if (!isNaN(parsedDate.getTime())) {
          result.data = parsedDate;
          result.warnings.push("Number converted to Date (loose mode)");
        } else {
          result.success = false;
          result.errors.push("Invalid timestamp");
        }
      } else {
        result.success = false;
        result.errors.push(`Expected Date object, got ${typeof value}`);
      }
    } else if (isNaN(value.getTime())) {
      result.success = false;
      result.errors.push("Invalid date");
    }

    return result;
  }

  /**
   * Validate email format with comprehensive RFC 5322 compliance and plus addressing support
   */
  static validateEmail(value: any): SchemaValidationResult {
    const result: SchemaValidationResult = {
      success: true,
      errors: [],
      warnings: [],
      data: value,
    };

    if (typeof value !== "string") {
      result.success = false;
      result.errors.push("Expected string for email");
      return result;
    }

    // Comprehensive email validation with plus addressing support
    // RFC 5322 compliant regex that includes plus addressing
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!emailRegex.test(value)) {
      result.success = false;
      result.errors.push("Invalid email format");
      return result;
    }

    // Additional validation checks
    if (value.length > 254) {
      result.success = false;
      result.errors.push("Email address is too long (max 254 characters)");
      return result;
    }

    const [localPart, domain] = value.split("@");

    // Local part validation
    if (localPart.length > 64) {
      result.success = false;
      result.errors.push("Email local part is too long (max 64 characters)");
      return result;
    }

    // Check for consecutive dots
    if (localPart.includes("..")) {
      result.success = false;
      result.errors.push("Email local part cannot contain consecutive dots");
      return result;
    }

    // Check for leading/trailing dots
    if (localPart.startsWith(".") || localPart.endsWith(".")) {
      result.success = false;
      result.errors.push("Email local part cannot start or end with a dot");
      return result;
    }

    // Plus addressing detection and validation
    if (localPart.includes("+")) {
      result.warnings.push("Email uses plus addressing (alias detected)");

      // Validate plus addressing format
      const plusIndex = localPart.indexOf("+");
      const basePart = localPart.substring(0, plusIndex);
      const tagPart = localPart.substring(plusIndex + 1);

      if (basePart.length === 0) {
        result.success = false;
        result.errors.push("Email local part cannot start with plus sign");
        return result;
      }

      if (tagPart.length === 0) {
        result.warnings.push("Empty tag in plus addressing");
      }
    }

    // Domain validation
    if (domain.length > 253) {
      result.success = false;
      result.errors.push("Email domain is too long (max 253 characters)");
      return result;
    }

    if (domain.includes("..")) {
      result.success = false;
      result.errors.push("Email domain cannot contain consecutive dots");
      return result;
    }

    return result;
  }

  /**
   * Validate URL format
   */
  static validateUrl(
    value: any,
    type: "url" | "uri" = "url"
  ): SchemaValidationResult {
    const result: SchemaValidationResult = {
      success: true,
      errors: [],
      warnings: [],
      data: value,
    };

    if (typeof value !== "string") {
      result.success = false;
      result.errors.push(`Expected string for ${type.toUpperCase()}`);
    } else {
      try {
        new URL(value);
      } catch {
        result.success = false;
        result.errors.push(`Invalid ${type.toUpperCase()} format`);
      }
    }

    return result;
  }

  /**
   * Validate UUID/GUID format
   */
  static validateUuid(
    value: any,
    type: "uuid" | "guid" = "uuid"
  ): SchemaValidationResult {
    const result: SchemaValidationResult = {
      success: true,
      errors: [],
      warnings: [],
      data: value,
    };

    if (typeof value !== "string") {
      result.success = false;
      result.errors.push(`Expected string for ${type.toUpperCase()}`);
    } else if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        value
      )
    ) {
      result.success = false;
      result.errors.push(`Invalid ${type.toUpperCase()} format`);
    }

    return result;
  }

  /**
   * Validate phone format
   */
  static validatePhone(value: any): SchemaValidationResult {
    const result: SchemaValidationResult = {
      success: true,
      errors: [],
      warnings: [],
      data: value,
    };

    if (typeof value !== "string") {
      result.success = false;
      result.errors.push("Expected string for phone");
    } else {
      const cleanPhone = value.replace(/[\s\-\(\)\.+]/g, "");
      if (!/^[1-9]\d{6,14}$/.test(cleanPhone)) {
        result.success = false;
        result.errors.push("Invalid phone format");
      }
    }

    return result;
  }

  /**
   * Validate slug format
   */
  static validateSlug(value: any): SchemaValidationResult {
    const result: SchemaValidationResult = {
      success: true,
      errors: [],
      warnings: [],
      data: value,
    };

    if (typeof value !== "string") {
      result.success = false;
      result.errors.push("Expected string for slug");
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
      result.success = false;
      result.errors.push(
        "Invalid slug format (use lowercase letters, numbers, and hyphens)"
      );
    }

    return result;
  }

  /**
   * Validate username format
   */
  static validateUsername(value: any): SchemaValidationResult {
    const result: SchemaValidationResult = {
      success: true,
      errors: [],
      warnings: [],
      data: value,
    };

    if (typeof value !== "string") {
      result.success = false;
      result.errors.push("Expected string for username");
    } else if (!/^[a-zA-Z0-9_-]{3,20}$/.test(value)) {
      result.success = false;
      result.errors.push(
        "Invalid username format (3-20 chars, letters, numbers, underscore, hyphen)"
      );
    }

    return result;
  }

  /**
   * Validate password format
   */
  static validatePassword(value: any): SchemaValidationResult {
    const result: SchemaValidationResult = {
      success: true,
      errors: [],
      warnings: [],
      data: value,
    };

    if (typeof value !== "string") {
      result.success = false;
      result.errors.push("Expected string for password");
    } else if (value.length < 8) {
      result.success = false;
      result.errors.push("Password must be at least 8 characters");
    }

    return result;
  }

  /**
   * Validate text format (alias for string)
   */
  static validateText(value: any): SchemaValidationResult {
    const result: SchemaValidationResult = {
      success: true,
      errors: [],
      warnings: [],
      data: value,
    };

    if (typeof value !== "string") {
      result.success = false;
      result.errors.push("Expected string for text");
    }

    return result;
  }

  /**
   * Validate JSON format
   */
  static validateJson(value: any): SchemaValidationResult {
    const result: SchemaValidationResult = {
      success: true,
      errors: [],
      warnings: [],
      data: value,
    };

    if (typeof value === "string") {
      try {
        result.data = JSON.parse(value);
        result.warnings.push("JSON string parsed to object");
      } catch {
        result.success = false;
        result.errors.push("Invalid JSON string");
      }
    } else if (typeof value === "object") {
      result.data = value;
    } else {
      result.success = false;
      result.errors.push("Expected JSON string or object");
    }

    return result;
  }

  /**
   * Validate object type
   */
  static validateObject(value: any): SchemaValidationResult {
    const result: SchemaValidationResult = {
      success: true,
      errors: [],
      warnings: [],
      data: value,
    };

    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      result.success = false;
      result.errors.push("Expected object");
    }

    return result;
  }

  /**
   * Validate special types (unknown, void, null, undefined, any)
   */
  static validateSpecialType(
    value: any,
    type: "unknown" | "void" | "null" | "undefined" | "any"
  ): SchemaValidationResult {
    const result: SchemaValidationResult = {
      success: true,
      errors: [],
      warnings: [],
      data: value,
    };

    switch (type) {
      case "unknown":
      case "any":
        // Accept any value
        break;
      case "void":
        if (value !== undefined) {
          result.success = false;
          result.errors.push("Expected undefined for void type");
        }
        break;
      case "null":
        if (value !== null) {
          result.success = false;
          result.errors.push("Expected null");
        }
        break;
      case "undefined":
        if (value !== undefined) {
          result.success = false;
          result.errors.push("Expected undefined");
        }
        break;
    }

    return result;
  }
}
