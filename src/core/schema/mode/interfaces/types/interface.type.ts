/**
 * Enhanced Type Inference System for Schema Definitions
 * Features: design, better extensibility, performance optimizations
 */

import {
  ConstantValue,
  OptionalConstantValue,
  OptionalSchemaInterface,
  UnionValue,
} from "../../../../types/SchemaValidator.type";
import { SchemaInterface } from "../Interface";

// ============================================================================
// CORE TYPE REGISTRY - Easy to extend with new types
// ============================================================================

// Base type mapping - easy to add new primitive types
interface BaseTypeMap {
  string: string;
  number: number;
  int: number;
  integer: number;
  float: number;
  double: number;
  positive: number;
  negative: number;
  boolean: boolean;
  bool: boolean;
  date: Date;
  datetime: Date;
  timestamp: Date;
  email: string;
  url: string;
  uri: string;
  uuid: string;
  guid: string;
  phone: string;
  slug: string;
  username: string;
  password: string;
  text: string;
  json: any;
  object: object;
  any: any;
  unknown: unknown;
  void: void;
  null: null;
  undefined: undefined;
}

// Constraint patterns - easy to add new constraint types
interface ConstraintTypeMap {
  min: number;
  max: number;
  length: number;
  minLength: number;
  maxLength: number;
  pattern: string;
  regex: string;
  format: string;
  enum: string;
  range: string;
  precision: number;
  scale: number;
}

// ============================================================================
// ENHANCED UNION PARSER - More robust and extensible
// ============================================================================

type ParseUnion<T extends string> = T extends `${infer First}|${infer Rest}`
  ? First extends ""
    ? ParseUnion<Rest>
    : Rest extends ""
      ? First
      : First | ParseUnion<Rest>
  : T extends ""
    ? never
    : T;

// ============================================================================
// ADVANCED CONDITIONAL OPERATORS - Extensible operator system
// ============================================================================

interface OperatorMap {
  "=": "equals";
  "!=": "not_equals";
  ">": "greater_than";
  ">=": "greater_than_or_equal";
  "<": "less_than";
  "<=": "less_than_or_equal";
  "~": "matches";
  "!~": "not_matches";
  in: "in_array";
  "!in": "not_in_array";
  exists: "field_exists";
  "!exists": "field_not_exists";
  empty: "is_empty";
  "!empty": "not_empty";
  null: "is_null";
  "!null": "not_null";
  startsWith: "starts_with";
  endsWith: "ends_with";
  contains: "contains";
  "!contains": "not_contains";
}

// Enhanced condition parser with better error handling
export type ParseWhenCondition<T extends string> =
  // Method-based conditions (most specific first)
  T extends `${infer Field}.!exists`
    ? { field: Field; operator: "!exists"; value: true }
    : T extends `${infer Field}.exists`
      ? { field: Field; operator: "exists"; value: true }
      : T extends `${infer Field}.!empty`
        ? { field: Field; operator: "!empty"; value: true }
        : T extends `${infer Field}.empty`
          ? { field: Field; operator: "empty"; value: true }
          : T extends `${infer Field}.!null`
            ? { field: Field; operator: "!null"; value: true }
            : T extends `${infer Field}.null`
              ? { field: Field; operator: "null"; value: true }
              : T extends `${infer Field}.!in(${infer Values})`
                ? { field: Field; operator: "!in"; value: Values }
                : T extends `${infer Field}.in(${infer Values})`
                  ? { field: Field; operator: "in"; value: Values }
                  : T extends `${infer Field}.!contains(${infer Value})`
                    ? { field: Field; operator: "!contains"; value: Value }
                    : T extends `${infer Field}.contains(${infer Value})`
                      ? { field: Field; operator: "contains"; value: Value }
                      : T extends `${infer Field}.startsWith(${infer Value})`
                        ? { field: Field; operator: "startsWith"; value: Value }
                        : T extends `${infer Field}.endsWith(${infer Value})`
                          ? { field: Field; operator: "endsWith"; value: Value }
                          : // Operator-based conditions
                            T extends `${infer Field}!~${infer Value}`
                            ? { field: Field; operator: "!~"; value: Value }
                            : T extends `${infer Field}~${infer Value}`
                              ? { field: Field; operator: "~"; value: Value }
                              : T extends `${infer Field}!=${infer Value}`
                                ? { field: Field; operator: "!="; value: Value }
                                : T extends `${infer Field}>=${infer Value}`
                                  ? {
                                      field: Field;
                                      operator: ">=";
                                      value: Value;
                                    }
                                  : T extends `${infer Field}<=${infer Value}`
                                    ? {
                                        field: Field;
                                        operator: "<=";
                                        value: Value;
                                      }
                                    : T extends `${infer Field}>${infer Value}`
                                      ? {
                                          field: Field;
                                          operator: ">";
                                          value: Value;
                                        }
                                      : T extends `${infer Field}<${infer Value}`
                                        ? {
                                            field: Field;
                                            operator: "<";
                                            value: Value;
                                          }
                                        : T extends `${infer Field}=${infer Value}`
                                          ? {
                                              field: Field;
                                              operator: "=";
                                              value: Value;
                                            }
                                          : never;

