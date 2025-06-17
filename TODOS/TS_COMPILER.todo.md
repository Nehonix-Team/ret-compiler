# Fortify Schema - TODO & Contributing Guide

This document outlines the current development status, high-priority tasks, and guidelines for contributing to Fortify Schema.

## Current Development Status

### Unreleased Features (Work in Progress)

The following features are under development and not ready for public use:

#### 1. Make.fromType<T>() - TypeScript Type Inference
- **Status**: ❌ Not functional - Returns `"any"` instead of inferred schemas.
- **Issue**: Compile-time type inference is not implemented.
- **Current Behavior**:
  ```typescript
  email: Make.fromType<User['email']>(),  // ❌ Returns "any" - no validation
  ```
- **Expected Behavior**:
  ```typescript
  email: Make.fromType<User['email']>(),  // ✅ Returns "string" - validates as string
  ```

#### 2. Make.fromInterface<T>() - Interface Schema Generation
- **Status**: ❌ Not functional - Returns `{}` instead of inferred schemas.
- **Issue**: Compile-time interface analysis is not implemented.
- **Current Behavior**:
  ```typescript
  const schema = Interface(Make.fromInterface<User>());  // ❌ Returns {} - no validation
  ```
- **Expected Behavior**:
  ```typescript
  const schema = Interface(Make.fromInterface<User>());  // ✅ Generates full schema
  ```

## High-Priority TODOs

### 1. TypeScript Compiler API Integration
- **Priority**: Critical
- **Assignee**: Open for contribution
- **Description**: Implement compile-time TypeScript-to-schema conversion for `Make.fromType<T>()` and `Make.fromInterface<T>()`.
- **Requirements**:
  - [ ] Build-time transformation pipeline.
  - [ ] TypeScript AST analysis for type inference.
  - [ ] Replace `Make.fromType<T>()` calls with schema strings during compilation.
  - [ ] Support for Webpack, Vite, and Rollup plugins.
  - [ ] CLI tool for schema generation.
- **Files**:
  - `src/core/compiler/TypeAnalyzer.ts` (✅ Foundation exists)
  - `src/core/compiler/SchemaTransformer.ts` (✅ Foundation exists)
  - `src/core/compiler/BuildPlugin.ts` (❌ Needs creation)
  - `src/core/compiler/CLI.ts` (❌ Needs creation)
- **Expected Result**:
  ```typescript
  // Before (build-time):
  email: Make.fromType<User['email']>(),

  // After (build-time transformation):
  email: "string",
  ```

### 2. Enhanced Runtime Type Inference
- **Priority**: High
- **Assignee**: Open for contribution
- **Description**: Improve `Make.fromSample()` for better runtime type detection.
- **Requirements**:
  - [ ] Detect formats (email, URL, UUID, etc.).
  - [ ] Support nested object analysis.
  - [ ] Infer array element types.
  - [ ] Detect optional fields.
  - [ ] Infer union types from sample data.
- **Files**:
  - `src/core/schema/mode/interfaces/TypeToSchemaConverter.ts`
  - `src/core/utils/Make.ts`

### 3. Record<T, K> Validation Enhancement
- **Priority**: Medium
- **Assignee**: Open for contribution
- **Description**: Improve validation for Record types in `InterfaceSchema`.
- **Requirements**:
  - [ ] Enhance Record type detection.
  - [ ] Support complex Record value types.
  - [ ] Enable nested Record validation.
  - [ ] Optimize performance for large Records.
- **Files**:
  - `src/core/schema/mode/interfaces/InterfaceSchema.ts`

### 4. Documentation & Examples
- **Priority**: Medium
- **Assignee**: Open for contribution
- **Description**: Enhance documentation to cover all stable features.
- **Requirements**:
  - [ ] Update `README.md` with stable examples only.
  - [ ] Remove unreleased feature references from documentation.
  - [ ] Expand migration guides in `MIGRATION.md`.
  - [ ] Create video tutorials for key features.
  - [ ] Add performance benchmarks to `README.md`.
- **Files**:
  - `README.md`
  - `docs/MIGRATION.md`
  - `docs/EXAMPLES.md`

## Technical Debt & Improvements

### 1. Code Organization
- [ ] Refactor files exceeding 500 lines into smaller modules.
- [ ] Improve TypeScript type definitions.
- [ ] Add comprehensive JSDoc comments.
- [ ] Standardize error message formats.

### 2. Testing
- [ ] Add unit tests for all stable features.
- [ ] Create integration tests for complex schemas.
- [ ] Implement performance benchmarks.
- [ ] Ensure browser compatibility tests.

### 3. Performance
- [ ] Optimize validation algorithms for speed.
- [ ] Reduce bundle size through modularization.
- [ ] Enhance tree-shaking support.
- [ ] Minimize memory usage during validation.

## Future Features (Ideas)

### 1. Advanced Conditional Validation
- Support nested conditional logic.
- Enable cross-field validation.
- Implement dynamic schema generation.
- Allow custom validation functions.

### 2. Schema Serialization
- Export schemas to JSON Schema.
- Integrate with OpenAPI specifications.
- Generate GraphQL schemas.
- Support database schema generation.

### 3. IDE Integration
- Develop a VSCode extension.
- Enable real-time schema previews.
- Provide auto-completion for schema strings.
- Implement error highlighting.

## How to Contribute

### 1. Pick a TODO Item
- Select an item from the TODO list above.
- Comment on or create a GitHub issue to claim it.
- Assign yourself to prevent duplicate efforts.

### 2. Development Setup
```bash
git clone <repository>
cd fortify-schema
npm install
npm run test
```

### 3. Development Guidelines
- Keep files under 500 lines, using modules as needed.
- Include comprehensive tests for success and failure cases.
- Update documentation (`README.md`, `EXAMPLES.md`) for new features.
- Follow TypeScript best practices with strict typing.
- Avoid breaking changes to maintain backward compatibility.

### 4. Testing Your Changes
```bash
# Run all tests
npm run test

# Test specific feature
npm run test:schema

# Run performance benchmarks
npm run benchmark
```

### 5. Submitting Changes
- Create a feature branch: `git checkout -b feature/your-feature-name`
- Implement changes with accompanying tests.
- Update relevant documentation.
- Submit a pull request with a clear description of changes.

## Stable Features

The following features are stable and ready for production use:

### 1. Basic Schema Definition
```typescript
const schema = Interface({
  id: "positive",                               // Positive integer
  email: "email",                               // Email format
  name: "string(2,50)",                         // String with length constraints
  tags: "string[]?",                            // Optional string array
  status: Make.union("active", "inactive", "pending") // Union type
});
```

### 2. Conditional Validation
```typescript
const schema = Interface({
  role: Make.union("admin", "user"),           // Role options
  permissions: "when role=admin *? string[] : string[]?" // Conditional permissions
});
```

### 3. Runtime Type Inference
```typescript
const schema = Interface(Make.fromSample(sampleData));
```

### 4. Record Types
```typescript
const schema = Interface({
  metadata: "record<string,any>",               // Record with any values
  settings: "record<string,string>"             // Record with string values
});
```

## Contact & Support

- **Issues**: Report bugs or request features via GitHub Issues.
- **Discussions**: Use GitHub Discussions for questions and ideas.
- **Documentation**: Refer to `README.md` and `docs/` folder.
- **Examples**: Explore working code in `examples/` folder.

## Contributors

Thank you to all contributors helping improve Fortify Schema!

<!-- Contributors will be added here automatically -->

---

**Last Updated**: 2025-06-17  
**Next Review**: Upon completion of TypeScript Compiler API integration