import { SchemaValidationResult } from "../types/types";

// Performance monitoring
export class ValidationMetrics {
  private static metrics = new Map<
    string,
    { count: number; totalTime: number; errors: number }
  >();

  static record(operation: string, timeMs: number, hasError: boolean): void {
    const current = this.metrics.get(operation) || {
      count: 0,
      totalTime: 0,
      errors: 0,
    };
    this.metrics.set(operation, {
      count: current.count + 1,
      totalTime: current.totalTime + timeMs,
      errors: current.errors + (hasError ? 1 : 0),
    });
  }

  static getMetrics(): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [op, data] of this.metrics.entries()) {
      result[op] = {
        ...data,
        avgTime: data.totalTime / data.count,
        errorRate: data.errors / data.count,
      };
    }
    return result;
  }

  static reset(): void {
    this.metrics.clear();
  }
}

// Validation cache for expensive operations
export class ValidationCache {
  private static cache = new Map<
    string,
    { result: SchemaValidationResult; timestamp: number }
  >();
  private static readonly TTL = 5 * 60 * 1000; // 5 minutes

  static get(key: string): SchemaValidationResult | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    return { ...entry.result }; // Deep copy to prevent mutation
  }

  static set(key: string, result: SchemaValidationResult): void {
    if (this.cache.size > 1000) {
      // Prevent memory leaks
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey || "");
    }

    this.cache.set(key, {
      result: { ...result },
      timestamp: Date.now(),
    });
  }

  static clear(): void {
    this.cache.clear();
  }
}
