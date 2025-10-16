# Modular Refactoring Plan

## Current Status
The codebase has several large files that need to be split into smaller, focused modules:

### File Sizes (lines of code)
- **parser.rs**: 1086 lines ⚠️
- **generator.rs**: 997 lines ⚠️
- **main.rs**: 624 lines ⚠️
- **lexer.rs**: 586 lines
- **interpreter.rs**: 351 lines
- **ast.rs**: 366 lines

## Proposed Module Structure

### 1. Parser Module (`src/parser/`)
**Status**: ✅ Started (mod.rs, helpers.rs created)

```
src/parser/
├── mod.rs           # Main parser struct, public API (100 lines)
├── helpers.rs       # Utility functions ✅ DONE (100 lines)
├── schema.rs        # Schema, field, mixin parsing (250 lines)
├── types.rs         # Type and constraint parsing (200 lines)
├── expressions.rs   # Expression parsing (250 lines)
└── statements.rs    # Import, export, enum, variable, function (200 lines)
```

**Benefits**:
- Each module focuses on one parsing responsibility
- Easier to test individual components
- Better code organization and maintainability

### 2. Generator Module (`src/generator/`)
**Status**: 🔄 Pending

```
src/generator/
├── mod.rs           # Main generator struct, public API (100 lines)
├── schema.rs        # Schema generation (200 lines)
├── types.rs         # Type generation (250 lines)
├── expressions.rs   # Expression generation (150 lines)
├── constraints.rs   # Constraint generation (150 lines)
└── functions.rs     # Function expansion and variable resolution (150 lines)
```

**Benefits**:
- Separates type generation from schema generation
- Function expansion logic isolated
- Easier to add new generation targets (e.g., JSON Schema)

### 3. Commands Module (`src/commands/`)
**Status**: 🔄 Pending

```
src/commands/
├── mod.rs           # Command dispatcher (50 lines)
├── build.rs         # Build command (100 lines)
├── run.rs           # Run/interpreter command (100 lines)
├── check.rs         # Check/validate commands (100 lines)
├── init.rs          # Init command (100 lines)
└── test.rs          # Test commands (lexer, parser, generator) (150 lines)
```

**Benefits**:
- Each CLI command in its own file
- Main.rs becomes just CLI definition and routing
- Easier to add new commands

### 4. Lexer Module (`src/lexer/`)
**Status**: 🔄 Optional (can be done later)

```
src/lexer/
├── mod.rs           # Main lexer struct (100 lines)
├── tokens.rs        # Token types and definitions (150 lines)
├── scanner.rs       # Character scanning logic (200 lines)
└── keywords.rs      # Keyword recognition (100 lines)
```

### 5. Interpreter Module
**Status**: ✅ Already well-sized (351 lines)
**Action**: Keep as-is for now

### 6. AST Module
**Status**: ✅ Already well-sized (366 lines)
**Action**: Keep as-is for now

## Implementation Strategy

### Phase 1: Parser Refactoring (Priority: HIGH)
1. ✅ Create `src/parser/mod.rs` and `helpers.rs`
2. Create `src/parser/expressions.rs` - Move all expression parsing
3. Create `src/parser/types.rs` - Move type and constraint parsing
4. Create `src/parser/schema.rs` - Move schema and field parsing
5. Create `src/parser/statements.rs` - Move statement parsing
6. Update imports in `src/lib.rs` or `src/main.rs`
7. Test compilation
8. Commit: "refactor: modularize parser into focused sub-modules"

### Phase 2: Generator Refactoring (Priority: HIGH)
1. Create `src/generator/mod.rs`
2. Create `src/generator/types.rs`
3. Create `src/generator/schema.rs`
4. Create `src/generator/expressions.rs`
5. Create `src/generator/constraints.rs`
6. Create `src/generator/functions.rs`
7. Update imports
8. Test compilation
9. Commit: "refactor: modularize generator into focused sub-modules"

### Phase 3: Commands Refactoring (Priority: MEDIUM)
1. Create `src/commands/mod.rs`
2. Move each command to its own file
3. Simplify `main.rs` to just CLI definition
4. Test all commands
5. Commit: "refactor: modularize CLI commands"

### Phase 4: Lexer Refactoring (Priority: LOW)
1. Optional - only if lexer grows significantly
2. Can be deferred to future work

## Benefits of Modular Structure

### Developer Experience
- **Easier Navigation**: Find code faster with focused modules
- **Better IDE Support**: Smaller files load faster, better autocomplete
- **Parallel Development**: Multiple developers can work on different modules
- **Easier Testing**: Test individual modules in isolation

### Code Quality
- **Single Responsibility**: Each module has one clear purpose
- **Reduced Complexity**: Smaller files are easier to understand
- **Better Encapsulation**: Internal functions can be module-private
- **Easier Refactoring**: Changes isolated to specific modules

### Maintenance
- **Bug Isolation**: Easier to locate and fix bugs
- **Feature Addition**: Clear where new features should go
- **Code Review**: Smaller, focused PRs
- **Documentation**: Each module can have focused documentation

## Migration Notes

### Breaking Changes
- None - this is an internal refactoring
- Public API remains the same
- All tests should pass without modification

### Testing Strategy
1. Run full test suite after each phase
2. Ensure `cargo build` succeeds
3. Test all CLI commands
4. Run example files

### Rollback Plan
- Each phase is a separate commit
- Can rollback individual phases if needed
- Git history preserved

## Next Steps

1. **Immediate**: Complete parser refactoring (Phase 1)
2. **Short-term**: Complete generator refactoring (Phase 2)
3. **Medium-term**: Complete commands refactoring (Phase 3)
4. **Long-term**: Consider lexer refactoring if needed (Phase 4)

## Estimated Effort

- **Phase 1 (Parser)**: 2-3 hours
- **Phase 2 (Generator)**: 2-3 hours
- **Phase 3 (Commands)**: 1-2 hours
- **Phase 4 (Lexer)**: 1-2 hours (optional)

**Total**: 6-10 hours for complete modularization

## Success Criteria

- ✅ All files under 300 lines
- ✅ Clear module boundaries
- ✅ All tests passing
- ✅ No breaking changes to public API
- ✅ Improved code maintainability
- ✅ Better developer experience

---

**Status**: Phase 1 started (helpers.rs and mod.rs created)
**Next**: Create remaining parser modules (expressions, types, schema, statements)
