/**
 * Clean Conditional Type Resolver
 * Handles the complex logic of resolving conditional types
 */

import {
  ParseConditionPattern,
  EvaluateCondition,
  ConditionalOperator,
} from "./ConditionalOperators";

// ============================================================================
// MAIN CONDITIONAL RESOLVER
// ============================================================================

// Clean, readable conditional type resolver
export type ResolveConditionalType<
  TCondition extends string,
  TThenType extends string,
  TElseType extends string,
  TSchema extends Record<string, any>,
> =
  ParseConditionPattern<TCondition> extends {
    field: infer TField extends string;
    operator: infer TOperator extends ConditionalOperator;
    value: infer TValue extends string;
  }
    ? TField extends keyof TSchema
      ? ResolveOperatorResult<
          TOperator,
          TSchema[TField],
          TValue,
          TThenType,
          TElseType
        >
      : TThenType | TElseType // Field not found, return union
    : TThenType | TElseType; // Pattern not matched, return union

// ============================================================================
// OPERATOR RESULT RESOLVER
// ============================================================================

// Resolve the result based on operator type
type ResolveOperatorResult<
  TOperator extends ConditionalOperator,
  TFieldType,
  TValue extends string,
  TThenType extends string,
  TElseType extends string,
> =
  // For simple operators that we can evaluate at type level
  TOperator extends "=" | "!="
    ? ExtractFieldType<TFieldType> extends string
      ? EvaluateCondition<
          TOperator,
          ExtractFieldType<TFieldType>,
          TValue,
          never
        > extends true
        ? ResolveSchemaType<TThenType>
        : EvaluateCondition<
              TOperator,
              ExtractFieldType<TFieldType>,
              TValue,
              never
            > extends false
          ? ResolveSchemaType<TElseType>
          : ResolveSchemaType<TThenType> | ResolveSchemaType<TElseType>
      : // If extracted type is not a string, return union for safety
        ResolveSchemaType<TThenType> | ResolveSchemaType<TElseType>
    : // For complex operators (>, <, >=, <=, ~, in, !in, exists, !exists)
      // Return union type for safety - runtime will handle the actual logic
      ResolveSchemaType<TThenType> | ResolveSchemaType<TElseType>;

// ============================================================================
// HELPER TYPES
// ============================================================================

// Extract the actual type from schema field definitions
type ExtractFieldType<T> = T extends string
  ? T
  : T extends { type: infer U }
    ? U extends string
      ? U
      : string
    : T extends { const: infer C }
      ? C extends string | number | boolean
        ? `=${C}`
        : string
      : string;

// Resolve schema type strings to actual types
type ResolveSchemaType<T extends string> =
  // Optional types
  T extends `${infer BaseType}?`
    ? ResolveSchemaType<BaseType> | undefined
    : // Array types
      T extends `${infer ElementType}[]`
      ? Array<ResolveSchemaType<ElementType>>
      : // Union types
        T extends `${string}|${string}`
        ? ParseUnion<T>
        : // Constant types
          T extends `=${infer Value}`
          ? Value
          : // Basic types
            T extends "string"
            ? string
            : T extends "number"
              ? number
              : T extends "boolean"
                ? boolean
                : T extends "int"
                  ? number
                  : T extends "positive"
                    ? number
                    : T extends "email"
                      ? string
                      : T extends "url"
                        ? string
                        : T extends "uuid"
                          ? string
                          : // Constrained types (simplified)
                            T extends `string(${string})`
                            ? string
                            : T extends `number(${string})`
                              ? number
                              : T extends `int(${string})`
                                ? number
                                : // Record types
                                  T extends `record<${string},${infer ValueType}>`
                                  ? Record<string, ResolveSchemaType<ValueType>>
                                  : // Default to string for unknown types
                                    string;

// Parse union types recursively
type ParseUnion<T extends string> = T extends `${infer First}|${infer Rest}`
  ? First | ParseUnion<Rest>
  : T;

// ============================================================================
// MAIN CONDITIONAL SYNTAX PARSERS
// ============================================================================

// Parse the revolutionary *? syntax
export type ParseRevolutionarySyntax<T extends string> =
  T extends `when ${infer Condition} *? ${infer ThenType} : ${infer ElseType}`
    ? { condition: Condition; thenType: ThenType; elseType: ElseType }
    : never;

// Parse the parentheses syntax
export type ParseParenthesesSyntax<T extends string> =
  T extends `when(${infer Condition}) then(${infer ThenType}) else(${infer ElseType})`
    ? { condition: Condition; thenType: ThenType; elseType: ElseType }
    : never;

// Parse legacy syntax
export type ParseLegacySyntax<T extends string> =
  T extends `when:${infer Condition}:${infer ThenType}:${infer ElseType}`
    ? { condition: Condition; thenType: ThenType; elseType: ElseType }
    : never;

// ============================================================================
// UNIFIED CONDITIONAL PARSER
// ============================================================================

// Try all syntax patterns and resolve the conditional type
export type ParseConditionalSchema<
  T extends string,
  TSchema extends Record<string, any>,
> =
  // Try revolutionary syntax first
  ParseRevolutionarySyntax<T> extends {
    condition: infer C extends string;
    thenType: infer Then extends string;
    elseType: infer Else extends string;
  }
    ? ResolveConditionalType<C, Then, Else, TSchema>
    : // Try parentheses syntax
      ParseParenthesesSyntax<T> extends {
          condition: infer C extends string;
          thenType: infer Then extends string;
          elseType: infer Else extends string;
        }
      ? ResolveConditionalType<C, Then, Else, TSchema>
      : // Try legacy syntax
        ParseLegacySyntax<T> extends {
            condition: infer C extends string;
            thenType: infer Then extends string;
            elseType: infer Else extends string;
          }
        ? ResolveConditionalType<C, Then, Else, TSchema>
        : // Not a conditional, resolve as regular schema type
          ResolveSchemaType<T>;

// ============================================================================
// EXPORT FOR MAIN INTERFACE TYPE
// ============================================================================

// This is the main export that the interface.type.ts file will use
export type InferConditionalType<
  TCondition extends string,
  TThenType extends string,
  TElseType extends string,
  TSchema extends Record<string, any>,
> = ResolveConditionalType<TCondition, TThenType, TElseType, TSchema>;
