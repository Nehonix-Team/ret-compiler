/**
 * Performance Initialization Module
 *
 * Addresses f2.md feedback by implementing startup optimizations:
 * 1. Pre-warm union cache with critical patterns
 * 2. Initialize performance monitoring
 * 3. Setup optimization systems
 * 4. Configure memory management
 */ 

import { UnionCache } from "../mode/interfaces/validators/UnionCache";
import { PerformanceMonitor } from "./PerformanceMonitor";

/**
 * Initialize all performance optimizations at startup
 * This addresses the critical union type performance gap identified in f2.md
 */
export function initializePerformanceOptimizations(): void {
  try {
    // 1. Pre-warm union cache with critical patterns (f2.md optimization)
    preWarmCriticalUnionPatterns();

    // 2. Initialize performance monitoring
    initializePerformanceMonitoring();

    // 3. Setup memory optimization
    setupMemoryOptimization();

    // 4. Configure validation caching
    configureValidationCaching();

    // console.log('✅ Fortify Schema performance optimizations initialized');
  } catch (error) {
    // Fail silently to avoid breaking applications
    // console.warn('⚠️  Performance optimizations failed to initialize:', error.message);
  }
}

/**
 * Pre-warm union cache with performance-critical patterns
 * Addresses the 50% union type performance gap identified in f2.md
 */
function preWarmCriticalUnionPatterns(): void {
  const criticalPatterns = [
    // Status patterns (most common in applications)
    "active|inactive|pending|suspended",
    "enabled|disabled",
    "on|off",
    "yes|no",
    "true|false",

    // Priority/Level patterns
    "low|medium|high|critical",
    "low|medium|high",
    "basic|standard|premium|enterprise",

    // User role patterns
    "user|admin|moderator|guest",
    "admin|user|guest",
    "read|write|admin",

    // Workflow patterns
    "pending|approved|rejected",
    "draft|published|archived",
    "new|processing|completed|failed",

    // Type patterns
    "string|number|boolean",
    "text|image|video|audio",
    "get|post|put|delete",

    // Common enum patterns
    "success|error|warning|info",
    "small|medium|large",
    "left|center|right",
    "top|middle|bottom",
  ];

  // Pre-warm the cache
  UnionCache.preWarmCache(criticalPatterns);
}

/**
 * Initialize performance monitoring system
 */
function initializePerformanceMonitoring(): void {
  try {
    // Start performance monitoring if available
    if (
      PerformanceMonitor &&
      typeof PerformanceMonitor.startMonitoring === "function"
    ) {
      PerformanceMonitor.startMonitoring();
    }
  } catch (error) {
    // Fail silently
  }
}

/**
 * Setup memory optimization strategies
 */
function setupMemoryOptimization(): void {
  // Configure garbage collection hints for better memory management
  if (typeof global !== "undefined" && global.gc) {
    // Suggest garbage collection after initialization
    setTimeout(() => {
      try {
        global?.gc?.();
      } catch (e) {
        // Ignore if gc is not available
      }
    }, 100);
  }
}

/**
 * Configure validation caching for optimal performance
 */
function configureValidationCaching(): void {
  // Set optimal cache sizes based on f2.md analysis
  try {
    // Configure union cache for optimal performance
    if (UnionCache && typeof UnionCache.configure === "function") {
      UnionCache.configure({
        maxCacheSize: 2000, // Increased for better hit rates
        cleanupThreshold: 2500, // Higher threshold for less frequent cleanup
        enablePreCompilation: true, // Enable pre-compilation optimization
      });
    }
  } catch (error) {
    // Fail silently
  }
}

/**
 * Get performance optimization status
 */
export function getOptimizationStatus(): {
  unionCacheEnabled: boolean;
  performanceMonitoringEnabled: boolean;
  cacheStats?: any;
} {
  try {
    return {
      unionCacheEnabled: !!UnionCache,
      performanceMonitoringEnabled: !!PerformanceMonitor,
      cacheStats: UnionCache?.getCacheStats?.() || null,
    };
  } catch (error) {
    return {
      unionCacheEnabled: false,
      performanceMonitoringEnabled: false,
    };
  }
} 
 
/**
 * Manually trigger performance optimizations
 * Useful for applications that want to control when optimizations are applied
 */
export function optimizePerformance(): void {
  initializePerformanceOptimizations();
}

/**
 * Clear all performance caches (useful for testing or memory management)
 */
export function clearPerformanceCaches(): void {
  try {
    if (UnionCache && typeof UnionCache.clearCache === "function") {
      UnionCache.clearCache();
    }

    // Clear other caches if available
    if (
      PerformanceMonitor &&
      typeof PerformanceMonitor.clearData === "function"
    ) {
      PerformanceMonitor.clearData();
    }
  } catch (error) {
    // Fail silently
  }
}

// Auto-initialize on module load for immediate optimization
initializePerformanceOptimizations();
