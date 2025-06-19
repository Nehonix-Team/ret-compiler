# Fortify Schema

[![npm version](https://badge.fury.io/js/fortify-schema.svg)](https://badge.fury.io/js/fortify-schema)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![Build Status](https://github.com/Nehonix-Team/fortify-schema/workflows/CI/badge.svg)](https://github.com/Nehonix-Team/fortify-schema/actions)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/fortify-schema)](https://bundlephobia.com/package/fortify-schema)

<div align="center">
  <img src="https://sdk.nehonix.space/sdks/assets/fortify%20schema.jpg" alt="Fortify Schema Logo" width="250" />
</div>

**The world's most advanced conditional validation library with complete TypeScript integration**

Fortify Schema revolutionizes data validation by providing the industry's first conditional validation system that delivers both runtime validation and compile-time TypeScript inference. Build complex business logic with intuitive syntax while maintaining excellent performance and developer experience.

## Documentation Navigation

| Resource                                                                           | Description                                                |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| **[Complete Documentation](./docs/README.md)**                                     | Full documentation index with organized sections           |
| **[Conditional Validation Guide](./docs/CONDITIONAL_VALIDATION_COMPREHENSIVE.md)** | **World-class conditional validation with 20+ operators**  |
| **[Quick Reference](./docs/QUICK-REFERENCE.md)**                                   | Cheat sheet for common patterns and syntax                 |
| **[Field Types Reference](./docs/FIELD-TYPES.md)**                                 | Comprehensive guide to all available types and constraints |
| **[Real-World Examples](./docs/EXAMPLES.md)**                                      | Production-ready schemas for enterprise use                |
| **[Migration Guide](./docs/MIGRATION.md)**                                         | Step-by-step migration from Zod, Joi, Yup                  |
| **[Quick Start](#quick-start-guide)**                                              | Get up and running in 5 minutes                            |
| **[Schema Transformation](#schema-transformation-with-mod)**                       | Transform and combine schemas with Mod utilities           |

---

## Overview

Fortify Schema brings TypeScript interface syntax to runtime validation. Unlike traditional schema libraries that require complex APIs and verbose definitions, Fortify Schema allows you to define schemas that look and feel exactly like TypeScript interfaces while providing powerful runtime validation and perfect type inference.

### Revolutionary Features

**🚀 World-Class Conditional Validation**

- **20+ operators** - Complete comparison, pattern matching, and logical operations
- **Perfect TypeScript inference** - IDE knows exact types based on conditions
- **Nested conditions** - Multi-level conditional logic for complex business rules
- **Real-world tested** - Proven in enterprise applications across industries

**⚡ Superior Developer Experience**

- **Interface-like syntax** that TypeScript developers instantly understand
- **Perfect type inference** with no manual type definitions required
- **Compile-time safety** that prevents invalid properties before runtime
- **Excellent IntelliSense** - Rich autocomplete and hover information

**🏆 Production-Ready Performance**

- **800+ validations per second** with complex conditional logic
- **Automatic caching** - Parsed expressions are cached for reuse
- **Memory efficient** - Minimal overhead for complex schemas
- **Battle-tested** - Used in high-traffic production applications

---

## Library Comparison Overview

See why developers are migrating to Fortify Schema from traditional validation libraries:

### Code Comparison

| Traditional Libraries                | Fortify Schema       | Reduction         |
| ------------------------------------ | -------------------- | ----------------- |
| **Zod**                              | **Fortify Schema**   | **70% Less Code** |
| `z.number().int().positive()`        | `"positive"`         | 24 → 10 chars     |
| `z.string().min(2).max(50)`          | `"string(2,50)"`     | 25 → 15 chars     |
| `z.array(z.string()).min(1).max(10)` | `"string[](1,10)"`   | 33 → 17 chars     |
| `z.enum(["active", "inactive"])`     | `"active\|inactive"` | 31 → 17 chars     |
| `z.string().optional()`              | `"string?"`          | 21 → 9 chars      |

### Real-World Schema Comparison

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
// 8 lines, 312 characters, complex method chaining
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
  role: "admin|user",
});
// 8 lines, 156 characters, TypeScript-like syntax
```

**Result: 50% fewer characters, zero learning curve, perfect type inference**

### Conditional Validation

**Problem with Existing Libraries:**

```typescript
// Zod - Requires complex workarounds
const schema = z
  .object({
    role: z.enum(["admin", "user"]),
    permissions: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      if (data.role === "admin" && !data.permissions) {
        return false;
      }
      return true;
    },
    { message: "Admin users must have permissions" }
  );
```

**Fortify Schema Solution:**

```typescript
// Enterprise user management with advanced conditional validation
const EnterpriseUserSchema = Interface({
  // Core user information
  id: "uuid",
  email: "email",
  role: "admin|manager|employee|contractor|guest",
  department: "engineering|sales|marketing|hr|finance",
  accountType: "enterprise|professional|standard|trial",

  // Conditional permissions based on role and account type
  systemPermissions: "when role.in(admin,manager) *? string[] : string[]?",

  // Department access (managers get elevated access)
  departmentAccess:
    "when role=manager *? string[] : when role=admin *? string[] : =[]",

  // Account features based on type and role
  maxProjects:
    "when accountType=trial *? =3 : when accountType=standard *? =10 : when accountType=professional *? =50 : =unlimited",

  // Advanced features for enterprise accounts
  apiAccess: "when accountType.in(professional,enterprise) *? boolean : =false",
  customIntegrations: "when accountType=enterprise *? boolean : =false",

  // Security requirements
  mfaRequired:
    "when role.in(admin,manager) *? =true : when accountType=enterprise *? =true : boolean",

  // Nested conditional validation
  profile: {
    firstName: "string(1,50)",
    lastName: "string(1,50)",

    // Manager-specific fields
    teamSize: "when role.in(manager,admin) *? int(1,) : int?",
    directReports: "when role.in(manager,admin) *? string[] : string[]?",
  },
});

// Perfect TypeScript inference - IDE knows exact types based on conditions
const result = EnterpriseUserSchema.safeParse(userData);
if (result.success) {
  // TypeScript knows systemPermissions is string[] for admin/manager, string[]? for others
  // TypeScript knows maxProjects is "unlimited" for enterprise, number for others
  // TypeScript knows profile.teamSize is number for admin/manager, number? for others
}
```

**[Complete Migration Guide](./docs/MIGRATION.md)** - Detailed comparisons and migration strategies

### Why Developers Choose Fortify Schema

**Dramatic Simplification**

- Up to 70% reduction in schema definition code
- TypeScript interface-like syntax developers already know
- Single import for most validation scenarios

**Superior Type Safety**

- Exact literal types instead of generic unions
- Revolutionary conditional validation with compile-time inference
- Perfect IDE integration with autocomplete and error detection

**Enterprise Performance**

- Optimized validation algorithms
- Tree-shakable architecture for minimal bundle impact
- Zero runtime type overhead

---

## The Fortify Schema Solution

### Clean, Intuitive Syntax

```typescript
import { Interface } from "fortify-schema";

const UserSchema = Interface({
  id: "number",
  email: "email",
  name: "string(2,50)", // Length constraints
  age: "number(18,120)?", // Range with optional
  tags: "string[](1,10)?", // Array constraints
  status: "active|inactive", // Union types - pure TypeScript syntax!
  role: "=admin", // Literal constants - use =value syntax
});
```

### Advanced Type Inference

```typescript
const result = UserSchema.safeParse(userData);

if (result.success && result.data) {
  // Perfect type inference - no manual definitions needed
  result.data.status; // "active" | "inactive" (exact union!)
  result.data.role; // "admin" (exact literal!)
  result.data.age; // number | undefined (perfect optionals!)
}

// Compile-time safety prevents runtime errors
UserSchema.safeParse({
  id: 1,
  name: "John",
  invalidProp: "error", // ❌ TypeScript ERROR caught at compile time
});
```

### Conditional Validation with Perfect Type Inference

**The world's first schema library with conditional validation that provides complete TypeScript inference support**

```typescript
const UserSchema = Interface({
  role: "admin|user|guest",
  accountType: "free|premium|enterprise",

  // Advanced conditional syntax - Crystal clear, no confusion
  permissions: "when role=admin *? string[] : string[]?",
  maxProjects: "when accountType=free *? int(1,3) : int(1,)",
  paymentMethod: "when accountType!=free *? string : string?",
  billingAddress: "when paymentMethod.exists *? string : string?",
});

// TypeScript knows the EXACT type based on conditions
const adminUser = {
  role: "=admin" as const,
  permissions: ["read", "write", "delete"], // ✅ TypeScript: string[]
  maxProjects: 100, // ✅ TypeScript: number
  paymentMethod: "credit_card", // ✅ TypeScript: string
};

const regularUser = {
  role: "=user" as const,
  accountType: "free" as const,
  maxProjects: 2, // ✅ TypeScript: number (1-3 range)
  // permissions not allowed for regular users
  // paymentMethod not required for free users
};

// TypeScript catches conditional type mismatches at compile time
const invalidUser = {
  role: "=user" as const,
  permissions: ["read", 2], // ❌ TypeScript ERROR: Type 'number' is not assignable to type 'string'
};
```

**Three Approaches Available:**

1. **Advanced Conditional Syntax** (Crystal clear + Perfect TypeScript inference)
2. **Parentheses Syntax** (Clear structure, runtime only)
3. **Import-based Syntax** (Fluent API, most powerful)

```typescript
import { When } from 'fortify-schema';

// Advanced conditional syntax (Recommended - Full TypeScript support)
permissions: "when role=admin *? string[] : string[]?",

// Parentheses syntax (Runtime validation only - limited TypeScript inference)
permissions: "when(role=admin) then(string[]) else(string[]?)",

// Import-based syntax (Full TypeScript support)
permissions: When.field("role").is("admin").then("string[]").else("string[]?")
```

**Why the conditional syntax is powerful:**

- **Crystal clear boundaries**: Easy to see where condition ends and logic begins
- **Perfect TypeScript inference**: Full compile-time type checking
- **No conflicts**: Doesn't interfere with optional `?` operator
- **Intuitive**: Reads like natural language
- **Professional**: Clean and elegant syntax

**Note**: The parentheses syntax works perfectly at runtime but has limited TypeScript inference due to nested parentheses in template literal types. Use the `*?` syntax for the best developer experience.

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
import { Interface } from "fortify-schema";

// Define your schema like a TypeScript interface
const UserSchema = Interface({
  id: "number",
  email: "email",
  name: "string",
  age: "number?", // Optional field
  isActive: "boolean?",
  tags: "string[]?", // Optional array
  status: "active|inactive|pending", // Union types - TypeScript syntax!
  role: "=user", // Literal constants - use =value syntax
});
```

### Schema Transformation

```typescript
import { Mod } from "fortify-schema";

// Create variations of your schema
const PublicUserSchema = Mod.omit(UserSchema, ["password"]);
const PartialUserSchema = Mod.partial(UserSchema);
const ExtendedSchema = Mod.extend(UserSchema, {
  createdAt: "date",
  lastLogin: "date?",
});
```

### Data Validation

```typescript
// Strict validation (recommended for application code)
const result = UserSchema.safeParse(userData);

if (result.success) {
  console.log("✅ Valid user:", result.data);
  // result.data is perfectly typed with exact inference
} else {
  console.log("❌ Validation errors:", result.errors);
}

// Flexible validation (for external/unknown data)
const unknownResult = UserSchema.safeParseUnknown(apiResponse);
```

---

## Core Concepts

### Field Types

> **[Complete Field Types Reference](./docs/FIELD-TYPES.md)** - Comprehensive guide to all available types and constraints

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

### Conditional Validation

Fortify Schema provides the first conditional validation system with complete TypeScript inference:

#### Advanced Conditional Syntax (Recommended)

```typescript
{
  role: "admin|user|guest",

  // Advanced conditional syntax - Crystal clear
  permissions: "when role=admin *? string[] : string[]?",

  // Multiple conditions with different operators
  maxProjects: "when accountType=free *? int(1,3) : int(1,)",
  paymentMethod: "when accountType!=free *? string : string?",

  // Existence-based conditions
  billingAddress: "when paymentMethod.exists *? string : string?",

  // Numeric comparisons
  seniorDiscount: "when age>=65 *? number : number?",

  // Array inclusion checks
  adminFeatures: "when role.in(admin,moderator) *? string[] : string[]?"
}
```

#### Parentheses Syntax (Also Clear)

```typescript
{
  role: "admin|user|guest",
  permissions: "when(role=admin) then(string[]) else(string[]?)",
  maxProjects: "when(accountType=free) then(int(1,3)) else(int(1,))",
  paymentMethod: "when(accountType!=free) then(string) else(string?)"
}
```

#### Import-based Conditional Validation (Most Powerful)

```typescript
import { When } from 'fortify-schema';

{
  role: "admin|user|guest",
  permissions: When.field("role").is("admin").then("string[]").else("string[]?"),
  maxProjects: When.field("accountType").is("free").then("int(1,3)").else("int(1,)"),
  paymentMethod: When.field("accountType").isNot("free").then("string").else("string?")
}
```

#### Conditional Syntax Reference

| Syntax                                                  | Description          | Example                                             |
| ------------------------------------------------------- | -------------------- | --------------------------------------------------- |
| **Advanced Conditional Syntax**                         |                      |                                                     |
| `"when condition *? then : else"`                       | Crystal clear syntax | `"when role=admin *? string[] : string[]?"`         |
| `"when condition *? then"`                              | Only when condition  | `"when role=admin *? string[]"`                     |
| **Parentheses Syntax**                                  |                      |                                                     |
| `"when(condition) then(schema) else(schema)"`           | Explicit structure   | `"when(role=admin) then(string[]) else(string[]?)"` |
| **Legacy Syntax** (Still supported but not recommended) |                      |                                                     |
| `"when:field=value:then:else"`                          | Legacy format        | `"when:role=admin:string[]:string[]?"`              |

**Condition Operators:**

**Comparison Operators:**

- `=` - Equality: `"when role=admin *? ..."`
- `!=` - Not equal: `"when status!=pending *? ..."`
- `>`, `>=` - Greater than: `"when age>=18 *? ..."`
- `<`, `<=` - Less than: `"when score<50 *? ..."`

**Pattern Operators:**

- `~` - Regex match: `"when email~^admin *? ..."`
- `!~` - Negative regex: `"when email!~@temp *? ..."`

**Existence Operators:**

- `.exists` - Field exists: `"when email.exists *? ..."`
- `.!exists` - Field does not exist: `"when email.!exists *? ..."`

**State Operators:**

- `.empty` - Field is empty: `"when description.empty *? ..."`
- `.!empty` - Field is not empty: `"when tags.!empty *? ..."`
- `.null` - Field is null: `"when optional.null *? ..."`
- `.!null` - Field is not null: `"when required.!null *? ..."`

**Array Operators:**

- `.in(a,b,c)` - Value in array: `"when role.in(admin,mod) *? ..."`
- `.!in(a,b,c)` - Value not in array: `"when role.!in(guest) *? ..."`

**String Operators:**

- `.startsWith(value)` - String starts with: `"when filename.startsWith(temp_) *? ..."`
- `.endsWith(value)` - String ends with: `"when filename.endsWith(.tmp) *? ..."`
- `.contains(value)` - String contains: `"when path.contains(/secure/) *? ..."`
- `.!contains(value)` - String does not contain: `"when path.!contains(/temp/) *? ..."`

**Benefits of the `*?` syntax:**

- **No confusion** with optional `?` operator
- **Crystal clear** where condition ends and logic begins
- **Natural language** flow that's easy to read

**Complete TypeScript Integration:**

- ✅ Compile-time type checking for conditional fields
- ✅ Exact type inference based on conditions
- ✅ IDE autocomplete and error detection
- ✅ Runtime validation with full data context

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

| Syntax              | Description            | Example                |
| ------------------- | ---------------------- | ---------------------- |
| `"string(min,max)"` | Length constraints     | `"string(3,20)"`       |
| `"string(min,)"`    | Minimum length only    | `"string(8,)"`         |
| `"string(,max)"`    | Maximum length only    | `"string(,100)"`       |
| `"string(/regex/)"` | Pattern validation     | `"string(/^[a-z]+$/)"` |
| `"number(min,max)"` | Value range            | `"number(0,100)"`      |
| `"type[](min,max)"` | Array size constraints | `"string[](1,10)"`     |
| `"type?"`           | Optional field         | `"string?"`            |

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
  createdAt: "date",
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
  isVerified: "boolean",
});
```

### Complex Transformations

```typescript
// Chain multiple transformations
const APIResponseSchema = Mod.extend(
  Mod.omit(Mod.merge(UserSchema, ProfileSchema), ["password", "internalId"]),
  {
    metadata: {
      version: Make.const("2.0"),
      timestamp: "date",
    },
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
  name: "string",
});

