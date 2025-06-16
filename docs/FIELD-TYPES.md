hi# Fortify Schema - Complete Field Types Reference

A comprehensive guide to all available field types in Fortify Schema's Interface syntax.

## 📋 Table of Contents

- [Basic Types](#basic-types)
- [Number Types](#number-types)
- [String Types](#string-types)
- [Array Types](#array-types)
- [Special Values](#special-values)
- [Constraint Syntax](#constraint-syntax)
- [Pattern Validation](#pattern-validation)
- [Comparison with Other Libraries](#comparison)

## 🔤 Basic Types

### Core Data Types
```typescript
const schema = Interface({
  // Basic types
  name: "string",           // String value
  age: "number",            // Any number (integer or decimal)
  active: "boolean",        // true or false
  created: "date",          // Date object
  data: "any",              // Any type (use sparingly)

  // Optional versions (add ?)
  bio: "string?",           // Optional string
  score: "number?",         // Optional number
  verified: "boolean?",     // Optional boolean
  updated: "date?",         // Optional date
  metadata: "any?",         // Optional any type
});
```

## 🔢 Number Types

### Integer Types
```typescript
const schema = Interface({
  // Basic integers
  count: "int",             // Any integer (positive, negative, zero)
  id: "positive",           // Positive number (> 0)
  offset: "int?",           // Optional integer

  // Constrained integers
  rating: "int(1,5)",       // Integer between 1-5
  quantity: "int(1,)",      // Integer >= 1 (positive integer)
  limit: "int(,100)",       // Integer <= 100

  // Decimal numbers
  price: "float",           // Floating point number
  percentage: "float(0,100)", // Float between 0-100
  weight: "number(0.1,)",   // Number >= 0.1
});
```

### Number Constraint Examples
```typescript
const ProductSchema = Interface({
  id: "positive",           // Product ID (positive integer)
  price: "number(0.01,)",   // Price (minimum $0.01)
  discount: "float(0,100)", // Discount percentage (0-100%)
  stock: "int(0,)",         // Stock count (non-negative)
  rating: "int(1,5)",       // Rating (1-5 stars)
  weight: "number(0,)",     // Weight (non-negative)
});
```

## 📝 String Types

### Basic String Types
```typescript
const schema = Interface({
  // Basic strings
  name: "string",           // Any string
  title: "string?",         // Optional string

  // Format validation
  email: "email",           // Email format
  website: "url",           // URL format
  id: "uuid",               // UUID format
  phone: "phone",           // Phone number format
  handle: "username",       // Username format
  path: "slug",             // URL slug format
});
```

### String Constraints
```typescript
const UserSchema = Interface({
  // Length constraints
  username: "string(3,20)",     // 3-20 characters
  password: "string(8,)",       // Minimum 8 characters
  bio: "string(,500)",          // Maximum 500 characters
  title: "string(1,100)",       // 1-100 characters

  // Format + constraints
  email: "email(,254)",         // Email with max length
  slug: "slug(3,50)",           // Slug with length limits
});
```

## 📚 Array Types

### Basic Arrays
```typescript
const schema = Interface({
  // Basic arrays
  tags: "string[]",         // Array of strings
  scores: "number[]",       // Array of numbers
  flags: "boolean[]",       // Array of booleans
  dates: "date[]",          // Array of dates
  items: "any[]",           // Array of any type

  // Optional arrays
  hobbies: "string[]?",     // Optional string array
  ratings: "number[]?",     // Optional number array
});
```

### Array Constraints
```typescript
const PostSchema = Interface({
  // Array size constraints
  tags: "string[](1,10)",       // 1-10 string items
  images: "url[](,5)",          // Maximum 5 URLs
  scores: "number[](3,)",       // Minimum 3 numbers
  categories: "string[](1,3)",  // 1-3 categories

  // Optional constrained arrays
  attachments: "url[](,10)?",   // Optional, max 10 URLs
  mentions: "username[](,20)?", // Optional, max 20 usernames
});
```

## 🎯 Special Values

### Constants and Unions
```typescript
import { Interface, Make } from 'fortify-schema';

const schema = Interface({
  // Constants (exact values)
  version: Make.const("1.0"),           // Exactly "1.0"
  status: Make.const(200),              // Exactly 200
  enabled: Make.const(true),            // Exactly true

  // Unions (multiple allowed values)
  priority: Make.union("low", "medium", "high"),
  theme: Make.union("light", "dark", "auto"),
  role: Make.union("user", "admin", "moderator"),

  // Optional unions
  notification: Make.unionOptional("email", "sms", "push"),
});
```

## ⚙️ Constraint Syntax

### Number Constraints
```typescript
"number(min,max)"     // Number between min and max
"number(min,)"        // Number >= min
"number(,max)"        // Number <= max
"int(1,10)"          // Integer between 1-10
"positive"           // Positive number (> 0)
"float(0,1)"         // Float between 0-1
```

### String Constraints
```typescript
"string(min,max)"     // String length between min-max chars
"string(8,)"         // Minimum 8 characters
"string(,100)"       // Maximum 100 characters
"email(,254)"        // Email with max length
"username(3,20)"     // Username 3-20 chars
```

### Array Constraints
```typescript
"string[](min,max)"   // Array with min-max items
"number[](1,)"       // Array with minimum 1 item
"email[](,10)"       // Array with maximum 10 items
"any[](3,5)"         // Array with exactly 3-5 items
```

## 🔍 Pattern Validation

### Regex Patterns
```typescript
const schema = Interface({
  // Custom patterns
  code: "string(/^[A-Z]{2,4}$/)",           // 2-4 uppercase letters
  slug: "string(/^[a-z0-9-]+$/)",           // URL slug pattern
  hex: "string(/^#[0-9a-fA-F]{6}$/)",       // Hex color
  phone: "string(/^\\+?[1-9]\\d{1,14}$/)",  // International phone

  // Optional patterns
  zipCode: "string(/^\\d{5}(-\\d{4})?$/)?", // Optional US ZIP
});
```

### Common Pattern Examples
```typescript
const ValidationSchema = Interface({
  // Identifiers
  uuid: "string(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)",

  // Codes and IDs
  productCode: "string(/^[A-Z]{3}-\\d{4}$/)",     // ABC-1234
  invoiceId: "string(/^INV-\\d{6}$/)",            // INV-123456

  // Formats
  hexColor: "string(/^#[0-9a-fA-F]{6}$/)",        // #FF5733
  ipAddress: "string(/^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$/)",

  // Text patterns
  hashtag: "string(/^#[a-zA-Z0-9_]+$/)",          // #hashtag
  mention: "string(/^@[a-zA-Z0-9_]+$/)",          // @username
});
```

## 🏗️ Real-World Examples

### User Management Schema
```typescript
const UserSchema = Interface({
  // Identity
  id: "positive",                               // User ID
  uuid: "uuid",                                 // UUID
  username: "string(3,20)",                     // Username 3-20 chars
  email: "email",                               // Email address

  // Profile
  firstName: "string(1,50)",                    // First name
  lastName: "string(1,50)",                     // Last name
  bio: "string(,500)?",                         // Optional bio (max 500)
  avatar: "url?",                               // Optional avatar URL

  // Settings
  age: "int(13,120)?",                          // Optional age 13-120
  role: Make.union("user", "admin", "moderator"), // User role
  status: Make.union("active", "inactive", "suspended"), // Account status
  theme: Make.union("light", "dark", "auto"),   // UI theme

  // Metadata
  tags: "string[](,10)?",                       // Optional tags (max 10)
  permissions: "string[](,50)?",                // Optional permissions
  lastLogin: "date?",                           // Optional last login
  createdAt: "date",                            // Creation date

  // Verification
  isVerified: "boolean",                        // Email verified
  twoFactorEnabled: "boolean?",                 // Optional 2FA
});
```

### E-commerce Product Schema
```typescript
const ProductSchema = Interface({
  // Basic info
  id: "positive",                               // Product ID
  sku: "string(/^[A-Z]{3}-\\d{4}$/)",          // SKU: ABC-1234
  name: "string(1,100)",                        // Product name
  description: "string(,2000)?",                // Optional description

  // Pricing
  price: "number(0.01,)",                       // Price (min $0.01)
  originalPrice: "number(0.01,)?",              // Optional original price
  discount: "float(0,100)?",                    // Optional discount %
  currency: Make.const("USD"),                  // Currency

  // Inventory
  stock: "int(0,)",                             // Stock count
  lowStockThreshold: "int(1,)?",                // Optional low stock alert

  // Categories
  category: Make.union("electronics", "clothing", "books", "home"),
  subcategory: "string?",                       // Optional subcategory
  tags: "string[](,20)?",                       // Optional tags

  // Media
  images: "url[](1,10)",                        // 1-10 product images
  videos: "url[](,3)?",                         // Optional videos (max 3)

  // Attributes
  weight: "number(0,)?",                        // Optional weight
  dimensions: {                                 // Optional dimensions
    length: "number(0,)",
    width: "number(0,)",
    height: "number(0,)"
  },

  // Status
  isActive: "boolean",                          // Product active
  isFeatured: "boolean?",                       // Optional featured
  publishedAt: "date?",                         // Optional publish date
});
```

### API Response Schema
```typescript
const APIResponseSchema = Interface({
  // Status
  success: "boolean",                           // Request success
  status: "int(100,599)",                       // HTTP status code
  message: "string?",                           // Optional message

  // Data
  data: "any?",                                 // Optional response data
  errors: "string[]?",                          // Optional error messages
  warnings: "string[]?",                        // Optional warnings

  // Metadata
  timestamp: "date",                            // Response timestamp
  requestId: "uuid",                            // Request ID
  version: Make.const("1.0"),                  // API version

  // Pagination (optional)
  pagination: {
    page: "int(1,)",                            // Current page
    limit: "int(1,100)",                        // Items per page
    total: "int(0,)",                           // Total items
    hasNext: "boolean",                         // Has next page
    hasPrev: "boolean",                         // Has previous page
  },
});
```

## 📊 Comparison with Other Libraries

### Zod vs Fortify Schema

| Feature | Zod | Fortify Schema |
|---------|-----|----------------|
| **Positive Integer** | `z.number().int().positive()` | `"positive"` or `"int(1,)"` |
| **String Length** | `z.string().min(3).max(20)` | `"string(3,20)"` |
| **Email** | `z.string().email()` | `"email"` |
| **Optional Field** | `z.string().optional()` | `"string?"` |
| **Array Size** | `z.array(z.string()).min(1).max(10)` | `"string[](1,10)"` |
| **Union** | `z.enum(["a", "b", "c"])` | `Make.union("a", "b", "c")` |
| **Constant** | `z.literal("admin")` | `Make.const("admin")` |
| **Pattern** | `z.string().regex(/^[A-Z]+$/)` | `"string(/^[A-Z]+$/)"` |

### Joi vs Fortify Schema

| Feature | Joi | Fortify Schema |
|---------|-----|----------------|
| **Number Range** | `Joi.number().min(1).max(100)` | `"number(1,100)"` |
| **String Length** | `Joi.string().min(3).max(20)` | `"string(3,20)"` |
| **Required** | `Joi.string().required()` | `"string"` |
| **Optional** | `Joi.string().optional()` | `"string?"` |
| **Array** | `Joi.array().items(Joi.string())` | `"string[]"` |
| **Email** | `Joi.string().email()` | `"email"` |

## 🎯 Quick Reference

### Most Common Types
```typescript
// Strings
"string"              // Any string
"string?"             // Optional string
"string(3,20)"        // 3-20 characters
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
Make.const("value")   // Exact value
Make.union("a", "b")  // Multiple options
"boolean"             // true/false
"date"                // Date object
```
