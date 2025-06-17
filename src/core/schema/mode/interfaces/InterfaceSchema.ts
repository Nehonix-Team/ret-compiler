/**
 * TypeScript Interface-like Schema Definition System
 *
 * Allows defining schemas using TypeScript-like syntax with string literals
 * that feel natural and are much easier to read and write.
 */

import {
  SchemaInterface,
  SchemaFieldType,
  SchemaOptions,
} from "../../../types/SchemaValidator.type";
import { SchemaValidationResult } from "../../../types/types";
import { ConditionalSyntaxUtils } from "../../extensions/components/ConditionalValidation/utils/SyntaxParser";
import { ConstraintParser, TypeGuards, ValidationHelpers } from "./validators";

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
      if (
        typeof fieldType === "string" &&
        ConditionalSyntaxUtils.isConditional(fieldType)
      ) {
        const conditionalConfig = ConditionalSyntaxUtils.parse(fieldType);
        if (conditionalConfig) {
          fieldResult = this.validateConditionalFieldWithContext(
            conditionalConfig,
            data[key],
            data
          );
        } else {
          fieldResult = this.validateField(key, fieldType, data[key]);
        }
      } else if (TypeGuards.isConditionalValidation(fieldType)) {
        fieldResult = this.validateConditionalFieldWithContext(
          fieldType,
          data[key],
          data
        );
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
    const extraKeys = inputKeys.filter((key) => !schemaKeys.includes(key));

    if (extraKeys.length > 0) {
      if (this.options.allowUnknown === true) {
        // Explicitly allow unknown properties
        for (const key of extraKeys) {
          validatedData[key] = data[key];
        }
      } else {
        // Strict by default - reject unknown properties
        result.success = false;
        result.errors.push(`Unexpected properties: ${extraKeys.join(", ")}`);
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
    if (TypeGuards.isUnionValue(fieldType)) {
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
    if (TypeGuards.isConstantValue(fieldType)) {
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
    if (TypeGuards.isOptionalSchemaInterface(fieldType)) {
      if (value === undefined) {
        result.data = this.options.default;
        return result;
      }
      const nestedSchema = new InterfaceSchema(fieldType.schema, this.options);
      return nestedSchema.validate(value);
    }

    // Handle conditional validation objects
    if (TypeGuards.isConditionalValidation(fieldType)) {
      return this.validateConditionalField(fieldType, value);
    }

    // Handle nested objects
    if (TypeGuards.isSchemaInterface(fieldType)) {
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
    const {
      type: parsedType,
      constraints,
      optional: isOptional,
    } = ConstraintParser.parseConstraints(fieldType);
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
      return ValidationHelpers.validateConstantType(
        elementType.slice(1),
        value
      );
    }

    // Handle union types (e.g., "pending|accepted|rejected")
    if (elementType.includes("|")) {
      return ValidationHelpers.validateUnionType(elementType, value);
    }

    // Handle basic types - pass the original fieldType to preserve constraints
    return this.validateBasicType(fieldType, value);
  }

  /**
   * Validate basic types with enhanced constraints
   */
  private validateBasicType(
    fieldType: string,
    value: any
  ): SchemaValidationResult {
    // Parse constraints from field type
    const { type, constraints } = ConstraintParser.parseConstraints(fieldType);

    // Apply parsed constraints to options
    const enhancedOptions = { ...this.options, ...constraints };

    // Check for Record types first
    if (type.startsWith("record<") && type.endsWith(">")) {
      return ValidationHelpers.validateRecordType(
        type,
        value,
        (fieldType: string, value: any) =>
          this.validateStringFieldType(fieldType, value)
      );
    }

    // Route to appropriate type validator
    return ValidationHelpers.routeTypeValidation(
      type,
      value,
      enhancedOptions,
      constraints
    );
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
   *
   * Note: This method is used when conditional validation is called without
   * full data context. It provides a fallback validation approach.
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

    // Since we don't have access to the full data object in this context,
    // we'll validate against all possible schemas and accept if any pass
    let validationPassed = false;
    let lastError: string[] = [];

    // Try to validate against each condition's schema
    for (const condition of conditions) {
      if (condition.schema) {
        try {
          const conditionResult = this.validateSchemaType(
            condition.schema,
            value
          );
          if (conditionResult.success) {
            validationPassed = true;
            result.data = conditionResult.data;
            result.warnings.push(...conditionResult.warnings);
            break; // Found a valid schema, use it
          } else {
            lastError = conditionResult.errors;
          }
        } catch (error) {
          // Continue to next condition if this one fails
          lastError = [`Condition validation error: ${error}`];
        }
      }
    }

    // If no condition schema worked, try the default schema
    if (!validationPassed && defaultSchema) {
      try {
        const defaultResult = this.validateSchemaType(defaultSchema, value);
        if (defaultResult.success) {
          validationPassed = true;
          result.data = defaultResult.data;
          result.warnings.push(...defaultResult.warnings);
        } else {
          lastError = defaultResult.errors;
        }
      } catch (error) {
        lastError = [`Default schema validation error: ${error}`];
      }
    }

    // If no schema validation passed, report the error
    if (!validationPassed) {
      result.success = false;
      result.errors =
        lastError.length > 0
          ? lastError
          : ["No valid conditional schema found"];
      result.warnings.push(
        "Conditional validation performed without full data context"
      );
    }

    return result;
  }

  /**
   * Helper method to validate a value against a schema type
   */
  private validateSchemaType(schema: any, value: any): SchemaValidationResult {
    if (typeof schema === "string") {
      return this.validateStringFieldType(schema, value);
    } else if (typeof schema === "object" && schema !== null) {
      return this.validateField("conditional", schema, value);
    } else {
      return ValidationHelpers.createErrorResult(
        `Invalid schema type: ${typeof schema}`,
        value
      );
    }
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
    return this.withOptions({ allowUnknown: true }) as InterfaceSchema<
      AllowUnknownSchema<T>
    >;
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
