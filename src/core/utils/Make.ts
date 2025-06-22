import {
  ConstantValue,
  UnionValue,
  SchemaInterface,
} from "../types/SchemaValidator.type";
import { RuntimeTypeConverter } from "../compiler/TypeToSchemaConverter";

/**
 * Helper class for creating schema values
 */
export class Make {
  /**
   * Create a constant value (safer than using raw values)
   * @example
   * ```typescript
   * const schema = Interface({
   *   status: Make.const("pending"),
   *   version: Make.const(1.0),
   *   enabled: Make.const(true)
   * });
   * ```
   */
  static const<const T extends string | number | boolean>(
    value: T
  ): ConstantValue & { const: T } {
    return {
      const: value,
    };
  }

  /**
   * Create a union type (multiple allowed values) with proper type inference
   * @example
   * ```typescript
   * const schema = Interface({
   *   status: Make.union("pending", "accepted", "rejected"),
   *   priority: Make.union("low", "medium", "high")
   * });
   * ```
   */
  static union<const T extends readonly string[]>(...values: T): UnionValue<T> {
    return {
      union: values,
    };
  }

  /**
   * Create an optional union type
   * @example
   * ```typescript
   * const schema = Interface({
   *   status: Make.unionOptional("pending", "accepted", "rejected")
   * });
   * ```
   */
  static unionOptional(...values: string[]): string {
    return values.join("|") + "?";
  }

  /**
   * Infer schema from TypeScript type - type-to-schema conversion
   *
   * ⚠️  IMPORTANT: Compile-time mode (without sample) currently returns "any" placeholder
   * 🚀 RECOMMENDED: Use runtime mode with sample data for proper validation
   *
   * @example
   * ```typescript
   * // ❌ PROBLEMATIC: Compile-time mode (no validation)
   * const schema = Interface({
   *   email: Make.fromType<string>(),  // Returns "any" - no validation!
   * });
   *
   * // ✅ WORKING: Runtime mode (proper validation)
   * const schema = Interface({
   *   email: Make.fromType("test@example.com"),  // Returns "email" - validates!
   *   id: Make.fromType(123),                    // Returns "positive" - validates!
   * });
   *
   * // ✅ ALTERNATIVE: Use explicit types
   * const schema = Interface({
   *   email: "email",              // Explicit type - validates!
   *   id: "positive",              // Explicit type - validates!
   * });
   * ```
   */
}

/**
 * future improvements:
 *
 *  fromType and fromInterface (see @see {@link "/TODOS/TS_COMPILER.todo.md"})
 */
