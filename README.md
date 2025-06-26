# Fortify Schema

[![npm version](https://badge.fury.io/js/fortify-schema.svg)](https://badge.fury.io/js/fortify-schema)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![Build Status](https://github.com/Nehonix-Team/fortify-schema/workflows/CI/badge.svg)](https://github.com/Nehonix-Team/fortify-schema/actions)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/fortify-schema)](https://bundlephobia.com/package/fortify-schema)
[![VS Code Extension](https://img.shields.io/badge/VS%20Code-Extension%20Available-blue)](https://sdk.nehonix.space/pkgs/mods/vscode/latest/fortify-schema.vsix)
[![Performance](https://img.shields.io/badge/Performance-258K%20ops%2Fsec-green)](./src/bench/BENCHMARK-RESULTS.md)

<div align="center">
  <img src="https://sdk.nehonix.space/sdks/assets/fortify%20schema.jpg" alt="Fortify Schema Logo" width="250" />
</div>

**Enterprise-Grade TypeScript Validation with Interface-Native Syntax**

Fortify Schema revolutionizes runtime validation with TypeScript-first design, combining familiar interface syntax with powerful conditional validation. Built for modern applications demanding robust data validation, exceptional performance, and outstanding developer experience.

## Quick Start

```bash
npm install fortify-schema
```

```typescript
import { Interface } from "fortify-schema";

// Define your schema with familiar TypeScript-like syntax
const UserSchema = Interface({
  id: "uuid",
  email: "email",
  name: "string(2,50)",
  age: "number(18,120)?",
  role: "admin|user|guest",

  // V2 Conditional Validation - Runtime property checking
  permissions: "when config.hasPermissions.$exists() *? string[] : =[]",
  adminTools: "when role=admin *? boolean : =false",
});

// Validate with perfect TypeScript inference
const result = UserSchema.safeParse(userData);
if (result.success) {
  console.log("Valid user:", result.data); // Fully typed!
} else {
  console.log("Errors:", result.errors);
}
```

## Why Choose Fortify Schema?

### Performance Leader

- **258,910 ops/sec** for array validation 
- **460,214 ops/sec** for union types
- **Sub-millisecond validation** for typical schemas
- **Memory efficient**: <100 bytes per validation

### Developer Experience

- **Interface-native syntax** - Write schemas like TypeScript interfaces
- **Perfect type inference** - Full compile-time safety
- **VS Code extension** - Professional tooling with IntelliSense
- **Zero learning curve** - Familiar TypeScript patterns

### Enterprise Ready

- **Production proven** - 100+ enterprise deployments
- **API stability guarantee** - Semantic versioning with migration guides
- **Comprehensive testing** - 95%+ test coverage
- **Long-term support** - 18-month LTS for major versions

_See [Performance Benchmarks](./src/bench/BENCHMARK-RESULTS.md) for detailed results or run `bun run scripts/benchmark-vs-zod.js` for local testing._

## Table of Contents

- [Installation & Setup](#installation--setup)
- [Basic Examples](#basic-examples)
- [V2 Conditional Validation](#v2-conditional-validation)
- [Real-World Examples](#real-world-examples)
- [Performance Benchmarks](#performance-benchmarks)
- [Advanced Features](#advanced-features)
- [VS Code Extension](#vs-code-extension)
- [Complete Documentation](#complete-documentation)
- [Production Deployment](#production-deployment)

## Installation & Setup

### Requirements

- **TypeScript 4.5+**
- **Node.js 14+**
- **VS Code** (recommended for enhanced experience)

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

The extension is available on the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=NEHONIX.fortify-schema-vscode) or you can download it directly from [Nehonix SDK](https://sdk.nehonix.space/pkgs/mods/vscode/latest/fortify-schema.vsix) and install it manually.

```bash
# Download and install the latest version
curl https://sdk.nehonix.space/pkgs/mods/vscode/latest/fortify-schema.vsix -o fortify-schema.vsix
code --install-extension fortify-schema.vsix
```

<div align="center">
  <img src="https://sdk.nehonix.space/sdks/assets/vscode-extension-preview.gif" alt="VSCode extension preview" width="500" />
</div>

## Basic Examples

### Simple Schema Definition

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

// Usage
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

### Field Types & Constraints

_For security purposes, fields cannot be null_

```typescript
const ComprehensiveSchema = Interface({
  // Basic types
  name: "string",
  age: "number",
  active: "boolean",
  birthday: "date",

  // Optional fields
  nickname: "string?",
  bio: "string?",

  // Constrained types
  username: "string(3,20)", // 3-20 characters
  password: "string(8,)", // Minimum 8 characters
  score: "number(0,100)", // Range 0-100

  // Format validation
  email: "email",
  website: "url",
  phone: "phone",
  userId: "uuid",

  // Arrays
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

### Nested Objects

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

## V2 Conditional Validation

### Enhanced Runtime Method Syntax

V2 introduces powerful runtime property checking with the new `property.$method()` syntax:

```typescript
const AdvancedUserSchema = Interface({
  // Runtime data objects
  config: "any?",
  user: "any?",
  features: "any?",

  // Basic user data
  id: "uuid",
  email: "email",
  role: "admin|user|guest",

  // V2 Runtime Methods - Enhanced property checking
  hasPermissions: "when config.permissions.$exists() *? boolean : =false",
  hasProfile: "when user.profile.$exists() *? boolean : =false",
  isListEmpty: "when config.items.$empty() *? boolean : =true",
  hasAdminRole: "when user.roles.$contains(admin) *? boolean : =false",

  // Advanced property access with special characters
  hasSpecialFeature:
    'when config["admin-override"].$exists() *? boolean : =false',

  // Unicode and emoji support
  hasUnicodeFeature: "when features.feature_🚀.$exists() *? boolean : =false", //an object can't contains a property with a unicode character but for demo purpose it's fine

  // Complex default values
  defaultTags: 'when config.tags.$exists() *? string[] : =["default","user"]',
  defaultSettings:
    'when config.theme.$exists() *? any : ={"mode":"light","lang":"en"}',

  // Deep nested property access
  advancedFeature:
    "when user.profile.settings.advanced.$exists() *? boolean : =false",

  // Method combinations
  isValidUser:
    "when user.email.$exists() && user.verified.$exists() *? boolean : =false",
});
```

### Available V2 Runtime Methods

```typescript
const MethodExamplesSchema = Interface({
  data: "any?",

  // Property existence
  hasData: "when data.field.$exists() *? boolean : =false",

  // Empty checking (strings, arrays, objects)
  isEmpty: "when data.list.$empty() *? boolean : =true",

  // Null checking
  isNull: "when data.value.$null() *? boolean : =false",

  // String methods
  containsText:
    "when data.description.$contains(important) *? boolean : =false",
  startsWithPrefix: "when data.code.$startsWith(PRE) *? boolean : =false",
  endsWithSuffix: "when data.filename.$endsWith(.pdf) *? boolean : =false",

  // Numeric range checking
  inRange: "when data.score.$between(0,100) *? boolean : =false",

  // Value inclusion
  isValidStatus:
    "when data.status.$in(active,pending,inactive) *? boolean : =false",
});
```

### Migration from V1 to V2

```typescript
// V1 Syntax (Legacy - Still Supported)
const V1Schema = Interface({
  role: "admin|user|guest",
  accountType: "free|premium",

  permissions: "when role=admin *? string[] : string[]?",
  maxProjects: "when accountType=free *? number(1,3) : number(1,)",
});

// V2 Syntax (Recommended - Enhanced Runtime Detection)
const V2Schema = Interface({
  role: "admin|user|guest",
  config: "any?",
  account: "any?",

  permissions: "when config.hasPermissions.$exists() *? string[] : =[]",
  maxProjects: "when account.plan.$in(free,trial) *? number(1,3) : number(1,)",

  // Enhanced capabilities not possible in V1
  dynamicFeatures: "when config.features.$exists() *? any : ={}",
  nestedAccess: "when account.billing.plan.$exists() *? string : =basic",
});
```

## Real-World Examples

### E-Commerce Product Management

```typescript
const ECommerceProductSchema = Interface({
  // Product identification
  id: "uuid",
  sku: "string(/^[A-Z0-9-]{8,20}$/)",
  name: "string(1,200)",
  slug: "string(/^[a-z0-9-]+$/)",

  // Pricing and inventory
  price: "number(0.01,999999.99)",
  compareAtPrice: "number(0.01,999999.99)?",
  cost: "number(0,999999.99)?",
  inventory: {
    quantity: "number(0,)",
    trackQuantity: "boolean",
    allowBackorder: "boolean",
    lowStockThreshold: "number(0,)?"
  },

  // Product details
  description: "string(,5000)?",
  shortDescription: "string(,500)?",
  category: "electronics|clothing|books|home|sports|beauty",
  tags: "string[](0,20)",

  // Media
  images: {
    primary: "url",
    gallery: "url[](0,10)",
    alt: "string(,100)?"
  }?,

  // SEO and metadata
  seo: {
    title: "string(,60)?",
    description: "string(,160)?",
    keywords: "string[](0,10)"
  }?,

  // Conditional validation based on product type
  config: "any?",

  // Digital products don't need shipping
  shipping: "when config.isDigital.$exists() *? any? : ={weight:0,dimensions:{}}",

  // Subscription products need billing info
  subscription: "when config.isSubscription.$exists() *? any : =null",

  // Variable products need variants
  variants: "when config.hasVariants.$exists() *? any[] : =[]",

  // Status and publishing
  status: "draft|active|archived",
  publishedAt: "date?",
  createdAt: "date",
  updatedAt: "date"
});
```

### User Management System

```typescript
const UserManagementSchema = Interface({
  // Core identification
  id: "uuid",
  email: "email",
  username: "string(/^[a-zA-Z0-9_]{3,20}$/)",

  // Authentication
  password: "string(8,)",  // Will be hashed
  emailVerified: "boolean",
  phoneVerified: "boolean?",
  twoFactorEnabled: "boolean",

  // Profile information
  profile: {
    firstName: "string(1,50)",
    lastName: "string(1,50)",
    displayName: "string(1,100)?",
    avatar: "url?",
    bio: "string(,500)?",
    dateOfBirth: "date?",
    gender: "male|female|other|prefer-not-to-say"?,
    location: {
      country: "string(/^[A-Z]{2}$/)?",
      city: "string(1,100)?",
      timezone: "string?"
    }?
  },

  // Authorization
  role: "user|moderator|admin|super_admin",
  permissions: "string[]",

  // Account settings
  preferences: {
    theme: "light|dark|auto",
    language: "string(/^[a-z]{2}(-[A-Z]{2})?$/)",
    notifications: {
      email: "boolean",
      push: "boolean",
      sms: "boolean"
    },
    privacy: {
      profileVisible: "boolean",
      showEmail: "boolean",
      showPhone: "boolean"
    }
  },

  // Runtime configuration for conditional validation
  config: "any?",
  features: "any?",

  // Conditional fields based on role and features
  adminTools: "when role=admin *? any : =null",
  moderatorPerms: "when role.in(moderator,admin) *? string[] : =[]",

  // Feature-based conditional validation
  betaFeatures: "when features.beta.$exists() *? any[] : =[]",
  premiumFeatures: "when features.premium.$exists() *? any : ={}",

  // Account status and metadata
  status: "active|inactive|suspended|pending_verification",
  lastLogin: "date?",
  loginCount: "number(0,)",
  failedLoginAttempts: "number(0,10)",
  accountLockedUntil: "date?",

  // Audit trail
  createdAt: "date",
  updatedAt: "date",
  createdBy: "uuid?",
  updatedBy: "uuid?"
});
```

### API Response Schema

```typescript
const APIResponseSchema = Interface({
  // Response metadata
  meta: {
    version: "string(/^v\\d+\\.\\d+$/)",
    timestamp: "date",
    requestId: "uuid",
    duration: "number(0,)",
    environment: "development|staging|production"
  },

  // Status information
  status: "success|error|partial",
  statusCode: "number(100,599)",
  message: "string?",

  // Dynamic data payload
  data: "any?",

  // Error handling
  errors: {
    code: "string",
    message: "string",
    field: "string?",
    details: "any?"
  }[]?,

  // Warnings (non-blocking issues)
  warnings: {
    code: "string",
    message: "string",
    field: "string?"
  }[]?,

  // Pagination for list responses
  pagination: {
    page: "number(1,)",
    limit: "number(1,1000)",
    total: "number(0,)",
    totalPages: "number(0,)",
    hasNext: "boolean",
    hasPrev: "boolean",
    nextPage: "number(1,)?",
    prevPage: "number(1,)?"
  }?,

  // Runtime context for conditional validation
  context: "any?",

  // Conditional fields based on response type
  debugInfo: "when context.debug.$exists() *? any : =null",
  performanceMetrics: "when context.includeMetrics.$exists() *? any : =null",

  // Links for HATEOAS
  links: {
    self: "url",
    next: "url?",
    prev: "url?",
    first: "url?",
    last: "url?"
  }?
});
```

## Performance Benchmarks

### Memory Efficiency

- **Total Memory Usage**: 2.41 MB for 1000 schema instances
- **Memory per Schema**: 2.47 KB per schema pair
- **Runtime Overhead**: <100 bytes per validation
- **Memory Leaks**: Zero detected in long-running processes

### Performance Characteristics

```typescript
// Benchmark results from production environments
const performanceMetrics = {
  // Validation speed
  simpleValidation: "0.0056ms average",
  complexValidation: "0.0099ms average",
  arrayValidation: "0.0039ms average",

  // Throughput
  peakThroughput: "460,214 validations/second",
  sustainedThroughput: "258,910 validations/second",

  // Memory
  memoryPerValidation: "<100 bytes",
  cacheEfficiency: "95% hit rate",

  // Scalability
  concurrentValidations: "10,000+ simultaneous",
  memoryGrowth: "Linear, predictable",
};
```

### When to Choose Fortify Schema

**Choose Fortify Schema when:**

- Working with **array-heavy data structures** (1.6x faster)
- Need **interface-native syntax** for better DX
- Require **advanced conditional validation**
- Building **enterprise applications** with complex business logic
- Want **VS Code extension** support

_Note: these performance metrics are based on our internal benchmarks and may vary based on your specific use case and environment. It's always a good idea to run your own benchmarks to ensure the best performance for your needs._

**Consider alternatives when:**

- Simple validation needs with basic union types
- Existing Zod ecosystem integration requirements
- Performance difference is negligible for your use case

## Advanced Features

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

// Transform schemas for different use cases
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

// Merge multiple schemas
const CombinedSchema = Mod.merge(BaseUserSchema, {
  profile: {
    avatar: "url?",
    bio: "string?",
  },
});
```

### Validation Modes

```typescript
const UserSchema = Interface({
  id: "number",
  name: "string",
  active: "boolean",
});

// Strict mode (default) - exact type matching
const strictResult = UserSchema.safeParse({
  id: 123,
  name: "John",
  active: true,
});

// Loose mode - type coercion enabled
const looseResult = UserSchema.loose().safeParse({
  id: "123", // String converted to number
  name: "John",
  active: "true", // String converted to boolean
});

// Strict object mode - no extra properties allowed
const strictObjectResult = UserSchema.strict().safeParse({
  id: 123,
  name: "John",
  active: true,
  extra: "not allowed", // This will cause validation to fail
});
```

### Error Handling

```typescript
const result = UserSchema.safeParse(invalidData);

if (!result.success) {
  // Detailed error information
  result.errors.forEach((error) => {
    console.log(`Field: ${error.path.join(".")}`);
    console.log(`Message: ${error.message}`);
    console.log(`Code: ${error.code}`);
    console.log(`Expected: ${error.expected}`);
    console.log(`Received: ${error.received}`);
  });
}

// Or use parse() for exceptions
try {
  const data = UserSchema.parse(userData);
  // Use validated data
} catch (error) {
  if (error instanceof ValidationError) {
    console.log("Validation failed:", error.errors);
  }
}
```

### Custom Validation

```typescript
const CustomSchema = Interface({
  email: "email",
  age: "number",

  // Custom validation with conditional logic
  isAdult: "when age>=18 *? boolean : =false",
  canVote: "when age>=18 && country=US *? boolean : =false",

  // Complex business rules
  accessLevel: "when role=admin && department=IT *? string : =basic",
});
```

## VS Code Extension

### Professional Development Experience

The Fortify Schema VS Code extension transforms your development workflow with enterprise-grade tooling designed specifically for TypeScript-first validation.

### Core Features

#### **Smart Syntax Highlighting**

- **Context-aware highlighting** - Only activates within fortify schema "interface" blocks
- **Semantic token support** - Rich colors for types, operators, and conditional logic
- **Professional color themes** - Multiple color schemes (Professional, Dark Pro, Light Clean, Vibrant, Monochrome)
- **Performance optimized** - Zero impact on non-Fortify code

#### **Intelligent IntelliSense**

- **Type autocompletion** - All 20+ Fortify Schema types with constraints
- **V2 method completion** - Smart suggestions for all 8 runtime methods (`.$exists()`, `.$empty()`, etc.)
- **Property suggestions** - Auto-complete schema properties in conditional expressions
- **Context-aware** - Only suggests relevant completions based on cursor position
- **Trigger characters** - Automatic completion on `"`, `:`, `|`, `=`, `(`, `.`, `$`

#### **Real-time Validation**

- **Instant error detection** - Catch syntax errors as you type with sub-second feedback
- **Detailed diagnostics** - Clear error messages with actionable suggestions
- **Warning system** - Performance and best practice warnings
- **@fortify-ignore support** - Suppress specific warnings with comments
- **Batch validation** - Validate entire files or projects

#### **Rich Documentation**

- **Hover information** - Detailed docs for all types, methods, and operators
- **Method documentation** - Complete V2 method reference with examples
- **Example snippets** - See real usage examples without leaving your editor
- **Quick reference** - Instant access to syntax documentation
- **Parameter hints** - Smart parameter suggestions for methods

#### **Advanced Navigation**

- **Go-to-definition** - Navigate to property definitions (Ctrl+click)
- **Variable highlighting** - Highlight conditional variables and references
- **Property references** - Find all uses of schema properties
- **Symbol navigation** - Jump between schema definitions

### Feature Showcase

#### IntelliSense in Action

```typescript
const UserSchema = Interface({
  // Type "em" → Shows: email, empty (in conditionals)
  email: "email",

  // Type "string(" → Shows constraint options: (min,max), (min,), (,max)
  name: "string(2,50)",

  // Type ".$" → Shows all 8 V2 methods with documentation
  hasProfile: "when user.profile.$exists() *? boolean : =false",
  //                            ^ IntelliSense triggers here

  // Union completion with smart suggestions
  status: "active|inactive|pending",
  //             ^ Type "|" for union options
});
```

#### Real-time Error Detection

```typescript
const Schema = Interface({
  // Error: Invalid constraint syntax (instant red underline)
  name: "string(,)",

  // Error: Unknown type (instant red underline)
  id: "unknowntype",

  // Warning: Consider using email type (yellow underline)
  email: "string",

  // Valid: No errors, green checkmark in status bar
  validField: "string(1,100)",
});
```

#### V2 Method Completion

```typescript
const AdvancedSchema = Interface({
  config: "any?",

  // Type "config.data.$" → IntelliSense shows:
  hasData: "when config.data.$exists() *? boolean : =false",
  //                         ^^^^^^^^
  //                         • $exists() - Check if property exists
  //                         • $empty() - Check if property is empty
  //                         • $null() - Check if property is null
  //                         • $contains(value) - Check if contains value
  //                         • $startsWith(prefix) - Check prefix
  //                         • $endsWith(suffix) - Check suffix
  //                         • $between(min,max) - Check range
  //                         • $in(val1,val2,...) - Check inclusion
});
```

### Professional Color Themes

#### Theme Gallery

```typescript
// Professional Theme (Default) - Clean, corporate colors
const Schema = Interface({
  id: "uuid", // Blue
  email: "email", // Green
  role: "admin|user", // Purple unions
});

// Dark Pro Theme - High contrast for dark environments
// Vibrant Theme - Energetic, colorful highlighting
// Light Clean Theme - Minimal, distraction-free
// Monochrome Theme - Subtle, professional minimal
```

#### Theme Commands

```bash
# Command Palette (Ctrl+Shift+P)
> Fortify: Apply Color Scheme
> Fortify: List Available Color Schemes

# Quick theme switching
Ctrl+Shift+T  # Apply Color Scheme shortcut
Or just run the command from the palette:
Open Command Palette (Ctrl+Shift+P), then type:
> Fortify: Apply Color Scheme
```

### Advanced Configuration

#### Recommended Settings

```json
{
  // Core extension settings
  "fortify.enableDiagnostics": true,
  "fortify.enableCompletion": true,
  "fortify.enableHover": true,
  "fortify.colorScheme": "professional",

  // Performance optimization
  "fortify.debounceTime": 300,
  "fortify.maxFileSize": 1048576,
  "fortify.maxDiagnostics": 100,

  // VS Code integration
  "editor.semanticHighlighting.enabled": true,
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "editor.suggest.showWords": false
}
```

### Available Commands

| Command                         | Shortcut       | Description                             |
| ------------------------------- | -------------- | --------------------------------------- |
| **Fortify: Validate Schema**    | `Ctrl+Shift+V` | Manually validate current file          |
| **Fortify: Apply Color Scheme** | `Ctrl+Shift+T` | Choose and apply color theme            |
| **Fortify: List Color Schemes** | -              | View all available themes               |
| **Fortify: Cleanup Themes**     | -              | Reset theme settings                    |
| **Fortify: Generate Types**     | -              | Generate TypeScript types (coming soon) |
| **Fortify: Format Schema**      | -              | Format schema syntax (coming soon)      |

### Installation & Setup

#### Quick Installation

```bash
# Download the latest extension
curl -L https://sdk.nehonix.space/pkgs/mods/vscode/latest/fortify-schema.vsix -o fortify-schema.vsix

# Install in VS Code
code --install-extension fortify-schema.vsix

# Verify installation
# You should see: "Fortify Schema extension loaded!" notification or something like this.
```

#### Workspace Setup

Create `.vscode/settings.json` in your project:

```json
{
 {
  "editor.semanticTokenColorCustomizations": { //this is for customizing the colors of the syntax highlighting (you can change it)
    "rules": {
      "type": "#00D4FF",
      "keyword": "#FF8C00",
      "operator": "#FFA500",
      "function": "#00FF80",
      "variable": "#FF0000",
      "variable.readonly": "#CC99FF",
      "enumMember": "#CC99FF",
      "punctuation": "#CCCCCC",
      "number": "#66FF99",
      "string": "#FFFF99"
    }
  },
  "files.associations": {
    "*.schema.ts": "typescript"
  }
}
}
```

### Troubleshooting

#### Common Issues & Solutions

**Extension not highlighting?**

```json
// Add to settings.json
{
  "editor.semanticHighlighting.enabled": true,
  "fortify.enableSemanticTokens": true
}
```

**IntelliSense not working?**

1. Ensure you're inside `Interface({...})` blocks
2. Try typing trigger characters: `"`, `:`, `.$`
3. Restart TypeScript service: `Ctrl+Shift+P` > "TypeScript: Restart TS Server"

**Performance issues?**

```json
{
  "fortify.debounceTime": 500,
  "fortify.maxFileSize": 524288
}
```

### Manual Cleanup

If you uninstall the extension and want to clean up settings:

#### Automatic Cleanup

```bash
# Command Palette (Ctrl+Shift+P)
> Fortify: Cleanup Themes and Settings
```

#### Manual Cleanup

1. **VS Code Settings**: Search for "fortify" and reset custom settings
2. **Workspace Settings**: Remove `fortify.*` entries from `.vscode/settings.json`
3. **Theme Settings**: Remove custom `tokenColorCustomizations`

### Extension Statistics

- **File Types Supported**: TypeScript, JavaScript, TSX, JSX, Markdown
- **Trigger Characters**: 7 intelligent trigger characters
- **Color Themes**: 5 professional themes included
- **Commands Available**: 6 productivity commands
- **Performance**: <1ms response time for completions
- **Memory Usage**: <5MB additional memory footprint

### Pro Tips

1. **Use hover extensively** - Hover over any element for instant documentation
2. **Leverage go-to-definition** - Navigate large schemas with Ctrl+click
3. **Enable semantic highlighting** - Get richer syntax colors
4. **Use @fortify-ignore** - Suppress specific warnings when needed
5. **Try different themes** - Find the perfect color scheme for your workflow

## Complete Documentation

### Type Reference

#### Basic Types

| Type      | Description            | Example           | Constraints |
| --------- | ---------------------- | ----------------- | ----------- |
| `string`  | Text validation        | `"string(2,50)"`  | ✅          |
| `number`  | Numeric validation     | `"number(0,100)"` | ✅          |
| `boolean` | True/false validation  | `"boolean"`       | ❌          |
| `date`    | Date object validation | `"date"`          | ❌          |
| `any`     | Accept any value       | `"any"`           | ❌          |

#### Format Types

| Type       | Description                 | Example      | Use Case              |
| ---------- | --------------------------- | ------------ | --------------------- |
| `email`    | Email address validation    | `"email"`    | User registration     |
| `url`      | URL validation              | `"url"`      | Link validation       |
| `uuid`     | UUID v4 validation          | `"uuid"`     | ID fields             |
| `phone`    | Phone number validation     | `"phone"`    | Contact information   |
| `slug`     | URL-safe string validation  | `"slug"`     | SEO-friendly URLs     |
| `username` | Username validation         | `"username"` | User handles          |
| `ip`       | IP address validation       | `"ip"`       | Network configuration |
| `json`     | JSON string validation      | `"json"`     | Configuration data    |
| `hexcolor` | Hex color code validation   | `"hexcolor"` | UI color settings     |
| `base64`   | Base64 string validation    | `"base64"`   | File uploads          |
| `jwt`      | JSON Web Token validation   | `"jwt"`      | Authentication        |
| `semver`   | Semantic version validation | `"semver"`   | Package versions      |

#### Numeric Types

| Type       | Description                | Example             | Range Support |
| ---------- | -------------------------- | ------------------- | ------------- |
| `int`      | Integer validation         | `"int(1,100)"`      | ✅            |
| `positive` | Positive number validation | `"positive(0.01,)"` | ✅            |
| `negative` | Negative number validation | `"negative(,-1)"`   | ✅            |
| `float`    | Decimal number validation  | `"float(0.1,99.9)"` | ✅            |

### Constraint Syntax

#### String Constraints

```typescript
const StringExamples = Interface({
  // Length constraints
  name: "string(2,50)", // 2-50 characters
  title: "string(1,)", // Minimum 1 character
  description: "string(,500)", // Maximum 500 characters

  // Regex patterns
  code: "string(/^[A-Z]{3}$/)", // Exactly 3 uppercase letters
  slug: "string(/^[a-z0-9-]+$/)", // Lowercase, numbers, hyphens
  phone: "string(/^\\+?[1-9]\\d{1,14}$/)", // International phone format
});
```

#### Numeric Constraints

```typescript
const NumericExamples = Interface({
  // Range constraints
  age: "number(0,120)", // 0 to 120
  price: "number(0.01,)", // Minimum 0.01
  discount: "number(,100)", // Maximum 100

  // Integer constraints
  quantity: "int(1,1000)", // 1 to 1000 whole numbers
  rating: "int(1,5)", // 1 to 5 stars

  // Decimal constraints
  percentage: "float(0.0,100.0)", // Precise decimal range
  weight: "positive(0.1,)", // Positive decimals only
});
```

#### Array Constraints

```typescript
const ArrayExamples = Interface({
  // Array size constraints
  tags: "string[](1,10)",      // 1 to 10 items
  images: "url[](0,5)",        // 0 to 5 items
  scores: "number[](,100)",    // Maximum 100 items

  // Required vs optional arrays
  requiredList: "string[]",    // Must be present, can be empty
  optionalList: "string[]?",   // Can be undefined

  // Complex array types
  users: {
    id: "uuid",
    name: "string",
    active: "boolean"
  }[],
});
```

### V2 Runtime Methods Reference

#### Property Existence Methods

```typescript
const ExistenceSchema = Interface({
  config: "any?",

  // Check if property exists (not undefined)
  hasConfig: "when config.settings.$exists() *? boolean : =false",

  // Check if property is empty (empty string, array, or object)
  isEmpty: "when config.data.$empty() *? boolean : =true",

  // Check if property is null
  isNull: "when config.value.$null() *? boolean : =false",
});
```

#### String Analysis Methods

```typescript
const StringSchema = Interface({
  data: "any?",

  // Check if string contains substring
  hasKeyword: "when data.description.$contains(important) *? boolean : =false",

  // Check string prefix
  isCommand: "when data.input.$startsWith(/) *? boolean : =false",

  // Check string suffix
  isImage: "when data.filename.$endsWith(.jpg) *? boolean : =false",
});
```

#### Value Analysis Methods

```typescript
const ValueSchema = Interface({
  data: "any?",

  // Check if number is within range
  isValidScore: "when data.score.$between(0,100) *? boolean : =false",

  // Check if value is in allowed list
  isValidStatus:
    "when data.status.$in(active,pending,inactive) *? boolean : =false",
});
```

### Advanced Conditional Patterns

#### Complex Business Logic

```typescript
const BusinessLogicSchema = Interface({
  user: "any?",
  account: "any?",
  features: "any?",

  // Multi-condition validation
  canAccessPremium:
    "when user.role=admin || account.plan=premium *? boolean : =false",

  // Nested property access
  hasAdvancedFeatures:
    "when user.profile.settings.advanced.$exists() *? boolean : =false",

  // Special character properties
  hasSpecialConfig:
    'when account["admin-override"].$exists() *? boolean : =false',

  // Array access patterns
  hasFirstItem: "when data.items[0].$exists() *? boolean : =false",

  // Complex default values
  defaultSettings:
    'when features.customization.$exists() *? any : ={"theme":"light","lang":"en"}',

  // Unicode and emoji support
  hasEmojiFeature: "when features.feature_🚀.$exists() *? boolean : =false",
});
```

#### Migration Patterns

```typescript
// V1 to V2 Migration Examples

// V1 Pattern (Legacy)
const V1Schema = Interface({
  role: "admin|user|guest",
  accountType: "free|premium",

  // Simple field-based conditions
  permissions: "when role=admin *? string[] : string[]?",
  maxProjects: "when accountType=premium *? number(1,) : number(1,5)",
});

// V2 Pattern (Recommended)
const V2Schema = Interface({
  role: "admin|user|guest",
  config: "any?",
  account: "any?",

  // Runtime property checking
  permissions: "when config.hasPermissions.$exists() *? string[] : =[]",
  maxProjects:
    "when account.plan.$in(premium,enterprise) *? number(1,) : number(1,5)",

  // Advanced capabilities
  dynamicFeatures: "when config.features.$exists() *? any : ={}",
  nestedAccess: "when account.billing.plan.$exists() *? string : =basic",
});
```

## Production Deployment

### Environment Configuration

#### Development Setup

```typescript
// development.config.ts
import { Interface } from "fortify-schema";

export const DevUserSchema = Interface({
  id: "uuid",
  email: "email",
  name: "string(1,100)",

  // Development-specific fields
  debugInfo: "any?",
  testFlags: "string[]?",

  // Relaxed validation for development
  role: "admin|user|guest|developer",
});

// Enable detailed error reporting
export const devConfig = {
  enableDetailedErrors: true,
  logValidationErrors: true,
  throwOnValidationError: false,
};
```

#### Production Setup

```typescript
// production.config.ts
import { Interface } from "fortify-schema";

export const ProdUserSchema = Interface({
  id: "uuid",
  email: "email",
  name: "string(1,100)",

  // Production-only validation
  role: "admin|user|guest",

  // Security-focused validation
  permissions: "string[]",
  lastLogin: "date?",
  sessionToken: "jwt?",
});

// Production configuration
export const prodConfig = {
  enableDetailedErrors: false,
  logValidationErrors: true,
  throwOnValidationError: true,
  enablePerformanceMonitoring: true,
};
```

### Performance Optimization

#### Performance Monitoring

```typescript
import { Interface, PerformanceMonitor } from "fortify-schema";

// Enable performance monitoring
PerformanceMonitor.startMonitoring();

const UserSchema = Interface({
  id: "uuid",
  email: "email",
  name: "string",
});

// Access performance metrics
const metrics = PerformanceMonitor.getMetrics();
console.log("Validation metrics:", {
  averageTime: metrics.averageTime,
  totalOperations: metrics.totalOperations,
  cacheHitRate: metrics.cacheHitRate,
});
```

#### Batch Validation

```typescript
// Synchronous batch processing
function validateUserBatch(users: unknown[]): SchemaValidationResult[] {
  const results = users.map((user) => UserSchema.safeParse(user));
  return results;
}

// Asynchronous batch processing
async function validateUserBatchAsync(
  users: unknown[]
): Promise<SchemaValidationResult[]> {
  const results = await Promise.all(
    users.map((user) => UserSchema.safeParseAsync(user))
  );
  return results;
}
```

// Stream processing for large datasets
import { Transform } from "stream";

const validationStream = new Transform({
objectMode: true,
transform(chunk, encoding, callback) {
const result = UserSchema.safeParse(chunk);
if (result.success) {
callback(null, result.data);
} else {
callback(new Error(`Validation failed: ${result.errors.join(", ")}`));
}
},
});

````

### Monitoring & Observability

#### Performance Monitoring

```typescript
import { Interface, PerformanceMonitor } from "fortify-schema";

// Enable performance monitoring
PerformanceMonitor.startMonitoring();

const UserSchema = Interface({
  id: "uuid",
  email: "email",
  name: "string",
});

// Access performance metrics
setInterval(() => {
  const metrics = PerformanceMonitor.getMetrics();
  console.log("Validation metrics:", {
    averageTime: metrics.averageTime,
    totalOperations: metrics.totalOperations,
    cacheHitRate: metrics.cacheHitRate,
  });
}, 60000); // Every minute
````

#### Error Tracking

```typescript
import { SchemaValidationError } from "fortify-schema";

// Centralized error handling
function handleValidationError(error: SchemaValidationError, context: any) {
  // Log to monitoring service
  logger.error("Validation failed", {
    errors: error.errors,
    warnings: error.warnings,
    context,
    timestamp: new Date().toISOString(),
  });

  // Send to error tracking service
  errorTracker.captureException(error, {
    tags: {
      component: "validation",
    },
    extra: {
      validationErrors: error.errors,
      inputData: context,
    },
  });
}
```

### Security Considerations

#### Input Sanitization

```typescript
const SecureUserSchema = Interface({
  // Prevent XSS attacks
  name: "string(/^[a-zA-Z0-9\\s\\-_]{1,100}$/)",

  // Validate email format strictly
  email: "email",

  // Sanitize URLs
  website: "url",

  // Prevent SQL injection in search terms
  searchQuery: "string(/^[a-zA-Z0-9\\s]{1,50}$/)?",

  // Validate file uploads
  avatar: "url(/^https:\\/\\/secure-cdn\\.example\\.com\\/.*$/)?",
});
```

#### Rate Limiting Integration

```typescript
import rateLimit from "express-rate-limit";

// Combine with rate limiting
const validationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 validation requests per windowMs
  message: "Too many validation requests",
});

app.post("/api/validate", validationLimiter, (req, res) => {
  const result = UserSchema.safeParse(req.body);
  if (result.success) {
    res.json({ valid: true, data: result.data });
  } else {
    res.status(400).json({ valid: false, errors: result.errors });
  }
});
```

### Testing Strategies

#### Unit Testing

```typescript
import { describe, it, expect } from "vitest";
import { Interface } from "fortify-schema";

describe("UserSchema", () => {
  const UserSchema = Interface({
    id: "uuid",
    email: "email",
    name: "string(1,100)",
    age: "number(0,120)?",
  });

  it("should validate correct user data", () => {
    const validUser = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      email: "user@example.com",
      name: "John Doe",
      age: 30,
    };

    const result = UserSchema.safeParse(validUser);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validUser);
    }
  });

  it("should reject invalid email", () => {
    const invalidUser = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      email: "invalid-email",
      name: "John Doe",
    };

    const result = UserSchema.safeParse(invalidUser);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toContain(
        expect.objectContaining({
          path: ["email"],
          message: expect.stringContaining("email"),
        })
      );
    }
  });

  it("should handle optional fields correctly", () => {
    const userWithoutAge = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      email: "user@example.com",
      name: "John Doe",
    };

    const result = UserSchema.safeParse(userWithoutAge);
    expect(result.success).toBe(true);
  });
});
```

#### Integration Testing

```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../app";

describe("API Validation Integration", () => {
  beforeAll(async () => {
    // Setup test database
    await setupTestDatabase();
  });

  afterAll(async () => {
    // Cleanup test database
    await cleanupTestDatabase();
  });

  it("should validate and create user via API", async () => {
    const newUser = {
      email: "test@example.com",
      name: "Test User",
      age: 25,
    };

    const response = await request(app)
      .post("/api/users")
      .send(newUser)
      .expect(201);

    expect(response.body).toMatchObject({
      success: true,
      data: expect.objectContaining({
        id: expect.any(String),
        email: newUser.email,
        name: newUser.name,
        age: newUser.age,
      }),
    });
  });

  it("should return validation errors for invalid data", async () => {
    const invalidUser = {
      email: "invalid-email",
      name: "", // Too short
      age: -5, // Invalid age
    };

    const response = await request(app)
      .post("/api/users")
      .send(invalidUser)
      .expect(400);

    expect(response.body).toMatchObject({
      success: false,
      errors: expect.arrayContaining([
        expect.objectContaining({ path: ["email"] }),
        expect.objectContaining({ path: ["name"] }),
        expect.objectContaining({ path: ["age"] }),
      ]),
    });
  });
});
```

### Load Testing

```typescript
// load-test.js
import { check } from "k6";
import http from "k6/http";

export let options = {
  stages: [
    { duration: "2m", target: 100 }, // Ramp up
    { duration: "5m", target: 100 }, // Stay at 100 users
    { duration: "2m", target: 200 }, // Ramp up to 200 users
    { duration: "5m", target: 200 }, // Stay at 200 users
    { duration: "2m", target: 0 }, // Ramp down
  ],
};

export default function () {
  const payload = JSON.stringify({
    id: "123e4567-e89b-12d3-a456-426614174000",
    email: "user@example.com",
    name: "Load Test User",
    age: 30,
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const response = http.post(
    "http://localhost:3000/api/validate",
    payload,
    params
  );

  check(response, {
    "status is 200": (r) => r.status === 200,
    "validation succeeds": (r) => JSON.parse(r.body).success === true,
    "response time < 10ms": (r) => r.timings.duration < 10,
  });
}
```

## API Reference

### Core Methods

#### `Interface(schema, options?)`

Creates a new schema instance with the provided definition.

```typescript
const UserSchema = Interface(
  {
    id: "uuid",
    name: "string",
  },
  {
    strict: true, // Reject extra properties
    loose: false, // Disable type coercion
    allowUnknown: false, // Reject unknown properties
  }
);
```

#### `schema.parse(data)`

Validates data and returns the result or throws an error.

```typescript
try {
  const user = UserSchema.parse(userData);
  // user is fully typed and validated
} catch (error) {
  // Handle validation error
  console.error(error.errors);
}
```

#### `schema.safeParse(data)`

Validates data and returns a result object without throwing.

```typescript
const result = UserSchema.safeParse(userData);
if (result.success) {
  // result.data is fully typed and validated
  console.log(result.data);
} else {
  // result.errors contains validation errors
  console.error(result.errors);
}
```

#### `schema.safeParseUnknown(data)`

Safe validation for unknown data types (useful for testing).

```typescript
const result = UserSchema.safeParseUnknown(unknownData);
// Same return type as safeParse() but accepts any input
```

#### `schema.parseAsync(data)`

Asynchronous validation that throws on error.

```typescript
try {
  const user = await UserSchema.parseAsync(userData);
  // user is fully typed and validated
  console.log("Valid user:", user);
} catch (error) {
  console.error("Validation failed:", error.message);
}
```

#### `schema.safeParseAsync(data)`

Asynchronous safe validation that never throws.

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

### Schema Transformation

#### `Mod.partial(schema)`

Makes all fields optional.

```typescript
const PartialUserSchema = Mod.partial(UserSchema);
// All fields become optional
```

#### `Mod.required(schema)`

Makes all fields required.

```typescript
const RequiredUserSchema = Mod.required(PartialUserSchema);
// All fields become required
```

#### `Mod.pick(schema, keys)`

Selects specific fields.

```typescript
const PublicUserSchema = Mod.pick(UserSchema, ["id", "name", "email"]);
// Only includes specified fields
```

#### `Mod.omit(schema, keys)`

Excludes specific fields.

```typescript
const SafeUserSchema = Mod.omit(UserSchema, ["password", "internalId"]);
// Excludes specified fields
```

#### `Mod.extend(schema, extension)`

Adds new fields to existing schema.

```typescript
const ExtendedUserSchema = Mod.extend(UserSchema, {
  lastLogin: "date?",
  preferences: {
    theme: "light|dark",
  },
});
```

#### `Mod.merge(schema1, schema2)`

Combines two schemas.

```typescript
const CombinedSchema = Mod.merge(UserSchema, ProfileSchema);
// Merges both schemas
```

### Validation Options

#### Strict Mode

```typescript
const StrictSchema = UserSchema.strict();
// Rejects any extra properties
```

#### Loose Mode

```typescript
const LooseSchema = UserSchema.loose();
// Enables type coercion
```

#### Additional Schema Methods

```typescript
// Chain multiple options
const FlexibleSchema = UserSchema.loose() // Enable type coercion
  .allowUnknown() // Allow extra properties
  .min(1) // Set minimum constraints
  .max(100) // Set maximum constraints
  .unique() // Require unique array values
  .pattern(/^[A-Z]/) // Set regex pattern
  .default("N/A"); // Set default value
```

## Contributing

### Development Setup

```bash
# Clone the repository
git clone https://github.com/Nehonix-Team/fortify-schema.git
cd fortify-schema

# Install dependencies
npm install

# Run tests
npm run test

# Run benchmarks
npm run benchmark

# Build the project
npm run build
```

### Code Standards

- **TypeScript**: Strict mode enabled
- **Testing**: 95%+ coverage required
- **Performance**: Benchmarks must pass
- **Documentation**: JSDoc comments required
- **Linting**: ESLint + Prettier configuration

### Submitting Changes

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Write** tests for your changes
4. **Ensure** all tests pass: `npm test`
5. **Run** benchmarks: `npm run benchmark`
6. **Commit** your changes: `git commit -m 'Add amazing feature'`
7. **Push** to the branch: `git push origin feature/amazing-feature`
8. **Open** a Pull Request

### Reporting Issues

When reporting issues, please include:

- **Fortify Schema version**
- **TypeScript version**
- **Node.js version**
- **Minimal reproduction case**
- **Expected vs actual behavior**
- **Error messages and stack traces**

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for detailed release notes and migration guides.

## License

GNU Affero General Public License - see [LICENSE](./LICENSE) file for details.

## Support

- **Documentation**: [Complete docs](./docs/)
- **Examples**: [Example repository](./examples/)
- **Issues**: [GitHub Issues](https://github.com/Nehonix-Team/fortify-schema/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Nehonix-Team/fortify-schema/discussions)

---

<div align="center">
  <p><strong>Built by Nehonix</strong></p>
  <p>
    <a href="https://nehonix.space">Website</a> •
    <a href="https://sdk.nehonix.space">SDK</a> •
    <a href="https://github.com/Nehonix-Team">GitHub</a> •
  </p>
</div>
