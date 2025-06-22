/**
 *  Unified Conditional Types and Operators System
 *
 * A robust, maintainable, and extensible TypeScript conditional types system
 * with improved error handling, better organization, and  type safety.
 */

// ============================================================================
// CORE TYPE UTILITIES - Foundation layer
// ============================================================================

/**
 * Essential utility types for type-level programming
 */
export namespace TypeUtils {
  export type IsNever<T> = [T] extends [never] ? true : false;
  export type IsUnknown<T> =
    IsNever<T> extends false
      ? [unknown] extends [T]
        ? [T] extends [unknown]
          ? true
          : false
        : false
      : false;
  export type IsAny<T> = 0 extends 1 & T ? true : false;
  export type IsUndefined<T> = [T] extends [undefined] ? true : false;
  export type IsNull<T> = [T] extends [null] ? true : false;
  export type IsNullish<T> = IsNull<T> extends true ? true : IsUndefined<T>;

  // String utilities
  export type Trim<T extends string> = T extends ` ${infer U}`
    ? Trim<U>
    : T extends `${infer U} `
      ? Trim<U>
      : T;

  export type Split<
    S extends string,
    D extends string,
  > = S extends `${infer T}${D}${infer U}` ? [T, ...Split<U, D>] : [S];

  export type Join<
    T extends readonly string[],
    D extends string,
  > = T extends readonly [infer F, ...infer R]
    ? F extends string
      ? R extends readonly string[]
        ? R["length"] extends 0
          ? F
          : `${F}${D}${Join<R, D>}`
        : never
      : never
    : "";
}

// ============================================================================
// OPERATOR SYSTEM -  with validation and metadata
// ============================================================================

/**
 * Comprehensive operator definitions with strict typing
 */
export namespace Operators {
  // All supported operators with semantic grouping
  export type ConditionalOperator =
    | ExistenceOperator
    | StateOperator
    | InclusionOperator
    | RegexOperator
    | StringOperator
    | ComparisonOperator;

  export type ExistenceOperator = "exists" | "!exists";
  export type StateOperator = "empty" | "!empty" | "null" | "!null";
  export type InclusionOperator = "in" | "!in";
  export type RegexOperator = "~" | "!~";
  export type StringOperator =
    | "contains"
    | "!contains"
    | "startsWith"
    | "endsWith";
  export type ComparisonOperator = "=" | "!=" | ">" | ">=" | "<" | "<=";

  //  operator metadata with validation rules
  export interface OperatorMetadata {
    readonly precedence: number;
    readonly requiresValue: boolean;
    readonly typeSupport: readonly TypeSupport[];
    readonly description: string;
    readonly examples: readonly string[];
  }

  export type TypeSupport =
    | "string"
    | "number"
    | "boolean"
    | "array"
    | "object"
    | "date";

  // Comprehensive operator configuration
  export const OPERATOR_CONFIG: Readonly<
    Record<ConditionalOperator, OperatorMetadata>
  > = {
    // Existence operators (highest precedence)
    "!exists": {
      precedence: 100,
      requiresValue: false,
      typeSupport: ["string", "number", "boolean", "array", "object", "date"],
      description: "Field does not exist or is undefined",
      examples: ["name!exists", "user.email!exists"],
    },
    exists: {
      precedence: 99,
      requiresValue: false,
      typeSupport: ["string", "number", "boolean", "array", "object", "date"],
      description: "Field exists and is not undefined",
      examples: ["name exists", "user.email exists"],
    },

    // State operators
    "!empty": {
      precedence: 98,
      requiresValue: false,
      typeSupport: ["string", "array", "object"],
      description: "Field is not empty (non-zero length)",
      examples: ["name!empty", "items!empty"],
    },
    empty: {
      precedence: 97,
      requiresValue: false,
      typeSupport: ["string", "array", "object"],
      description: "Field is empty (zero length)",
      examples: ["name empty", "items empty"],
    },
    "!null": {
      precedence: 96,
      requiresValue: false,
      typeSupport: ["string", "number", "boolean", "array", "object", "date"],
      description: "Field is not null",
      examples: ["value!null", "user.id!null"],
    },
    null: {
      precedence: 95,
      requiresValue: false,
      typeSupport: ["string", "number", "boolean", "array", "object", "date"],
      description: "Field is null",
      examples: ["value null", "user.id null"],
    },

    // Inclusion operators
    "!in": {
      precedence: 94,
      requiresValue: true,
      typeSupport: ["string", "number", "boolean"],
      description: "Field value is not in the provided list",
      examples: ["status!in(active,pending)", "priority!in(1,2,3)"],
    },
    in: {
      precedence: 93,
      requiresValue: true,
      typeSupport: ["string", "number", "boolean"],
      description: "Field value is in the provided list",
      examples: ["status in(active,pending)", "priority in(1,2,3)"],
    },

    // Regex operators
    "!~": {
      precedence: 92,
      requiresValue: true,
      typeSupport: ["string"],
      description: "Field value does not match the regex pattern",
      examples: ["email!~^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"],
    },
    "~": {
      precedence: 91,
      requiresValue: true,
      typeSupport: ["string"],
      description: "Field value matches the regex pattern",
      examples: ["email~^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"],
    },

    // String operators
    "!contains": {
      precedence: 90,
      requiresValue: true,
      typeSupport: ["string"],
      description: "Field value does not contain the substring",
      examples: ["name!contains John", "description!contains urgent"],
    },
    contains: {
      precedence: 89,
      requiresValue: true,
      typeSupport: ["string"],
      description: "Field value contains the substring",
      examples: ["name contains John", "description contains urgent"],
    },
    endsWith: {
      precedence: 88,
      requiresValue: true,
      typeSupport: ["string"],
      description: "Field value ends with the substring",
      examples: ["filename endsWith .pdf", "email endsWith @company.com"],
    },
    startsWith: {
      precedence: 87,
      requiresValue: true,
      typeSupport: ["string"],
      description: "Field value starts with the substring",
      examples: ["name startsWith Mr.", "path startsWith /api/"],
    },

    // Comparison operators (lowest precedence)
    "!=": {
      precedence: 86,
      requiresValue: true,
      typeSupport: ["string", "number", "boolean", "date"],
      description: "Field value is not equal to the provided value",
      examples: ["status!=active", "count!=0", "isEnabled!=true"],
    },
    ">=": {
      precedence: 85,
      requiresValue: true,
      typeSupport: ["number", "date"],
      description: "Field value is greater than or equal to the provided value",
      examples: ["age>=18", "score>=80"],
    },
    "<=": {
      precedence: 84,
      requiresValue: true,
      typeSupport: ["number", "date"],
      description: "Field value is less than or equal to the provided value",
      examples: ["age<=65", "score<=100"],
    },
    ">": {
      precedence: 83,
      requiresValue: true,
      typeSupport: ["number", "date"],
      description: "Field value is greater than the provided value",
      examples: ["age>18", "score>80"],
    },
    "<": {
      precedence: 82,
      requiresValue: true,
      typeSupport: ["number", "date"],
      description: "Field value is less than the provided value",
      examples: ["age<65", "score<100"],
    },
    "=": {
      precedence: 81,
      requiresValue: true,
      typeSupport: ["string", "number", "boolean", "date"],
      description: "Field value is equal to the provided value",
      examples: ["status=active", "count=0", "isEnabled=true"],
    },
  } as const;

