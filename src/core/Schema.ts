import { StringSchema } from "./StringSchema";
import { NumberSchema } from "./NumberSchema";
import { BooleanSchema } from "./BooleanSchema";
import { ArraySchema } from "./ArraySchema";
import { ObjectSchema } from "./ObjectSchema";
import { BaseSchema } from "./BaseSchema";

/**
 * Main Schema factory - TypeScript-like schema validation
 *
 * Provides a clean, modular API for creating validation schemas without
 * mixing validation logic with schema definition logic.
 *
 * @example
 * ```typescript
 * import { Schema } from '@fortifyjs/core/schema';
 *
 * // Define a user schema
 * const UserSchema = Schema.object({
 *   id: Schema.number().int().positive(),
 *   email: Schema.string().email(),
 *   name: Schema.string().min(2).max(50),
 *   age: Schema.number().int().min(0).max(120).optional(),
 *   isActive: Schema.boolean().default(true),
 *   tags: Schema.array(Schema.string()).max(10).optional()
 * });
 *
 * // Validate data
 * const result = UserSchema.safeParse({
 *   id: 1,
 *   email: 'user@example.com',
 *   name: 'John Doe',
 *   isActive: true
 * });
 *
 * if (result.success) {
 *   console.log('Valid user:', result.data);
 * } else {
 *   console.log('Validation errors:', result.errors);
 * }
 * ```
 */
export const Schema = {
    /**
     * Create a string schema
     *
     * @example
     * ```typescript
     * const nameSchema = Schema.string().min(2).max(50);
     * const emailSchema = Schema.string().email();
     * const slugSchema = Schema.string().slug();
     * ```
     */
    string(): StringSchema {
        return new StringSchema();
    },

    /**
     * Create a number schema
     *
     * @example
     * ```typescript
     * const ageSchema = Schema.number().int().min(0).max(120);
     * const priceSchema = Schema.number().positive().precision(2);
     * const idSchema = Schema.number().int().positive();
     * ```
     */
    number(): NumberSchema {
        return new NumberSchema();
    },

    /**
     * Create a boolean schema
     *
     * @example
     * ```typescript
     * const activeSchema = Schema.boolean().default(true);
     * const strictBoolSchema = Schema.boolean().strict();
     * ```
     */
    boolean(): BooleanSchema {
        return new BooleanSchema();
    },

    /**
     * Create an array schema
     *
     * @example
     * ```typescript
     * const tagsSchema = Schema.array(Schema.string()).min(1).max(10);
     * const numbersSchema = Schema.array(Schema.number()).unique();
     * const usersSchema = Schema.array(UserSchema);
     * ```
     */
    array<T>(elementSchema: BaseSchema<T>): ArraySchema<T> {
        return new ArraySchema(elementSchema);
    },

    /**
     * Create an object schema
     *
     * @example
     * ```typescript
     * const userSchema = Schema.object({
     *   id: Schema.number().int(),
     *   name: Schema.string(),
     *   email: Schema.string().email()
     * });
     *
     * const strictSchema = Schema.object({
     *   id: Schema.number()
     * }).strict(); // No extra properties
     * ```
     */
    object<T extends Record<string, any>>(shape: {
        [K in keyof T]: BaseSchema<T[K]>;
    }): ObjectSchema<T> {
        return new ObjectSchema(shape);
    },

    /**
     * Create a custom schema with validation function
     *
     * @example
     * ```typescript
     * const customSchema = Schema.custom<string>((value) => {
     *   if (typeof value !== 'string') {
     *     throw new Error('Expected string');
     *   }
     *   if (!value.startsWith('custom_')) {
     *     throw new Error('Must start with custom_');
     *   }
     *   return value;
     * });
     * ```
     */
    custom<T>(validator: (value: any) => T): BaseSchema<T> {
        return new CustomSchema(validator);
    },
};

/**
 * Custom schema implementation
 */
class CustomSchema<T> extends BaseSchema<T> {
    constructor(private validator: (value: any) => T) {
        super();
    }

    validate(value: any) {
        // Handle common validation (undefined/null)
        const commonResult = this.handleCommonValidation(value);
        if (commonResult) {
            return commonResult;
        }

        const result = {
            success: true,
            errors: [] as string[],
            warnings: [] as string[],
            data: undefined as T | undefined,
        };

        try {
            result.data = this.validator(value);
        } catch (error) {
            result.success = false;
            result.errors.push((error as Error).message);
        }

        return result;
    }

    getConfig() {
        return {
            type: "custom",
            optional: this._optional,
            nullable: this._nullable,
            default: this._default,
        };
    }
}

// Re-export all schema types for convenience
export {
    BaseSchema,
    StringSchema,
    NumberSchema,
    BooleanSchema,
    ArraySchema,
    ObjectSchema,
};

// Re-export types
export type {
    SchemaValidationResult,
    StringSchemaOptions,
    NumberSchemaOptions,
    BooleanSchemaOptions,
    ArraySchemaOptions,
    ObjectSchemaOptions,
} from "./types/types";

