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
      lastAccessed: Date.now()
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
      .map(v => v.trim())
      .filter(v => v.length > 0); // Remove empty values

    return new Set(values);
  }

  /**
   * Cleanup old cache entries to prevent memory leaks
   * Removes least recently used entries
   */
  private static cleanupCache(): void {
    const now = Date.now();
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
      entries: Array.from(this.cache.keys())
    };
  }

  /**
   * Clear the entire cache (useful for testing)
   */
  static clearCache(): void {
    this.cache.clear();
  }

  /**
   * Pre-warm cache with common union types
   * Call this during application startup for better performance
   */
  static preWarmCache(commonUnions: string[]): void {
    for (const unionType of commonUnions) {
      this.getCachedUnion(unionType);
    }
  }
}

/**
 * Optimized union validation using cached Sets
 * This should replace the current validateUnionType implementation
 */
export class OptimizedUnionValidator {
  /**
   * Fast union validation with caching
   * Expected to be 2-3x faster than current implementation
   */
  static validateUnion(unionType: string, value: any): { isValid: boolean; error?: string } {
    const allowedValues = UnionCache.getCachedUnion(unionType);
    const stringValue = String(value);

    if (!allowedValues.has(stringValue)) {
      return {
        isValid: false,
        error: `Expected one of: ${Array.from(allowedValues).join(", ")}, got ${value}`
      };
    }

    return { isValid: true };
  }

  /**
   * Batch validation for arrays of union values
   * More efficient than validating one by one
   */
  static validateUnionArray(unionType: string, values: any[]): { 
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
        errors.push(`Index ${i}: Expected one of: ${Array.from(allowedValues).join(", ")}, got ${values[i]}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      validValues
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
  "success|error|warning|info"
];
