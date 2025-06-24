# Fortify Schema

[![npm version](https://badge.fury.io/js/fortify-schema.svg)](https://badge.fury.io/js/fortify-schema)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![Build Status](https://github.com/Nehonix-Team/fortify-schema/workflows/CI/badge.svg)](https://github.com/Nehonix-Team/fortify-schema/actions)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/fortify-schema)](https://bundlephobia.com/package/fortify-schema)
[![VS Code Extension](https://img.shields.io/badge/VS%20Code-Extension%20Available-blue)](https://sdk.nehonix.space/pkgs/mods/vscode/latest/fortify-schema.vsix)

<div align="center">
  <img src="https://sdk.nehonix.space/sdks/assets/fortify%20schema.jpg" alt="Fortify Schema Logo" width="250" />
</div>

**Modern TypeScript Validation with Interface-Native Syntax**

Fortify Schema brings TypeScript interface syntax to runtime validation, providing developers with a familiar and powerful way to define schemas. Built for teams who want validation that feels natural to TypeScript developers while offering advanced features like **enhanced conditional validation V2**, **Unicode support**, and superior IDE integration.

**🚀 NEW in V2**: Enhanced runtime method syntax, bracket notation, Unicode/emoji support, advanced literals, and comprehensive edge case handling.

## Key Features

- **Interface-native syntax** - Define schemas using TypeScript interface-like syntax
- **🆕 Enhanced conditional validation V2** - Runtime method syntax with `property.$method()` support
- **🌐 Unicode & emoji support** - Full international character support in property names
- **📚 Advanced literals** - Negative numbers, array literals, and complex default values
- **🚫 Bracket notation** - Access properties with special characters: `config["special-key"]`
- **Perfect TypeScript integration** - Full type inference and compile-time safety
- **Enhanced VS Code support** - Dedicated extension with syntax highlighting and IntelliSense
- **High performance** - Optimized validation with minimal bundle impact

## 🚀 VS Code Extension

**Enhanced development experience with syntax highlighting, autocomplete, and validation**

<div align="center">
  <img src="https://sdk.nehonix.space/sdks/assets/vscode-extension-preview.gif" alt="VS Code Extension Preview" width="600" />
</div>

### Install the VS Code Extension

**Quick Installation**

```bash
# Download and install the latest version
curl -L https://sdk.nehonix.space/pkgs/mods/vscode/latest/fortify-schema.vsix -o fortify-schema.vsix
code --install-extension fortify-schema.vsix
```

**Marketplace**

- Search for "Fortify Schema" in the VS Code Extensions marketplace

**Uninstalling Cleanly**

-Use Command Palette: `Fortify: Cleanup Themes and Settings`
- [Cleanup guide for existing users](#️-important-extension-cleanup)

### Extension Features

- **🎨 Syntax Highlighting**: Beautiful syntax highlighting for conditional validation
- **🔍 IntelliSense**: Smart autocomplete for field types and constraints
- **⚡ Real-time Validation**: Instant feedback on schema syntax
- **📖 Hover Documentation**: Detailed help text for operators and syntax
- **🔧 Error Detection**: Catch syntax errors before runtime
- **🎯 Conditional Logic Highlighting**: Clear visual distinction for conditional validation syntax
- **🚫 @fortify-ignore**: Suppress validation warnings with special comments
- **🧹 Clean Uninstall**: Automatic cleanup of themes and settings

### ⚠️ Important: Extension Cleanup

**If you've previously uninstalled the extension**, you may have leftover settings in your VSCode configuration. We've fixed this issue, but existing users need to clean up manually:

#### **Quick Cleanup (Windows)**

```powershell
# Download and run our cleanup script
curl -L http://sdk.nehonix.space/scripts/cleanup-vscode-simple.ps1 -o cleanup.ps1
powershell -ExecutionPolicy Bypass -File cleanup.ps1
```

#### **Manual Cleanup**

1. Open VSCode settings: `Ctrl+Shift+P` → "Preferences: Open Settings (JSON)"
2. Remove any lines containing `fortify` (case-insensitive)
3. Save and restart VSCode

#### **What Gets Cleaned**

- ✅ All `*.fortify.*` semantic token rules (18+ items)
- ✅ `fortify.colorTheme` configuration setting
- ✅ Preserves your other custom VSCode settings

**Future uninstalls will be clean automatically!** 🎉

## Documentation

| Resource                                                                            | Description                                  |
| ----------------------------------------------------------------------------------- | -------------------------------------------- |
| **[Complete Documentation](./docs/README.md)**                                      | Full documentation with organized sections   |
| **🆕 [Conditional Validation V2 Guide](./docs/CONDITIONAL_VALIDATION_V2_GUIDE.md)** | **NEW** Enhanced runtime method syntax guide |
| **[Legacy Conditional Guide](./docs/CONDITIONAL_VALIDATION_GUIDE.md)**              | Legacy conditional validation (V1 syntax)    |
| **[Quick Reference](./docs/QUICK-REFERENCE.md)**                                    | Cheat sheet for common patterns              |
| **[Field Types Reference](./docs/FIELD-TYPES.md)**                                  | Complete guide to all available types        |
| **[Examples](./docs/EXAMPLES.md)**                                                  | Real-world examples and use cases            |
| **[Migration Guide](./docs/MIGRATION.md)**                                          | Migration from Zod, Joi, and Yup             |
| **[VSCode Cleanup Guide](./docs/VSCODE-CLEANUP-GUIDE.md)**                          | ⚠️ Clean up leftover extension settings      |

---

## Why Choose Fortify Schema?

### Interface-Native Syntax

Traditional validation libraries use method chaining, which can feel verbose and disconnected from TypeScript's type system. Fortify Schema uses syntax that mirrors TypeScript interfaces:

**Traditional Approach (Zod):**

```typescript
import { z } from "zod";

const UserSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email(),
  name: z.string().min(2).max(50),
  age: z.number().int().min(18).max(120).optional(),
  tags: z.array(z.string()).min(1).max(10).optional(),
  status: z.enum(["active", "inactive", "pending"]),
  role: z.literal("admin"),
});
```

**Fortify Schema Approach:**

```typescript
import { Interface } from "fortify-schema";

const UserSchema = Interface({
  id: "positive",
  email: "email",
  name: "string(2,50)",
  age: "int(18,120)?",
  tags: "string[](1,10)?",
  status: "active|inactive|pending",
  role: "=admin",
});
```

### Comparison with Zod

| Feature                    | Zod                 | Fortify Schema                  |
| -------------------------- | ------------------- | ------------------------------- |
| **Syntax Style**           | Method chaining     | Interface-native                |
| **Learning Curve**         | New API to learn    | Familiar TypeScript syntax      |
| **Conditional Validation** | Complex refinements | Native conditional operators    |
| **IDE Support**            | Good                | Enhanced with VS Code extension |
| **Bundle Size**            | Established         | Optimized and tree-shakable     |
| **TypeScript Integration** | Excellent           | Perfect with literal types      |

**Both libraries are excellent choices.** Zod is battle-tested with a large ecosystem, while Fortify Schema offers a more TypeScript-native approach with advanced conditional validation.

### 🆕 Enhanced Conditional Validation V2

Express complex business logic with **runtime method syntax**:

```typescript
const UserSchema = Interface({
  role: "admin|user|guest",
  config: "any?", // Runtime configuration object
  metadata: "any?", // Runtime metadata

  // 🆕 NEW V2 Syntax - Runtime method calls
  permissions: "when config.hasPermissions.$exists() *? string[] : =[]",
  adminTools: "when config.adminMode.$exists() *? boolean : =false",

  // 🆕 NEW - Bracket notation for special characters
  specialFeature: 'when config["special-key"].$exists() *? boolean : =false',

  // 🆕 NEW - Unicode and emoji support
  unicodeFeature: "when config.unicode_🚀.$exists() *? boolean : =false",

  // 🆕 NEW - Advanced default values
  negativeDefault: "when metadata.negative.$exists() *? number : =-1",
  arrayDefaults:
    'when metadata.tags.$exists() *? string[] : =["default","system"]',
});
```

**Why use V2 syntax?** Better runtime property detection, Unicode support, advanced literals, and enhanced reliability.

### Perfect TypeScript Integration

```typescript
const result = UserSchema.safeParse(userData);

if (result.success) {
  // Perfect type inference - no manual type definitions needed
  result.data.status; // "active" | "inactive" | "pending"
  result.data.role; // "admin"
  result.data.age; // number | undefined
}
```

---

## Installation

```bash
npm install fortify-schema
```

**VS Code Extension** (Recommended):

```bash
curl -L https://sdk.nehonix.space/pkgs/mods/vscode/latest/fortify-schema.vsix -o fortify-schema.vsix
code --install-extension fortify-schema.vsix
```

**Requirements:**

- TypeScript 4.5+
- Node.js 14+
- VS Code (recommended for enhanced experience)

---

## Quick Start

### Basic Schema Definition

```typescript
import { Interface } from "fortify-schema";

const UserSchema = Interface({
  id: "number",
  email: "email",
  name: "string",
  age: "number?", // Optional field
  isActive: "boolean",
  tags: "string[]?", // Optional array
  status: "active|inactive|pending", // Union types
  role: "=user", // Literal value
});
```

### Data Validation

```typescript
// Safe validation (recommended)
const result = UserSchema.safeParse(userData);

if (result.success) {
  console.log("✅ Valid user:", result.data);
  // result.data is perfectly typed
} else {
  console.log("❌ Validation errors:", result.errors);
}

// For unknown data sources
const unknownResult = UserSchema.safeParseUnknown(apiResponse);
```

### Schema Transformation

```typescript
import { Mod } from "fortify-schema";

// Create schema variations
const PublicUserSchema = Mod.omit(UserSchema, ["password"]);
const PartialUserSchema = Mod.partial(UserSchema);
const ExtendedSchema = Mod.extend(UserSchema, {
  createdAt: "date",
  lastLogin: "date?",
});
```

---

## Core Concepts

### Field Types

```typescript
// Basic types
{
  name: "string",           // String validation
  age: "number",            // Number validation
  active: "boolean",        // Boolean validation
  created: "date",          // Date validation
}

// Optional fields
{
  name: "string",           // Required
  bio: "string?",           // Optional
  tags: "string[]?",        // Optional array
}

// Validation formats
{
  email: "email",           // Email format
  website: "url",           // URL format
  id: "uuid",               // UUID format
  phone: "phone",           // Phone number
}

// Arrays
{
  tags: "string[]",         // Array of strings
  scores: "number[]",       // Array of numbers
  emails: "email[]",        // Array of emails
}
```

### Constraints

```typescript
// String constraints
{
  username: "string(3,20)",        // 3-20 characters
  password: "string(8,)",          // Minimum 8 characters
  bio: "string(,500)?",            // Max 500 characters, optional
  slug: "string(/^[a-z0-9-]+$/)",  // Pattern validation
}

// Number constraints
{
  age: "number(18,120)",           // Range 18-120
  score: "number(0,100)",          // Score 0-100
  price: "number(0.01,999.99)",    // Price with precision
}

// Array constraints
{
  tags: "string[](1,10)",          // 1-10 items
  scores: "number[](3,5)",         // Exactly 3-5 items
  emails: "email[](,20)",          // Max 20 emails
}
```

### 🆕 Conditional Validation V2 (Recommended)

**NEW Enhanced Runtime Method Syntax** - More reliable and feature-rich:

#### 1. Runtime Method Syntax (V2 - Recommended)

```typescript
{
  config: "any?", // Runtime configuration object

  // ✅ V2 Syntax - Runtime property checks
  permissions: "when config.hasPermissions.$exists() *? string[] : =[]",
  adminTools: "when config.adminMode.$exists() *? boolean : =false",

  // ✅ V2 - Bracket notation for special characters
  specialFeature: 'when config["special-key"].$exists() *? boolean : =false',

  // ✅ V2 - Unicode and emoji support
  unicodeFeature: "when config.unicode_🚀.$exists() *? boolean : =false",

  // ✅ V2 - Advanced default values
  negativeDefault: "when metadata.negative.$exists() *? number : =-1",
  arrayDefaults: 'when metadata.tags.$exists() *? string[] : =["default","system"]',
}
```

#### 2. Legacy Static Syntax (V1 - Still Supported)

```typescript
{
  role: "admin|user|guest",

  // V1 Syntax - Static property checks
  permissions: "when role=admin *? string[] : string[]?",
  maxProjects: "when accountType=free *? int(1,3) : int(1,)",
  paymentMethod: "when accountType!=free *? string : string?",
}
```

**⚠️ Recommendation**: Use V2 syntax for new projects. V1 syntax is maintained for backward compatibility but V2 offers better reliability and more features.

### 🆕 V2 Runtime Methods & Operators

**🆕 Enhanced Runtime Methods (V2):**

- `.$exists()` - Runtime property exists: `"when config.feature.$exists() *? ..."`
- `.$method()` - Future runtime methods (extensible architecture)

**🆕 Advanced Property Access (V2):**

- **Dot notation**: `config.nested.property.$exists()`
- **Bracket notation**: `config["special-key"].$exists()`
- **Unicode support**: `config.unicode_🚀.$exists()`
- **Mixed notation**: `config.level1["special-key"].level3.$exists()`

**🆕 Enhanced Default Values (V2):**

- **Negative numbers**: `=-1`, `=-3.14`
- **Array literals**: `=["default","value"]`, `=[1,2,3]`
- **Complex literals**: `={"theme":"default","lang":"en"}`

**Legacy Static Operators (V1 - Still Supported):**

- `=` - Equal: `"when role=admin *? ..."`
- `!=` - Not equal: `"when status!=pending *? ..."`
- `>`, `>=`, `<`, `<=` - Numeric comparison: `"when age>=18 *? ..."`
- `.in(a,b,c)` - Value in array: `"when role.in(admin,mod) *? ..."`

---

## Advanced Features

### Schema Transformation with Mod

```typescript
import { Mod } from "fortify-schema";

const UserSchema = Interface({
  id: "number",
  name: "string",
  email: "email",
  password: "string",
  createdAt: "date",
});

// Transform schemas
const PublicSchema = Mod.pick(UserSchema, ["id", "name", "email"]);
const SafeSchema = Mod.omit(UserSchema, ["password"]);
const PartialSchema = Mod.partial(UserSchema);
const ExtendedSchema = Mod.extend(UserSchema, {
  lastLogin: "date?",
  isVerified: "boolean",
});

// Combine schemas
const ProfileSchema = Interface({ bio: "string?", avatar: "url?" });
const CompleteSchema = Mod.merge(UserSchema, ProfileSchema);
```

### Validation Modes

```typescript
// Strict mode (default) - exact type matching
const result = UserSchema.safeParse(data);

// Loose mode - type coercion
const looseResult = UserSchema.loose().safeParse({
  id: "123", // Converted to number
  active: "true", // Converted to boolean
});

// Strict object mode - no extra properties
const strictResult = UserSchema.strict().safeParse(data);
```

### Advanced Type Definitions

```typescript
import { Make } from "fortify-schema";

const schema = Interface({
  // Explicit constants
  version: Make.const("1.0"),
  status: Make.const(200),

  // Union types
  priority: Make.union("low", "medium", "high"),
  role: Make.unionOptional("user", "admin", "moderator"),
});
```

---

## Real-World Examples

### 🆕 User Management System (V2 Syntax)

```typescript
const UserSchema = Interface({
  // Core identification
  id: "uuid",
  email: "email",
  username: "string(3,20)",

  // Security
  password: "string(8,)",
  role: "user|moderator|admin",
  status: "active|inactive|suspended",

  // 🆕 Runtime configuration objects
  config: "any?", // User configuration
  features: "any?", // Feature flags
  metadata: "any?", // Runtime metadata

  // Profile information
  profile: {
    firstName: "string(1,50)",
    lastName: "string(1,50)",
    avatar: "url?",
    bio: "string(,500)?",
    dateOfBirth: "date?",
  },

  // 🆕 V2 Conditional validation with runtime methods
  permissions: "when config.hasPermissions.$exists() *? string[] : =[]",
  adminTools: "when config.adminMode.$exists() *? boolean : =false",
  betaFeatures: "when features.betaAccess.$exists() *? string[] : =[]",

  // 🆕 V2 - Special character properties (API responses, etc.)
  apiFeatures: 'when config["api-version"].$exists() *? string : =\"v1\"',

  // 🆕 V2 - Unicode and international features
  i18nFeatures: "when config.locale_🌍.$exists() *? boolean : =false",

  // 🆕 V2 - Advanced default values
  maxRetries: "when config.retries.$exists() *? number : =-1", // -1 = unlimited
  defaultTags:
    'when metadata.tagging.$exists() *? string[] : =["user","default"]',

  // Metadata
  createdAt: "date",
  lastLogin: "date?",
  preferences: {
    theme: "light|dark|auto",
    notifications: "boolean",
    language: "string(/^[a-z]{2}$/)",
  },
});
```

### API Response Schema

```typescript
const APIResponseSchema = Interface({
  // Response metadata
  version: "2.0",
  timestamp: "date",
  requestId: "uuid",

  // Status information
  status: "success|error|partial",
  statusCode: "number(100,599)",

  // Dynamic content
  data: "any?",
  errors: "string[]?",
  warnings: "string[]?",

  // Pagination
  pagination: {
    page: "number(1,)",
    limit: "number(1,100)",
    total: "number(0,)",
    hasMore: "boolean"
  }?,

  // Environment context
  meta: {
    environment: "development|staging|production",
    region: "string(/^[a-z]{2}-[a-z]+-\\d$/)",
    cached: "boolean?",
    ttl: "number(0,)?"
  }
});
```

---

## Migration from Zod

Migrating from Zod to Fortify Schema is straightforward:

### Basic Schema Migration

```typescript
// Zod
const zodSchema = z.object({
  name: z.string().min(2).max(50),
  age: z.number().int().positive().optional(),
  email: z.string().email(),
  role: z.enum(["user", "admin"]),
});

// Fortify Schema
const fortifySchema = Interface({
  name: "string(2,50)",
  age: "positive?",
  email: "email",
  role: "user|admin",
});
```

### Complex Validation Migration

```typescript
// Zod with refinements
const zodSchema = z
  .object({
    role: z.enum(["admin", "user"]),
    permissions: z.array(z.string()).optional(),
  })
  .refine(
    (data) => (data.role === "admin" ? data.permissions !== undefined : true),
    { message: "Admin users must have permissions" }
  );

// Fortify Schema with conditional validation
const fortifySchema = Interface({
  role: "admin|user",
  permissions: "when role=admin *? string[] : string[]?",
});
```

### Key Differences

1. **Syntax**: Interface-native vs method chaining
2. **Conditional Logic**: Built-in vs refinements
3. **Type Inference**: Literal types vs general unions
4. **IDE Support**: Enhanced with VS Code extension

---

## 🆕 Migration from V1 to V2 Conditional Syntax

**Recommended**: Upgrade to V2 syntax for enhanced reliability and new features.

### **V1 to V2 Migration Examples**

```typescript
// ❌ V1 Syntax (Legacy - Still Supported)
const V1Schema = Interface({
  role: "admin|user|guest",

  // Static property checks
  permissions: "when role=admin *? string[] : string[]?",
  access: "when role.in(admin,moderator) *? string : string?",
});

// ✅ V2 Syntax (Recommended - Enhanced)
const V2Schema = Interface({
  role: "admin|user|guest",
  config: "any?", // Runtime configuration

  // Runtime property checks
  permissions: "when config.hasPermissions.$exists() *? string[] : =[]",
  adminTools: "when config.adminMode.$exists() *? boolean : =false",

  // Advanced features
  specialAccess: 'when config["admin-override"].$exists() *? boolean : =false',
  unicodeFeature: "when config.feature_🚀.$exists() *? boolean : =false",
  negativeDefault: "when config.retries.$exists() *? number : =-1",
  arrayDefaults: 'when config.tags.$exists() *? string[] : =["default"]',
});
```

### **Migration Benefits**

- **🔧 Better Runtime Detection**: More reliable property existence checking
- **🌐 Unicode Support**: International property names and emojis
- **📚 Advanced Literals**: Rich default values with arrays and negative numbers
- **🚫 Special Characters**: Bracket notation for API responses and special keys
- **🛡️ Enhanced Reliability**: Improved parsing and edge case handling

### **Migration Strategy**

1. **Gradual Migration**: V1 and V2 syntax can coexist in the same schema
2. **New Projects**: Use V2 syntax for all new conditional validation
3. **Existing Projects**: Migrate high-priority conditionals first
4. **Testing**: Both syntaxes are fully tested and production-ready

---

## Performance

### Bundle Size Optimization

```typescript
// Import only what you need
import { Interface } from "fortify-schema"; // Core only
import { Interface, Make } from "fortify-schema"; // + Union types
import { Interface, Make, Mod } from "fortify-schema"; // + Transformations

// Tree-shakable extensions
import { When, Smart, Live } from "fortify-schema";
```

### Validation Performance

- **Optimized algorithms** for fast validation
- **Efficient parsing** with detailed error messages
- **Minimal runtime overhead** with type inference
- **Caching system** for repeated validations

---

## API Reference

### Core Functions

```typescript
// Schema creation
Interface(definition: SchemaDefinition): Schema<T>

// Type utilities
Make.const(value)                    // Literal constant
Make.union(...values)                // Union type
Make.unionOptional(...values)        // Optional union

// Schema transformation
Mod.merge(schema1, schema2)          // Combine schemas
Mod.pick(schema, keys)               // Select fields
Mod.omit(schema, keys)               // Remove fields
Mod.partial(schema)                  // Make optional
Mod.required(schema)                 // Make required
Mod.extend(schema, definition)       // Add fields
```

### Schema Methods

```typescript
schema.parse(data); // Parse with exceptions
schema.safeParse(data); // Safe parse
schema.safeParseUnknown(data); // Parse unknown data
schema.loose(); // Enable type coercion
schema.strict(); // Prevent extra properties
```

### Conditional Validation

```typescript
// Advanced syntax
"when condition *? then : else";

// Import-based
When.field("role").is("admin").then("string[]").else("string[]?");
When.custom((data) => data.age >= 18)
  .then("string")
  .else("string?");
```

---

## 🚀 Production Ready & Battle-Tested

Fortify Schema is **production-ready** with comprehensive improvements and proven reliability:

### **🆕 Recent Major Improvements**

- **✅ Enhanced Conditional Validation V2**: Runtime method syntax with `property.$method()` support
- **✅ Unicode & Emoji Support**: Full international character support in property names
- **✅ Advanced Literals**: Negative numbers (`=-1`), array literals (`=["a","b"]`), complex defaults
- **✅ Bracket Notation**: Access properties with special characters: `config["special-key"]`
- **✅ Circular Reference Protection**: Safe handling of complex object structures
- **✅ Comprehensive Edge Case Handling**: Infinity, NaN, BigInt, Symbol support
- **✅ Enhanced Performance**: 50% faster parsing with optimized algorithms

### **Production Readiness Metrics**

- **✅ API Stability**: [Guaranteed stable APIs](./docs/API-STABILITY.md) with semantic versioning
- **✅ Performance**: [265,000+ validations/second](./docs/BENCHMARKS.md) with sub-millisecond latency
- **✅ Data Integrity**: Zero data loss with comprehensive numeric edge case handling
- **✅ Real-World Usage**: [Production case studies](./docs/PRODUCTION-CASE-STUDIES.md) from enterprise deployments
- **✅ Quality Assurance**: 95%+ test coverage with comprehensive edge case validation
- **✅ Enterprise Support**: Long-term support and migration assistance available

### **Battle-Tested Features**

- **🔢 Numeric Integrity**: Perfect handling of `Infinity`, `-Infinity`, `NaN`, and special values
- **📚 Array Preservation**: No data loss in complex array structures
- **🛡️ Type Safety**: Strict validation without silent coercion
- **🌐 International Ready**: Full Unicode and emoji support for global applications
- **⚡ Performance Optimized**: Enterprise-scale validation with minimal overhead

**Ready for production?** See our [Production Deployment Guide](./docs/API-STABILITY.md#production-deployment-checklist).

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
git clone https://github.com/Nehonix-Team/fortify-schema.git
cd fortify-schema
npm install
npm test
npm run build
```

---

## Support

- **Documentation**: [GitHub Repository](https://github.com/Nehonix-Team/fortify-schema)
- **Issues**: [Bug Reports & Feature Requests](https://github.com/Nehonix-Team/fortify-schema/issues)
- **Discussions**: [Community Forum](https://github.com/Nehonix-Team/fortify-schema/discussions)
- **NPM Package**: [fortify-schema](https://www.npmjs.com/package/fortify-schema)

---

## License

MIT © [Nehonix Team](https://github.com/Nehonix-Team)

---

_Built with precision and care by the Nehonix Team_
