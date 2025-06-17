import { InferSchemaType } from "../schema/mode/interfaces/Interface";
import { InterfaceSchema } from "../schema/mode/interfaces/InterfaceSchema";
import { SchemaInterface } from "../types/SchemaValidator.type";

/**
 * Schema modification utilities - transform and combine schemas
 */
export class Mod {
    /**
     * Merge multiple schemas into a single schema
     * @example
     * ```typescript
     * const UserSchema = Interface({ id: "number", name: "string" });
     * const ProfileSchema = Interface({ bio: "string?", avatar: "url?" });
     *
     * const MergedSchema = Mod.merge(UserSchema, ProfileSchema);
     * // Result: { id: number, name: string, bio?: string, avatar?: string }
     * ```
     */
    static merge<T, U>(
        schema1: InterfaceSchema<T>,
        schema2: InterfaceSchema<U>
    ): InterfaceSchema<T & U> {
        // Get the internal definitions from both schemas
        const def1 = (schema1 as any).definition as SchemaInterface;
        const def2 = (schema2 as any).definition as SchemaInterface;

        // Merge the definitions
        const mergedDefinition: SchemaInterface = {
            ...def1,
            ...def2
        };

        // Get options from both schemas (schema2 options take precedence)
        const options1 = (schema1 as any).options || {};
        const options2 = (schema2 as any).options || {};
        const mergedOptions = { ...options1, ...options2 };

        return new InterfaceSchema<T & U>(mergedDefinition, mergedOptions);
    }

    /**
     * Pick specific fields from a schema
     * @example
     * ```typescript
     * const UserSchema = Interface({
     *   id: "number",
     *   name: "string",
     *   email: "email",
     *   password: "string"
     * });
     *
     * const PublicUserSchema = Mod.pick(UserSchema, ["id", "name", "email"]);
     * // Result: { id: number, name: string, email: string }
     * ```
     */
    static pick<T, K extends keyof T>(
        schema: InterfaceSchema<T>,
        keys: K[]
    ): InterfaceSchema<Pick<T, K>> {
        const definition = (schema as any).definition as SchemaInterface;
        const options = (schema as any).options || {};

        // Create new definition with only the picked keys
        const pickedDefinition: SchemaInterface = {};
        for (const key of keys) {
            const keyStr = key as string;
            if (keyStr in definition) {
                pickedDefinition[keyStr] = definition[keyStr];
            }
        }

        return new InterfaceSchema<Pick<T, K>>(pickedDefinition, options);
    }

    /**
     * Omit specific fields from a schema
     * @example
     * ```typescript
     * const UserSchema = Interface({
     *   id: "number",
     *   name: "string",
     *   email: "email",
     *   password: "string"
     * });
     *
     * const SafeUserSchema = Mod.omit(UserSchema, ["password"]);
     * // Result: { id: number, name: string, email: string }
     * ```
     */
    static omit<T, K extends keyof T>(
        schema: InterfaceSchema<T>,
        keys: K[]
    ): InterfaceSchema<Omit<T, K>> {
        const definition = (schema as any).definition as SchemaInterface;
        const options = (schema as any).options || {};

        // Create new definition without the omitted keys
        const omittedDefinition: SchemaInterface = { ...definition };
        for (const key of keys) {
            const keyStr = key as string;
            delete omittedDefinition[keyStr];
        }

        return new InterfaceSchema<Omit<T, K>>(omittedDefinition, options);
    }

    /**
     * Make all fields in a schema optional
     * @example
     * ```typescript
     * const UserSchema = Interface({ id: "number", name: "string" });
     * const PartialUserSchema = Mod.partial(UserSchema);
     * // Result: { id?: number, name?: string }
     * ```
     */
    static partial<T>(schema: InterfaceSchema<T>): InterfaceSchema<Partial<T>> {
        const definition = (schema as any).definition as SchemaInterface;
        const options = (schema as any).options || {};

        // Convert all fields to optional by adding "?" suffix
        const partialDefinition: SchemaInterface = {};
        for (const [key, value] of Object.entries(definition)) {
            if (typeof value === "string" && !value.endsWith("?")) {
                partialDefinition[key] = value + "?";
            } else {
                partialDefinition[key] = value;
            }
        }

        return new InterfaceSchema<Partial<T>>(partialDefinition, options);
    }

    /**
     * Make all fields in a schema required (remove optional markers)
     * @example
     * ```typescript
     * const UserSchema = Interface({ id: "number", name: "string?" });
     * const RequiredUserSchema = Mod.required(UserSchema);
     * // Result: { id: number, name: string }
     * ```
     */
    static required<T>(schema: InterfaceSchema<T>): InterfaceSchema<Required<T>> {
        const definition = (schema as any).definition as SchemaInterface;
        const options = (schema as any).options || {};

        // Remove "?" suffix from all fields
        const requiredDefinition: SchemaInterface = {};
        for (const [key, value] of Object.entries(definition)) {
            if (typeof value === "string" && value.endsWith("?")) {
                requiredDefinition[key] = value.slice(0, -1);
            } else {
                requiredDefinition[key] = value;
            }
        }

        return new InterfaceSchema<Required<T>>(requiredDefinition, options);
    }

    /**
     * Extend a schema with additional fields
     * @example
     * ```typescript
     * const BaseSchema = Interface({ id: "number", name: "string" });
     * const ExtendedSchema = Mod.extend(BaseSchema, {
     *   email: "email",
     *   createdAt: "date"
     * });
     * // Result: { id: number, name: string, email: string, createdAt: Date }
     * ```
     */
    static extend<T, U extends SchemaInterface>(
        schema: InterfaceSchema<T>,
        extension: U
    ): InterfaceSchema<T & InferSchemaType<U>> {
        const definition = (schema as any).definition as SchemaInterface;
        const options = (schema as any).options || {};

        const extendedDefinition: SchemaInterface = {
            ...definition,
            ...extension
        };

        return new InterfaceSchema<T & InferSchemaType<U>>(extendedDefinition, options);
    }
}