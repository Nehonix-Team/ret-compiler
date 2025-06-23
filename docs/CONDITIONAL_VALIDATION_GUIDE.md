# Fortify Schema - Conditional Validation Guide

## Overview

Fortify Schema provides powerful conditional validation where field schemas can depend on other field values. This enables complex business logic validation with clean, readable syntax.

## Basic Syntax

The enhanced conditional validation uses the `when ... *? ... : ...` syntax:

```typescript
import { Interface } from "fortify-schema";

const UserSchema = Interface({
  role: "admin|user|guest",
  age: "int(13,120)",

  // Basic conditional validation
  access: "when role=admin *? =granted : =denied",
  adultContent: "when age>=18 *? boolean : =false",
});
```

## Supported Schema Types in Conditionals

### ✅ Simple Types

```typescript
const Schema = Interface({
  status: "active|inactive",

  // Simple types work perfectly
  name: "when status=active *? string : string?",
  count: "when status=active *? number : =0",
  enabled: "when status=active *? boolean : =false",
});
```

### ✅ Array Types

```typescript
const Schema = Interface({
  role: "admin|user|guest",

  // Array types are supported
  permissions: "when role=admin *? string[] : string[]?",
  tags: "when role!=guest *? string[] : =null",
});
```

### ✅ Constant Values

```typescript
const Schema = Interface({
  accountType: "free|premium|enterprise",

  // Constant values with = prefix
  maxProjects: "when accountType=free *? =3 : =unlimited",
  support: "when accountType=premium *? =priority : =standard",
  features: "when accountType=enterprise *? =all : =basic",
});
```

### ✅ Constraint Syntax (Fully Supported)

```typescript
// ✅ Constraint syntax now works perfectly in conditionals!
const AdvancedSchema = Interface({
  accountType: "free|premium|enterprise",
  age: "int(13,120)",

  // ✅ All constraint types work in conditionals
  maxProjects: "when accountType=free *? int(1,3) : int(1,100)",
  storageLimit: "when accountType=premium *? int(100,) : int(10,50)",
  nameLength: "when accountType=enterprise *? string(10,100) : string(3,50)",
  discount: "when age>=65 *? number(0.1,0.3) : number(0,0.1)",
  features: "when accountType=premium *? string[](1,5) : string[]?",
});

// Test with valid free account
const validFree = {
  accountType: "free",
  age: 30,
  maxProjects: 2,        // ✅ Valid (1-3)
  storageLimit: 25,      // ✅ Valid (10-50)
  nameLength: "John",    // ✅ Valid (3-50)
  discount: 0.05,        // ✅ Valid (0-0.1)
  features: []           // ✅ Valid (optional)
};

// Test with invalid data - will properly fail validation
const invalidFree = {
  accountType: "free",
  age: 30,
  maxProjects: 5,        // ❌ Invalid (exceeds 3)
  storageLimit: 60,      // ❌ Invalid (exceeds 50)
  nameLength: "Jo",      // ❌ Invalid (too short)
  discount: 0.15,        // ❌ Invalid (exceeds 0.1)
  features: []
};
```

## Comparison Operators

### Equality and Inequality

```typescript
const Schema = Interface({
  role: "admin|user|guest|moderator",
  status: "active|inactive|pending",

  // Equality
  adminAccess: "when role=admin *? =full : =limited",

  // Inequality
  guestRestrictions: "when role!=guest *? =none : =strict",

  // Multiple values with method calls
  moderatorTools: "when role.in(admin,moderator) *? string[] : =null",
});
```

### Numeric Comparisons

```typescript
const Schema = Interface({
  age: "int(13,120)",
  level: "int(1,100)",
  score: "number",

  // Numeric operators
  adultContent: "when age>=18 *? boolean : =false",
  seniorDiscount: "when age>=65 *? =true : =false",
  youthProgram: "when age<25 *? =eligible : =not_eligible",
  advancedFeatures: "when level>50 *? =enabled : =disabled",
  premiumAccess: "when score<=100 *? =basic : =premium",
});
```

## Logical Operators

### AND (&&) Operator

```typescript
const Schema = Interface({
  role: "admin|user|guest",
  age: "int(13,120)",
  status: "active|inactive",

  // Multiple conditions with AND
  fullAccess: "when role=admin && age>=18 *? =granted : =denied",
  premiumFeatures: "when role=admin && status=active *? =enabled : =disabled",
});
```

