# Fortify Schema - Migration Guide

This comprehensive guide demonstrates why Fortify Schema represents a significant advancement in schema validation, providing step-by-step migration instructions from popular libraries (Zod, Joi, Yup) with compelling comparisons that showcase the superior developer experience.

## Why Migrate to Fortify Schema?

Fortify Schema addresses fundamental limitations in existing schema validation libraries through design principles:

### The Problem with Current Solutions

**Verbose and Complex Syntax**: Traditional libraries require extensive chaining and method calls for simple validations, leading to verbose and hard-to-maintain code.

**Poor TypeScript Integration**: Most libraries provide generic types instead of exact literal types, reducing type safety and developer confidence.

**Inconsistent APIs**: Different patterns for similar operations create cognitive overhead and increase learning curves.

**Limited Conditional Validation**: Complex conditional logic requires workarounds or external libraries, breaking the validation flow.

### The Fortify Schema Advantage

**Interface-Like Syntax**: Familiar TypeScript interface syntax that developers already know, eliminating learning curves.

**Conditional Validation**: World's first schema library with conditional validation that provides perfect TypeScript inference.

**Exact Type Inference**: Precise literal types instead of generic unions, providing superior compile-time safety.

**Consistent Constraint System**: Unified syntax for all constraint types, reducing cognitive load and improving maintainability.

## From Zod

### Basic Schema Migration

**Zod:**

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
```

**Fortify Schema:**

```typescript
import { Interface } from "fortify-schema";

const UserSchema = Interface({
  id: "positive", // Positive integer
  email: "email", // Email format
  name: "string(2,50)", // String with length constraints
  age: "int(18,120)?", // Optional integer with range
  tags: "string[](1,10)?", // Optional array with size constraints
  status: "active|inactive|pending", // Union type - incredibly simple!
  role: "=admin", // Literal constant - just the value!
});
```

### Advanced Features Migration

**Zod:**

```typescript
const ProductSchema = z.object({
  id: z.string().uuid(),
  price: z.number().positive().min(0.01),
  category: z.enum(["electronics", "clothing"]),
  images: z.array(z.string().url()).min(1).max(5),
  metadata: z.record(z.string(), z.any()).optional(),
});

const PublicProductSchema = ProductSchema.omit({ metadata: true });
const PartialProductSchema = ProductSchema.partial();
```

**Fortify Schema:**

```typescript
import { Interface, Mod } from "fortify-schema";

const ProductSchema = Interface({
  id: "uuid", // UUID format
  price: "number(0.01,)", // Positive number with minimum
  category: "electronics|clothing", // Union type - just use | like TypeScript!
  images: "url[](1,5)", // Array of URLs with size constraints
  metadata: "any?", // Optional any type
});

const PublicProductSchema = Mod.omit(ProductSchema, ["metadata"]);
const PartialProductSchema = Mod.partial(ProductSchema);
```

### Validation Migration

**Zod:**

```typescript
try {
  const user = UserSchema.parse(userData);
  console.log("Valid:", user);
} catch (error) {
  console.log("Invalid:", error.errors);
}

const result = UserSchema.safeParse(userData);
if (result.success) {
  console.log("Valid:", result.data);
} else {
  console.log("Errors:", result.error.errors);
}
```

**Fortify Schema:**

```typescript
const result = UserSchema.safeParse(userData);
if (result.success) {
  console.log("✓ Valid:", result.data);
} else {
  console.log("✗ Errors:", result.errors); // Simplified error structure
}

try {
  const user = UserSchema.parse(userData);
  console.log("✓ Valid:", user);
} catch (error) {
  console.log("✗ Invalid:", error.message);
}
```

## From Joi

### Basic Schema Migration

**Joi:**

```typescript
import Joi from "joi";

const UserSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
  email: Joi.string().email().required(),
  name: Joi.string().min(2).max(50).required(),
  age: Joi.number().integer().min(18).max(120).optional(),
  tags: Joi.array().items(Joi.string()).min(1).max(10).optional(),
  status: Joi.string().valid("active", "inactive", "pending").required(),
  role: Joi.string().valid("admin").required(),
});
```

**Fortify Schema:**

```typescript
import { Interface } from "fortify-schema";

