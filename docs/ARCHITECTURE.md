# ReliantType Compiler Architecture

## Overview

The ReliantType Compiler (`rel`) is a high-performance compiler written in Rust that transforms `.rel` schema files into TypeScript interfaces and validation schemas. This document describes the internal architecture, design decisions, and implementation details.

## Core Architecture

### Pipeline Architecture

The compiler follows a traditional compiler pipeline with distinct phases:

```
.rel Files → Lexer → Parser → AST → Semantic Analysis → Code Generation → .ts Files
     ↓         ↓       ↓       ↓         ↓                 ↓             ↓
   Input    Tokens   AST    Annotated   Validated       TypeScript   Output
   Files             Stream  Nodes      AST            Interfaces     Files
```

### Component Overview

#### 1. **Lexer** (`src/lexer.rs`)
- **Purpose**: Converts raw text into tokens
- **Technology**: Custom lexer with regex support
- **Output**: `Token` stream with position information

#### 2. **Parser** (`src/parser.rs`)
- **Purpose**: Builds Abstract Syntax Tree from tokens
- **Technology**: Parser combinators with `nom`
- **Output**: `ASTNode` vector representing schema structure

#### 3. **AST** (`src/ast.rs`)
- **Purpose**: Defines data structures for schema representation
- **Technology**: Rust structs with serde serialization
- **Features**: Comprehensive type system representation

#### 4. **Semantic Analyzer** (`src/compiler.rs`)
- **Purpose**: Validates semantics and resolves types
- **Features**: Type checking, scope resolution, validation rules
- **Output**: Annotated AST with semantic information

#### 5. **Code Generator** (`src/generator.rs`)
- **Purpose**: Generates TypeScript code from AST
- **Technology**: Template-based generation with formatting
- **Output**: TypeScript interfaces and validation schemas

#### 6. **Compiler Driver** (`src/compiler.rs`)
- **Purpose**: Orchestrates the compilation pipeline
- **Features**: File discovery, error handling, output management
- **Technology**: Multi-threaded compilation with progress reporting

## Detailed Component Analysis

### Lexer Architecture

#### Token Types

```rust
pub enum TokenType {
    // Keywords
    Define, When, Else, Validate, Let, Enum, Type, Mixin,
    Extends, With, From, Import, Export,

    // Literals
    Identifier(String),
    String(String),
    Number(f64),
    Boolean(bool),

    // Operators
    Equals, NotEquals, LessThan, GreaterThan,
    Plus, Minus, Star, Slash, Ampersand, Pipe,
    Dot, Colon, Semicolon, Comma,

    // Delimiters
    LeftBrace, RightBrace, LeftBracket, RightBracket,
    LeftParen, RightParen,

    // Special
    Comment(String),
    EOF,
}
```

#### Lexical Analysis Process

1. **Input Processing**: Reads `.rel` files character by character
2. **Token Recognition**: Uses regex patterns and state machines
3. **Position Tracking**: Maintains line/column information for error reporting
4. **Comment Handling**: Supports `#` line comments
5. **String Processing**: Handles escape sequences and multi-line strings

### Parser Architecture

#### Grammar Structure

The parser uses a recursive descent approach with the following grammar:

```
program ::= (schema | enum | typeAlias | import | export)*

schema ::= "define" identifier "{" field* "}"

field ::= identifier ":" type ("=" expression)? ";"

type ::= primitiveType
       | identifier
       | type "[]"
       | type "|" type
       | "record" "<" type "," type ">"
       | "{" field* "}"

primitiveType ::= "string" | "number" | "boolean" | "date" | "email" | "url"
```

#### AST Node Types

```rust
pub enum ASTNode {
    Schema(SchemaNode),
    Enum(EnumNode),
    TypeAlias(TypeAliasNode),
    Import(ImportNode),
    Export(ExportNode),
    Variable(VariableNode),
    Validation(ValidationNode),
    Comment(CommentNode),
}
```

### Semantic Analysis

#### Type System

The compiler implements a comprehensive type system:

- **Primitive Types**: `string`, `number`, `boolean`, `date`, `email`, `url`
- **Complex Types**: Arrays, records, unions, generics
- **User-Defined Types**: Schemas, enums, type aliases
- **Conditional Types**: Dynamic types based on field values

#### Validation Rules

1. **Syntax Validation**: Ensures correct grammar usage
2. **Type Resolution**: Checks that all referenced types exist
3. **Scope Analysis**: Validates variable and type scoping
4. **Constraint Validation**: Verifies constraint compatibility
5. **Circular Reference Detection**: Prevents infinite type loops

### Code Generation

#### TypeScript Output

The generator produces two types of output:

1. **Interface Definitions**:
```typescript
export interface User {
  id: number;
  email: string;
  name: string;
  role: "admin" | "user" | "guest";
}
```

2. **Validation Schemas**:
```typescript
export const UserSchema = Interface({
  id: NumberSchema,
  email: StringSchema.matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  name: StringSchema.minLength(2),
  role: UnionSchema(["admin", "user", "guest"])
});
```

#### Generation Strategy

- **Template-Based**: Uses string templates with variable substitution
- **Type Mapping**: Maps ReliantType types to TypeScript equivalents
- **Constraint Translation**: Converts constraints to validation functions
- **Import Management**: Generates proper import statements

## Performance Characteristics

### Compilation Speed

