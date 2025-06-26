/**
 * TypeScript Interface-like Schema System
 *
 * The most intuitive way to define schemas - just like TypeScript interfaces!
 *
 * @example
 * ```typescript
 * import { Interface as IF} from "fortify-schema";
 *
 * // Define schema like a TypeScript interface
 * const UserSchema = IF({
 *   id: "number",
 *   email: "email",
 *   name: "string",
 *   age: "number?",           // Optional
 *   isActive: "boolean?",     // Optional
 *   tags: "string[]?",        // Optional array
 *   role: "admin",            // Constant value
 *   profile: {                // Nested object
 *     bio: "string?",
 *     avatar: "url?"
 *   }
 * });
 *
 * // Validate data
 * const result = UserSchema.safeParse(userData);
 * ```
 */

import { InterfaceSchema } from "./InterfaceSchema";
import {
  ConstantValue,
  OptionalConstantValue,
  OptionalSchemaInterface,
  SchemaInterface,
  SchemaOptions,
  SchemaFieldType,
  UnionValue,
} from "../../../types/SchemaValidator.type";
import { InferSchemaType } from "./typescript/TypeInference";

/**
 * Convert Make objects to string syntax that InterfaceSchema understands
 */
function convertMakeObjectsToStrings(definition: any): any {
  if (typeof definition !== "object" || definition === null) {
    return definition;
  }

  // Handle arrays
  if (Array.isArray(definition)) {
    return definition.map((item) => convertMakeObjectsToStrings(item));
  }

  // Check if this is a Make.const() object: convert => =constVal
  if (
    typeof definition === "object" &&
    "const" in definition &&
    Object.keys(definition).length === 1
  ) {
    // Convert Make.const() to string syntax
    return `=${definition.const}`;
  }

  // Check if this is a Make.union() object
  if (
    typeof definition === "object" &&
    "union" in definition &&
    Array.isArray(definition.union) &&
    Object.keys(definition).length === 1
  ) {
    // Convert Make.union() to string syntax
    return definition.union.join("|");
  }

  // Recursively process nested objects
  const result: any = {};
  for (const [key, value] of Object.entries(definition)) {
    result[key] = convertMakeObjectsToStrings(value);
  }
  return result;
}

/**
 * Create a schema using TypeScript interface-like syntax with full type inference
 *
 * @param definition - Schema definition using TypeScript-like syntax
 * @param options - Optional validation options
 * @returns InterfaceSchema instance with inferred types
 *
 * @example Basic Usage
 * ```typescript
 * const UserSchema = Interface({
 *   id: "number",
 *   email: "email",
 *   name: "string",
 *   age: "number?",
 *   isActive: "boolean?",
 *   tags: "string[]?"
 * });
 *
 * // result is fully typed as:
 * // SchemaValidationResult<{
 * //   id: number;
 * //   email: string;
 * //   name: string;
 * //   age?: number;
 * //   isActive?: boolean;
 * //   tags?: string[];
 * // }>
 * const result = UserSchema.safeParse(data);
 * ```
 *
 * @example With Constraints
 * ```typescript
 * const UserSchema = Interface({
 *   username: "string(3,20)",        // 3-20 characters
 *   age: "number(18,120)",           // 18-120 years
 *   tags: "string[](1,10)?",         // 1-10 tags, optional
 * });
 * ```
 *
 * @example Nested Objects
 * ```typescript
 * const OrderSchema = Interface({
 *   id: "number",
 *   customer: {
 *     name: "string",
 *     email: "email",
 *     address: {
 *       street: "string",
 *       city: "string",
 *       zipCode: "string"
 *     }
 *   },
 *   items: [{
 *     name: "string",
 *     price: "number",
 *     quantity: "int"
 *   }]
 * });
 * ```
 */
export function Interface<const T extends SchemaInterface>(
  definition: T,
  options?: SchemaOptions
): InterfaceSchema<InferSchemaType<T>> {
  // Convert Make objects to string syntax before creating schema
  const processedDefinition = convertMakeObjectsToStrings(definition);

  // Debug: Log the conversion (disabled for now)
  // if (process.env.NODE_ENV !== "production") {
  //   console.log("DEBUG: Original definition:", JSON.stringify(definition, null, 2));
  //   console.log("DEBUG: Processed definition:", JSON.stringify(processedDefinition, null, 2));
  // }

  return new InterfaceSchema<InferSchemaType<T>>(processedDefinition, options);
}

/**
 * Type helper for inferring TypeScript types from schema definitions
 *
 * @example
 * ```typescript
 * const UserSchema = Interface({
 *   id: "number",
 *   email: "email",
 *   name: "string",
 *   age: "number?",
 *   tags: "string[]?"
 * });
 *
 * // Infer the TypeScript type
 * type User = InferType<typeof UserSchema>;
 * // User = {
 * //   id: number;
 * //   email: string;
 * //   name: string;
 * //   age?: number;
 * //   tags?: string[];
 * // }
 * ```
 */
