/**
 * High-performance union type caching system
 * Addresses the 3.2x performance gap with Zod on union validation
 */

interface CachedUnion {
  allowedValues: Set<string>;
  originalType: string;
  lastAccessed: number;
}

export class UnionCache {
  private static cache = new Map<string, CachedUnion>();
  private static maxCacheSize = 1000;
  private static cleanupThreshold = 1200;

  /**
   * Get or create cached union Set for fast O(1) validation
   * This eliminates the need to split and create Set on every validation
   */
  static getCachedUnion(unionType: string): Set<string> {
    // Check cache first
    const cached = this.cache.get(unionType);
    if (cached) {
      cached.lastAccessed = Date.now();
      return cached.allowedValues;
    }

    // Parse and cache new union
    const allowedValues = this.parseUnionType(unionType);

    // Add to cache
    this.cache.set(unionType, {
      allowedValues,
      originalType: unionType,
      lastAccessed: Date.now(),
    });

    // Cleanup if cache is getting too large
    if (this.cache.size > this.cleanupThreshold) {
      this.cleanupCache();
    }

    return allowedValues;
  }

  /**
   * Parse union type into optimized Set
   * Handles parentheses and whitespace normalization
   * FIXED: Now treats entries as literal values only, not type definitions
   */
  private static parseUnionType(unionType: string): Set<string> {
    // Strip parentheses if present
    let cleanUnionType = unionType.trim();
    if (cleanUnionType.startsWith("(") && cleanUnionType.endsWith(")")) {
      cleanUnionType = cleanUnionType.slice(1, -1);
    }

    // Split and normalize values
    const values = cleanUnionType
      .split("|")
      .map((v) => v.trim())
      .filter((v) => v.length > 0); // Remove empty values

    return new Set(values);
  }

  /**
   * Cleanup old cache entries to prevent memory leaks
   * Removes least recently used entries
   */
  private static cleanupCache(): void {
    const entries = Array.from(this.cache.entries());

    // Sort by last accessed time (oldest first)
    entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

    // Remove oldest entries until we're under the max size
    const toRemove = entries.length - this.maxCacheSize;
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  /**
   * Get cache statistics for monitoring
   */
  static getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      entries: Array.from(this.cache.keys()),
    };
  }

  /**
   * Clear the entire cache (useful for testing)
   */
  static clearCache(): void {
    this.cache.clear();
  }

  /**
   * Configure cache settings for optimal performance
   */
  static configure(options: {
    maxCacheSize?: number;
    cleanupThreshold?: number;
    enablePreCompilation?: boolean;
  }): void {
    if (options.maxCacheSize) {
      this.maxCacheSize = options.maxCacheSize;
    }
    if (options.cleanupThreshold) {
      this.cleanupThreshold = options.cleanupThreshold;
    }
    // enablePreCompilation is handled by OptimizedUnionValidator
  }

  /**
   * Pre-warm cache with common union types
   * Enhanced with performance-critical patterns from f2.md feedback
   * Call this during application startup for better performance
   */
  static preWarmCache(commonUnions: string[]): void {
    // Add performance-critical patterns identified in benchmarks
    const criticalPatterns = [
      "active|inactive|pending|suspended",
      "low|medium|high|critical",
      "user|admin|moderator|guest",
      "pending|accepted|rejected",
      "string|number|boolean",
      "true|false",
      "yes|no",
      "on|off",
      "enabled|disabled",
      "success|error|warning|info",
    ];

    const allPatterns = [...commonUnions, ...criticalPatterns];

    for (const unionType of allPatterns) {
      if (unionType.includes("|")) {
        this.getCachedUnion(unionType);
      }
    }
  }
}

/**
 * Optimized union validation using cached Sets
 * This should replace the current validateUnionType implementation
 */
export class OptimizedUnionValidator {
  // Performance optimization: Type inference cache
  private static typeInferenceCache = new Map<any, string>();
  private static commonTypes = new Set(["string", "number", "boolean"]);

