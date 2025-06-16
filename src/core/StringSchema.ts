import { BaseSchema } from "./BaseSchema";
import { SchemaValidationResult, StringSchemaOptions } from "./types/types";

/**
 * String schema with comprehensive validation options
 */
export class StringSchema extends BaseSchema<string> {
    private _minLength?: number;
    private _maxLength?: number;
    private _pattern?: RegExp;
    private _format?: "email" | "url" | "uuid" | "phone" | "slug" | "username";

    /**
     * Set minimum length
     */
    min(length: number): this {
        const cloned = this.clone();
        cloned._minLength = length;
        return cloned;
    }

    /**
     * Set maximum length
     */
    max(length: number): this {
        const cloned = this.clone();
        cloned._maxLength = length;
        return cloned;
    }

    /**
     * Set exact length
     */
    length(length: number): this {
        const cloned = this.clone();
        cloned._minLength = length;
        cloned._maxLength = length;
        return cloned;
    }

    /**
     * Set regex pattern
     */
    regex(pattern: RegExp): this {
        const cloned = this.clone();
        cloned._pattern = pattern;
        return cloned;
    }

    /**
     * Validate as email
     */
    email(): this {
        const cloned = this.clone();
        cloned._format = "email";
        return cloned;
    }

    /**
     * Validate as URL
     */
    url(): this {
        const cloned = this.clone();
        cloned._format = "url";
        return cloned;
    }

    /**
     * Validate as UUID
     */
    uuid(): this {
        const cloned = this.clone();
        cloned._format = "uuid";
        return cloned;
    }

    /**
     * Validate as phone number
     */
    phone(): this {
        const cloned = this.clone();
        cloned._format = "phone";
        return cloned;
    }

    /**
     * Validate as URL slug
     */
    slug(): this {
        const cloned = this.clone();
        cloned._format = "slug";
        return cloned;
    }

    /**
     * Validate as username
     */
    username(): this {
        const cloned = this.clone();
        cloned._format = "username";
        return cloned;
    }

    /**
     * Validate string value
     */
    validate(value: any): SchemaValidationResult<string> {
        // Handle common validation (undefined/null)
        const commonResult = this.handleCommonValidation(value);
        if (commonResult) {
            return commonResult;
        }

        const result: SchemaValidationResult<string> = {
            success: true,
            errors: [],
            warnings: [],
            data: undefined,
        };

        // Type check
        if (typeof value !== "string") {
            result.success = false;
            result.errors.push("Expected string");
            return result;
        }

        result.data = value;

        // Length validation
        if (this._minLength !== undefined && value.length < this._minLength) {
            result.success = false;
            result.errors.push(
                `String must be at least ${this._minLength} characters`
            );
        }

        if (this._maxLength !== undefined && value.length > this._maxLength) {
            result.success = false;
            result.errors.push(
                `String must be at most ${this._maxLength} characters`
            );
        }

        // Pattern validation
        if (this._pattern && !this._pattern.test(value)) {
            result.success = false;
            result.errors.push("String does not match required pattern");
        }

        // Format validation
        if (this._format) {
            try {
                this.validateFormat(value, this._format);
            } catch (error) {
                result.success = false;
                result.errors.push((error as Error).message);
            }
        }

        return result;
    }

    /**
     * Validate specific string formats
     */
    private validateFormat(value: string, format: string): void {
        switch (format) {
            case "email":
                this.validateEmail(value);
                break;
            case "url":
                this.validateURL(value);
                break;
            case "uuid":
                this.validateUUID(value);
                break;
            case "phone":
                this.validatePhone(value);
                break;
            case "slug":
                this.validateSlug(value);
                break;
            case "username":
                this.validateUsername(value);
                break;
            default:
                throw new Error(`Unknown format: ${format}`);
        }
    }

    /**
     * Basic email validation (can be enhanced with external validators)
     */
    private validateEmail(value: string): void {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            throw new Error("Invalid email format");
        }
    }

    /**
     * Basic URL validation
     */
    private validateURL(value: string): void {
        try {
            new URL(value);
        } catch {
            throw new Error("Invalid URL format");
        }
    }

    /**
     * Basic UUID validation
     */
    private validateUUID(value: string): void {
        const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(value)) {
            throw new Error("Invalid UUID format");
        }
    }

    /**
     * Basic phone validation
     */
    private validatePhone(value: string): void {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        const cleanPhone = value.replace(/[\s\-\(\)\.]/g, "");
        if (!phoneRegex.test(cleanPhone)) {
            throw new Error("Invalid phone number format");
        }
    }

    /**
     * Slug validation
     */
    private validateSlug(value: string): void {
        const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
        if (!slugRegex.test(value)) {
            throw new Error("Invalid slug format");
        }
    }

    /**
     * Username validation
     */
    private validateUsername(value: string): void {
        const usernameRegex = /^[a-zA-Z0-9_-]+$/;
        if (!usernameRegex.test(value)) {
            throw new Error("Invalid username format");
        }
    }

    /**
     * Get schema configuration
     */
    getConfig(): StringSchemaOptions {
        return {
            minLength: this._minLength,
            maxLength: this._maxLength,
            pattern: this._pattern,
            format: this._format,
            optional: this._optional,
            nullable: this._nullable,
            default: this._default,
        };
    }
}

