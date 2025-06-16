import { BaseSchema } from "./BaseSchema";
import { SchemaValidationResult, ObjectSchemaOptions } from "../../../types/types";

/**
 * Object schema with property validation
 */
export class ObjectSchema<T extends Record<string, any>> extends BaseSchema<T> {
    private _strict = false;
    private _allowUnknown = true;

    constructor(private shape: { [K in keyof T]: BaseSchema<T[K]> }) {
        super();
    }

    /**
     * Enable strict mode (no extra properties allowed)
     */
    strict(): this {
        const cloned = this.clone();
        cloned._strict = true;
        cloned._allowUnknown = false;
        return cloned;
    }

    /**
     * Allow unknown properties
     */
    allowUnknown(allow: boolean = true): this {
        const cloned = this.clone();
        cloned._allowUnknown = allow;
        return cloned;
    }

    /**
     * Validate object value
     */
    validate(value: any): SchemaValidationResult<T> {
        // Handle common validation (undefined/null)
        const commonResult = this.handleCommonValidation(value);
        if (commonResult) {
            return commonResult;
        }

        const result: SchemaValidationResult<T> = {
            success: true,
            errors: [],
            warnings: [],
            data: undefined,
        };

        // Type check
        if (typeof value !== "object" || Array.isArray(value)) {
            result.success = false;
            result.errors.push("Expected object");
            return result;
        }

        const validatedObject: any = {};
        const inputKeys = Object.keys(value);
        const shapeKeys = Object.keys(this.shape);

        // Validate each property in shape
        for (const [key, schema] of Object.entries(this.shape)) {
            const propResult = (schema as BaseSchema).validate(value[key]);

            if (!propResult.success) {
                result.success = false;
                result.errors.push(
                    `Property '${key}': ${propResult.errors.join(", ")}`
                );
            } else if (propResult.data !== undefined) {
                validatedObject[key] = propResult.data;
            }

            // Collect warnings from properties
            if (propResult.warnings.length > 0) {
                result.warnings.push(
                    ...propResult.warnings.map((w) => `Property '${key}': ${w}`)
                );
            }
        }

        // Handle extra properties
        const extraKeys = inputKeys.filter((key) => !shapeKeys.includes(key));

        if (extraKeys.length > 0) {
            if (this._strict) {
                result.success = false;
                result.errors.push(
                    `Unexpected properties: ${extraKeys.join(", ")}`
                );
            } else if (this._allowUnknown) {
                // Include unknown properties in result
                for (const key of extraKeys) {
                    validatedObject[key] = value[key];
                }
                if (extraKeys.length > 0) {
                    result.warnings.push(
                        `Unknown properties included: ${extraKeys.join(", ")}`
                    );
                }
            } else {
                result.warnings.push(
                    `Unknown properties ignored: ${extraKeys.join(", ")}`
                );
            }
        }

        if (result.success) {
            result.data = validatedObject as T;
        }

        return result;
    }

    /**
     * Clone the object schema with shape
     */
    protected clone(): this {
        const cloned = new ObjectSchema(this.shape) as this;
        cloned._strict = this._strict;
        cloned._allowUnknown = this._allowUnknown;
        cloned._optional = this._optional;
        cloned._nullable = this._nullable;
        cloned._default = this._default;
        return cloned;
    }

    /**
     * Get schema configuration
     */
    getConfig(): ObjectSchemaOptions & { properties: any } {
        const properties: any = {};
        for (const [key, schema] of Object.entries(this.shape)) {
            properties[key] = (schema as BaseSchema).getConfig();
        }

        return {
            strict: this._strict,
            allowUnknown: this._allowUnknown,
            optional: this._optional,
            nullable: this._nullable,
            default: this._default,
            properties,
        };
    }
}

