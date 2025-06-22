/**
 * Conditional Validation - dependent field validation
 *
 * This module provides powerful conditional validation where fields can depend
 * on other fields' values, making complex business logic validation simple.
 */

import { SchemaInterface } from "../mode/interfaces/Interface";

/**
 * Conditional validation utilities
 */
export const When = {
  /**
   * Create conditional validation based on another field's value
   *
   * @example
   * ```typescript
   * const UserSchema = Interface({
   *   accountType: Make.union("free", "premium", "enterprise"),
   *   maxProjects: When.field("accountType").is("free").then("int(1,3)")
   *                   .is("premium").then("int(1,50)")
   *                   .is("enterprise").then("int(1,)")
   *                   .default("int(1,1)"),
   *
   *   paymentMethod: When.field("accountType").isNot("free").then("string").else("string?"),
   *   billingAddress: When.field("paymentMethod").exists().then({
   *     street: "string",
   *     city: "string",
   *     country: "string(2,2)"
   *   }).else("any?")
   * });
   * ```
   */
  field(fieldName: string): ConditionalBuilder {
    return new ConditionalBuilder(fieldName);
  },

  /**
   * Create validation that depends on multiple fields
   *
   * @example
   * ```typescript
   * const OrderSchema = Interface({
   *   orderType: Make.union("pickup", "delivery"),
   *   address: "string?",
   *   deliveryFee: "number?",
   *
   *   // Complex conditional validation
   *   ...When.fields(["orderType", "address"]).match({
   *     orderType: "delivery",
   *     address: (val) => val && val.length > 0
   *   }).then({
   *     deliveryFee: "number(0,)"  // Required for delivery with address
   *   }).else({
   *     deliveryFee: "number?"     // Optional otherwise
   *   })
   * });
   * ```
   */
  fields(fieldNames: string[]): MultiConditionalBuilder {
    return new MultiConditionalBuilder(fieldNames);
  },

  /**
   * Create custom validation logic
   *
   * @example
   * ```typescript
   * const EventSchema = Interface({
   *   startDate: "date",
   *   endDate: "date",
   *
   *   // Custom validation: endDate must be after startDate
   *   ...When.custom((data) => {
   *     if (data.endDate <= data.startDate) {
   *       return { error: "End date must be after start date" };
   *     }
   *     return { valid: true };
   *   })
   * });
   * ```
   */
  custom(
    validator: (data: any) => { valid: true } | { error: string }
  ): CustomValidator {
    return new CustomValidator(validator);
  },
};

/**
 * Builder for single field conditional validation
 */
class ConditionalBuilder {
  private conditions: Array<{
    condition: (value: any) => boolean;
    schema: any;
  }> = [];
  private defaultSchema: any = null;

  constructor(private fieldName: string) {}

  /**
   * Check if field equals specific value
   */
  is(value: any): ConditionalThen {
    return new ConditionalThen(this, (fieldValue) => fieldValue === value);
  }

  /**
   * Check if field does not equal specific value
   */
  isNot(value: any): ConditionalThen {
    return new ConditionalThen(this, (fieldValue) => fieldValue !== value);
  }

  /**
   * Check if field exists (not null/undefined)
   */
  exists(): ConditionalThen {
    return new ConditionalThen(this, (fieldValue) => fieldValue != null);
  }

  /**
   * Check if field matches pattern
   */
  matches(pattern: RegExp): ConditionalThen {
    return new ConditionalThen(
      this,
      (fieldValue) => typeof fieldValue === "string" && pattern.test(fieldValue)
    );
  }

  /**
   * Check if field is in array of values
   */
  in(values: any[]): ConditionalThen {
    return new ConditionalThen(this, (fieldValue) =>
      values.includes(fieldValue)
    );
  }

  /**
   * Custom condition function
   */
  when(condition: (value: any) => boolean): ConditionalThen {
    return new ConditionalThen(this, condition);
  }

