# Changelog - ret-compiler

## [Unreleased] - 2025-01-16

### Added
- ✅ **Single file compilation mode** - Can now compile individual `.rel` files
- ✅ **All ReliantType format types** - Added text, password, username, unknown
- ✅ **Literal/Constant values** - Support for `=value` syntax (e.g., `role: =admin`)
- ✅ **Optional fields** - Full support for `?` suffix on types
- ✅ **Record/Generic types** - Proper generation of `record<string,any>` syntax
- ✅ **TypeName as field names** - Can use type names as field names (e.g., `email: email`)
- ✅ **Comprehensive test suite** - Multiple test files covering all features

### Fixed
- ✅ **Constraint generation** - Fixed `positive`, `negative`, `int`, `double` as standalone types
- ✅ **Min/max constraints** - Now generates `"number(min,max)"` instead of `"number(min,,,max)"`
- ✅ **Optional field generation** - `?` suffix now properly added to type strings
- ✅ **Generic type closing bracket** - Fixed missing `>` in `record<string,any>`
- ✅ **Parser token handling** - TypeName tokens can be used as identifiers

### Changed
- Improved lexer to recognize all ReliantType builtin types
- Enhanced parser to handle literal value syntax
- Updated generator to support all new type variants

## Test Coverage

### Passing Tests
1. ✅ `all-types.rel` - All basic and constrained types
2. ✅ `all-format-types.rel` - All 30+ format types
3. ✅ `debug-optional.rel` - Optional field validation
4. ✅ `test-literals.rel` - Literal/constant values
5. ✅ `simple.rel` - Basic schema testing

### Generated Output Quality
- All schemas generate valid ReliantType Interface syntax
- Import statements automatically added
- Proper TypeScript formatting
- Correct constraint syntax

## Feature Coverage

### Fully Supported ✅
- Basic types (string, number, boolean, date, any, object, unknown)
- All format types (email, url, uuid, phone, ip, json, etc.)
- Number types (int, positive, negative, float, double, integer)
- String/Number constraints with min/max
- Union types (string unions)
- Array types (basic arrays)
- Optional types (with `?` suffix)
- Record/Generic types
- Literal/Constant values

### Partially Supported 🚧
- Conditional validation (parsed but not generated)
- Advanced features (extends, mixins, generics - parsed but not generated)

### Not Yet Supported ❌
- Regex patterns
- Array constraints
- Nested objects
- Mixed type unions
- Default values (as defaults, not literals)
- Computed fields
- Validation rules (in output)

## Known Issues

1. **Line number tracking** - Error messages show incorrect line numbers (TODO for later)
2. **Comment syntax** - Only `#` comments supported, `//` treated as division

## Next Steps

1. Add regex pattern support with `matches()` constraint
2. Implement inline conditional validation syntax
3. Add array constraint syntax
4. Support nested object definitions
5. Add CLI colorization
6. Fix line number tracking

## Performance

- Compilation speed: Fast (< 1s for most files)
- Memory usage: Low
- Generated code size: Minimal (only necessary imports)

## Documentation

- ✅ FEATURE_MATRIX.md - Complete feature tracking
- ✅ IMPLEMENTATION_PLAN.md - Roadmap for future features
- ✅ STATUS_REPORT.md - Current status and metrics
- ✅ CHANGELOG.md - This file

## Contributors

- Initial implementation and core features
- Comprehensive testing and validation
- Documentation and examples