  // Utility functions for operator validation
  export function isValidOperator(op: string): op is ConditionalOperator {
    return op in OPERATOR_CONFIG;
  }

  export function getOperatorsByPrecedence(): ConditionalOperator[] {
    return Object.entries(OPERATOR_CONFIG)
      .sort(([, a], [, b]) => b.precedence - a.precedence)
      .map(([op]) => op as ConditionalOperator);
  }

  export function validateOperatorForType(
    operator: ConditionalOperator,
    type: TypeSupport
  ): boolean {
    return OPERATOR_CONFIG[operator].typeSupport.includes(type);
  }
}

// ============================================================================
// CONDITION PARSING -  with better error handling
// ============================================================================

/**
 * Advanced condition parsing with comprehensive error handling
 */
export namespace ConditionParser {
  export interface ParsedCondition<
    TField extends string = string,
    TOperator extends
      Operators.ConditionalOperator = Operators.ConditionalOperator,
    TValue extends string = string,
  > {
    readonly field: TField;
    readonly operator: TOperator;
    readonly value: TValue;
    readonly isValid: boolean;
    readonly error?: string;
  }

  export type ParseResult<T extends string> =
    ParseConditionPattern<T> extends infer R
      ? R extends ParsedCondition
        ? R
        : ParsedCondition<never, never, never> & {
            isValid: false;
            error: "Invalid condition format";
          }
      : ParsedCondition<never, never, never> & {
          isValid: false;
          error: "Parse failed";
        };

  //  parsing with all operators in precedence order
  export type ParseConditionPattern<T extends string> =
    T extends `${infer Field}!exists`
      ? ParsedCondition<Field, "!exists", "">
      : T extends `${infer Field}exists`
        ? ParsedCondition<Field, "exists", "">
        : T extends `${infer Field}!empty`
          ? ParsedCondition<Field, "!empty", "">
          : T extends `${infer Field}empty`
            ? ParsedCondition<Field, "empty", "">
            : T extends `${infer Field}!null`
              ? ParsedCondition<Field, "!null", "">
              : T extends `${infer Field}null`
                ? ParsedCondition<Field, "null", "">
                : T extends `${infer Field}!in${infer Value}`
                  ? ParsedCondition<Field, "!in", Value>
                  : T extends `${infer Field}in${infer Value}`
                    ? ParsedCondition<Field, "in", Value>
                    : T extends `${infer Field}!~${infer Value}`
                      ? ParsedCondition<Field, "!~", Value>
                      : T extends `${infer Field}~${infer Value}`
                        ? ParsedCondition<Field, "~", Value>
                        : T extends `${infer Field}!contains${infer Value}`
                          ? ParsedCondition<Field, "!contains", Value>
                          : T extends `${infer Field}contains${infer Value}`
                            ? ParsedCondition<Field, "contains", Value>
                            : T extends `${infer Field}endsWith${infer Value}`
                              ? ParsedCondition<Field, "endsWith", Value>
                              : T extends `${infer Field}startsWith${infer Value}`
                                ? ParsedCondition<Field, "startsWith", Value>
                                : T extends `${infer Field}!=${infer Value}`
                                  ? ParsedCondition<Field, "!=", Value>
                                  : T extends `${infer Field}>=${infer Value}`
                                    ? ParsedCondition<Field, ">=", Value>
                                    : T extends `${infer Field}<=${infer Value}`
                                      ? ParsedCondition<Field, "<=", Value>
                                      : T extends `${infer Field}>${infer Value}`
                                        ? ParsedCondition<Field, ">", Value>
                                        : T extends `${infer Field}<${infer Value}`
                                          ? ParsedCondition<Field, "<", Value>
                                          : T extends `${infer Field}=${infer Value}`
                                            ? ParsedCondition<Field, "=", Value>
                                            : ParsedCondition<
                                                never,
                                                never,
                                                never
                                              > & {
                                                isValid: false;
                                                error: "No matching operator pattern found";
                                              };
}

