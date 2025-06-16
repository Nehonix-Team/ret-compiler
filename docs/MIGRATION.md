# Migration Guide to Fortify Schema

Step-by-step migration guides from popular schema validation libraries.

## 🔄 From Zod

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
  id: "positive",                               // Much cleaner!
  email: "email",
  name: "string(2,50)",
  age: "int(18,120)?",                         // Optional with constraints
  tags: "string[](1,10)?",                     // Array with size constraints
  status: Make.union("active", "inactive", "pending"),
  role: Make.const("admin")                    // Clear constant syntax
});
```

### Advanced Features Migration

**Zod:**
```typescript
// Complex validation
const ProductSchema = z.object({
  id: z.string().uuid(),
  price: z.number().positive().min(0.01),
  category: z.enum(["electronics", "clothing"]),
  images: z.array(z.string().url()).min(1).max(5),
  metadata: z.record(z.string(), z.any()).optional()
});

// Schema transformation
const PublicProductSchema = ProductSchema.omit({ metadata: true });
const PartialProductSchema = ProductSchema.partial();
```

**Fortify Schema:**
```typescript
// Much cleaner syntax
const ProductSchema = Interface({
  id: "uuid",
  price: "number(0.01,)",
  category: Make.union("electronics", "clothing"),
  images: "url[](1,5)",
  metadata: "any?"                             // Simple optional any type
});

// Cleaner transformations
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

// Or safe parse
const result = UserSchema.safeParse(userData);
if (result.success) {
  console.log('Valid:', result.data);
} else {
  console.log('Errors:', result.error.errors);
}
```

**Fortify Schema:**
```typescript
// Same API, better error handling
const result = UserSchema.safeParse(userData);
if (result.success) {
  console.log('Valid:', result.data);
} else {
  console.log('Errors:', result.errors);      // Cleaner error structure
}

// Throwing version
try {
  const user = UserSchema.parse(userData);
  console.log('Valid:', user);
} catch (error) {
  console.log('Invalid:', error.message);
}
```

## 🔄 From Joi

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
  id: "positive",                               // So much shorter!
  email: "email",
  name: "string(2,50)",
  age: "int(18,120)?",
  tags: "string[](1,10)?",
  status: Make.union("active", "inactive", "pending"),
  role: Make.const("admin")
});
```

### Validation Migration

**Joi:**
```typescript
const { error, value } = UserSchema.validate(userData);
if (error) {
  console.log('Validation failed:', error.details);
} else {
  console.log('Valid data:', value);
}
```

**Fortify Schema:**
```typescript
const result = UserSchema.safeParse(userData);
if (result.success) {
  console.log('Valid data:', result.data);
} else {
  console.log('Validation failed:', result.errors);
}
```

## 🔄 From Yup

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
  id: "positive",
  email: "email", 
  name: "string(2,50)",
  age: "int(18,120)?",
  status: Make.union("active", "inactive")
});
```

## 📊 Feature Comparison

| Feature | Zod | Joi | Yup | Fortify Schema |
|---------|-----|-----|-----|----------------|
| **Positive Integer** | `z.number().int().positive()` | `Joi.number().integer().positive()` | `yup.number().positive().integer()` | `"positive"` |
| **String Length** | `z.string().min(3).max(20)` | `Joi.string().min(3).max(20)` | `yup.string().min(3).max(20)` | `"string(3,20)"` |
| **Optional Field** | `z.string().optional()` | `Joi.string().optional()` | `yup.string().optional()` | `"string?"` |
| **Array Size** | `z.array(z.string()).min(1).max(10)` | `Joi.array().items(Joi.string()).min(1).max(10)` | `yup.array().of(yup.string()).min(1).max(10)` | `"string[](1,10)"` |
| **Union Types** | `z.enum(["a", "b"])` | `Joi.string().valid("a", "b")` | `yup.string().oneOf(["a", "b"])` | `Make.union("a", "b")` |
| **Email** | `z.string().email()` | `Joi.string().email()` | `yup.string().email()` | `"email"` |

## 🚀 Migration Benefits

### Why Switch to Fortify Schema?

1. **Dramatically Shorter Syntax**
   - 70% less code on average
   - TypeScript interface-like syntax
   - No learning curve for TS developers

2. **Better Type Inference**
   - Perfect literal types instead of generic unions
   - Automatic optional field handling
   - Compile-time safety

3. **Cleaner API**
   - Consistent constraint syntax
   - Intuitive transformation utilities
   - Better error messages

4. **Performance**
   - Smaller bundle size
   - Faster validation
   - Tree-shakable

## 🛠️ Migration Strategy

### Step-by-Step Migration

1. **Install Fortify Schema**
   ```bash
   npm install fortify-schema
   ```

2. **Start with Simple Schemas**
   - Migrate basic object schemas first
   - Test thoroughly before moving complex schemas

3. **Update Imports**
   ```typescript
   // Old
   import { z } from 'zod';
   import Joi from 'joi';
   
   // New
   import { Interface, Make, Mod } from 'fortify-schema';
   ```

4. **Convert Schema Definitions**
   - Use the comparison tables above
   - Start with basic types, then add constraints

5. **Update Validation Code**
   - Replace `.validate()` with `.safeParse()`
   - Update error handling logic

6. **Test & Verify**
   - Ensure all validations work as expected
   - Check TypeScript types are correct

### Gradual Migration

You can migrate gradually by running both libraries side by side:

```typescript
// During migration - validate with both
const zodResult = zodSchema.safeParse(data);
const fortifyResult = fortifySchema.safeParse(data);

// Compare results during development
if (zodResult.success !== fortifyResult.success) {
  console.warn('Migration validation mismatch!');
}
```

## 🎯 Common Patterns

### Complex Object Migration

**Before (Zod):**
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

**After (Fortify Schema):**
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

**Before:**
```typescript
const ArraySchema = z.object({
  tags: z.array(z.string()).min(1).max(10),
  priorities: z.array(z.enum(['low', 'medium', 'high'])),
  scores: z.array(z.number().min(0).max(100))
});
```

**After:**
```typescript
const ArraySchema = Interface({
  tags: "string[](1,10)",
  priorities: Make.union('low', 'medium', 'high').array(),
  scores: "number(0,100)[]"
});
```

---

**📖 [Back to Documentation](./README.md)** | **🚀 [Quick Reference](./QUICK-REFERENCE.md)**
