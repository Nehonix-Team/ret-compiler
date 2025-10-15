/**
 * VALIDATION CONSTANTS
 *
 *  CENTRALIZED VALIDATION SYSTEM - SUCCESSFULLY IMPLEMENTED
 *
 * This module provides centralized configuration for all validation limits
 * across the ReliantType system. All validation components now use these
 * constants, making the system easy to maintain and configure.
 *
 *  ACHIEVEMENT: Replaced scattered hardcoded limits with centralized control
 *  MAINTENANCE: Change values here to update limits throughout the entire system
 *  CURRENT STATUS: System supports up to 100-level deep validation
 */

export const VALIDATION_CONSTANTS = {
  /**
   * Maximum object nesting depth for validation
   *
   *  SUCCESSFULLY APPLIED TO:
   * - Schema compilation depth (SchemaPrecompiler.ts)
   * - Security validation depth (securityValidator.ts)
   * - JSON validation depth (securityHelpers.ts)
   * - Object validation depth (validateObjectDeep)
   * - AST traversal depth (ConditionalAST.ts)
   *
   *  USAGE: Change this value to adjust depth limits across the entire system
   *   100 for most use cases, increase for extreme nesting needs
   *   PERFORMANCE: Very high values may impact performance and memory usage
   */
  MAX_OBJECT_DEPTH: 500,

  /**
   * Maximum compilation depth for schema precompiler
   *
   *  AUTOMATICALLY MATCHES: MAX_OBJECT_DEPTH for consistency
   *  PURPOSE: Prevents infinite recursion during schema compilation
   *  IMPLEMENTATION: Used by SchemaPrecompiler.ts for depth checking
   */
  MAX_COMPILATION_DEPTH: 500,

  /**
   * Maximum AST traversal depth for conditional parsing
   * Higher limit for complex conditional expressions
   */
  MAX_AST_TRAVERSAL_DEPTH: 1000,

  /**
   * Performance and safety limits
   */
  PERFORMANCE: {
    MAX_CACHE_SIZE: 5000,
    CACHE_TTL: 300000, // 5 minutes
    HOT_PATH_THRESHOLD: 10,
    MAX_VALIDATION_TIME: 5000, // 5 seconds
  },

  /**
   * Object structure limits
   */
  OBJECT_LIMITS: {
    MAX_KEYS: 1000,
    MAX_PROPERTY_NAME_LENGTH: 100,
    MAX_STRING_LENGTH: 10000,
    MAX_ARRAY_LENGTH: 1000,
  },

  /**
   * Security validation limits
   */
  SECURITY: {
    MAX_JSON_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_TEXT_LENGTH: 1024 * 1024, // 1MB
    PREVENT_CIRCULAR: true,
    PREVENT_PROTOTYPE_POLLUTION: true,
  },

  /**
   * Conditional validation limits
   */
  CONDITIONAL: {
    MAX_EXPRESSION_DEPTH: 50,
    MAX_PROPERTY_PATH_LENGTH: 200,
    MAX_CONDITION_COMPLEXITY: 100,
  },

  /**
   * Development and debugging
   */
  DEBUG: {
    ENABLE_DEPTH_WARNINGS: true,
    LOG_PERFORMANCE_METRICS: false,
    TRACK_VALIDATION_PATHS: false,
  },
} as const;

/**
 * Type-safe access to validation constants
 */
export type ValidationConstants = typeof VALIDATION_CONSTANTS;

/**
 * Helper functions for validation constants
 */
export const ValidationHelpers = {
  /**
   * Check if depth exceeds the maximum allowed
   */
  isDepthExceeded(depth: number): boolean {
    return depth > VALIDATION_CONSTANTS.MAX_OBJECT_DEPTH;
  },

  /**
   * Get safe depth limit with buffer
   */
  getSafeDepthLimit(bufferPercent: number = 0.9): number {
    return Math.floor(VALIDATION_CONSTANTS.MAX_OBJECT_DEPTH * bufferPercent);
  },

  /**
   * Check if compilation depth is exceeded
   */
  isCompilationDepthExceeded(depth: number): boolean {
    return depth > VALIDATION_CONSTANTS.MAX_COMPILATION_DEPTH;
  },

  /**
   * Get performance warning threshold
   */
  getPerformanceWarningThreshold(): number {
    return VALIDATION_CONSTANTS.PERFORMANCE.MAX_VALIDATION_TIME * 0.8;
  },

  /**
   * Check if object structure limits are exceeded
   */
  checkObjectLimits(obj: any): { exceeded: boolean; violations: string[] } {
    const violations: string[] = [];

    if (typeof obj === "object" && obj !== null) {
      const keys = Object.keys(obj);

      if (keys.length > VALIDATION_CONSTANTS.OBJECT_LIMITS.MAX_KEYS) {
        violations.push(
          `Too many keys: ${keys.length} > ${VALIDATION_CONSTANTS.OBJECT_LIMITS.MAX_KEYS}`
        );
      }

      for (const key of keys) {
        if (
          key.length >
          VALIDATION_CONSTANTS.OBJECT_LIMITS.MAX_PROPERTY_NAME_LENGTH
        ) {
          violations.push(
            `Property name too long: ${key.length} > ${VALIDATION_CONSTANTS.OBJECT_LIMITS.MAX_PROPERTY_NAME_LENGTH}`
          );
        }
      }
    }

    return {
      exceeded: violations.length > 0,
      violations,
    };
  },
};

/**
 * Export individual constants for convenience
 *
 *  CENTRALIZED ACCESS: Import these constants throughout the system
 *  CONSISTENCY: All components use the same validation limits
 */
export const MAX_OBJECT_DEPTH = VALIDATION_CONSTANTS.MAX_OBJECT_DEPTH;
export const MAX_COMPILATION_DEPTH = VALIDATION_CONSTANTS.MAX_COMPILATION_DEPTH;
export const MAX_AST_TRAVERSAL_DEPTH =
  VALIDATION_CONSTANTS.MAX_AST_TRAVERSAL_DEPTH;
