# Import/Export System Design

## Goals
1. Allow modular schema definitions across multiple files
2. Resolve dependencies automatically
3. Generate single output file with all dependencies
4. Support cross-file type references

## Syntax

### Import
```rel
import { User, Product } from "./types.rel"
import * as Types from "./types.rel"
```

### Export
```rel
export User, Product, UserRole
export * from "./base.rel"
```

## Implementation Plan

### Phase 1: Parser Updates
- [x] Import statement parsing (already exists in AST)
- [x] Export statement parsing (already exists in AST)
- [ ] Add import resolution to compiler

### Phase 2: Dependency Resolution
- [ ] File path resolution (relative paths)
- [ ] Circular dependency detection
- [ ] Dependency graph building
- [ ] Topological sort for correct order

### Phase 3: Code Generation
- [ ] Merge all dependencies into single output
- [ ] Remove duplicate imports
- [ ] Preserve export statements
- [ ] Handle cross-file type references

### Phase 4: Testing
- [ ] Test simple imports
- [ ] Test nested imports (A imports B imports C)
- [ ] Test circular dependency detection
- [ ] Test wildcard imports

## File Structure Example

```
schemas/
  ├── base.rel          # Base types
  ├── user.rel          # User schema (imports base)
  ├── product.rel       # Product schema (imports user)
  └── index.rel         # Main file (imports all)
```

## Generated Output

When compiling `index.rel`, the compiler should:
1. Parse index.rel
2. Find all imports
3. Recursively parse imported files
4. Build dependency graph
5. Sort dependencies
6. Generate single .ts file with all schemas in correct order
