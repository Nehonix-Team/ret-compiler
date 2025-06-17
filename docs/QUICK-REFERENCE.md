# Fortify Schema - Quick Reference

A concise guide to the most commonly used field types and patterns in Fortify Schema.

## Basic Types

```typescript
const schema = Interface({
  // Basic types
  name: "string",           // Any string
  age: "number",            // Any number
  active: "boolean",        // true or false
  created: "date",          // Date object
  data: "any",              // Any type

  // Optional fields
  bio: "string?",           // Optional string
  score: "number?",         // Optional number
});
```

## Numbers

```typescript
{
  // Basic numbers
  count: "int",             // Integer
  price: "number",          // Any number
  rating: "positive",       // Positive number (> 0)

  // Constrained numbers
  age: "int(18,120)",       // Integer between 18 and 120
  score: "number(0,100)",   // Number between 0 and 100
  quantity: "int(1,)",      // Integer >= 1
  discount: "float(0,100)", // Float between 0 and 100
}
```

## Strings

```typescript
{
  // Basic strings
  title: "string",          // Any string
  email: "email",           // Email format
  website: "url",           // URL format
  id: "uuid",               // UUID format

  // Strings with length constraints
  username: "string(3,20)", // 3 to 20 characters
  password: "string(8,)",   // Minimum 8 characters
  bio: "string(,500)",      // Maximum 500 characters

  // Strings with patterns
  slug: "string(/^[a-z0-9-]+$/)",     // URL slug
  code: "string(/^[A-Z]{2,4}$/)",     // 2 to 4 uppercase letters
}
```

## Arrays

```typescript
{
  // Basic arrays
  tags: "string[]",         // Array of strings
  scores: "number[]",       // Array of numbers
  emails: "email[]",        // Array of emails

  // Arrays with size constraints
  items: "string[](1,10)",  // 1 to 10 string items
  photos: "url[](,5)",      // Maximum 5 URLs
  scores: "number[](3,)",   // Minimum 3 numbers

  // Optional arrays
  hobbies: "string[]?",     // Optional string array
  ratings: "number[](1,5)?", // Optional, 1 to 5 numbers
}
```

## Special Values

```typescript
import { Interface, Make } from 'fortify-schema';

const schema = Interface({
  // Constants (exact values)
  version: Make.const("1.0"),           // Exactly "1.0"
  status: Make.const(200),              // Exactly 200

  // Unions (multiple options)
  priority: Make.union("low", "medium", "high"),
  theme: Make.union("light", "dark", "auto"),
  role: Make.union("user", "admin", "moderator"),
});
```

## Conditional Validation

**Enhanced TypeScript inference for conditional fields**

```typescript
import { Interface, When } from 'fortify-schema';

const schema = Interface({
  role: "admin|user|guest",
  accountType: "free|premium|enterprise",

  // Conditional fields with *? syntax for clear TypeScript inference
  permissions: "when role=admin *? string[] : string[]?",
  maxProjects: "when accountType=free *? int(1,3) : int(1,)",
  paymentMethod: "when accountType!=free *? string : string?",

  // Parentheses syntax (runtime validation only, no TypeScript inference)
  adminFeatures: "when(role=admin) then(string[]) else(string[]?)",

  // Import-based syntax for complex logic
  seniorDiscount: When.field("age").greaterThan(65).then("number").else("number?")
});

// TypeScript enforces correct types based on conditions
const adminUser = {
  role: "=admin" as const,
  permissions: ["read", "write"], // ✅ string[]
  maxProjects: 100               // ✅ number
};

// TypeScript catches errors at compile time
const invalidUser = {
  role: "=admin" as const,
  permissions: ["read", 2]  // ❌ TypeScript error: Type 'number' is not assignable to type 'string'
};
```

### Conditional Syntax Reference

| Syntax | Description | Example |
|--------|-------------|---------|
| **`*?` Syntax** | Clear, with TypeScript inference | |
| `"when condition *? then : else"` | Defines conditional logic | `"when role=admin *? string[] : string[]?"` |
| `"when condition *? then"` | Applies only when condition is met | `"when role=admin *? string[]"` |
| **Parentheses Syntax** | Runtime validation only | |
| `"when(condition) then(schema) else(schema)"` | Structured, no TypeScript inference | `"when(role=admin) then(string[]) else(string[]?)"` |
| **Import-based Syntax** | Fluent API for complex logic | |
| `When.field("field").is("value").then("schema").else("schema")` | Most flexible for advanced validation | |