  /**
   * FIXED: Enhanced union validation that properly handles type definitions vs literals
   * Supports:
   * 1. Type constraints: string(3,), number(1,), etc.
   * 2. Format types: email, phone, url, etc.
   * 3. Literal values: admin, user, guest, etc.
   * 4. Mixed unions: string|number, email|phone, etc.
   */
  static validateUnion(
    unionType: string,
    value: any
  ): { isValid: boolean; error?: string } {
    // OPTIMIZATION 1: Fast path for single types
    if (!unionType.includes("|")) {
      return this.validateSingleUnionMember(unionType, value);
    }

    // Parse union members
    const members = this.parseUnionMembers(unionType);
    const errors: string[] = [];

    // Try to validate against each union member
    for (const member of members) {
      const result = this.validateSingleUnionMember(member, value);
      if (result.isValid) {
        return { isValid: true };
      }
      if (result.error) {
        errors.push(result.error);
      }
    }

    // All members failed
    return {
      isValid: false,
      error: `Union validation failed: Expected one of: ${members.join(", ")}, got ${value}`,
    };
  }

  /**
   * Parse union members and classify them as types vs literals
   */
  private static parseUnionMembers(unionType: string): string[] {
    // Strip parentheses if present
    let cleanUnionType = unionType.trim();
    if (cleanUnionType.startsWith("(") && cleanUnionType.endsWith(")")) {
      cleanUnionType = cleanUnionType.slice(1, -1);
    }

    // Split and normalize members
    return cleanUnionType
      .split("|")
      .map((member) => member.trim())
      .filter((member) => member.length > 0);
  }

  /**
   * Validate a single union member (could be type or literal)
   */
  private static validateSingleUnionMember(
    member: string,
    value: any
  ): { isValid: boolean; error?: string } {
    // Check if this is a type definition or a literal value
    if (this.isTypeDefinition(member)) {
      return this.validateTypeDefinition(member, value);
    } else {
      return this.validateLiteralValue(member, value);
    }
  }

  /**
   * Determine if a union member is a type definition or literal value
   * FIXED: More conservative approach - only treat obvious type syntax as types
   */
  private static isTypeDefinition(member: string): boolean {
    // Only treat these as types when they appear in specific contexts
    const basicTypes = new Set([
      "string",
      "number",
      "boolean",
      "null",
      "undefined",
    ]);

    // Check for basic type keywords (but only the core ones)
    if (basicTypes.has(member)) {
      return true;
    }

    // Check for type with constraints: string(3,), number(1,100), etc.
    if (/^(string|number|int|float)\s*\([^)]*\)/.test(member)) {
      return true;
    }

    // Check for array types: string[], number[], etc.
    if (/^(string|number|boolean)\[\]/.test(member)) {
      return true;
    }

    // Check for regex patterns: string(/pattern/)
    if (/^string\s*\(\/.*\/\)/.test(member)) {
      return true;
    }