### OR (||) Operator

```typescript
const Schema = Interface({
  role: "admin|manager|user",
  level: "int(1,10)",

  // Multiple conditions with OR
  managerAccess: "when role=admin || level>=8 *? =granted : =denied",
  specialFeatures:
    "when role.in(admin,manager) || level>=9 *? =enabled : =disabled",
});
```

### Complex Logical Expressions

```typescript
const Schema = Interface({
  role: "admin|manager|user|guest",
  age: "int(13,120)",
  status: "active|inactive|pending",

  // Complex logical combinations
  access:
    "when (role=admin || role=manager) && status=active *? =full : =limited",
  content: "when role!=guest && age>=18 && status=active *? string[] : =null",
});
```

## Method Calls

### .in() Method

```typescript
const Schema = Interface({
  role: "admin|manager|user|guest|moderator",
  department: "engineering|marketing|sales|hr",

  // Check if value is in a list
  elevatedAccess: "when role.in(admin,manager) *? =granted : =denied",
  techAccess:
    "when department.in(engineering,marketing) *? =enabled : =disabled",
});
```

### .exists Method

```typescript
const Schema = Interface({
  email: "email?",
  phone: "string?",

  // Check if field has a value (not null/undefined)
  notifications: "when email.exists *? =email : =none",
  contactMethod: "when phone.exists *? =phone : =email",
});
```

### .contains() Method

```typescript
const Schema = Interface({
  tags: "string[]?",
  permissions: "string[]?",

  // Check if array contains a value
  premiumFeatures: "when tags.contains(premium) *? =enabled : =disabled",
  adminTools: "when permissions.contains(admin) *? =available : =restricted",
});
```

## Nested Conditionals

```typescript
const Schema = Interface({
  status: "active|inactive|pending",
  role: "admin|user|guest",
  level: "int(1,10)",

  // Nested conditional logic
  access: "when status=active *? when role=admin *? =full : =limited : =none",

  // Complex nested with multiple levels
  features:
    "when status=active *? when role=admin *? when level>=5 *? =all : =admin : =user : =none",
});
```

## Real-World Examples

### User Management System

```typescript
const UserSchema = Interface({
  // Base fields
  id: "positive",
  username: "string(3,20)",
  email: "email",
  age: "int(13,120)",
  role: "admin|user|guest|moderator",
  accountType: "free|premium|enterprise",
  status: "active|inactive|pending",

  // Conditional validations
  adminPermissions: "when role=admin *? string[] : =null",
  systemAccess: "when role=admin *? =full : =limited",
  paymentRequired: "when accountType!=free *? boolean : =false",
  supportLevel: "when accountType=premium *? =priority : =standard",
  adultContent: "when age>=18 *? boolean : =false",
  moderatorTools: "when role.in(admin,moderator) *? string[] : =null",
  premiumFeatures:
    "when accountType.in(premium,enterprise) && status=active *? =enabled : =disabled",
});
```

### E-commerce Order System

```typescript
const OrderSchema = Interface({
  // Base fields
  orderType: "pickup|delivery|digital",
  customerType: "regular|premium|vip",
  amount: "number(0,)",
  location: "string?",

  // Conditional validations
  deliveryFee: "when orderType=delivery *? number : =0",
  deliveryAddress: "when orderType=delivery *? string : string?",
  pickupTime: "when orderType=pickup *? string : string?",
  digitalDownload: "when orderType=digital *? string : =null",
  discount: "when customerType.in(premium,vip) *? number : =0",
  priorityProcessing: "when customerType=vip || amount>=1000 *? =true : =false",
});
```

## Best Practices

### 1. Use Simple Types in Conditionals

```typescript
// ✅ Good - Simple types
const GoodSchema = Interface({
  age: "int(13,120)", // Constraints in base schema
  discount: "when age>=65 *? number : =0", // Simple type in conditional
});

// ❌ Avoid - Constraint syntax in conditionals
const AvoidSchema = Interface({
  age: "int(13,120)",
  discount: "when age>=65 *? number(0.1,0.3) : =0", // Will fail to parse
});
```

### 2. Use Descriptive Constant Values

