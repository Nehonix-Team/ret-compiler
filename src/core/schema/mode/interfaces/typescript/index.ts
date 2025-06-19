/**
 * Unified TypeScript Integration Module
 *
 * Single source of truth for all TypeScript type operations, conditional logic,
 * and IDE support. Consolidates functionality from the old types/ directory.
 */

import { ConditionalIDESupport } from "./IDESupport";
import { TypeInferenceAnalyzer } from "./TypeInference";
import { Operators } from "./ConditionalTypes";

// Core TypeScript integration - unified type system
export { TypeInferenceAnalyzer } from "./TypeInference";
export type {
  // Core type inference
  InferSchemaType,
  CoreTypeMap,
  ExtractBaseType,
  IsOptional,
  IsArray,
  ExtractElementType,
  MapFieldType,
  ParseUnionType,
  HandleOptional,
  InferFieldType,
  InterfaceSchemaFromType,
  TypeToSchema,
  // Conditional type analysis
  ConditionalExpression,
  ExtractFields,
  TypeInferenceResult,
  ConditionalResult,
  ValidateFieldAccess,
  TypeSafeConditional,
  ConditionalBuilder,
  ConditionalThen,
  ConditionalElse,
} from "./TypeInference";

// Advanced conditional types and operators - unified system
export type {
  // Core conditional types that are actually exported
  ValidateConditional,
  InferConditionalType,
  ParseConditionalSchema,
  FieldPaths,
  GetValueByPath,
  CreateConditionalBuilder,
} from "./ConditionalTypes";

// Runtime operator configuration
export { Operators } from "./ConditionalTypes";

// IDE support utilities
export { ConditionalIDESupport } from "./IDESupport";
export type {
  CompletionItem,
  CompletionItemKind,
  HoverInfo,
  DiagnosticSeverity,
} from "./IDESupport";

/**
 * Unified TypeScript Integration Bundle
 *
 * Single access point for all TypeScript functionality including:
 * - Core type inference and schema type mapping
 * - Advanced conditional logic and operators
 * - IDE support and developer tooling
 */
export const TypeScriptIntegration = {
  /**
   * Core type inference and analysis
   */
  TypeInference: TypeInferenceAnalyzer,

  /**
   * IDE support and developer experience
   */
  IDE: ConditionalIDESupport,

  /**
   * Operator configuration for conditional logic
   */
  Operators: Operators.OPERATOR_CONFIG,
};

/**
 * Re-export for convenience
 */
export { ConditionalIDESupport as IDE } from "./IDESupport";
export { TypeInferenceAnalyzer as TypeInference } from "./TypeInference";
