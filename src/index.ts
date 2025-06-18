/***************************************************************************
 * FortifyJS - Secure Array Types
 *
 * This file contains type definitions for the SecureArray architecture
 *
 * @author Nehonix
 * @license GNU Affero General Public License v3
 *
 * Copyright (c) 2025 Nehonix Team. All rights reserved.
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * If you run this software on a server and provide it as a service over a
 * network, you must provide the source code to users of that service.
 *
 * For the full license text, see: <https://www.gnu.org/licenses/agpl-3.0.html>
 ***************************************************************************** */

/**
 * Fortify Schema - TypeScript Interface-like Schema Validation
 *
 * A revolutionary schema validation system with TypeScript interface-like syntax
 * that's incredibly easy to use and much safer than traditional schema libraries.
 *
 * @example Interface-based (Recommended)
 * ```typescript
 * import { Interface, Make, Mod } from 'fortify-schema';
 *
 * const UserSchema = Interface({
 *   id: "number",
 *   email: "email",
 *   name: "string",
 *   age: "number?",                        // Optional
 *   status: Make.union("active", "inactive"),
 *   role: Make.const("user")      // Safe constant
 * });
 *
 * // Transform schemas easily
 * const PublicUserSchema = Mod.omit(UserSchema, ["password"]);
 * const PartialUserSchema = Mod.partial(UserSchema);
 *
 * const result = UserSchema.safeParse(userData);
 * ```
 *
 * @example Traditional Fluent API
 * ```typescript
 * import { Schema } from 'fortify-schema';
 *
 * const UserSchema = Schema.object({
 *   id: Schema.number().int().positive(),
 *   email: Schema.string().email(),
 *   name: Schema.string().min(2).max(50)
 * });
 * ```
 */

// Main Interface-based API (Recommended)
export {
  Interface,
  Make,
  Mod,
  FieldTypes,
  QuickSchemas,
} from "./core/schema/mode/interfaces/Interface";

// Extensions (Advanced Features)
export {
  Smart,
  When,
  Live,
  Docs,
  Extensions,
  Quick,
  TypeScriptGenerator,
} from "./core/schema/extensions";

// Traditional Fluent API
export { Schema } from "./core/schema/mode/general/Schema";

// Base classes for extending
export { BaseSchema } from "./core/schema/mode/general/BaseSchema";

// Individual schema types
export { StringSchema } from "./core/schema/mode/general/StringSchema";
export { NumberSchema } from "./core/schema/mode/general/NumberSchema";
export { BooleanSchema } from "./core/schema/mode/general/BooleanSchema";
export { ArraySchema } from "./core/schema/mode/general/ArraySchema";
export { ObjectSchema } from "./core/schema/mode/general/ObjectSchema";
export { InterfaceSchema } from "./core/schema/mode/interfaces/InterfaceSchema";

// Type definitions
export type {
  // Interface-based types
  SchemaInterface,
  SchemaFieldType,
  ConstantValue,
  SchemaOptions,
  InferType,
} from "./core/schema/mode/interfaces/Interface";

export type {
  // Traditional API types
  SchemaValidationResult,
  BaseSchemaOptions,
  StringSchemaOptions,
  NumberSchemaOptions,
  BooleanSchemaOptions,
  ArraySchemaOptions,
  ObjectSchemaOptions,
  SchemaType,
  SchemaDefinition,
  SchemaConfig,
} from "./core/types/types";
