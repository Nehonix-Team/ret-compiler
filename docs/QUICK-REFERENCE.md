# Fortify Schema - Quick Reference

A quick reference guide for the most commonly used field types and patterns.

## 🚀 Basic Types

```typescript
const schema = Interface({
  // Basic types
  name: "string",           // Any string
  age: "number",            // Any number  
  active: "boolean",        // true/false
  created: "date",          // Date object
  data: "any",              // Any type
  
  // Optional (add ?)
  bio: "string?",           // Optional string
  score: "number?",         // Optional number
});
```

## 🔢 Numbers

```typescript
{
  // Basic numbers
  count: "int",             // Integer
  price: "number",          // Any number
  rating: "positive",       // Positive number (> 0)
  
  // With constraints
  age: "int(18,120)",       // Integer 18-120
  score: "number(0,100)",   // Number 0-100
  quantity: "int(1,)",      // Integer >= 1
  discount: "float(0,100)", // Float 0-100%
}
```

## 📝 Strings

```typescript
{
  // Basic strings
  title: "string",          // Any string
  email: "email",           // Email format
  website: "url",           // URL format
  id: "uuid",               // UUID format
  
  // With length constraints
  username: "string(3,20)", // 3-20 characters
  password: "string(8,)",   // Min 8 characters
  bio: "string(,500)",      // Max 500 characters
  
  // With patterns
  slug: "string(/^[a-z0-9-]+$/)",     // URL slug
  code: "string(/^[A-Z]{2,4}$/)",     // 2-4 uppercase letters
}
```

## 📚 Arrays

```typescript
{
  // Basic arrays
  tags: "string[]",         // Array of strings
  scores: "number[]",       // Array of numbers
  emails: "email[]",        // Array of emails
  
  // With size constraints
  items: "string[](1,10)",  // 1-10 string items
  photos: "url[](,5)",      // Max 5 URLs
  scores: "number[](3,)",   // Min 3 numbers
  
  // Optional arrays
  hobbies: "string[]?",     // Optional string array
  ratings: "number[](1,5)?", // Optional, 1-5 numbers
}
```

## 🎯 Special Values

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

## ⚙️ Constraint Patterns

| Pattern | Description | Example |
|---------|-------------|---------|
| `"type?"` | Optional field | `"string?"` |
| `"type(min,max)"` | Range constraint | `"number(0,100)"` |
| `"type(min,)"` | Minimum only | `"string(8,)"` |
| `"type(,max)"` | Maximum only | `"string(,100)"` |
| `"type(/regex/)"` | Pattern validation | `"string(/^[a-z]+$/)"` |
| `"type[](min,max)"` | Array size | `"string[](1,10)"` |

## 🔧 Schema Transformation

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

## 🛡️ Validation

```typescript
// Strict validation (recommended)
const result = schema.safeParse(data);

if (result.success) {
  console.log('✓ Valid:', result.data);
} else {
  console.log('✗ Errors:', result.errors);
}

// For unknown/external data
const unknownResult = schema.safeParseUnknown(apiData);
```

## 🎯 Common Patterns

### User Schema
```typescript
const UserSchema = Interface({
  id: "positive",                               // User ID
  email: "email",                               // Email
  username: "string(3,20)",                     // Username
  age: "int(13,120)?",                          // Optional age
  role: Make.union("user", "admin", "moderator"), // Role
  isActive: "boolean",                          // Status
  tags: "string[](,10)?",                       // Optional tags
  createdAt: "date",                            // Created date
});
```

### API Response
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
  images: "url[](1,5)",                         // 1-5 images
  tags: "string[](,20)?",                       // Optional tags
});
```

## 🚀 Quick Start Template

```typescript
import { Interface, Make, Mod } from 'fortify-schema';

// Define your schema
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

// Use the schema
const result = MySchema.safeParse(data);

if (result.success) {
  // result.data is fully typed!
  console.log('Valid data:', result.data);
} else {
  console.log('Validation errors:', result.errors);
}
```

---

**📖 [Complete Documentation](../README.md)** | **📚 [Full Field Types Reference](./FIELD-TYPES.md)**
