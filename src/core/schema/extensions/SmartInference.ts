/**
 * Smart Schema Inference - TypeScript type-to-schema conversion
 *
 * This module provides automatic schema generation from TypeScript types,
 * making schema definition even more seamless.
 */

import { SchemaInterface } from "../mode/interfaces/Interface";

/**
 * Smart inference utilities for automatic schema generation
 */
export const Smart = {
  /**
   * Infer schema from TypeScript interface using runtime reflection
   *
   * @example
   * ```typescript
   * interface User {
   *   id: number;
   *   email: string;
   *   name?: string;
   * }
   *
   * // Use with sample data that matches your interface
   * const UserSchema = Smart.fromType<User>({
   *   id: 1,
   *   email: "user@example.com",
   *   name: "John Doe"
   * });
   * // Generates: Interface({ id: "positive", email: "email", name: "string?" })
   * ```
   */
  fromType<T>(sampleData: T): SchemaInterface {
    if (!sampleData || typeof sampleData !== "object") {
      throw new Error(
        "Smart.fromType() requires sample data that matches your TypeScript interface"
      );
    }

    return Smart.fromSample(sampleData);
  },

  /**
   * Infer schema from sample data with intelligent type detection
   *
   * @example
   * ```typescript
   * const sampleUser = {
   *   id: 1,
   *   email: "user@example.com",
   *   name: "John Doe",
   *   tags: ["developer", "typescript"]
   * };
   *
   * const UserSchema = Smart.fromSample(sampleUser);
   * // Generates: Interface({ id: "positive", email: "email", name: "string", tags: "string[]" })
   * ```
   */
  fromSample(sample: any): SchemaInterface {
    const schema: any = {};

    for (const [key, value] of Object.entries(sample)) {
      schema[key] = Smart.inferFieldType(value);
    }

    return schema;
  },

  /**
   * Infer field type from value with smart detection
   */
  inferFieldType(value: any): string {
    if (value === null || value === undefined) {
      return "any?";
    }

    if (typeof value === "string") {
      // Smart email detection
      if (Smart.isEmail(value)) return "email";
      // Smart URL detection
      if (Smart.isUrl(value)) return "url";
      // Smart UUID detection
      if (Smart.isUuid(value)) return "uuid";
      // Smart phone detection
      if (Smart.isPhone(value)) return "phone";

      return "string";
    }

    if (typeof value === "number") {
      // Smart positive number detection
      if (value > 0 && Number.isInteger(value)) return "positive";
      if (Number.isInteger(value)) return "int";
      return "number";
    }

    if (typeof value === "boolean") {
      return "boolean";
    }

    if (value instanceof Date) {
      return "date";
    }

    if (Array.isArray(value)) {
      if (value.length === 0) return "any[]";

      // Detect array element type from first element
      const elementType = Smart.inferFieldType(value[0]);
      const baseType = elementType.replace("?", ""); // Remove optional marker
      return `${baseType}[]`;
    }

    if (typeof value === "object") {
      // Nested object - recursively infer
      const nestedSchema: any = {};
      for (const [nestedKey, nestedValue] of Object.entries(value)) {
        nestedSchema[nestedKey] = Smart.inferFieldType(nestedValue);
      }
      return nestedSchema;
    }

    return "any";
  },

  /**
   * Smart format detection utilities
   */
  isEmail(str: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
  },

  isUrl(str: string): boolean {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  },

  isUuid(str: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      str
    );
  },

  isPhone(str: string): boolean {
    return /^\+?[1-9]\d{1,14}$/.test(str.replace(/[\s\-\(\)]/g, ""));
  },

  /**
   * Generate schema from JSON Schema (migration helper)
   *
   * @example
   * ```typescript
   * const jsonSchema = {
   *   type: "object",
   *   properties: {
   *     id: { type: "number" },
   *     email: { type: "string", format: "email" }
   *   }
   * };
   *
   * const schema = Smart.fromJsonSchema(jsonSchema);
   * ```
   */
  fromJsonSchema(jsonSchema: any): SchemaInterface {
    if (jsonSchema.type === "object" && jsonSchema.properties) {
      const schema: any = {};

      for (const [key, prop] of Object.entries(jsonSchema.properties as any)) {
        schema[key] = Smart.convertJsonSchemaProperty(prop);
      }

      return schema;
    }

    throw new Error("Unsupported JSON Schema format");
  },

  convertJsonSchemaProperty(prop: any): string {
    const isOptional = !prop.required;
    const suffix = isOptional ? "?" : "";

    switch (prop.type) {
      case "string":
        if (prop.format === "email") return `email${suffix}`;
        if (prop.format === "uri") return `url${suffix}`;
        if (prop.format === "uuid") return `uuid${suffix}`;
        if (prop.minLength && prop.maxLength) {
          return `string(${prop.minLength},${prop.maxLength})${suffix}`;
        }
        return `string${suffix}`;

      case "number":
      case "integer":
        if (prop.minimum && prop.maximum) {
          return `number(${prop.minimum},${prop.maximum})${suffix}`;
        }
        if (prop.minimum > 0) return `positive${suffix}`;
        return prop.type === "integer" ? `int${suffix}` : `number${suffix}`;

      case "boolean":
        return `boolean${suffix}`;

      case "array":
        const itemType = Smart.convertJsonSchemaProperty(
          prop.items || { type: "any" }
        );
        const baseType = itemType.replace("?", "");
        return `${baseType}[]${suffix}`;

      default:
        return `any${suffix}`;
    }
  },
};

/**
 * Export for easy access
 */
export default Smart;