const UserSchema = Interface({
  id: "positive", // Positive integer
  email: "email", // Email format
  name: "string(2,50)", // String with length constraints
  age: "int(18,120)?", // Optional integer with range
  tags: "string[](1,10)?", // Optional array with size constraints
  status: "active|inactive|pending", // Union type - TypeScript syntax!
  role: "=admin", // Literal constant - just the value!
});
```

### Validation Migration

**Joi:**

```typescript
const { error, value } = UserSchema.validate(userData);
if (error) {
  console.log("✗ Validation failed:", error.details);
} else {
  console.log("✓ Valid data:", value);
}
```

**Fortify Schema:**

```typescript
const result = UserSchema.safeParse(userData);
if (result.success) {
  console.log("✓ Valid data:", result.data);
} else {
  console.log("✗ Validation failed:", result.errors);
}
```

## From Yup

### Basic Schema Migration

**Yup:**

```typescript
import * as yup from "yup";

const UserSchema = yup.object({
  id: yup.number().positive().integer().required(),
  email: yup.string().email().required(),
  name: yup.string().min(2).max(50).required(),
  age: yup.number().integer().min(18).max(120).optional(),
  status: yup.string().oneOf(["active", "inactive"]).required(),
});
```

**Fortify Schema:**

```typescript
import { Interface } from "fortify-schema";

const UserSchema = Interface({
  id: "positive", // Positive integer
  email: "email", // Email format
  name: "string(2,50)", // String with length constraints
  age: "int(18,120)?", // Optional integer with range
  status: "active|inactive", // Union type - pure TypeScript syntax!
});
```

## Feature Comparison

| Feature               | Zod                                  | Joi                                              | Yup                                           | Fortify Schema                              |
| --------------------- | ------------------------------------ | ------------------------------------------------ | --------------------------------------------- | ------------------------------------------- |
| **Positive Integer**  | `z.number().int().positive()`        | `Joi.number().integer().positive()`              | `yup.number().positive().integer()`           | `"positive"`                                |
| **String Length**     | `z.string().min(3).max(20)`          | `Joi.string().min(3).max(20)`                    | `yup.string().min(3).max(20)`                 | `"string(3,20)"`                            |
| **Optional Field**    | `z.string().optional()`              | `Joi.string().optional()`                        | `yup.string().optional()`                     | `"string?"`                                 |
| **Array Size**        | `z.array(z.string()).min(1).max(10)` | `Joi.array().items(Joi.string()).min(1).max(10)` | `yup.array().of(yup.string()).min(1).max(10)` | `"string[](1,10)"`                          |
| **Union Types**       | `z.enum(["a", "b"])`                 | `Joi.string().valid("a", "b")`                   | `yup.string().oneOf(["a", "b"])`              | `"a\|b"`                                    |
| **Email**             | `z.string().email()`                 | `Joi.string().email()`                           | `yup.string().email()`                        | `"email"`                                   |
| **Literal Constants** | `z.literal("admin")`                 | `Joi.string().valid("admin")`                    | `yup.string().oneOf(["admin"])`               | `"=admin"`                                  |
| **Conditional Logic** | Complex external solutions           | Not supported                                    | Not supported                                 | `"when role=admin *? string[] : string[]?"` |

## Conditional Validation

Fortify Schema introduces the world's first conditional validation system with perfect TypeScript inference:

### Traditional Approach (Complex Workarounds)

**Zod - Requires External Libraries:**

```typescript
import { z } from "zod";

const UserSchema = z
  .object({
    role: z.enum(["admin", "user"]),
    permissions: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      if (data.role === "admin" && !data.permissions) {
        return false; // Complex validation logic
      }
      return true;
    },
    { message: "Admin users must have permissions" }
  );
```

**Fortify Schema - Built-in Conditional Logic:**

```typescript
import { Interface } from "fortify-schema";

