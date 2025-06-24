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

import { ConstraintParser, TypeGuards, ValidationHelpers } from "./validators";

// Import our conditional validation system
import { ConditionalParser } from "./conditional/parser/ConditionalParser";
import { ConditionalEvaluator } from "./conditional/evaluator/ConditionalEvaluator";

import { ConditionalNode } from "./conditional/types/ConditionalTypes";

// Import performance optimization system
import { SchemaCompiler } from "../../optimization/SchemaCompiler";
import { ObjectValidationCache } from "../../optimization/ObjectValidationCache";
import { PerformanceMonitor } from "../../optimization/PerformanceMonitor";

/**
 * Interface Schema class for TypeScript-like schema definitions
 */
// Helper type for schemas that allow unknown properties
type AllowUnknownSchema<T> = T & Record<string, any>;

// Pre-compiled field definition for faster validation
interface CompiledField {
  key: string;
  originalType: SchemaFieldType;
  isString: boolean;
  isConditional: boolean;
  conditionalConfig?: any;
  parsedConstraints?: any;
  isArray?: boolean;
  elementType?: string;
  isOptional?: boolean;
  // conditional validation
  ConditionalAST?: ConditionalNode;
}

export class InterfaceSchema<T = any> {
  private compiledFields: CompiledField[] = [];
  private schemaKeys: string[] = [];
  private ConditionalParser: ConditionalParser;
  private compiledValidator?: any;
  private schemaComplexity: number = 0;
  private isOptimized: boolean = false;

  constructor(
    private definition: SchemaInterface,
    private options: SchemaOptions = {}
  ) {
    // Initialize conditional parser
    this.ConditionalParser = new ConditionalParser({
      allowNestedConditionals: true,
      maxNestingDepth: 5,
      strictMode: false,
      enableDebug: false,
    });

    // Pre-compile schema at initialization
    this.precompileSchema();

    // Apply performance optimizations (skip if requested to prevent circular dependency)
    if (!this.options.skipOptimization) {
      this.applyOptimizations();
    }
  }

  /**
   * Check if a field type uses conditional syntax
   */
  private isConditionalSyntax(fieldType: string): boolean {
    return fieldType.includes("when ") && fieldType.includes(" *? ");
  }

  /**
   * Apply performance optimizations based on schema characteristics
   */
  private applyOptimizations(): void {
    // Calculate schema complexity
    this.schemaComplexity = this.calculateComplexity();

    // Check if schema has conditional fields
    const hasConditionalFields = this.compiledFields.some(
      (field) => field.isConditional
    );

    // Apply optimizations based on complexity, but avoid advanced optimizations for conditional fields
    if (this.schemaComplexity > 15 && !hasConditionalFields) {
      // High complexity - use advanced optimizations (only for non-conditional schemas)
      this.compiledValidator = SchemaCompiler.compileSchema(
        this.definition,
        this.options
      );
      this.isOptimized = true;
    } else if (this.schemaComplexity > 5 && !hasConditionalFields) {
      // Medium complexity - use caching (only for non-conditional schemas)
      this.isOptimized = true;
    }
    // Note: Conditional fields use the standard validation path for reliability

    // Start performance monitoring if enabled
    if (this.options.enablePerformanceMonitoring) {
      PerformanceMonitor.startMonitoring();
    }
  }

  /**
   * Calculate schema complexity score
   */
  private calculateComplexity(): number {
    let complexity = this.compiledFields.length;

    for (const field of this.compiledFields) {
      if (field.isConditional) complexity += 5;
      if (field.isArray) complexity += 2;
      if (typeof field.originalType === "object") complexity += 3;
    }

    return complexity;
  }

