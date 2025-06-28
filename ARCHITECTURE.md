# Fortify Schema Architecture

## Overview

Fortify Schema is a TypeScript-first validation library that provides an intuitive, type-safe way to define and validate data schemas. It combines the ease of use of string-based type definitions with the power of TypeScript's type system.

## Core Architecture

### Directory Structure

```
src/core/schema/
├── src/core/schema/
│   ├── mode/
│   │   └── interfaces/
│   │       ├── Interface.ts              # Main Interface class
│   │       ├── InterfaceSchema.ts        # Core validation logic
│   │       └── types/
│   │           ├── interface.type.ts     # Type inference system
│   │           └── operators/
│   │               ├── ConditionalOperators.ts  # Type-level operators
│   │               └── ConditionalResolver.ts   # Operator resolution
│   ├── extensions/
│   │   └── components/
│   │       └── ConditionalValidation/
│   │           ├── ConditionalBuilder.ts # Fluent API builder
│   │           └── utils/
│   │               └── SyntaxParser.ts   # Runtime syntax parsing
│   └── types/
│       ├── SchemaValidator.type.ts       # Core type definitions
│       └── types.ts                      # Validation result types
├── docs/                                 # Documentation
│   ├── VALIDATION-OPERATORS.md          # Operator reference
│   └── OPERATIONS-REFERENCE.md          # Operations guide
└── ARCHITECTURE.md                       # This file
```

## Core Components

### 1. Interface Class (`Interface.ts`)
The main entry point for creating schemas. Provides a fluent API for schema definition.

**Key Features:**
- TypeScript-like syntax: `Interface({ name: "string", age: "number" })`
- Type inference from schema definitions
- Integration with conditional validation

### 2. InterfaceSchema Class (`InterfaceSchema.ts`)
The core validation engine that processes data against schema definitions.

**Key Features:**
- Runtime validation of all supported types
- Constraint parsing and validation
- Conditional validation support
- Strict mode (TypeScript-like) by default
- Optional loose mode for type coercion

### 3. Type Inference System (`interface.type.ts`)
Advanced TypeScript type-level programming that provides compile-time type safety.

**Key Features:**
- 50+ base types with TypeScript mapping
- Union type parsing (`"string|number"`)
- Array type inference (`"string[]"`, `"number[]?"`)
- Record type inference (`"record<string,any>"`)
- Conditional type inference with multiple syntax formats
- Constraint type parsing (`"string(3,20)"`, `"number(0,100)"`)

### 4. Conditional Validation System
Multi-layered conditional validation with three syntax formats and full TypeScript support.

#### Components:
- **ConditionalOperators.ts**: Type-level operator definitions and evaluation
- **ConditionalResolver.ts**: Type constraint resolution and safety
- **ConditionalBuilder.ts**: Fluent API for programmatic conditions
- **SyntaxParser.ts**: Runtime parsing of conditional syntax

#### Syntax Formats:
2. **Parentheses**: `"when(role=admin) then(string[]) else(string[]?)"`
3. **Legacy**: `"when:role=admin:string[]:string[]?"`

## Type System

### Base Types (50 types)

#### Implemented ✅ (13+ types)
- **Primitives**: `string`, `number`, `int`, `positive`, `boolean`
- **Formats**: `email`, `url`, `uuid`, `phone`, `slug`, `username`
- **Objects**: `date`, `any`


### Operators (16+ operators)

#### Implemented ✅ (11 operators)
- **Comparison**: `=`, `!=`, `>`, `>=`, `<`, `<=`
- **Pattern**: `~` (regex)
- **Array**: `in`, `!in`
- **Existence**: `exists`, `!exists`


## Validation Flow

### 1. Schema Definition
```typescript
const userSchema = Interface({
  name: "string(3,50)",
  email: "email",
  age: "number(18,120)?",
  role: "admin|user|guest",
  permissions: "when role=admin *? string[] : string[]?"
});
```

### 2. Type Inference
TypeScript automatically infers the type:
```typescript
type User = {
  name: string;
  email: string;
  age?: number;
  role: "admin" | "user" | "guest";
  permissions: string[];
}
```

### 3. Runtime Validation
```typescript
const result = userSchema.safeParse(data);
if (result.success) {
  // result.data is fully typed as User
  console.log(result.data.name);
}
```

## Key Features

### 1. TypeScript-First Design
- Full type inference from string definitions
- Compile-time type checking
- IDE autocomplete and error detection

### 2. Multiple Validation Modes
- **Strict Mode** (default): TypeScript-like behavior, rejects unknown properties
- **Loose Mode**: Allows type coercion and unknown properties
- **Safe Parsing**: Returns result objects instead of throwing

### 3. Advanced Conditional Validation
- Multiple syntax formats for different preferences
- Full TypeScript type inference for conditional types
- Runtime evaluation with complete data context

### 4. Extensible Architecture
- Modular design allows easy addition of new types
- Plugin-based operator system
- Custom type registry support

### 5. Performance Optimizations
- Cached type lookups
- Optimized union parsing
- Reduced recursion depth in type inference


### 3. API Documentation
Schemas can be introspected to generate OpenAPI/Swagger documentation.

## Future Enhancements

### Planned Features
1. **Complete Type Coverage**: Implement all 50 base types
2. **Full Operator Support**: Implement all 16 conditional operators
3. **Schema Composition**: Advanced schema merging and extending
4. **Custom Validators**: Plugin system for domain-specific validation
5. **Performance Monitoring**: Built-in validation performance metrics
6. **Schema Migration**: Tools for evolving schemas over time

### Extension Points
1. **Custom Type Registry**: Add domain-specific types
2. **Custom Operators**: Add specialized conditional operators
3. **Validation Plugins**: Extend validation logic
4. **Serialization Formats**: Support for different data formats

## Best Practices

### 1. Schema Design
- Use descriptive field names
- Leverage TypeScript inference
- Prefer strict mode for APIs
- Use conditional validation for complex business logic

### 2. Performance
- Cache schema instances
- Use `safeParse` for user input
- Prefer specific types over `any`
- Use constraints to validate early

### 3. Error Handling
- Always check `result.success` before accessing data
- Provide meaningful error messages
- Use warnings for non-critical issues
- Log validation failures for debugging

### 4. Type Safety
- Let TypeScript infer types when possible
- Use conditional types for dynamic schemas
- Avoid `any` type unless necessary
- Leverage IDE features for development

## Contributing

### Adding New Types
1. Add type to `BaseTypeMap` in `interface.type.ts`
2. Implement validation logic in `InterfaceSchema.ts`
3. Add tests for the new type
4. Update documentation

### Adding New Operators
1. Add operator to `OperatorMap` in `interface.type.ts`
2. Add parsing logic in `SyntaxParser.ts`
3. Add evaluation logic in `ConditionalOperators.ts`
4. Add tests and documentation

### Testing
- Unit tests for all types and operators
- Integration tests for complex schemas
- Performance benchmarks for large schemas
- Type-level tests for TypeScript inference

---

*This architecture supports the vision of making schema validation as easy as TypeScript type definitions while maintaining full runtime safety and performance.*