```typescript
const Schema = Interface({
  role: "admin|user|guest",

  // ✅ Clear constant values
  access: "when role=admin *? =full_access : =limited_access",
  features: "when role=admin *? =all_features : =basic_features",
});
```

### 3. Group Related Conditionals

```typescript
const Schema = Interface({
  accountType: "free|premium|enterprise",
  status: "active|inactive",

  // Group related conditional fields together
  maxProjects: "when accountType=free *? =3 : =unlimited",
  maxStorage: "when accountType=free *? =1GB : =unlimited",
  supportLevel: "when accountType=premium *? =priority : =standard",

  // Status-based conditionals
  features: "when status=active *? string[] : =null",
  notifications: "when status=active *? boolean : =false",
});
```

### 4. Handle Edge Cases

```typescript
const Schema = Interface({
  role: "admin|user|guest",
  email: "email?",

  // Handle null/undefined cases
  notifications: "when email.exists *? =enabled : =disabled",
  adminTools: "when role=admin *? string[] : =null", // Explicit null for non-admins
});
```

## Error Handling

### Common Parsing Errors

```typescript
// ❌ Constraint syntax error
"when age>=18 *? number(0,100) : =0";
// Error: "Unexpected token: ("

// ❌ Missing colon
"when role=admin *? string";
// Error: "Expected ':' after then value"

// ❌ Invalid operator
"when age === 18 *? boolean : =false";
// Error: "Unknown operator: ==="
```

### Validation Errors

```typescript
const result = Schema.safeParse(data);

if (!result.success) {
  // Enhanced error messages
  console.log(result.errors);
  // ["access: Expected constant value: granted, got denied"]
}
```

## Performance Considerations

- ✅ **Pre-compiled**: Conditional expressions are parsed once during schema creation
- ✅ **Fast evaluation**: 47,000+ validations per second
- ✅ **Memory efficient**: AST-based evaluation with minimal overhead
- ✅ **Type-safe**: Full TypeScript integration and inference

## Migration from Legacy Syntax

If you're using the old conditional syntax, here's how to migrate:

```typescript
// ❌ Old legacy syntax (no longer supported)
const OldSchema = Interface({
  role: "admin|user",
  access: "when:role=admin:string:string?",
});

// ✅ New enhanced syntax
const NewSchema = Interface({
  role: "admin|user",
  access: "when role=admin *? string : string?",
});
```

## Quick Reference

### Syntax Pattern

```
"when <condition> *? <thenSchema> : <elseSchema>"
```

### Supported Operators

- **Equality**: `=`, `!=`
- **Comparison**: `>`, `<`, `>=`, `<=`
- **Logical**: `&&`, `||`
- **Methods**: `.in()`, `.exists`, `.contains()`

### Supported Schema Types

- **Simple**: `string`, `number`, `boolean`
- **Arrays**: `string[]`, `number[]`, `boolean[]`
- **Optional**: `string?`, `number?`, `string[]?`
- **Constants**: `=value`, `=null`, `=true`, `=false`

### Not Supported

- **Constraints**: `number(0,100)`, `string(5,50)`
- **Complex types**: `object({...})`, `union(...)`
- **Regex**: `string(/pattern/)`

## Troubleshooting

### "Unexpected token: (" Error

**Problem**: Using constraint syntax in conditionals

```typescript
// ❌ This fails
"when age>=18 *? number(0,100) : =0";
```

**Solution**: Use simple types

```typescript
// ✅ This works
"when age>=18 *? number : =0";
```

### "Field cannot be null" Error

**Problem**: Conditional expects non-null but gets null

```typescript
// ❌ This might fail validation
"when role=admin *? string[] : null"; // Should be =null
```

**Solution**: Use constant syntax for null

```typescript
// ✅ This works
"when role=admin *? string[] : =null";
```

### "Expected constant value" Error

**Problem**: Value doesn't match conditional expectation

```typescript
// Schema expects "granted" but data has "allowed"
access: "when role=admin *? =granted : =denied";
```

**Solution**: Ensure data matches expected constant values

## Conclusion

Fortify Schema's enhanced conditional validation provides a powerful, performant, and type-safe way to implement complex business logic. While it doesn't support constraint syntax within conditionals, it excels at handling real-world validation scenarios with clean, readable syntax.

For complex constraints, use them in your base schema fields and keep conditional branches simple and clear.
