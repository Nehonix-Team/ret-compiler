# Fortify Schema - Migration Guide

This guide provides step-by-step instructions for migrating from popular schema validation libraries (Zod, Joi, Yup) to Fortify Schema, with clear examples and best practices.

## From Zod

### Basic Schema Migration

**Zod:**
```typescript
import { z } from 'zod';

const UserSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email(),
  name: z.string().min(2).max(50),
  age: z.number().int().min(18).max(120).optional(),
  tags: z.array(z.string()).min(1).max(10).optional(),
  status: z.enum(["active", "inactive", "pending"]),
  role: z.literal("admin")
});
```

**Fortify Schema:**
```typescript
import { Interface, Make } from 'fortify-schema';

const UserSchema = Interface({
  id: "positive",                               // Positive integer
  email: "email",                               // Email format
  name: "string(2,50)",                         // String with length constraints
  age: "int(18,120)?",                          // Optional integer with range
  tags: "string[](1,10)?",                      // Optional array with size constraints
  status: Make.union("active", "inactive", "pending"), // Union type
  role: Make.const("admin")                     // Constant value
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
  metadata: z.record(z.string(), z.any()).optional()
});

const PublicProductSchema = ProductSchema.omit({ metadata: true });
const PartialProductSchema = ProductSchema.partial();
```

**Fortify Schema:**
```typescript
const ProductSchema = Interface({
  id: "uuid",                                   // UUID format
  price: "number(0.01,)",                       // Positive number with minimum
  category: Make.union("electronics", "clothing"), // Union type
  images: "url[](1,5)",                         // Array of URLs with size constraints
  metadata: "any?"                              // Optional any type
});

const PublicProductSchema = Mod.omit(ProductSchema, ["metadata"]);
const PartialProductSchema = Mod.partial(ProductSchema);
```

### Validation Migration

**Zod:**
```typescript
try {
  const user = UserSchema.parse(userData);
  console.log('Valid:', user);
} catch (error) {
  console.log('Invalid:', error.errors);
}

const result = UserSchema.safeParse(userData);
if (result.success) {
  console.log('Valid:', result.data);
} else {
  console.log('Errors:', result.error.errors);
}
```

**Fortify Schema:**
```typescript
const result = UserSchema.safeParse(userData);
if (result.success) {
  console.log('✓ Valid:', result.data);
} else {
  console.log('✗ Errors:', result.errors);      // Simplified error structure
}

try {
  const user = UserSchema.parse(userData);
  console.log('✓ Valid:', user);
} catch (error) {
  console.log('✗ Invalid:', error.message);
}
```

## From Joi

### Basic Schema Migration

**Joi:**
```typescript
import Joi from 'joi';

const UserSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
  email: Joi.string().email().required(),
  name: Joi.string().min(2).max(50).required(),
  age: Joi.number().integer().min(18).max(120).optional(),
  tags: Joi.array().items(Joi.string()).min(1).max(10).optional(),
  status: Joi.string().valid('active', 'inactive', 'pending').required(),
  role: Joi.string().valid('admin').required()
});
```

**Fortify Schema:**
```typescript
import { Interface, Make } from 'fortify-schema';

const UserSchema = Interface({
  id: "positive",                               // Positive integer
  email: "email",                               // Email format
  name: "string(2,50)",                         // String with length constraints
  age: "int(18,120)?",                          // Optional integer with range
  tags: "string[](1,10)?",                      // Optional array with size constraints
  status: Make.union("active", "inactive", "pending"), // Union type
  role: Make.const("admin")                     // Constant value
});
```

### Validation Migration

**Joi:**
```typescript
const { error, value } = UserSchema.validate(userData);
if (error) {
  console.log('✗ Validation failed:', error.details);
} else {
  console.log('✓ Valid data:', value);
}
```