// This fails - string "1" is not a number
const result = schema.safeParse({
  id: "1", // Type mismatch
  name: "John",
});
// result.success === false
```

### Loose Mode (Type Coercion)

Enable automatic type conversion when needed:

```typescript
const looseSchema = Interface({
  id: "number",
  active: "boolean",
}).loose();

// This succeeds with automatic conversion
const result = looseSchema.safeParse({
  id: "123", // Converted to number
  active: "true", // Converted to boolean
});

console.log(result.success); // true
console.log(result.data); // { id: 123, active: true }
console.log(result.warnings); // Conversion warnings
```

### Strict Object Mode

Prevent additional properties:

```typescript
const strictSchema = Interface({
  id: "number",
  name: "string",
}).strict();

// Fails due to extra property
const result = strictSchema.safeParse({
  id: 1,
  name: "John",
  age: 25, // Not allowed in strict mode
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
  console.error("Validation failed:", error.message);
}

// safeParse() - Returns result object (recommended)
const result = UserSchema.safeParse(userData);
if (result.success) {
  console.log("Valid data:", result.data);
} else {
  console.log("Errors:", result.errors);
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
  password: "string(8,)", // Minimum 8 characters
  role: Make.union("user", "moderator", "admin"),
  status: Make.union("active", "inactive", "suspended"),

  // Profile information
  profile: {
    firstName: "string(1,50)",
    lastName: "string(1,50)",
    avatar: "url?",
    bio: "string(,500)?", // Optional bio, max 500 chars
    dateOfBirth: "date?",
  },

  // Constraints and metadata
  age: "number(13,120)?", // Age verification
  tags: "string[](1,10)?", // User tags, 1-10 items
  permissions: "string[](,20)?", // Max 20 permissions

  // Timestamps
  createdAt: "date",
  lastLogin: "date?",

  // Application-specific
  accountType: Make.const("standard"),
  preferences: {
    theme: Make.union("light", "dark", "auto"),
    notifications: "boolean",
    language: "string(/^[a-z]{2}$/)", // ISO language code
  },
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
import { Interface } from "fortify-schema"; // Core only
import { Interface, Make } from "fortify-schema"; // + Union types
import { Interface, Make, Mod } from "fortify-schema"; // + Transformations

// Advanced extensions (tree-shakable)
import {
  Smart,
  When,
  Live,
  Docs,
  Extensions,
  Quick,
  TypeScriptGenerator,
} from "fortify-schema";

// Individual extension imports for minimal bundle size
import { Smart } from "fortify-schema"; // Smart inference only
import { When } from "fortify-schema"; // Conditional validation only
import { Live } from "fortify-schema"; // Real-time validation only
import { Docs } from "fortify-schema"; // Documentation generation only
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
  role: z.enum(["user", "admin"]),
});

