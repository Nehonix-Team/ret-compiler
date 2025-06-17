/**
 * TypeScript Interface-like Schema Definition System
 *
 * Allows defining schemas using TypeScript-like syntax with string literals
 * that feel natural and are much easier to read and write.
 */

import {
    ConstantValue,
    OptionalConstantValue,
    SchemaInterface,
    SchemaFieldType,
    OptionalSchemaInterface,
    SchemaOptions,
    UnionValue,
} from "../../../types/SchemaValidator.type";
import { SchemaValidationResult } from "../../../types/types";
import { ConditionalSyntaxUtils } from "../../extensions/components/ConditionalValidation/utils/SyntaxParser";

/**
 * Interface Schema class for TypeScript-like schema definitions
 */
// Helper type for schemas that allow unknown properties
type AllowUnknownSchema<T> = T & Record<string, any>;

export class InterfaceSchema<T = any> {
    constructor(
        private definition: SchemaInterface,
        private options: SchemaOptions = {}
    ) {}



    /**
     * Validate data against the interface schema
     */
    validate(data: any): SchemaValidationResult<T> {
        const result: SchemaValidationResult<T> = {
            success: true,
            errors: [],
            warnings: [],
            data: undefined,
        };

        if (typeof data !== "object" || data === null || Array.isArray(data)) {
            result.success = false;
            result.errors.push("Expected object");
            return result;
        }

        const validatedData: any = {};
        const inputKeys = Object.keys(data);
        const schemaKeys = Object.keys(this.definition);

        // Validate each field in the schema
        for (const [key, fieldType] of Object.entries(this.definition)) {
            let fieldResult: SchemaValidationResult;

            // Handle conditional fields with full data context
            if (typeof fieldType === "string" && ConditionalSyntaxUtils.isConditional(fieldType)) {
                const conditionalConfig = ConditionalSyntaxUtils.parse(fieldType);
                if (conditionalConfig) {
                    fieldResult = this.validateConditionalFieldWithContext(conditionalConfig, data[key], data);
                } else {
                    fieldResult = this.validateField(key, fieldType, data[key]);
                }
            } else if (this.isConditionalValidation(fieldType)) {
                fieldResult = this.validateConditionalFieldWithContext(fieldType, data[key], data);
            } else {
                fieldResult = this.validateField(key, fieldType, data[key]);
            }

            if (!fieldResult.success) {
                result.success = false;
                result.errors.push(
                    ...fieldResult.errors.map((err) => `${key}: ${err}`)
                );
            } else if (fieldResult.data !== undefined) {
                validatedData[key] = fieldResult.data;
            }

            result.warnings.push(
                ...fieldResult.warnings.map((warn) => `${key}: ${warn}`)
            );
        }

        // Handle extra properties - STRICT BY DEFAULT (like TypeScript)
        const extraKeys = inputKeys.filter(
            (key) => !schemaKeys.includes(key)
        );

        if (extraKeys.length > 0) {
            if (this.options.allowUnknown === true) {
                // Explicitly allow unknown properties
                for (const key of extraKeys) {
                    validatedData[key] = data[key];
                }
            } else {
                // Strict by default - reject unknown properties
                result.success = false;
                result.errors.push(
                    `Unexpected properties: ${extraKeys.join(", ")}`
                );
            }
        }

        if (result.success) {
            result.data = validatedData as T;
        }

        return result;
    }

