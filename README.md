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
import { Interface, SchemaHelpers } from 'fortify-schema';

const UserSchema = Interface({
  id: "number",
  email: "email", 
  name: "string",
  status: SchemaHelpers.union("active", "inactive"),
  role: SchemaHelpers.const("admin")
});
```

**It's literally that simple!** 🎉

## 🚀 Installation

```bash
npm install fortify-schema
```

## 🔥 Quick Start

```typescript
import { Interface, SchemaHelpers } from 'fortify-schema';

// Define schema like a TypeScript interface
const UserSchema = Interface({
  id: "number",
  email: "email",
  name: "string",
  age: "number?",                        // Optional
  isActive: "boolean?",                  // Optional
  tags: "string[]?",                     // Optional array
  status: SchemaHelpers.union("active", "inactive", "pending"),
  role: SchemaHelpers.const("user")      // Safe constant
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
  username: "username",
  
  // Union types for roles and status
  role: SchemaHelpers.union("user", "moderator", "admin"),
  status: SchemaHelpers.union("active", "inactive", "suspended"),
  
  // Safe constants
  accountType: SchemaHelpers.const("standard"),
  
  // Nested object
  profile: {
    firstName: "string",
    lastName: "string",
    avatar: "url?",
    bio: "string?"
  },
  
  // Optional arrays
  tags: "string[]?",
  permissions: "string[]?"
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

### Strict Mode
```typescript
const StrictSchema = Interface({
  id: "number",
  name: "string"
}).strict(); // No extra properties allowed
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
| **Learning Curve** | None | Steep | Moderate |
| **Readability** | Excellent | Poor | Fair |
| **Bundle Size** | Small | Large | Very Large |
| **Type Safety** | Full | Full | Limited |
| **Constants** | Safe & Clear | Ambiguous | Verbose |

## 🚀 Features

- **🔒 Type Safe**: Full TypeScript type inference
- **📖 Readable**: Looks exactly like TypeScript interfaces
- **🛡️ Safe Constants**: No ambiguity between types and values
- **🔄 Union Types**: Multiple allowed values with clear syntax
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
