
/**
 * Type inference system for schema definitions
 */

import { ConstantValue, OptionalConstantValue, OptionalSchemaInterface, UnionValue } from "../../../../types/SchemaValidator.type";
import { SchemaInterface } from "../Interface";

// Helper type to parse union types recursively
type ParseUnion<T extends string> =
    T extends `${infer First}|${infer Rest}`
        ? First | ParseUnion<Rest>
        : T;

// Helper type to infer TypeScript types from string field types
export type InferFieldType<T> =
    // Handle constant types FIRST (most specific) - "=admin", "=1.0", "=true"
    T extends `=${infer ConstValue}` ?
        ConstValue extends "true" ? true :
        ConstValue extends "false" ? false :
        ConstValue extends `${number}` ? number :
        ConstValue :
    T extends `=${infer ConstValue}?` ?
        ConstValue extends "true" ? true | undefined :
        ConstValue extends "false" ? false | undefined :
        ConstValue extends `${number}` ? number | undefined :
        ConstValue | undefined :

    // Handle "*?" syntax FIRST - "when condition *? then : else"
    T extends `when ${infer Condition} *? ${infer ThenType} : ${infer ElseType}` ?
        InferFieldType<ThenType> | InferFieldType<ElseType> :
    T extends `when ${infer Condition} *? ${infer ThenType}` ?
        InferFieldType<ThenType> :

    // Handle parentheses syntax SECOND - "when(condition) then(schema) else(schema)"
    T extends `when(${infer Condition}) then(${infer ThenType}) else(${infer ElseType})` ?
        InferFieldType<ThenType> | InferFieldType<ElseType> :
    T extends `when(${infer Condition}) then(${infer ThenType})` ?
        InferFieldType<ThenType> :


    // Handle union types THIRD - "active|inactive|pending"
    T extends `${string}|${string}` ? ParseUnion<T> :
    T extends `${string}|${string}?` ? ParseUnion<T extends `${infer U}?` ? U : T> | undefined :

    // Handle string literals (basic types)
    T extends "string" ? string :
    T extends "string?" ? string | undefined :
    T extends "number" ? number :
    T extends "number?" ? number | undefined :
    T extends "int" ? number :
    T extends "int?" ? number | undefined :
    T extends "float" ? number :
    T extends "float?" ? number | undefined :
    T extends "positive" ? number :
    T extends "positive?" ? number | undefined :
    T extends "boolean" ? boolean :
    T extends "boolean?" ? boolean | undefined :
    T extends "date" ? Date :
    T extends "date?" ? Date | undefined :
    T extends "email" ? string :
    T extends "email?" ? string | undefined :
    T extends "url" ? string :
    T extends "url?" ? string | undefined :
    T extends "uuid" ? string :
    T extends "uuid?" ? string | undefined :
    T extends "phone" ? string :
    T extends "phone?" ? string | undefined :
    T extends "slug" ? string :
    T extends "slug?" ? string | undefined :
    T extends "username" ? string :
    T extends "username?" ? string | undefined :
    T extends "any" ? any :
    T extends "any?" ? any | undefined :

    // Record types - Record<string, T> and Record<K, T>
    T extends `record<string,${infer ValueType}>` ? Record<string, InferFieldType<ValueType>> :
    T extends `record<string,${infer ValueType}>?` ? Record<string, InferFieldType<ValueType>> | undefined :
    T extends `record<${infer KeyType},${infer ValueType}>` ? Record<string, InferFieldType<ValueType>> :
    T extends `record<${infer KeyType},${infer ValueType}>?` ? Record<string, InferFieldType<ValueType>> | undefined :

    // Array types
    T extends "string[]" ? string[] :
    T extends "string[]?" ? string[] | undefined :
    T extends "number[]" ? number[] :
    T extends "number[]?" ? number[] | undefined :
    T extends "int[]" ? number[] :
    T extends "int[]?" ? number[] | undefined :
    T extends "boolean[]" ? boolean[] :
    T extends "boolean[]?" ? boolean[] | undefined :
    T extends "email[]" ? string[] :
    T extends "email[]?" ? string[] | undefined :
    T extends "url[]" ? string[] :
    T extends "url[]?" ? string[] | undefined :
    T extends "any[]" ? any[] :
    T extends "any[]?" ? any[] | undefined :

    // Constraint syntax patterns (more specific patterns first)
    T extends `string(${string})` ? string :
    T extends `string(${string})?` ? string | undefined :
    T extends `number(${string})` ? number :
    T extends `number(${string})?` ? number | undefined :
    T extends `int(${string})` ? number :
    T extends `int(${string})?` ? number | undefined :
    T extends `string[](${string})` ? string[] :
    T extends `string[](${string})?` ? string[] | undefined :
    T extends `number[](${string})` ? number[] :
    T extends `number[](${string})?` ? number[] | undefined :
    T extends `int[](${string})` ? number[] :
    T extends `int[](${string})?` ? number[] | undefined :

    // Regex patterns
    T extends `string(/${string}/)` ? string :
    T extends `string(/${string}/)?` ? string | undefined :

    // Fallback for unknown types
    any;

// Advanced conditional type parser for "when" syntax
export type ParseWhenCondition<T extends string> =
    T extends `${infer Field}=${infer Value}` ? { field: Field; operator: "="; value: Value } :
    T extends `${infer Field}!=${infer Value}` ? { field: Field; operator: "!="; value: Value } :
    T extends `${infer Field}>${infer Value}` ? { field: Field; operator: ">"; value: Value } :
    T extends `${infer Field}<${infer Value}` ? { field: Field; operator: "<"; value: Value } :
    T extends `${infer Field}>=${infer Value}` ? { field: Field; operator: ">="; value: Value } :
    T extends `${infer Field}<=${infer Value}` ? { field: Field; operator: "<="; value: Value } :
    T extends `${infer Field}.exists` ? { field: Field; operator: "exists"; value: true } :
    T extends `${infer Field}.in(${infer Values})` ? { field: Field; operator: "in"; value: Values } :
    never;