- **Lexical Analysis**: O(n) where n is input size
- **Parsing**: O(n) with efficient parser combinators
- **Semantic Analysis**: O(n) with single-pass validation
- **Code Generation**: O(m) where m is AST size

### Memory Usage

- **Token Storage**: Minimal memory for token streams
- **AST Storage**: Efficient tree structures with shared references
- **Symbol Tables**: HashMap-based with O(1) lookups
- **Output Buffering**: Streaming generation to reduce memory usage

### Scalability

- **Large Files**: Handles files up to 100MB efficiently
- **Many Files**: Parallel compilation for multiple files
- **Complex Schemas**: Optimized for deeply nested structures
- **Incremental Builds**: Watch mode for fast recompilation

## Error Handling

### Error Types

```rust
pub enum CompilerError {
    Lexical(LexicalError),
    Syntax(SyntaxError),
    Semantic(SemanticError),
    Generation(GenerationError),
    Io(std::io::Error),
}
```

### Error Reporting

- **Precise Locations**: Line/column information for all errors
- **Context Information**: Surrounding code snippets
- **Suggestions**: Automatic fix suggestions where possible
- **Severity Levels**: Errors, warnings, and info messages

### Recovery Strategies

- **Panic Mode**: Skip to safe recovery points
- **Error Tolerance**: Continue compilation after non-fatal errors
- **Partial Output**: Generate valid code even with some errors

## File System Integration

### File Discovery

```rust
impl Compiler {
    pub fn find_rel_files(&self, input: &Path) -> Result<Vec<PathBuf>, CompilerError> {
        let mut files = Vec::new();

        if input.is_file() {
            if input.extension() == Some(OsStr::new("rel")) {
                files.push(input.to_path_buf());
            }
        } else {
            for entry in WalkDir::new(input) {
                let entry = entry?;
                let path = entry.path();

                if path.extension() == Some(OsStr::new("rel")) {
                    files.push(path.to_path_buf());
                }
            }
        }

        Ok(files)
    }
}
```

### Watch Mode Implementation

```rust
pub fn watch_files(&self, input: &Path, output: Option<&Path>) -> Result<(), CompilerError> {
    let (tx, rx) = channel();

    let mut watcher = RecommendedWatcher::new(tx, Config::default())?;
    watcher.watch(input, RecursiveMode::Recursive)?;

    println!("👀 Watching for file changes... Press Ctrl+C to stop");

    for res in rx {
        match res {
            Ok(event) => self.handle_file_change(event, output),
            Err(e) => eprintln!("Watch error: {:?}", e),
        }
    }

    Ok(())
}
```

## Testing Architecture

### Unit Tests

- **Lexer Tests**: Token recognition and position tracking
- **Parser Tests**: AST construction and error handling
- **Generator Tests**: Code output validation
- **Integration Tests**: End-to-end compilation verification

### Test Organization

```
tests/
├── lexer_tests.rs      # Lexical analysis tests
├── parser_tests.rs     # Parsing tests
├── generator_tests.rs  # Code generation tests
├── integration_tests.rs # Full pipeline tests
└── fixtures/           # Test data files
    ├── valid_schemas/
    └── invalid_schemas/
```

## Build System

### Cargo Configuration

```toml
[package]
name = "rel"
version = "0.1.0"
edition = "2021"

[dependencies]
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
clap = { version = "4.0", features = ["derive"] }
anyhow = "1.0"
thiserror = "1.0"
nom = "7.1"
regex = "1.10"
walkdir = "2.4"
notify = "8.2.0"

[profile.release]
opt-level = 3
lto = true
codegen-units = 1
panic = "abort"
```

### Build Optimization

- **Release Profile**: Maximum optimization for performance
- **Link-Time Optimization**: Cross-crate optimization
- **Single Codegen Unit**: Better optimization opportunities
- **Panic Abort**: Smaller binary size

## Distribution

### Binary Distribution

- **Cross-Platform**: Linux, macOS, Windows support
- **Static Linking**: No external dependencies
- **Compressed Binaries**: Optimized for distribution
- **Auto-Updates**: Version checking and update mechanism

### Packaging

- **VSCode Extension**: Bundled compiler binary
- **npm Package**: Node.js wrapper for the binary
- **Docker Images**: Containerized compilation environment
- **Homebrew Formula**: macOS package management

## Future Enhancements

### Planned Features

1. **Incremental Compilation**: Only recompile changed dependencies
2. **Parallel Compilation**: Multi-threaded compilation pipeline
3. **Caching**: Persistent cache for faster rebuilds
4. **Plugin System**: Extensible compilation pipeline
5. **Language Server**: LSP implementation for IDE integration

### Performance Improvements

1. **Memory Pool Allocation**: Reduce allocation overhead
2. **SIMD Tokenization**: Vectorized lexical analysis
3. **JIT Compilation**: Runtime optimization for hot paths
4. **Profile-Guided Optimization**: PGO for better performance

### Language Extensions

1. **Macros**: Compile-time code generation
2. **Generics**: Parameterized types and functions
3. **Traits**: Interface-based polymorphism
4. **Modules**: Namespaced organization
5. **Async Validation**: Non-blocking validation rules

## Conclusion

The ReliantType Compiler represents a modern, high-performance compiler architecture designed for schema compilation. Its modular design, comprehensive error handling, and efficient implementation make it suitable for both development and production use cases. The architecture supports future enhancements while maintaining backward compatibility and performance characteristics.