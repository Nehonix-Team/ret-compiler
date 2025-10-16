# ReliantType Compiler Documentation

## Overview

The **ReliantType Compiler** (`rel`) is a high-performance command-line tool written in Rust that compiles `.rel` (ReliantType) schema files into TypeScript interfaces and validation schemas. It provides real-time type checking, schema validation, and code generation capabilities similar to how TypeScript compiles `.ts` files.
> **Formerly Fortify Schema** - Originally developed at [github.com/Nehonix-Team/fortify-schema](https://github.com/Nehonix-Team/fortify-schema)

⚠️ **Migration Notice**: The `fortify-schema` package will be deprecated in favor of `reliant-type`. While `fortify-schema` will continue to receive critical security updates, new features and improvements will only be available in `reliant-type`. We recommend migrating to `reliant-type` for the best experience and ongoing support.


## Key Features

- 🚀 **High Performance**: Written in Rust for maximum speed and memory efficiency
- 🔍 **Real-time Validation**: Comprehensive syntax and semantic validation
- 🎯 **Type Safety**: Generates fully typed TypeScript interfaces
- ⚡ **Fast Compilation**: Optimized compilation pipeline
- 📦 **VSCode Integration**: Real-time validation and IntelliSense support
- 🛠️ **Developer Experience**: Rich error messages and debugging tools

## Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/Nehonix-Team/ret-compiler
cd reliant-type/ret-compiler

# Build the compiler
cargo build --release

# The binary will be available at target/release/rel
```

### Your First Schema

Create a file called `User.rel`:

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

### Compile to TypeScript

```bash
rel build --input User.rel --output generated
```

This generates:
- `generated/User.ts` - TypeScript interfaces
- `generated/UserSchema.ts` - Validation schemas

## Documentation Structure

### 📖 [Usage Guide](USAGE.md)
Complete command reference and usage instructions
- Installation and setup
- All CLI commands and options
- Schema language reference
- Configuration options
- Error handling and troubleshooting

### 🏗️ [Architecture](ARCHITECTURE.md)
Internal compiler architecture and design
- Pipeline overview
- Component architecture
- Performance characteristics
- Error handling strategies
- Build system details

### 💡 [Examples](EXAMPLES.md)
Comprehensive examples and use cases
- Basic schemas
- Advanced types and constraints
- Conditional validation
- Real-world applications
- Integration patterns

## Schema Language

ReliantType uses a clean, TypeScript-inspired syntax for defining schemas:

### Basic Types
```rel
define User {
  id: number              # Numbers
  email: string          # Strings
  active: boolean        # Booleans
  created: date          # Dates
  profile: url           # URLs with validation
}
```

### Constraints
```rel
define Product {
  name: string & minLength(1) & maxLength(100)
  price: number & positive & max(999.99)
  sku: string & matches(r"^[A-Z]{2}-\d{6}$")
}
```

### Complex Types
```rel
define Order {
  items: OrderItem[]                    # Arrays
  metadata: record<string, any>         # Key-value maps
  address: {                            # Objects
    street: string
    city: string
    zipCode: string
  }
  status: pending | processing | shipped # Unions
}
```

### Conditional Validation
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

## CLI Commands

### Build Schemas
```bash
rel build --input schemas --output generated
rel build --input User.rel --output types --watch
```

### Validate Schemas
```bash
rel validate --input schemas
rel check --input User.rel
```

### Development Tools
```bash
rel watch --input schemas --output generated
rel test-lexer "define User { id: number }"
rel test-parser "define User { id: number }"
```

### Project Management
```bash
rel init --dir my-project
```

## VSCode Extension

The ReliantType VSCode extension provides:

- **Syntax Highlighting**: Full color coding for `.rel` files
- **Real-time Validation**: Instant error checking as you type
- **IntelliSense**: Smart autocompletion and hover information
- **Code Snippets**: Templates for common patterns
- **Commands**: Build, validate, and watch from the editor

### Installation

1. Install the extension from the marketplace
2. Open a `.rel` file
3. Start coding with full IDE support!

## Generated Output

### TypeScript Interfaces
```typescript
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

## Use Cases

### API Development
Define request/response schemas with validation:
```rel
define APIResponse<T> {
  success: boolean
  data: T
  error: string?
  timestamp: date
}
```

### Form Validation
Create validated form schemas:
```rel
define LoginForm {
  email: email
  password: string & minLength(8) & hasUppercase
  rememberMe: boolean = false
}
```

### Database Models
Define database entity schemas:
```rel
define UserEntity {
  id: uuid
  email: email
  hashedPassword: string
  roles: string[]
  createdAt: date
  updatedAt: date
}
```

## Performance

- **Compilation Speed**: Sub-millisecond for typical schemas
- **Memory Usage**: Low memory footprint (< 10MB for large projects)
- **Scalability**: Handles thousands of schema files efficiently
- **Watch Mode**: Near-instant recompilation on changes

## Contributing

We welcome contributions! Please see our [Contributing Guide](../CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone and setup
git clone https://github.com/Nehonix-Team/ret-compiler
cd reliant-type/ret-compiler

# Run tests
cargo test

# Build in debug mode
cargo build

# Build optimized release
cargo build --release
```

### Testing

```bash
# Run all tests
cargo test

# Run specific test
cargo test test_lexer

# Run with verbose output
cargo test -- --nocapture
```

## License

This project is licensed under the MIT License. See the [LICENSE](../LICENSE) file for details.

## Support

- **Documentation**: https://github.com/Nehonix-Team/reliant-type/tree/main/ret-compiler/docs
- **Issues**: https://github.com/Nehonix-Team/reliant-type/issues
- **Discussions**: https://github.com/Nehonix-Team/reliant-type/discussions
- **Discord**: Join our community server

## Roadmap

### Current Version (0.1.x)
- ✅ Basic schema compilation
- ✅ TypeScript interface generation
- ✅ Validation schema generation
- ✅ VSCode extension
- ✅ Watch mode
- ✅ Comprehensive error reporting

### Upcoming Features
- 🔄 Incremental compilation
- 🔄 Plugin system
- 🔄 Language server protocol
- 🔄 Advanced generics
- 🔄 Macro system
- 🔄 Performance optimizations

---

**Ready to get started?** Check out the [Usage Guide](USAGE.md) for detailed instructions and the [Examples](EXAMPLES.md) for inspiration!