    /**
     * Validate individual field
     */
    private validateField(
        _key: string,
        fieldType: SchemaFieldType,
        value: any
    ): SchemaValidationResult {
        const result: SchemaValidationResult = {
            success: true,
            errors: [],
            warnings: [],
            data: value,
        };

        // Handle union values
        if (this.isUnionValue(fieldType)) {
            const allowedValues = fieldType.union;
            if (!allowedValues.includes(value)) {
                result.success = false;
                result.errors.push(
                    `Expected one of: ${allowedValues.join(", ")}, got ${value}`
                );
            }
            return result;
        }

        // Handle constant values
        if (this.isConstantValue(fieldType)) {
            const expectedValue = fieldType.const;
            const isOptional = "optional" in fieldType && fieldType.optional;

            if (value === undefined && isOptional) {
                result.data = this.options.default;
                return result;
            }

            if (value !== expectedValue) {
                result.success = false;
                result.errors.push(
                    `Expected constant value ${expectedValue}, got ${value}`
                );
            }
            return result;
        }

        // Handle optional nested schemas
        if (this.isOptionalSchemaInterface(fieldType)) {
            if (value === undefined) {
                result.data = this.options.default;
                return result;
            }
            const nestedSchema = new InterfaceSchema(
                fieldType.schema,
                this.options
            );
            return nestedSchema.validate(value);
        }

        // Handle conditional validation objects
        if (this.isConditionalValidation(fieldType)) {
            return this.validateConditionalField(fieldType, value);
        }

        // Handle nested objects
        if (this.isSchemaInterface(fieldType)) {
            const nestedSchema = new InterfaceSchema(fieldType, this.options);
            return nestedSchema.validate(value);
        }

        // Handle array of schemas
        if (Array.isArray(fieldType) && fieldType.length === 1) {
            if (!Array.isArray(value)) {
                result.success = false;
                result.errors.push("Expected array");
                return result;
            }

            const validatedArray: any[] = [];
            const itemSchema = fieldType[0];

            for (let i = 0; i < value.length; i++) {
                const elementResult = this.validateField(
                    `[${i}]`,
                    itemSchema,
                    value[i]
                );
                if (!elementResult.success) {
                    result.success = false;
                    result.errors.push(
                        `Element ${i}: ${elementResult.errors.join(", ")}`
                    );
                } else {
                    validatedArray.push(elementResult.data);
                }
            }

            if (result.success) {
                result.data = validatedArray;
            }
            return result;
        }

        // Handle string field types
        if (typeof fieldType === "string") {
            // Check if it's conditional validation syntax (both new and legacy)
            if (ConditionalSyntaxUtils.isConditional(fieldType)) {
                const conditionalConfig = ConditionalSyntaxUtils.parse(fieldType);
                if (conditionalConfig) {
                    return this.validateConditionalField(conditionalConfig, value);
                }
            }
            return this.validateStringFieldType(fieldType, value);
        }

        result.success = false;
        result.errors.push(`Unknown field type: ${typeof fieldType}`);
        return result;
    }

    /**
     * Validate string-based field types
     */
    private validateStringFieldType(
        fieldType: string,
        value: any
    ): SchemaValidationResult {
        const result: SchemaValidationResult = {
            success: true,
            errors: [],
            warnings: [],
            data: value,
        };

        // Parse constraints from field type
        const { type: parsedType, constraints, optional: isOptional } = this.parseConstraints(fieldType);
        const isArray = parsedType.endsWith("[]");
        const elementType = isArray ? parsedType.slice(0, -2) : parsedType;

        // Handle undefined values
        if (value === undefined) {
            if (isOptional) {
                result.data = this.options.default;
                return result;
            }
            result.success = false;
            result.errors.push("Required field is missing");
            return result;
        }

        // Handle null values
        if (value === null) {
            if (isOptional) {
                result.data = null;
                return result;
            }
            result.success = false;
            result.errors.push("Field cannot be null");
            return result;
        }

        // Handle array types
        if (isArray) {
            if (!Array.isArray(value)) {
                result.success = false;
                result.errors.push("Expected array");
                return result;
            }

            // Apply parsed constraints to options
            const enhancedOptions = { ...this.options, ...constraints };

            // Check array constraints
            if (
                enhancedOptions.minItems !== undefined &&
                value.length < enhancedOptions.minItems
            ) {
                result.success = false;
                result.errors.push(
                    `Array must have at least ${enhancedOptions.minItems} items`
                );
                return result;
            }

            if (
                enhancedOptions.maxItems !== undefined &&
                value.length > enhancedOptions.maxItems
            ) {
                result.success = false;
                result.errors.push(
                    `Array must have at most ${enhancedOptions.maxItems} items`
                );
                return result;
            }

            const validatedArray: any[] = [];
            for (let i = 0; i < value.length; i++) {
                const elementResult = this.validateStringFieldType(
                    elementType,
                    value[i]
                );
                if (!elementResult.success) {
                    result.success = false;
                    result.errors.push(
                        `Element ${i}: ${elementResult.errors.join(", ")}`
                    );
                } else {
                    validatedArray.push(elementResult.data);
                }
            }

            // Check uniqueness if required
            if (enhancedOptions.unique && result.success) {
                const uniqueValues = new Set(validatedArray);
                if (uniqueValues.size !== validatedArray.length) {
                    result.success = false;
                    result.errors.push("Array values must be unique");
                }
            }

            if (result.success) {
                result.data = validatedArray;
            }
            return result;
        }

        // Note: Conditional "when" syntax is handled at the field level, not here

        // Handle constant values (e.g., "=admin", "=user")
        if (elementType.startsWith("=")) {
            return this.validateConstantType(elementType.slice(1), value);
        }

        // Handle union types (e.g., "pending|accepted|rejected")
        if (elementType.includes("|")) {
            return this.validateUnionType(elementType, value);
        }

        // Handle basic types - pass the original fieldType to preserve constraints
        return this.validateBasicType(fieldType, value);
    }

