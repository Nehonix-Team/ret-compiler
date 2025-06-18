# Migration Guide: From Fortify Schema to Zod

## When to Migrate

Fortify Schema is perfect for:
- ✅ Rapid prototyping and MVPs
- ✅ Learning TypeScript validation
- ✅ Educational projects
- ✅ Configuration validation
- ✅ Quick form validation

Consider migrating to Zod when:
- 🚀 Moving to production with a team
- 📈 Need extensive ecosystem support
- 🔧 Require complex validation features
- 🏢 Building enterprise applications
- 🔄 Need long-term maintenance

## Migration Strategy

### Phase 1: Preparation
1. **Document your schemas** - Use Fortify's auto-documentation
2. **Test coverage** - Ensure all validation is tested
3. **Identify patterns** - Note common validation patterns used

### Phase 2: Gradual Migration
1. **Start with new features** - Use Zod for new schemas
2. **Migrate critical paths** - Convert important validations first
3. **Keep both libraries** - Run them side by side during transition

### Phase 3: Complete Migration
1. **Convert remaining schemas** - Migrate all Fortify schemas
2. **Update tests** - Ensure all tests pass with Zod
3. **Remove Fortify** - Clean up dependencies

## Schema Conversion Examples

### Basic Types

**Fortify Schema:**
```typescript
import { Interface } from 'fortify-schema';

const UserSchema = Interface({
  id: "number",
  name: "string",
  email: "email",
  age: "number?",
  active: "boolean"
});
```

**Zod Equivalent:**
```typescript
import { z } from 'zod';

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  age: z.number().optional(),
  active: z.boolean()
});
```

### Constraints

**Fortify Schema:**
```typescript
const ProductSchema = Interface({
  name: "string(2,100)",
  price: "number(0.01,9999.99)",
  tags: "string[](1,10)",
  category: "electronics|books|clothing"
});
```

**Zod Equivalent:**
```typescript
const ProductSchema = z.object({
  name: z.string().min(2).max(100),
  price: z.number().min(0.01).max(9999.99),
  tags: z.array(z.string()).min(1).max(10),
  category: z.enum(["electronics", "books", "clothing"])
});
```

### Nested Objects

**Fortify Schema:**
```typescript
const OrderSchema = Interface({
  id: "uuid",
  customer: {
    name: "string",
    email: "email",
    address: {
      street: "string",
      city: "string",
      zipCode: "string(/^\\d{5}$/)"
    }
  },
  items: [{
    name: "string",
    price: "number",
    quantity: "int(1,)"
  }]
});
```

**Zod Equivalent:**
```typescript
const OrderSchema = z.object({
  id: z.string().uuid(),
  customer: z.object({
    name: z.string(),
    email: z.string().email(),
    address: z.object({
      street: z.string(),
      city: z.string(),
      zipCode: z.string().regex(/^\d{5}$/)
    })
  }),
  items: z.array(z.object({
    name: z.string(),
    price: z.number(),
    quantity: z.number().int().min(1)
  }))
});
```

## Validation Method Migration

### Parse Methods

**Fortify Schema:**
```typescript
// Safe parsing
const result = UserSchema.safeParse(data);
if (result.success) {
  console.log(result.data);
} else {
  console.log(result.errors);
}

// Throwing parse
try {
  const user = UserSchema.parse(data);
} catch (error) {
  console.error(error.message);
}
```

**Zod Equivalent:**
```typescript
// Safe parsing
const result = UserSchema.safeParse(data);
if (result.success) {
  console.log(result.data);
} else {
  console.log(result.error.issues);
}

// Throwing parse
try {
  const user = UserSchema.parse(data);
} catch (error) {
  console.error(error.message);
}
```

## Migration Tools

### Automated Conversion Script

```typescript
// migration-helper.ts
import { Interface } from 'fortify-schema';

/**
 * Helper to generate Zod equivalent from Fortify schema
 */
export function generateZodEquivalent(fortifySchema: any): string {
  // This would analyze the Fortify schema and generate Zod code
  // Implementation would parse the schema definition and output Zod syntax
  
  return `
// Generated Zod schema from Fortify Schema
import { z } from 'zod';

const Schema = z.object({
  // ... converted fields
});
`;
}
```

### Side-by-Side Testing

```typescript
// test-migration.ts
import { Interface } from 'fortify-schema';
import { z } from 'zod';

// Original Fortify schema
const FortifySchema = Interface({
  name: "string(2,50)",
  age: "number(18,120)"
});

// Migrated Zod schema
const ZodSchema = z.object({
  name: z.string().min(2).max(50),
  age: z.number().min(18).max(120)
});

// Test both schemas with same data
const testData = { name: "John", age: 25 };

const fortifyResult = FortifySchema.safeParse(testData);
const zodResult = ZodSchema.safeParse(testData);

console.log('Fortify result:', fortifyResult);
console.log('Zod result:', zodResult);
console.log('Results match:', fortifyResult.success === zodResult.success);
```

## Best Practices for Migration

### 1. Maintain Type Safety
```typescript
// Use TypeScript to ensure type compatibility
type UserType = z.infer<typeof ZodUserSchema>;
// Should match the original Fortify schema type
```

### 2. Preserve Validation Logic
```typescript
// Ensure all validation rules are preserved
// Test edge cases that worked in Fortify
```

### 3. Update Error Handling
```typescript
// Zod has different error structure
const handleZodErrors = (error: z.ZodError) => {
  return error.issues.map(issue => ({
    field: issue.path.join('.'),
    message: issue.message
  }));
};
```

## Timeline Recommendations

### Small Projects (< 10 schemas)
- **Week 1**: Convert all schemas
- **Week 2**: Update tests and error handling
- **Week 3**: Remove Fortify dependency

### Medium Projects (10-50 schemas)
- **Month 1**: Convert core schemas
- **Month 2**: Convert remaining schemas
- **Month 3**: Complete migration and cleanup

### Large Projects (50+ schemas)
- **Quarter 1**: Plan migration strategy
- **Quarter 2**: Migrate critical paths
- **Quarter 3**: Complete migration

## Support During Migration

### Community Resources
- Zod documentation: https://zod.dev
- Migration discussions: GitHub Issues
- Community examples: Real-world Zod schemas

### Fortify Schema Support
- Keep using Fortify for new prototypes
- Use educational tools to understand concepts
- Leverage quick patterns for reference

## Conclusion

Migration from Fortify Schema to Zod is straightforward because:
1. **Similar concepts** - Both use TypeScript-first validation
2. **Clear mapping** - Most Fortify patterns have direct Zod equivalents
3. **Gradual process** - Can migrate incrementally
4. **Learning value** - Fortify concepts transfer to Zod

Remember: Fortify Schema taught you validation concepts that make you a better Zod developer!