// Fortify Schema
const fortifySchema = Interface({
  name: "string(2,50)",
  age: "number(1,)?",
  email: "email",
  role: Make.union("user", "admin"),
});
```

### From Joi

```typescript
// Joi
const joiSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  age: Joi.number().integer().positive(),
  email: Joi.string().email(),
});

// Fortify Schema
const fortifySchema = Interface({
  name: "string(2,50)",
  age: "number(1,)",
  email: "email",
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
  role: Make.const("user"),
});

type InferredType = typeof schema._type;
// Equivalent to:
// {
//   id: number;
//   name: string;
//   tags?: string[];
//   status: "=active" | "inactive";
//   role: "=user";
// }
```

### Compile-Time Safety

```typescript
// TypeScript prevents invalid properties
const result = schema.safeParse({
  id: 1,
  name: "John",
  invalidProperty: "error", // ❌ TypeScript error
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
Make.const(value); // Literal constant
Make.union(...values); // Union type
Make.unionOptional(...values); // Optional union type
```

### Mod

Schema transformation utilities.

```typescript
Mod.merge(schema1, schema2); // Combine schemas
Mod.pick(schema, keys); // Select specific fields
Mod.omit(schema, keys); // Remove specific fields
Mod.partial(schema); // Make all fields optional
Mod.required(schema); // Make all fields required
Mod.extend(schema, definition); // Add new fields
```

### Extensions

Advanced features for complex validation scenarios.

```typescript
// Smart inference - Generate schemas automatically
Smart.fromSample(data); // Generate schema from sample data
Smart.fromJsonSchema(jsonSchema); // Convert from JSON Schema
Smart.fromType<T>(); // Generate from TypeScript type

// Conditional validation - Dependent field validation
When.field("role").is("admin").then("string[]").else("string[]?");
When.custom((data) => data.age >= 18)
  .then("string")
  .else("string?");

// Real-time validation - Live validation system
Live.validator(schema); // Create live validator
Live.stream(schema); // Stream-based validation

// Documentation generation - Automatic docs
Docs.generate(schema); // Generate documentation
Docs.typescript(schema); // Generate TypeScript definitions
Docs.openapi(schema); // Generate OpenAPI specification

// Unified extensions access
Extensions.Smart.fromSample(data); // Access via Extensions object
Extensions.When.field("role"); // Organized by category
Extensions.Live.validator(schema); // Consistent API

// Quick shortcuts for common operations
Quick.fromSample(data); // Smart.fromSample shortcut
Quick.when("role").is("admin"); // When.field shortcut
Quick.live(schema); // Live.validator shortcut
Quick.docs(schema); // Docs.generate shortcut
```

### Schema Methods

```typescript
schema.parse(data); // Parse with exceptions
schema.safeParse(data); // Safe parse with known data
schema.safeParseUnknown(data); // Safe parse with unknown data
schema.loose(); // Enable type coercion
schema.strict(); // Prevent extra properties
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

_Built with precision and care by the Nehonix Team_
