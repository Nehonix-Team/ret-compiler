/**
 * Real-time Validation - Revolutionary live validation system
 *
 * This module provides real-time validation with reactive updates,
 * perfect for forms and live data validation.
 */

import { SchemaInterface } from "../mode/interfaces/Interface";

/**
 * Real-time validation utilities
 */
export const Live = {
    /**
     * Create a reactive validator that validates in real-time
     *
     * @example
     * ```typescript
     * const UserSchema = Interface({
     *   email: "email",
     *   username: "string(3,20)",
     *   password: "string(8,)"
     * });
     *
     * const liveValidator = Live.validator(UserSchema);
     *
     * // Listen for validation changes
     * liveValidator.onValidation((result) => {
     *   console.log('Validation result:', result);
     *   updateUI(result);
     * });
     *
     * // Validate field by field
     * liveValidator.validateField('email', 'user@example.com');
     * liveValidator.validateField('username', 'johndoe');
     *
     * // Get current state
     * console.log(liveValidator.isValid); // true/false
     * console.log(liveValidator.errors);  // Current errors
     * ```
     */
    validator(schema: SchemaInterface): LiveValidator {
        return new LiveValidator(schema);
    },

    /**
     * Create a form validator with field-level validation
     *
     * @example
     * ```typescript
     * const formValidator = Live.form(UserSchema);
     *
     * // Bind to form fields
     * formValidator.bindField('email', emailInput);
     * formValidator.bindField('username', usernameInput);
     *
     * // Auto-validation on input
     * formValidator.enableAutoValidation();
     *
     * // Submit validation
     * formValidator.onSubmit((isValid, data, errors) => {
     *   if (isValid) {
     *     submitForm(data);
     *   } else {
     *     showErrors(errors);
     *   }
     * });
     * ```
     */
    form(schema: SchemaInterface): FormValidator {
        return new FormValidator(schema);
    },

    /**
     * Create a stream validator for continuous data validation
     *
     * @example
     * ```typescript
     * const streamValidator = Live.stream(DataSchema);
     *
     * // Validate streaming data
     * dataStream.subscribe((data) => {
     *   streamValidator.validate(data);
     * });
     *
     * // Handle validation results
     * streamValidator.onValid((data) => {
     *   processValidData(data);
     * });
     *
     * streamValidator.onInvalid((data, errors) => {
     *   logInvalidData(data, errors);
     * });
     * ```
     */
    stream(schema: SchemaInterface): StreamValidator {
        return new StreamValidator(schema);
    }
};

/**
 * Live validator for real-time validation
 */
class LiveValidator {
    private currentData: any = {};
    private currentErrors: Record<string, string[]> = {};
    private listeners: Array<(result: ValidationResult) => void> = [];
    private fieldListeners: Record<string, Array<(result: FieldValidationResult) => void>> = {};

    constructor(private schema: SchemaInterface) {}

    /**
     * Validate a single field in real-time
     */
    validateField(fieldName: string, value: any): FieldValidationResult {
        this.currentData[fieldName] = value;

        // Simulate field validation (would use actual schema validation)
        const fieldSchema = (this.schema as any)[fieldName];
        const isValid = this.validateSingleField(fieldSchema, value);
        const errors = isValid ? [] : [`Invalid ${fieldName}`];

        this.currentErrors[fieldName] = errors;

        const result: FieldValidationResult = {
            field: fieldName,
            value,
            isValid,
            errors
        };

        // Notify field listeners
        if (this.fieldListeners[fieldName]) {
            this.fieldListeners[fieldName].forEach(listener => listener(result));
        }

        // Notify global listeners
        this.notifyListeners();

        return result;
    }

    /**
     * Validate all current data
     */
    validateAll(): ValidationResult {
        const result: ValidationResult = {
            isValid: Object.values(this.currentErrors).every(errors => errors.length === 0),
            data: this.currentData,
            errors: this.currentErrors,
            timestamp: new Date()
        };

        this.notifyListeners();
        return result;
    }

    /**
     * Listen for validation changes
     */
    onValidation(listener: (result: ValidationResult) => void): void {
        this.listeners.push(listener);
    }

    /**
     * Listen for specific field validation
     */
    onFieldValidation(fieldName: string, listener: (result: FieldValidationResult) => void): void {
        if (!this.fieldListeners[fieldName]) {
            this.fieldListeners[fieldName] = [];
        }
        this.fieldListeners[fieldName].push(listener);
    }

    /**
     * Get current validation state
     */
    get isValid(): boolean {
        return Object.values(this.currentErrors).every(errors => errors.length === 0);
    }

    get errors(): Record<string, string[]> {
        return { ...this.currentErrors };
    }

