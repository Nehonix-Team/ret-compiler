# Conditional Validation Enhancement Plan

## Executive Summary

The comprehensive test revealed critical weaknesses in Fortify Schema's conditional validation system. This plan outlines a modular architecture to fix these issues and make the library production-ready for complex real-world scenarios.

## Critical Issues Identified

### 1. **Unsupported Nested Conditional Syntax**

- **Problem**: `when level>=50 *? =full : when type=moderator *? =moderate : =basic` fails
- **Impact**: Cannot handle complex business logic with multiple conditions
- **Root Cause**: Parser doesn't support nested `when *?` clauses

### 2. **Poor Error Handling & Debugging**

- **Problem**: Generic "Unknown type" errors with no context
- **Impact**: Impossible to debug complex schemas in production
- **Root Cause**: No error recovery or detailed diagnostics

### 3. **Inconsistent Constant Value Validation**

- **Problem**: Mismatches between expected and actual values
- **Impact**: Difficult to create valid test data for complex schemas
- **Root Cause**: No schema introspection or validation helpers

### 4. **Complex Nullability Logic Issues**

- **Problem**: `features: "when status=active *? when type!=guest *? string[] : string[]? : string[]?"` fails
- **Impact**: Conditional nullability is error-prone
- **Root Cause**: Nested conditions for nullability are too complex

### 5. **Limited TypeScript Support**

- **Problem**: `!=` operator lacks IDE inference
- **Impact**: Runtime errors that could be caught at design time
- **Root Cause**: Incomplete TypeScript integration

## Modular Architecture Plan

### Phase 1: Core Parser Enhancement (Week 1-2)

#### 1.1 Enhanced Conditional Parser

```
src/core/conditional/
├── parser/
│   ├── ConditionalLexer.ts          # Tokenize conditional syntax
│   ├── ConditionalParser.ts         # Parse tokens into AST
│   ├── ConditionalAST.ts            # AST node definitions
│   └── ConditionalValidator.ts      # Validate parsed conditions
├── evaluator/
│   ├── ConditionalEvaluator.ts      # Evaluate conditions against data
│   ├── ConditionMatcher.ts          # Match conditions to values
│   └── ValueResolver.ts             # Resolve conditional values
└── types/
    ├── ConditionalTypes.ts          # Type definitions
    └── OperatorTypes.ts             # Operator definitions
```

#### 1.2 Nested Condition Support

- **Logical Operators**: Support `&&`, `||` in conditions
- **Parentheses Grouping**: `when (A && B) || C *? X : Y`
- **Nested When Clauses**: `when A *? when B *? X : Y : Z`

#### 1.3 Enhanced Operator Support

```typescript
// Current: Limited operators
when role=admin *? string[] : string[]?

// Enhanced: Full operator suite
when role.in(admin,manager) && level>=5 *? string[] : string[]?
when email.contains(@company.com) && !status.in(inactive,banned) *? string[] : string[]?
when age.between(18,65) && country.startsWith(US) *? string[] : string[]?
```

### Phase 2: Error Handling & Diagnostics (Week 2-3)

#### 2.1 Advanced Error System

```
src/core/diagnostics/
├── ErrorCollector.ts               # Collect and categorize errors
├── ErrorFormatter.ts               # Format errors with context
├── SchemaValidator.ts              # Pre-validate schemas
└── DebugLogger.ts                  # Debug conditional evaluation
```

#### 2.2 Detailed Error Messages

```typescript
// Current: Generic error
"access: Unknown type: when level>=50 *? =full"

// Enhanced: Contextual error
"access: Nested 'when' clauses not supported at position 15.
 Suggestion: Use logical operators: 'when level>=50 && type=admin *? =full : =limited'"
```

#### 2.3 Schema Introspection Tools

```typescript
// Schema validation before runtime
const validation = PerformanceSchema.validateSchema();
if (!validation.valid) {
  console.log(validation.errors); // Detailed syntax errors
}

// Get valid values for debugging
const validValues = PerformanceSchema.getValidValues("access", {
  type: "moderator",
  level: 30,
});
console.log(validValues); // ["moderate"]

// Debug condition evaluation
const debug = PerformanceSchema.debugField("access", testData);
console.log(debug.evaluationPath); // Step-by-step condition evaluation
```

### Phase 3: TypeScript Integration (Week 3-4)

#### 3.1 Enhanced Type Inference

```
src/core/typescript/
├── TypeInference.ts                # Infer types from conditions
├── ConditionalTypes.ts             # Conditional type helpers
└── IDESupport.ts                   # IDE integration utilities
```

#### 3.2 Full Operator TypeScript Support

```typescript
// Current: != lacks inference
when role!=guest *? string : string?

// Enhanced: Full inference for all operators
when role.not(guest) *? string : string?  // Full TypeScript support
when role.notIn(guest,banned) *? string : string?  // Full TypeScript support
```

### Phase 4: Advanced Features (Week 4-5)

#### 4.1 Conditional Nullability Simplification

```typescript
// Current: Complex nested nullability
features: "when status=active *? when type!=guest *? string[] : string[]? : string[]?";

// Enhanced: Simplified syntax
features: "when status=active && type.not(guest) *? string[] : string[]?";
```

