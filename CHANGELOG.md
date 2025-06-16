# Changelog

All notable changes to Fortify Schema will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- 🎯 **Perfect Type Inference** - Revolutionary TypeScript integration with exact literal types
- 🔧 **Schema Transformation Utilities** - New `Mod` utilities for schema manipulation
  - `Mod.merge()` - Combine multiple schemas
  - `Mod.pick()` - Select specific fields
  - `Mod.omit()` - Remove specific fields
  - `Mod.partial()` - Make all fields optional
  - `Mod.required()` - Make all fields required
  - `Mod.extend()` - Add new fields to existing schema
- 💎 **Clean Value Creation** - Renamed `SchemaHelpers` to `Make` for better developer experience
  - `Make.const()` - Create exact constant values
  - `Make.union()` - Create union types with exact inference
- 🛡️ **Strict Validation by Default** - Like TypeScript, respects exactly what you specify
- 🔍 **Enhanced Pattern Validation** - Fixed regex pattern validation bug
- 📚 **Comprehensive Documentation** - Complete documentation overhaul
  - [Complete Documentation Index](./docs/README.md)
  - [Quick Reference Guide](./docs/QUICK-REFERENCE.md)
  - [Field Types Reference](./docs/FIELD-TYPES.md)
  - [Real-World Examples](./docs/EXAMPLES.md)
  - [Migration Guide](./docs/MIGRATION.md)

### Fixed
- 🐛 **Regex Pattern Validation** - Fixed critical bug where regex patterns were not being validated
- ✅ **Optional Field Type Inference** - Fixed TypeScript type inference for optional fields
- 🔧 **Constraint Parsing** - Improved constraint parsing logic for better reliability

### Changed
- 🏷️ **API Naming** - `SchemaHelpers` renamed to `Make` for better developer experience
- 📖 **Documentation Structure** - Reorganized documentation for better discoverability
- 🎯 **Type System** - Enhanced type inference for perfect TypeScript integration

### Performance
- ⚡ **Validation Speed** - Optimized validation performance
- 📦 **Bundle Size** - Maintained small bundle size while adding features
- 🌳 **Tree Shaking** - Improved tree-shaking support

## [1.0.0] - Initial Release

### Added
- 🚀 **Interface-based Schema Definition** - TypeScript interface-like syntax
- 🔤 **Basic Field Types** - String, number, boolean, date, array validation
- 📧 **Format Validation** - Email, URL, UUID, phone number formats
- 🔢 **Constraint System** - Length, range, and size constraints
- 📚 **Array Validation** - Array type validation with size constraints
- 🎯 **Union Types** - Multiple allowed values with type safety
- 🛡️ **Validation Methods** - `parse()`, `safeParse()`, `safeParseUnknown()`
- 📝 **Error Handling** - Detailed error messages and warnings
- 🔧 **Loose Mode** - Optional type coercion for external data
- 📖 **Basic Documentation** - Getting started guide and examples

### Features
- TypeScript-first design
- Zero dependencies
- Small bundle size
- Tree-shakable
- Perfect type inference
- Intuitive API

---

## Migration Notes

### From Pre-1.0 to 1.0+

If you're upgrading from a pre-release version:

1. **Update Imports**
   ```typescript
   // Old
   import { Interface, SchemaHelpers } from 'fortify-schema';
   
   // New
   import { Interface, Make, Mod } from 'fortify-schema';
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

3. **Use New Transformation Utilities**
   ```typescript
   // New capabilities
   const PublicSchema = Mod.omit(UserSchema, ["password"]);
   const PartialSchema = Mod.partial(UserSchema);
   ```

### Breaking Changes

- `SchemaHelpers` renamed to `Make` (simple find/replace)
- Enhanced type inference may require TypeScript 4.5+
- Stricter validation by default (use `.loose()` for old behavior)

---

## Roadmap

### Upcoming Features
- 🔄 **Async Validation** - Support for asynchronous validation rules
- 🌐 **Internationalization** - Multi-language error messages
- 🔌 **Plugin System** - Extensible validation plugins
- 📊 **Performance Monitoring** - Built-in performance metrics
- 🎨 **Custom Error Formatting** - Customizable error message formats

### Long-term Goals
- 🚀 **Runtime Schema Generation** - Generate schemas from TypeScript types
- 🔍 **Advanced Introspection** - Schema analysis and documentation tools
- 🌟 **IDE Extensions** - Enhanced IDE support and tooling
- 📱 **Framework Integrations** - First-class support for popular frameworks

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](./LICENSE) file for details.