// ============================================================================
// SCHEMA UTILITIES -  type extraction and validation
// ============================================================================

/**
 * Advanced schema type utilities with better path handling
 */
export namespace SchemaUtils {
  //  field path extraction with support for nested objects and arrays
  export type FieldPaths<T, MaxDepth extends number = 5> = MaxDepth extends 0
    ? never
    : T extends ReadonlyArray<infer U>
      ? `${number}` | `${number}.${FieldPaths<U, Prev<MaxDepth>>}`
      : T extends object
        ? {
            [K in keyof T]-?: K extends string | number
              ? T[K] extends object
                ? K | `${K}.${FieldPaths<T[K], Prev<MaxDepth>>}`
                : K
              : never;
          }[keyof T]
        : never;

  type Prev<T extends number> = T extends 0
    ? 0
    : T extends 1
      ? 0
      : T extends 2
        ? 1
        : T extends 3
          ? 2
          : T extends 4
            ? 3
            : T extends 5
              ? 4
              : number;

  //  value extraction with better error handling
  export type GetValueByPath<T, P extends string> = P extends keyof T
    ? T[P]
    : P extends `${infer K}.${infer Rest}`
      ? K extends keyof T
        ? GetValueByPath<T[K], Rest>
        : K extends `${number}`
          ? T extends ReadonlyArray<infer U>
            ? GetValueByPath<U, Rest>
            : never
          : never
      : P extends `${number}`
        ? T extends ReadonlyArray<infer U>
          ? U
          : never
        : never;

  //  type extraction with better handling of complex types
  export type ExtractFieldType<T> = T extends string
    ? T
    : T extends { type: infer U }
      ? U extends string
        ? U
        : string
      : T extends { const: infer C }
        ? C extends string | number | boolean
          ? `=${C}`
          : string
        : T extends ReadonlyArray<infer U>
          ? `${ExtractFieldType<U>}[]`
          : T extends Date
            ? "date"
            : T extends number
              ? "number"
              : T extends boolean
                ? "boolean"
                : T extends object
                  ? "object"
                  : "string";

  //  schema type resolution
  export type ResolveSchemaType<T extends string> = T extends "string"
    ? string
    : T extends "number"
      ? number
      : T extends "boolean"
        ? boolean
        : T extends "date"
          ? Date
          : T extends "object"
            ? object
            : T extends `${infer U}[]`
              ? Array<ResolveSchemaType<U>>
              : T extends `${infer U}?`
                ? ResolveSchemaType<U> | undefined
                : T extends `=${infer Value}`
                  ? Value extends "true"
                    ? true
                    : Value extends "false"
                      ? false
                      : Value extends `${number}`
                        ? number
                        : Value
                  : any;
}

// ============================================================================
// CONDITIONAL RESOLUTION -  with better error handling and validation
// ============================================================================

/**
 * Robust conditional type resolution system
 */
export namespace ConditionalResolver {
  //  conditional syntax parsers
  export type ParseRevolutionarySyntax<T extends string> =
    T extends `when ${infer Condition} *? ${infer ThenType} : ${infer ElseType}`
      ? {
          condition: TypeUtils.Trim<Condition>;
          thenType: TypeUtils.Trim<ThenType>;
          elseType: TypeUtils.Trim<ElseType>;
          syntax: "revolutionary";
        }
      : never;

  export type ParseParenthesesSyntax<T extends string> =
    T extends `when(${infer Condition}) then(${infer ThenType}) else(${infer ElseType})`
      ? {
          condition: TypeUtils.Trim<Condition>;
          thenType: TypeUtils.Trim<ThenType>;
          elseType: TypeUtils.Trim<ElseType>;
          syntax: "parentheses";
        }
      : never;

  export type ParseLegacySyntax<T extends string> =
    T extends `when:${infer Condition}:${infer ThenType}:${infer ElseType}`
      ? {
          condition: TypeUtils.Trim<Condition>;
          thenType: TypeUtils.Trim<ThenType>;
          elseType: TypeUtils.Trim<ElseType>;
          syntax: "legacy";
        }
      : never;

  //  conditional type resolution with validation
  export type ResolveConditionalType<
    TCondition extends string,
    TThenType extends string,
    TElseType extends string,
    TSchema extends Record<string, any>,
  > =
    ConditionParser.ParseConditionPattern<TCondition> extends ConditionParser.ParsedCondition<
      infer TField extends string,
      infer TOperator extends Operators.ConditionalOperator,
      infer TValue extends string
    >
      ? TField extends SchemaUtils.FieldPaths<TSchema>
        ? ResolveOperatorResult<
            TOperator,
            SchemaUtils.GetValueByPath<TSchema, TField>,
            TValue,
            TThenType,
            TElseType
          >
        :
            | SchemaUtils.ResolveSchemaType<TThenType>
            | SchemaUtils.ResolveSchemaType<TElseType>
      :
          | SchemaUtils.ResolveSchemaType<TThenType>
          | SchemaUtils.ResolveSchemaType<TElseType>;

