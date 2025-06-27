/**
 * ULTRA-PERFORMANCE Schema Precompilation Module
 *
 * This module precompiles entire schemas at creation time to eliminate
 * runtime overhead while maintaining full security and validation.
 *
 */

import { SchemaValidationResult } from "../../../../types/types";
import { SchemaOptions } from "../Interface";
import { FieldPrecompilers, CompiledFieldValidator } from "./FieldPrecompilers";
import { MAX_COMPILATION_DEPTH as IMPORTED_MAX_COMPILATION_DEPTH } from "../../../../../constants/VALIDATION_CONSTANTS";

// Precompiled validator function signature
export interface PrecompiledValidator {
  (data: any): SchemaValidationResult;
  _isPrecompiled: true;
  _schemaHash: string;
  _optimizationLevel: OptimizationLevel;
}

export enum OptimizationLevel {
  NONE = 0,
  BASIC = 1,
  AGGRESSIVE = 2,
  ULTRA = 3,
}

interface FieldCompilation {
  fieldName: string;
  fieldType: string;
  validator: (value: any) => SchemaValidationResult;
  isOptional: boolean;
  hasDefault: boolean;
  defaultValue?: any;
  // Performance flags
  isSimpleType: boolean;
  isUnion: boolean;
  isArray: boolean;
  isNested: boolean;
}

interface SchemaCompilation {
  fields: FieldCompilation[];
  validator: PrecompiledValidator;
  optimizationLevel: OptimizationLevel;
  compilationTime: number;
  estimatedPerformanceGain: number;
}

export class SchemaPrecompiler {
  private static compilationCache = new Map<string, SchemaCompilation>();
  private static performanceStats = {
    compilations: 0,
    cacheHits: 0,
    totalCompilationTime: 0,
    averageSpeedup: 0,
  };

  // SAFETY: Track compilation depth to prevent infinite recursion
  private static compilationDepth = 0;
  private static readonly MAX_COMPILATION_DEPTH =
    IMPORTED_MAX_COMPILATION_DEPTH;

  // SAFETY: Track circular references
  private static compilationStack = new Set<string>();

  /**
   * MAIN ENTRY POINT: Precompile entire schema for maximum performance
   */
  static precompileSchema(
    schemaDefinition: Record<string, any>,
    options: SchemaOptions = {}
  ): PrecompiledValidator {
    const startTime = performance.now();

    // SAFETY: Check compilation depth to prevent infinite recursion
    if (this.compilationDepth >= this.MAX_COMPILATION_DEPTH) {
      throw new Error(
        `Schema compilation depth exceeded (${this.MAX_COMPILATION_DEPTH}). Possible circular reference detected.`
      );
    }

    // Generate cache key
    const schemaHash = this.generateSchemaHash(schemaDefinition, options);

    // SAFETY: Check for circular references
    if (this.compilationStack.has(schemaHash)) {
      throw new Error(
        `Circular reference detected in schema compilation: ${schemaHash}`
      );
    }

    // Check cache first
    const cached = this.compilationCache.get(schemaHash);
    if (cached) {
      this.performanceStats.cacheHits++;
      return cached.validator;
    }

    // SAFETY: Track compilation
    this.compilationDepth++;
    this.compilationStack.add(schemaHash);

    try {
      // Analyze schema complexity and determine optimization level
      const optimizationLevel = this.analyzeOptimizationLevel(schemaDefinition);

      // Compile fields
      const compiledFields = this.compileFields(schemaDefinition, options);

      // Generate ultra-optimized validator
      const validator = this.generateOptimizedValidator(
        compiledFields,
        optimizationLevel,
        schemaHash
      );

      const compilationTime = performance.now() - startTime;

      // Cache the compilation
      const compilation: SchemaCompilation = {
        fields: compiledFields,
        validator,
        optimizationLevel,
        compilationTime,
        estimatedPerformanceGain: this.estimatePerformanceGain(compiledFields),
      };

      this.compilationCache.set(schemaHash, compilation);
      this.performanceStats.compilations++;
      this.performanceStats.totalCompilationTime += compilationTime;

      return validator;
    } catch (error) {
      // console.error('Schema precompilation failed:', error);
      throw error;
    } finally {
      this.compilationDepth--;
      this.compilationStack.delete(schemaHash);
    }
  }

