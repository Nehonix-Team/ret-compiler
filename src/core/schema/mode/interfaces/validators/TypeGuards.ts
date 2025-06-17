/**
 * Type Guards Module
 * 
 * Contains all type guard functions extracted from InterfaceSchema
 * to improve maintainability and reduce file size.
 */

import {
  ConstantValue,
  OptionalConstantValue,
  SchemaInterface,
  OptionalSchemaInterface,
  UnionValue,
} from "../../../../types/SchemaValidator.type";
 
/**
 * Type guard functions for schema validation
 */
export class TypeGuards {
  /**
   * Check if value is a union value
   */
  static isUnionValue(value: any): value is UnionValue {
    return (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value) &&
      "union" in value &&
      Array.isArray(value.union)
    );
  }

  /**
   * Check if value is a constant value
   */
  static isConstantValue(value: any): value is ConstantValue | OptionalConstantValue {
    return (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value) &&
      "const" in value
    );
  }

  /**
   * Check if value is an optional schema interface
   */
  static isOptionalSchemaInterface(value: any): value is OptionalSchemaInterface {
    return (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value) &&
      "optional" in value &&
      value.optional === true &&
      "schema" in value
    );
  }

  /**
   * Check if value is a conditional validation object
   */
  static isConditionalValidation(value: any): boolean {
    return (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value) &&
      value.__conditional === true &&
      "fieldName" in value &&
      "conditions" in value
    );
  }

  /**
   * Check if value is a schema interface
   */
  static isSchemaInterface(value: any): value is SchemaInterface {
    return (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value) &&
      !TypeGuards.isConstantValue(value) &&
      !TypeGuards.isOptionalSchemaInterface(value) &&
      !TypeGuards.isConditionalValidation(value)
    );
  }

  /**
   * Check if value is an array schema (single element array)
   */
  static isArraySchema(value: any): boolean {
    return Array.isArray(value) && value.length === 1;
  }

  /**
   * Check if field type is a string-based type
   */
  static isStringFieldType(fieldType: any): fieldType is string {
    return typeof fieldType === "string";
  }

  /**
   * Check if string contains union syntax
   */
  static isUnionType(fieldType: string): boolean {
    return fieldType.includes("|");
  }

  /**
   * Check if string is a constant type (starts with =)
   */
  static isConstantType(fieldType: string): boolean {
    return fieldType.startsWith("=");
  }

  /**
   * Check if string is an array type (ends with [])
   */
  static isArrayType(fieldType: string): boolean {
    // Remove optional marker first
    const type = fieldType.endsWith("?") ? fieldType.slice(0, -1) : fieldType;
    // Remove constraints if present
    const baseType = type.match(/^([a-zA-Z\[\]]+)/)?.[1] || type;
    return baseType.endsWith("[]");
  }

  /**
   * Check if string is an optional type (ends with ?)
   */
  static isOptionalType(fieldType: string): boolean {
    return fieldType.endsWith("?");
  }

  /**
   * Check if string is a record type
   */
  static isRecordType(fieldType: string): boolean {
    return fieldType.startsWith("record<") && fieldType.endsWith(">");
  }

  /**
   * Check if string has constraints (contains parentheses)
   */
  static hasConstraints(fieldType: string): boolean {
    // Remove optional marker
    const type = fieldType.endsWith("?") ? fieldType.slice(0, -1) : fieldType;
    return /^[a-zA-Z\[\]]+\([^)]*\)$/.test(type);
  }

  /**
   * Check if value is a primitive type
   */
  static isPrimitive(value: any): boolean {
    return (
      value === null ||
      value === undefined ||
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      typeof value === "symbol" ||
      typeof value === "bigint"
    );
  }

  /**
   * Check if value is a valid email format
   */
  static isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  /**
   * Check if value is a valid URL format
   */
  static isValidUrl(value: string): boolean {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if value is a valid UUID format
   */
  static isValidUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  }

  /**
   * Check if value is a valid phone format
   */
  static isValidPhone(value: string): boolean {
    const cleanPhone = value.replace(/[\s\-\(\)\.+]/g, "");
    return /^[1-9]\d{6,14}$/.test(cleanPhone);
  }

  /**
   * Check if value is a valid slug format
   */
  static isValidSlug(value: string): boolean {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
  }

  /**
   * Check if value is a valid username format
   */
  static isValidUsername(value: string): boolean {
    return /^[a-zA-Z0-9_-]{3,20}$/.test(value);
  }

  /**
   * Check if value is empty (for empty/!empty operators)
   */
  static isEmpty(value: any): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === "string") return value.length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === "object") return Object.keys(value).length === 0;
    return false;
  }

  /**
   * Check if value is a valid JSON string
   */
  static isValidJson(value: string): boolean {
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if value is a valid date
   */
  static isValidDate(value: any): boolean {
    if (value instanceof Date) {
      return !isNaN(value.getTime());
    }
    if (typeof value === "string" || typeof value === "number") {
      const date = new Date(value);
      return !isNaN(date.getTime());
    }
    return false;
  }

  /**
   * Check if value is a finite number
   */
  static isFiniteNumber(value: any): boolean {
    return typeof value === "number" && isFinite(value);
  }

  /**
   * Check if value is an integer
   */
  static isInteger(value: any): boolean {
    return typeof value === "number" && isFinite(value) && value % 1 === 0;
  }

  /**
   * Check if value is a positive number
   */
  static isPositive(value: any): boolean {
    return typeof value === "number" && isFinite(value) && value > 0;
  }

  /**
   * Check if value is a negative number
   */
  static isNegative(value: any): boolean {
    return typeof value === "number" && isFinite(value) && value < 0;
  }

  /**
   * Get the type name of a value for error messages
   */
  static getTypeName(value: any): string {
    if (value === null) return "null";
    if (value === undefined) return "undefined";
    if (Array.isArray(value)) return "array";
    if (value instanceof Date) return "Date";
    if (value instanceof RegExp) return "RegExp";
    return typeof value;
  }
}
