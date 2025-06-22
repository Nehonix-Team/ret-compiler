# Fortify Schema

[![npm version](https://badge.fury.io/js/fortify-schema.svg)](https://badge.fury.io/js/fortify-schema)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![Build Status](https://github.com/Nehonix-Team/fortify-schema/workflows/CI/badge.svg)](https://github.com/Nehonix-Team/fortify-schema/actions)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/fortify-schema)](https://bundlephobia.com/package/fortify-schema)
[![VS Code Extension](https://img.shields.io/badge/VS%20Code-Extension%20Available-blue)](https://sdk.nehonix.space/pkgs/mods/vscode/latest/fortify-schema.vsix)

<div align="center">
  <img src="https://sdk.nehonix.space/sdks/assets/fortify%20schema.jpg" alt="Fortify Schema Logo" width="250" />
</div>

**A Modern Approach to TypeScript Validation**

Fortify Schema is a TypeScript validation library that brings interface-like syntax to runtime validation. Designed for developers who value concise, readable schemas, it offers powerful conditional validation and enhanced VS Code integration. While still in beta, Fortify Schema is ideal for teams exploring modern validation patterns in greenfield projects or applications with complex business logic.

**Concise syntax. Conditional validation. TypeScript integration. VS Code support.**

## VS Code Extension

Enhance your development experience with our VS Code extension, featuring syntax highlighting, IntelliSense, and real-time validation.

<div align="center">
  <img src="https://sdk.nehonix.space/sdks/assets/vscode-extension-preview.gif" alt="VS Code Extension Preview" width="600" />
</div>

### Install the VS Code Extension

Enhance your Fortify Schema development with syntax highlighting, IntelliSense, and real-time validation, tailored for TypeScript validation schemas. This extension supports `.ts`, `.js`, `.tsx`, and `.jsx` files, recognizing Fortify Schema definitions in string literals and conditional expressions.

## Features

- **Syntax Highlighting**: Clear visuals for schema definitions and conditional logic.
- **IntelliSense**: Autocomplete for field types, constraints, and operators.
- **Real-time Validation**: Instant feedback on schema syntax errors.
- **Hover Documentation**: Detailed explanations for syntax and operators.
- **Conditional Logic Support**: Enhanced highlighting for conditional validation.
- **Customizable Themes**: Choose from eight color schemes to match your coding style.

## Supported Themes

Personalize your experience with one of these eight themes:

- **Cool**: Cool-toned palette with modern contrast.
- **Cyberpunk**: Neon, futuristic vibes with vibrant colors 🌈⚡.
- **Default**: User-friendly colors optimized for readability.
- **Pastel Dream**: Soft pastels for a dreamy aesthetic 🌸✨.
- **Vibrant & Minimal**: Vibrant for distinction or minimal for a clean look.
- **Ocean Depth**: Deep blues and teals for a serene vibe 🌊🐋.
- **Synthwave**: Retro 80s synthwave with pinks and blues 🌆🎵.
- **Sunset Vibes**: Warm oranges and purples for a sunset feel 🌅🏖️.
- **Matrix Code**: Green-on-black hacker aesthetic 💚🖥️.
- **Retro Wave**: 80s synthwave-inspired colors 🌸💜.

## Installation

### VS Code Marketplace

1. Open VS Code and go to Extensions (Ctrl+Shift+X).
2. Search for "Fortify Schema" and click "Install".
3. Alternatively, visit [Fortify Schema on the Marketplace](https://marketplace.visualstudio.com/items?itemName=NEHONIX.fortify-schema-vscode).

### Direct Download

```bash
# Download the latest version
curl -L https://sdk.nehonix.space/pkgs/mods/vscode/latest/fortify-schema.vsix -o fortify-schema.vsix

# Install
code --install-extension fortify-schema.vsix
```

### Manual Installation

1. Download the `.vsix` file from [https://sdk.nehonix.space/pkgs/mods/vscode/latest/fortify-schema.vsix](https://sdk.nehonix.space/pkgs/mods/vscode/latest/fortify-schema.vsix).
2. Open VS Code, go to Extensions (Ctrl+Shift+X), click the "..." menu, and select "Install from VSIX...".
3. Choose the downloaded `.vsix` file.

## Configuration

For the best experience, add these to your VS Code settings:

```json
{
  "editor.semanticHighlighting.enabled": true,
  "typescript.suggest.autoImports": true,
  "typescript.preferences.quoteStyle": "double"
}
```

## Usage

The extension activates automatically for Fortify Schema definitions in supported files. Example:

```typescript
import { Interface } from "fortify-schema";

const UserSchema = Interface({
  role: "admin|user|guest",
  permissions: "when role=admin *? string[] : string[]?", // Highlighted with theme
});
```

Select your preferred theme via VS Code’s theme settings to customize the highlighting.

## Why Fortify Schema?

Fortify Schema offers a fresh approach to TypeScript validation, prioritizing:

- **Interface-like Syntax**: Schemas that mirror TypeScript interfaces, reducing code verbosity.
- **Conditional Validation**: Powerful logic with TypeScript inference and VS Code support.
- **Developer Experience**: Enhanced by our VS Code extension for seamless schema authoring.
- **Type Safety**: Compile-time checks and runtime validation with minimal overhead.

### When to Use Fortify Schema

- **Greenfield Projects**: Start fresh with modern validation patterns.
- **Complex Business Logic**: Leverage conditional validation for sophisticated rules.
- **TypeScript Enthusiasts**: Enjoy interface-native syntax and IDE integration.
- **VS Code Users**: Benefit from enhanced syntax highlighting and IntelliSense.

### When to Consider Alternatives

For mature, production-ready solutions, consider established libraries like [Zod](https://zod.dev/), [Joi](https://joi.dev/), or [Yup](https://github.com/jquense/yup):
- **Legacy Systems**: When ecosystem compatibility is critical.
- **Simple Schemas**: When basic validation suffices without conditional logic.
- **Risk-averse Teams**: When battle-tested tools are preferred.

## Documentation

| Resource                                                                          | Description                                                |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| **[Complete Documentation](./docs/README.md)**                                    | Full documentation index                                   |
| **[Conditional Validation Guide](./docs/FULL%20CONDITIONAL_VALIDATION%20DOC.md)** | Guide to conditional validation with operators             |
| **[Quick Reference](./docs/QUICK-REFERENCE.md)**                                  | Cheat sheet for syntax and patterns                        |
| **[Field Types Reference](./docs/FIELD-TYPES.md)**                                | Guide to types and constraints                             |
| **[Real-World Examples](./docs/EXAMPLES.md)**                                     | Production-ready schema examples                           |
| **[Migration Guide](./docs/MIGRATION.md)**                                        | Migrating from Zod, Joi, Yup                               |
| **[VS Code Extension Guide](#vs-code-extension)**                                 | Setup and usage for the VS Code extension                  |
| **[Quick Start](#quick-start)**                                                   | Get started in 5 minutes                                   |

---

## Installation

```bash
npm install fortify-schema
```

**VS Code Extension** (Recommended):
```bash
curl -L https://sdk.nehonix.space/pkgs/mods/vscode/latest/fortify-schema.vsix -o fortify-schema.vsix
code --install-extension fortify-schema.vsix
```

**Requirements:**
- TypeScript 4.5+
- Node.js 14+
- VS Code (for enhanced experience)

## Quick Start

### Basic Schema

```typescript
import { Interface } from "fortify-schema";

const UserSchema = Interface({
  id: "number",
  email: "email",
  name: "string(2,50)",
  age: "number(18,120)?",
  status: "active|inactive",
});
```

### Validation

```typescript
const result = UserSchema.safeParse(userData);
if (result.success) {
  console.log("Valid user:", result.data); // Fully typed
} else {
  console.log("Errors:", result.errors);
}
```

## Why String-based Syntax?

Fortify Schema uses strings like `"string(2,50)"` for concise, readable schemas that align with TypeScript interfaces. While this sacrifices some native TypeScript autocomplete, our VS Code extension provides:

- Real-time syntax validation
- IntelliSense for types and constraints
- Error detection before runtime
- Hover documentation for clarity

We’re exploring object-based syntax options for enhanced compile-time safety in future releases.

## Conditional Validation

Fortify Schema’s conditional validation allows complex logic with clear syntax and TypeScript inference, enhanced by VS Code highlighting.

### Example

```typescript
const UserSchema = Interface({
  role: "admin|user|guest",
  permissions: "when role=admin *? string[] : string[]?",
  maxProjects: "when accountType=free *? int(1,3) : int(1,)",
});
```

### Why `*?` Syntax?

- **Clarity**: Separates condition from logic, avoiding confusion with TypeScript’s `?`.
- **TypeScript Inference**: Ensures compile-time type safety.
- **VS Code Support**: Highlighting and IntelliSense make it intuitive.

**Alternative Syntax** (for teams preferring a more standard approach):

```typescript
import { When } from "fortify-schema";

permissions: When.field("role").is("admin").then("string[]").else("string[]?"),
```

## Library Comparison

| Feature                     | Fortify Schema          | Zod                     |
|-----------------------------|-------------------------|-------------------------|
| Syntax Style               | Interface-like, concise | Method-chaining         |
| Conditional Validation     | Built-in, TypeScript-native | Requires workarounds |
| VS Code Extension          | Yes, with highlighting  | No                      |
| Maturity                   | Beta                    | Production-ready        |
| Community                  | Growing                 | Large, established      |

**Fortify Schema**: Ideal for modern, complex validation needs.  
**Zod**: Preferred for mature, simple, or legacy systems.

## Core Features

### Field Types

```typescript
{
  name: "string(2,50)",     // String with length constraints
  age: "number(18,120)?",   // Optional number range
  email: "email",           // Email format
  tags: "string[](1,10)?",  // Optional array
  status: "active|inactive", // Union type
  role: "=admin",           // Literal constant
}
```

### Schema Transformation

```typescript
import { Mod } from "fortify-schema";

const PublicUserSchema = Mod.omit(UserSchema, ["password"]);
const ExtendedSchema = Mod.extend(UserSchema, { createdAt: "date" });
```

### Validation Modes

- **Strict Mode** (default): Enforces exact types.
- **Loose Mode**: Allows type coercion with warnings.
- **Strict Object Mode**: Prevents extra properties.

## Roadmap to Stability

Fortify Schema is in beta, and we’re committed to reaching production-ready status. Our roadmap includes:

- Expanded test coverage (current: 95%+)
- Performance benchmarks
- Community feedback integration
- Version 1.0 release with enhanced TypeScript safety

See our [GitHub Issues](https://github.com/Nehonix-Team/fortify-schema/issues) for progress.

## Contributing

We welcome contributions! See our [Contributing Guide](CONTRIBUTING.md) for details.

```bash
git clone https://github.com/Nehonix-Team/fortify-schema.git
npm install
npm run test
npm run build
```

Report issues or suggest features on [GitHub Issues](https://github.com/Nehonix-Team/fortify-schema/issues).

## Community

- **Documentation**: [GitHub Repository](https://github.com/Nehonix-Team/fortify-schema)
- **Issues**: [Bug Reports & Feature Requests](https://github.com/Nehonix-Team/fortify-schema/issues)
- **Discussions**: [Community Forum](https://github.com/Nehonix-Team/fortify-schema/discussions)
- **NPM Package**: [fortify-schema](https://www.npmjs.com/package/fortify-schema)

## License

MIT © [Nehonix Team](https://github.com/Nehonix-Team)

---

_Built with care by the Nehonix Team_