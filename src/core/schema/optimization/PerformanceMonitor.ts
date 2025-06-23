/**
 * Smart Performance Monitor & Auto-Optimizer
 *
 * Monitors validation performance in real-time and automatically
 * applies optimizations based on usage patterns and bottlenecks.
 */

import type{ PerformanceMetric, OptimizationRecommendation, PerformanceProfile, PerformanceThresholds } from "../../types/perfoMonitor";
import { UnionCache } from "../mode/interfaces/validators/UnionCache";
import { ObjectValidationCache } from "./ObjectValidationCache";
import { SchemaCompiler } from "./SchemaCompiler";

export class PerformanceMonitor {
  private static metrics: PerformanceMetric[] = [];
  private static readonly MAX_METRICS = 5000; // Reduced for better memory usage
  private static readonly ANALYSIS_INTERVAL = 60000; // 1 minute
  private static readonly CLEANUP_INTERVAL = 300000; // 5 minutes

  private static readonly thresholds: PerformanceThresholds = {
    slowOperationMs: 5,
    criticalOperationMs: 20,
    minCacheHitRate: 0.8,
    maxMemoryMB: 100,
    autoOptimizeThreshold: 0.15 // 15% improvement threshold
  };

  private static isMonitoring = false;
  private static analysisTimer?: NodeJS.Timeout;
  private static cleanupTimer?: NodeJS.Timeout;
  private static optimizationHistory: Array<{
    timestamp: number;
    type: string;
    improvement: number;
    success: boolean;
  }> = [];

  private static optimizationCallbacks: Map<string, () => Promise<void>> = new Map();

  /**
   * Start performance monitoring
   */
  static startMonitoring(customThresholds?: Partial<PerformanceThresholds>): void {
    if (this.isMonitoring) return;

    if (customThresholds) {
      Object.assign(this.thresholds, customThresholds);
    }

    this.isMonitoring = true;

    // Start periodic analysis
    this.analysisTimer = setInterval(() => {
      this.performAnalysis();
    }, this.ANALYSIS_INTERVAL);

    // Start cleanup routine
    this.cleanupTimer = setInterval(() => {
      this.cleanupOldMetrics();
    }, this.CLEANUP_INTERVAL);
  }

  /**
   * Stop performance monitoring
   */
  static stopMonitoring(): void {
    this.isMonitoring = false;

    if (this.analysisTimer) {
      clearInterval(this.analysisTimer);
      this.analysisTimer = undefined;
    }

    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }

  /**
   * Register optimization callback
   */
  static registerOptimization(type: string, callback: () => Promise<void>): void {
    this.optimizationCallbacks.set(type, callback);
  }

  /**
   * Record a validation operation
   */
  static recordOperation(
    operationId: string,
    duration: number,
    schemaComplexity: number,
    cacheHit: boolean = false,
    optimizationApplied?: string
  ): void {
    if (!this.isMonitoring) return;

    const memoryUsage = this.getMemoryUsage();

    const metric: PerformanceMetric = {
      operationId,
      duration,
      timestamp: Date.now(),
      schemaComplexity,
      cacheHit,
      optimizationApplied,
      memoryUsage
    };

    this.metrics.push(metric);

    // Immediate cleanup if we exceed limits
    if (this.metrics.length > this.MAX_METRICS * 1.2) {
      this.cleanupOldMetrics();
    }

    // Real-time optimization for performance issues
    this.handleOperationResult(metric);
  }

  /**
   * Analyze performance and generate recommendations
   */
  static analyzePerformance(): PerformanceProfile {
    if (this.metrics.length === 0) {
      return this.getEmptyProfile();
    }

    const recentMetrics = this.getRecentMetrics(300000); // Last 5 minutes
    return this.calculatePerformanceProfile(recentMetrics);
  }

  /**
   * Get performance report
   */
  static getPerformanceReport(): {
    profile: PerformanceProfile;
    optimizationHistory: typeof PerformanceMonitor.optimizationHistory;
    totalMetrics: number;
    monitoringStatus: boolean;
    thresholds: PerformanceThresholds;
  } {
    const profile = this.analyzePerformance();
    return {
      profile,
      optimizationHistory: this.optimizationHistory.slice(-20), // Last 20 optimizations
      totalMetrics: this.metrics.length,
      monitoringStatus: this.isMonitoring,
      thresholds: { ...this.thresholds }
    };
  }

