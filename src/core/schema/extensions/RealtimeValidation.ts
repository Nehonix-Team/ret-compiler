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
   */
  validator(schema: SchemaInterface): LiveValidator {
    return new LiveValidator(schema);
  },

  /**
   * Create a form validator with field-level validation
   */
  form(schema: SchemaInterface): FormValidator {
    return new FormValidator(schema);
  },

  /**
   * Create a stream validator for continuous data validation
   */
  stream(schema: SchemaInterface): StreamValidator {
    return new StreamValidator(schema);
  },
};

/**
 * Live validator for real-time validation
 */
class LiveValidator {
  private currentData: Record<string, any> = {};
  private currentErrors: Record<string, string[]> = {};
  private listeners: Array<(result: ValidationResult) => void> = [];
  private fieldListeners: Record<
    string,
    Array<(result: FieldValidationResult) => void>
  > = {};

  constructor(private schema: SchemaInterface) {}

  /**
   * Validate a single field in real-time
   */
  validateField(fieldName: string, value: any): FieldValidationResult {
    this.currentData[fieldName] = value;

    const fieldSchema = this.getFieldSchema(fieldName);
    const validationResult = this.validateValue(fieldSchema, value, fieldName);

    this.currentErrors[fieldName] = validationResult.errors;

    const result: FieldValidationResult = {
      field: fieldName,
      value,
      isValid: validationResult.isValid,
      errors: validationResult.errors,
    };

    // Notify field listeners
    this.fieldListeners[fieldName]?.forEach((listener) => listener(result));

    // Notify global listeners with current state
    this.notifyListeners();

    return result;
  }

