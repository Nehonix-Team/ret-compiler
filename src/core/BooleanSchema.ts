import { BaseSchema } from "./BaseSchema";
import { SchemaValidationResult, BooleanSchemaOptions } from "./types/types";

/**
 * Boolean schema with smart type conversion
 */
export class BooleanSchema extends BaseSchema<boolean> {
    private _strict = false;

    /**
     * Enable strict mode (only accept actual boolean values)
     */
    strict(): this {
        const cloned = this.clone();
        cloned._strict = true;
        return cloned;
    }

    /**
     * Validate boolean value
     */
    validate(value: any): SchemaValidationResult<boolean> {
        // Handle common validation (undefined/null)
        const commonResult = this.handleCommonValidation(value);
        if (commonResult) {
            return commonResult;
        }

        const result: SchemaValidationResult<boolean> = {
            success: true,
            errors: [],
            warnings: [],
            data: undefined,
        };

        // Strict mode - only accept actual booleans
        if (this._strict) {
            if (typeof value !== "boolean") {
                result.success = false;
                result.errors.push("Expected boolean (strict mode)");
                return result;
            }
            result.data = value;
            return result;
        }

        // Type check and conversion
        if (typeof value === "boolean") {
            result.data = value;
        } else if (typeof value === "string") {
            const lower = value.toLowerCase().trim();
            if (
                lower === "true" ||
                lower === "1" ||
                lower === "yes" ||
                lower === "on"
            ) {
                result.data = true;
                result.warnings.push("String converted to boolean");
            } else if (
                lower === "false" ||
                lower === "0" ||
                lower === "no" ||
                lower === "off"
            ) {
                result.data = false;
                result.warnings.push("String converted to boolean");
            } else {
                result.success = false;
                result.errors.push("Invalid boolean string value");
            }
        } else if (typeof value === "number") {
            result.data = Boolean(value);
            result.warnings.push("Number converted to boolean");
        } else {
            result.success = false;
            result.errors.push("Expected boolean");
        }

        return result;
    }

    /**
     * Get schema configuration
     */
    getConfig(): BooleanSchemaOptions {
        return {
            strict: this._strict,
            optional: this._optional,
            nullable: this._nullable,
            default: this._default,
        };
    }
}