  /**
   * Pre-compile schema for faster validation
   */
  private precompileSchema(): void {
    const entries = Object.entries(this.definition);
    this.schemaKeys = entries.map(([key]) => key);
    this.compiledFields = [];

    for (const [key, fieldType] of entries) {
      const compiled: CompiledField = {
        key,
        originalType: fieldType,
        isString: typeof fieldType === "string",
        isConditional: false,
      };

      if (typeof fieldType === "string") {
        // Check for conditional syntax (when ... *? ... : ...)
        if (this.isConditionalSyntax(fieldType)) {
          compiled.isConditional = true;
          compiled.isConditional = true;

          // Parse with parser
          const { ast, errors } = this.ConditionalParser.parse(fieldType);

          if (ast && errors.length === 0) {
            compiled.ConditionalAST = ast;
          } else {
            // If parsing fails, treat as regular field type
            console.warn(
              `Failed to parse conditional expression: ${fieldType}`,
              errors
            );
            const parsed = ConstraintParser.parseConstraints(fieldType);
            compiled.parsedConstraints = parsed;
            compiled.isOptional = parsed.optional;
            compiled.isArray = parsed.type.endsWith("[]");
            compiled.elementType = compiled.isArray
              ? parsed.type.slice(0, -2)
              : parsed.type;
            compiled.isConditional = false;
            compiled.isConditional = false;
          }
        } else {
          // Pre-parse constraints for regular field types
          const parsed = ConstraintParser.parseConstraints(fieldType);
          compiled.parsedConstraints = parsed;
          compiled.isOptional = parsed.optional;
          compiled.isArray = parsed.type.endsWith("[]");
          compiled.elementType = compiled.isArray
            ? parsed.type.slice(0, -2)
            : parsed.type;
        }
      } else if (TypeGuards.isConditionalValidation(fieldType)) {
        // Object-based conditional validation (keep for backward compatibility)
        compiled.isConditional = true;
        compiled.conditionalConfig = fieldType;
      }

      this.compiledFields.push(compiled);
    }
  }

  /**
   * Validate data against the interface schema - optimized version
   */
  validate(data: any): SchemaValidationResult<T> {
    const startTime = performance.now();
    const operationId = `schema-${this.schemaComplexity}`;

    let result: SchemaValidationResult<T>;

    // Use optimized validation path if available
    if (this.isOptimized && this.compiledValidator) {
      result = this.compiledValidator.validate(data);
    } else if (this.isOptimized && this.schemaComplexity > 5) {
      // Use cached validation for medium complexity
      result = ObjectValidationCache.getCachedValidation(
        data,
        (value) => this.validateStandard(value),
        []
      ) as SchemaValidationResult<T>;
    } else {
      // Standard validation for simple schemas
      result = this.validateStandard(data);
    }

    // Record performance metrics
    const duration = performance.now() - startTime;
    PerformanceMonitor.recordOperation(
      operationId,
      duration,
      this.schemaComplexity,
      this.isOptimized
    );

    return result;
  }

  /**
   * Standard validation method (original implementation)
   */
  private validateStandard(data: any): SchemaValidationResult<T> {
    // Fast path for non-objects
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      return {
        success: false,
        errors: ["Expected object"],
        warnings: [],
        data: undefined,
      };
    }

    const validatedData: any = {};
    const errors: string[] = [];
    const warnings: string[] = [];
    let hasErrors = false;

    // Use pre-compiled fields for faster validation
    for (let i = 0; i < this.compiledFields.length; i++) {
      const field = this.compiledFields[i];
      const value = data[field.key];

      let fieldResult: SchemaValidationResult;

      // Use pre-compiled information to skip parsing
      if (field.isConditional) {
        if (field.isConditional && field.ConditionalAST) {
          // Use conditional validation
          fieldResult = this.validateEnhancedConditionalField(
            field.ConditionalAST,
            value,
            data
          );
        } else {
          // Use legacy conditional validation
          fieldResult = this.validateConditionalFieldWithContext(
            field.conditionalConfig,
            value,
            data
          );
        }
      } else if (field.isString && field.parsedConstraints) {
        // Use pre-parsed constraints for string fields
        fieldResult = this.validatePrecompiledStringField(field, value);
      } else {
        // Fallback to original validation for complex types
        fieldResult = this.validateField(field.key, field.originalType, value);
      }

      // Process field result
      if (!fieldResult.success) {
        hasErrors = true;
        // Batch error processing
        for (let j = 0; j < fieldResult.errors.length; j++) {
          errors.push(`${field.key}: ${fieldResult.errors[j]}`);
        }
      } else if (fieldResult.data !== undefined) {
        validatedData[field.key] = fieldResult.data;
      }

      // Batch warning processing
      for (let j = 0; j < fieldResult.warnings.length; j++) {
        warnings.push(`${field.key}: ${fieldResult.warnings[j]}`);
      }
    }