// Smart conditional type inference that evaluates conditions when possible
export type InferConditionalType<
    TCondition extends string,
    TThenType extends string,
    TElseType extends string,
    TSchema extends SchemaInterface
> = ParseWhenCondition<TCondition> extends { field: infer Field; operator: infer Op; value: infer Value }
    ? Field extends keyof TSchema
        ? TSchema[Field] extends string
            ? Op extends "="
                ? TSchema[Field] extends `${string}|${string}`
                    ? Value extends ParseUnion<TSchema[Field]>
                        ? InferFieldType<TThenType>  // Condition can be true
                        : InferFieldType<TElseType>  // Condition is definitely false
                    : TSchema[Field] extends Value
                        ? InferFieldType<TThenType>  // Exact match
                        : InferFieldType<TElseType>  // No match
                : Op extends "!="
                    ? TSchema[Field] extends Value
                        ? InferFieldType<TElseType>  // Condition is false (values match)
                        : InferFieldType<TThenType>  // Condition is true (values don't match)
                : InferFieldType<TThenType> | InferFieldType<TElseType>  // Complex conditions - use union
            : InferFieldType<TThenType> | InferFieldType<TElseType>  // Non-string field - use union
        : InferFieldType<TThenType> | InferFieldType<TElseType>  // Field not in schema - use union
    : InferFieldType<TThenType> | InferFieldType<TElseType>;  // Can't parse condition - use union

// Helper type to infer types from schema field values with conditional support
export type InferSchemaFieldType<T, TSchema extends SchemaInterface = {}> =
    // Handle union values first (most specific)
    T extends UnionValue<infer U> ? U[number] :
    // Handle constant values
    T extends ConstantValue ? T["const"] :
    T extends OptionalConstantValue ? T["const"] | undefined :
    // Handle When.field() builder results
    T extends { __conditional: true; __inferredType: infer U } ? U :
    // Handle revolutionary "*?" syntax FIRST
    T extends `when ${infer Condition} *? ${infer ThenType} : ${infer ElseType}` ?
        InferConditionalType<Condition, ThenType, ElseType, TSchema> :
    T extends `when ${infer Condition} *? ${infer ThenType}` ?
        InferFieldType<ThenType> :

    // Handle parentheses syntax SECOND
    T extends `when(${infer Condition}) then(${infer ThenType}) else(${infer ElseType})` ?
        InferConditionalType<Condition, ThenType, ElseType, TSchema> :
    T extends `when(${infer Condition}) then(${infer ThenType})` ?
        InferFieldType<ThenType> :

    // Handle legacy conditional "when:" syntax THIRD
    T extends `when:${infer Condition}:${infer ThenType}:${infer ElseType}` ?
        InferConditionalType<Condition, ThenType, ElseType, TSchema> :
    T extends `when:${infer Condition}:${infer ThenType}` ?
        InferFieldType<ThenType> :
    // Handle string field types (including union types)
    T extends string ? InferFieldType<T> :
    // Handle nested objects
    T extends SchemaInterface ? InferSchemaType<T> :
    // Handle optional nested objects
    T extends OptionalSchemaInterface ? InferSchemaType<T["schema"]> | undefined :
    // Handle array schemas [elementType]
    T extends readonly [infer U] ? InferSchemaFieldType<U, TSchema>[] :
    T extends (infer U)[] ? InferSchemaFieldType<U, TSchema>[] :
    // Fallback
    any;

// Helper to check if a field is optional
export type IsOptionalField<T> =
    T extends string ? (T extends `${string}?` ? true : false) :
    false;

// Helper to get required fields
export type RequiredFields<T extends SchemaInterface> = {
    [K in keyof T]: IsOptionalField<T[K]> extends true ? never : K
}[keyof T];

// Helper to get optional fields
export type OptionalFields<T extends SchemaInterface> = {
    [K in keyof T]: IsOptionalField<T[K]> extends true ? K : never
}[keyof T];

// Main type to infer the complete schema type with proper optional handling and conditional context
export type InferSchemaType<T extends SchemaInterface> =
    // Required fields with schema context for conditional types
    { [K in RequiredFields<T>]: InferSchemaFieldType<T[K], T> } &
    // Optional fields with schema context for conditional types
    { [K in OptionalFields<T>]?: InferSchemaFieldType<T[K], T> };



export type TypeToSchema<T> =
    T extends string ? "string" :
    T extends number ? "number" :
    T extends boolean ? "boolean" :
    T extends Date ? "date" :
    T extends string[] ? "string[]" :
    T extends number[] ? "number[]" :
    T extends boolean[] ? "boolean[]" :
    T extends Array<string> ? "string[]" :
    T extends Array<number> ? "number[]" :
    T extends Array<boolean> ? "boolean[]" :
    // Check for specific Record patterns ONLY if they're explicitly Record types with index signatures
    T extends Record<string, string> & { [K in keyof T]: string } ? "record<string,string>" :
    T extends Record<string, number> & { [K in keyof T]: number } ? "record<string,number>" :
    T extends Record<string, boolean> & { [K in keyof T]: boolean } ? "record<string,boolean>" :
    // For complex named object types (like User, Product, etc.), preserve the original type!
    // This must come BEFORE the generic Record<string, any> check
    T extends object ? T :
    "any";

// Type to automatically generate schema interface from TypeScript type
export type InterfaceSchemaFromType<T> = {
    [K in keyof T]: TypeToSchema<T[K]>
};