  //  operator result resolution
  type ResolveOperatorResult<
    TOperator extends Operators.ConditionalOperator,
    TFieldType,
    TValue extends string,
    TThenType extends string,
    TElseType extends string,
  > = TOperator extends "=" | "!="
    ? SchemaUtils.ExtractFieldType<TFieldType> extends string
      ? EvaluateCondition<
          TOperator,
          SchemaUtils.ExtractFieldType<TFieldType>,
          TValue
        > extends true
        ? SchemaUtils.ResolveSchemaType<TThenType>
        : EvaluateCondition<
              TOperator,
              SchemaUtils.ExtractFieldType<TFieldType>,
              TValue
            > extends false
          ? SchemaUtils.ResolveSchemaType<TElseType>
          :
              | SchemaUtils.ResolveSchemaType<TThenType>
              | SchemaUtils.ResolveSchemaType<TElseType>
      :
          | SchemaUtils.ResolveSchemaType<TThenType>
          | SchemaUtils.ResolveSchemaType<TElseType>
    :
        | SchemaUtils.ResolveSchemaType<TThenType>
        | SchemaUtils.ResolveSchemaType<TElseType>;

  //  condition evaluation
  export type EvaluateCondition<
    TOperator extends Operators.ConditionalOperator,
    TFieldType extends string,
    TValue extends string,
  > = TOperator extends "="
    ? TFieldType extends `${string}|${string}`
      ? TValue extends ParseUnion<TFieldType>
        ? true
        : false
      : TFieldType extends TValue
        ? true
        : false
    : TOperator extends "!="
      ? TFieldType extends TValue
        ? false
        : true
      : "unknown"; // For complex operators, return unknown to use union type

  //  union parsing with better parentheses handling
  export type ParseUnion<T extends string> = T extends `(${infer Content})`
    ? ParseUnion<Content>
    : T extends `${infer First}|${infer Rest}`
      ? First | ParseUnion<Rest>
      : T;

  // Main parsing function with all syntax support
  export type ParseConditionalSchema<
    T extends string,
    TSchema extends Record<string, any>,
  > =
    ParseRevolutionarySyntax<T> extends {
      condition: infer C extends string;
      thenType: infer Then extends string;
      elseType: infer Else extends string;
    }
      ? ResolveConditionalType<C, Then, Else, TSchema>
      : ParseParenthesesSyntax<T> extends {
            condition: infer C extends string;
            thenType: infer Then extends string;
            elseType: infer Else extends string;
          }
        ? ResolveConditionalType<C, Then, Else, TSchema>
        : ParseLegacySyntax<T> extends {
              condition: infer C extends string;
              thenType: infer Then extends string;
              elseType: infer Else extends string;
            }
          ? ResolveConditionalType<C, Then, Else, TSchema>
          : SchemaUtils.ResolveSchemaType<T>;
}

// ============================================================================
// VALIDATION SYSTEM -  with comprehensive checks
// ============================================================================

/**
 * Comprehensive validation system for conditional expressions
 */
export namespace Validation {
  export interface ValidationResult<T = any> {
    readonly isValid: boolean;
    readonly errors: readonly string[];
    readonly warnings: readonly string[];
    readonly result?: T;
  }

  export type ValidateConditional<TData, TExpression extends string> =
    ConditionalResolver.ParseRevolutionarySyntax<TExpression> extends {
      condition: infer Condition extends string;
      thenType: infer ThenType extends string;
      elseType: infer ElseType extends string;
    }
      ? ValidateConditionAgainstSchema<
          TData,
          Condition
        > extends ValidationResult<infer ConditionResult>
        ? ConditionResult extends true
          ? {
              isValid: true;
              errors: [];
              warnings: [];
              result: {
                field: ConditionParser.ParseConditionPattern<Condition> extends ConditionParser.ParsedCondition<
                  infer F,
                  any,
                  any
                >
                  ? F
                  : never;
                operator: ConditionParser.ParseConditionPattern<Condition> extends ConditionParser.ParsedCondition<
                  any,
                  infer O,
                  any
                >
                  ? O
                  : never;
                value: ConditionParser.ParseConditionPattern<Condition> extends ConditionParser.ParsedCondition<
                  any,
                  any,
                  infer V
                >
                  ? V
                  : never;
                thenType: SchemaUtils.ResolveSchemaType<ThenType>;
                elseType: SchemaUtils.ResolveSchemaType<ElseType>;
                resultType:
                  | SchemaUtils.ResolveSchemaType<ThenType>
                  | SchemaUtils.ResolveSchemaType<ElseType>;
              };
            }
          : {
              isValid: false;
              errors: ["Invalid condition"];
              warnings: [];
            }
        : {
            isValid: false;
            errors: ["Could not validate condition"];
            warnings: [];
          }
      : {
          isValid: false;
          errors: ["Could not parse conditional expression"];
          warnings: [];
        };

  type ValidateConditionAgainstSchema<TData, TCondition extends string> =
    ConditionParser.ParseConditionPattern<TCondition> extends ConditionParser.ParsedCondition<
      infer TField extends string,
      infer TOperator extends Operators.ConditionalOperator,
      infer TValue extends string
    >
      ? TField extends SchemaUtils.FieldPaths<TData>
        ? ValidationResult<true>
        : ValidationResult<false> & {
            errors: [`Field '${TField}' does not exist in schema`];
          }
      : ValidationResult<false> & { errors: ["Could not parse condition"] };
}

// ============================================================================
// BUILDER PATTERN -  with better type safety
// ============================================================================

/**
 *  builder pattern for creating type-safe conditionals
 */
export namespace Builder {
  export interface TypeSafeConditionalBuilder<TData> {
    when<TField extends string>(
      field: TField
    ): FieldConditionalBuilder<
      TData,
      any, // Simplified to avoid complex type constraints
      TField
    >;
  }

