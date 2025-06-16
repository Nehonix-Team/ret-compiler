import { BaseSchema } from "./BaseSchema";
import { SchemaValidationResult, NumberSchemaOptions } from "../../../types/types";

/**
 * Number schema with comprehensive validation options
 */
export class NumberSchema extends BaseSchema<number> {
    private _min?: number;
    private _max?: number;
    private _integer = false;
    private _positive = false;
    private _precision?: number;

    /**
     * Set minimum value
     */
    min(value: number): this {
        const cloned = this.clone();
        cloned._min = value;
        return cloned;
    }

    /**
     * Set maximum value
     */
    max(value: number): this {
        const cloned = this.clone();
        cloned._max = value;
        return cloned;
    }

    /**
     * Require integer values only
     */
    int(): this {
        const cloned = this.clone();
        cloned._integer = true;
        return cloned;
    }

    /**
     * Require positive values only
     */
    positive(): this {
        const cloned = this.clone();
        cloned._positive = true;
        return cloned;
    }

    /**
     * Set maximum decimal precision
     */
    precision(digits: number): this {
        const cloned = this.clone();
        cloned._precision = digits;
        return cloned;
    }

    /**
     * Validate number value
     */
    validate(value: any): SchemaValidationResult<number> {
        // Handle common validation (undefined/null)
        const commonResult = this.handleCommonValidation(value);
        if (commonResult) {
            return commonResult;
        }

        const result: SchemaValidationResult<number> = {
            success: true,
            errors: [],
            warnings: [],
            data: undefined,
        };

        // Type check and conversion
        let num: number;
        if (typeof value === "string") {
            num = parseFloat(value);
            if (value.trim() !== "" && !isNaN(num)) {
                result.warnings.push("String converted to number");
            }
        } else {
            num = value;
        }

        if (typeof num !== "number" || isNaN(num) || !isFinite(num)) {
            result.success = false;
            result.errors.push("Expected number");
            return result;
        }

        result.data = num;

        // Integer validation
        if (this._integer && num % 1 !== 0) {
            result.success = false;
            result.errors.push("Expected integer");
        }

        // Range validation
        if (this._min !== undefined && num < this._min) {
            result.success = false;
            result.errors.push(`Number must be at least ${this._min}`);
        }

        if (this._max !== undefined && num > this._max) {
            result.success = false;
            result.errors.push(`Number must be at most ${this._max}`);
        }

        // Positive validation
        if (this._positive && num <= 0) {
            result.success = false;
            result.errors.push("Number must be positive");
        }

        // Precision validation
        if (this._precision !== undefined) {
            const decimalPlaces = (num.toString().split(".")[1] || "").length;
            if (decimalPlaces > this._precision) {
                result.success = false;
                result.errors.push(
                    `Number must have at most ${this._precision} decimal places`
                );
            }
        }

        return result;
    }

    /**
     * Get schema configuration
     */
    getConfig(): NumberSchemaOptions {
        return {
            min: this._min,
            max: this._max,
            integer: this._integer,
            positive: this._positive,
            precision: this._precision,
            optional: this._optional,
            nullable: this._nullable,
            default: this._default,
        };
    }
}

