/**
 * TypeScript Interface-like Schema System
 *
 * The most intuitive way to define schemas - just like TypeScript interfaces!
 *
 * @example
 * ```typescript
 * import { Interface } from '@fortifyjs/core/schema';
 *
 * // Define schema like a TypeScript interface
 * const UserSchema = Interface({
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

/**
 * Type inference system for schema definitions
 */

// Helper type to parse union types recursively
type ParseUnion<T extends string> =
    T extends `${infer First}|${infer Rest}`
        ? First | ParseUnion<Rest>
        : T;

// Helper type to infer TypeScript types from string field types
type InferFieldType<T> =
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
type ParseWhenCondition<T extends string> =
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
type InferConditionalType<
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
type InferSchemaFieldType<T, TSchema extends SchemaInterface = {}> =
    // Handle union values first (most specific)
    T extends UnionValue<infer U> ? U[number] :
    // Handle constant values
    T extends ConstantValue ? T["const"] :
    T extends OptionalConstantValue ? T["const"] | undefined :
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
type IsOptionalField<T> =
    T extends string ? (T extends `${string}?` ? true : false) :
    false;

// Helper to get required fields
type RequiredFields<T extends SchemaInterface> = {
    [K in keyof T]: IsOptionalField<T[K]> extends true ? never : K
}[keyof T];

// Helper to get optional fields
type OptionalFields<T extends SchemaInterface> = {
    [K in keyof T]: IsOptionalField<T[K]> extends true ? K : never
}[keyof T];

// Main type to infer the complete schema type with proper optional handling and conditional context
type InferSchemaType<T extends SchemaInterface> =
    // Required fields with schema context for conditional types
    { [K in RequiredFields<T>]: InferSchemaFieldType<T[K], T> } &
    // Optional fields with schema context for conditional types
    { [K in OptionalFields<T>]?: InferSchemaFieldType<T[K], T> };

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
    return new InterfaceSchema<InferSchemaType<T>>(definition, options);
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

/**
 * Helper functions for creating schema values
 */
