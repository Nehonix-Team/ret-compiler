/**
 * Production Object Validation Cache System
 * 
 * High-performance caching for object validation with intelligent
 * hot-path optimization and memory management.
 */

import { SchemaValidationResult } from "../../types/types";
import type {CachedValidation, ValidationPath} from "../../types/objValidationCache"
// Fast hash function for objects
function djb2Hash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

// Optimized object key extractor
function getObjectKeys(obj: any): string {
  if (typeof obj !== 'object' || obj === null) return typeof obj;
  
  const keys = [];
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) keys.push(key);
  }
  return keys.sort().join(',');
}

export class ObjectValidationCache {
  private static cache = new Map<string, CachedValidation>();
  private static pathCache = new Map<string, ValidationPath>();
  private static structureCache = new Map<string, (value: any) => SchemaValidationResult>();
  private static hotPaths = new Set<string>();
  
  private static readonly MAX_CACHE_SIZE = 5000;
  private static readonly HOT_PATH_THRESHOLD = 10;
  private static readonly CACHE_TTL = 300000; // 5 minutes

  private static stats = {
    hits: 0,
    misses: 0,
    hotPathHits: 0,
    structureHits: 0,
    evictions: 0 
  };

  /**
   * Get cached validation result or compute and cache new one
   */
  static getCachedValidation(
    value: any,
    validator: (value: any) => SchemaValidationResult,
    path: string[] = []
  ): SchemaValidationResult {
    const cacheKey = this.generateCacheKey(value, path);
    const structureHash = this.generateStructureHash(value);
    
    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      cached.accessCount++;
      cached.lastAccessed = Date.now();
      this.stats.hits++;
      
      // Mark as hot path if accessed frequently
      if (cached.accessCount >= this.HOT_PATH_THRESHOLD) {
        this.markAsHotPath(path);
        this.stats.hotPathHits++;
      }
      
      return cached.result;
    }

    this.stats.misses++;

    // Compute validation
    const startTime = Date.now();
    const result = validator(value);
    const validationTime = Date.now() - startTime;

    // Cache the result
    const cacheEntry: CachedValidation = {
      result,
      structureHash,
      accessCount: 1,
      lastAccessed: Date.now(),
      validationTime
    };

    this.cache.set(cacheKey, cacheEntry);
    this.updatePathStatistics(path, validationTime);
    this.cleanupCache();