    // Handle extra properties efficiently using pre-computed schema keys
    const inputKeys = Object.keys(data);
    if (this.options.allowUnknown === true) {
      // Allow unknown properties
      for (let i = 0; i < inputKeys.length; i++) {
        const key = inputKeys[i];
        if (!this.schemaKeys.includes(key)) {
          validatedData[key] = data[key];
        }
      }
    } else {
      // Check for extra keys
      const extraKeys: string[] = [];
      for (let i = 0; i < inputKeys.length; i++) {
        const key = inputKeys[i];
        if (!this.schemaKeys.includes(key)) {
          extraKeys.push(key);
        }
      }

      if (extraKeys.length > 0) {
        hasErrors = true;
        errors.push(`Unexpected properties: ${extraKeys.join(", ")}`);
      }
    }

    return {
      success: !hasErrors,
      errors,
      warnings,
      data: hasErrors ? undefined : (validatedData as T),
    };
  }

  /**
   * Validate pre-compiled string field for maximum performance
   */
  private validatePrecompiledStringField(
    field: CompiledField,
    value: any
  ): SchemaValidationResult {
    const { parsedConstraints } = field;
    const { type, constraints, optional: isOptional } = parsedConstraints!;

    // Fast path for undefined/null values
    if (value === undefined) {
      return isOptional
        ? {
            success: true,
            errors: [],
            warnings: [],
            data: this.options.default,
          }
        : {
            success: false,
            errors: ["Required field is missing"],
            warnings: [],
            data: value,
          };
    }

    if (value === null) {
      return isOptional
        ? { success: true, errors: [], warnings: [], data: null }
        : {
            success: false,
            errors: ["Field cannot be null"],
            warnings: [],
            data: value,
          };
    }

    // Handle array types
    if (field.isArray) {
      if (!Array.isArray(value)) {
        return {
          success: false,
          errors: ["Expected array"],
          warnings: [],
          data: value,
        };
      }

      // Check array constraints
      if (
        constraints.minItems !== undefined &&
        value.length < constraints.minItems
      ) {
        return {
          success: false,
          errors: [`Array must have at least ${constraints.minItems} items`],
          warnings: [],
          data: value,
        };
      }

      if (
        constraints.maxItems !== undefined &&
        value.length > constraints.maxItems
      ) {
        return {
          success: false,
          errors: [`Array must have at most ${constraints.maxItems} items`],
          warnings: [],
          data: value,
        };
      }

      // Validate array elements
      const validatedArray: any[] = [];
      const errors: string[] = [];

      for (let i = 0; i < value.length; i++) {
        // Use validateStringFieldType to handle union types properly
        const elementResult = this.validateStringFieldType(
          field.elementType!,
          value[i]
        );
        if (!elementResult.success) {
          errors.push(`Element ${i}: ${elementResult.errors.join(", ")}`);
        } else {
          validatedArray.push(elementResult.data);
        }
      }

      if (errors.length > 0) {
        return { success: false, errors, warnings: [], data: value };
      }

      // Check uniqueness if required
      if (constraints.unique) {
        const uniqueValues = new Set(validatedArray);
        if (uniqueValues.size !== validatedArray.length) {
          return {
            success: false,
            errors: ["Array values must be unique"],
            warnings: [],
            data: value,
          };
        }
      }

      return { success: true, errors: [], warnings: [], data: validatedArray };
    }

    // Handle constant values
    if (type.startsWith("=")) {
      return ValidationHelpers.validateConstantType(type.slice(1), value);
    }

    // Handle union types
    if (type.includes("|")) {
      return ValidationHelpers.validateUnionType(type, value);
    }

    // Handle basic types using pre-parsed constraints
    return ValidationHelpers.routeTypeValidation(
      type,
      value,
      { ...constraints, ...this.options },
      constraints
    );
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
      // conditional validation is handled in the main validation loop
      // This method is only for direct field type validation
      return this.validateStringFieldType(fieldType, value);
    }

    result.success = false;
    result.errors.push(`Unknown field type: ${typeof fieldType}`);
    return result;
  }

  /**
   * Validate string-based field types - optimized version
   */
  private validateStringFieldType(
    fieldType: string,
    value: any
  ): SchemaValidationResult {
    // Parse constraints once
    const {
      type: parsedType,
      constraints,
      optional: isOptional,
    } = ConstraintParser.parseConstraints(fieldType);

    // Fast path for undefined/null values
    if (value === undefined) {
      return isOptional
        ? {
            success: true,
            errors: [],
            warnings: [],
            data: this.options.default,
          }
        : {
            success: false,
            errors: ["Required field is missing"],
            warnings: [],
            data: value,
          };
    }

    if (value === null) {
      return isOptional
        ? { success: true, errors: [], warnings: [], data: null }
        : {
            success: false,
            errors: ["Field cannot be null"],
            warnings: [],
            data: value,
          };
    }

    const isArray = parsedType.endsWith("[]");
    const elementType = isArray ? parsedType.slice(0, -2) : parsedType;

    // Handle array types
    if (isArray) {
      if (!Array.isArray(value)) {
        return {
          success: false,
          errors: ["Expected array"],
          warnings: [],
          data: value,
        };
      }

      // Apply parsed constraints to options, but preserve important options like loose
      const Options = { ...constraints, ...this.options };

      // Check array constraints
      if (Options.minItems !== undefined && value.length < Options.minItems) {
        return {
          success: false,
          errors: [`Array must have at least ${Options.minItems} items`],
          warnings: [],
          data: value,
        };
      }

      if (Options.maxItems !== undefined && value.length > Options.maxItems) {
        return {
          success: false,
          errors: [`Array must have at most ${Options.maxItems} items`],
          warnings: [],
          data: value,
        };
      }

      // Validate array elements
      const validatedArray: any[] = [];
      const errors: string[] = [];

      for (let i = 0; i < value.length; i++) {
        const elementResult = this.validateStringFieldType(
          elementType,
          value[i]
        );
        if (!elementResult.success) {
          errors.push(`Element ${i}: ${elementResult.errors.join(", ")}`);
        } else {
          validatedArray.push(elementResult.data);
        }
      }

      if (errors.length > 0) {
        return { success: false, errors, warnings: [], data: value };
      }

      // Check uniqueness if required
      if (Options.unique) {
        const uniqueValues = new Set(validatedArray);
        if (uniqueValues.size !== validatedArray.length) {
          return {
            success: false,
            errors: ["Array values must be unique"],
            warnings: [],
            data: value,
          };
        }
      }

      return { success: true, errors: [], warnings: [], data: validatedArray };
    }

    // Note: Conditional "when" syntax is handled at the field level, not here

    // Handle constant values (e.g., "=admin", "=user")
    if (elementType.startsWith("=")) {
      return ValidationHelpers.validateConstantType(
        elementType.slice(1),
        value
      );
    }

    // Handle union types (e.g., "pending|accepted|rejected" or "(user|admin|guest)")
    if (elementType.includes("|")) {
      return ValidationHelpers.validateUnionType(elementType, value);
    }

    // Handle basic types - pass the original fieldType to preserve constraints
    return this.validateBasicType(fieldType, value);
  }

  /**
   * Validate basic types with constraints
   */
  private validateBasicType(
    fieldType: string,
    value: any
  ): SchemaValidationResult {
    // Handle union types before constraint parsing (e.g., "(user|admin|guest)")
    if (fieldType.includes("|")) {
      return ValidationHelpers.validateUnionType(fieldType, value);
    }

    // Parse constraints from field type
    const { type, constraints } = ConstraintParser.parseConstraints(fieldType);

    // Apply parsed constraints to options, but preserve important options like loose
    const Options = { ...constraints, ...this.options };

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
    const result = ValidationHelpers.routeTypeValidation(
      type,
      value,
      Options,
      constraints
    );

    return result;
  }

  /**
   * Validate enhanced conditional field using our new AST-based system
   */
  private validateEnhancedConditionalField(
    ast: ConditionalNode,
    value: any,
    fullData: any
  ): SchemaValidationResult {
    try {
      // Evaluate the full conditional to get the expected schema
      const evaluationResult = ConditionalEvaluator.evaluate(ast, fullData, {
        strict: this.options.strict || false,
        debug: true, // Enable debug to get condition result
        schema: this.definition,
        validatePaths: true,
      });

      if (!evaluationResult.success) {
        return {
          success: false,
          errors: evaluationResult.errors,
          warnings: [],
          data: value,
        };
      }

      // Get the expected schema and condition result
      const expectedSchema = evaluationResult.value;
      const conditionIsTrue = evaluationResult.debugInfo?.finalCondition;

      if (expectedSchema === undefined) {
        // No schema constraint, accept the value
        return {
          success: true,
          errors: [],
          warnings: [],
          data: value,
        };
      }

      // CRITICAL FIX: Handle constant values (defaults) properly
      if (
        typeof expectedSchema === "string" &&
        expectedSchema.startsWith("=")
      ) {
        const expectedValue = expectedSchema.slice(1); // Remove the = prefix

        // Handle special constant values
        let actualExpectedValue: any = expectedValue;
        if (expectedValue === "null") {
          actualExpectedValue = null;
        } else if (expectedValue === "true") {
          actualExpectedValue = true;
        } else if (expectedValue === "false") {
          actualExpectedValue = false;
        } else if (/^\d+(\.\d+)?$/.test(expectedValue)) {
          actualExpectedValue = parseFloat(expectedValue);
        } else if (
          expectedValue.startsWith("[") &&
          expectedValue.endsWith("]")
        ) {
          // Handle array constants like ["USD"] or [1,2,3]
          try {
            actualExpectedValue = JSON.parse(expectedValue);
          } catch (error) {
            // If JSON parsing fails, treat as string
            actualExpectedValue = expectedValue;
          }
        } else if (
          expectedValue.startsWith("{") &&
          expectedValue.endsWith("}")
        ) {
          // Handle object constants like {"key": "value"}
          try {
            actualExpectedValue = JSON.parse(expectedValue);
          } catch (error) {
            // If JSON parsing fails, treat as string
            actualExpectedValue = expectedValue;
          }
        }

        // KEY INSIGHT: If we got a constant value, it means the condition was FALSE
        // (runtime property doesn't exist), so we should ALWAYS use the default
        // and IGNORE the user's input entirely
        return {
          success: true,
          errors: [],
          warnings: [],
          data: actualExpectedValue, // Always use default when condition is false
        };
      }

      // Handle non-constant string schemas (like "boolean", "string", etc.)
      // For conditionals, validate user input against the expected type
      if (typeof expectedSchema === "string") {
        if (expectedSchema === "boolean") {
          // Validate that user provided a boolean
          if (typeof value !== "boolean") {
            return {
              success: false,
              errors: [`Expected boolean, got ${typeof value}`],
              warnings: [],
              data: value,
            };
          }
          // Keep user's boolean value
          return {
            success: true,
            errors: [],
            warnings: [],
            data: value,
          };
        }

        if (expectedSchema === "string") {
          // Validate that user provided a string
          if (typeof value !== "string") {
            return {
              success: false,
              errors: [`Expected string, got ${typeof value}`],
              warnings: [],
              data: value,
            };
          }
          // Keep user's string value
          return {
            success: true,
            errors: [],
            warnings: [],
            data: value,
          };
        }

        if (expectedSchema === "number" || expectedSchema === "int") {
          if (typeof value !== "number") {
            return {
              success: false,
              errors: [`Expected number, got ${typeof value}`],
              warnings: [],
              data: value,
            };
          }
          if (expectedSchema === "int" && !Number.isInteger(value)) {
            return {
              success: false,
              errors: [`Expected integer, got ${value}`],
              warnings: [],
              data: value,
            };
          }
          return {
            success: true,
            errors: [],
            warnings: [],
            data: value,
          };
        }

        // Handle array types specially
        if (expectedSchema.endsWith("[]") || expectedSchema.endsWith("[]?")) {
          const isOptional = expectedSchema.endsWith("[]?");

          if (value === null || value === undefined) {
            if (isOptional) {
              return {
                success: true,
                errors: [],
                warnings: [],
                data: value,
              };
            } else {
              return {
                success: false,
                errors: [`Field cannot be null`],
                warnings: [],
                data: value,
              };
            }
          }

          if (!Array.isArray(value)) {
            return {
              success: false,
              errors: [`Expected array, got ${typeof value}`],
              warnings: [],
              data: value,
            };
          }

          // For arrays, just validate that it's an array - don't validate individual elements
          // against the conditional expression since that doesn't make sense
          return {
            success: true,
            errors: [],
            warnings: [],
            data: value,
          };
        }

        return this.validateStringFieldType(expectedSchema, value);
      }

      // Accept the value if we can't determine the schema
      return {
        success: true,
        errors: [],
        warnings: [],
        data: value,
      };
    } catch (error) {
      return {
        success: false,
        errors: [
          `conditional validation error: ${error instanceof Error ? error.message : String(error)}`,
        ],
        warnings: [],
        data: value,
      };
    }
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
