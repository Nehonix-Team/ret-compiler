# Interface Schema Architecture

## Overview

The Interface Schema system provides TypeScript-like schema validation with a modular, linked architecture. All modules are designed to work together and link back to the main `Interface.ts` and `InterfaceSchema.ts` components.

## Core Architecture

```
Interface.ts (Main Entry Point)
    ↓
InterfaceSchema.ts (Core Implementation)
    ↓
├── validators/ (Core Validation Logic)
│   ├── TypeValidators.ts (Primary validation engine)
│   ├── ConstraintParser.ts (Constraint parsing & caching)
│   ├── TypeGuards.ts (Type checking utilities)
│   ├── ValidationHelpers.ts (Validation utilities)
│   └── index.ts (Unified exports)
│
├── typescript/ (TypeScript Integration)
│   ├── TypeInference.ts (Complete type system & inference)
│   ├── ConditionalTypes.ts (Advanced conditional logic & operators)
│   └── IDESupport.ts (Developer experience & tooling)
│
└── conditional/ (Conditional Validation)
    ├── parser/ (AST parsing)
    ├── evaluator/ (Expression evaluation)
    └── types/ (Conditional type definitions)
```

## Module Roles & Responsibilities

### Core Modules

#### `Interface.ts`

- **Role**: Main public API and entry point
- **Responsibilities**:
  - Export the `Interface()` function
  - Provide type helpers (`InferType`, `InferSchemaType`)
  - Export convenience utilities (`FieldTypes`, `QuickSchemas`)
- **Links to**: `InterfaceSchema.ts`, all type definitions

#### `InterfaceSchema.ts`

- **Role**: Core schema implementation and validation orchestrator
- **Responsibilities**:
  - Implement the main `InterfaceSchema` class
  - Coordinate validation through validators
  - Handle schema compilation and caching
  - Manage conditional validation
- **Links to**: All validator modules, conditional system, type system

### Validation System (`validators/`)

#### `TypeValidators.ts`

- **Role**: Primary validation engine for all data types
- **Responsibilities**:
  - Validate basic types (string, number, boolean, etc.)
  - Handle specialized types (email, url, uuid, etc.)
  - Apply constraints and transformations
  - Support loose mode conversions
- **Used by**: `InterfaceSchema.ts`, extensions
- **Dependencies**: `ConstraintParser.ts`, `TypeGuards.ts`

#### `ConstraintParser.ts`

- **Role**: Parse and cache constraint syntax
- **Responsibilities**:
  - Parse constraint strings like `"string(3,20)"`, `"number(0,100)"`
  - Cache parsed results for performance
  - Handle complex constraint combinations
- **Used by**: `TypeValidators.ts`, `InterfaceSchema.ts`

#### `TypeGuards.ts`

- **Role**: Type checking and validation utilities
- **Responsibilities**:
  - Provide type guard functions
  - Check value types and formats
  - Validate special constructs (unions, constants)
- **Used by**: `TypeValidators.ts`, `ValidationHelpers.ts`

#### `ValidationHelpers.ts`

- **Role**: Shared validation utilities
- **Responsibilities**:
  - Handle constant value validation
  - Provide result creation helpers
  - Cache validation results
- **Used by**: `TypeValidators.ts`, conditional system

### TypeScript Integration (`typescript/`) - **UNIFIED SYSTEM**

#### `TypeInference.ts` (Core Type System)

- **Role**: Complete TypeScript type inference and analysis
- **Responsibilities**:
  - Infer TypeScript types from schema definitions
  - Handle optional fields, arrays, nested objects
  - Support advanced type transformations
  - Analyze conditional expressions for type safety
  - Provide compile-time type checking
- **Used by**: `Interface.ts`, `InterfaceSchema.ts`, IDE support

#### `ConditionalTypes.ts` (Advanced Conditional Logic)

- **Role**: Advanced conditional type operations and operators
- **Responsibilities**:
  - Define conditional operators (`==`, `!=`, `>`, etc.)
  - Handle operator precedence and evaluation
  - Provide type-safe conditional builders
  - Advanced conditional type utilities
- **Used by**: Conditional system, type inference

#### `IDESupport.ts` (Developer Experience)

- **Role**: IDE integration and developer tooling
- **Responsibilities**:
  - Provide autocomplete for conditional expressions
  - Generate hover information and diagnostics
  - Support real-time validation feedback
- **Used by**: IDE extensions, development tools



### Conditional System (`conditional/`)

#### `parser/ConditionalParser.ts`

- **Role**: Parse conditional expressions into AST
- **Responsibilities**:
  - Parse conditional syntax like `"when field=value ? type1 : type2"`
  - Generate Abstract Syntax Trees
  - Handle nested conditionals
- **Used by**: `InterfaceSchema.ts`, TypeScript integration

