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
    SchemaInterface,
    SchemaOptions,
} from "./types/SchemaValidator.type";

/**
 * Create a schema using TypeScript interface-like syntax
 *
 * @param definition - Schema definition using TypeScript-like syntax
 * @param options - Optional validation options
 * @returns InterfaceSchema instance
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
 * ```
 *
 * @example With Constants
 * ```typescript
 * const APIResponseSchema = Interface({
 *   version: "1.0",           // Constant string
 *   status: 200,              // Constant number
 *   data: {
 *     users: "any[]",
 *     total: "number"
 *   }
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
 *
 * @example With Options
 * ```typescript
 * const StrictUserSchema = Interface({
 *   id: "number",
 *   name: "string"
 * }).strict(); // No extra properties allowed
 *
 * const UserWithDefaults = Interface({
 *   name: "string",
 *   role: "string?"
 * }).options({
 *   default: { role: "user" }
 * });
 * ```
 */
export function Interface<T = any>(
    definition: SchemaInterface,
    options?: SchemaOptions
): InterfaceSchema<T> {
    return new InterfaceSchema<T>(definition, options);
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

// Re-export types for convenience
export type {
    SchemaInterface,
    SchemaOptions,
    SchemaFieldType,
    ConstantValue,
} from "./types/SchemaValidator.type";
export { InterfaceSchema } from "./InterfaceSchema";

/**
 * Helper functions for creating schema values
 */
export const SchemaHelpers = {
    /**
     * Create a constant value (safer than using raw values)
     * @example
     * ```typescript
     * const schema = Interface({
     *   status: SchemaHelpers.const("pending"),
     *   version: SchemaHelpers.const(1.0),
     *   enabled: SchemaHelpers.const(true)
     * });
     * ```
     */
    const: <T extends string | number | boolean>(value: T): ConstantValue => ({
        const: value,
    }),

    /**
     * Create a union type (multiple allowed values)
     * @example
     * ```typescript
     * const schema = Interface({
     *   status: SchemaHelpers.union("pending", "accepted", "rejected"),
     *   priority: SchemaHelpers.union("low", "medium", "high")
     * });
     * ```
     */
    union: (...values: string[]): string => values.join("|"),

    /**
     * Create an optional union type
     * @example
     * ```typescript
     * const schema = Interface({
     *   status: SchemaHelpers.unionOptional("pending", "accepted", "rejected")
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
 * Schema validation utilities
 */
export const SchemaUtils = {
    /**
     * Merge multiple schemas
     */
    merge<T, U>(
        schema1: InterfaceSchema<T>,
        schema2: InterfaceSchema<U>
    ): InterfaceSchema<T & U> {
        // Implementation would merge schema definitions
        throw new Error("Not implemented yet");
    },

    /**
     * Pick specific fields from a schema
     */
    pick<T, K extends keyof T>(
        schema: InterfaceSchema<T>,
        keys: K[]
    ): InterfaceSchema<Pick<T, K>> {
        // Implementation would create new schema with only specified keys
        throw new Error("Not implemented yet");
    },

    /**
     * Omit specific fields from a schema
     */
    omit<T, K extends keyof T>(
        schema: InterfaceSchema<T>,
        keys: K[]
    ): InterfaceSchema<Omit<T, K>> {
        // Implementation would create new schema without specified keys
        throw new Error("Not implemented yet");
    },
};