**Benefits of `*?` syntax:**
- Full TypeScript type inference for compile-time safety
- Clear separation of condition and logic
- Readable, natural syntax
- Avoids confusion with optional `?` operator

**Note**: Parentheses syntax is runtime-only and does not support TypeScript inference due to template literal constraints.

## Constraint Patterns

| Pattern | Description | Example |
|---------|-------------|---------|
| `"type?"` | Optional field | `"string?"` |
| `"type(min,max)"` | Range constraint | `"number(0,100)"` |
| `"type(min,)"` | Minimum only | `"string(8,)"` |
| `"type(,max)"` | Maximum only | `"string(,100)"` |
| `"type(/regex/)"` | Pattern validation | `"string(/^[a-z]+$/)"` |
| `"type[](min,max)"` | Array size | `"string[](1,10)"` |
| **Conditional Validation** | | |
| `"when condition *? then : else"` | Conditional logic | `"when role=admin *? string[] : string[]?"` |
| `"when(condition) then(schema) else(schema)"` | Runtime conditional | `"when(role=admin) then(string[]) else(string[]?)"` |
| `"when:field=value:then:else"` | Legacy conditional syntax | `"when:role=admin:string[]:string[]?"` |

## Schema Transformation

```typescript
import { Interface, Mod } from 'fortify-schema';

const UserSchema = Interface({
  id: "number",
  name: "string",
  email: "email",
  password: "string"
});

// Transform schemas
const PublicSchema = Mod.omit(UserSchema, ["password"]);
const PartialSchema = Mod.partial(UserSchema);
const ExtendedSchema = Mod.extend(UserSchema, {
  createdAt: "date",
  isActive: "boolean"
});
```

## Validation

```typescript
// Strict validation (recommended)
const result = schema.safeParse(data);

if (result.success) {
  console.log('✓ Valid:', result.data);
} else {
  console.log('✗ Errors:', result.errors);
}

// For external or unknown data
const unknownResult = schema.safeParseUnknown(apiData);
```

## Common Patterns

### User Schema with Conditional Validation

```typescript
const UserSchema = Interface({
  id: "positive",                               // User ID
  email: "email",                               // Email
  username: "string(3,20)",                     // Username
  age: "int(13,120)?",                          // Optional age
  role: Make.union("user", "admin", "moderator"), // Role
  accountType: "free|premium|enterprise",       // Account type
  isActive: "boolean",                          // Status

  // Conditional fields with *? syntax
  permissions: "when role=admin *? string[] : string[]?",
  maxProjects: "when accountType=free *? int(1,3) : int(1,)",
  paymentMethod: "when accountType!=free *? string : string?",

  tags: "string[](,10)?",                       // Optional tags
  createdAt: "date",                            // Creation date
});
```

### API Response Schema

```typescript
const APIResponseSchema = Interface({
  success: "boolean",                           // Success flag
  status: "int(100,599)",                       // HTTP status
  data: "any?",                                 // Optional data
  errors: "string[]?",                          // Optional errors
  timestamp: "date",                            // Response time
});
```

### Product Schema

```typescript
const ProductSchema = Interface({
  id: "uuid",                                   // Product ID
  name: "string(1,100)",                        // Product name
  price: "number(0.01,)",                       // Price
  category: Make.union("electronics", "clothing", "books"),
  inStock: "boolean",                           // Availability
  images: "url[](1,5)",                         // 1 to 5 images
  tags: "string[](,20)?",                       // Optional tags
});
```

## Quick Start Template

```typescript
import { Interface, Make, Mod } from 'fortify-schema';

// Define schema
const MySchema = Interface({
  // Required fields
  id: "positive",
  name: "string(1,100)",
  email: "email",

  // Optional fields
  age: "int(18,120)?",
  bio: "string(,500)?",

  // Special values
  role: Make.union("user", "admin"),
  status: Make.const("active"),

  // Arrays
  tags: "string[](,10)?",

  // Nested objects
  profile: {
    avatar: "url?",
    theme: Make.union("light", "dark")
  }
});

// Validate data
const result = MySchema.safeParse(data);

if (result.success) {
  // Fully typed result
  console.log('✓ Valid data:', result.data);
} else {
  console.log('✗ Validation errors:', result.errors);
}
```

---

**Related Resources**  
[Complete Documentation](../README.md) | [Full Field Types Reference](./FIELD-TYPES.md)