  /**
   * ULTRA-FAST: Generate specialized validator based on schema patterns
   */
  private static generateOptimizedValidator(
    fields: FieldCompilation[],
    optimizationLevel: OptimizationLevel,
    schemaHash: string
  ): PrecompiledValidator {
    // For ULTRA optimization, generate specialized code paths
    if (optimizationLevel === OptimizationLevel.ULTRA) {
      return this.generateUltraOptimizedValidator(fields, schemaHash);
    }

    // For AGGRESSIVE optimization, use compiled field validators
    if (optimizationLevel === OptimizationLevel.AGGRESSIVE) {
      return this.generateAggressiveValidator(fields, schemaHash);
    }

    // For BASIC optimization, use cached validators
    return this.generateBasicValidator(fields, schemaHash);
  }

  /**
   * ULTRA-OPTIMIZED: Generate the fastest possible validator
   * Uses specialized code paths for common patterns
   */
  private static generateUltraOptimizedValidator(
    fields: FieldCompilation[],
    schemaHash: string
  ): PrecompiledValidator {
    // Pre-allocate result objects for zero-allocation validation
    const successResult: SchemaValidationResult = Object.freeze({
      success: true,
      errors: [],
      warnings: [],
      data: null as any, // Will be set during validation
    });

    // Separate fields by type for specialized handling
    const simpleFields = fields.filter((f) => f.isSimpleType);
    const unionFields = fields.filter((f) => f.isUnion);
    const arrayFields = fields.filter((f) => f.isArray);
    const nestedFields = fields.filter((f) => f.isNested);

    const validator = (data: any): SchemaValidationResult => {
      // ULTRA-FAST: Type check with early return
      if (typeof data !== "object" || data === null) {
        return {
          success: false,
          errors: ["Expected object"],
          warnings: [],
          data: undefined,
        };
      }

      const validatedData: any = {};
      const errors: string[] = [];

      // OPTIMIZED: Process simple fields first (fastest path)
      for (const field of simpleFields) {
        const value = data[field.fieldName];
        const result = field.validator(value);

        if (!result.success) {
          errors.push(`${field.fieldName}: ${result.errors.join(", ")}`);
        } else {
          validatedData[field.fieldName] = result.data;
        }
      }

      // OPTIMIZED: Process union fields with precompiled validators
      for (const field of unionFields) {
        const value = data[field.fieldName];
        const result = field.validator(value);

        if (!result.success) {
          errors.push(`${field.fieldName}: ${result.errors.join(", ")}`);
        } else {
          validatedData[field.fieldName] = result.data;
        }
      }

      // OPTIMIZED: Process array fields
      for (const field of arrayFields) {
        const value = data[field.fieldName];
        const result = field.validator(value);

        if (!result.success) {
          errors.push(`${field.fieldName}: ${result.errors.join(", ")}`);
        } else {
          validatedData[field.fieldName] = result.data;
        }
      }

      // OPTIMIZED: Process nested fields last
      for (const field of nestedFields) {
        const value = data[field.fieldName];
        const result = field.validator(value);

        if (!result.success) {
          errors.push(`${field.fieldName}: ${result.errors.join(", ")}`);
        } else {
          validatedData[field.fieldName] = result.data;
        }
      }

      // ULTRA-FAST: Return result
      if (errors.length === 0) {
        return {
          success: true,
          errors: [],
          warnings: [],
          data: validatedData,
        };
      } else {
        return {
          success: false,
          errors,
          warnings: [],
          data: undefined,
        };
      }
    };

    // Mark as precompiled
    (validator as any)._isPrecompiled = true;
    (validator as any)._schemaHash = schemaHash;
    (validator as any)._optimizationLevel = OptimizationLevel.ULTRA;

    return validator as PrecompiledValidator;
  }