  /**
   * Clear performance data
   */
  static clearData(): void {
    this.metrics = [];
    this.optimizationHistory = [];
  }

  /**
   * Private methods
   */
  private static async performAnalysis(): Promise<void> {
    try {
      const profile = this.analyzePerformance();

      // Generate and apply optimizations
      const recommendations = this.generateRecommendations(this.getRecentMetrics(300000));
      await this.autoApplyOptimizations(recommendations);

    } catch (error) {
      // console.error('Performance analysis failed:', error);
    }
  }

  private static calculatePerformanceProfile(metrics: PerformanceMetric[]): PerformanceProfile {
    if (metrics.length === 0) return this.getEmptyProfile();

    const durations = metrics.map(m => m.duration).sort((a, b) => a - b);
    const cacheHits = metrics.filter(m => m.cacheHit).length;
    const memoryUsages = metrics.map(m => m.memoryUsage || 0);

    const averageDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const p95Index = Math.max(0, Math.floor(durations.length * 0.95) - 1);
    const p99Index = Math.max(0, Math.floor(durations.length * 0.99) - 1);

    const timeSpan = Math.max(1, (metrics[metrics.length - 1].timestamp - metrics[0].timestamp) / 1000);
    const throughput = metrics.length / timeSpan;
    const avgMemoryUsage = memoryUsages.reduce((sum, m) => sum + m, 0) / memoryUsages.length;

    const profile: PerformanceProfile = {
      averageDuration,
      p95Duration: durations[p95Index] || 0,
      p99Duration: durations[p99Index] || 0,
      throughput,
      cacheHitRate: metrics.length > 0 ? cacheHits / metrics.length : 0,
      memoryUsage: avgMemoryUsage,
      bottlenecks: this.identifyBottlenecks(metrics),
      recommendations: []
    };

    profile.recommendations = this.generateRecommendations(metrics);
    return profile;
  }

  private static identifyBottlenecks(metrics: PerformanceMetric[]): string[] {
    const bottlenecks: string[] = [];

    // Group by operation
    const operationGroups = this.groupBy(metrics, 'operationId');

    for (const [operationId, operationMetrics] of Object.entries(operationGroups)) {
      const avgDuration = operationMetrics.reduce((sum, m) => sum + m.duration, 0) / operationMetrics.length;

      if (avgDuration > this.thresholds.slowOperationMs) {
        bottlenecks.push(`Slow operation: ${operationId} (${avgDuration.toFixed(2)}ms avg)`);
      }
    }

    // Cache performance
    const cacheHitRate = metrics.filter(m => m.cacheHit).length / metrics.length;
    if (cacheHitRate < this.thresholds.minCacheHitRate) {
      bottlenecks.push(`Low cache hit rate: ${(cacheHitRate * 100).toFixed(1)}%`);
    }

    // Memory usage
    const avgMemory = metrics.reduce((sum, m) => sum + (m.memoryUsage || 0), 0) / metrics.length;
    if (avgMemory > this.thresholds.maxMemoryMB) {
      bottlenecks.push(`High memory usage: ${avgMemory.toFixed(1)}MB avg`);
    }

    // Complexity correlation
    const complexMetrics = metrics.filter(m => m.schemaComplexity > 15);
    if (complexMetrics.length > 0) {
      const avgComplexDuration = complexMetrics.reduce((sum, m) => sum + m.duration, 0) / complexMetrics.length;
      if (avgComplexDuration > this.thresholds.slowOperationMs * 1.5) {
        bottlenecks.push(`Complex schemas are slow: ${avgComplexDuration.toFixed(2)}ms avg`);
      }
    }

    return bottlenecks;
  }

  private static generateRecommendations(metrics: PerformanceMetric[]): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    // Cache optimization
    const cacheHitRate = metrics.filter(m => m.cacheHit).length / metrics.length;
    if (cacheHitRate < this.thresholds.minCacheHitRate) {
      recommendations.push({
        type: 'cache',
        priority: 'high',
        description: `Improve cache hit rate from ${(cacheHitRate * 100).toFixed(1)}% to 90%+`,
        estimatedImprovement: Math.min(50, (0.9 - cacheHitRate) * 100),
        implementation: async () => this.executeOptimization('cache')
      });
    }

