/**
 * Core types and interfaces for the FortifyJS Schema system
 */

/**
 * Rich validation error with detailed information
 */
export interface ValidationError {
  /** Field path where the error occurred (e.g., ['user', 'profile', 'email']) */
  path: string[];
  /** Human-readable error message */
  message: string;
  /** Error code for programmatic handling */
  code: string;
  /** Expected value or type */
  expected: string;
  /** Actual received value */
  received: any; 
  /** Type of the received value */
  receivedType: string;
  /** Additional context or suggestions */
  context?: {
    suggestion?: string;
    allowedValues?: any[];
    constraints?: Record<string, any>;
  };
}

/**
 * Schema validation result with rich error information
 */
export interface SchemaValidationResult<T = any> {
  success: boolean;
  data?: T;
  errors: ValidationError[];
  warnings: string[];
}

/**
 * Base schema configuration options
 */
export interface BaseSchemaOptions {
  optional?: boolean;
  nullable?: boolean;
  default?: any;
}

/**
 * String schema validation options
 */
export interface StringSchemaOptions extends BaseSchemaOptions {
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  format?: "email" | "url" | "uuid" | "phone" | "slug" | "username";
}

/**
 * Number schema validation options
 */
export interface NumberSchemaOptions extends BaseSchemaOptions {
  min?: number;
  max?: number;
  integer?: boolean;
  positive?: boolean;
  precision?: number;
}

/**
 * Boolean schema validation options
 */
export interface BooleanSchemaOptions extends BaseSchemaOptions {
  strict?: boolean; // Only accept true boolean values
}

/**
 * Array schema validation options
 */
export interface ArraySchemaOptions extends BaseSchemaOptions {
  minLength?: number;
  maxLength?: number;
  unique?: boolean;
}

/**
 * Object schema validation options
 */
export interface ObjectSchemaOptions extends BaseSchemaOptions {
  strict?: boolean; // No extra properties allowed
  allowUnknown?: boolean; // Allow unknown properties
}

/**
 * Schema type definitions
 */
export type SchemaType =
  | "string"
  | "number"
  | "boolean"
  | "array"
  | "object"
  | "date"
  | "any";

/**
 * Schema definition for object properties
 */
export type SchemaDefinition = {
  [key: string]: SchemaConfig;
};

/**
 * Complete schema configuration
 */
export interface SchemaConfig {
  type: SchemaType;
  options?: BaseSchemaOptions;
  elementSchema?: SchemaConfig; // For arrays
  properties?: SchemaDefinition; // For objects
  validator?: (value: any) => void; // Custom validator function
}

// interfaces

/**
 * Internal conditional pattern interface
 */
export interface ConditionalPattern {
  field: string;
  operator:
    | "="
    | "!="
    | ">"
    | "<"
    | ">="
    | "<="
    | "~"
    | "!~"
    | "in"
    | "!in"
    | "exists"
    | "!exists"
    | "empty"
    | "!empty"
    | "null"
    | "!null"
    | "startsWith"
    | "endsWith"
    | "contains"
    | "!contains";
  value?: any;
  thenSchema: string;
  elseSchema?: string;
}
