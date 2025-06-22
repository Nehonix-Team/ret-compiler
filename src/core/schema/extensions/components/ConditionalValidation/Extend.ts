import { SchemaInterface } from "../../../../types/SchemaValidator.type";

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
export class ExtendBuilder {
  constructor(private baseSchema: SchemaInterface) {}

  with(additionalFields: any): ExtendWithBuilder {
    return new ExtendWithBuilder(this.baseSchema, additionalFields);
  }
}

/**
 * Builder for extended schema with additional methods
 */
export class ExtendWithBuilder {
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
