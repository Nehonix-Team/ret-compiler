# Fortify Schema - Complete Operations Reference

This document provides a comprehensive reference for ALL operations available in Fortify Schema, including the correct syntax for constant values, conditional validation operators, and type definitions.

## 🚨 **CRITICAL: Constant Value Syntax**

**CORRECT Syntax for Constant Values:**
```typescript
role: "=admin"        // ✅ CORRECT: Use =value for constants
status: "=active"     // ✅ CORRECT: Use =value for constants
version: "=1.0"       // ✅ CORRECT: Use =value for constants
type: "=user"         // ✅ CORRECT: Use =value for constants
```

**INCORRECT Syntax (Common Documentation Error):**
```typescript
role: "admin"         // ❌ WRONG: This is treated as a type, not a constant!
status: "active"      // ❌ WRONG: This is treated as a type, not a constant!
version: "1.0"        // ❌ WRONG: This is treated as a type, not a constant!
```

**Alternative (Using Make.const):**
```typescript
role: Make.const("admin")     // ✅ CORRECT: Explicit constant declaration
status: Make.const("active")  // ✅ CORRECT: Explicit constant declaration
version: Make.const("1.0")    // ✅ CORRECT: Explicit constant declaration
```

## Basic Type Operations

### String Types
```typescript
{
  name: "string",              // Basic string
  username: "string(3,20)",    // Length constraints (3-20 chars)
  password: "string(8,)",      // Minimum length (8+ chars)
  bio: "string(,500)",         // Maximum length (up to 500 chars)
  slug: "string(/^[a-z0-9-]+$/)", // Pattern validation
  email: "email",              // Email format
  url: "url",                  // URL format
  uuid: "uuid",                // UUID format
  phone: "phone",              // Phone format
}
```

### Number Types
```typescript
{
  age: "number",               // Basic number
  score: "number(0,100)",      // Range constraints (0-100)
  price: "number(0.01,)",      // Minimum value (0.01+)
  rating: "number(,5)",        // Maximum value (up to 5)
  id: "positive",              // Positive integers only
  count: "int",                // Integer only
  percentage: "float(0,1)",    // Float with range
}
```

### Boolean Types
```typescript
{
  isActive: "boolean",         // Basic boolean
  isOptional: "boolean?",      // Optional boolean
}
```

### Array Types
```typescript
{
  tags: "string[]",            // Array of strings
  scores: "number[]",          // Array of numbers
  emails: "email[]",           // Array of emails
  items: "string[](1,10)",     // Array with size constraints (1-10 items)
  optional: "string[]?",       // Optional array
}
```

## Union and Constant Operations

### Union Types (Multiple Values Allowed)
```typescript
{
  status: "active|inactive|pending",           // Union of strings
  priority: "low|medium|high",                 // Union of strings
  role: "user|admin|moderator",                // Union of strings
}
```

### Constant Values (Single Value Required)
```typescript
{
  // Method 1: =value syntax
  apiVersion: "=1.0",                          // Must be exactly "1.0"
  type: "=user",                               // Must be exactly "user"
  status: "=active",                           // Must be exactly "active"
  
  // Method 2: Make.const() syntax
  currency: Make.const("USD"),                 // Must be exactly "USD"
  environment: Make.const("production"),       // Must be exactly "production"
  protocol: Make.const("https"),               // Must be exactly "https"
}
```

## Conditional Validation Operators

### Supported Operators

| Operator | Description | Example | IDE Support |
|----------|-------------|---------|-------------|
| `=` | Equals | `"when role=admin *? string[] : string[]?"` | ✅ Full TypeScript inference |
| `!=` | Not equals | `"when accountType!=free *? string : string?"` | ⚠️ **Works at runtime, no IDE errors** |
| `>` | Greater than | `"when age>18 *? string : string?"` | ✅ Full TypeScript inference |
| `<` | Less than | `"when age<65 *? string : string?"` | ✅ Full TypeScript inference |
| `>=` | Greater than or equal | `"when age>=18 *? string : string?"` | ✅ Full TypeScript inference |
| `<=` | Less than or equal | `"when age<=65 *? string : string?"` | ✅ Full TypeScript inference |
| `~` | Regex match | `"when email~^admin *? string[] : string[]?"` | ✅ Full TypeScript inference |

### Special Operators