  export interface FieldConditionalBuilder<
    TData,
    TFieldType,
    TField extends string,
  > {
    equals<TValue extends TFieldType>(
      value: TValue
    ): ThenBuilder<TData, TFieldType, TField, "=", TValue>;

    notEquals<TValue extends TFieldType>(
      value: TValue
    ): ThenBuilder<TData, TFieldType, TField, "!=", TValue>;

    greaterThan<TValue extends TFieldType>(
      value: TFieldType extends number ? TValue : never
    ): ThenBuilder<TData, TFieldType, TField, ">", TValue>;

    greaterEqual<TValue extends TFieldType>(
      value: TFieldType extends number ? TValue : never
    ): ThenBuilder<TData, TFieldType, TField, ">=", TValue>;

    lessThan<TValue extends TFieldType>(
      value: TFieldType extends number ? TValue : never
    ): ThenBuilder<TData, TFieldType, TField, "<", TValue>;

    lessEqual<TValue extends TFieldType>(
      value: TFieldType extends number ? TValue : never
    ): ThenBuilder<TData, TFieldType, TField, "<=", TValue>;

    matches(
      pattern: TFieldType extends string ? string : never
    ): ThenBuilder<TData, TFieldType, TField, "~", string>;

    contains(
      value: TFieldType extends string ? string : never
    ): ThenBuilder<TData, TFieldType, TField, "contains", string>;

    startsWith(
      value: TFieldType extends string ? string : never
    ): ThenBuilder<TData, TFieldType, TField, "startsWith", string>;

    endsWith(
      value: TFieldType extends string ? string : never
    ): ThenBuilder<TData, TFieldType, TField, "endsWith", string>;

    in<TValues extends readonly TFieldType[]>(
      ...values: TValues
    ): ThenBuilder<TData, TFieldType, TField, "in", TValues>;

    notIn<TValues extends readonly TFieldType[]>(
      ...values: TValues
    ): ThenBuilder<TData, TFieldType, TField, "!in", TValues>;

    exists(): ThenBuilder<TData, TFieldType, TField, "exists", undefined>;
    notExists(): ThenBuilder<TData, TFieldType, TField, "!exists", undefined>;
    empty(): ThenBuilder<TData, TFieldType, TField, "empty", undefined>;
    notEmpty(): ThenBuilder<TData, TFieldType, TField, "!empty", undefined>;
    isNull(): ThenBuilder<TData, TFieldType, TField, "null", undefined>;
    notNull(): ThenBuilder<TData, TFieldType, TField, "!null", undefined>;
  }

  export interface ThenBuilder<
    TData,
    TFieldType,
    TField extends string,
    TOperator extends Operators.ConditionalOperator,
    TValue,
  > {
    then<TThenType>(
      value: TThenType
    ): ElseBuilder<TData, TFieldType, TField, TOperator, TValue, TThenType>;

    thenType<TType extends string>(
      type: TType
    ): ElseBuilder<
      TData,
      TFieldType,
      TField,
      TOperator,
      TValue,
      SchemaUtils.ResolveSchemaType<TType>
    >;
  }

  export interface ElseBuilder<
    TData,
    TFieldType,
    TField extends string,
    TOperator extends Operators.ConditionalOperator,
    TValue,
    TThenType,
  > {
    else<TElseType>(
      value: TElseType
    ): ConditionalExpression<TElseType | TThenType>;

    elseType<TType extends string>(
      type: TType
    ): ConditionalExpression<TThenType | SchemaUtils.ResolveSchemaType<TType>>;

    elseWhen<TField2 extends string>(
      field: TField2
    ): FieldConditionalBuilder<
      TData,
      any, // Simplified to avoid complex type constraints
      TField2
    >;
  }

  export interface ConditionalExpression<TResultType> {
    readonly expression: string;
    readonly resultType: TResultType;
    readonly metadata: {
      readonly field: string;
      readonly operator: Operators.ConditionalOperator;
      readonly value: any;
      readonly validation: Validation.ValidationResult;
    };
    toString(): string;
    validate<TSchema>(): Validation.ValidationResult<TResultType>;
  }
}

// ============================================================================
// MAIN EXPORTS - Public API
// ============================================================================

/**
 * Main exports for the conditional types system
 */

// Core type resolution
export type InferConditionalType<
  TCondition extends string,
  TThenType extends string,
  TElseType extends string,
  TSchema extends Record<string, any>,
> = ConditionalResolver.ResolveConditionalType<
  TCondition,
  TThenType,
  TElseType,
  TSchema
>;

//  schema parsing
export type ParseConditionalSchema<
  T extends string,
  TSchema extends Record<string, any>,
> = ConditionalResolver.ParseConditionalSchema<T, TSchema>;

// Validation exports
export type ValidateConditional<
  TData,
  TExpression extends string,
> = Validation.ValidateConditional<TData, TExpression>;

// Builder exports
export type CreateConditionalBuilder<TData> =
  Builder.TypeSafeConditionalBuilder<TData>;

// Utility exports
export type FieldPaths<T> = SchemaUtils.FieldPaths<T>;
export type GetValueByPath<T, P extends string> = SchemaUtils.GetValueByPath<
  T,
  P
>;

// ============================================================================
// RUNTIME UTILITIES - Implementation helpers
// ============================================================================

/**
 * Runtime utilities for working with conditional expressions
 */
