# Fortify Schema - Conditional Validation Operators Reference

This document provides a comprehensive reference for all conditional validation operators available in Fortify Schema.

## Overview

Fortify Schema supports multiple conditional validation syntaxes:

1. **Syntax** (Recommended): `"when condition *? thenSchema : elseSchema"`
2. **Parentheses Syntax**: `"when(condition) then(thenSchema) else(elseSchema)"`
3. **When.field() API**: Programmatic conditional validation
4. **Legacy Syntax**: `"when:condition:thenSchema:elseSchema"` (backward compatibility)

## Supported Operators

### Comparison Operators

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

## Syntax Examples

### 1. Clean Syntax (Recommended)

The cleanest and most intuitive syntax:

```typescript
const UserSchema = Interface({
  role: "admin|user|guest",
  accountType: "free|premium|enterprise",
  age: "int(13,120)",
  userType: "student|teacher|admin",
  
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

More explicit syntax with proper nesting support:

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
  
  // Special operators
  insurance: "when(deliveryAddress.exists) then(boolean) else(boolean?)",
  priority: "when(customerType.in(premium,vip)) then(high|urgent) else(normal|low)",
});
```

### 3. When.field() API (Programmatic)

For complex logic and better IDE support:

```typescript
const EventSchema = Interface({
  eventType: "conference|workshop|webinar",
  duration: "int(30,480)", // minutes
  attendeeCount: "int(1,1000)",
  
  // Programmatic conditional validation
  venue: When.field("eventType").is("webinar").then("string?")
                                 .isNot("webinar").then("string")
                                 .default("string"),
  
  catering: When.field("attendeeCount").when(count => count >= 50).then("boolean")
                                       .default("boolean?"),
  
  equipment: When.field("eventType").in(["conference", "workshop"]).then("string[]")
                                    .default("string[]?"),
});
```

## IDE Support Analysis

### ✅ **Working Operators (Full TypeScript Support)**

These operators work perfectly with TypeScript IDE inference:

- `=` (equals)
- `>` (greater than)
- `<` (less than)
- `>=` (greater than or equal)
- `<=` (less than or equal)
- `~` (regex match)
- `.exists`
- `.!exists`
- `.in()`
- `.!in()`

### ⚠️ **Runtime-Only Operators**

These operators work at runtime but don't show IDE errors:

- `!=` (not equals) - **This is the issue you discovered!**

## The `!=` Operator Issue

You correctly identified that `!=` doesn't throw IDE errors but works at runtime:

```typescript
// This compiles without errors but validates correctly at runtime
permissions: "when role!=admin *? string[]? : string[]"
//                    ^^
//                    No IDE error, but runtime validation works!
```

**Why this happens:**
- TypeScript's conditional type inference doesn't recognize `!=` as a valid type guard
- The runtime parser correctly handles `!=` operator
- Other operators like `=`, `>=`, etc. work with TypeScript's type system

## Workarounds for `!=` IDE Support

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
import { Interface, When } from '@fortifyjs/core/schema';

const UserSchema = Interface({
  // Basic fields
  role: "admin|user|guest",
  accountType: "free|premium|enterprise", 
  age: "int(13,120)",
  userType: "student|teacher|admin",
  
  // ✅ WORKING: Equality (full IDE support)
  permissions: "when role=admin *? string[] : string[]?",
  
  // ⚠️ RUNTIME ONLY: Inequality (no IDE errors, but validates correctly)
  paymentMethod: "when accountType!=free *? string : string?",
  
  // ✅ WORKING: Numeric comparisons (full IDE support)
  accessLevel: "when age>=18 *? string : string?",
  discountRate: "when userType=student *? number(0,0.5) : number(0,0.1)",
  
  // ✅ WORKING: Special operators (full IDE support)
  maxProjects: "when userType.in(admin,teacher) *? int(1,) : int(1,10)",
  billingAddress: "when paymentMethod.exists *? string : string?",
  
  // ✅ WORKING: Programmatic API (full IDE support)
  notifications: When.field("accountType").isNot("free").then("string[]").else("string[]?"),
});

// Test the schema
const result = UserSchema.safeParse({
  role: "=user",
  accountType: "free", 
  age: 25,
  userType: "student",
  // paymentMethod: undefined, // This will pass validation correctly
});

console.log(result.success); // true
console.log(result.data);    // Fully typed result
```

## Operator Precedence

When parsing conditions, operators are checked in this order:

1. `!=` (not equals)
2. `>=` (greater than or equal)
3. `<=` (less than or equal)
4. `=` (equals)
5. `>` (greater than)
6. `<` (less than)
7. `~` (regex match)

## Best Practices

1. **Use `=` instead of `!=` when possible** for better IDE support
2. **Use `.!in()` for multiple exclusions** instead of multiple `!=` conditions
3. **Use When.field() API for complex logic** that needs full TypeScript support
4. **Test conditional validation thoroughly** since some operators work at runtime only
5. **Prefer positive logic over negative logic** for better readability

## Migration Guide

If you're using `!=` and want full IDE support:

```typescript
// Before (runtime only)
permissions: "when role!=admin *? string[]? : string[]"

// After (full IDE support)
permissions: When.field("role").isNot("admin").then("string[]?").else("string[]")

// Or use positive logic
permissions: "when role.in(user,guest) *? string[]? : string[]"
```

This comprehensive reference should help you understand why `!=` works at runtime but doesn't show IDE errors, and provides alternatives for full TypeScript support.