    /**
     * Validate constant types (e.g., "=admin", "=user")
     */
    private validateConstantType(
        constantValue: string,
        value: any
    ): SchemaValidationResult {
        const result: SchemaValidationResult = {
            success: true,
            errors: [],
            warnings: [],
            data: value,
        };

        // Convert the constant value to the appropriate type
        let expectedValue: any = constantValue;

        // Try to parse as number if it looks like a number
        if (/^\d+(\.\d+)?$/.test(constantValue)) {
            expectedValue = parseFloat(constantValue);
        }
        // Try to parse as boolean
        else if (constantValue === "true" || constantValue === "false") {
            expectedValue = constantValue === "true";
        }

        if (value !== expectedValue) {
            result.success = false;
            result.errors.push(
                `Expected constant value: ${expectedValue}, got ${value}`
            );
        }

        return result;
    }

    /**
     * Validate union types (e.g., "pending|accepted|rejected")
     */
    private validateUnionType(
        unionType: string,
        value: any
    ): SchemaValidationResult {
        const result: SchemaValidationResult = {
            success: true,
            errors: [],
            warnings: [],
            data: value,
        };

        const allowedValues = unionType.split("|").map((v) => v.trim());

        if (!allowedValues.includes(String(value))) {
            result.success = false;
            result.errors.push(
                `Expected one of: ${allowedValues.join(", ")}, got ${value}`
            );
        }

        return result;
    }



    /**
     * Parse constraint syntax like "string(3,20)", "number(0,100)?", etc.
     */
    private parseConstraints(fieldType: string): { type: string; constraints: any; optional: boolean } {
        let optional = false;
        let type = fieldType;
        let constraints: any = {};

        // Check if optional (ends with ?)
        if (type.endsWith("?")) {
            optional = true;
            type = type.slice(0, -1);
        }

        // Parse constraints: "string(3,20)", "number(0,100)", "string[]?(1,10)"
        const constraintMatch = type.match(/^([a-zA-Z\[\]]+)\(([^)]*)\)$/);
        if (constraintMatch) {
            const [, baseType, constraintStr] = constraintMatch;
            type = baseType;

            // Parse constraint parameters
            if (constraintStr.trim()) {
                // Handle regex patterns: "string(/^[a-z]+$/)"
                if (constraintStr.startsWith("/") && constraintStr.endsWith("/")) {
                    const pattern = constraintStr.slice(1, -1);
                    constraints.pattern = new RegExp(pattern);
                }
                // Handle min,max constraints: "string(3,20)", "number(0,100)"
                else if (constraintStr.includes(",")) {
                    const [minStr, maxStr] = constraintStr.split(",").map(s => s.trim());

                    if (minStr) {
                        const minVal = parseFloat(minStr);
                        if (!isNaN(minVal)) {
                            if (baseType.includes("[]")) {
                                constraints.minItems = minVal;
                            } else if (baseType === "string" || baseType.includes("string")) {
                                constraints.minLength = minVal;
                            } else {
                                constraints.min = minVal;
                            }
                        }
                    }

                    if (maxStr) {
                        const maxVal = parseFloat(maxStr);
                        if (!isNaN(maxVal)) {
                            if (baseType.includes("[]")) {
                                constraints.maxItems = maxVal;
                            } else if (baseType === "string" || baseType.includes("string")) {
                                constraints.maxLength = maxVal;
                            } else {
                                constraints.max = maxVal;
                            }
                        }
                    }
                }
                // Handle single value: "string(20)" -> max length
                else {
                    const val = parseFloat(constraintStr);
                    if (!isNaN(val)) {
                        if (baseType.includes("[]")) {
                            constraints.maxItems = val;
                        } else if (baseType === "string" || baseType.includes("string")) {
                            constraints.maxLength = val;
                        } else {
                            constraints.max = val;
                        }
                    }
                }
            }
        }