  /**
   * Validate all current data
   */
  validateAll(): ValidationResult {
    const allErrors: Record<string, string[]> = {};
    let hasErrors = false;

    // Validate each field in schema
    for (const fieldName in this.schema) {
      const value = this.currentData[fieldName];
      const fieldSchema = this.getFieldSchema(fieldName);
      const validation = this.validateValue(fieldSchema, value, fieldName);

      if (!validation.isValid) {
        allErrors[fieldName] = validation.errors;
        hasErrors = true;
      } else {
        allErrors[fieldName] = [];
      }
    }

    this.currentErrors = allErrors;

    const result: ValidationResult = {
      isValid: !hasErrors,
      data: { ...this.currentData },
      errors: allErrors,
      timestamp: new Date(),
    };

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
  onFieldValidation(
    fieldName: string,
    listener: (result: FieldValidationResult) => void
  ): void {
    if (!this.fieldListeners[fieldName]) {
      this.fieldListeners[fieldName] = [];
    }
    this.fieldListeners[fieldName].push(listener);
  }

  /**
   * Remove validation listener
   */
  removeListener(listener: (result: ValidationResult) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Remove field validation listener
   */
  removeFieldListener(
    fieldName: string,
    listener: (result: FieldValidationResult) => void
  ): void {
    if (this.fieldListeners[fieldName]) {
      const index = this.fieldListeners[fieldName].indexOf(listener);
      if (index > -1) {
        this.fieldListeners[fieldName].splice(index, 1);
      }
    }
  }

  /**
   * Clear all data and errors
   */
  reset(): void {
    this.currentData = {};
    this.currentErrors = {};
    this.notifyListeners();
  }

  /**
   * Get current validation state
   */
  get isValid(): boolean {
    return Object.values(this.currentErrors).every(
      (errors) => errors.length === 0
    );
  }

  get errors(): Record<string, string[]> {
    return { ...this.currentErrors };
  }

  get data(): Record<string, any> {
    return { ...this.currentData };
  }

  private getFieldSchema(fieldName: string): any {
    return (this.schema as any)[fieldName];
  }

  private validateValue(
    fieldSchema: any,
    value: any,
    fieldName: string
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!fieldSchema) {
      return { isValid: true, errors: [] };
    }

    // Handle required fields (undefined/null/empty)
    if (value === undefined || value === null || value === "") {
      if (this.isRequired(fieldSchema)) {
        errors.push(`${fieldName} is required`);
      }
      return { isValid: errors.length === 0, errors };
    }

    // Parse schema string
    if (typeof fieldSchema === "string") {
      const schemaType = fieldSchema.toLowerCase();

      // Email validation
      if (schemaType === "email") {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(String(value))) {
          errors.push(`${fieldName} must be a valid email address`);
        }
      }
      // String validation with length constraints
      else if (schemaType.startsWith("string(")) {
        if (typeof value !== "string") {
          errors.push(`${fieldName} must be a string`);
        } else {
          const constraints = this.parseStringConstraints(schemaType);
          if (constraints.min !== undefined && value.length < constraints.min) {
            errors.push(
              `${fieldName} must be at least ${constraints.min} characters long`
            );
          }
          if (constraints.max !== undefined && value.length > constraints.max) {
            errors.push(
              `${fieldName} must be no more than ${constraints.max} characters long`
            );
          }
        }
      }
      // Number validation
      else if (schemaType === "number") {
        const numValue = Number(value);
        if (isNaN(numValue)) {
          errors.push(`${fieldName} must be a valid number`);
        }
      }
      // Positive number validation
      else if (schemaType === "positive") {
        const numValue = Number(value);
        if (isNaN(numValue) || numValue <= 0) {
          errors.push(`${fieldName} must be a positive number`);
        }
      }
      // Integer validation
      else if (schemaType === "integer") {
        const numValue = Number(value);
        if (isNaN(numValue) || !Number.isInteger(numValue)) {
          errors.push(`${fieldName} must be an integer`);
        }
      }
      // Boolean validation
      else if (schemaType === "boolean") {
        if (typeof value !== "boolean") {
          errors.push(`${fieldName} must be a boolean`);
        }
      }
      // URL validation
      else if (schemaType === "url") {
        try {
          new URL(String(value));
        } catch {
          errors.push(`${fieldName} must be a valid URL`);
        }
      }
      // Date validation
      else if (schemaType === "date") {
        const dateValue = new Date(value);
        if (isNaN(dateValue.getTime())) {
          errors.push(`${fieldName} must be a valid date`);
        }
      }
    }
    // Handle object schema (nested validation)
    else if (typeof fieldSchema === "object" && fieldSchema !== null) {
      if (typeof value !== "object" || value === null) {
        errors.push(`${fieldName} must be an object`);
      } else {
        // Recursively validate nested object
        for (const nestedField in fieldSchema) {
          const nestedResult = this.validateValue(
            fieldSchema[nestedField],
            value[nestedField],
            `${fieldName}.${nestedField}`
          );
          errors.push(...nestedResult.errors);
        }
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  private parseStringConstraints(schemaType: string): {
    min?: number;
    max?: number;
  } {
    const match = schemaType.match(/string\((\d+)?,?(\d+)?\)/);
    if (!match) return {};

    const min = match[1] ? parseInt(match[1], 10) : undefined;
    const max = match[2] ? parseInt(match[2], 10) : undefined;

    return { min, max };
  }

  private isRequired(fieldSchema: any): boolean {
    // Schema is required by default unless explicitly marked as optional
    if (typeof fieldSchema === "string") {
      return !fieldSchema.includes("?") && !fieldSchema.includes("optional");
    }
    return true;
  }

  private notifyListeners(): void {
    const result = this.validateAll();
    this.listeners.forEach((listener) => {
      try {
        listener(result);
      } catch (error) {
        console.error("Error in validation listener:", error);
      }
    });
  }
}

/**
 * Form validator with DOM integration
 */
class FormValidator extends LiveValidator {
  private boundFields: Record<string, HTMLElement> = {};
  private autoValidationEnabled = false;
  private submitListeners: Array<
    (isValid: boolean, data: any, errors: Record<string, string[]>) => void
  > = [];
  private fieldEventListeners: Record<string, (event: Event) => void> = {};

  /**
   * Bind a form field for automatic validation
   */
  bindField(fieldName: string, element: HTMLElement): void {
    this.boundFields[fieldName] = element;

    if (this.autoValidationEnabled) {
      this.setupFieldListeners(fieldName, element);
    }
  }

  /**
   * Unbind a form field
   */
  unbindField(fieldName: string): void {
    const element = this.boundFields[fieldName];
    if (element && this.fieldEventListeners[fieldName]) {
      element.removeEventListener("input", this.fieldEventListeners[fieldName]);
      element.removeEventListener("blur", this.fieldEventListeners[fieldName]);
      delete this.fieldEventListeners[fieldName];
    }
    delete this.boundFields[fieldName];
  }

  /**
   * Enable automatic validation on input changes
   */
  enableAutoValidation(): void {
    this.autoValidationEnabled = true;

    Object.entries(this.boundFields).forEach(([fieldName, element]) => {
      this.setupFieldListeners(fieldName, element);
    });
  }

  /**
   * Disable automatic validation
   */
  disableAutoValidation(): void {
    this.autoValidationEnabled = false;

    Object.keys(this.fieldEventListeners).forEach((fieldName) => {
      this.unbindField(fieldName);
    });
  }

  /**
   * Listen for form submission
   */
  onSubmit(
    listener: (
      isValid: boolean,
      data: any,
      errors: Record<string, string[]>
    ) => void
  ): void {
    this.submitListeners.push(listener);
  }

  /**
   * Remove submit listener
   */
  removeSubmitListener(
    listener: (
      isValid: boolean,
      data: any,
      errors: Record<string, string[]>
    ) => void
  ): void {
    const index = this.submitListeners.indexOf(listener);
    if (index > -1) {
      this.submitListeners.splice(index, 1);
    }
  }

  /**
   * Trigger form validation (typically on submit)
   */
  submit(): void {
    // Collect current values from bound fields
    Object.entries(this.boundFields).forEach(([fieldName, element]) => {
      const value = this.getElementValue(element);
      this.validateField(fieldName, value);
    });

    const result = this.validateAll();
    this.submitListeners.forEach((listener) => {
      try {
        listener(result.isValid, result.data, result.errors);
      } catch (error) {
        console.error("Error in submit listener:", error);
      }
    });
  }

  private setupFieldListeners(fieldName: string, element: HTMLElement): void {
    // Remove existing listener
    if (this.fieldEventListeners[fieldName]) {
      element.removeEventListener("input", this.fieldEventListeners[fieldName]);
      element.removeEventListener("blur", this.fieldEventListeners[fieldName]);
    }

    // Create new listener
    const listener = (event: Event) => {
      const value = this.getElementValue(event.target as HTMLElement);
      this.validateField(fieldName, value);
    };

    this.fieldEventListeners[fieldName] = listener;

    // Add event listeners
    element.addEventListener("input", listener);
    element.addEventListener("blur", listener);
  }

  private getElementValue(element: HTMLElement): any {
    if (element instanceof HTMLInputElement) {
      if (element.type === "checkbox") {
        return element.checked;
      } else if (element.type === "number") {
        return element.valueAsNumber;
      } else {
        return element.value;
      }
    } else if (element instanceof HTMLSelectElement) {
      return element.value;
    } else if (element instanceof HTMLTextAreaElement) {
      return element.value;
    }
    return element.textContent || "";
  }
}

/**
 * Stream validator for continuous data validation
 */
class StreamValidator {
  private validListeners: Array<(data: any) => void> = [];
  private invalidListeners: Array<
    (data: any, errors: Record<string, string[]>) => void
  > = [];
  private statsListeners: Array<(stats: ValidationStats) => void> = [];

  private stats: ValidationStats = {
    totalValidated: 0,
    validCount: 0,
    invalidCount: 0,
    errorRate: 0,
    startTime: new Date(),
  };

  private validator: LiveValidator;

  constructor(private schema: SchemaInterface) {
    this.validator = new LiveValidator(schema);
  }

  /**
   * Validate streaming data
   */
  validate(data: any): ValidationResult {
    this.stats.totalValidated++;

    // Set all field values at once
    Object.entries(data).forEach(([key, value]) => {
      this.validator.validateField(key, value);
    });

    const result = this.validator.validateAll();

    if (result.isValid) {
      this.stats.validCount++;
      this.validListeners.forEach((listener) => {
        try {
          listener(data);
        } catch (error) {
          console.error("Error in valid data listener:", error);
        }
      });
    } else {
      this.stats.invalidCount++;
      this.invalidListeners.forEach((listener) => {
        try {
          listener(data, result.errors);
        } catch (error) {
          console.error("Error in invalid data listener:", error);
        }
      });
    }

    this.updateStats();
    return result;
  }

  /**
   * Batch validate multiple data items
   */
  validateBatch(dataArray: any[]): ValidationResult[] {
    return dataArray.map((data) => this.validate(data));
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
  onInvalid(
    listener: (data: any, errors: Record<string, string[]>) => void
  ): void {
    this.invalidListeners.push(listener);
  }

  /**
   * Listen for validation statistics
   */
  onStats(listener: (stats: ValidationStats) => void): void {
    this.statsListeners.push(listener);
  }

  /**
   * Remove listeners
   */
  removeValidListener(listener: (data: any) => void): void {
    const index = this.validListeners.indexOf(listener);
    if (index > -1) {
      this.validListeners.splice(index, 1);
    }
  }

  removeInvalidListener(
    listener: (data: any, errors: Record<string, string[]>) => void
  ): void {
    const index = this.invalidListeners.indexOf(listener);
    if (index > -1) {
      this.invalidListeners.splice(index, 1);
    }
  }

  removeStatsListener(listener: (stats: ValidationStats) => void): void {
    const index = this.statsListeners.indexOf(listener);
    if (index > -1) {
      this.statsListeners.splice(index, 1);
    }
  }

  /**
   * Get current validation statistics
   */
  getStats(): ValidationStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      totalValidated: 0,
      validCount: 0,
      invalidCount: 0,
      errorRate: 0,
      startTime: new Date(),
    };
    this.updateStats();
  }

  private updateStats(): void {
    this.stats.errorRate =
      this.stats.totalValidated > 0
        ? this.stats.invalidCount / this.stats.totalValidated
        : 0;

    this.statsListeners.forEach((listener) => {
      try {
        listener(this.stats);
      } catch (error) {
        console.error("Error in stats listener:", error);
      }
    });
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