#### `evaluator/ConditionalEvaluator.ts`

- **Role**: Evaluate conditional expressions
- **Responsibilities**:
  - Execute conditional logic against data
  - Return appropriate schema types based on conditions
- **Used by**: `InterfaceSchema.ts`



## Data Flow

1. **Schema Definition**: User calls `Interface({ ... })` with schema definition
2. **Schema Creation**: `Interface.ts` creates `InterfaceSchema` instance
3. **Schema Compilation**: `InterfaceSchema.ts` pre-compiles field definitions using:
   - `ConstraintParser.ts` for constraint parsing
   - `ConditionalParser.ts` for conditional expressions
4. **Validation**: When `safeParse()` is called:
   - `InterfaceSchema.ts` orchestrates validation
   - `TypeValidators.ts` performs actual type validation
   - `ConditionalEvaluator.ts` handles conditional logic
   - `ValidationHelpers.ts` provides utilities

## Performance Optimizations

- **Pre-compilation**: Constraints and conditionals are parsed once during schema creation
- **Caching**: Parsed results are cached to avoid repeated parsing
- **Modular Loading**: Only required modules are loaded based on schema features used

## Extension Points

- **Custom Validators**: Add new validators to `TypeValidators.ts`
- **New Operators**: Extend `ConditionalOperators.ts`
- **Type Extensions**: Add new type inference rules to `interface.type.ts`
- **IDE Features**: Enhance `IDESupport.ts` for better developer experience

## No Duplication Policy

- **Single Source of Truth**: Each validation type has one implementation in `TypeValidators.ts`
- **Shared Utilities**: Common functionality is in `ValidationHelpers.ts` and `TypeGuards.ts`
- **Consistent APIs**: All modules use the same result types and error formats
- **Unified Exports**: All functionality is accessible through `Interface.ts`

## Current Issues & Fixes Applied

### 1. Duplicate Validation Logic (✅ FIXED)

**Problem**: `ValidationEngine` in `extensions/mods` duplicated validation logic from `TypeValidators`
**Solution**: Refactored `ValidationEngine` to use `TypeValidators` as the single source of truth

- Removed 200+ lines of duplicate validation code
- ValidationEngine now delegates to TypeValidators for all validation
- Consistent error handling and result formats across the system

### 2. Scattered TypeScript Support (✅ REORGANIZED)

**Problem**: TypeScript functionality was spread across multiple locations
**Solution**: Consolidated all TypeScript integration in `typescript/` directory with clear roles

- Created `typescript/index.ts` for unified exports
- Proper linking through main `Interface.ts`
- Clear separation of concerns between modules

### 3. Missing Module Linking (✅ ESTABLISHED)

**Problem**: Modules weren't properly linked to main Interface system
**Solution**: All modules now properly import and link through `Interface.ts` and `InterfaceSchema.ts`

- All validators exported through main Interface
- TypeScript integration properly linked
- Conditional system integrated with main schema

### 4. Unclear Dependencies (✅ DOCUMENTED)

**Problem**: Module dependencies and relationships weren't clear
**Solution**: Created clear dependency graph and documented all relationships

- Complete architecture documentation
- Module roles and responsibilities defined
- Data flow and interaction patterns documented

### 5. Code Duplication Eliminated (✅ COMPLETED)

**Problem**: Multiple modules had overlapping functionality
**Solution**: Established single source of truth for each concern

- TypeValidators: Single validation implementation
- ConstraintParser: Single constraint parsing logic
- ValidationHelpers: Shared utilities
- No duplicate validation methods across modules

## Usage Examples

### Basic Schema Creation

```typescript
import { Interface } from "./Interface";

const UserSchema = Interface({
  id: "positive",
  email: "email",
  name: "string(2,50)",
  age: "int(18,120)?",
  tags: "string[]?",
});
```

### With Conditional Validation

```typescript
const OrderSchema = Interface({
  type: "pickup|delivery",
  address: "when type=delivery ? string : string?",
  fee: "when type=delivery ? number(0,) : number?",
});
```

### Advanced Type Inference

```typescript
import { InferType } from "./Interface";

type User = InferType<typeof UserSchema>;
// Result: { id: number; email: string; name: string; age?: number; tags?: string[] }
```

## Testing Strategy

- **Unit Tests**: Each module has comprehensive unit tests
- **Integration Tests**: Test module interactions and data flow
- **Performance Tests**: Validate caching and pre-compilation benefits
- **Type Tests**: Ensure TypeScript type inference works correctly

## Future Enhancements

- **Compiler Integration**: Full TypeScript compiler API integration for `Make.fromType<T>()`
- **Advanced Conditionals**: Support for more complex conditional expressions
- **Custom Validators**: Plugin system for custom validation logic
- **Schema Composition**: Advanced schema merging and composition utilities