// ============================================================================
// FIELD TYPE INFERENCE - Easier to extend with new patterns
// ============================================================================

// Core constant type inference
type InferConstantType<T extends string> = T extends `=${infer ConstValue}`
  ? ConstValue extends "true"
    ? true
    : ConstValue extends "false"
      ? false
      : ConstValue extends `${number}`
        ? number
        : ConstValue
  : T extends `=${infer ConstValue}?`
    ? ConstValue extends "true"
      ? true | undefined
      : ConstValue extends "false"
        ? false | undefined
        : ConstValue extends `${number}`
          ? number | undefined
          : ConstValue | undefined
    : never;

// Enhanced conditional type inference
type InferConditionalType<T extends string> =
  // "*?" syntax (most concise)
  T extends `when ${infer Condition} *? ${infer ThenType} : ${infer ElseType}`
    ? InferFieldType<ThenType> | InferFieldType<ElseType>
    : T extends `when ${infer Condition} *? ${infer ThenType}`
      ? InferFieldType<ThenType>
      : // Parentheses syntax (readable)
        T extends `when(${infer Condition}) then(${infer ThenType}) else(${infer ElseType})`
        ? InferFieldType<ThenType> | InferFieldType<ElseType>
        : T extends `when(${infer Condition}) then(${infer ThenType})`
          ? InferFieldType<ThenType>
          : // Ternary-like syntax (familiar)
            T extends `${infer Condition} ? ${infer ThenType} : ${infer ElseType}`
            ? InferFieldType<ThenType> | InferFieldType<ElseType>
            : // Legacy colon syntax (backward compatibility)
              T extends `when:${infer Condition}:${infer ThenType}:${infer ElseType}`
              ? InferFieldType<ThenType> | InferFieldType<ElseType>
              : T extends `when:${infer Condition}:${infer ThenType}`
                ? InferFieldType<ThenType>
                : never;

// Base type inference with extensible type map
type InferBaseType<T extends string> = T extends keyof BaseTypeMap
  ? BaseTypeMap[T]
  : T extends `${infer BaseType}?`
    ? BaseType extends keyof BaseTypeMap
      ? BaseTypeMap[BaseType] | undefined
      : never
    : never;

// Array type inference
type InferArrayType<T extends string> = T extends `${infer ElementType}[]`
  ? ElementType extends keyof BaseTypeMap
    ? BaseTypeMap[ElementType][]
    : ElementType extends `${string}|${string}`
      ? ParseUnion<ElementType>[]
      : any[]
  : T extends `${infer ElementType}[]?`
    ? ElementType extends keyof BaseTypeMap
      ? BaseTypeMap[ElementType][] | undefined
      : ElementType extends `${string}|${string}`
        ? ParseUnion<ElementType>[] | undefined
        : any[] | undefined
    : never;

// Record type inference with better key handling
type InferRecordType<T extends string> =
  T extends `record<${infer KeyType},${infer ValueType}>`
    ? KeyType extends "string" | "number" | "symbol"
      ? Record<string, InferFieldType<ValueType>>
      : Record<string, InferFieldType<ValueType>>
    : T extends `record<${infer KeyType},${infer ValueType}>?`
      ? KeyType extends "string" | "number" | "symbol"
        ? Record<string, InferFieldType<ValueType>> | undefined
        : Record<string, InferFieldType<ValueType>> | undefined
      : T extends `map<${infer KeyType},${infer ValueType}>`
        ? Record<string, InferFieldType<ValueType>>
        : T extends `map<${infer KeyType},${infer ValueType}>?`
          ? Record<string, InferFieldType<ValueType>> | undefined
          : never;

// Constraint type inference
type InferConstrainedType<T extends string> =
  T extends `${infer BaseType}(${infer Constraints})`
    ? BaseType extends keyof BaseTypeMap
      ? BaseTypeMap[BaseType]
      : BaseType extends `${infer ArrayType}[]`
        ? ArrayType extends keyof BaseTypeMap
          ? BaseTypeMap[ArrayType][]
          : any[]
        : any
    : T extends `${infer BaseType}(${infer Constraints})?`
      ? BaseType extends keyof BaseTypeMap
        ? BaseTypeMap[BaseType] | undefined
        : BaseType extends `${infer ArrayType}[]`
          ? ArrayType extends keyof BaseTypeMap
            ? BaseTypeMap[ArrayType][] | undefined
            : any[] | undefined
          : any | undefined
      : never;

