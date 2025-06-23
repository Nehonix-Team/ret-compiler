import { SchemaValidationResult } from "./types";

export interface CompiledValidator {
  validate: (value: any) => SchemaValidationResult;
  metadata: {
    complexity: number;
    fieldCount: number;
    nestingLevel: number;
    hasUnions: boolean;
    hasArrays: boolean;
    hasConditionals: boolean;
  };
  cacheKey: string;
  compiledAt: number;
}

export interface OptimizationStrategy {
  name: string;
  condition: (metadata: CompiledValidator['metadata']) => boolean;
  optimize: (validator: CompiledValidator) => CompiledValidator;
}

