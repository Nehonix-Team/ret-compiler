# ReliantType Compiler (ReT) - Complete Usage Guide

## Overview

The ReliantType Compiler (`rel`) is a powerful command-line tool that compiles `.rel` (ReliantType) schema files into TypeScript interfaces and validation schemas. It provides real-time type checking, schema validation, and code generation capabilities similar to how TypeScript compiles `.ts` files.

## Installation

### From Source

```bash
# Clone the repository
git clone https://github.com/Nehonix-Team/reliant-type.git
cd reliant-type/ret-compiler

# Build the compiler
cargo build --release

# The binary will be available at target/release/rel
```

### Pre-built Binaries

Download pre-built binaries from the [releases page](https://github.com/Nehonix-Team/reliant-type/releases).

## Quick Start

### 1. Initialize a New Project

```bash
# Create a new directory for your project
mkdir my-rel-project
cd my-rel-project

# Initialize the project structure
rel init
```

This creates:
- `schemas/` directory for your `.rel` files
- `rel.json` configuration file
- `README.md` with project documentation
- Example `User.rel` schema file

### 2. Create Your First Schema

Edit `schemas/User.rel`:

```rel
define User {
  id: number
  email: string & matches(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
  name: string & minLength(2)
  age: number & positive & integer & min(13) & max(120)
  role: admin | user | guest
  createdAt: date
  isActive: boolean = true
}

export User
```

### 3. Compile to TypeScript

```bash
# Compile all schemas in the current directory
rel build --input schemas --output generated

# Or compile a specific file
rel build --input schemas/User.rel --output generated
```

This generates TypeScript interfaces and validation schemas in the `generated/` directory.

## Command Reference

### Global Options

- `-h, --help`: Display help information
- `-V, --version`: Display version information

### Commands

#### `rel build` - Compile Schemas

Compile `.rel` files to TypeScript interfaces and validation schemas.

```bash
rel build [OPTIONS]

OPTIONS:
    -i, --input <INPUT>     Input .rel file or directory [required]
    -o, --output <OUTPUT>   Output directory for generated TypeScript files
    --watch                 Watch mode - rebuild on file changes

EXAMPLES:
    # Build all schemas in current directory
    rel build --input .

    # Build specific file with custom output
    rel build --input schemas/User.rel --output ./types

    # Watch mode for development
    rel build --input schemas --output generated --watch
```

#### `rel init` - Initialize Project

Create a new ReliantType project with the standard directory structure.

```bash
rel init [OPTIONS]

OPTIONS:
    -d, --dir <DIR>    Project directory (defaults to current directory)

EXAMPLES:
    # Initialize in current directory
    rel init

    # Initialize in specific directory
    rel init --dir ./my-project
```

#### `rel check` - Syntax Check

Check `.rel` files for syntax errors without generating output.

```bash
rel check [OPTIONS]

OPTIONS:
    -i, --input <INPUT>    Input .rel file or directory [required]

EXAMPLES:
    # Check all files in schemas directory
    rel check --input schemas

    # Check specific file
    rel check --input schemas/User.rel
```

#### `rel validate` - Full Validation

Validate `.rel` files with enhanced semantic validation including type checking.

```bash
rel validate [OPTIONS]

OPTIONS:
    -i, --input <INPUT>    Input .rel file or directory [required]

EXAMPLES:
    # Validate all schemas
    rel validate --input schemas

    # Validate specific file
    rel validate --input schemas/User.rel
```

#### `rel watch` - Watch Mode

Monitor `.rel` files for changes and automatically recompile.

```bash
rel watch [OPTIONS]

OPTIONS:
    -i, --input <INPUT>     Input .rel file or directory [required]
    -o, --output <OUTPUT>   Output directory for generated TypeScript files

EXAMPLES:
    # Watch schemas directory
    rel watch --input schemas --output generated
```

#### `rel test-lexer` - Test Lexer

Test the lexical analysis phase with custom input.

```bash
rel test-lexer <INPUT>

EXAMPLES:
    rel test-lexer "define User { id: number }"
```

#### `rel test-parser` - Test Parser

Test the parsing phase with custom input.

```bash
rel test-parser <INPUT>

EXAMPLES:
    rel test-parser "define User { id: number }"
```

#### `rel test-generator` - Test Generator

Test the code generation phase with custom input.

```bash
rel test-generator <INPUT>

EXAMPLES:
    rel test-generator "define User { id: number }"
```

## Schema Language Reference

### Basic Schema Definition

```rel
define SchemaName {
  fieldName: FieldType
  anotherField: FieldType = defaultValue
}
```

### Field Types

#### Primitive Types
- `string` - Text data
- `number` - Numeric data
- `boolean` - True/false values
- `date` - Date and time
- `email` - Email addresses with validation
- `url` - URLs with validation

#### Complex Types
- `Type[]` - Arrays
- `record<KeyType, ValueType>` - Key-value maps
- `{ field1: Type1, field2: Type2 }` - Objects
- `Type1 | Type2 | Type3` - Union types

### Constraints

#### String Constraints
- `minLength(n)` - Minimum length
- `maxLength(n)` - Maximum length
- `matches(regex)` - Regex pattern matching
- `hasUppercase` - Contains uppercase letters
- `hasLowercase` - Contains lowercase letters
- `hasNumber` - Contains digits
- `hasSpecialChar` - Contains special characters

#### Numeric Constraints
- `min(n)` - Minimum value
- `max(n)` - Maximum value
- `positive` - Must be > 0
- `negative` - Must be < 0
- `integer` - Must be whole number
- `between(min, max)` - Range check

#### Date Constraints
- `future` - Must be in the future
- `past` - Must be in the past
- `before(date)` - Must be before specified date
- `after(date)` - Must be after specified date

### Advanced Features

#### Conditional Fields

```rel
define Product {
  type: physical | digital

  when type = physical {
    weight: number & positive
    dimensions: string
  } else when type = digital {
    downloadUrl: url
    fileSize: number & positive
  }
}
```

#### Enums

```rel
enum UserRole {
  admin
  moderator
  user
  guest
}
```

#### Type Aliases

```rel
type EmailString = string & matches(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
type PositiveInt = number & min(0) & integer
```

#### Mixins and Inheritance

```rel
mixin Timestamped {
  createdAt: date
  updatedAt: date
}

define User with Timestamped {
  id: number
  name: string
}
```

#### Validation Rules

```rel
define Order {
  amount: number & positive
  userId: number

  validate amount <= 1000
  validate userId > 0
}
```

#### Imports and Exports

```rel
# Import from other files
from "./types.rel" import User, Product
from "./validations.rel" import PaymentValidation as PaymentVal

# Export schemas
export User, Product, Order
```

## Project Configuration

### rel.json Configuration File

```json
{
  "name": "my-rel-project",
  "version": "1.0.0",
  "schemas": "./schemas",
  "output": "./generated",
  "compilerOptions": {
    "strict": true,
    "validateConstraints": true
  }
}
```

### Directory Structure

```
my-rel-project/
├── schemas/           # .rel schema files
│   ├── User.rel
│   ├── Product.rel
│   └── Order.rel
├── generated/         # Generated TypeScript files
│   ├── User.ts
│   ├── Product.ts
│   └── index.ts
├── rel.json          # Project configuration
└── README.md         # Project documentation
```

## Generated Output

### TypeScript Interfaces

```typescript
// Generated from User.rel
export interface User {
  id: number;
  email: string;
  name: string;
  age: number;
  role: "admin" | "user" | "guest";
  createdAt: Date;
  isActive: boolean;
}
```

### Validation Schemas

```typescript
// Generated validation schema
export const UserSchema = Interface({
  id: NumberSchema,
  email: StringSchema.matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  name: StringSchema.minLength(2),
  age: NumberSchema.positive().integer().min(13).max(120),
  role: UnionSchema(["admin", "user", "guest"]),
  createdAt: DateSchema,
  isActive: BooleanSchema.default(true)
});
```

## Integration Examples

### TypeScript/JavaScript Projects

```typescript
import { UserSchema } from './generated/User';
import type { User } from './generated/User';

// Type-safe validation
const userData = { id: 1, email: "user@example.com", name: "John" };
const result = UserSchema.safeParse(userData);

if (result.success) {
  const user: User = result.data;
  console.log("Valid user:", user);
} else {
  console.log("Validation errors:", result.errors);
}
```

### Node.js API Validation

```javascript
const express = require('express');
const { UserSchema } = require('./generated/User');

const app = express();
app.use(express.json());

app.post('/users', (req, res) => {
  const result = UserSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ errors: result.errors });
  }

  // Save user to database
  const user = result.data;
  // ... save logic

  res.json({ user });
});
```

## Error Handling

### Common Error Types

#### Syntax Errors
```
Error: Expected type name at line 5, column 12
  email: invalid_type
          ^
```

#### Semantic Errors
```
Error: Undefined type 'InvalidType' at line 8, column 15
  customField: InvalidType
                ^
```

#### Validation Errors
```
Error: Duplicate field name 'id' in schema 'User' at line 6, column 3
  id: string
  ^
```

### Error Format

Errors follow the standard format:
```
file.rel:line:column: severity: message
```

Example:
```
User.rel:5:12: error: Expected type name
Product.rel:10:8: warning: Unused import
```

## Performance Considerations

### Compilation Speed
- The compiler is optimized for fast compilation
- Large projects with many schemas compile quickly
- Watch mode provides near-instant recompilation

### Memory Usage
- Low memory footprint for typical projects
- Scales well with large schema files
- Efficient AST representation

### File Watching
- Uses efficient file system monitoring
- Only recompiles changed files
- Debounced rebuilds prevent excessive compilation

## Troubleshooting

### Common Issues

#### "Command not found"
Ensure the `rel` binary is in your PATH or use the full path.

#### "Permission denied"
Make sure the binary has execute permissions:
```bash
chmod +x rel
```

#### "File not found"
Check that your input paths are correct and files exist.

#### Compilation Errors
- Verify schema syntax against the language reference
- Check for undefined types and circular references
- Ensure all imports are valid

### Debug Mode

Use the test commands to debug compilation issues:

```bash
# Test lexical analysis
rel test-lexer "define User { id: number }"

# Test parsing
rel test-parser "define User { id: number }"

# Test code generation
rel test-generator "define User { id: number }"
```

## Contributing

### Building from Source

```bash
# Clone and build
git clone https://github.com/Nehonix-Team/reliant-type.git
cd reliant-type/ret-compiler
cargo build --release
```

### Running Tests

```bash
cargo test
```

### Code Structure

- `src/main.rs` - CLI interface and command handling
- `src/lexer.rs` - Lexical analysis (tokenization)
- `src/parser.rs` - Syntax analysis (AST building)
- `src/ast.rs` - Abstract Syntax Tree definitions
- `src/generator.rs` - TypeScript code generation
- `src/compiler.rs` - Main compilation logic

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Support

- **Documentation**: https://github.com/Nehonix-Team/reliant-type/docs
- **Issues**: https://github.com/Nehonix-Team/reliant-type/issues
- **Discussions**: https://github.com/Nehonix-Team/reliant-type/discussions

---

For more advanced usage and examples, see the [examples directory](https://github.com/Nehonix-Team/reliant-type/tree/main/ret-compiler/examples) in the repository.