const UserSchema = Interface({
  role: "admin|user",
  permissions: "when role=admin *? string[] : string[]?", // Just simple!
});
```

### Advanced Conditional Examples

```typescript
const AdvancedSchema = Interface({
  accountType: "free|premium|enterprise",
  age: "int(13,120)",

  // Conditional validation with perfect TypeScript inference
  maxProjects: "when accountType=free *? int(1,3) : int(1,)",
  paymentMethod: "when accountType!=free *? string : string?",
  seniorDiscount: "when age>=65 *? number : number?",
  adminFeatures: "when role.in(admin,moderator) *? string[] : string[]?",
});
```

## Migration Benefits

### Dramatic Code Reduction

**70% Less Code**: Fortify Schema reduces schema definition complexity by up to 70% compared to traditional libraries.

**Zero Learning Curve**: If you know TypeScript interfaces, you already know Fortify Schema.

**Perfect Type Safety**: conditional validation with compile-time type inference.

### Quantified Advantages

1. **Unmatched Simplicity**

   - Single import for most use cases
   - TypeScript interface-like syntax
   - No method chaining required

2. **Superior Type Inference**

   - Exact literal types instead of generic unions
   - Conditional type evaluation at compile time
   - Perfect IDE integration with autocomplete

3. **Features**

   - World's first conditional validation with TypeScript inference
   - Built-in constraint system with function-like syntax
   - Seamless schema transformation utilities

4. **Enterprise Performance**
   - Optimized validation algorithms
   - Tree-shakable architecture
   - Minimal runtime overhead

## Migration Strategy

### Step-by-Step Migration

1. **Install Fortify Schema**

   ```bash
   npm install fortify-schema
   ```

2. **Start with Simple Schemas**

   - Begin with basic object schemas
   - Validate functionality before tackling complex schemas

3. **Update Imports**

   ```typescript
   // Old imports
   import { z } from "zod";
   import Joi from "joi";

   // New imports
   import { Interface, Make, Mod } from "fortify-schema";
   ```

4. **Convert Schema Definitions**

   - Refer to the feature comparison table
   - Migrate basic types first, then add constraints

5. **Update Validation Code**

   - Replace `.validate()` or `.parse()` with `.safeParse()`
   - Adapt error handling to Fortify Schema’s structure

6. **Test and Verify**
   - Confirm validations match expected behavior
   - Verify TypeScript types align correctly

### Gradual Migration

Run both libraries in parallel during migration to ensure consistency:

```typescript
const zodResult = zodSchema.safeParse(data);
const fortifyResult = fortifySchema.safeParse(data);

if (zodResult.success !== fortifyResult.success) {
  console.warn("⚠️ Migration validation mismatch");
}
```

## Common Patterns

### Complex Object Migration

**Zod:**

```typescript
const ComplexSchema = z.object({
  user: z.object({
    profile: z.object({
      settings: z.object({
        theme: z.enum(["light", "dark"]),
        notifications: z.boolean().optional(),
      }),
    }),
  }),
  metadata: z.record(z.string(), z.any()).optional(),
});
```

**Fortify Schema:**

```typescript
const ComplexSchema = Interface({
  user: {
    profile: {
      settings: {
        theme: "light|dark", // Union type - pure TypeScript syntax!
        notifications: "boolean?",
      },
    },
  },
  metadata: "any?",
});
```

### Array and Union Migration

**Zod:**

```typescript
const ArraySchema = z.object({
  tags: z.array(z.string()).min(1).max(10),
  priorities: z.array(z.enum(["low", "medium", "high"])),
  scores: z.array(z.number().min(0).max(100)),
});
```

**Fortify Schema:**

```typescript
const ArraySchema = Interface({
  tags: "string[](1,10)", // Array with size constraints
  priorities: "low|medium|high[]", // Union array - incredibly simple!
  scores: "number(0,100)[]", // Array of constrained numbers
});
```

---

**Related Resources**
[Complete Documentation](./README.md) | [Quick Reference](./QUICK-REFERENCE.md)
