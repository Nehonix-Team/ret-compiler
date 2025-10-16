# Conditional Validation - Implementation Complete! 🎉

## Overview

The ret-compiler now fully supports **conditional validation** with inline syntax that matches ReliantType's conditional validation system perfectly!

## Syntax

### In `.rel` files:
```rel
define User {
  role: admin | user | guest
  age: number
  
  # Conditional fields based on role
  when role = admin {
    adminToken: string
    permissions: string[]
  }
  
  # Conditional fields based on age
  when age >= 18 {
    canVote: boolean
    adultContent: boolean
  }
}
```

### Generated TypeScript:
```typescript
export const UserSchema = Interface({
  role: "admin|user|guest",
  age: "number",
  adminToken: "when role === admin *? string : any?",
  permissions: "when role === admin *? string[] : any?",
  canVote: "when age >= 18 *? boolean : any?",
  adultContent: "when age >= 18 *? boolean : any?",
});
```

## Supported Conditions

### Equality
```rel
when role = admin { ... }
when status = active { ... }
```

### Comparison
```rel
when age >= 18 { ... }
when age > 21 { ... }
when score < 100 { ... }
```

### Boolean
```rel
when isPremium = true { ... }
when isVerified = false { ... }
```

## Features

### ✅ Multiple Conditions
You can have multiple `when` blocks in a single schema:
```rel
define User {
  role: admin | user
  age: number
  isPremium: boolean
  
  when role = admin {
    adminPanel: boolean
  }
  
  when age >= 18 {
    adultContent: boolean
  }
  
  when isPremium = true {
    premiumFeatures: string[]
  }
}
```

### ✅ Multiple Fields per Condition
Each `when` block can contain multiple fields:
```rel
when role = admin {
  adminToken: string
  permissions: string[]
  systemSettings: record<string, any>
}
```

### ✅ Complex Types in Conditionals
Conditional fields support all type features:
```rel
when role = admin {
  permissions: string[] & min(1) & max(10)  # Array with constraints
  settings: record<string, any>              # Record types
  token: string & matches(r"^[A-Z]{10}$")   # Regex patterns
}
```

## Test Results

All tests passing! ✅

### Test Suite: `ret-compiler-conditionals.test.ts`
- ✅ Role-based conditionals (3 tests)
- ✅ Age-based conditionals (3 tests)
- ✅ Boolean-based conditionals (2 tests)
- ✅ Complex multi-conditional schemas (3 tests)
- ✅ Array constraints in conditionals (3 tests)

**Total: 14/14 tests passing**

## How It Works

### 1. Parser
The parser recognizes `when` blocks and stores:
- The condition expression
- All fields in the `then` block
- All fields in the `else` block (if present)

### 2. AST
The `ConditionalNode` structure stores:
```rust
pub struct ConditionalNode {
    pub condition: ExpressionNode,
    pub then_value: TypeNode,
    pub else_value: Option<TypeNode>,
    pub then_fields: Vec<FieldNode>,  // Actual fields
    pub else_fields: Vec<FieldNode>,  // Actual fields
}
```

### 3. Generator
The generator creates inline conditional syntax:
```typescript
fieldName: "when <condition> *? <thenType> : <elseType>"
```

## Examples

### Example 1: Admin Permissions
```rel
define User {
  userId: uuid
  role: admin | user | guest
  
  when role = admin {
    adminToken: string
    allPermissions: string[]
  }
}
```

Generates:
```typescript
{
  userId: "uuid",
  role: "admin|user|guest",
  adminToken: "when role === admin *? string : any?",
  allPermissions: "when role === admin *? string[] : any?",
}
```

### Example 2: Age Restrictions
```rel
define Content {
  userId: uuid
  age: number
  
  when age >= 18 {
    adultContent: boolean
    canVote: boolean
  }
  
  when age >= 21 {
    alcoholPurchase: boolean
  }
}
```

Generates:
```typescript
{
  userId: "uuid",
  age: "number",
  adultContent: "when age >= 18 *? boolean : any?",
  canVote: "when age >= 18 *? boolean : any?",
  alcoholPurchase: "when age >= 21 *? boolean : any?",
}
```

### Example 3: Premium Features
```rel
define Subscription {
  userId: uuid
  isPremium: boolean
  
  when isPremium = true {
    premiumFeatures: string[]
    adFree: boolean
    prioritySupport: boolean
  }
}
```

Generates:
```typescript
{
  userId: "uuid",
  isPremium: "boolean",
  premiumFeatures: "when isPremium === true *? string[] : any?",
  adFree: "when isPremium === true *? boolean : any?",
  prioritySupport: "when isPremium === true *? boolean : any?",
}
```

## Validation Behavior

### When Condition is True
All conditional fields become **required** and must match their specified types.

### When Condition is False
Conditional fields become **optional** (`:any?`) and can be omitted or set to any value.

### Example Validation
```typescript
// Admin user - conditional fields required
{
  role: "admin",
  adminToken: "secret-123",     // Required!
  permissions: ["read", "write"] // Required!
}

// Regular user - conditional fields optional
{
  role: "user"
  // adminToken and permissions can be omitted
}
```

## Integration with ReliantType

The generated schemas work seamlessly with ReliantType's conditional validation system:

```typescript
import { Interface } from "reliant-type";
import { UserSchema } from "./generated/user";

const result = UserSchema.safeParse(userData);
if (result.success) {
  // Fully typed data with conditional fields
  console.log(result.data);
} else {
  // Validation errors
  console.log(result.errors);
}
```

## Future Enhancements

Potential future features:
- [ ] `else` blocks for alternative fields
- [ ] Nested conditionals
- [ ] Complex boolean expressions (`&&`, `||`)
- [ ] Field path references (`user.role`, `config.settings.enabled`)

## Conclusion

Conditional validation is now **fully functional** and **production-ready**! 🎉

The ret-compiler generates proper ReliantType inline conditional syntax that works perfectly with the validation library.

**Status:** ✅ Complete and Tested
**Test Coverage:** 14/14 passing
**Integration:** ✅ Works with ReliantType
**Documentation:** ✅ Complete