    return result;
  }

  /**
   * Optimized validation for nested objects
   */
  static validateNestedObject(
    value: any,
    schema: Record<string, any>,
    path: string[] = []
  ): SchemaValidationResult {
    if (typeof value !== 'object' || value === null) {
      return {
        success: false,
        errors: ['Expected object'],
        warnings: [],
        data: value
      };
    }

    // Check if this is a hot path
    const pathKey = path.join('.');
    if (this.hotPaths.has(pathKey)) {
      return this.validateHotPath(value, schema, path);
    }

    // Standard nested validation with caching
    return this.validateWithStructuralCaching(value, schema, path);
  }

  /**
   * Optimized validation for frequently accessed paths
   */
  private static validateHotPath(
    value: any,
    schema: Record<string, any>,
    path: string[]
  ): SchemaValidationResult {
    const pathKey = path.join('.');
    const cachedPath = this.pathCache.get(pathKey);
    
    if (cachedPath) {
      return cachedPath.validator(value);
    }

    // Compile optimized validator for this hot path
    const optimizedValidator = this.compileHotPathValidator(schema);
    
    this.pathCache.set(pathKey, {
      path,
      validator: optimizedValidator,
      isHotPath: true,
      avgValidationTime: 0
    });

    return optimizedValidator(value);
  }

  /**
   * Validation with structural caching
   */
  private static validateWithStructuralCaching(
    value: any,
    schema: Record<string, any>,
    path: string[]
  ): SchemaValidationResult {
    const structureKey = this.generateStructureKey(schema);
    
    // Check if we have a cached structure validator
    let structureValidator = this.structureCache.get(structureKey);
    if (!structureValidator) {
      structureValidator = this.compileStructureValidator(schema);
      this.structureCache.set(structureKey, structureValidator);
      this.stats.structureHits++;
    }

    return structureValidator(value);
  }

  /**
   * Compile optimized validator for hot paths
   */
  private static compileHotPathValidator(
    schema: Record<string, any>
  ): (value: any) => SchemaValidationResult {
    // Pre-compile field validators for maximum performance
    const validationChecks: Array<(value: any, errors: string[], data: any) => void> = [];
    
    for (const [key, fieldType] of Object.entries(schema)) {
      const isOptional = this.isOptional(fieldType);
      const cleanType = isOptional ? fieldType.slice(0, -1) : fieldType;
      
      // Create optimized validation function for this field
      const fieldValidator = this.createFieldValidator(key, cleanType, isOptional);
      validationChecks.push(fieldValidator);
    }

    // Return highly optimized validator
    return (value: any): SchemaValidationResult => {
      const errors: string[] = [];
      const validatedData: any = {};

      // Execute all field validations in a tight loop
      for (let i = 0; i < validationChecks.length; i++) {
        validationChecks[i](value, errors, validatedData);
      }

      return {
        success: errors.length === 0,
        errors,
        warnings: [],
        data: validatedData
      };
    };
  }

  /**
   * Create optimized field validator
   */
  private static createFieldValidator(
    key: string, 
    fieldType: string, 
    isOptional: boolean
  ): (value: any, errors: string[], data: any) => void {
    // Pre-compile type checking logic
    if (fieldType === 'string') {
      return (value: any, errors: string[], data: any) => {
        const fieldValue = value[key];
        if (fieldValue === undefined) {
          if (!isOptional) errors.push(`${key}: Required field is missing`);
        } else if (typeof fieldValue !== 'string') {
          errors.push(`${key}: Expected string, got ${typeof fieldValue}`);
        } else {
          data[key] = fieldValue;
        }
      };
    }
    
    if (fieldType === 'number') {
      return (value: any, errors: string[], data: any) => {
        const fieldValue = value[key];
        if (fieldValue === undefined) {
          if (!isOptional) errors.push(`${key}: Required field is missing`);
        } else if (typeof fieldValue !== 'number' || isNaN(fieldValue)) {
          errors.push(`${key}: Expected number, got ${typeof fieldValue}`);
        } else {
          data[key] = fieldValue;
        }
      };
    }
    
    if (fieldType === 'boolean') {
      return (value: any, errors: string[], data: any) => {
        const fieldValue = value[key];
        if (fieldValue === undefined) {
          if (!isOptional) errors.push(`${key}: Required field is missing`);
        } else if (typeof fieldValue !== 'boolean') {
          errors.push(`${key}: Expected boolean, got ${typeof fieldValue}`);
        } else {
          data[key] = fieldValue;
        }
      };
    }
    
    if (fieldType.includes('|')) {
      const allowedValues = new Set(fieldType.split('|').map(v => v.trim()));
      return (value: any, errors: string[], data: any) => {
        const fieldValue = value[key];
        if (fieldValue === undefined) {
          if (!isOptional) errors.push(`${key}: Required field is missing`);
        } else if (!allowedValues.has(String(fieldValue))) {
          errors.push(`${key}: Value must be one of: ${Array.from(allowedValues).join(', ')}`);
        } else {
          data[key] = fieldValue;
        }
      };
    }
    
    // Array type
    if (fieldType.endsWith('[]')) {
      const itemType = fieldType.slice(0, -2);
      return (value: any, errors: string[], data: any) => {
        const fieldValue = value[key];
        if (fieldValue === undefined) {
          if (!isOptional) errors.push(`${key}: Required field is missing`);
        } else if (!Array.isArray(fieldValue)) {
          errors.push(`${key}: Expected array, got ${typeof fieldValue}`);
        } else {
          data[key] = fieldValue;
        }
      };
    }
    
    // Default validator
    return (value: any, errors: string[], data: any) => {
      const fieldValue = value[key];
      if (fieldValue === undefined && !isOptional) {
        errors.push(`${key}: Required field is missing`);
      } else if (fieldValue !== undefined) {
        data[key] = fieldValue;
      }
    };
  }

  /**
   * Compile structure validator
   */
  private static compileStructureValidator(
    schema: Record<string, any>
  ): (value: any) => SchemaValidationResult {
    const schemaKeys = Object.keys(schema);
    const requiredFields = schemaKeys.filter(key => !this.isOptional(schema[key]));
    
    return (value: any): SchemaValidationResult => {
      const errors: string[] = [];
      const validatedData: any = {};

      // Check required fields first
      for (let i = 0; i < requiredFields.length; i++) {
        const key = requiredFields[i];
        if (value[key] === undefined) {
          errors.push(`${key}: Required field is missing`);
        }
      }

      // Process all fields
      for (let i = 0; i < schemaKeys.length; i++) {
        const key = schemaKeys[i];
        const fieldValue = value[key];
        
        if (fieldValue !== undefined) {
          validatedData[key] = fieldValue;
        }
      }

      return {
        success: errors.length === 0,
        errors,
        warnings: [],
        data: validatedData
      };
    };
  }

  /**
   * Check if field type is optional
   */
  private static isOptional(fieldType: any): boolean {
    return typeof fieldType === 'string' && fieldType.endsWith('?');
  }

  /**
   * Mark path as hot path for optimization
   */
  private static markAsHotPath(path: string[]): void {
    const pathKey = path.join('.');
    this.hotPaths.add(pathKey);
  }

  /**
   * Update path statistics
   */
  private static updatePathStatistics(path: string[], validationTime: number): void {
    const pathKey = path.join('.');
    const existing = this.pathCache.get(pathKey);
    
    if (existing) {
      existing.avgValidationTime = (existing.avgValidationTime + validationTime) / 2;
    } else {
      this.pathCache.set(pathKey, {
        path,
        validator: () => ({ success: true, errors: [], warnings: [], data: null }),
        isHotPath: false,
        avgValidationTime: validationTime
      });
    }
  }

  /**
   * Generate cache key for value and path
   */
  private static generateCacheKey(value: any, path: string[]): string {
    const valueHash = this.hashValue(value);
    const pathHash = path.join('.');
    return `${pathHash}:${valueHash}`;
  }

  /**
   * Generate structure hash for value
   */
  private static generateStructureHash(value: any): string {
    return getObjectKeys(value);
  }

  /**
   * Generate structure key for schema
   */
  private static generateStructureKey(schema: Record<string, any>): string {
    const keys = Object.keys(schema).sort();
    const typeSignature = keys.map(k => `${k}:${schema[k]}`).join(';');
    return djb2Hash(typeSignature);
  }

  /**
   * Fast hash function for values
   */
  private static hashValue(value: any): string {
    if (typeof value !== 'object' || value === null) {
      return String(value);
    }
    
    // Fast hash for objects
    const str = JSON.stringify(value);
    return djb2Hash(str.length > 100 ? str.substring(0, 100 + str.length % 50) : str);
  }

  /**
   * Check if cache entry is still valid
   */
  private static isCacheValid(cached: CachedValidation): boolean {
    return Date.now() - cached.lastAccessed < this.CACHE_TTL;
  }

  /**
   * Cleanup old cache entries using LRU strategy
   */
  private static cleanupCache(): void {
    if (this.cache.size <= this.MAX_CACHE_SIZE) return;
    
    const now = Date.now();
    const entries: [string, CachedValidation][] = [];
    
    // Collect entries with scores
    for (const [key, cached] of this.cache) {
      const age = now - cached.lastAccessed;
      const score = cached.accessCount / (age + 1); // Higher score = more valuable
      entries.push([key, cached]);
    }
    
    // Sort by value (lower score = less valuable)
    entries.sort((a, b) => {
      const ageA = now - a[1].lastAccessed;
      const ageB = now - b[1].lastAccessed;
      const scoreA = a[1].accessCount / (ageA + 1);
      const scoreB = b[1].accessCount / (ageB + 1);
      return scoreA - scoreB;
    });
    
    // Remove least valuable entries
    const toRemove = this.cache.size - this.MAX_CACHE_SIZE + Math.floor(this.MAX_CACHE_SIZE * 0.1);
    for (let i = 0; i < toRemove && i < entries.length; i++) {
      this.cache.delete(entries[i][0]);
      this.stats.evictions++;
    }
  }

  /**
   * Get cache statistics
   */
  static getStats() {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? this.stats.hits / total : 0;
    
    return {
      ...this.stats,
      hitRate,
      cacheSize: this.cache.size,
      pathCacheSize: this.pathCache.size,
      structureCacheSize: this.structureCache.size,
      hotPathCount: this.hotPaths.size
    };
  }
 
  /**
   * Clear all caches
   */
  static clearCache(): void {
    this.cache.clear();
    this.pathCache.clear();
    this.structureCache.clear();
    this.hotPaths.clear();
    this.stats = { hits: 0, misses: 0, hotPathHits: 0, structureHits: 0, evictions: 0 };
  }

  /**
   * Warm up cache with common validation patterns
   */
  static warmup(commonSchemas: Record<string, any>[], sampleData: any[]): void {
    for (const schema of commonSchemas) {
      for (const data of sampleData) {
        this.validateNestedObject(data, schema);
      }
    }
  }

  /**
   * Get cache efficiency metrics
   */
  static getEfficiencyMetrics() {
    const stats = this.getStats();
    return {
      hitRate: stats.hitRate,
      hotPathEfficiency: stats.hotPathHits / (stats.hits || 1),
      memoryUtilization: stats.cacheSize / this.MAX_CACHE_SIZE,
      avgValidationTime: this.calculateAvgValidationTime()
    };
  }

  private static calculateAvgValidationTime(): number {
    let totalTime = 0;
    let count = 0;
    
    for (const cached of this.cache.values()) {
      totalTime += cached.validationTime;
      count++;
    }
    
    return count > 0 ? totalTime / count : 0;
  }
}