  /**
   * Analyze schema to determine optimal optimization level
   */
  private static analyzeOptimizationLevel(
    schema: Record<string, any>
  ): OptimizationLevel {
    const fieldCount = Object.keys(schema).length;
    let complexityScore = 0;

    for (const [key, value] of Object.entries(schema)) {
      if (typeof value === "string") {
        if (value.includes("|")) complexityScore += 2; // Union
        if (value.includes("[]")) complexityScore += 2; // Array
        if (value.includes("when")) complexityScore += 5; // Conditional
        if (value.includes("(")) complexityScore += 1; // Constraints
      } else if (typeof value === "object") {
        complexityScore += 10; // Nested object
      }
    }

    // Determine optimization level based on complexity
    if (fieldCount <= 5 && complexityScore <= 10) {
      return OptimizationLevel.ULTRA;
    } else if (fieldCount <= 15 && complexityScore <= 30) {
      return OptimizationLevel.AGGRESSIVE;
    } else if (fieldCount <= 50) {
      return OptimizationLevel.BASIC;
    } else {
      return OptimizationLevel.NONE;
    }
  }

  /**
   * Generate schema hash for caching
   */
  private static generateSchemaHash(
    schema: Record<string, any>,
    options: SchemaOptions
  ): string {
    const schemaStr = JSON.stringify(schema, Object.keys(schema).sort());
    const optionsStr = JSON.stringify(options);
    return `${this.simpleHash(schemaStr)}_${this.simpleHash(optionsStr)}`;
  }

  private static simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Compile individual fields with specialized optimizations
   */
  private static compileFields(
    schema: Record<string, any>,
    options: SchemaOptions
  ): FieldCompilation[] {
    const fields: FieldCompilation[] = [];

    for (const [fieldName, fieldType] of Object.entries(schema)) {
      const compilation = this.compileField(fieldName, fieldType, options, 0);
      fields.push(compilation);
    }

    return fields;
  }

  /**
   * Compile a single field with maximum optimization
   */
  private static compileField(
    fieldName: string,
    fieldType: any,
    options: SchemaOptions,
    depth: number = 0
  ): FieldCompilation {
    // Handle nested objects properly
    if (
      typeof fieldType === "object" &&
      fieldType !== null &&
      !Array.isArray(fieldType)
    ) {
      // This is a nested object - create a validator that recursively validates the nested schema
      const validator = (value: any): SchemaValidationResult => {
        if (
          typeof value !== "object" ||
          value === null ||
          Array.isArray(value)
        ) {
          return {
            success: false,
            errors: ["Expected object"],
            warnings: [],
            data: undefined,
          };
        }

        // Recursively validate nested object with depth tracking
        const validatedData: any = {};
        const errors: string[] = [];
        const warnings: string[] = [];

        for (const [key, nestedFieldType] of Object.entries(fieldType)) {
          const nestedValue = value[key];

          // For nested fields, use FieldPrecompilers directly for string types
          if (typeof nestedFieldType === "string") {
            const fieldValidator =
              FieldPrecompilers.parseAndCompile(nestedFieldType);
            const result = fieldValidator(nestedValue);

            if (!result.success) {
              errors.push(`${key}: ${result.errors.join(", ")}`);
            } else {
              validatedData[key] = result.data;
              if (result.warnings) warnings.push(...result.warnings);
            }
          } else if (
            typeof nestedFieldType === "object" &&
            nestedFieldType !== null
          ) {
            // For nested objects, validate recursively with depth limit
            if (depth < this.MAX_COMPILATION_DEPTH - 1) {
              // Safe to recurse - compile and validate the nested object
              const nestedField = this.compileField(
                key,
                nestedFieldType,
                options,
                depth + 1
              );
              const nestedResult = nestedField.validator(nestedValue);

              if (!nestedResult.success) {
                errors.push(`${key}: ${nestedResult.errors.join(", ")}`);
              } else {
                validatedData[key] = nestedResult.data;
                if (nestedResult.warnings)
                  warnings.push(...nestedResult.warnings);
              }
            } else {
              // Depth limit reached - do basic type checking only
              if (typeof nestedValue === "object" && nestedValue !== null) {
                validatedData[key] = nestedValue;
                warnings.push(
                  `${key}: Maximum nesting depth reached - basic validation only`
                );
              } else {
                errors.push(`${key}: Expected object`);
              }
            }
          } else {
            // Unknown field type
            errors.push(`${key}: Unknown field type`);
          }
        }

        return {
          success: errors.length === 0,
          errors,
          warnings,
          data: errors.length === 0 ? validatedData : undefined,
        };
      };

      return {
        fieldName,
        fieldType: "[nested object]",
        validator: validator as CompiledFieldValidator,
        isOptional: false,
        hasDefault: false,
        isSimpleType: false,
        isUnion: false,
        isArray: false,
        isNested: true,
      };
    }

    // Handle string field types
    const fieldTypeStr = String(fieldType);

    // Create precompiled validator for this field
    const validator = FieldPrecompilers.parseAndCompile(fieldTypeStr);

    return {
      fieldName,
      fieldType: fieldTypeStr,
      validator,
      isOptional: fieldTypeStr.includes("?"),
      hasDefault: false, // TODO: Extract default values
      isSimpleType: this.isSimpleType(fieldType),
      isUnion: fieldTypeStr.includes("|"),
      isArray: fieldTypeStr.includes("[]"),
      isNested: typeof fieldType === "object",
    };
  }