| Operator | Description | Example | IDE Support |
|----------|-------------|---------|-------------|
| `.exists` | Field exists (not null/undefined) | `"when paymentMethod.exists *? string : string?"` | ✅ Full TypeScript inference |
| `.!exists` | Field does not exist | `"when paymentMethod.!exists *? string? : string"` | ✅ Full TypeScript inference |
| `.in()` | Value in array | `"when role.in(admin,teacher) *? string[] : string[]?"` | ✅ Full TypeScript inference |
| `.!in()` | Value not in array | `"when role.!in(guest,user) *? string[] : string[]?"` | ✅ Full TypeScript inference |

## Conditional Syntax Examples

### 1. Revolutionary Syntax (Recommended)
```typescript
const UserSchema = Interface({
  role: "admin|user|guest",
  accountType: "free|premium|enterprise",
  age: "int(13,120)",
  
  // Basic equality
  permissions: "when role=admin *? string[] : string[]?",
  
  // Inequality (works at runtime, no IDE errors)
  paymentMethod: "when accountType!=free *? string : string?",
  
  // Numeric comparisons
  accessLevel: "when age>=18 *? string : string?",
  discountRate: "when age<25 *? number(0,0.5) : number(0,0.1)",
  
  // Complex conditions
  maxProjects: "when userType.in(admin,teacher) *? int(1,) : int(1,10)",
  billingAddress: "when paymentMethod.exists *? string : string?",
});
```

### 2. Parentheses Syntax
```typescript
const OrderSchema = Interface({
  orderType: "pickup|delivery",
  customerType: "regular|premium|vip",
  
  // Basic conditions
  deliveryFee: "when(orderType=delivery) then(number(5,50)) else(number?)",
  
  // Inequality
  rushFee: "when(customerType!=vip) then(number(10,25)) else(number?)",
  
  // Numeric comparisons
  discount: "when(orderValue>=100) then(number(0,0.2)) else(number(0,0.05))",
});
```

### 3. When.field() API (Programmatic)
```typescript
import { When } from 'fortify-schema';

const EventSchema = Interface({
  eventType: "conference|workshop|webinar",
  duration: "int(30,480)",
  attendeeCount: "int(1,1000)",
  
  // Programmatic conditional validation
  venue: When.field("eventType").is("webinar").then("string?")
                                 .isNot("webinar").then("string")
                                 .default("string"),
  
  catering: When.field("attendeeCount").when(count => count >= 50).then("boolean")
                                       .default("boolean?"),
});
```

## The `!=` Operator Issue

**Problem**: The `!=` operator works at runtime but doesn't show IDE errors:

```typescript
// This compiles without errors but validates correctly at runtime
permissions: "when role!=admin *? string[]? : string[]"
//                    ^^
//                    No IDE error, but runtime validation works!
```

**Workarounds**:

### Option 1: Use `.!in()` for single values
```typescript
// Instead of: "when role!=admin *? ..."
permissions: "when role.!in(admin) *? string[]? : string[]"
```

### Option 2: Use When.field() API
```typescript
permissions: When.field("role").isNot("admin").then("string[]?").else("string[]")
```

### Option 3: Use positive logic
```typescript
// Instead of: "when accountType!=free *? ..."
paymentMethod: "when accountType.in(premium,enterprise) *? string : string?"
```

## Complete Working Example

```typescript
import { Interface, When, Make } from 'fortify-schema';

const UserSchema = Interface({
  // Basic fields
  id: "positive",
  email: "email",
  username: "string(3,20)",
  
  // Constants (CORRECT syntax)
  apiVersion: "=2.0",                          // Constant value
  userType: "=standard",                       // Constant value
  
  // Union types
  role: "admin|user|guest",
  status: "active|inactive|pending",
  
  // Conditional validation
  permissions: "when role=admin *? string[] : string[]?",           // ✅ Works with IDE
  paymentMethod: "when status!=inactive *? string : string?",       // ⚠️ Runtime only
  maxProjects: "when role.in(admin,user) *? int(1,) : int(1,10)",  // ✅ Works with IDE
  
  // Alternative syntax for constants
  currency: Make.const("USD"),                 // Explicit constant
  environment: Make.const("production"),       // Explicit constant
});
```

## Best Practices

1. **Use `=value` syntax for constants** to be explicit about literal values
2. **Use `.!in()` instead of `!=`** for better IDE support when possible
3. **Use When.field() API for complex logic** that needs full TypeScript support
4. **Test conditional validation thoroughly** since some operators work at runtime only
5. **Prefer positive logic over negative logic** for better readability

## Migration from Incorrect Documentation

If you find documentation showing:
```typescript
role: "admin"     // ❌ INCORRECT
```

It should be:
```typescript
role: "=admin"    // ✅ CORRECT
```

This ensures the value is treated as a constant, not a type definition.
