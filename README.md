# Fortify Schema

[![npm version](https://badge.fury.io/js/fortify-schema.svg)](https://badge.fury.io/js/fortify-schema)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A revolutionary schema validation system with **TypeScript interface-like syntax** that's incredibly easy to use and much safer than traditional schema libraries like Zod, Joi, or Yup.

## 🎯 The Problem with Current Schema Libraries

**Zod, Joi, Yup** - they all suffer from the same issues:
- **Complex syntax** that doesn't feel natural
- **Verbose definitions** that are hard to read
- **Steep learning curves** for simple validation
- **Dangerous ambiguity** between types and constants

## 💡 Our Solution: Interface-Based Schemas

We created a schema system that **looks and feels exactly like TypeScript interfaces** but provides runtime validation:

```typescript
// ❌ Zod (complex and verbose)
const UserSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email(),
  name: z.string().min(2).max(50),
  status: z.enum(["active", "inactive"]),
  role: z.literal("admin")
});

// ✅ Fortify Schema (clean and intuitive)
import { Interface, SchemaHelpers as SH} from 'fortify-schema';

const UserSchema = Interface({
  id: "number",
  email: "email",
  name: "string(2,50)",                    // 2-50 characters
  age: "number(18,120)?",                  // 18-120 years, optional
  tags: "string[](1,10)?",                 // 1-10 tags, optional
  status: SH.union("active", "inactive"),
  role: SH.const("admin")
});
```

**It's literally that simple!** 🎉

## 🚀 Installation

```bash
npm install fortify-schema
```

## 🔥 Quick Start

```typescript
import { Interface, SchemaHelpers as SH } from 'fortify-schema';

// Define schema like a TypeScript interface
const UserSchema = Interface({
  id: "number",
  email: "email",
  name: "string",
  age: "number?",                        // Optional
  isActive: "boolean?",                  // Optional
  tags: "string[]?",                     // Optional array
  status: SH.union("active", "inactive", "pending"),
  role: SH.const("user")      // Safe constant
});

// Validate data
const result = UserSchema.safeParse({
  id: 1,
  email: 'user@example.com',
  name: 'John Doe',
  status: 'active',
  role: 'user'
});

if (result.success) {
  console.log('Valid user:', result.data);
} else {
  console.log('Validation errors:', result.errors);
}
```

## 📚 Field Types

### Basic Types
```typescript
{
  name: "string",           // String
  age: "number",            // Number
  active: "boolean",        // Boolean
  created: "date",          // Date
  data: "any"               // Any type
}
```

### Optional Fields (with `?`)
```typescript
{
  name: "string",           // Required
  age: "number?",           // Optional
  bio: "string?",           // Optional
  tags: "string[]?"         // Optional array
}
```

## 🎯 Constraint Syntax (NEW!)

### Extended String Syntax
The most intuitive way to add constraints - just like function calls!

#### String Constraints
```typescript
{
  username: "string(3,20)",        // 3-20 characters
  password: "string(8,)",          // min 8 characters
  bio: "string(,500)?",            // max 500 characters, optional
  title: "string(10,100)",         // exactly 10-100 characters
}
```

#### Number Constraints
```typescript
{
  age: "number(18,120)",           // 18-120 years
  score: "number(0,100)",          // 0-100 points
  price: "number(0.01,999.99)",    // decimal ranges
  rating: "number(1,5)?",          // 1-5 stars, optional
}
```

#### Array Constraints
```typescript
{
  tags: "string[](1,10)?",         // 1-10 string items, optional
  scores: "number[](3,5)",         // exactly 3-5 number items
  items: "any[](1,)",              // at least 1 item
  emails: "email[](,20)",          // max 20 emails
}
```

#### Pattern Constraints
```typescript
{
  slug: "string(/^[a-z0-9-]+$/)",           // URL slug pattern
  phone: "string(/^\\+?[1-9]\\d{1,14}$/)", // custom phone pattern
  code: "string(/^[A-Z]{2,4}$/)",          // uppercase code
}
```

#### Real-World Example
```typescript
const UserSchema = Interface({
  // String constraints
  username: "string(3,20)",               // 3-20 chars
  password: "string(8,)",                 // min 8 chars
  bio: "string(,500)?",                   // max 500 chars, optional

  // Number constraints
  age: "number(13,120)",                  // 13-120 years
  score: "number(0,100)",                 // 0-100 points

  // Array constraints
  tags: "string[](1,10)?",                // 1-10 tags, optional
  hobbies: "string[](,5)",                // max 5 hobbies

  // Pattern constraints
  slug: "string(/^[a-z0-9-]+$/)",         // URL slug

  // Still works with SchemaHelpers
  status: SchemaHelpers.union("active", "inactive"),
  role: SchemaHelpers.const("user"),
});
```

### Format Validation
```typescript
{
  email: "email",           // Email format
  website: "url",           // URL format
  id: "uuid",               // UUID format
  phone: "phone",           // Phone format
  slug: "slug",             // URL slug
  username: "username"      // Username format
}
```

### Array Types
```typescript
{
  tags: "string[]",         // Array of strings
  scores: "number[]",       // Array of numbers
  flags: "boolean[]",       // Array of booleans
  emails: "email[]",        // Array of emails
}
```

### Safe Constants & Unions
```typescript
import { SchemaHelpers } from 'fortify-schema';

{
  // Safe constants (no ambiguity!)
  version: SchemaHelpers.const("1.0"),
  status: SchemaHelpers.const(200),

  // Union types (multiple allowed values)
  priority: SchemaHelpers.union("low", "medium", "high"),
  role: SchemaHelpers.unionOptional("user", "admin", "moderator")
}
```

## 📋 Constraint Reference

### String Constraints
| Syntax | Description | Example |
|--------|-------------|---------|
| `"string(min,max)"` | Min and max length | `"string(3,20)"` |
| `"string(min,)"` | Min length only | `"string(8,)"` |
| `"string(,max)"` | Max length only | `"string(,100)"` |
| `"string(/regex/)"` | Pattern validation | `"string(/^[a-z]+$/)"` |
| `"string(min,max)?"` | Optional with constraints | `"string(3,20)?"` |

### Number Constraints
| Syntax | Description | Example |
|--------|-------------|---------|
| `"number(min,max)"` | Min and max value | `"number(0,100)"` |
| `"number(min,)"` | Min value only | `"number(18,)"` |
| `"number(,max)"` | Max value only | `"number(,999)"` |
| `"number(min,max)?"` | Optional with constraints | `"number(1,5)?"` |

### Array Constraints
| Syntax | Description | Example |
|--------|-------------|---------|
| `"type[](min,max)"` | Min and max items | `"string[](1,10)"` |
| `"type[](min,)"` | Min items only | `"number[](3,)"` |
| `"type[](,max)"` | Max items only | `"any[](,20)"` |
| `"type[](min,max)?"` | Optional with constraints | `"string[](1,5)?"` |

### Pattern Examples
```typescript
{
  // Common patterns
  username: "string(/^[a-zA-Z0-9_]+$/)",      // Alphanumeric + underscore
  slug: "string(/^[a-z0-9-]+$/)",             // URL slug
  hexColor: "string(/^#[0-9a-fA-F]{6}$/)",    // Hex color

  // Phone patterns
  phone: "string(/^\\+?[1-9]\\d{1,14}$/)",    // International phone
  usPhone: "string(/^\\d{3}-\\d{3}-\\d{4}$/)", // US phone format

  // Code patterns
  zipCode: "string(/^\\d{5}(-\\d{4})?$/)",    // US ZIP code
  uuid: "string(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)",
}
```

## 🛡️ Why SchemaHelpers?

### The Problem with Raw Values
```typescript
// ❌ DANGEROUS - Looks like a string type but it's actually a constant!
const BadSchema = Interface({
  status: "pending",        // Is this a string type or constant "pending"?
  role: "admin"             // Very confusing and error-prone!
});
```

### The Solution
```typescript
// ✅ SAFE - Crystal clear what's a type vs constant
const GoodSchema = Interface({
  name: "string",                                    // Type
  status: SchemaHelpers.const("pending"),            // Constant
  priority: SchemaHelpers.union("low", "medium", "high")  // Union
});
```

## 🔥 Real-World Examples

### User Management
```typescript
const UserSchema = Interface({
  id: "int",
  email: "email",
  username: "string(3,20)",                    // 3-20 characters
  password: "string(8,)",                      // min 8 characters

  // Number constraints
  age: "number(13,120)?",                      // 13-120 years, optional
  score: "number(0,1000)",                     // 0-1000 points

  // Union types for roles and status
  role: SchemaHelpers.union("user", "moderator", "admin"),
  status: SchemaHelpers.union("active", "inactive", "suspended"),

  // Safe constants
  accountType: SchemaHelpers.const("standard"),

  // Nested object with constraints
  profile: {
    firstName: "string(1,50)",                 // 1-50 characters
    lastName: "string(1,50)",                  // 1-50 characters
    avatar: "url?",
    bio: "string(,500)?",                      // max 500 characters, optional
    slug: "string(/^[a-z0-9-]+$/)"             // URL slug pattern
  },

  // Array constraints
  tags: "string[](1,10)?",                     // 1-10 tags, optional
  permissions: "string[](,20)?",               // max 20 permissions, optional
  hobbies: "string[](,5)?"                     // max 5 hobbies, optional
});
```

### API Response
```typescript
const APIResponseSchema = Interface({
  // Safe constants
  version: SchemaHelpers.const("1.0"),
  status: SchemaHelpers.const(200),

  // Union for response type
  type: SchemaHelpers.union("success", "error", "warning"),

  // Dynamic data
  data: "any?",
  errors: "string[]?",

  // Nested with unions
  metadata: {
    environment: SchemaHelpers.union("dev", "staging", "prod"),
    cached: "boolean?"
  }
});
```

## 🛠️ Validation Methods

### Parse (Throws on Error)
```typescript
try {
  const user = UserSchema.parse(userData);
  // user is fully typed and validated
} catch (error) {
  console.error('Validation failed:', error.message);
}
```

### Safe Parse (Returns Result)
```typescript
const result = UserSchema.safeParse(userData);

if (result.success) {
  console.log('Valid data:', result.data);
} else {
  console.log('Errors:', result.errors);
  console.log('Warnings:', result.warnings);
}
```

## 🛡️ Validation Modes

### Strict Mode (Default)
By default, Fortify Schema is **strict like TypeScript** - it respects exactly what you specify:

```typescript
const schema = Interface({
  id: "number",
  name: "string"
});

// ❌ This will FAIL (string "1" is not a number)
const result = schema.safeParse({
  id: "1",        // String instead of number
  name: "John"
});
console.log(result.success); // false
console.log(result.errors);  // ["Expected number, got string"]
```

### Loose Mode (Type Coercion)
If you want automatic type conversion, use `.loose()`:

```typescript
const looseSchema = Interface({
  id: "number",
  active: "boolean"
}).loose();

// ✅ This will PASS with warnings
const result = looseSchema.safeParse({
  id: "123",      // String converted to number
  active: "true"  // String converted to boolean
});

console.log(result.success);  // true
console.log(result.data);     // { id: 123, active: true }
console.log(result.warnings); // ["String converted to number (loose mode)", ...]
```

### Strict Object Mode
Prevent extra properties:

```typescript
const strictSchema = Interface({
  id: "number",
  name: "string"
}).strict(); // No extra properties allowed

// ❌ This will fail due to extra 'age' property
const result = strictSchema.safeParse({
  id: 1,
  name: "John",
  age: 25  // Extra property not allowed
});
```

## 🎯 Two Approaches

### 1. Interface-based (Recommended)
```typescript
import { Interface, SchemaHelpers } from 'fortify-schema';

const schema = Interface({
  id: "number",
  name: "string",
  status: SchemaHelpers.union("active", "inactive")
});
```

### 2. Traditional Fluent API
```typescript
import { Schema } from 'fortify-schema';

const schema = Schema.object({
  id: Schema.number().int().positive(),
  name: Schema.string().min(2).max(50)
});
```

## 📊 Comparison

| Feature | Fortify Schema | Zod | Joi |
|---------|----------------|-----|-----|
| **Syntax** | TypeScript-like | Complex API | Verbose |
| **Constraints** | `"string(3,20)"` | `.string().min(3).max(20)` | `.string().min(3).max(20)` |
| **Learning Curve** | None | Steep | Moderate |
| **Readability** | Excellent | Poor | Fair |
| **Bundle Size** | Small | Large | Very Large |
| **Type Safety** | Full | Full | Limited |
| **Constants** | Safe & Clear | Ambiguous | Verbose |
| **Strict by Default** | ✅ Yes | ❌ No | ❌ No |
| **Pattern Support** | `"string(/regex/)"` | `.string().regex()` | `.string().pattern()` |

## 🚀 Features

- **🔒 Type Safe**: Full TypeScript type inference
- **📖 Readable**: Looks exactly like TypeScript interfaces
- **🎯 Intuitive Constraints**: `"string(3,20)"`, `"number(0,100)"`, `"array[](1,10)"`
- **🛡️ Safe Constants**: No ambiguity between types and values
- **🔄 Union Types**: Multiple allowed values with clear syntax
- **⚡ Pattern Support**: Regex validation with `"string(/regex/)"`
- **🔧 Strict by Default**: Like TypeScript - respects exactly what you specify
- **🔄 Loose Mode**: Optional type coercion when needed
- **📦 Lightweight**: Small bundle size, tree-shakable
- **⚡ Fast**: Optimized validation performance
- **🔧 Great DX**: Excellent IDE support and autocomplete

## 📝 License

MIT © Nehonix Team

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our repository.

## 📞 Support

- 📖 [Documentation](https://github.com/Nehonix-Team/fortify-schema)
- 🐛 [Issues](https://github.com/Nehonix-Team/fortify-schema/issues)
- 💬 [Discussions](https://github.com/Nehonix-Team/fortify-schema/discussions)

---

**Made with ❤️ by the Nehonix Team**