#### 4.2 Test Data Generation

```
src/core/testing/
├── TestDataGenerator.ts            # Generate valid test data
├── SchemaFuzzer.ts                 # Fuzz test schemas
└── ValidationHelper.ts             # Test validation utilities
```

#### 4.3 Performance Optimization

```
src/core/performance/
├── ConditionalCache.ts             # Cache condition evaluations
├── OptimizedEvaluator.ts           # Fast path for common conditions
└── BenchmarkSuite.ts               # Performance testing
```

## Implementation TODO List

### Phase 1: Core Parser Enhancement

#### Week 1 ✅ COMPLETED

- [x] **1.1** Create `ConditionalLexer.ts` - Tokenize conditional syntax
- [x] **1.2** Create `ConditionalParser.ts` - Parse tokens into AST
- [x] **1.3** Create `ConditionalAST.ts` - Define AST node types
- [x] **1.4** Create `ConditionalValidator.ts` - Validate parsed conditions
- [x] **1.5** Add support for logical operators (`&&`, `||`)
- [x] **1.6** Add support for parentheses grouping
- [x] **1.7** Write unit tests for new parser components

#### Week 2 ✅ COMPLETED

- [x] **2.1** Create `ConditionalEvaluator.ts` - Evaluate conditions
- [x] **2.2** Create `ConditionMatcher.ts` - Match conditions to values (integrated in evaluator)
- [x] **2.3** Create `ValueResolver.ts` - Resolve conditional values (integrated in evaluator)
- [x] **2.4** Add support for nested `when` clauses
- [x] **2.5** Integrate new parser with existing validation system
- [x] **2.6** Add comprehensive operator support
- [x] **2.7** Performance test new parser vs old parser

### Phase 2: Error Handling & Diagnostics ✅ COMPLETED

#### Week 2-3 ✅ COMPLETED

- [x] **3.1** Create `ErrorCollector.ts` - Collect and categorize errors (integrated in parser)
- [x] **3.2** Create `ErrorFormatter.ts` - Format errors with context (integrated in parser)
- [x] **3.3** Create `SchemaValidator.ts` - Pre-validate schemas (AST validation)
- [x] **3.4** Create `DebugLogger.ts` - Debug conditional evaluation (integrated in evaluator)
- [x] **3.5** Implement detailed error messages with suggestions
- [x] **3.6** Add schema introspection API (ASTAnalyzer)
- [x] **3.7** Create debugging tools for condition evaluation

### Phase 3: TypeScript Integration ✅ COMPLETED

#### Week 3-4 ✅ COMPLETED

- [x] **4.1** Create `TypeInference.ts` - Infer types from conditions
- [x] **4.2** Create `ConditionalTypes.ts` - Conditional type helpers
- [x] **4.3** Create `IDESupport.ts` - IDE integration utilities
- [x] **4.4** Add full TypeScript support for all operators
- [x] **4.5** Implement type-safe conditional validation
- [x] **4.6** Add IDE autocomplete for conditional syntax
- [x] **4.7** Create TypeScript declaration files

### Phase 4: Advanced Features ✅ COMPLETED

#### Week 4-5 ✅ COMPLETED

- [x] **5.1** Create `TestDataGenerator.ts` - Generate valid test data
- [x] **5.2** Create `SchemaFuzzer.ts` - Fuzz test schemas (integrated in TestDataGenerator)
- [x] **5.3** Create `ValidationHelper.ts` - Test validation utilities (integrated in TestDataGenerator)
- [x] **5.4** Simplify conditional nullability syntax
- [x] **5.5** Add performance optimizations
- [x] **5.6** Create comprehensive documentation
- [x] **5.7** Add migration guide from old syntax

### Phase 5: Integration & Testing

#### Week 5-6

- [ ] **6.1** Update existing Interface implementation
- [ ] **6.2** Migrate all existing conditional tests
- [ ] **6.3** Create comprehensive test suite
- [ ] **6.4** Performance benchmarking
- [ ] **6.5** Documentation updates
- [ ] **6.6** Migration tools for existing schemas
- [ ] **6.7** Production readiness validation

## Success Metrics

### Functionality

- [ ] Support for nested conditional syntax
- [ ] 100% test pass rate on complex scenarios
- [ ] Full TypeScript inference for all operators
- [ ] Detailed error messages with context

### Performance

- [ ] <1ms average validation time for complex conditions
- [ ] Memory usage <10MB for 1000 schema instances
- [ ] 95%+ cache hit rate for repeated validations

### Developer Experience

- [ ] Schema validation catches 90%+ errors at design time
- [ ] Error messages include actionable suggestions
- [ ] Test data generation reduces debugging time by 50%
- [ ] Full IDE support with autocomplete

## Next Steps

1. **Start with Phase 1.1**: Create the enhanced conditional lexer
2. **Modular Development**: Each component is independent and testable
3. **Backward Compatibility**: Ensure existing schemas continue to work
4. **Incremental Rollout**: Phase-by-phase implementation with testing
5. **Documentation**: Update docs as each phase completes

This plan transforms Fortify Schema from a basic validation library into a production-ready system capable of handling complex real-world business logic with excellent developer experience.
