# Fortify Schema

[![npm version](https://badge.fury.io/js/fortify-schema.svg)](https://badge.fury.io/js/fortify-schema)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![Build Status](https://github.com/Nehonix-Team/fortify-schema/workflows/CI/badge.svg)](https://github.com/Nehonix-Team/fortify-schema/actions)

**Experimental TypeScript-first validation with interface-like syntax**

Fortify Schema explores new approaches to schema validation by treating schemas as TypeScript interfaces with runtime validation. This is an experimental library focused on developer experience improvements and conditional validation patterns.

## Project Status & Recommendations

**🧪 Experimental Status**
- **For Production**: Use [Zod](https://zod.dev), [Joi](https://joi.dev), or [Yup](https://github.com/jquense/yup) - they're battle-tested with strong ecosystems
- **For Exploration**: Try Fortify Schema in side projects to experiment with interface-like syntax and conditional validation
- **For Learning**: Great for understanding different approaches to schema design and TypeScript integration

**When to Consider Fortify Schema:**
- Prototyping new validation approaches
- Exploring conditional validation patterns
- Educational projects and experimentation
- Teams comfortable with bleeding-edge tools

**When to Use Established Libraries:**
- Production applications
- Team projects requiring stability
- Large codebases with long-term maintenance
- Projects needing extensive community support

## Core Innovation: Interface-Like Syntax

Instead of method chaining, define schemas like TypeScript interfaces:

```typescript
// Traditional approach (Zod)
const UserSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email(),
  name: z.string().min(2).max(50),
  age: z.number().int().min(18).optional(),
  role: z.enum(["admin", "user"])
});

// Fortify Schema approach
const UserSchema = Interface({
  id: "positive",
  email: "email", 
  name: "string(2,50)",
  age: "int(18,)?",
  role: "admin|user"
});
```

**Benefits of this approach:**
- Familiar syntax for TypeScript developers
- More concise for simple validations
- Reduces cognitive load for basic schemas

**Trade-offs:**
- String parsing vs explicit API calls
- Less IDE support for schema definition
- Newer, less documented approach

## Conditional Validation Research

Our main research focus is conditional validation with TypeScript inference:

```typescript
const EnterpriseSchema = Interface({
  role: "admin|manager|user",
  accountType: "enterprise|standard|trial",
  
  // Conditional fields based on role and account type
  permissions: "when role=admin *? string[] : string[]?",
  maxProjects: "when accountType=trial *? int(1,3) : int(1,)",
  adminTools: "when role.in(admin,manager) *? string[] : =[]"
});

// TypeScript understands conditional types
const result = EnterpriseSchema.safeParse(data);
if (result.success) {
  // TypeScript knows permissions is string[] for admin, string[]? for others
  // TypeScript knows maxProjects has different ranges based on accountType
}
```

This explores patterns that could potentially influence future schema library designs.

## Installation & Quick Start

```bash
npm install fortify-schema
```

```typescript
import { Interface } from "fortify-schema";

const UserSchema = Interface({
  id: "number",
  email: "email",
  name: "string(2,50)",
  age: "number?",
  role: "user|admin"
});

const result = UserSchema.safeParse(userData);
if (result.success) {
  console.log("Valid:", result.data);
} else {
  console.log("Errors:", result.errors);
}
```

## Documentation & Examples

| Resource | Description |
|----------|-------------|
| [Complete Documentation](./docs/README.md) | Full API reference and guides |
| [Conditional Validation Guide](./docs/CONDITIONAL_VALIDATION.md) | Advanced conditional patterns |
| [Migration Examples](./docs/MIGRATION.md) | Compare with Zod, Joi, Yup |
| [Production Considerations](./docs/PRODUCTION.md) | When and how to evaluate this library |

## Core Features

### Interface-Like Schema Definition
```typescript
{
  name: "string",           // Basic types
  age: "number(18,120)?",   // Constraints with optional
  tags: "string[](1,10)",   // Array constraints  
  status: "active|pending", // Union types
  role: "=admin"            // Literal constants
}
```

### Advanced Type Constraints
```typescript
{
  email: "email",                    // Format validation
  phone: "string(/^\\+?[1-9]\\d+$/)", // Regex patterns
  score: "number(0,100)",            // Numeric ranges
  items: "string[](1,5)"             // Array size limits
}
```

### Experimental Conditional Validation
```typescript
{
  userType: "free|premium|enterprise",
  
  // Different validation based on user type
  features: "when userType=free *? string[](,3) : string[]",
  support: "when userType.in(premium,enterprise) *? string : string?",
  customDomain: "when userType=enterprise *? url : url?"
}
```

## Schema Transformation
```typescript
import { Mod } from "fortify-schema";

const BaseSchema = Interface({ id: "number", name: "string" });

// Transform schemas
const PublicSchema = Mod.omit(BaseSchema, ["id"]);
const PartialSchema = Mod.partial(BaseSchema);
const ExtendedSchema = Mod.extend(BaseSchema, {
  createdAt: "date",
  tags: "string[]?"
});
```

## Validation Modes

```typescript
// Strict mode (default) - exact type matching
const strict = UserSchema.safeParse(data);

// Loose mode - type coercion when possible
const loose = UserSchema.loose().safeParse(data);

// Unknown data - for external APIs
const unknown = UserSchema.safeParseUnknown(apiData);
```

## Research Areas

**Current Research Focus:**
1. **Conditional Validation Patterns** - How to express complex business rules in schemas
2. **TypeScript Integration** - Pushing the boundaries of compile-time type inference
3. **Developer Experience** - Balancing conciseness with clarity
4. **Migration Strategies** - How teams can adopt new validation patterns

**Open Questions:**
- Can string-based schema definitions scale to complex applications?
- How do conditional validation patterns perform at runtime?
- What's the optimal balance between magic and explicitness?

## Contributing to Research

We welcome contributions, especially:

- **Use Case Studies** - How does this work in real applications?
- **Performance Analysis** - Benchmarks against established libraries  
- **Pattern Exploration** - New conditional validation patterns
- **Migration Stories** - Experiences moving from other libraries

```bash
# Development setup
git clone https://github.com/Nehonix-Team/fortify-schema.git
npm install
npm test
```

## Comparison Philosophy

We're not trying to replace Zod, Joi, or Yup. Instead, we're exploring:

- **Different syntax approaches** - Interface-like vs method chaining
- **Conditional validation patterns** - How to handle complex business rules
- **TypeScript integration boundaries** - What's possible with modern TypeScript
- **Developer experience experiments** - New ways to think about validation

**Our recommendation:** Use established libraries for production, experiment with Fortify Schema to explore new patterns and potentially influence the future direction of validation libraries.

## Community & Support

- **Discussions**: [GitHub Discussions](https://github.com/Nehonix-Team/fortify-schema/discussions) - Share experiences and patterns
- **Issues**: [Bug Reports](https://github.com/Nehonix-Team/fortify-schema/issues) - Help improve the library
- **Research**: [Wiki](https://github.com/Nehonix-Team/fortify-schema/wiki) - Validation pattern research

## License

MIT © [Nehonix Team](https://github.com/Nehonix-Team)

---

*An experimental exploration of schema validation patterns - use established libraries for production applications*