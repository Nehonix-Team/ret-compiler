/**
 * Real-time Validation - Revolutionary live validation system
 *
 * This module provides real-time validation with reactive updates,
 * perfect for forms and live data validation.
 *
 * Uses modular validation engine for consistent validation logic.
 */

import { SchemaInterface } from "../../../mode/interfaces/Interface";
import { ValidationEngine, ValidationResult as EngineValidationResult } from "../../mods/validation-engine";
import { FormValidator } from "./FormValidator";
import { LiveValidator } from "./LiveValidator";
import { StreamValidator } from "./StreamValidator";

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
 * Export all utilities
 */
export { LiveValidator, FormValidator, StreamValidator };
export default Live;
