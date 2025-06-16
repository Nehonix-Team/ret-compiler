# Fortify Schema

[![npm version](https://badge.fury.io/js/fortify-schema.svg)](https://badge.fury.io/js/fortify-schema)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://github.com/Nehonix-Team/fortify-schema/workflows/CI/badge.svg)](https://github.com/Nehonix-Team/fortify-schema/actions)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/fortify-schema)](https://bundlephobia.com/package/fortify-schema)

**A revolutionary TypeScript-first schema validation library with interface-like syntax that's intuitive, type-safe, and incredibly powerful.**

## 📚 Documentation Navigation

| Resource | Description |
|----------|-------------|
| **[📖 Complete Documentation](./docs/README.md)** | Full documentation index with organized sections |
| **[🚀 Quick Reference](./docs/QUICK-REFERENCE.md)** | Cheat sheet for common patterns and syntax |
| **[📝 Field Types Reference](./docs/FIELD-TYPES.md)** | Comprehensive guide to all available types and constraints |
| **[💼 Real-World Examples](./docs/EXAMPLES.md)** | Production-ready schemas for enterprise use |
| **[🔄 Migration Guide](./docs/MIGRATION.md)** | Step-by-step migration from Zod, Joi, Yup |
| **[⚡ Quick Start](#quick-start-guide)** | Get up and running in 5 minutes |
| **[🔧 Schema Transformation](#schema-transformation-with-mod)** | Transform and combine schemas with Mod utilities |

---

## Overview

Fortify Schema reimagines schema validation by bringing TypeScript interface syntax to runtime validation. Unlike traditional schema libraries that require complex APIs and verbose definitions, Fortify Schema allows you to define schemas that look and feel exactly like TypeScript interfaces while providing powerful runtime validation and perfect type inference.

### Key Differentiators

- **Interface-like syntax** that TypeScript developers instantly understand
- **Perfect type inference** with no manual type definitions required
- **Compile-time safety** that prevents invalid properties before runtime
- **Exact union types** instead of generic string/number types
- **Intuitive constraint syntax** with function-like parameters
- **Zero learning curve** for TypeScript developers

---

## The Problem with Existing Solutions

Current schema validation libraries (Zod, Joi, Yup) share common pain points:

**Complex and Verbose Syntax**
```typescript
// Traditional approach (Zod)
const UserSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email(),
  name: z.string().min(2).max(50),
  status: z.enum(["active", "inactive"]),
  role: z.literal("admin")
});
```

**Type Safety Issues**
- Manual type definitions required
- Generic union types instead of exact literals
- No compile-time prevention of invalid properties
- Ambiguous distinction between types and constants

---

## The Fortify Schema Solution

### Clean, Intuitive Syntax

```typescript
import { Interface, Make } from 'fortify-schema';

const UserSchema = Interface({
  id: "number",
  email: "email",
  name: "string(2,50)",                    // Length constraints
  age: "number(18,120)?",                  // Range with optional
  tags: "string[](1,10)?",                 // Array constraints
  status: Make.union("active", "inactive"),
  role: Make.const("admin")
});
```

### Revolutionary Type Inference

```typescript
const result = UserSchema.safeParse(userData);

if (result.success && result.data) {
  // Perfect type inference - no manual definitions needed
  result.data.status;  // "active" | "inactive" (exact union!)
  result.data.role;    // "admin" (exact literal!)
  result.data.age;     // number | undefined (perfect optionals!)
}

// Compile-time safety prevents runtime errors
UserSchema.safeParse({
  id: 1,
  name: "John",
  invalidProp: "error"  // ❌ TypeScript ERROR caught at compile time
});
```

---

## Installation

```bash
npm install fortify-schema
```

**Requirements:**
- TypeScript 4.5+
- Node.js 14+

---

## Quick Start Guide

### Basic Schema Definition

```typescript
import { Interface, Make } from 'fortify-schema';

// Define your schema like a TypeScript interface
const UserSchema = Interface({
  id: "number",
  email: "email",
  name: "string",
  age: "number?",                        // Optional field
  isActive: "boolean?",
  tags: "string[]?",                     // Optional array
  status: Make.union("active", "inactive", "pending"),
  role: Make.const("user")
});
```

### Schema Transformation

```typescript
import { Mod } from 'fortify-schema';

// Create variations of your schema
const PublicUserSchema = Mod.omit(UserSchema, ["password"]);
const PartialUserSchema = Mod.partial(UserSchema);
const ExtendedSchema = Mod.extend(UserSchema, {
  createdAt: "date",
  lastLogin: "date?"
});
```

### Data Validation

```typescript
// Strict validation (recommended for application code)
const result = UserSchema.safeParse(userData);

if (result.success) {
  console.log('✓ Valid user:', result.data);
  // result.data is perfectly typed with exact inference
} else {
  console.log('✗ Validation errors:', result.errors);
}

// Flexible validation (for external/unknown data)
const unknownResult = UserSchema.safeParseUnknown(apiResponse);
```

---

## Core Concepts

### Field Types

> **📖 [Complete Field Types Reference](./docs/FIELD-TYPES.md)** - Comprehensive guide to all available types and constraints

#### Basic Types
```typescript
{
  name: "string",           // String validation
  age: "number",            // Number validation
  active: "boolean",        // Boolean validation
  created: "date",          // Date validation
  data: "any"               // Any type (no validation)
}
```

#### Optional Fields
```typescript
{
  name: "string",           // Required field
  age: "number?",           // Optional field
  bio: "string?",
  tags: "string[]?"         // Optional array
}
```

#### Format Validation
```typescript
{
  email: "email",           // Email format validation
  website: "url",           // URL format validation
  id: "uuid",               // UUID format validation
  phone: "phone",           // Phone number format
  slug: "slug",             // URL slug format
  username: "username"      // Username format rules
}
```

#### Array Types
```typescript
{
  tags: "string[]",         // Array of strings
  scores: "number[]",       // Array of numbers
  flags: "boolean[]",       // Array of booleans
  emails: "email[]"         // Array of validated emails
}
```

### Advanced Type Definitions

#### Constants and Unions
```typescript
import { Make } from 'fortify-schema';

{
  // Safe constants (explicit and unambiguous)
  version: Make.const("1.0"),
  status: Make.const(200),

  // Union types (multiple allowed values)
  priority: Make.union("low", "medium", "high"),
  role: Make.unionOptional("user", "admin", "moderator")
}
```

**Why use `Make`?** It eliminates ambiguity between type specifications and constant values, making schemas more readable and maintainable.

---

## Constraint System

### String Constraints

```typescript
{
  username: "string(3,20)",        // 3-20 characters
  password: "string(8,)",          // Minimum 8 characters
  bio: "string(,500)?",            // Maximum 500 characters, optional
  title: "string(10,100)",         // Exactly 10-100 characters
}
```

### Number Constraints

```typescript
{
  age: "number(18,120)",           // Age range 18-120
  score: "number(0,100)",          // Score 0-100
  price: "number(0.01,999.99)",    // Price with decimal precision
  rating: "number(1,5)?",          // Rating 1-5, optional
}
```

### Array Constraints

```typescript
{
  tags: "string[](1,10)?",         // 1-10 string items, optional
  scores: "number[](3,5)",         // Exactly 3-5 number items
  items: "any[](1,)",              // At least 1 item
  emails: "email[](,20)",          // Maximum 20 email addresses
}
```

### Pattern Validation

```typescript
{
  slug: "string(/^[a-z0-9-]+$/)",           // URL slug pattern
  phone: "string(/^\\+?[1-9]\\d{1,14}$/)", // International phone
  code: "string(/^[A-Z]{2,4}$/)",          // Uppercase code pattern
  hexColor: "string(/^#[0-9a-fA-F]{6}$/)", // Hex color validation
}
```

### Constraint Reference Table

| Syntax | Description | Example |
|--------|-------------|---------|
| `"string(min,max)"` | Length constraints | `"string(3,20)"` |
| `"string(min,)"` | Minimum length only | `"string(8,)"` |
| `"string(,max)"` | Maximum length only | `"string(,100)"` |
| `"string(/regex/)"` | Pattern validation | `"string(/^[a-z]+$/)"` |
| `"number(min,max)"` | Value range | `"number(0,100)"` |
| `"type[](min,max)"` | Array size constraints | `"string[](1,10)"` |
| `"type?"` | Optional field | `"string?"` |

---

## Schema Transformation with Mod

The `Mod` utility provides powerful schema transformation capabilities:

### Combining Schemas

```typescript
const UserSchema = Interface({ id: "number", name: "string" });
const ProfileSchema = Interface({ bio: "string?", avatar: "url?" });

// Merge multiple schemas
const CompleteSchema = Mod.merge(UserSchema, ProfileSchema);
```

### Selecting Fields

```typescript
const UserSchema = Interface({
  id: "number",
  name: "string",
  email: "email",
  password: "string",
  createdAt: "date"
});

// Pick specific fields
const PublicSchema = Mod.pick(UserSchema, ["id", "name", "email"]);

// Omit sensitive fields
const SafeSchema = Mod.omit(UserSchema, ["password"]);
```

### Modifying Field Requirements

```typescript
// Make all fields optional
const PartialSchema = Mod.partial(UserSchema);

// Make all fields required
const RequiredSchema = Mod.required(OptionalSchema);

// Extend with new fields
const ExtendedSchema = Mod.extend(UserSchema, {
  lastLogin: "date?",
  isVerified: "boolean"
});
```

### Complex Transformations

```typescript
// Chain multiple transformations
const APIResponseSchema = Mod.extend(
  Mod.omit(
    Mod.merge(UserSchema, ProfileSchema),
    ["password", "internalId"]
  ),
  {
    metadata: {
      version: Make.const("2.0"),
      timestamp: "date"
    }
  }
);
```

---

## Validation Modes

### Strict Mode (Default)

Fortify Schema is strict by default, respecting exactly what you specify:

```typescript
const schema = Interface({
  id: "number",
  name: "string"
});

// This fails - string "1" is not a number
const result = schema.safeParse({
  id: "1",        // Type mismatch
  name: "John"
});
// result.success === false
```

### Loose Mode (Type Coercion)

Enable automatic type conversion when needed:

```typescript
const looseSchema = Interface({
  id: "number",
  active: "boolean"
}).loose();

// This succeeds with automatic conversion
const result = looseSchema.safeParse({
  id: "123",      // Converted to number
  active: "true"  // Converted to boolean
});

console.log(result.success);  // true
console.log(result.data);     // { id: 123, active: true }
console.log(result.warnings); // Conversion warnings
```

### Strict Object Mode

Prevent additional properties:

```typescript
const strictSchema = Interface({
  id: "number",
  name: "string"
}).strict();

// Fails due to extra property
const result = strictSchema.safeParse({
  id: 1,
  name: "John",
  age: 25  // Not allowed in strict mode
});
```

---

## Validation Methods

### Parse Methods

```typescript
// parse() - Throws on validation failure
try {
  const user = UserSchema.parse(userData);
  // user is fully typed and validated
} catch (error) {
  console.error('Validation failed:', error.message);
}

// safeParse() - Returns result object (recommended)
const result = UserSchema.safeParse(userData);
if (result.success) {
  console.log('Valid data:', result.data);
} else {
  console.log('Errors:', result.errors);
}

// safeParseUnknown() - For dynamic/unknown data
const unknownResult = UserSchema.safeParseUnknown(apiResponse);
```

### Result Structure

```typescript
// Success result
{
  success: true,
  data: T,           // Fully typed validated data
  errors: [],
  warnings: string[] // Type coercion warnings in loose mode
}

// Error result
{
  success: false,
  data: null,
  errors: string[],  // Detailed error messages
  warnings: string[]
}
```

---

## Real-World Examples

### User Management System

```typescript
const UserSchema = Interface({
  // Basic identification
  id: "uuid",
  email: "email",
  username: "string(3,20)",

  // Security
  password: "string(8,)",                      // Minimum 8 characters
  role: Make.union("user", "moderator", "admin"),
  status: Make.union("active", "inactive", "suspended"),

  // Profile information
  profile: {
    firstName: "string(1,50)",
    lastName: "string(1,50)",
    avatar: "url?",
    bio: "string(,500)?",                      // Optional bio, max 500 chars
    dateOfBirth: "date?"
  },

  // Constraints and metadata
  age: "number(13,120)?",                      // Age verification
  tags: "string[](1,10)?",                     // User tags, 1-10 items
  permissions: "string[](,20)?",               // Max 20 permissions

  // Timestamps
  createdAt: "date",
  lastLogin: "date?",

  // Application-specific
  accountType: Make.const("standard"),
  preferences: {
    theme: Make.union("light", "dark", "auto"),
    notifications: "boolean",
    language: "string(/^[a-z]{2}$/)"           // ISO language code
  }
});
```

### API Response Schema

```typescript
const APIResponseSchema = Interface({
  // Response metadata
  version: Make.const("2.0"),
  timestamp: "date",
  requestId: "uuid",

  // Response status
  status: Make.union("success", "error", "partial"),
  statusCode: "number(100,599)",

  // Dynamic content
  data: "any?",
  errors: "string[]?",
  warnings: "string[]?",

  // Pagination (for list responses)
  pagination: {
    page: "number(1,)",
    limit: "number(1,100)",
    total: "number(0,)",
    hasMore: "boolean"
  }?,

  // Environment context
  meta: {
    environment: Make.union("development", "staging", "production"),
    region: "string(/^[a-z]{2}-[a-z]+-\\d$/)", // AWS region format
    cached: "boolean?",
    ttl: "number(0,)?"
  }
});
```

### E-commerce Product Schema

```typescript
const ProductSchema = Interface({
  // Product identification
  id: "uuid",
  sku: "string(/^[A-Z0-9-]{6,20}$/)",
  name: "string(1,200)",
  slug: "string(/^[a-z0-9-]+$/)",

  // Categorization
  category: "string",
  subcategory: "string?",
  tags: "string[](,20)",

  // Pricing
  price: "number(0.01,99999.99)",
  originalPrice: "number(0.01,99999.99)?",
  currency: "string(/^[A-Z]{3}$/)",           // ISO currency code

  // Inventory
  stock: "number(0,)",
  stockStatus: Make.union("in-stock", "low-stock", "out-of-stock"),

  // Product details
  description: "string(,5000)",
  shortDescription: "string(,500)?",
  specifications: "any?",                      // Flexible spec object

  // Media
  images: "url[](1,10)",                      // 1-10 product images
  videos: "url[](,3)?",                       // Optional videos

  // Status and metadata
  status: Make.union("draft", "active", "archived"),
  featured: "boolean",
  createdAt: "date",
  updatedAt: "date",

  // SEO
  seo: {
    title: "string(,60)?",
    description: "string(,160)?",
    keywords: "string[](,10)?"
  }?
});
```

---

## Performance and Bundle Size

### Optimization Features

- **Tree-shakable**: Only import what you use
- **Minimal runtime**: Optimized validation algorithms
- **Type inference**: Zero runtime type overhead
- **Efficient parsing**: Fast validation with detailed error messages

### Bundle Impact

```typescript
// Import only what you need
import { Interface } from 'fortify-schema';              // Core only
import { Interface, Make } from 'fortify-schema';       // + Union types
import { Interface, Make, Mod } from 'fortify-schema';  // + Transformations
```

---

## Migration Guide

### From Zod

```typescript
// Zod
const zodSchema = z.object({
  name: z.string().min(2).max(50),
  age: z.number().int().positive().optional(),
  email: z.string().email(),
  role: z.enum(["user", "admin"])
});

// Fortify Schema
const fortifySchema = Interface({
  name: "string(2,50)",
  age: "number(1,)?"
  email: "email",
  role: Make.union("user", "admin")
});
```

### From Joi

```typescript
// Joi
const joiSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  age: Joi.number().integer().positive(),
  email: Joi.string().email()
});

// Fortify Schema
const fortifySchema = Interface({
  name: "string(2,50)",
  age: "number(1,)",
  email: "email"
});
```

---

## TypeScript Integration

### Perfect Type Inference

Fortify Schema provides industry-leading TypeScript integration:

```typescript
const schema = Interface({
  id: "number",
  name: "string",
  tags: "string[]?",
  status: Make.union("active", "inactive"),
  role: Make.const("user")
});

type InferredType = typeof schema._type;
// Equivalent to:
// {
//   id: number;
//   name: string;
//   tags?: string[];
//   status: "active" | "inactive";
//   role: "user";
// }
```

### Compile-Time Safety

```typescript
// TypeScript prevents invalid properties
const result = schema.safeParse({
  id: 1,
  name: "John",
  invalidProperty: "error"  // ❌ TypeScript error
});

// For unknown data, use safeParseUnknown
const unknownResult = schema.safeParseUnknown(apiData);
```

### IDE Support

- **IntelliSense**: Full autocomplete for schema properties
- **Type checking**: Real-time validation of schema definitions
- **Error highlighting**: Immediate feedback on type mismatches
- **Hover information**: Detailed type information on hover

---

## API Reference

### Interface()

Create a schema from an interface-like definition.

```typescript
Interface(definition: SchemaDefinition): Schema<T>
```

### Make

Utility for creating complex types safely.

```typescript
Make.const(value)                    // Literal constant
Make.union(...values)                // Union type
Make.unionOptional(...values)        // Optional union type
```

### Mod

Schema transformation utilities.

```typescript
Mod.merge(schema1, schema2)          // Combine schemas
Mod.pick(schema, keys)               // Select specific fields
Mod.omit(schema, keys)               // Remove specific fields
Mod.partial(schema)                  // Make all fields optional
Mod.required(schema)                 // Make all fields required
Mod.extend(schema, definition)       // Add new fields
```

### Schema Methods

```typescript
schema.parse(data)                   // Parse with exceptions
schema.safeParse(data)               // Safe parse with known data
schema.safeParseUnknown(data)        // Safe parse with unknown data
schema.loose()                       // Enable type coercion
schema.strict()                      // Prevent extra properties
```

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/Nehonix-Team/fortify-schema.git

# Install dependencies
npm install

# Run tests
npm test

# Build the project
npm run build
```

### Reporting Issues

Please use our [GitHub Issues](https://github.com/Nehonix-Team/fortify-schema/issues) to report bugs or request features.

---

## License

MIT © [Nehonix Team](https://github.com/Nehonix-Team)

---

## Support and Community

- **Documentation**: [GitHub Repository](https://github.com/Nehonix-Team/fortify-schema)
- **Issues**: [Bug Reports & Feature Requests](https://github.com/Nehonix-Team/fortify-schema/issues)
- **Discussions**: [Community Forum](https://github.com/Nehonix-Team/fortify-schema/discussions)
- **NPM Package**: [fortify-schema](https://www.npmjs.com/package/fortify-schema)

---

*Built with precision and care by the Nehonix Team*