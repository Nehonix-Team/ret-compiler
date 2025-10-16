# ReT VSCode Extension

A comprehensive VSCode extension for ReliantType Compiler (.rel) files with real-time type checking, syntax highlighting, and IntelliSense support.

## Features

### 🚀 Real-Time Type Checking

- **Live validation** as you type using the Rust ReT compiler
- **Instant error reporting** with precise line and column information
- **Syntax validation** with detailed error messages

### 🎨 Syntax Highlighting

- **Full syntax highlighting** for .rel files
- **Keyword highlighting** (define, when, validate, etc.)
- **Type highlighting** (string, number, boolean, etc.)
- **Constraint highlighting** (min, max, matches, etc.)
- **Comment support** with `#` syntax

### 💡 IntelliSense & Autocompletion

- **Smart autocompletion** for keywords, types, and constraints
- **Context-aware suggestions** based on cursor position
- **Hover information** for types and keywords
- **Schema snippets** for common patterns

### 🛠️ Build & Watch Commands

- **Compile to TypeScript** with one click
- **Watch mode** for automatic recompilation on file changes
- **Validate files** without generating output
- **Create new schemas** from templates

### 📁 File Management

- **.rel file association** with custom icons
- **Language configuration** for proper indentation and brackets
- **Snippet support** for rapid schema development

## Installation

### From Source

```bash
cd rel-vscode-extension
npm install
npm run compile
```

### Packaging for Distribution

```bash
npm run build-compiler  # Build the Rust ReT compiler
npm run package         # Create .vsix package
```

## Configuration

The extension provides several configuration options in VSCode settings:

```json
{
  "rel.enableRealTimeValidation": true,
  "rel.compilerPath": "",
  "rel.outputDirectory": "./generated",
  "rel.enableSyntaxHighlighting": true,
  "rel.enableIntelliSense": true
}
```

### Settings

- **`rel.enableRealTimeValidation`**: Enable/disable real-time validation as you type
- **`rel.compilerPath`**: Path to ReT compiler binary (leave empty to use bundled)
- **`rel.outputDirectory`**: Default output directory for compiled TypeScript files
- **`rel.enableSyntaxHighlighting`**: Enable/disable ReT syntax highlighting
- **`rel.enableIntelliSense`**: Enable/disable IntelliSense for ReT files

## Usage

### Creating a New Schema

1. Right-click in the Explorer panel
2. Select "ReT: Create New ReT Schema"
3. Enter your schema name
4. Start editing with full IntelliSense support

### Real-Time Validation

- Errors appear automatically as you type
- Click on error squiggles for detailed information
- Use "ReT: Validate ReT File" command for manual validation

### Compilation

- Use "ReT: Compile ReT to TypeScript" to generate TypeScript interfaces
- Use "ReT: Watch ReT Files" for automatic recompilation
- Output files are placed in the configured output directory

### Snippets

Use these snippets for rapid development:

- `schema` - Basic schema template
- `schema-validation` - Schema with validation rules
- `conditional-schema` - Schema with conditional fields
- `enum` - Enum definition
- `type-alias` - Type alias with constraints
- `import` - Import statement
- `let` - Variable declaration
- `mixin` - Mixin definition
- `schema-mixin` - Schema using mixins

## Language Features

### Schema Definition

```rel
define User {
  id: number
  email: string & matches(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
  age: number & min(0) & max(120) & integer
  role: admin | user | guest
}
```

### Conditional Fields

```rel
define Product {
  type: physical | digital

  when type = physical {
    weight: number & positive
    dimensions: string
  } else when type = digital {
    downloadUrl: string & matches(r"^https?://.+")
    fileSize: number & positive
  }
}
```

### Validation Rules

```rel
define Order {
  amount: number & positive
  userId: number

  validate amount <= 1000
  validate userId > 0
}
```

## Architecture

The extension consists of:

- **TypeScript Extension Host**: Main VSCode extension logic
- **Rust ReT Compiler**: Backend compiler for validation and code generation
- **TextMate Grammar**: Syntax highlighting definitions
- **Language Configuration**: Editor behavior settings
- **Snippets**: Code templates for common patterns

## Development

### Building the Compiler

```bash
cd rel-compiler/rel
cargo build --release
```

### Testing the Extension

```bash
cd rel-vscode-extension
npm run compile
# Open in VSCode and use F5 to test
```

### File Structure

```
rel-vscode-extension/
├── src/
│   └── extension.ts          # Main extension logic
├── syntaxes/
│   └── rel.tmGrammar.json    # Syntax highlighting
├── snippets/
│   └── rel-snippets.json     # Code snippets
├── assets/                   # Icons and resources
├── bin/                      # Bundled ReT compiler
├── package.json              # Extension manifest
├── tsconfig.json            # TypeScript config
└── language-configuration.json # Editor behavior
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Related Projects

- [ReliantType](https://github.com/Nehonix-Team/reliant-type) - Main library
- [ReT Compiler](https://github.com/Nehonix-Team/rel-compiler) - Rust compiler backend