  addCondition(condition: (value: any) => boolean, schema: any): this {
    this.conditions.push({ condition, schema });
    return this;
  }

  default(schema: any): any {
    this.defaultSchema = schema;
    return this.build();
  }

  build(): any {
    // Return a special object that the validation engine can recognize
    return {
      __conditional: true,
      fieldName: this.fieldName,
      conditions: this.conditions,
      default: this.defaultSchema,
    };
  }
}

/**
 * Builder for the "then" part of conditional validation
 */
class ConditionalThen {
  constructor(
    private builder: ConditionalBuilder,
    private condition: (value: any) => boolean
  ) {}

  then(schema: any): ConditionalBuilder {
    return this.builder.addCondition(this.condition, schema);
  }
}

/**
 * Builder for multi-field conditional validation
 */
class MultiConditionalBuilder {
  private matchConditions: any = {};

  constructor(private fieldNames: string[]) {}

  match(conditions: Record<string, any>): MultiConditionalThen {
    this.matchConditions = conditions;
    return new MultiConditionalThen(this, conditions);
  }
}

/**
 * Builder for multi-field "then" part
 */
class MultiConditionalThen {
  constructor(
    private builder: MultiConditionalBuilder,
    private conditions: Record<string, any>
  ) {}

  then(schema: any): MultiConditionalElse {
    return new MultiConditionalElse(schema, null);
  }
}

/**
 * Builder for multi-field "else" part
 */
class MultiConditionalElse {
  constructor(
    private thenSchema: any,
    private elseSchema: any
  ) {}

  else(schema: any): any {
    return {
      __multiConditional: true,
      then: this.thenSchema,
      else: schema,
    };
  }
}

/**
 * Custom validator builder
 */
class CustomValidator {
  constructor(
    private validator: (data: any) => { valid: true } | { error: string }
  ) {}

  build(): any {
    return {
      __customValidator: true,
      validator: this.validator,
    };
  }
}

/**
 * schema composition with inheritance
 */
export const Extend = {
  /**
   * Create schema inheritance with method-like syntax
   *
   * @example
   * ```typescript
   * const BaseEntitySchema = Interface({
   *   id: "uuid",
   *   createdAt: "date",
   *   updatedAt: "date"
   * });
   *
   * const UserSchema = Extend.from(BaseEntitySchema).with({
   *   email: "email",
   *   username: "string(3,20)",
   *   profile: {
   *     firstName: "string",
   *     lastName: "string"
   *   }
   * });
   *
   * const AdminSchema = Extend.from(UserSchema).with({
   *   permissions: "string[]",
   *   role: Make.const("admin")
   * }).override({
   *   email: "email(,254)"  // Override with more specific validation
   * });
   * ```
   */
  from(baseSchema: SchemaInterface): ExtendBuilder {
    return new ExtendBuilder(baseSchema);
  },
};

/**
 * Builder for schema extension
 */
class ExtendBuilder {
  constructor(private baseSchema: SchemaInterface) {}

  with(additionalFields: any): ExtendWithBuilder {
    return new ExtendWithBuilder(this.baseSchema, additionalFields);
  }
}

/**
 * Builder for extended schema with additional methods
 */
class ExtendWithBuilder {
  constructor(
    private baseSchema: SchemaInterface,
    private additionalFields: any
  ) {}

  override(overrides: any): SchemaInterface {
    // Merge base schema, additional fields, and overrides
    return {
      ...this.baseSchema,
      ...this.additionalFields,
      ...overrides,
    } as SchemaInterface;
  }

  build(): SchemaInterface {
    return {
      ...this.baseSchema,
      ...this.additionalFields,
    } as SchemaInterface;
  }
}

/**
 * Export all utilities
 */
export {
  ConditionalBuilder,
  MultiConditionalBuilder,
  CustomValidator,
  ExtendBuilder,
};
export default When;