**Fortify Schema:**
```typescript
const result = UserSchema.safeParse(userData);
if (result.success) {
  console.log('✓ Valid data:', result.data);
} else {
  console.log('✗ Validation failed:', result.errors);
}
```

## From Yup

### Basic Schema Migration

**Yup:**
```typescript
import * as yup from 'yup';

const UserSchema = yup.object({
  id: yup.number().positive().integer().required(),
  email: yup.string().email().required(),
  name: yup.string().min(2).max(50).required(),
  age: yup.number().integer().min(18).max(120).optional(),
  status: yup.string().oneOf(['active', 'inactive']).required()
});
```

**Fortify Schema:**
```typescript
import { Interface, Make } from 'fortify-schema';

const UserSchema = Interface({
  id: "positive",                               // Positive integer
  email: "email",                               // Email format
  name: "string(2,50)",                         // String with length constraints
  age: "int(18,120)?",                          // Optional integer with range
  status: Make.union("active", "inactive")      // Union type
});
```

## Feature Comparison

| Feature | Zod | Joi | Yup | Fortify Schema |
|---------|-----|-----|-----|----------------|
| **Positive Integer** | `z.number().int().positive()` | `Joi.number().integer().positive()` | `yup.number().positive().integer()` | `"positive"` |
| **String Length** | `z.string().min(3).max(20)` | `Joi.string().min(3).max(20)` | `yup.string().min(3).max(20)` | `"string(3,20)"` |
| **Optional Field** | `z.string().optional()` | `Joi.string().optional()` | `yup.string().optional()` | `"string?"` |
| **Array Size** | `z.array(z.string()).min(1).max(10)` | `Joi.array().items(Joi.string()).min(1).max(10)` | `yup.array().of(yup.string()).min(1).max(10)` | `"string[](1,10)"` |
| **Union Types** | `z.enum(["a", "b"])` | `Joi.string().valid("a", "b")` | `yup.string().oneOf(["a", "b"])` | `Make.union("a", "b")` |
| **Email** | `z.string().email()` | `Joi.string().email()` | `yup.string().email()` | `"email"` |

## Migration Benefits

### Why Choose Fortify Schema?

1. **Concise Syntax**
   - Reduces schema definition code significantly
   - Familiar TypeScript-like syntax
   - Intuitive for TypeScript developers

2. **Improved Type Inference**
   - Precise literal types
   - Automatic handling of optional fields
   - Enhanced compile-time type safety

3. **Streamlined API**
   - Consistent constraint syntax
   - Simplified transformation utilities
   - Clearer error messages

4. **Performance**
   - Smaller bundle size
   - Faster validation
   - Tree-shakable for optimized builds

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
   import { z } from 'zod';
   import Joi from 'joi';
   
   // New imports
   import { Interface, Make, Mod } from 'fortify-schema';
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
  console.warn('⚠️ Migration validation mismatch');
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
        theme: z.enum(['light', 'dark']),
        notifications: z.boolean().optional()
      })
    })
  }),
  metadata: z.record(z.string(), z.any()).optional()
});
```

**Fortify Schema:**
```typescript
const ComplexSchema = Interface({
  user: {
    profile: {
      settings: {
        theme: Make.union('light', 'dark'),
        notifications: "boolean?"
      }
    }
  },
  metadata: "any?"
});
```

### Array and Union Migration

**Zod:**
```typescript
const ArraySchema = z.object({
  tags: z.array(z.string()).min(1).max(10),
  priorities: z.array(z.enum(['low', 'medium', 'high'])),
  scores: z.array(z.number().min(0).max(100))
});
```

**Fortify Schema:**
```typescript
const ArraySchema = Interface({
  tags: "string[](1,10)",                       // Array with size constraints
  priorities: Make.union('low', 'medium', 'high').array(), // Union array
  scores: "number(0,100)[]"                     // Array of constrained numbers
});
```

---

**Related Resources**  
[Complete Documentation](./README.md) | [Quick Reference](./QUICK-REFERENCE.md)