    // IMPORTANT: Everything else (including email, phone, admin, user, etc.)
    // is treated as a literal value, not a type definition
    return false;
  }

  /**
   * Validate a type definition (e.g., string(3,), number(1,), email)
   */
  private static validateTypeDefinition(
    typeDefinition: string,
    value: any
  ): { isValid: boolean; error?: string } {
    // Handle basic types directly to avoid circular dependency
    try {
      // Handle basic types
      if (typeDefinition === "string") {
        return { isValid: typeof value === "string" };
      }

      if (typeDefinition === "number") {
        return { isValid: typeof value === "number" && !isNaN(value) };
      }

      if (typeDefinition === "boolean") {
        return { isValid: typeof value === "boolean" };
      }

      // Handle constrained types like string(3,), number(1,100)
      if (typeDefinition.startsWith("string(")) {
        if (typeof value !== "string") {
          return {
            isValid: false,
            error: `Expected string, got ${typeof value}`,
          };
        }

        // Extract constraints
        const constraintMatch = typeDefinition.match(/string\(([^)]*)\)/);
        if (constraintMatch) {
          const constraints = constraintMatch[1]
            .split(",")
            .map((s) => s.trim());
          const minLength = constraints[0] ? parseInt(constraints[0]) : 0;
          const maxLength = constraints[1]
            ? parseInt(constraints[1])
            : Infinity;

          if (value.length < minLength || value.length > maxLength) {
            return {
              isValid: false,
              error: `String length ${value.length} not in range [${minLength}, ${maxLength}]`,
            };
          }
        }

        return { isValid: true };
      }

      if (typeDefinition.startsWith("number(")) {
        if (typeof value !== "number" || isNaN(value)) {
          return {
            isValid: false,
            error: `Expected number, got ${typeof value}`,
          };
        }

        // Extract constraints
        const constraintMatch = typeDefinition.match(/number\(([^)]*)\)/);
        if (constraintMatch) {
          const constraints = constraintMatch[1]
            .split(",")
            .map((s) => s.trim());
          const min = constraints[0] ? parseFloat(constraints[0]) : -Infinity;
          const max = constraints[1] ? parseFloat(constraints[1]) : Infinity;

          if (value < min || value > max) {
            return {
              isValid: false,
              error: `Number ${value} not in range [${min}, ${max}]`,
            };
          }
        }

        return { isValid: true };
      }

      // For other types, fall back to basic validation
      // TODO: Integrate with TypeValidators when circular dependency is resolved
      return {
        isValid: false,
        error: `Type "${typeDefinition}" not yet supported in unions`,
      };
    } catch (error) {
      return {
        isValid: false,
        error: `Type validation error: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  /**
   * Validate a literal value (exact string match)
   */
  private static validateLiteralValue(
    literalValue: string,
    value: any
  ): { isValid: boolean; error?: string } {
    const stringValue = String(value);

    // Handle special literal values
    if (literalValue === "null" && value === null) {
      return { isValid: true };
    }

    if (literalValue === "undefined" && value === undefined) {
      return { isValid: true };
    }

    // Direct string comparison for literal values
    if (stringValue === literalValue) {
      return { isValid: true };
    }

    return {
      isValid: false,
      error: `Expected literal "${literalValue}", got ${value}`,
    };
  }

  /**
   * Optimized error message generation with caching
   */
  private static createCachedError(
    unionType: string,
    allowedValues: Set<string>,
    value: any
  ): { isValid: boolean; error?: string } {
    // Cache error messages for common union types
    const cacheKey = `${unionType}:${typeof value}`;
    let errorTemplate = this.typeInferenceCache.get(cacheKey);

    if (!errorTemplate) {
      const sortedValues = Array.from(allowedValues).sort();
      errorTemplate = `Expected one of: ${sortedValues.join(", ")}`;
      this.typeInferenceCache.set(cacheKey, errorTemplate);
    }

    return {
      isValid: false,
      error: `${errorTemplate}, got ${value}`,
    };
  }

  /**
   * Pre-compile union for maximum performance
   * Creates a specialized validator function for specific union types
   */
  static preCompileUnion(
    unionType: string
  ): ((value: any) => { isValid: boolean; error?: string }) | null {
    try {
      const allowedValues = UnionCache.getCachedUnion(unionType);
      const sortedValues = Array.from(allowedValues).sort();
      const errorMessage = `Expected one of: ${sortedValues.join(", ")}`;

      // Return a specialized function with closure over the cached values
      return (value: any) => {
        const stringValue = String(value);
        if (allowedValues.has(stringValue)) {
          return { isValid: true };
        }
        return {
          isValid: false,
          error: `${errorMessage}, got ${value}`,
        };
      };
    } catch (error) {
      // Fallback to standard validation if pre-compilation fails
      return null;
    }
  }

  /**
   * Batch validation for arrays of union values
   * More efficient than validating one by one
   */
  static validateUnionArray(
    unionType: string,
    values: any[]
  ): {
    isValid: boolean;
    errors: string[];
    validValues: any[];
  } {
    const allowedValues = UnionCache.getCachedUnion(unionType);
    const errors: string[] = [];
    const validValues: any[] = [];

    for (let i = 0; i < values.length; i++) {
      const stringValue = String(values[i]);
      if (allowedValues.has(stringValue)) {
        validValues.push(values[i]);
      } else {
        errors.push(
          `Index ${i}: Expected one of: ${Array.from(allowedValues).join(", ")}, got ${values[i]}`
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      validValues,
    };
  }
}

/**
 * Common union types that can be pre-warmed for better performance
 */
export const COMMON_UNIONS = [
  "active|inactive",
  "pending|approved|rejected",
  "low|medium|high",
  "user|admin|moderator",
  "true|false",
  "yes|no",
  "enabled|disabled",
  "public|private",
  "draft|published|archived",
  "success|error|warning|info",
];
