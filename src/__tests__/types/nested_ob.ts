
export interface ValidationMetrics {
  duration: number;
  memoryUsed: number;
  maxDepthReached: number;
  validationSteps: number;
  errorPathLength: number;
  actualErrors: string[];
}

export interface EnhancedValidationResult {
  success: boolean;
  data?: any;
  errors?: string[];
  metrics: ValidationMetrics;
  integrityTest?: {
    corruptionApplied: boolean;
    corruptionLocation: string;
    expectedToFail: boolean;
    actuallyFailed: boolean;
    validationReachedTarget: boolean;
    errorAccuracy: number;
  };
}

export interface TestConfiguration {
  name: string;
  maxDepth: number;
  corruptionType?:
    | "type-mismatch"
    | "missing-property"
    | "invalid-format"
    | "constraint-violation";
  corruptionDepth?: number | "last" | "random" | "multiple";
  expectedOutcome: "pass" | "fail";
  performanceThreshold: number;
  memoryThreshold: number;
}
