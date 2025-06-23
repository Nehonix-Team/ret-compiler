
export interface PerformanceMetric {
  operationId: string;
  duration: number;
  timestamp: number;
  schemaComplexity: number;
  cacheHit: boolean;
  optimizationApplied?: string;
  memoryUsage?: number;
}

export interface OptimizationRecommendation {
  type: 'cache' | 'precompile' | 'restructure' | 'hotpath' | 'memory';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  estimatedImprovement: number; // percentage
  implementation: () => Promise<void>;
}

export interface PerformanceProfile {
  averageDuration: number;
  p95Duration: number;
  p99Duration: number;
  throughput: number; // ops/sec
  cacheHitRate: number;
  memoryUsage: number;
  bottlenecks: string[];
  recommendations: OptimizationRecommendation[];
}

export interface PerformanceThresholds {
  slowOperationMs: number;
  criticalOperationMs: number;
  minCacheHitRate: number;
  maxMemoryMB: number;
  autoOptimizeThreshold: number;
}