export const Make = {
    /**
     * Create a constant value (safer than using raw values)
     * @example
     * ```typescript
     * const schema = Interface({
     *   status: Make.const("pending"),
     *   version: Make.const(1.0),
     *   enabled: Make.const(true)
     * });
     * ```
     */
    const: <const T extends string | number | boolean>(value: T): ConstantValue & { const: T } => ({
        const: value,
    }),

    /**
     * Create a union type (multiple allowed values) with proper type inference
     * @example
     * ```typescript
     * const schema = Interface({
     *   status: Make.union("pending", "accepted", "rejected"),
     *   priority: Make.union("low", "medium", "high")
     * });
     * ```
     */
    union: <const T extends readonly string[]>(...values: T): UnionValue<T> => ({
        union: values,
    }),

    /**
     * Create an optional union type
     * @example
     * ```typescript
     * const schema = Interface({
     *   status: Make.unionOptional("pending", "accepted", "rejected")
     * });
     * ```
     */
    unionOptional: (...values: string[]): string => values.join("|") + "?",
};

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
export const Mod = {
    /**
     * Merge multiple schemas into a single schema
     * @example
     * ```typescript
     * const UserSchema = Interface({ id: "number", name: "string" });
     * const ProfileSchema = Interface({ bio: "string?", avatar: "url?" });
     *
     * const MergedSchema = Mod.merge(UserSchema, ProfileSchema);
     * // Result: { id: number, name: string, bio?: string, avatar?: string }
     * ```
     */
    merge<T, U>(
        schema1: InterfaceSchema<T>,
        schema2: InterfaceSchema<U>
    ): InterfaceSchema<T & U> {
        // Get the internal definitions from both schemas
        const def1 = (schema1 as any).definition as SchemaInterface;
        const def2 = (schema2 as any).definition as SchemaInterface;

        // Merge the definitions
        const mergedDefinition: SchemaInterface = {
            ...def1,
            ...def2
        };

        // Get options from both schemas (schema2 options take precedence)
        const options1 = (schema1 as any).options || {};
        const options2 = (schema2 as any).options || {};
        const mergedOptions = { ...options1, ...options2 };

        return new InterfaceSchema<T & U>(mergedDefinition, mergedOptions);
    },

    /**
     * Pick specific fields from a schema
     * @example
     * ```typescript
     * const UserSchema = Interface({
     *   id: "number",
     *   name: "string",
     *   email: "email",
     *   password: "string"
     * });
     *
     * const PublicUserSchema = Mod.pick(UserSchema, ["id", "name", "email"]);
     * // Result: { id: number, name: string, email: string }
     * ```
     */
    pick<T, K extends keyof T>(
        schema: InterfaceSchema<T>,
        keys: K[]
    ): InterfaceSchema<Pick<T, K>> {
        const definition = (schema as any).definition as SchemaInterface;
        const options = (schema as any).options || {};

        // Create new definition with only the picked keys
        const pickedDefinition: SchemaInterface = {};
        for (const key of keys) {
            const keyStr = key as string;
            if (keyStr in definition) {
                pickedDefinition[keyStr] = definition[keyStr];
            }
        }

        return new InterfaceSchema<Pick<T, K>>(pickedDefinition, options);
    },

    /**
     * Omit specific fields from a schema
     * @example
     * ```typescript
     * const UserSchema = Interface({
     *   id: "number",
     *   name: "string",
     *   email: "email",
     *   password: "string"
     * });
     *
     * const SafeUserSchema = Mod.omit(UserSchema, ["password"]);
     * // Result: { id: number, name: string, email: string }
     * ```
     */
    omit<T, K extends keyof T>(
        schema: InterfaceSchema<T>,
        keys: K[]
    ): InterfaceSchema<Omit<T, K>> {
        const definition = (schema as any).definition as SchemaInterface;
        const options = (schema as any).options || {};

        // Create new definition without the omitted keys
        const omittedDefinition: SchemaInterface = { ...definition };
        for (const key of keys) {
            const keyStr = key as string;
            delete omittedDefinition[keyStr];
        }

        return new InterfaceSchema<Omit<T, K>>(omittedDefinition, options);
    },

    /**
     * Make all fields in a schema optional
     * @example
     * ```typescript
     * const UserSchema = Interface({ id: "number", name: "string" });
     * const PartialUserSchema = Mod.partial(UserSchema);
     * // Result: { id?: number, name?: string }
     * ```
     */
    partial<T>(schema: InterfaceSchema<T>): InterfaceSchema<Partial<T>> {
        const definition = (schema as any).definition as SchemaInterface;
        const options = (schema as any).options || {};

        // Convert all fields to optional by adding "?" suffix
        const partialDefinition: SchemaInterface = {};
        for (const [key, value] of Object.entries(definition)) {
            if (typeof value === "string" && !value.endsWith("?")) {
                partialDefinition[key] = value + "?";
            } else {
                partialDefinition[key] = value;
            }
        }

        return new InterfaceSchema<Partial<T>>(partialDefinition, options);
    },

    /**
     * Make all fields in a schema required (remove optional markers)
     * @example
     * ```typescript
     * const UserSchema = Interface({ id: "number", name: "string?" });
     * const RequiredUserSchema = Mod.required(UserSchema);
     * // Result: { id: number, name: string }
     * ```
     */
    required<T>(schema: InterfaceSchema<T>): InterfaceSchema<Required<T>> {
        const definition = (schema as any).definition as SchemaInterface;
        const options = (schema as any).options || {};

        // Remove "?" suffix from all fields
        const requiredDefinition: SchemaInterface = {};
        for (const [key, value] of Object.entries(definition)) {
            if (typeof value === "string" && value.endsWith("?")) {
                requiredDefinition[key] = value.slice(0, -1);
            } else {
                requiredDefinition[key] = value;
            }
        }

        return new InterfaceSchema<Required<T>>(requiredDefinition, options);
    },

    /**
     * Extend a schema with additional fields
     * @example
     * ```typescript
     * const BaseSchema = Interface({ id: "number", name: "string" });
     * const ExtendedSchema = Mod.extend(BaseSchema, {
     *   email: "email",
     *   createdAt: "date"
     * });
     * // Result: { id: number, name: string, email: string, createdAt: Date }
     * ```
     */
    extend<T, U extends SchemaInterface>(
        schema: InterfaceSchema<T>,
        extension: U
    ): InterfaceSchema<T & InferSchemaType<U>> {
        const definition = (schema as any).definition as SchemaInterface;
        const options = (schema as any).options || {};

        const extendedDefinition: SchemaInterface = {
            ...definition,
            ...extension
        };

        return new InterfaceSchema<T & InferSchemaType<U>>(extendedDefinition, options);
    }
};