export type InferType<T extends InterfaceSchema<any>> =
  T extends InterfaceSchema<infer U> ? U : never;

// Export the main inference type for direct use
export type { InferSchemaType };

// Re-export types for convenience
export type {
  SchemaInterface,
  SchemaOptions,
  SchemaFieldType,
  ConstantValue,
} from "../../../types/SchemaValidator.type";
export { InterfaceSchema } from "./InterfaceSchema";

// Re-export TypeScript integration
export { TypeScriptIntegration, IDE, TypeInference } from "./typescript";
export type {
  ConditionalExpression,
  TypeInferenceResult,
  ConditionalResult,
  FieldPaths,
  GetValueByPath,
  ValidateConditional,
} from "./typescript";

// Re-export validators for advanced usage
export {
  TypeValidators,
  ConstraintParser,
  TypeGuards,
  ValidationHelpers,
} from "./validators";
export type { ParsedConstraints } from "./validators";

/**
 * Available field types for schema definitions
 */
export const FieldTypes = {
  // Basic types
  STRING: "string" as const,
  STRING_OPTIONAL: "string?" as const,
  NUMBER: "number" as const,
  NUMBER_OPTIONAL: "number?" as const,
  BOOLEAN: "boolean" as const,
  BOOLEAN_OPTIONAL: "boolean?" as const,
  DATE: "date" as const,
  DATE_OPTIONAL: "date?" as const,
  ANY: "any" as const,
  ANY_OPTIONAL: "any?" as const,

  // String formats
  EMAIL: "email" as const,
  EMAIL_OPTIONAL: "email?" as const,
  URL: "url" as const,
  URL_OPTIONAL: "url?" as const,
  UUID: "uuid" as const,
  UUID_OPTIONAL: "uuid?" as const,
  PHONE: "phone" as const,
  PHONE_OPTIONAL: "phone?" as const,
  SLUG: "slug" as const,
  SLUG_OPTIONAL: "slug?" as const,
  USERNAME: "username" as const,
  USERNAME_OPTIONAL: "username?" as const,

  // Number types
  INT: "int" as const,
  INT_OPTIONAL: "int?" as const,
  POSITIVE: "positive" as const,
  POSITIVE_OPTIONAL: "positive?" as const,
  FLOAT: "float" as const,
  FLOAT_OPTIONAL: "float?" as const,

  // Array types
  STRING_ARRAY: "string[]" as const,
  STRING_ARRAY_OPTIONAL: "string[]?" as const,
  NUMBER_ARRAY: "number[]" as const,
  NUMBER_ARRAY_OPTIONAL: "number[]?" as const,
  BOOLEAN_ARRAY: "boolean[]" as const,
  BOOLEAN_ARRAY_OPTIONAL: "boolean[]?" as const,
  INT_ARRAY: "int[]" as const,
  INT_ARRAY_OPTIONAL: "int[]?" as const,
  EMAIL_ARRAY: "email[]" as const,
  EMAIL_ARRAY_OPTIONAL: "email[]?" as const,
  URL_ARRAY: "url[]" as const,
  URL_ARRAY_OPTIONAL: "url[]?" as const,

  // Record types
  RECORD_STRING_ANY: "record<string,any>" as const,
  RECORD_STRING_ANY_OPTIONAL: "record<string,any>?" as const,
  RECORD_STRING_STRING: "record<string,string>" as const,
  RECORD_STRING_STRING_OPTIONAL: "record<string,string>?" as const,
  RECORD_STRING_NUMBER: "record<string,number>" as const,
  RECORD_STRING_NUMBER_OPTIONAL: "record<string,number>?" as const,
} as const;

/**
 * Quick schema creation helpers
 */
export const QuickSchemas = {
  /**
   * User schema with common fields
   */
  User: Interface({
    id: "number",
    email: "email",
    name: "string",
    createdAt: "date?",
    updatedAt: "date?",
  }),

  /**
   * API response schema
   */
  APIResponse: Interface({
    success: "boolean",
    data: "any?",
    errors: "string[]?",
    timestamp: "date?",
  }),

  /**
   * Pagination schema
   */
  Pagination: Interface({
    page: "int",
    limit: "int",
    total: "int",
    hasNext: "boolean?",
    hasPrev: "boolean?",
  }),

  /**
   * Address schema
   */
  Address: Interface({
    street: "string",
    city: "string",
    state: "string?",
    zipCode: "string",
    country: "string",
  }),

  /**
   * Contact info schema
   */
  Contact: Interface({
    email: "email?",
    phone: "phone?",
    website: "url?",
  }),
};

/**
 * Schema modification utilities - transform and combine schemas
 */
export { Mod } from "../../../utils/Mod";

/**
 * Helper functions for creating schema values
 */
export { Make } from "../../../utils/Make";
