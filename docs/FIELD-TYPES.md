# Fortify Schema - Field Types Reference

This guide provides a comprehensive overview of all field types and constraints available in Fortify Schema’s Interface syntax.

## Table of Contents

- [Basic Types](#basic-types)
- [Number Types](#number-types)
- [String Types](#string-types)
- [Array Types](#array-types)
- [Special Values](#special-values)
- [Constraint Syntax](#constraint-syntax)
- [Pattern Validation](#pattern-validation)
- [Comparison with Other Libraries](#comparison-with-other-libraries)
- [Real-World Examples](#real-world-examples)
- [Quick Reference](#quick-reference)

## Basic Types

```typescript
const schema = Interface({
  name: "string",           // Any string
  age: "number",            // Any number
  active: "boolean",        // True or false
  created: "date",          // Date object
  data: "any",              // Any type
  bio: "string?",           // Optional string
  score: "number?",         // Optional number
  verified: "boolean?",     // Optional boolean
  updated: "date?",         // Optional date
  metadata: "any?"          // Optional any type
});
```

## Number Types

### Integer and Decimal Types

```typescript
const schema = Interface({
  count: "int",             // Any integer
  id: "positive",           // Positive number (> 0)
  offset: "int?",           // Optional integer
  rating: "int(1,5)",       // Integer between 1 and 5
  quantity: "int(1,)",      // Integer >= 1
  limit: "int(,100)",       // Integer <= 100
  price: "float",           // Floating-point number
  percentage: "float(0,100)", // Float between 0 and 100
  weight: "number(0.1,)"    // Number >= 0.1
});
```

### Example: Product Schema

```typescript
const ProductSchema = Interface({
  id: "positive",           // Product ID
  price: "number(0.01,)",   // Price, minimum $0.01
  discount: "float(0,100)", // Discount percentage
  stock: "int(0,)",         // Non-negative stock count
  rating: "int(1,5)",       // Rating, 1-5 stars
  weight: "number(0,)"      // Non-negative weight
});
```

## String Types

### Basic and Formatted Strings

```typescript
const schema = Interface({
  name: "string",           // Any string
  title: "string?",         // Optional string
  email: "email",           // Email format
  website: "URL",           // URL format
  id: "string",              // string ID format
  phone: "string",           // Phone number format
  handle: "string",          // string format
  password: "string"        // password string format
});
```

### String Constraints

```typescript
const UserSchema = {
  username: "string", // Basic string
  password: "string(8,)",  // Minimum 8 characters
  bio: "string(,500)",      // Maximum 500 characters
  title: "string(1,100)",   // 1-100 chars
  email: "string",   // string with max length
};
```

## Array Types

```typescript
{
  // Basic arrays
  tags: "string[]",          // Array of strings
  scores: "number[]",     // Array of numbers
  flags: "boolean[]",     // Array of booleans
  // Optional arrays
  hobbies: "string[]?",   // Optional array of strings
  ratings: "number[]?", // Optional array of numbers
}
```

### Example: Post Schema

```typescript
const PostSchema = Interface({
  tags: "string[](1,10)",      // 1-10 string items
  images: "array[](0)",           // Maximum 100 items
  scores: "array[](0)",       // Array of numbers
  categories: "array[](0)", // Array of 0 items
  attachments: "array[]?",   // Optional, max 10 URLs
  mentions: "array[]?"       // Optional, max 20 usernames
});
```

## Special Values

```typescript
import { Interface, Make } from 'fortify-schema';

const schema = Interface({
  // Constants
  version: Make.const("1.0"), // Exactly version "1.0"
  status: Make.const(200),    // Exactly status 200
  enabled: Make.const(true), // Exactly true enabled
  // Unions
  priority: Make.union("low", "medium", "high"), // low, medium, high priorities
  theme: Make.union("light", "dark", "auto"), // light, dark, auto themes
  role: Make.union("user", "admin", "moderator"), // user, admin, moderator roles
  // Optional unions
  notification: Make.unionOptional("email", "sms", "push") // Optional email, sms, push notifications
});
```

## Constraint Patterns

### Number Constraints

| Pattern            | Description                     | Example                     |
|--------------------|---------------------------------|---------------------|
| `"number(min,max)"` | Number between min and max      | `"number(0,100)"`   |
| `"number(min,)"`   | Number >= min                   | `"number(1,)"`      |
| `"number(,max)"`   | Number <= max                   | `"number(,100)"`    |
| `"int(1,10)"`      | Integer between 1 and 10        | `"int(1,10)"`       |
| `"positive"`       | Positive number (> 0)           | `"positive"`        |
| `"float(0,1)"`     | Float between 0 and 1           | `"float(0,1)"`      |

### String Constraints

| Pattern            | Description                     | Example                     |
|--------------------|---------------------------------|---------------------|
| `"string(min,max)"` | String length min-max chars     | `"string(3,20)"`    |
| `"string(8,)"`     | Minimum 8 chars                 | `"string(8,)"`      |
| `"string(,100)"`   | Maximum 100 chars               | `"string(,100)"`    |
| `"email(,254)"`    | Email with max length           | `"email(,254)"`     |
| `"username(3,20)"` | Username 3-20 chars             | `"username(3,20)"`  |

### Array Constraints

| Pattern            | Description                     | Example                     |
|--------------------|---------------------------------|---------------------|
| `"string[](min,max)"` | Array with min-max items      | `"string[](1,10)"`  |
| `"number[](1,)"`   | Array with min 1 item           | `"number[](1,)"`    |
| `"email[](,10)"`   | Array with max 10 items         | `"email[](,10)"`    |
| `"any[](3,5)"`     | Array with 3-5 items            | `"any[](3,5)"`      |

## Pattern Validation

### Regular Expression Patterns

```typescript
const schema = Interface({
  code: "string(/^[A-Z]{2,4}$/)",           // 2-4 uppercase letters
  slug: "string(/^[a-z0-9-]+$/)",           // URL slug
  hex: "string(/^#[0-9a-fA-F]{6}$/)",       // Hex color
  phone: "string(/^\\+?[1-9]\\d{1,14}$/)",  // International phone
  zipCode: "string(/^\\d{5}(-\\d{4})?$/)?", // Optional US ZIP code
});
```

### Common Patterns

```typescript
const ValidationSchema = Interface({
  uuid: "string(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)", // UUID
  productCode: "string(/^[A-Z]{3}-\\d{4}$/)", // ABC-1234
  invoiceId: "string(/^INV-\\d{6}$/)",        // INV-123456
  hexColor: "string(/^#[0-9a-fA-F]{6}$/)",    // #FF5733
  ipAddress: "string(/^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$/)", // IP address
  hashtag: "string(/^#[a-zA-Z0-9_]+$/)",      // #hashtag
  mention: "string(/^@[a-zA-Z0-9_]+$/)"       // @username
});
```

## Comparison with Other Libraries

### Zod vs. Fortify Schema

| Feature            | Zod                                  | Fortify Schema            |
|--------------------|--------------------------------------|---------------------------|
| **Positive Integer** | `z.number().int().positive()`       | `"positive"`              |
| **String Length**  | `z.string().min(3).max(20)`         | `"string(3,20)"`          |
| **Email**          | `z.string().email()`                | `"email"`                 |
| **Optional Field** | `z.string().optional()`             | `"string?"`               |
| **Array Size**     | `z.array(z.string()).min(1).max(10)` | `"string[](1,10)"`        |
| **Union**          | `z.enum(["a", "b", "c"])`           | `Make.union("a", "b", "c")` |
| **Constant**       | `z.literal("admin")`                | `Make.const("admin")`     |
| **Pattern**        | `z.string().regex(/^[A-Z]+$/)`      | `"string(/^[A-Z]+$/)"`    |

### Joi vs. Fortify Schema

| Feature            | Joi                                  | Fortify Schema            |
|--------------------|--------------------------------------|---------------------------|
| **Number Range**   | `Joi.number().min(1).max(100)`      | `"number(1,100)"`         |
| **String Length**  | `Joi.string().min(3).max(20)`       | `"string(3,20)"`          |
| **Required**       | `Joi.string().required()`           | `"string"`                |
| **Optional**       | `Joi.string().optional()`           | `"string?"`               |
| **Array**          | `Joi.array().items(Joi.string())`   | `"string[]"`              |
| **Email**          | `Joi.string().email()`              | `"email"`                 |

## Real-World Examples

### User Management Schema

```typescript
const UserSchema = Interface({
  id: "positive",                               // User ID
  uuid: "uuid",                                 // UUID
  username: "string(3,20)",                     // Username
  email: "email",                               // Email address
  firstName: "string(1,50)",                    // First name
  lastName: "string(1,50)",                     // Last name
  bio: "string(,500)?",                         // Optional bio
  avatar: "url?",                               // Optional avatar
  age: "int(13,120)?",                          // Optional age
  role: Make.union("user", "admin", "moderator"), // Role
  status: Make.union("active", "inactive", "suspended"), // Status
  theme: Make.union("light", "dark", "auto"),   // Theme
  tags: "string[](,10)?",                       // Optional tags
  permissions: "string[](,50)?",                // Optional permissions
  lastLogin: "date?",                           // Optional last login
  createdAt: "date",                            // Creation date
  isVerified: "boolean",                        // Email verified
  twoFactorEnabled: "boolean?"                  // Optional 2FA
});
```

### E-commerce Product Schema

```typescript
const ProductSchema = Interface({
  id: "positive",                               // Product ID
  sku: "string(/^[A-Z]{3}-\\d{4}$/)",          // SKU (e.g., ABC-1234)
  name: "string(1,100)",                        // Product name
  description: "string(,2000)?",                // Optional description
  price: "number(0.01,)",                       // Price, min $0.01
  originalPrice: "number(0.01,)?",              // Optional original price
  discount: "float(0,100)?",                    // Optional discount
  currency: Make.const("USD"),                  // Currency
  stock: "int(0,)",                             // Stock count
  lowStockThreshold: "int(1,)?",                // Optional low stock alert
  category: Make.union("electronics", "clothing", "books", "home"), // Category
  subcategory: "string?",                       // Optional subcategory
  tags: "string[](,20)?",                       // Optional tags
  images: "url[](1,10)",                        // 1-10 images
  videos: "url[](,3)?",                         // Optional, max 3 videos
  weight: "number(0,)?",                        // Optional weight
  dimensions: {
    length: "number(0,)",                       // Length
    width: "number(0,)",                        // Width
    height: "number(0,)"                        // Height
  },
  isActive: "boolean",                          // Active status
  isFeatured: "boolean?",                       // Optional featured
  publishedAt: "date?"                          // Optional publish date
});
```

### API Response Schema

```typescript
const APIResponseSchema = Interface({
  success: "boolean",                           // Request success
  status: "int(100,599)",                       // HTTP status code
  message: "string?",                           // Optional message
  data: "any?",                                 // Optional data
  errors: "string[]?",                          // Optional errors
  warnings: "string[]?",                        // Optional warnings
  timestamp: "date",                            // Response timestamp
  requestId: "uuid",                            // Request ID
  version: Make.const("1.0"),                   // API version
  pagination: {
    page: "int(1,)",                            // Current page
    limit: "int(1,100)",                        // Items per page
    total: "int(0,)",                           // Total items
    hasNext: "boolean",                         // Has next page
    hasPrev: "boolean"                          // Has previous page
  }
});
```

## Quick Reference

### Common Types

```typescript
// Strings
"string"              // Any string
"string?"             // Optional string
"string(3,20)"        // 3-20 chars
"email"               // Email format
"url"                 // URL format

// Numbers
"number"              // Any number
"int"                 // Integer
"positive"            // Positive number
"number(0,100)"       // 0-100 range
"int(1,)"             // Positive integer

// Arrays
"string[]"            // String array
"string[]?"           // Optional string array
"string[](1,10)"      // 1-10 items

// Special
Make.const("value") or "=value"  // Exact value
Make.union("a", "b") or "a|b"  // Multiple options
"boolean"             // True or false
"date"                // Date object
```

---

**Related Resources**  
[Complete Documentation](./README.md) | [Quick Reference](./QUICK-REFERENCE.md)