    // Memory optimization
    const avgMemory = metrics.reduce((sum, m) => sum + (m.memoryUsage || 0), 0) / metrics.length;
    if (avgMemory > this.thresholds.maxMemoryMB) {
      recommendations.push({
        type: 'memory',
        priority: 'critical',
        description: `Reduce memory usage from ${avgMemory.toFixed(1)}MB`,
        estimatedImprovement: 30,
        implementation: async () => this.executeOptimization('memory')
      });
    }

    // Precompilation
    const operationCounts = this.countOperations(metrics);
    const frequentOperations = Object.entries(operationCounts)
      .filter(([_, count]) => count > 50)
      .map(([op, _]) => op);

    if (frequentOperations.length > 0) {
      recommendations.push({
        type: 'precompile',
        priority: 'medium',
        description: `Precompile ${frequentOperations.length} frequently used schemas`,
        estimatedImprovement: Math.min(40, frequentOperations.length * 5),
        implementation: async () => this.executeOptimization('precompile', frequentOperations)
      });
    }

    // Hot path optimization
    const slowOperations = metrics
      .filter(m => m.duration > this.thresholds.slowOperationMs)
      .map(m => m.operationId);

    const uniqueSlowOps = [...new Set(slowOperations)];
    if (uniqueSlowOps.length > 0) {
      recommendations.push({
        type: 'hotpath',
        priority: 'critical',
        description: `Optimize ${uniqueSlowOps.length} slow validation paths`,
        estimatedImprovement: Math.min(60, uniqueSlowOps.length * 10),
        implementation: async () => this.executeOptimization('hotpath', uniqueSlowOps)
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private static async autoApplyOptimizations(recommendations: OptimizationRecommendation[]): Promise<void> {
    for (const rec of recommendations) {
      if (rec.priority === 'critical' && rec.estimatedImprovement > this.thresholds.autoOptimizeThreshold * 100) {
        await this.applyOptimization(rec);
      }
    }
  }

  private static async applyOptimization(recommendation: OptimizationRecommendation): Promise<void> {
    const startTime = Date.now();
    let success = false;

    try {
      await recommendation.implementation();
      success = true;
    } catch (error) {
      // console.error(`Failed to apply ${recommendation.type} optimization:`, error);
    }

    this.optimizationHistory.push({
      timestamp: startTime,
      type: recommendation.type,
      improvement: success ? recommendation.estimatedImprovement : 0,
      success
    });
  }

  private static async executeOptimization(type: string, data?: any): Promise<void> {
    const callback = this.optimizationCallbacks.get(type);
    if (callback) {
      await callback();
    } else {
      // Default optimization behavior
      switch (type) {
        case 'cache':
          this.optimizeCache();
          break;
        case 'memory':
          this.optimizeMemory();
          break;
        case 'precompile':
          this.precompileSchemas(data || []);
          break;
        case 'hotpath':
          this.optimizeHotPaths(data || []);
          break;
      }
    }
  }

  private static handleOperationResult(metric: PerformanceMetric): void {
    if (metric.duration > this.thresholds.criticalOperationMs) {
      // Handle critical performance issue
      this.handleCriticalPerformance(metric);
    }
  }

  private static async handleCriticalPerformance(metric: PerformanceMetric): Promise<void> {
    // Apply immediate optimization for critical issues
    const emergencyOptimization: OptimizationRecommendation = {
      type: 'hotpath',
      priority: 'critical',
      description: `Emergency optimization for ${metric.operationId}`,
      estimatedImprovement: 50,
      implementation: async () => this.executeOptimization('hotpath', [metric.operationId])
    };

    await this.applyOptimization(emergencyOptimization);
  }

  private static optimizeCache(): void {
    try {

      // Get current cache statistics
      const cacheStats = ObjectValidationCache.getStats();
      const unionStats = UnionCache.getCacheStats();

      // console.log(`📊 Union cache: ${unionStats.size} entries`);

      // console.log(`🔧 Cache optimization: Hit rate ${(cacheStats.hitRate * 100).toFixed(1)}%`);

      // Optimize based on hit rates
      if (cacheStats.hitRate < 0.7) {
        // Pre-warm cache with common validation patterns
        const commonPatterns = [
          'string', 'number', 'boolean', 'email', 'url',
          'string?', 'number?', 'boolean?',
          'active|inactive', 'pending|approved|rejected',
          'low|medium|high', 'user|admin|moderator'
        ];

        UnionCache.preWarmCache(commonPatterns);
        // console.log('✅ Cache pre-warmed with common patterns');
      }

      // Clean up old cache entries if memory usage is high
      if (cacheStats.cacheSize > 3000) {
        ObjectValidationCache.clearCache();
        // console.log('🧹 Cache cleared due to high memory usage');
      }

      // console.log('✅ Cache optimization completed');
    } catch (error) {
      // console.error('❌ Cache optimization failed:', error);
    }
  }

  private static optimizeMemory(): void {
    try {
      // Clean up old metrics more aggressively
      this.cleanupOldMetrics(0.5);

      // Clear caches if memory usage is high
      const memoryUsage = this.getMemoryUsage();
      if (memoryUsage > 100) { // > 100MB

        ObjectValidationCache.clearCache();
        UnionCache.clearCache();

        // console.log(`🧹 Memory optimization: Cleared caches (was ${memoryUsage.toFixed(1)}MB)`);
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
        // console.log('🗑️ Garbage collection triggered');
      }

      // console.log('✅ Memory optimization completed');
    } catch (error) {
      // console.error('❌ Memory optimization failed:', error);
    }
  }

  /**
   * Get current memory usage in MB
   */
  private static getMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed / 1024 / 1024;
    }
    return 0;
  }

  private static precompileSchemas(operations: string[]): void {
    try {

      // console.log(`🔧 Precompiling ${operations.length} frequently used schemas`);

      // Get schema definitions for frequent operations
      const schemasToCompile = this.getSchemaDefinitionsForOperations(operations);

      let compiledCount = 0;
      for (const [operationId, schemaDefinition] of schemasToCompile) {
        try {
          SchemaCompiler.compileSchema(schemaDefinition, { enableOptimizations: true });
          compiledCount++;
        } catch (error) {
          // console.warn(`⚠️ Failed to precompile schema for ${operationId}:`, error);
        }
      }

    } catch (error) {
      // // console.error('❌ Schema precompilation failed:', error);
    }
  }

  private static optimizeHotPaths(operations: string[]): void {
    try {


      // Mark operations as hot paths for caching priority
      for (const operationId of operations) {
        // Create optimized validators for hot paths
        this.createHotPathValidator(operationId);
      }

      // Pre-warm cache for hot paths
      const hotPathData = this.generateHotPathTestData(operations);
      for (const [operationId, testData] of hotPathData) {
        try {
          // Trigger validation to warm up cache
          ObjectValidationCache.getCachedValidation(
            testData,
            (value: any) => ({ success: true, errors: [], warnings: [], data: value }),
            [operationId]
          );
        } catch (error) {
          // // console.warn(`⚠️ Failed to warm cache for ${operationId}:`, error);
        }
      }

      // console.log('✅ Hot path optimization completed');
    } catch (error) {
      // console.error('❌ Hot path optimization failed:', error);
    }
  }

  /**
   * Get schema definitions for operations from integrated schema registry
   */
  private static getSchemaDefinitionsForOperations(operations: string[]): Map<string, any> {
    const schemas = new Map();

    // Try to get schemas from the global schema registry first
    const schemaRegistry = this.getSchemaRegistry();

    for (const operationId of operations) {
      let schema = null;

      // 1. Try to get from registered schemas
      if (schemaRegistry.has(operationId)) {
        schema = schemaRegistry.get(operationId);
      }
      // 2. Try to infer from operation metrics
      else if (!schema) {
        schema = this.inferSchemaFromMetrics(operationId);
      }
      // 3. Fallback to pattern-based schema generation
      if (!schema) {
        schema = this.generateSchemaFromPattern(operationId);
      }

      if (schema) {
        schemas.set(operationId, schema);
      }
    }

    return schemas;
  }

  /**
   * Get the global schema registry (integrates with existing Interface schemas)
   */
  private static getSchemaRegistry(): Map<string, any> {
    // Use a module-level registry to avoid globalThis type issues
    if (!this.schemaRegistry) {
      this.schemaRegistry = new Map();
    }
    return this.schemaRegistry;
  }

  private static schemaRegistry: Map<string, any> | undefined;

  /**
   * Infer schema structure from historical validation metrics
   */
  private static inferSchemaFromMetrics(operationId: string): any {
    // Analyze historical metrics to infer schema structure
    const relatedMetrics = this.metrics.filter(m => m.operationId === operationId);

    if (relatedMetrics.length === 0) {
      return null;
    }

    // Analyze complexity patterns to infer schema structure
    const avgComplexity = relatedMetrics.reduce((sum, m) => sum + m.schemaComplexity, 0) / relatedMetrics.length;
    const avgDuration = relatedMetrics.reduce((sum, m) => sum + m.duration, 0) / relatedMetrics.length;

    // Infer schema based on performance characteristics
    if (avgComplexity < 5 && avgDuration < 2) {
      // Simple schema
      return {
        id: 'number',
        name: 'string',
        active: 'boolean'
      };
    } else if (avgComplexity < 15 && avgDuration < 10) {
      // Medium complexity schema
      return {
        id: 'number',
        data: {
          name: 'string',
          email: 'email',
          status: 'active|inactive|pending'
        },
        metadata: {
          created: 'date',
          updated: 'date?'
        }
      };
    } else {
      // Complex schema
      return {
        id: 'number',
        user: {
          profile: {
            name: 'string(2,50)',
            email: 'email',
            address: {
              street: 'string',
              city: 'string',
              country: 'string(2,3)'
            }
          },
          preferences: {
            theme: 'light|dark|auto',
            notifications: 'boolean'
          }
        },
        metadata: {
          created: 'date',
          updated: 'date?',
          tags: 'string[]?'
        }
      };
    }
  }

  /**
   * Generate schema based on operation ID patterns
   */
  private static generateSchemaFromPattern(operationId: string): any {
    const lowerOp = operationId.toLowerCase();

    // User-related operations
    if (lowerOp.includes('user') || lowerOp.includes('profile') || lowerOp.includes('account')) {
      return {
        id: 'positive',
        email: 'email',
        name: 'string(2,100)',
        status: 'active|inactive|pending|suspended',
        role: 'user|admin|moderator|guest',
        profile: {
          firstName: 'string(1,50)',
          lastName: 'string(1,50)',
          avatar: 'url?',
          bio: 'string(0,500)?'
        },
        preferences: {
          theme: 'light|dark|auto',
          language: 'string(2,5)',
          notifications: 'boolean'
        },
        metadata: {
          created: 'date',
          updated: 'date?',
          lastLogin: 'date?'
        }
      };
    }

    // Order/transaction operations
    if (lowerOp.includes('order') || lowerOp.includes('transaction') || lowerOp.includes('payment')) {
      return {
        id: 'positive',
        userId: 'positive',
        total: 'number(0,999999.99)',
        currency: 'string(3,3)',
        status: 'pending|processing|completed|cancelled|refunded',
        items: [{
          id: 'positive',
          name: 'string(1,200)',
          quantity: 'positive',
          price: 'number(0,99999.99)'
        }],
        billing: {
          address: 'string',
          city: 'string',
          country: 'string(2,3)',
          postalCode: 'string'
        },
        metadata: {
          created: 'date',
          updated: 'date?',
          notes: 'string?'
        }
      };
    }

    // Product/catalog operations
    if (lowerOp.includes('product') || lowerOp.includes('item') || lowerOp.includes('catalog')) {
      return {
        id: 'positive',
        name: 'string(1,200)',
        description: 'string(0,2000)?',
        price: 'number(0,99999.99)',
        category: 'string',
        status: 'active|inactive|discontinued',
        inventory: {
          quantity: 'number(0,999999)',
          reserved: 'number(0,999999)',
          available: 'number(0,999999)'
        },
        attributes: {
          weight: 'number?',
          dimensions: {
            length: 'number?',
            width: 'number?',
            height: 'number?'
          }
        },
        metadata: {
          created: 'date',
          updated: 'date?',
          tags: 'string[]?'
        }
      };
    }

    // API/request operations
    if (lowerOp.includes('api') || lowerOp.includes('request') || lowerOp.includes('response')) {
      return {
        method: 'GET|POST|PUT|DELETE|PATCH',
        path: 'string',
        headers: 'any?',
        body: 'any?',
        query: 'any?',
        params: 'any?',
        metadata: {
          timestamp: 'date',
          userAgent: 'string?',
          ip: 'string?'
        }
      };
    }

    // Generic fallback schema
    return {
      id: 'number',
      type: 'string',
      data: 'any',
      status: 'active|inactive',
      metadata: {
        created: 'date',
        updated: 'date?'
      }
    };
  }

  /**
   * Create optimized validator for hot path with real implementation
   */
  private static createHotPathValidator(operationId: string): void {
    try {

      // Get schema for this operation
      const schemaDefinition = this.getSchemaDefinitionsForOperations([operationId]).get(operationId);

      if (!schemaDefinition) {
        // console.warn(`⚠️ No schema found for hot path: ${operationId}`);
        return;
      }

      // Pre-compile the schema for maximum performance
      const compiledValidator = SchemaCompiler.compileSchema(schemaDefinition, {
        enableOptimizations: true,
        cacheValidation: true,
        hotPath: true
      });

      // Store the compiled validator in the hot path cache
      this.hotPathValidators.set(operationId, compiledValidator);

      // Mark this path for priority caching
      ObjectValidationCache.getCachedValidation(
        this.generateSampleData(schemaDefinition),
        compiledValidator.validate.bind(compiledValidator),
        [operationId, 'hotpath']
      );

    } catch (error) {
      // console.error(`❌ Failed to create hot path validator for ${operationId}:`, error);
    }
  }

  private static hotPathValidators = new Map<string, any>();

  /**
   * Generate sample data for schema pre-warming
   */
  private static generateSampleData(schemaDefinition: any): any {
    const sampleData: any = {};

    for (const [key, fieldType] of Object.entries(schemaDefinition)) {
      if (typeof fieldType === 'string') {
        sampleData[key] = this.generateSampleValue(fieldType);
      } else if (typeof fieldType === 'object' && fieldType !== null && !Array.isArray(fieldType)) {
        sampleData[key] = this.generateSampleData(fieldType);
      } else if (Array.isArray(fieldType) && fieldType.length === 1) {
        if (typeof fieldType[0] === 'object') {
          sampleData[key] = [this.generateSampleData(fieldType[0])];
        } else {
          sampleData[key] = [this.generateSampleValue(fieldType[0])];
        }
      }
    }

    return sampleData;
  }

  /**
   * Generate sample value for a field type
   */
  private static generateSampleValue(fieldType: string): any {
    const cleanType = fieldType.replace('?', '').split('(')[0];

    switch (cleanType) {
      case 'string': return 'sample_string';
      case 'number': return 42;
      case 'positive': return 1;
      case 'boolean': return true;
      case 'date': return new Date();
      case 'email': return 'test@example.com';
      case 'url': return 'https://example.com';
      case 'any': return 'sample_data';
      default:
        if (fieldType.includes('|')) {
          const options = fieldType.split('|');
          return options[0].trim();
        }
        return 'sample_value';
    }
  }

  /**
   * Generate test data for hot path warming
   */
  private static generateHotPathTestData(operations: string[]): Map<string, any> {
    const testData = new Map();

    for (const operationId of operations) {
      if (operationId.includes('user')) {
        testData.set(operationId, {
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
          status: 'active'
        });
      } else if (operationId.includes('order')) {
        testData.set(operationId, {
          id: 1,
          total: 99.99,
          status: 'pending'
        });
      } else {
        testData.set(operationId, {
          id: 1,
          data: 'test'
        });
      }
    }

    return testData;
  }

  private static cleanupOldMetrics(ratio: number = 0.8): void {
    if (this.metrics.length > this.MAX_METRICS) {
      const keepCount = Math.floor(this.MAX_METRICS * ratio);
      this.metrics = this.metrics.slice(-keepCount);
    }
  }



  private static getRecentMetrics(timeWindow: number): PerformanceMetric[] {
    const cutoff = Date.now() - timeWindow;
    return this.metrics.filter(m => m.timestamp > cutoff);
  }

  private static groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const groupKey = String(item[key]);
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }

  private static countOperations(metrics: PerformanceMetric[]): Record<string, number> {
    return metrics.reduce((counts, metric) => {
      counts[metric.operationId] = (counts[metric.operationId] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
  }

  private static getEmptyProfile(): PerformanceProfile {
    return {
      averageDuration: 0,
      p95Duration: 0,
      p99Duration: 0,
      throughput: 0,
      cacheHitRate: 0,
      memoryUsage: 0,
      bottlenecks: [],
      recommendations: []
    };
  }
}