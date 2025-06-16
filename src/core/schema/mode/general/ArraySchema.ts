import { BaseSchema } from "./BaseSchema";
import { SchemaValidationResult, ArraySchemaOptions } from "../../../types/types";

/**
 * Array schema with element validation
 */
export class ArraySchema<T> extends BaseSchema<T[]> {
    private _minLength?: number;
    private _maxLength?: number;
    private _unique = false;

    constructor(private elementSchema: BaseSchema<T>) {
        super();
    }

    /**
     * Set minimum array length
     */
    min(length: number): this {
        const cloned = this.clone();
        cloned._minLength = length;
        return cloned;
    }

    /**
     * Set maximum array length
     */
    max(length: number): this {
        const cloned = this.clone();
        cloned._maxLength = length;
        return cloned;
    }

    /**
     * Set exact array length
     */
    length(length: number): this {
        const cloned = this.clone();
        cloned._minLength = length;
        cloned._maxLength = length;
        return cloned;
    }

    /**
     * Require unique elements
     */
    unique(): this {
        const cloned = this.clone();
        cloned._unique = true;
        return cloned;
    }

    /**
     * Validate array value
     */
    validate(value: any): SchemaValidationResult<T[]> {
        // Handle common validation (undefined/null)
        const commonResult = this.handleCommonValidation(value);
        if (commonResult) {
            return commonResult;
        }

        const result: SchemaValidationResult<T[]> = {
            success: true,
            errors: [],
            warnings: [],
            data: undefined,
        };

        // Type check
        if (!Array.isArray(value)) {
            result.success = false;
            result.errors.push("Expected array");
            return result;
        }

        // Length validation
        if (this._minLength !== undefined && value.length < this._minLength) {
            result.success = false;
            result.errors.push(
                `Array must have at least ${this._minLength} elements`
            );
        }

        if (this._maxLength !== undefined && value.length > this._maxLength) {
            result.success = false;
            result.errors.push(
                `Array must have at most ${this._maxLength} elements`
            );
        }

        // Validate each element
        const validatedArray: T[] = [];
        let hasElementErrors = false;

        for (let i = 0; i < value.length; i++) {
            const elementResult = this.elementSchema.validate(value[i]);

            if (!elementResult.success) {
                result.success = false;
                hasElementErrors = true;
                result.errors.push(
                    `Element ${i}: ${elementResult.errors.join(", ")}`
                );
            } else {
                validatedArray.push(elementResult.data!);
            }

            // Collect warnings from elements
            if (elementResult.warnings.length > 0) {
                result.warnings.push(
                    ...elementResult.warnings.map((w) => `Element ${i}: ${w}`)
                );
            }
        }

        // Only check uniqueness if no element validation errors
        if (!hasElementErrors && this._unique) {
            const uniqueSet = new Set(
                validatedArray.map((item) => JSON.stringify(item))
            );
            if (uniqueSet.size !== validatedArray.length) {
                result.success = false;
                result.errors.push("Array elements must be unique");
            }
        }

        if (result.success) {
            result.data = validatedArray;
        }

        return result;
    }

    /**
     * Clone the array schema with element schema
     */
    protected clone(): this {
        const cloned = new ArraySchema(this.elementSchema) as this;
        cloned._minLength = this._minLength;
        cloned._maxLength = this._maxLength;
        cloned._unique = this._unique;
        cloned._optional = this._optional;
        cloned._nullable = this._nullable;
        cloned._default = this._default;
        return cloned;
    }

    /**
     * Get schema configuration
     */
    getConfig(): ArraySchemaOptions & { elementSchema: any } {
        return {
            minLength: this._minLength,
            maxLength: this._maxLength,
            unique: this._unique,
            optional: this._optional,
            nullable: this._nullable,
            default: this._default,
            elementSchema: this.elementSchema.getConfig(),
        };
    }
}