// Regex pattern inference
type InferRegexType<T extends string> =
  T extends `${infer BaseType}(/${string}/)`
    ? BaseType extends keyof BaseTypeMap
      ? BaseTypeMap[BaseType]
      : string
    : T extends `${infer BaseType}(/${string}/)?`
      ? BaseType extends keyof BaseTypeMap
        ? BaseTypeMap[BaseType] | undefined
        : string | undefined
      : never;

// ============================================================================
// MAIN FIELD TYPE INFERENCE - Now  extensible
// ============================================================================

export type InferFieldType<T> = T extends string
  ? // Try each inference type in order of specificity
    InferConstantType<T> extends never
    ? InferConditionalType<T> extends never
      ? T extends `${string}|${string}`
        ? T extends `${infer UnionType}?`
          ? ParseUnion<UnionType> | undefined
          : ParseUnion<T>
        : InferArrayType<T> extends never
          ? InferRecordType<T> extends never
            ? InferConstrainedType<T> extends never
              ? InferRegexType<T> extends never
                ? InferBaseType<T> extends never
                  ? any // Fallback for unknown types
                  : InferBaseType<T>
                : InferRegexType<T>
              : InferConstrainedType<T>
            : InferRecordType<T>
          : InferArrayType<T>
      : InferConditionalType<T>
    : InferConstantType<T>
  : any;

// ============================================================================
// ENHANCED CONDITIONAL EVALUATION - More sophisticated condition handling
// ============================================================================

export type InferConditionalTypeAdvanced<
  TCondition extends string,
  TThenType extends string,
  TElseType extends string,
  TSchema extends SchemaInterface,
> =
  ParseWhenCondition<TCondition> extends {
    field: infer Field;
    operator: infer Op;
    value: infer Value;
  }
    ? Field extends keyof TSchema
      ? TSchema[Field] extends string
        ? // Enhanced condition evaluation
          Op extends "="
          ? TSchema[Field] extends `${string}|${string}`
            ? Value extends ParseUnion<TSchema[Field]>
              ? InferFieldType<TThenType>
              : InferFieldType<TElseType>
            : TSchema[Field] extends Value
              ? InferFieldType<TThenType>
              : InferFieldType<TElseType>
          : Op extends "!="
            ? TSchema[Field] extends Value
              ? InferFieldType<TElseType>
              : InferFieldType<TThenType>
            : Op extends "exists"
              ? InferFieldType<TThenType> // Field exists in schema
              : Op extends "!exists"
                ? InferFieldType<TElseType> // Field exists in schema
                : // For complex operators, use union type
                  InferFieldType<TThenType> | InferFieldType<TElseType>
        : InferFieldType<TThenType> | InferFieldType<TElseType>
      : InferFieldType<TThenType> | InferFieldType<TElseType>
    : InferFieldType<TThenType> | InferFieldType<TElseType>;

// ============================================================================
// ENHANCED SCHEMA FIELD TYPE INFERENCE - Better handling of complex types
// ============================================================================

export type InferSchemaFieldType<T, TSchema extends SchemaInterface = {}> =
  // Handle union values (most specific)
  T extends UnionValue<infer U>
    ? U[number]
    : // Handle constant values
      T extends ConstantValue
      ? T["const"]
      : T extends OptionalConstantValue
        ? T["const"] | undefined
        : // Handle conditional builder results
          T extends { __conditional: true; __inferredType: infer U }
          ? U
          : // Handle conditional syntax patterns
            T extends `when ${infer Condition} *? ${infer ThenType} : ${infer ElseType}`
            ? InferConditionalTypeAdvanced<
                Condition,
                ThenType,
                ElseType,
                TSchema
              >
            : T extends `when ${infer Condition} *? ${infer ThenType}`
              ? InferFieldType<ThenType>
              : T extends `when(${infer Condition}) then(${infer ThenType}) else(${infer ElseType})`
                ? InferConditionalTypeAdvanced<
                    Condition,
                    ThenType,
                    ElseType,
                    TSchema
                  >
                : T extends `when(${infer Condition}) then(${infer ThenType})`
                  ? InferFieldType<ThenType>
                  : T extends `${infer Condition} ? ${infer ThenType} : ${infer ElseType}`
                    ? InferConditionalTypeAdvanced<
                        Condition,
                        ThenType,
                        ElseType,
                        TSchema
                      >
                    : T extends `when:${infer Condition}:${infer ThenType}:${infer ElseType}`
                      ? InferConditionalTypeAdvanced<
                          Condition,
                          ThenType,
                          ElseType,
                          TSchema
                        >
                      : T extends `when:${infer Condition}:${infer ThenType}`
                        ? InferFieldType<ThenType>
                        : // Handle string field types
                          T extends string
                          ? InferFieldType<T>
                          : // Handle nested objects
                            T extends SchemaInterface
                            ? InferSchemaType<T>
                            : T extends OptionalSchemaInterface
                              ? InferSchemaType<T["schema"]> | undefined
                              : // Handle arrays
                                T extends readonly [infer U]
                                ? InferSchemaFieldType<U, TSchema>[]
                                : T extends (infer U)[]
                                  ? InferSchemaFieldType<U, TSchema>[]
                                  : // Enhanced fallback
                                    any;