export namespace Runtime {
  // Runtime condition evaluator
  export function evaluateCondition(
    fieldValue: any,
    operator: Operators.ConditionalOperator,
    conditionValue: string
  ): boolean {
    switch (operator) {
      // Existence operators
      case "exists":
        return fieldValue !== undefined && fieldValue !== null;
      case "!exists":
        return fieldValue === undefined || fieldValue === null;

      // State operators
      case "empty":
        if (typeof fieldValue === "string") return fieldValue.length === 0;
        if (Array.isArray(fieldValue)) return fieldValue.length === 0;
        if (typeof fieldValue === "object" && fieldValue !== null) {
          return Object.keys(fieldValue).length === 0;
        }
        return false;
      case "!empty":
        if (typeof fieldValue === "string") return fieldValue.length > 0;
        if (Array.isArray(fieldValue)) return fieldValue.length > 0;
        if (typeof fieldValue === "object" && fieldValue !== null) {
          return Object.keys(fieldValue).length > 0;
        }
        return true;
      case "null":
        return fieldValue === null;
      case "!null":
        return fieldValue !== null;

      // Comparison operators
      case "=":
        return String(fieldValue) === conditionValue;
      case "!=":
        return String(fieldValue) !== conditionValue;
      case ">":
        return Number(fieldValue) > Number(conditionValue);
      case ">=":
        return Number(fieldValue) >= Number(conditionValue);
      case "<":
        return Number(fieldValue) < Number(conditionValue);
      case "<=":
        return Number(fieldValue) <= Number(conditionValue);

      // String operators
      case "contains":
        return String(fieldValue).includes(conditionValue);
      case "!contains":
        return !String(fieldValue).includes(conditionValue);
      case "startsWith":
        return String(fieldValue).startsWith(conditionValue);
      case "endsWith":
        return String(fieldValue).endsWith(conditionValue);

      // Regex operators
      case "~":
        try {
          return new RegExp(conditionValue).test(String(fieldValue));
        } catch {
          return false;
        }
      case "!~":
        try {
          return !new RegExp(conditionValue).test(String(fieldValue));
        } catch {
          return true;
        }

      // Inclusion operators
      case "in":
        const inValues = conditionValue.split(",").map((v) => v.trim());
        return inValues.includes(String(fieldValue));
      case "!in":
        const notInValues = conditionValue.split(",").map((v) => v.trim());
        return !notInValues.includes(String(fieldValue));

      default:
        return false;
    }
  }

  // Runtime field value extraction with path support
  export function getFieldValue(data: any, path: string): any {
    if (!path || typeof data !== "object" || data === null) {
      return undefined;
    }

    const keys = path.split(".");
    let current = data;

    for (const key of keys) {
      if (current === null || current === undefined) {
        return undefined;
      }

      // Handle array indices
      if (/^\d+$/.test(key)) {
        const index = parseInt(key, 10);
        if (Array.isArray(current) && index >= 0 && index < current.length) {
          current = current[index];
        } else {
          return undefined;
        }
      } else {
        current = current[key];
      }
    }

    return current;
  }

  // Runtime conditional expression parser
  export function parseCondition(conditionStr: string): {
    field: string;
    operator: Operators.ConditionalOperator;
    value: string;
  } | null {
    const trimmed = conditionStr.trim();

    // Try operators in precedence order
    for (const operator of Operators.getOperatorsByPrecedence()) {
      const config = Operators.OPERATOR_CONFIG[operator];

      if (!config.requiresValue) {
        // For operators that don't require a value (exists, empty, null)
        if (trimmed.endsWith(operator)) {
          const field = trimmed.slice(0, -operator.length);
          return { field, operator, value: "" };
        }
      } else {
        // For operators that require a value
        const operatorIndex = trimmed.indexOf(operator);
        if (operatorIndex > 0) {
          const field = trimmed.slice(0, operatorIndex);
          const value = trimmed.slice(operatorIndex + operator.length);
          return { field, operator, value };
        }
      }
    }

    return null;
  }

  // Runtime conditional expression evaluator
  export function evaluateConditionalExpression(
    data: any,
    expression: string
  ): any {
    // Parse different syntax formats
    let condition: string, thenValue: string, elseValue: string;

    // syntax: when condition *? then : else
    let match = expression.match(/when\s+(.+?)\s*\*\?\s*(.+?)\s*:\s*(.+)/);
    if (match) {
      [, condition, thenValue, elseValue] = match;
    } else {
      // Parentheses syntax: when(condition) then(value) else(value)
      match = expression.match(/when\((.+?)\)\s*then\((.+?)\)\s*else\((.+?)\)/);
      if (match) {
        [, condition, thenValue, elseValue] = match;
      } else {
        // Legacy syntax: when:condition:then:else
        match = expression.match(/when:(.+?):(.+?):(.+)/);
        if (match) {
          [, condition, thenValue, elseValue] = match;
        } else {
          throw new Error(
            `Invalid conditional expression format: ${expression}`
          );
        }
      }
    }

    // Parse the condition
    const parsedCondition = parseCondition(condition.trim());
    if (!parsedCondition) {
      throw new Error(`Could not parse condition: ${condition}`);
    }

    // Get field value
    const fieldValue = getFieldValue(data, parsedCondition.field);

    // Evaluate condition
    const conditionResult = evaluateCondition(
      fieldValue,
      parsedCondition.operator,
      parsedCondition.value
    );

    // Return appropriate value
    return conditionResult
      ? parseValue(thenValue.trim())
      : parseValue(elseValue.trim());
  }

  // Parse value with type coercion
  function parseValue(value: string): any {
    const trimmed = value.trim();

    // Handle quoted strings
    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
      return trimmed.slice(1, -1);
    }

    // Handle booleans
    if (trimmed === "true") return true;
    if (trimmed === "false") return false;

    // Handle null/undefined
    if (trimmed === "null") return null;
    if (trimmed === "undefined") return undefined;