  private static isSimpleType(fieldType: any): boolean {
    if (typeof fieldType !== "string") return false;

    // Handle constants (=value) as simple types
    if (fieldType.startsWith("=")) return true;

    const simpleTypes = [
      "string",
      "number",
      "boolean",
      "int",
      "float",
      "date",
      "any",
      // Format types
      "email",
      "url",
      "uuid",
      "phone",
      "slug",
      "username",
      "ip",
      "json",
      "password",
      "text",
      "object",
      // New types
      "hexcolor",
      "base64",
      "jwt",
      "semver",
    ];
    return simpleTypes.some((type) => fieldType.startsWith(type));
  }

  private static generateAggressiveValidator(
    fields: FieldCompilation[],
    schemaHash: string
  ): PrecompiledValidator {
    // AGGRESSIVE optimization: Use the basic validator for now
    // TODO: Implement more aggressive optimizations like field grouping, early exits, etc.
    const basicValidator = this.generateBasicValidator(fields, schemaHash);

    // Mark as aggressive optimization level
    (basicValidator as any)._optimizationLevel = OptimizationLevel.AGGRESSIVE;

    return basicValidator;
  }

  private static generateBasicValidator(
    fields: FieldCompilation[],
    schemaHash: string
  ): PrecompiledValidator {
    // BASIC optimization: Use compiled field validators with simple iteration
    const validator = (data: any): SchemaValidationResult => {
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

      // Validate each field using compiled validators
      for (const field of fields) {
        const value = data[field.fieldName];

        // Handle optional fields
        if (value === undefined) {
          if (!field.isOptional) {
            errors.push(`${field.fieldName}: Required field is missing`);
          } else if (field.hasDefault) {
            validatedData[field.fieldName] = field.defaultValue;
          }
          continue;
        }

        // Use the compiled field validator
        const result = field.validator(value);
        if (!result.success) {
          errors.push(`${field.fieldName}: ${result.errors.join(", ")}`);
        } else {
          validatedData[field.fieldName] = result.data;
        }

        // Collect warnings
        if (result.warnings && result.warnings.length > 0) {
          warnings.push(...result.warnings);
        }
      }

      // Return validation result
      if (errors.length === 0) {
        return {
          success: true,
          errors: [],
          warnings,
          data: validatedData,
        };
      } else {
        return {
          success: false,
          errors,
          warnings,
          data: undefined,
        };
      }
    };

    (validator as any)._isPrecompiled = true;
    (validator as any)._schemaHash = schemaHash;
    (validator as any)._optimizationLevel = OptimizationLevel.BASIC;

    return validator as PrecompiledValidator;
  }

  private static estimatePerformanceGain(fields: FieldCompilation[]): number {
    // Estimate performance gain based on field types
    let gain = 1.0;
    for (const field of fields) {
      if (field.isUnion) gain += 0.5;
      if (field.isArray) gain += 0.3;
      if (field.isSimpleType) gain += 0.2;
    }
    return Math.min(gain, 5.0); // Cap at 5x improvement
  }

  /**
   * Get compilation statistics
   */
  static getStats() {
    return { ...this.performanceStats };
  }

  /**
   * Clear compilation cache
   */
  static clearCache(): void {
    this.compilationCache.clear();
    this.performanceStats = {
      compilations: 0,
      cacheHits: 0,
      totalCompilationTime: 0,
      averageSpeedup: 0,
    };
  }
}
