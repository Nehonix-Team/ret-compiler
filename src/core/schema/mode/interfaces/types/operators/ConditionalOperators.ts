/**
 * Modular Conditional Operators System
 * Easy to extend and maintain - add new operators here!
 */

// ============================================================================
// OPERATOR DEFINITIONS - Easy to extend!
// ============================================================================

// All supported operators in order of precedence (most specific first)
export type ConditionalOperator =
  | "!exists"
  | "exists" // Existence operators
  | "!empty"
  | "empty" // Empty state operators
  | "!null"
  | "null" // Null state operators
  | "!in"
  | "in" // Array inclusion operators
  | "!~"
  | "~" // Regex operators
  | "!contains"
  | "contains"
  | "endsWith"
  | "startsWith" // String operators
  | "!="
  | ">="
  | "<="
  | ">"
  | "<"
  | "="; // Comparison operators

// Operator metadata for parsing and validation
export type OperatorMetadata = {
  precedence: number; // Higher = checked first
  requiresValue: boolean; // Does this operator need a value?
  typeSupport: "all" | "number" | "string"; // What types can use this operator?
};

// Operator configuration map - add new operators here!
export const OPERATOR_CONFIG: Record<ConditionalOperator, OperatorMetadata> = {
  // Existence operators (highest precedence)
  "!exists": { precedence: 100, requiresValue: false, typeSupport: "all" },
  exists: { precedence: 99, requiresValue: false, typeSupport: "all" },

  // Empty state operators
  "!empty": { precedence: 98, requiresValue: false, typeSupport: "all" },
  empty: { precedence: 97, requiresValue: false, typeSupport: "all" },

  // Null state operators
  "!null": { precedence: 96, requiresValue: false, typeSupport: "all" },
  null: { precedence: 95, requiresValue: false, typeSupport: "all" },

  // Array inclusion operators
  "!in": { precedence: 90, requiresValue: true, typeSupport: "all" },
  in: { precedence: 89, requiresValue: true, typeSupport: "all" },

  // Regex operators
  "!~": { precedence: 81, requiresValue: true, typeSupport: "string" },
  "~": { precedence: 80, requiresValue: true, typeSupport: "string" },

  // String operators
  "!contains": { precedence: 79, requiresValue: true, typeSupport: "string" },
  contains: { precedence: 78, requiresValue: true, typeSupport: "string" },
  endsWith: { precedence: 77, requiresValue: true, typeSupport: "string" },
  startsWith: { precedence: 76, requiresValue: true, typeSupport: "string" },

  // Comparison operators (order matters for parsing!)
  "!=": { precedence: 70, requiresValue: true, typeSupport: "all" },
  ">=": { precedence: 69, requiresValue: true, typeSupport: "number" },
  "<=": { precedence: 68, requiresValue: true, typeSupport: "number" },
  ">": { precedence: 67, requiresValue: true, typeSupport: "number" },
  "<": { precedence: 66, requiresValue: true, typeSupport: "number" },
  "=": { precedence: 65, requiresValue: true, typeSupport: "all" },
};

// ============================================================================
// PATTERN MATCHING TYPES - Automatically generated from operators!
// ============================================================================

// Extract field and value from condition patterns
export type ParseConditionPattern<T extends string> =
  // Existence operators
  T extends `${infer Field}.!exists`
    ? { field: Field; operator: "!exists"; value: never }
    : T extends `${infer Field}.exists`
      ? { field: Field; operator: "exists"; value: never }
      : // Array inclusion operators
        T extends `${infer Field}.!in(${infer Values})`
        ? { field: Field; operator: "!in"; value: Values }
        : T extends `${infer Field}.in(${infer Values})`
          ? { field: Field; operator: "in"; value: Values }
          : // Regex operator
            T extends `${infer Field}~${infer Value}`
            ? { field: Field; operator: "~"; value: Value }
            : // Comparison operators (order matters!)
              T extends `${infer Field}!=${infer Value}`
              ? { field: Field; operator: "!="; value: Value }
              : T extends `${infer Field}>=${infer Value}`
                ? { field: Field; operator: ">="; value: Value }
                : T extends `${infer Field}<=${infer Value}`
                  ? { field: Field; operator: "<="; value: Value }
                  : T extends `${infer Field}>${infer Value}`
                    ? { field: Field; operator: ">"; value: Value }
                    : T extends `${infer Field}<${infer Value}`
                      ? { field: Field; operator: "<"; value: Value }
                      : T extends `${infer Field}=${infer Value}`
                        ? { field: Field; operator: "="; value: Value }
                        : // No match
                          never;

// ============================================================================
// OPERATOR EVALUATION LOGIC
// ============================================================================

// Type-level operator evaluation for TypeScript inference
export type EvaluateCondition<
  TOperator extends ConditionalOperator,
  TFieldType extends string,
  TValue extends string,
  TFieldValue extends string,
> =
  // Equality operators
  TOperator extends "="
    ? TFieldType extends `${string}|${string}`
      ? TValue extends ParseUnion<TFieldType>
        ? true
        : false
      : TFieldType extends TValue
        ? true
        : false
    : // Inequality operators
      TOperator extends "!="
      ? TFieldType extends TValue
        ? false
        : true
      : // For complex operators (>, <, >=, <=, ~, in, !in, exists, !exists)
        // Return "unknown" to use union type (both then and else)
        // This is safer than trying to evaluate complex conditions at type level
        "unknown";

// Helper to parse union types
type ParseUnion<T extends string> = T extends `${infer First}|${infer Rest}`
  ? First | ParseUnion<Rest>
  : T;

// ============================================================================
// FUTURE EXTENSION GUIDE
// ============================================================================

/*
To add a new operator:

1. Add it to ConditionalOperator type
2. Add configuration to OPERATOR_CONFIG
3. Add pattern matching to ParseConditionPattern
4. Add evaluation logic to EvaluateCondition (if needed)
5. Update runtime parser in SyntaxParser.ts

Example - Adding "contains" operator:

1. ConditionalOperator = ... | "contains"
2. OPERATOR_CONFIG["contains"] = { precedence: 75, requiresValue: true, typeSupport: "string" }
3. ParseConditionPattern: T extends `${infer Field} contains ${infer Value}` ? ...
4. EvaluateCondition: TOperator extends "contains" ? "unknown" : ...
5. SyntaxParser: Add "contains" to operators array and switch case

*/