    // Handle numbers
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      return Number(trimmed);
    }

    // Handle arrays (simple comma-separated values)
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      const arrayContent = trimmed.slice(1, -1);
      if (arrayContent.trim() === "") return [];
      return arrayContent.split(",").map((item) => parseValue(item.trim()));
    }

    // Default to string
    return trimmed;
  }

  // Validation helper
  export function validateConditionSyntax(condition: string): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const parsed = parseCondition(condition);
      if (!parsed) {
        errors.push("Could not parse condition syntax");
        return { isValid: false, errors, warnings };
      }

      // Validate operator
      if (!Operators.isValidOperator(parsed.operator)) {
        errors.push(`Unknown operator: ${parsed.operator}`);
      }

      // Validate value requirement
      const config = Operators.OPERATOR_CONFIG[parsed.operator];
      if (config.requiresValue && !parsed.value) {
        errors.push(`Operator '${parsed.operator}' requires a value`);
      }

      // Check for common mistakes
      if (parsed.field.includes(" ")) {
        warnings.push("Field names with spaces may cause issues");
      }

      if (parsed.operator === "~" || parsed.operator === "!~") {
        try {
          new RegExp(parsed.value);
        } catch {
          errors.push("Invalid regex pattern");
        }
      }
    } catch (error) {
      errors.push(
        `Validation error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

// ============================================================================
// FACTORY FUNCTIONS - Convenient creation helpers
// ============================================================================

/**
 * Factory functions for creating conditional expressions
 */
export namespace Factory {
  export function createConditionalBuilder<
    TData,
  >(): Builder.TypeSafeConditionalBuilder<TData> {
    return {
      when<TField extends string>(field: TField) {
        return createFieldBuilder<
          TData,
          any, // Simplified to avoid complex type constraints
          TField
        >(field);
      },
    };
  }

  function createFieldBuilder<TData, TFieldType, TField extends string>(
    field: TField
  ): Builder.FieldConditionalBuilder<TData, TFieldType, TField> {
    return {
      equals: <TValue extends TFieldType>(value: TValue) =>
        createThenBuilder(field, "=", value),
      notEquals: <TValue extends TFieldType>(value: TValue) =>
        createThenBuilder(field, "!=", value),
      greaterThan: <TValue extends TFieldType>(
        value: TFieldType extends number ? TValue : never
      ) => createThenBuilder(field, ">", value),
      greaterEqual: <TValue extends TFieldType>(
        value: TFieldType extends number ? TValue : never
      ) => createThenBuilder(field, ">=", value),
      lessThan: <TValue extends TFieldType>(
        value: TFieldType extends number ? TValue : never
      ) => createThenBuilder(field, "<", value),
      lessEqual: <TValue extends TFieldType>(
        value: TFieldType extends number ? TValue : never
      ) => createThenBuilder(field, "<=", value),
      matches: (pattern: TFieldType extends string ? string : never) =>
        createThenBuilder(field, "~", pattern),
      contains: (value: TFieldType extends string ? string : never) =>
        createThenBuilder(field, "contains", value),
      startsWith: (value: TFieldType extends string ? string : never) =>
        createThenBuilder(field, "startsWith", value),
      endsWith: (value: TFieldType extends string ? string : never) =>
        createThenBuilder(field, "endsWith", value),
      in: <TValues extends readonly TFieldType[]>(...values: TValues) =>
        createThenBuilder(field, "in", values.join(",")),
      notIn: <TValues extends readonly TFieldType[]>(...values: TValues) =>
        createThenBuilder(field, "!in", values.join(",")),
      exists: () => createThenBuilder(field, "exists", undefined),
      notExists: () => createThenBuilder(field, "!exists", undefined),
      empty: () => createThenBuilder(field, "empty", undefined),
      notEmpty: () => createThenBuilder(field, "!empty", undefined),
      isNull: () => createThenBuilder(field, "null", undefined),
      notNull: () => createThenBuilder(field, "!null", undefined),
    };
  }

  function createThenBuilder<
    TData,
    TFieldType,
    TField extends string,
    TOperator extends Operators.ConditionalOperator,
    TValue,
  >(
    field: TField,
    operator: TOperator,
    value: TValue
  ): Builder.ThenBuilder<TData, TFieldType, TField, TOperator, TValue> {
    return {
      then: <TThenType>(thenValue: TThenType) =>
        createElseBuilder(field, operator, value, thenValue),
      thenType: <TType extends string>(type: TType) =>
        createElseBuilder(field, operator, value, type),
    };
  }

  function createElseBuilder<
    TData,
    TFieldType,
    TField extends string,
    TOperator extends Operators.ConditionalOperator,
    TValue,
    TThenType,
  >(
    field: TField,
    operator: TOperator,
    value: TValue,
    thenType: TThenType
  ): Builder.ElseBuilder<
    TData,
    TFieldType,
    TField,
    TOperator,
    TValue,
    TThenType
  > {
    return {
      else: <TElseType>(elseValue: TElseType) =>
        createConditionalExpression(
          field,
          operator,
          value,
          thenType,
          elseValue
        ) as Builder.ConditionalExpression<TElseType | TThenType>,
      elseType: <TType extends string>(type: TType) =>
        createConditionalExpression(field, operator, value, thenType, type),
      elseWhen: <TField2 extends string>(field2: TField2) =>
        createFieldBuilder<
          TData,
          any, // Simplified to avoid complex type constraints
          TField2
        >(field2),
    };
  }

  function createConditionalExpression<TResultType>(
    field: string,
    operator: Operators.ConditionalOperator,
    value: any,
    thenType: any,
    elseType: any
  ): Builder.ConditionalExpression<TResultType> {
    const valueStr = value === undefined ? "" : String(value);
    const condition = `${field}${operator}${valueStr}`;
    const expression = `when ${condition} *? ${thenType} : ${elseType}`;

    return {
      expression,
      resultType: (thenType || elseType) as TResultType,
      metadata: {
        field,
        operator,
        value,
        validation: Runtime.validateConditionSyntax(condition),
      },
      toString: () => expression,
      validate: <TSchema>() => ({
        isValid: true,
        errors: [],
        warnings: [],
        result: (thenType || elseType) as TResultType,
      }),
    };
  }

  // Quick creation helpers
  export function when<TData>() {
    return createConditionalBuilder<TData>();
  }

  export function condition(conditionStr: string) {
    return {
      then: (thenValue: any) => ({
        else: (elseValue: any) =>
          `when ${conditionStr} *? ${thenValue} : ${elseValue}`,
        elseType: (elseType: string) =>
          `when ${conditionStr} *? ${thenValue} : ${elseType}`,
      }),
      thenType: (thenType: string) => ({
        else: (elseValue: any) =>
          `when ${conditionStr} *? ${thenType} : ${elseValue}`,
        elseType: (elseType: string) =>
          `when ${conditionStr} *? ${thenType} : ${elseType}`,
      }),
    };
  }
}

// ============================================================================
// TESTING UTILITIES - For development and debugging
// ============================================================================

/**
 * Testing and debugging utilities
 */
export namespace Testing {
  export interface TestCase<TData = any> {
    name: string;
    data: TData;
    expression: string;
    expected: any;
    description?: string;
  }

  export function runTest<TData>(testCase: TestCase<TData>): {
    passed: boolean;
    actual: any;
    expected: any;
    error?: string;
  } {
    try {
      const actual = Runtime.evaluateConditionalExpression(
        testCase.data,
        testCase.expression
      );
      const passed =
        JSON.stringify(actual) === JSON.stringify(testCase.expected);

      return {
        passed,
        actual,
        expected: testCase.expected,
      };
    } catch (error) {
      return {
        passed: false,
        actual: undefined,
        expected: testCase.expected,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  export function runTestSuite(testCases: TestCase[]): {
    passed: number;
    failed: number;
    results: Array<{ testCase: TestCase; result: ReturnType<typeof runTest> }>;
  } {
    const results = testCases.map((testCase) => ({
      testCase,
      result: runTest(testCase),
    }));

    const passed = results.filter((r) => r.result.passed).length;
    const failed = results.length - passed;

    return { passed, failed, results };
  }

  // Example test cases
  export const EXAMPLE_TESTS: TestCase[] = [
    {
      name: "Simple equality",
      data: { status: "active" },
      expression: "when status=active *? enabled : disabled",
      expected: "enabled",
    },
    {
      name: "Numeric comparison",
      data: { age: 25 },
      expression: "when age>=18 *? adult : minor",
      expected: "adult",
    },
    {
      name: "String contains",
      data: { email: "user@example.com" },
      expression: "when email contains @ *? valid : invalid",
      expected: "valid",
    },
    {
      name: "Existence check",
      data: { name: "John" },
      expression: "when name exists *? present : missing",
      expected: "present",
    },
    {
      name: "Array inclusion",
      data: { role: "admin" },
      expression: "when role in(admin,moderator) *? authorized : unauthorized",
      expected: "authorized",
    },
  ];
}

// ============================================================================
// DOCUMENTATION HELPERS - Auto-generated docs
// ============================================================================

/**
 * Documentation generation utilities
 */
export namespace Documentation {
  export function generateOperatorDocs(): string {
    let docs = "# Conditional Operators Reference\n\n";

    const groupedOps = {
      "Existence Operators": ["exists", "!exists"] as const,
      "State Operators": ["empty", "!empty", "null", "!null"] as const,
      "Inclusion Operators": ["in", "!in"] as const,
      "String Operators": [
        "contains",
        "!contains",
        "startsWith",
        "endsWith",
      ] as const,
      "Regex Operators": ["~", "!~"] as const,
      "Comparison Operators": ["=", "!=", ">", ">=", "<", "<="] as const,
    };

    Object.entries(groupedOps).forEach(([group, operators]) => {
      docs += `## ${group}\n\n`;

      operators.forEach((op) => {
        const config = Operators.OPERATOR_CONFIG[op];
        docs += `### \`${op}\`\n`;
        docs += `${config.description}\n\n`;
        docs += `**Type Support:** ${config.typeSupport.join(", ")}\n`;
        docs += `**Requires Value:** ${config.requiresValue ? "Yes" : "No"}\n`;
        docs += `**Examples:**\n`;
        config.examples.forEach((example) => {
          docs += `- \`${example}\`\n`;
        });
        docs += "\n";
      });
    });

    return docs;
  }

  export function generateSyntaxDocs(): string {
    return `# Conditional Syntax Reference

## Syntax (Recommended)
\`\`\`
when <condition> *? <then_value> : <else_value>
\`\`\`

Example:
\`\`\`
when status=active *? enabled : disabled
\`\`\`

## Parentheses Syntax
\`\`\`
when(<condition>) then(<then_value>) else(<else_value>)
\`\`\`

Example:
\`\`\`
when(status=active) then(enabled) else(disabled)
\`\`\`

## Legacy Syntax
\`\`\`
when:<condition>:<then_value>:<else_value>
\`\`\`

Example:
\`\`\`
when:status=active:enabled:disabled
\`\`\`
`;
  }
}
