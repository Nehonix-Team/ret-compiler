import { SchemaValidationResult, BaseSchemaOptions } from "./types/types";

/**
 * Abstract base class for all schema types
 * Provides common functionality for validation, optional/nullable handling, and defaults
 */
export abstract class BaseSchema<T = any> {
    protected _optional = false;
    protected _nullable = false;
    protected _default?: T;

    /**
     * Make this field optional
     */
    optional(): this {
        this._optional = true;
        return this;
    }

    /**
     * Make this field nullable
     */
    nullable(): this {
        this._nullable = true;
        return this;
    }

    /**
     * Set default value
     */
    default(value: T): this {
        this._default = value;
        return this;
    }

    /**
     * Handle common validation logic for undefined/null values
     * @param value - Value to check
     * @returns Validation result or null if should continue with type-specific validation
     */
    protected handleCommonValidation(
        value: any
    ): SchemaValidationResult<T> | null {
        // Handle undefined
        if (value === undefined) {
            if (this._optional) {
                return {
                    success: true,
                    data: this._default,
                    errors: [],
                    warnings: [],
                };
            }
            return {
                success: false,
                data: undefined,
                errors: ["Required field is missing"],
                warnings: [],
            };
        }

        // Handle null
        if (value === null) {
            if (this._nullable) {
                return {
                    success: true,
                    data: null as any,
                    errors: [],
                    warnings: [],
                };
            }
            return {
                success: false,
                data: undefined,
                errors: ["Field cannot be null"],
                warnings: [],
            };
        }

        return null; // Continue with type-specific validation
    }

    /**
     * Validate a value against this schema
     */
    abstract validate(value: any): SchemaValidationResult<T>;

    /**
     * Parse and validate (throws on error)
     */
    parse(value: any): T {
        const result = this.validate(value);
        if (!result.success) {
            throw new Error(
                `Schema validation failed: ${result.errors.join(", ")}`
            );
        }
        return result.data!;
    }

    /**
     * Safe parse (returns result object)
     */
    safeParse(value: any): SchemaValidationResult<T> {
        return this.validate(value);
    }

    /**
     * Create a copy of this schema with additional options
     */
    protected clone(): this {
        const cloned = Object.create(Object.getPrototypeOf(this));
        Object.assign(cloned, this);
        return cloned;
    }

    /**
     * Get schema configuration for serialization/debugging
     */
    abstract getConfig(): any;
}