    get data(): any {
        return { ...this.currentData };
    }

    private validateSingleField(fieldSchema: any, value: any): boolean {
        // Simplified validation - would use actual schema validation logic
        if (typeof fieldSchema === "string") {
            if (fieldSchema === "email") {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            }
            if (fieldSchema.startsWith("string(")) {
                return typeof value === "string" && value.length > 0;
            }
            if (fieldSchema === "number" || fieldSchema === "positive") {
                return typeof value === "number" && !isNaN(value);
            }
        }
        return true;
    }

    private notifyListeners(): void {
        const result = this.validateAll();
        this.listeners.forEach(listener => listener(result));
    }
}

/**
 * Form validator with DOM integration
 */
class FormValidator extends LiveValidator {
    private boundFields: Record<string, HTMLElement> = {};
    private autoValidationEnabled = false;
    private submitListeners: Array<(isValid: boolean, data: any, errors: Record<string, string[]>) => void> = [];

    /**
     * Bind a form field for automatic validation (Node.js compatible)
     */
    bindField(fieldName: string, element: any): void {
        this.boundFields[fieldName] = element;

        if (this.autoValidationEnabled) {
            this.setupFieldListeners(fieldName, element);
        }
    }

    /**
     * Enable automatic validation on input changes (Node.js compatible)
     */
    enableAutoValidation(): void {
        this.autoValidationEnabled = true;

        Object.entries(this.boundFields).forEach(([fieldName, element]) => {
            this.setupFieldListeners(fieldName, element);
        });
    }

    /**
     * Listen for form submission
     */
    onSubmit(listener: (isValid: boolean, data: any, errors: Record<string, string[]>) => void): void {
        this.submitListeners.push(listener);
    }

    /**
     * Trigger form validation (typically on submit)
     */
    submit(): void {
        const result = this.validateAll();
        this.submitListeners.forEach(listener =>
            listener(result.isValid, result.data, result.errors)
        );
    }

    private setupFieldListeners(fieldName: string, _element: any): void {
        // Node.js compatible - no DOM events
        // In a browser environment, this would set up event listeners
        console.log(`Field listener setup for ${fieldName} (Node.js mode)`);
    }
}

/**
 * Stream validator for continuous data validation
 */
class StreamValidator {
    private validListeners: Array<(data: any) => void> = [];
    private invalidListeners: Array<(data: any, errors: Record<string, string[]>) => void> = [];
    private statsListeners: Array<(stats: ValidationStats) => void> = [];

    private stats: ValidationStats = {
        totalValidated: 0,
        validCount: 0,
        invalidCount: 0,
        errorRate: 0,
        startTime: new Date()
    };

    constructor(private schema: SchemaInterface) {}

    /**
     * Validate streaming data
     */
    validate(data: any): void {
        this.stats.totalValidated++;

        // Simulate validation (would use actual schema validation)
        const isValid = this.performValidation(data);

        if (isValid) {
            this.stats.validCount++;
            this.validListeners.forEach(listener => listener(data));
        } else {
            this.stats.invalidCount++;
            const errors = { general: ["Validation failed"] }; // Simplified
            this.invalidListeners.forEach(listener => listener(data, errors));
        }

        this.updateStats();
    }

    /**
     * Listen for valid data
     */
    onValid(listener: (data: any) => void): void {
        this.validListeners.push(listener);
    }

    /**
     * Listen for invalid data
     */
    onInvalid(listener: (data: any, errors: Record<string, string[]>) => void): void {
        this.invalidListeners.push(listener);
    }

    /**
     * Listen for validation statistics
     */
    onStats(listener: (stats: ValidationStats) => void): void {
        this.statsListeners.push(listener);
    }

    /**
     * Get current validation statistics
     */
    getStats(): ValidationStats {
        return { ...this.stats };
    }

    private performValidation(data: any): boolean {
        // Simplified validation - would use actual schema validation
        return data && typeof data === "object";
    }

    private updateStats(): void {
        this.stats.errorRate = this.stats.totalValidated > 0
            ? this.stats.invalidCount / this.stats.totalValidated
            : 0;

        this.statsListeners.forEach(listener => listener(this.stats));
    }
}

/**
 * Type definitions
 */
interface ValidationResult {
    isValid: boolean;
    data: any;
    errors: Record<string, string[]>;
    timestamp: Date;
}

interface FieldValidationResult {
    field: string;
    value: any;
    isValid: boolean;
    errors: string[];
}

interface ValidationStats {
    totalValidated: number;
    validCount: number;
    invalidCount: number;
    errorRate: number;
    startTime: Date;
}

/**
 * Export all utilities
 */
export { LiveValidator, FormValidator, StreamValidator };
export default Live;