        return { type, constraints, optional };
    }

    /**
     * Validate basic types with enhanced constraints
     */
    private validateBasicType(
        fieldType: string,
        value: any
    ): SchemaValidationResult {
        // Parse constraints from field type
        const { type, constraints } = this.parseConstraints(fieldType);

        const result: SchemaValidationResult = {
            success: true,
            errors: [],
            warnings: [],
            data: value,
        };

        // Apply parsed constraints to options
        const enhancedOptions = { ...this.options, ...constraints };

        switch (type) {
            case "string":
                if (typeof value !== "string") {
                    result.success = false;
                    result.errors.push(`Expected string, got ${typeof value}`);
                    break;
                }

                // Apply string constraints
                if (
                    enhancedOptions.minLength !== undefined &&
                    value.length < enhancedOptions.minLength
                ) {
                    result.success = false;
                    result.errors.push(
                        `String must be at least ${enhancedOptions.minLength} characters`
                    );
                }

                if (
                    enhancedOptions.maxLength !== undefined &&
                    value.length > enhancedOptions.maxLength
                ) {
                    result.success = false;
                    result.errors.push(
                        `String must be at most ${enhancedOptions.maxLength} characters`
                    );
                }

                if (enhancedOptions.pattern && !enhancedOptions.pattern.test(value)) {
                    result.success = false;
                    result.errors.push(
                        "String does not match required pattern"
                    );
                }
                break;

            case "number":
            case "float":
                if (typeof value === "string" && this.options.loose) {
                    if (!isNaN(Number(value))) {
                        const num = parseFloat(value);
                        result.data = num;
                        result.warnings.push("String converted to number (loose mode)");
                        value = num;
                    } else {
                        result.success = false;
                        result.errors.push("Expected number");
                        break;
                    }
                } else if (typeof value !== "number" || !isFinite(value)) {
                    result.success = false;
                    result.errors.push(`Expected number, got ${typeof value}`);
                    break;
                }

                // Apply number constraints
                if (
                    enhancedOptions.min !== undefined &&
                    value < enhancedOptions.min
                ) {
                    result.success = false;
                    result.errors.push(
                        `Number must be at least ${enhancedOptions.min}`
                    );
                }

                if (
                    enhancedOptions.max !== undefined &&
                    value > enhancedOptions.max
                ) {
                    result.success = false;
                    result.errors.push(
                        `Number must be at most ${enhancedOptions.max}`
                    );
                }
                break;

            case "int":
            case "positive":
                if (typeof value === "string" && this.options.loose) {
                    if (!isNaN(Number(value))) {
                        const num = parseInt(value, 10);
                        result.data = num;
                        result.warnings.push("String converted to integer (loose mode)");
                        value = num;
                    } else {
                        result.success = false;
                        result.errors.push("Expected integer");
                        break;
                    }
                } else if (typeof value !== "number" || !isFinite(value) || value % 1 !== 0) {
                    result.success = false;
                    result.errors.push(`Expected integer, got ${typeof value}`);
                    break;
                }

                if (type === "positive" && value <= 0) {
                    result.success = false;
                    result.errors.push("Expected positive number");
                }

                // Apply number constraints
                if (
                    enhancedOptions.min !== undefined &&
                    value < enhancedOptions.min
                ) {
                    result.success = false;
                    result.errors.push(
                        `Integer must be at least ${enhancedOptions.min}`
                    );
                }

                if (
                    enhancedOptions.max !== undefined &&
                    value > enhancedOptions.max
                ) {
                    result.success = false;
                    result.errors.push(
                        `Integer must be at most ${enhancedOptions.max}`
                    );
                }
                break;

            case "boolean":
                if (typeof value === "boolean") {
                    result.data = value;
                } else if (this.options.loose) {
                    if (typeof value === "string") {
                        const lower = value.toLowerCase();
                        if (["true", "1", "yes", "on"].includes(lower)) {
                            result.data = true;
                            result.warnings.push("String converted to boolean (loose mode)");
                        } else if (["false", "0", "no", "off"].includes(lower)) {
                            result.data = false;
                            result.warnings.push("String converted to boolean (loose mode)");
                        } else {
                            result.success = false;
                            result.errors.push("Expected boolean");
                        }
                    } else if (typeof value === "number") {
                        result.data = Boolean(value);
                        result.warnings.push("Number converted to boolean (loose mode)");
                    } else {
                        result.success = false;
                        result.errors.push(`Expected boolean, got ${typeof value}`);
                    }
                } else {
                    result.success = false;
                    result.errors.push(`Expected boolean, got ${typeof value}`);
                }
                break;

            case "email":
                if (typeof value !== "string") {
                    result.success = false;
                    result.errors.push("Expected string for email");
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    result.success = false;
                    result.errors.push("Invalid email format");
                }
                break;

            case "url":
                if (typeof value !== "string") {
                    result.success = false;
                    result.errors.push("Expected string for URL");
                } else {
                    try {
                        new URL(value);
                    } catch {
                        result.success = false;
                        result.errors.push("Invalid URL format");
                    }
                }
                break;

            case "uuid":
                if (typeof value !== "string") {
                    result.success = false;
                    result.errors.push("Expected string for UUID");
                } else if (
                    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
                        value
                    )
                ) {
                    result.success = false;
                    result.errors.push("Invalid UUID format");
                }
                break;

            case "phone":
                if (typeof value !== "string") {
                    result.success = false;
                    result.errors.push("Expected string for phone");
                } else {
                    const cleanPhone = value.replace(/[\s\-\(\)\.+]/g, "");
                    if (!/^[1-9]\d{6,14}$/.test(cleanPhone)) {
                        result.success = false;
                        result.errors.push("Invalid phone format");
                    }
                }
                break;

            case "slug":
                if (typeof value !== "string") {
                    result.success = false;
                    result.errors.push("Expected string for slug");
                } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
                    result.success = false;
                    result.errors.push(
                        "Invalid slug format (use lowercase letters, numbers, and hyphens)"
                    );
                }
                break;

            case "username":
                if (typeof value !== "string") {
                    result.success = false;
                    result.errors.push("Expected string for username");
                } else if (!/^[a-zA-Z0-9_-]{3,20}$/.test(value)) {
                    result.success = false;
                    result.errors.push(
                        "Invalid username format (3-20 chars, letters, numbers, underscore, hyphen)"
                    );
                }
                break;

            case "date":
                if (!(value instanceof Date)) {
                    result.success = false;
                    result.errors.push(`Expected Date object, got ${typeof value}`);
                } else if (isNaN(value.getTime())) {
                    result.success = false;
                    result.errors.push("Invalid date");
                }
                break;

            case "any":
                // Accept any value
                break;

            default:
                result.success = false;
                result.errors.push(`Unknown type: ${type}`);
        }

        return result;
    }

    /**
     * Validate conditional field with full data context
     */
    private validateConditionalFieldWithContext(
        conditionalDef: any,
        value: any,
        fullData: any
    ): SchemaValidationResult {
        const result: SchemaValidationResult = {
            success: true,
            errors: [],
            warnings: [],
            data: value,
        };

        // Get the field this condition depends on
        const fieldName = conditionalDef.fieldName;
        const conditions = conditionalDef.conditions || [];
        const defaultSchema = conditionalDef.default;

        // Get the value of the dependent field
        const dependentFieldValue = fullData[fieldName];

        // Find the matching condition
        let schemaToUse = defaultSchema;

        for (const condition of conditions) {
            if (this.evaluateCondition(condition, dependentFieldValue)) {
                schemaToUse = condition.schema;
                break;
            }
        }

        // If we have a schema to validate against, use it
        if (schemaToUse) {
            if (typeof schemaToUse === "string") {
                return this.validateStringFieldType(schemaToUse, value);
            } else if (typeof schemaToUse === "object") {
                return this.validateField("conditional", schemaToUse, value);
            }
        }

        // If no schema found, accept the value
        return result;
    }

    /**
     * Evaluate a condition against a field value
     */
    private evaluateCondition(condition: any, fieldValue: any): boolean {
        if (!condition.condition) {
            return false;
        }

        return condition.condition(fieldValue);
    }

    /**
     * Validate conditional field based on other field values (legacy method)
     */
    private validateConditionalField(
        conditionalDef: any,
        value: any
    ): SchemaValidationResult {
        const result: SchemaValidationResult = {
            success: true,
            errors: [],
            warnings: [],
            data: value,
        };

        // Get the field this condition depends on
        const conditions = conditionalDef.conditions || [];
        const defaultSchema = conditionalDef.default;

        // We need access to the full data object to check the dependent field
        // For now, we'll use a simplified approach and validate against the default schema
        // In a full implementation, we'd need to pass the full data context

        let schemaToUse = defaultSchema;

        // Try to find a matching condition
        // Note: This is a simplified implementation
        // A full implementation would need access to the complete data object
        for (const condition of conditions) {
            if (condition.schema) {
                schemaToUse = condition.schema;
                break; // Use the first available schema for now
            }
        }

        // If we have a schema to validate against, use it
        if (schemaToUse) {
            if (typeof schemaToUse === "string") {
                return this.validateStringFieldType(schemaToUse, value);
            } else if (typeof schemaToUse === "object") {
                return this.validateField("conditional", schemaToUse, value);
            }
        }

        // If no schema found, accept the value
        return result;
    }

    /**
     * Type guards
     */
    private isUnionValue(value: any): value is UnionValue {
        return (
            typeof value === "object" &&
            value !== null &&
            !Array.isArray(value) &&
            "union" in value &&
            Array.isArray(value.union)
        );
    }

    private isConstantValue(
        value: any
    ): value is ConstantValue | OptionalConstantValue {
        return (
            typeof value === "object" &&
            value !== null &&
            !Array.isArray(value) &&
            "const" in value
        );
    }

    private isOptionalSchemaInterface(
        value: any
    ): value is OptionalSchemaInterface {
        return (
            typeof value === "object" &&
            value !== null &&
            !Array.isArray(value) &&
            "optional" in value &&
            value.optional === true &&
            "schema" in value
        );
    }

    private isConditionalValidation(value: any): boolean {
        return (
            typeof value === "object" &&
            value !== null &&
            !Array.isArray(value) &&
            value.__conditional === true &&
            "fieldName" in value &&
            "conditions" in value
        );
    }

    private isSchemaInterface(value: any): value is SchemaInterface {
        return (
            typeof value === "object" &&
            value !== null &&
            !Array.isArray(value) &&
            !this.isConstantValue(value) &&
            !this.isOptionalSchemaInterface(value) &&
            !this.isConditionalValidation(value)
        );
    }

    /**
     * Parse and validate (throws on error)
     */
    parse(data: T): T {
        const result = this.validate(data);
        if (!result.success) {
            throw new SchemaValidationError(
                `Schema validation failed: ${result.errors.join(", ")}`,
                result.errors,
                result.warnings
            );
        }
        return result.data!;
    }

    /**
     * Safe parse (returns result object) - strictly typed input
     */
    safeParse(data: T): SchemaValidationResult<T> {
        return this.validate(data);
    }

    /**
     * Safe parse with unknown data (for testing invalid inputs)
     * Use this when you need to test data that might not match the schema
     */
    safeParseUnknown(data: unknown): SchemaValidationResult<T> {
        return this.validate(data);
    }

    /**
     * Set schema options
     */
    withOptions(opts: SchemaOptions): InterfaceSchema<T> {
        return new InterfaceSchema(this.definition, {
            ...this.options,
            ...opts,
        });
    }

    /**
     * Enable strict mode (no unknown properties allowed)
     */
    strict(): InterfaceSchema<T> {
        return this.withOptions({ strict: true });
    }

    /**
     * Enable loose mode (allow type coercion)
     */
    loose(): InterfaceSchema<T> {
        return this.withOptions({ loose: true });
    }

    /**
     * Allow unknown properties (not strict about extra fields)
     * Returns a schema that accepts extra properties beyond the defined interface
     */
    allowUnknown(): InterfaceSchema<AllowUnknownSchema<T>> {
        return this.withOptions({ allowUnknown: true }) as InterfaceSchema<AllowUnknownSchema<T>>;
    }

    /**
     * Set minimum constraints
     */
    min(value: number): InterfaceSchema<T> {
        return this.withOptions({
            min: value,
            minLength: value,
            minItems: value,
        });
    }

    /**
     * Set maximum constraints
     */
    max(value: number): InterfaceSchema<T> {
        return this.withOptions({
            max: value,
            maxLength: value,
            maxItems: value,
        });
    }

    /**
     * Require unique array values
     */
    unique(): InterfaceSchema<T> {
        return this.withOptions({ unique: true });
    }

    /**
     * Set pattern for string validation
     */
    pattern(regex: RegExp): InterfaceSchema<T> {
        return this.withOptions({ pattern: regex });
    }

    /**
     * Set default value
     */
    default(value: any): InterfaceSchema<T> {
        return this.withOptions({ default: value });
    }
}

/**
 * Custom error class for schema validation
 */
export class SchemaValidationError extends Error {
    constructor(
        message: string,
        public errors: string[],
        public warnings: string[]
    ) {
        super(message);
        this.name = "SchemaValidationError";
    }
}

/**
 * Factory function for creating schemas
 */
export function createSchema<T = any>(
    definition: SchemaInterface,
    options?: SchemaOptions
): InterfaceSchema<T> {
    return new InterfaceSchema<T>(definition, options);
}

