# Fortify Schema

[![npm version](https://badge.fury.io/js/fortify-schema.svg)](https://badge.fury.io/js/fortify-schema)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![Build Status](https://github.com/Nehonix-Team/fortify-schema/workflows/CI/badge.svg)](https://github.com/Nehonix-Team/fortify-schema/actions)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/fortify-schema)](https://bundlephobia.com/package/fortify-schema)
[![VS Code Extension](https://img.shields.io/badge/VS%20Code-Extension%20Available-blue)](https://sdk.nehonix.space/pkgs/mods/vscode/latest/fortify-schema.vsix)

<div align="center">
  <img src="https://sdk.nehonix.space/sdks/assets/fortify%20schema.jpg" alt="Fortify Schema Logo" width="250" />
</div>

<div align="center">
  <img src="https://sdk.nehonix.space/sdks/assets/vscode-extension-preview.gif" alt="VSCode extension preview" width="500" />
</div>

**TypeScript Schema Validation with Interface-Like Syntax**

A modern TypeScript validation library designed around familiar interface syntax and powerful conditional validation. Experience schema validation that feels natural to TypeScript developers while unlocking advanced runtime validation capabilities.

## Our Vision

**Interface-Native Validation**: We believe schema validation should feel as intuitive as writing TypeScript interfaces. Fortify Schema bridges the gap between type definitions and runtime validation.

## Quick Start

```bash
npm install fortify-schema
```

```typescript
import { Interface } from "fortify-schema";

// Define schemas with familiar TypeScript-like syntax
const UserSchema = Interface({
  id: "uuid",
  email: "email",
  name: "string(2,50)",
  age: "number(18,120)?",
  role: "admin|user|guest",

  // Advanced conditional validation based on runtime properties
  permissions: "when config.hasPermissions.$exists() *? string[] : =[]",
  adminTools: "when role=admin *? boolean : =false",
});

// Validate with complete TypeScript inference
const result = UserSchema.safeParse(userData);
if (result.success) {
  console.log("Valid user:", result.data); // Fully typed!
} else {
  console.log("Validation errors:", result.errors);
}
```

## Table of Contents

- [Installation & Setup](#installation--setup)
- [Core Features](#core-features)
- [Conditional Validation](#conditional-validation)
- [Real-World Applications](#real-world-applications)
- [Performance Excellence](#performance-excellence)
- [Advanced Capabilities](#advanced-capabilities)
- [Developer Experience](#developer-experience)
- [API Reference](#api-reference)

## Installation & Setup

### Requirements

- **TypeScript 4.5+**
- **Node.js 14+**
- **VS Code** (recommended for enhanced development experience)

### Installation

```bash
# NPM
npm install fortify-schema

# Yarn
yarn add fortify-schema

# PNPM
pnpm add fortify-schema

# Bun
bun add fortify-schema
```

### VS Code Extension

Enhance your development workflow with our dedicated VS Code extension featuring syntax highlighting and intelligent IntelliSense:

```bash
# Download and install
curl https://sdk.nehonix.space/pkgs/mods/vscode/latest/fortify-schema.vsix -o fortify-schema.vsix
code --install-extension fortify-schema.vsix
```

## Core Features

### Intuitive Schema Definition

```typescript
import { Interface } from "fortify-schema";

const ProductSchema = Interface({
  id: "uuid",
  name: "string(1,100)",
  price: "number(0.01,99999.99)",
  category: "electronics|books|clothing|home",
  inStock: "boolean",
  tags: "string[]?",
  description: "string(,500)?",
  createdAt: "date",
});

// Usage with full type safety
const product = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  name: "Wireless Headphones",
  price: 99.99,
  category: "electronics",
  inStock: true,
  tags: ["wireless", "audio", "bluetooth"],
  createdAt: new Date(),
};

const result = ProductSchema.safeParse(product);
console.log(result.success); // true
console.log(result.data); // Fully typed product data
```

### Comprehensive Type Support

```typescript
const ComprehensiveSchema = Interface({
  // Fundamental types
  name: "string",
  age: "number",
  active: "boolean",
  birthday: "date",

  // Optional fields
  nickname: "string?",
  bio: "string?",

  // Constraint validation
  username: "string(3,20)", // 3-20 characters
  password: "string(8,)", // Minimum 8 characters
  score: "number(0,100)", // Range 0-100

  // Format validation
  email: "email",
  website: "url",
  secureApi: "url.https", // HTTPS-only validation
  devServer: "url.dev", // Development mode (allows localhost)
  phone: "phone",
  userId: "uuid",

  // Array validation
  tags: "string[]", // Required array
  scores: "number[]?", // Optional array
  limitedTags: "string[](1,5)", // 1-5 items

  // Union types
  status: "active|inactive|pending",
  role: "user|admin|moderator",

  // Literal values
  version: "2.0",
  type: "user",
});
```

### Deep Object Validation

```typescript
const UserProfileSchema = Interface({
  user: {
    id: "uuid",
    email: "email",
    profile: {
      firstName: "string(1,50)",
      lastName: "string(1,50)",
      avatar: "url?",
      preferences: {
        theme: "light|dark|auto",
        language: "string(/^[a-z]{2}$/)",
        notifications: "boolean",
      },
    },
  },
  metadata: {
    createdAt: "date",
    lastLogin: "date?",
    loginCount: "number(0,)",
  },
});
```

## Conditional Validation

Fortify Schema's standout feature: advanced conditional validation based on runtime properties and business logic.

```typescript
const SmartUserSchema = Interface({
  // Runtime context objects
  config: "any?",
  user: "any?",
  features: "any?",

  // Core user data
  id: "uuid",
  email: "email",
  role: "admin|user|guest",

  // Dynamic validation based on runtime state
  hasPermissions: "when config.permissions.$exists() *? boolean : =false",
  hasProfile: "when user.profile.$exists() *? boolean : =false",
  isListEmpty: "when config.items.$empty() *? boolean : =true",
  hasAdminRole: "when user.roles.$contains(admin) *? boolean : =false",

  // Smart default values
  defaultTags: 'when config.tags.$exists() *? string[] : =["default","user"]',
  defaultSettings:
    'when config.theme.$exists() *? any : ={"mode":"light","lang":"en"}',

  // Deep property access
  advancedFeature:
    "when user.profile.settings.advanced.$exists() *? boolean : =false",

  // Complex business rules
  isValidUser:
    "when user.email.$exists() && user.verified.$exists() *? boolean : =false",
});
```

### Runtime Validation Methods

```typescript
const RuntimeMethodsSchema = Interface({
  data: "any?",

  // Property existence checking
  hasData: "when data.field.$exists() *? boolean : =false",

  // Empty state validation
  isEmpty: "when data.list.$empty() *? boolean : =true",

  // Null checking
  isNull: "when data.value.$null() *? boolean : =false",

  // String pattern matching
  containsText:
    "when data.description.$contains(important) *? boolean : =false",
  startsWithPrefix: "when data.code.$startsWith(PRE) *? boolean : =false",
  endsWithSuffix: "when data.filename.$endsWith(.pdf) *? boolean : =false",

  // Numeric range validation
  inRange: "when data.score.$between(0,100) *? boolean : =false",

  // Value inclusion testing
  isValidStatus:
    "when data.status.$in(active,pending,inactive) *? boolean : =false",
});
```

## Real-World Applications

### E-Commerce Product Management

```typescript
const ECommerceProductSchema = Interface({
  // Product identification
  id: "uuid",
  sku: "string(/^[A-Z0-9-]{8,20}$/)",
  name: "string(1,200)",
  slug: "string(/^[a-z0-9-]+$/)",

  // Pricing structure
  price: "number(0.01,999999.99)",
  compareAtPrice: "number(0.01,999999.99)?",
  cost: "number(0,999999.99)?",

  // Inventory management
  inventory: {
    quantity: "number(0,)",
    trackQuantity: "boolean",
    allowBackorder: "boolean",
    lowStockThreshold: "number(0,)?"
  },

  // Content management
  description: "string(,5000)?",
  shortDescription: "string(,500)?",
  category: "electronics|clothing|books|home|sports|beauty",
  tags: "string[](0,20)",

  // Media assets
  images: {
    primary: "url",
    gallery: "url[](0,10)",
    alt: "string(,100)?"
  }?,

  // SEO optimization
  seo: {
    title: "string(,60)?",
    description: "string(,160)?",
    keywords: "string[](0,10)"
  }?,

  // Business logic with conditional validation
  config: "any?",

  // Product type-specific requirements
  shipping: "when config.isDigital.$exists() *? any? : ={weight:0,dimensions:{}}",
  subscription: "when config.isSubscription.$exists() *? any : =null",
  variants: "when config.hasVariants.$exists() *? any[] : =[]",

  // Publication workflow
  status: "draft|active|archived",
  publishedAt: "date?",
  createdAt: "date",
  updatedAt: "date"
});
```

## Performance Excellence

Fortify Schema is engineered for high-performance validation with multiple optimization strategies:

### Performance Architecture

```typescript
// Built-in performance optimizations
const performanceFeatures = {
  // Schema compilation
  precompilation: "Schemas optimized at creation time",
  caching: "Intelligent caching for union types and constraints",

  // Memory management
  memoryOptimized: "Minimal runtime overhead per validation",
  zeroAllocation: "Hot paths avoid unnecessary object creation",

  // Validation efficiency
  earlyTermination: "Fast-fail validation on first error",
  typeSpecialization: "Optimized validation paths per data type",
};
```

### Benchmark Highlights

Our continuous performance monitoring shows excellent results across all validation scenarios:

- **High Throughput**: Millions of operations per second for common validation patterns
- **Consistent Performance**: Low variation in execution times
- **Memory Efficient**: Minimal memory overhead per schema instance
- **Scalable**: Performance scales predictably with data complexity

### Performance Testing

Validate performance on your specific use cases:

```bash
# Run comprehensive benchmarks
bun run scripts/benchmark.js

```

View detailed [benchmark results](./src/bench/BENCHMARK-RESULTS.md) for comprehensive performance analysis.

## Advanced Capabilities

### Schema Transformation

```typescript
import { Mod } from "fortify-schema";

const BaseUserSchema = Interface({
  id: "uuid",
  email: "email",
  name: "string",
  password: "string",
  role: "user|admin",
  createdAt: "date",
});

// Powerful schema transformations
const PublicUserSchema = Mod.omit(BaseUserSchema, ["password"]);
const PartialUserSchema = Mod.partial(BaseUserSchema);
const RequiredUserSchema = Mod.required(PartialUserSchema);
const ExtendedUserSchema = Mod.extend(BaseUserSchema, {
  lastLogin: "date?",
  preferences: {
    theme: "light|dark",
    notifications: "boolean",
  },
});
```

### Comprehensive Error Handling

```typescript
const result = UserSchema.safeParse(invalidData);

if (!result.success) {
  // Rich error information for debugging
  result.errors.forEach((error) => {
    console.log(`Field: ${error.path.join(".")}`);
    console.log(`Message: ${error.message}`);
    console.log(`Code: ${error.code}`);
    console.log(`Expected: ${error.expected}`);
    console.log(`Received: ${error.received}`);
  });
}

// Exception-based validation
try {
  const data = UserSchema.parse(userData);
  // Process validated data
} catch (error) {
  if (error instanceof ValidationError) {
    console.log("Validation failed:", error.errors);
  }
}
```

## Developer Experience

### VS Code Extension Features

Our dedicated VS Code extension transforms your development experience:

- **Intelligent Syntax Highlighting** for schema definitions
- **Advanced IntelliSense** with type and method completion
- **Real-time Validation** with inline error detection
- **Rich Hover Documentation** for all types and methods
- **Multiple Theme Support** for different coding preferences

```typescript
const UserSchema = Interface({
  // IntelliSense provides comprehensive type suggestions
  email: "email", // Hover documentation explains validation rules

  // Smart constraint completion
  name: "string(2,50)", // Auto-suggests constraint syntax patterns

  // Conditional method IntelliSense
  hasProfile: "when user.profile.$exists() *? boolean : =false",
  //                            ^ Shows all 8 available runtime methods
});
```

## What Sets Fortify Schema Apart

### Design Philosophy

- **Developer-Centric**: Built around familiar TypeScript patterns and conventions
- **Interface Syntax**: Schema definitions that feel like native TypeScript interfaces
- **Conditional Intelligence**: Advanced runtime validation based on dynamic properties
- **Performance Focused**: Optimized for high-throughput production applications
- **Tooling Excellence**: Professional-grade development tools and IDE integration
- **Type Safety**: Complete TypeScript inference and compile-time validation

### Key Strengths

- **Familiar Syntax**: Write schemas using TypeScript-like interface definitions
- **Advanced Conditionals**: Unique runtime property validation and business logic
- **Rich Tooling**: Dedicated VS Code extension with comprehensive development support
- **Type Integration**: Seamless TypeScript integration with full type inference
- **Production Ready**: Battle-tested with comprehensive error handling and debugging

### Community and Growth

We're building Fortify Schema with transparency and community feedback at its core. We welcome:

- **Real-world usage feedback** and performance insights
- **Issue reports** with detailed reproduction cases
- **Feature requests** based on practical development needs
- **Performance benchmarking** on diverse use cases
- **Constructive feedback** on API design and developer experience

## API Reference

### Core Validation Methods

#### `Interface(schema, options?)`

Creates a new schema instance with comprehensive validation rules.

```typescript
const UserSchema = Interface(
  {
    id: "uuid",
    name: "string",
  },
  {
    strict: true, // Reject extra properties
    loose: false, // Disable automatic type coercion
    allowUnknown: false, // Reject unknown properties
  }
);
```

#### `schema.parse(data)`

Synchronous validation that returns validated data or throws detailed errors.

```typescript
try {
  const user = UserSchema.parse(userData);
  // user is fully typed and validated
} catch (error) {
  console.error(error.errors);
}
```

#### `schema.safeParse(data)`

Safe validation that returns a result object without throwing exceptions.

```typescript
const result = UserSchema.safeParse(userData);
if (result.success) {
  console.log(result.data); // Fully typed and validated
} else {
  console.error(result.errors); // Detailed validation errors
}
```

#### `schema.safeParseUnknown(data)`

Safe validation for unknown data types, ideal for testing and debugging.

```typescript
const result = UserSchema.safeParseUnknown(unknownData);
// Same return type as safeParse() but accepts any input type
```

#### `schema.parseAsync(data)`

Asynchronous validation with promise-based error handling.

```typescript
try {
  const user = await UserSchema.parseAsync(userData);
  console.log("Valid user:", user);
} catch (error) {
  console.error("Validation failed:", error.message);
}
```

#### `schema.safeParseAsync(data)`

Asynchronous safe validation that never throws exceptions.

```typescript
const result = await UserSchema.safeParseAsync(userData);
if (result.success) {
  console.log("Valid user:", result.data);
} else {
  console.error("Validation errors:", result.errors);
}
```

#### `schema.safeParseUnknownAsync(data)`

Asynchronous safe validation for unknown data types.

```typescript
const result = await UserSchema.safeParseUnknownAsync(unknownData);
if (result.success) {
  console.log("Valid data:", result.data);
} else {
  console.error("Validation errors:", result.errors);
}
```

### Schema Transformation Operations

#### `Mod.partial(schema)` - Optional Fields

```typescript
const PartialUserSchema = Mod.partial(UserSchema);
// Converts all fields to optional
```

#### `Mod.required(schema)` - Required Fields

```typescript
const RequiredUserSchema = Mod.required(PartialUserSchema);
// Makes all fields required
```

#### `Mod.pick(schema, keys)` - Field Selection

```typescript
const PublicUserSchema = Mod.pick(UserSchema, ["id", "name", "email"]);
// Creates schema with only specified fields
```

#### `Mod.omit(schema, keys)` - Field Exclusion

```typescript
const SafeUserSchema = Mod.omit(UserSchema, ["password", "internalId"]);
// Creates schema excluding specified fields
```

#### `Mod.extend(schema, extension)` - Schema Extension

```typescript
const ExtendedUserSchema = Mod.extend(UserSchema, {
  lastLogin: "date?",
  preferences: {
    theme: "light|dark",
  },
});
```

#### `Mod.merge(schema1, schema2)` - Schema Merging

```typescript
const CombinedSchema = Mod.merge(UserSchema, ProfileSchema);
// Combines two schemas into one
```

### Validation Configuration

#### Method Chaining

```typescript
const FlexibleSchema = UserSchema.loose() // Enable automatic type coercion
  .allowUnknown() // Accept extra properties
  .min(1) // Set minimum constraints
  .max(100) // Set maximum constraints
  .unique() // Require unique array values
  .pattern(/^[A-Z]/) // Apply regex pattern validation
  .default("N/A"); // Set default value
```

## Contributing

### Development Environment

```bash
# Repository setup
git clone https://github.com/Nehonix-Team/fortify-schema.git
cd fortify-schema

# Dependency installation
npm install

# Test suite execution
npm run test

# Performance benchmarking
npm run benchmark

# Project build
npm run build
```

### Quality Standards

- **TypeScript**: Strict mode with comprehensive type checking
- **Test Coverage**: 95%+ coverage requirement
- **Performance**: All benchmarks must pass performance thresholds
- **Documentation**: Complete JSDoc comments for all public APIs
- **Code Quality**: ESLint and Prettier configuration compliance

### Contribution Process

1. **Fork** the repository on GitHub
2. **Create** a feature branch: `git checkout -b feature/enhancement-name`
3. **Implement** changes with comprehensive test coverage
4. **Verify** all tests pass: `npm test`
5. **Validate** performance: `npm run benchmark`
6. **Commit** changes: `git commit -m 'Add enhancement: description'`
7. **Push** to branch: `git push origin feature/enhancement-name`
8. **Submit** a Pull Request with detailed description

### Issue Reporting

For effective issue resolution, please provide:

- **Environment Details**: Fortify Schema, TypeScript, and Node.js versions
- **Reproduction Case**: Minimal code example demonstrating the issue
- **Expected Behavior**: Clear description of intended functionality
- **Actual Behavior**: Detailed explanation of observed behavior
- **Error Information**: Complete error messages and stack traces

## Release History

See [CHANGELOG.md](./CHANGELOG.md) for comprehensive release notes and migration guides.

## License

MIT License - see [LICENSE](./LICENSE) file for complete terms.

## Support Resources

- **Complete Documentation**: [Full documentation](./docs/)
- **Example Applications**: [Example repository](./examples/)
- **Issue Tracking**: [GitHub Issues](https://github.com/Nehonix-Team/fortify-schema/issues)
- **Community Discussions**: [GitHub Discussions](https://github.com/Nehonix-Team/fortify-schema/discussions)

---

**Development Status**: Fortify Schema is in active development with a focus on production readiness. We maintain transparency about capabilities and limitations while continuously improving based on community feedback and real-world usage patterns.

<div align="center">
  <p><strong>Built by Nehonix</strong></p>
  <p>
    <a href="https://nehonix.space">Website</a> •
    <a href="https://sdk.nehonix.space">SDK</a> •
    <a href="https://github.com/Nehonix-Team">GitHub</a>
  </p>
</div>