// ============================================================================
// UTILITY TYPES - Enhanced with better optional field detection
// ============================================================================

// More comprehensive optional field detection
export type IsOptionalField<T> = T extends string
  ? T extends `${string}?`
    ? true
    : false
  : T extends OptionalConstantValue
    ? true
    : T extends OptionalSchemaInterface
      ? true
      : T extends { __optional: true }
        ? true
        : false;

// Enhanced required/optional field helpers
export type RequiredFields<T extends SchemaInterface> = {
  [K in keyof T]: IsOptionalField<T[K]> extends true ? never : K;
}[keyof T];

export type OptionalFields<T extends SchemaInterface> = {
  [K in keyof T]: IsOptionalField<T[K]> extends true ? K : never;
}[keyof T];

// ============================================================================
// MAIN SCHEMA TYPE INFERENCE - Enhanced with better performance
// ============================================================================

export type InferSchemaType<T extends SchemaInterface> = {
  [K in RequiredFields<T>]: InferSchemaFieldType<T[K], T>;
} & {
  [K in OptionalFields<T>]?: InferSchemaFieldType<T[K], T>;
};

// ============================================================================
// REVERSE TYPE MAPPING - Enhanced with better object handling
// ============================================================================

export type TypeToSchema<T> = T extends string
  ? "string"
  : T extends number
    ? "number"
    : T extends boolean
      ? "boolean"
      : T extends Date
        ? "date"
        : T extends string[]
          ? "string[]"
          : T extends number[]
            ? "number[]"
            : T extends boolean[]
              ? "boolean[]"
              : T extends Array<infer U>
                ? U extends string
                  ? "string[]"
                  : U extends number
                    ? "number[]"
                    : U extends boolean
                      ? "boolean[]"
                      : "any[]"
                : // Enhanced Record type detection
                  T extends Record<string, infer V>
                  ? V extends string
                    ? "record<string,string>"
                    : V extends number
                      ? "record<string,number>"
                      : V extends boolean
                        ? "record<string,boolean>"
                        : "record<string,any>"
                  : // Preserve complex named object types
                    T extends object
                    ? T
                    : "any";

// Enhanced interface generation from TypeScript types
export type InterfaceSchemaFromType<T> = {
  [K in keyof T]: TypeToSchema<T[K]>;
};

// ============================================================================
// EXTENSIBILITY HELPERS - For adding new features easily
// ============================================================================

// Type for custom type extensions
export interface CustomTypeRegistry {
  // Add custom types here, e.g.:
  // customType: CustomTypeDefinition;
}

// Helper for plugin-based type extensions
export type ExtendedBaseTypeMap = BaseTypeMap & CustomTypeRegistry;

// Future-proof conditional operator extensions
export interface CustomOperatorRegistry {
  // Add custom operators here, e.g.:
  // customOp: "custom_operation";
}

export type ExtendedOperatorMap = OperatorMap & CustomOperatorRegistry;

// ============================================================================
// PERFORMANCE OPTIMIZATIONS - Reduced recursion depth
// ============================================================================

// Cached type lookups for better performance
type TypeCache<T extends string> = T extends keyof BaseTypeMap
  ? BaseTypeMap[T]
  : never;

// Optimized union parsing with tail recursion optimization
type OptimizedParseUnion<
  T extends string,
  Acc extends string = never,
> = T extends `${infer First}|${infer Rest}`
  ? OptimizedParseUnion<Rest, Acc | First>
  : Acc | T;

// Export optimized versions for heavy usage
export type FastInferFieldType<T extends string> =
  TypeCache<T> extends never ? InferFieldType<T> : TypeCache<T>;

export type FastParseUnion<T extends string> = OptimizedParseUnion<T>;
