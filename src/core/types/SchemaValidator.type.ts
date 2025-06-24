/**
 * Constant value wrapper to distinguish from string types
 */
export interface ConstantValue {
  const: string | number | boolean;
}

/**
 * Union value wrapper for proper type inference
 */
export interface UnionValue<T extends readonly string[] = readonly string[]> {
  union: T;
}

/**
 * Optional constant value wrapper
 */
export interface OptionalConstantValue {
  const: string | number | boolean;
  optional: true;
}

/**
 * Optional schema interface wrapper
 */
export interface OptionalSchemaInterface {
  optional: true;
  schema: SchemaInterface;
}

/**
 * Schema definition using TypeScript-like interface syntax
 */
export interface SchemaInterface {
  [key: string]:
    | SchemaFieldType
    | ConstantValue
    | OptionalConstantValue
    | SchemaInterface
    | SchemaInterface[]
    | any;
}

/**
 * Field type definitions using string literals and objects
 */
export type SchemaFieldType =
  // Basic types
  | "string"
  | "string?"
  | "number"
  | "number?"
  | "boolean"
  | "boolean?"
  | "date"
  | "date?"
  | "any"
  | "any?"

  // String formats
  | "email"
  | "email?"
  | "url"
  | "url?"
  | "uuid"
  | "uuid?"
  | "phone"
  | "phone?"
  | "slug"
  | "slug?"
  | "username"
  | "username?"
  | "ip"
  | "ip?"
  | "json"
  | "json?"
  | "hexcolor"
  | "hexcolor?"
  | "base64"
  | "base64?"
  | "jwt"
  | "jwt?"
  | "semver"
  | "semver?"

  // Number types
  | "int"
  | "int?"
  | "positive"
  | "positive?"
  | "float"
  | "float?"

  // Array types
  | "string[]"
  | "string[]?"
  | "number[]"
  | "number[]?"
  | "boolean[]"
  | "boolean[]?"
  | "int[]"
  | "int[]?"
  | "email[]"
  | "email[]?"
  | "url[]"
  | "url[]?"
  | "ip[]"
  | "ip[]?"
  | "json[]"
  | "json[]?"
  | "hexcolor[]"
  | "hexcolor[]?"
  | "base64[]"
  | "base64[]?"
  | "jwt[]"
  | "jwt[]?"
  | "semver[]"
  | "semver[]?"

  // Union types (multiple allowed values)
  | string // For union syntax like "pending|accepted|rejected"

  // Constant values
  | ConstantValue
  | OptionalConstantValue

  // Union values
  | UnionValue

  // Nested objects and arrays
  | SchemaInterface
  | SchemaInterface[]
  | OptionalSchemaInterface;

/**
 * Schema validation options for fine-tuning
 */
export interface SchemaOptions {
  // String options
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;

  // Number options
  min?: number;
  max?: number;
  precision?: number;

  // Array options
  minItems?: number;
  maxItems?: number;
  unique?: boolean;

  // Object options
  strict?: boolean;
  allowUnknown?: boolean;

  // General options
  required?: boolean;
  default?: any;
  loose?: boolean; // Allow type coercion (opposite of strict)

  // Performance options
  enablePerformanceMonitoring?: boolean;
  enableOptimizations?: boolean;
  cacheValidation?: boolean;
  skipOptimization?: boolean; // Skip optimization to prevent circular dependency
}
