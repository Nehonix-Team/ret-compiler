/**
 * FortifyJS Schema Validation System
 *
 * A modular, TypeScript-like schema validation system that's easier to use than Zod.
 * Completely separate from validators - focused purely on schema definition and validation.
 *
 * ## Two Approaches:
 *
 * ### 1. Interface-based (Recommended - TypeScript-like)
 * ```typescript
 * import { Interface } from '@fortifyjs/core/schema';
 *
 * const UserSchema = Interface({
 *   id: "number",
 *   email: "email",
 *   name: "string",
 *   age: "number?",           // Optional
 *   isActive: "boolean?",     // Optional
 *   tags: "string[]?",        // Optional array
 *   role: "admin"             // Constant value
 * });
 *
 * const result = UserSchema.safeParse(userData);
 * ```
 *
 * ### 2. Fluent API (Traditional)
 * ```typescript
 * import { Schema } from '@fortifyjs/core/schema';
 *
 * const UserSchema = Schema.object({
 *   id: Schema.number().int().positive(),
 *   email: Schema.string().email(),
 *   name: Schema.string().min(2).max(50),
 *   age: Schema.number().int().min(0).max(120).optional(),
 *   isActive: Schema.boolean().default(true)
 * });
 *
 * const result = UserSchema.safeParse(userData);
 * ```
 */

// Interface-based Schema (Recommended)
export { Interface, FieldTypes, QuickSchemas, SchemaUtils } from "./Interface";
export type { InferType, SchemaInterface, SchemaFieldType } from "./Interface";

// Traditional fluent API Schema
export { Schema } from "./Schema";

// Base classes for extending
export { BaseSchema } from "./BaseSchema";

// Individual schema types
export { StringSchema } from "./StringSchema";
export { NumberSchema } from "./NumberSchema";
export { BooleanSchema } from "./BooleanSchema";
export { ArraySchema } from "./ArraySchema";
export { ObjectSchema } from "./ObjectSchema";

// Type definitions
export type {
    SchemaValidationResult,
    BaseSchemaOptions,
    StringSchemaOptions,
    NumberSchemaOptions,
    BooleanSchemaOptions,
    ArraySchemaOptions,
    ObjectSchemaOptions,
    SchemaType,
    SchemaDefinition,
    SchemaConfig,
} from "./types/types";

