import {
  FieldValidationResult,
  ValidationResult,
} from "../../../../types/extension.type";
import { SchemaInterface } from "../../../../types/SchemaValidator.type";
import { ValidationEngine } from "../../mods";

/**
 * Live validator for real-time validation
 */
export class LiveValidator {
  private currentData: any = {};
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

    // Check if schema is an Interface schema (has definition property)
    let fieldSchema;
    if (
      (this.schema as any).definition &&
      (this.schema as any).definition[fieldName]
    ) {
      fieldSchema = (this.schema as any).definition[fieldName];
    } else {
      fieldSchema = (this.schema as any)[fieldName];
    }

    // console.log("field: ", fieldSchema);
    // console.log("fieldName: ", fieldName);

    const validationResult = ValidationEngine.validateField(fieldSchema, value);

    this.currentErrors[fieldName] = validationResult.errors;

    const result: FieldValidationResult = {
      field: fieldName,
      value,
      isValid: validationResult.isValid,
      errors: validationResult.errors,
    };

    // Notify field listeners
    if (this.fieldListeners[fieldName]) {
      this.fieldListeners[fieldName].forEach((listener) => listener(result));
    }

    // Notify global listeners
    this.notifyListeners();

    // Validate all
    this.validateAll();

    return result;
  }

  /**
   * Validate all current data
   */
  validateAll(): ValidationResult {
    // Check if schema is an Interface schema (has safeParse method)
    if ((this.schema as any).safeParse) {
      // Use Interface schema's built-in validation
      const validationResult = (this.schema as any).safeParse(this.currentData);

      const errors: Record<string, string[]> = {};
      if (!validationResult.success && validationResult.errors) {
        // Convert Interface errors to LiveValidator format
        Object.entries(validationResult.errors).forEach(([key, value]) => {
          errors[key] = Array.isArray(value) ? value : [String(value)];
        });
      }

      this.currentErrors = errors;

      const result: ValidationResult = {
        isValid: validationResult.success,
        data: this.currentData,
        errors: this.currentErrors,
        timestamp: new Date(),
      };

      // Notify listeners after creating the result
      this.listeners.forEach((listener) => listener(result));

      return result;
    } else {
      // Fallback to ValidationEngine for other schema types
      const validationResult = ValidationEngine.validateObject(
        this.schema,
        this.currentData
      );

      // Update current errors with validation results
      this.currentErrors = validationResult.errors;

      const result: ValidationResult = {
        isValid: validationResult.isValid,
        data: this.currentData,
        errors: this.currentErrors,
        timestamp: new Date(),
      };

      // Notify listeners after creating the result
      this.listeners.forEach((listener) => listener(result));

      return result;
    }
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

  get data(): any {
    return { ...this.currentData };
  }

  private notifyListeners(): void {
    // Create validation result without calling validateAll to avoid recursion
    const result: ValidationResult = {
      isValid: Object.values(this.currentErrors).every(
        (errors) => errors.length === 0
      ),
      data: this.currentData,
      errors: this.currentErrors,
      timestamp: new Date(),
    };

    this.listeners.forEach((listener) => listener(result));
  }
}
