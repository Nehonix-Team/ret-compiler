# Changelog

All notable changes to Fortify Schema are documented in this file, following the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format and adhering to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Conditional Validation**: Enhanced support for conditional fields with full TypeScript inference.
  - `*?` syntax: `"when role=admin *? string[] : string[]?"`
  - Parentheses syntax: `"when(role=admin) then(string[]) else(string[]?)"`
  - Import-based syntax: `When.field("role").is("admin").then("string[]").else("string[]?")`
  - Provides compile-time type checking and runtime validation.
  - Supports IDE autocompletion and error detection.
- **Schema Transformation Utilities**: Introduced `Mod` module for schema manipulation.
  - `Mod.merge()`: Combine multiple schemas.
  - `Mod.pick()`: Select specific fields.
  - `Mod.omit()`: Remove specific fields.
  - `Mod.partial()`: Make all fields optional.
  - `Mod.required()`: Make all fields required.
  - `Mod.extend()`: Add fields to existing schemas.
- **Extension System**: Added modular extensions with TypeScript support.
  - `Smart`: Generates schemas from sample data or types.
  - `When`: Supports advanced conditional validation.
  - `Live`: Enables real-time validation for dynamic data.
  - `Docs`: Generates schema documentation automatically.
  - `Extensions`: Provides unified access to extension features.
  - `Quick`: Offers shortcuts for common extension tasks.
  - `TypeScriptGenerator`: Creates TypeScript types from schemas.
- **Value Creation**: Renamed `SchemaHelpers` to `Make` for clarity.
  - `Make.const()`: Defines exact constant values.
  - `Make.union()`: Creates union types with precise inference.
- **Strict Validation**: Enabled by default for precise type enforcement.
- **Documentation**: Overhauled for clarity and accessibility.
  - [Complete Documentation](./docs/README.md)
  - [Quick Reference](./docs/QUICK-REFERENCE.md)
  - [Field Types Reference](./docs/FIELD-TYPES.md)
  - [Examples](./docs/EXAMPLES.md)
  - [Migration Guide](./docs/MIGRATION.md)

### Fixed

- ✅ **Regex Pattern Validation**: Resolved issue with regex pattern validation.
- ✅ **Optional Field Type Inference**: Improved TypeScript inference for optional fields.
- ✅ **Constraint Parsing**: Enhanced reliability of constraint parsing logic.

### Changed

- **API Naming**: Renamed `SchemaHelpers` to `Make` for improved developer experience.
- **Documentation Structure**: Reorganized for better navigation and discoverability.
- **Type System**: Strengthened type inference for seamless TypeScript integration.

### Performance

- Optimized validation performance for faster processing.
- Maintained minimal bundle size despite new features.
- Improved tree-shaking for better build optimization.

## [1.0.0] - 2025-06-14/2025-06-13

### Added

- **Interface-based Schema Definition**: TypeScript-like syntax for schema creation.
- **Basic Field Types**: Support for string, number, boolean, date, and array validation.
- **Format Validation**: Includes email, URL, UUID, and phone number formats.
- **Constraint System**: Supports length, range, and size constraints.
- **Array Validation**: Validates arrays with size constraints.
- **Union Types**: Allows multiple values with type safety.
- **Validation Methods**: Includes `parse()`, `safeParse()`, and `safeParseUnknown()`.
- **Error Handling**: Provides detailed error messages and warnings.
- **Loose Mode**: Optional type coercion for external data.
- **Documentation**: Includes getting started guide and basic examples.

### Features

- TypeScript-first design with zero dependencies.
- Small, tree-shakable bundle size.
- Precise type inference for robust type safety.
- Intuitive API for ease of use.

## Migration Notes

### From Pre-1.0 to 1.0+

For users upgrading from pre-release versions:

1. **Update Imports**

   ```typescript
   // Old
   import { Interface, SchemaHelpers } from "fortify-schema";

   // New
   import { Interface, Make, Mod } from "fortify-schema";
   ```

2. **Update Helper Usage**

   ```typescript
   // Old
   status: SchemaHelpers.union("active", "inactive"),
   role: SchemaHelpers.const("admin")

   // New
   status: Make.union("active", "inactive"),
   role: Make.const("admin")
   ```

3. **Use Transformation Utilities**
   ```typescript
   const PublicSchema = Mod.omit(UserSchema, ["password"]);
   const PartialSchema = Mod.partial(UserSchema);
   ```

### Breaking Changes

- Renamed `SchemaHelpers` to `Make` (use find/replace).
- Requires TypeScript 4.5+ for enhanced type inference.
- Default validation is stricter; use `.loose()` for previous behavior.

## Roadmap

### Upcoming Features

- **Async Validation**: Support for asynchronous validation rules.
- **Internationalization**: Multi-language error messages.
- **Plugin System**: Extensible validation plugins.
- **Performance Monitoring**: Built-in metrics for validation performance.
- **Custom Error Formatting**: Flexible error message customization.

### Long-term Goals

- **Runtime Schema Generation**: Generate schemas from TypeScript types.
- **Advanced Introspection**: Tools for schema analysis and documentation.
- **IDE Extensions**: Enhanced IDE support for schema development.
- **Framework Integrations**: Native support for popular frameworks.

## Contributing

Contributions are welcome! See the [Contributing Guide](./CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](./LICENSE) for details.
