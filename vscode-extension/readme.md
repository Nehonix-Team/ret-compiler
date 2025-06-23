# FortifyJS VSCode Extension

[![Version](https://img.shields.io/visual-studio-marketplace/v/fortifyjs.fortifyjs-vscode)](https://marketplace.visualstudio.com/items?itemName=fortifyjs.fortifyjs-vscode)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/fortifyjs.fortifyjs-vscode)](https://marketplace.visualstudio.com/items?itemName=fortifyjs.fortifyjs-vscode)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/fortifyjs.fortifyjs-vscode)](https://marketplace.visualstudio.com/items?itemName=fortifyjs.fortifyjs-vscode)

**Professional TypeScript validation with intelligent IDE support** 

The official VSCode extension for FortifyJS - providing syntax highlighting, intelligent autocompletion, real-time validation, and comprehensive documentation for TypeScript schema validation.

## ✨ Key Features

### 🎨 **Smart Syntax Highlighting**
- **Context-aware highlighting** - Only activates within `Interface({...})` blocks
- **Semantic token support** - Rich colors for types, operators, and conditional logic
- **Multiple color themes** - Choose from professional color schemes

### 🧠 **Intelligent IntelliSense**
- **Type autocompletion** - All FortifyJS types with constraints
- **Conditional syntax** - Smart suggestions for `when` expressions
- **Method completion** - `.in()`, `.exists`, `.contains()` and more
- **Context-aware** - Only suggests relevant completions

### ⚡ **Real-time Validation**
- **Instant error detection** - Catch syntax errors as you type
- **Detailed diagnostics** - Clear error messages with suggestions
- **Performance optimized** - No impact on non-FortifyJS code

### 📚 **Rich Documentation**
- **Hover information** - Detailed docs for types and operators
- **Example snippets** - See usage examples on hover
- **Quick reference** - Access documentation without leaving your editor

## 🎯 Precision Targeting

This extension is designed to be **non-intrusive** and **context-aware**:

- ✅ **Activates ONLY** within `Interface({...})` function calls
- ✅ **Ignores** regular strings and other code
- ✅ **Zero interference** with your existing TypeScript/JavaScript workflow
- ✅ **Performance optimized** - No slowdown on large codebases

## 🚀 Quick Start

### 1. Install the Extension

**From VS Code Marketplace:**
1. Open VS Code Extensions (`Ctrl+Shift+X`)
2. Search for "FortifyJS"
3. Click "Install"

**From Command Line:**
```bash
code --install-extension fortifyjs.fortifyjs-vscode
```

### 2. Install FortifyJS

```bash
npm install fortifyjs
```

### 3. Start Using

```typescript
import { Interface } from "fortifyjs";

const UserSchema = Interface({
  id: "int(1,)",                    // 🎨 Syntax highlighted
  email: "email",                   // 💡 Hover for docs
  role: "admin|user|guest",         // 🌈 Union types
  permissions: "when role=admin *? string[] : string[]?", // ⚡ Conditional validation
});

// ✅ Full TypeScript inference
const result = UserSchema.safeParse(userData);
```

## 📖 Supported Syntax

### Basic Types
```typescript
{
  name: "string",           // String type
  age: "int(18,120)",      // Integer with range
  email: "email",          // Email validation
  optional: "string?",     // Optional field
  tags: "string[]",        // Array type
  status: "active|inactive" // Union type
}
```

### Conditional Validation
```typescript
{
  // Complex business logic
  maxProjects: "when accountType=free *? int(1,3) : int(1,100)",

  // Method calls
  access: "when role.in(admin,manager) *? =granted : =denied",

  // Logical operators
  features: "when role=admin && status=active *? string[] : string[]?",
}
```

### Advanced Features
```typescript
{
  // Constraints
  password: "string(8,128)",
  score: "number(0,100)",

  // Array constraints
  items: "string[](1,10)",

  // Constants
  type: "=user",

  // Nested conditions
  access: "when status=active *? when role=admin *? =full : =limited : =none"
}
```

## ⚙️ Configuration

### Recommended Settings

Add to your VS Code `settings.json`:

```json
{
  "editor.semanticHighlighting.enabled": true,
  "typescript.suggest.autoImports": true,
  "typescript.preferences.quoteStyle": "double",
  "editor.quickSuggestions": {
    "strings": true
  }
}
```

### Color Themes

The extension includes multiple professional color themes:

- **Default** - Balanced colors for readability
- **Vibrant** - High contrast for better distinction
- **Minimal** - Subtle highlighting for clean aesthetics
- **Ocean** - Blue-teal palette for calm coding
- **Sunset** - Warm orange-purple gradient
- **Matrix** - Green-on-black hacker style
- **Cyberpunk** - Neon colors for futuristic feel
- **Pastel** - Soft colors for gentle highlighting

Access themes via: `Ctrl+Shift+P` → "FortifyJS: Apply Color Scheme"

## 🔧 Commands

| Command | Description |
|---------|-------------|
| `FortifyJS: Validate Schema` | Manually validate current file |
| `FortifyJS: Apply Color Scheme` | Choose color theme |
| `FortifyJS: List Color Schemes` | View available themes |

## 🐛 Troubleshooting

### Extension Not Working?

1. **Check file type** - Extension works with `.ts`, `.js`, `.tsx`, `.jsx`
2. **Verify syntax** - Must be inside `Interface({...})` blocks
3. **Restart VS Code** - Sometimes needed after installation
4. **Check settings** - Ensure semantic highlighting is enabled

### Performance Issues?

The extension is optimized for performance:
- Only processes `Interface({...})` blocks
- Ignores regular strings and comments
- Uses efficient parsing algorithms
- No impact on large codebases

## 📚 Documentation

- **[FortifyJS Documentation](https://github.com/fortifyjs/fortifyjs)**
- **[Conditional Validation Guide](https://github.com/fortifyjs/fortifyjs/blob/main/docs/CONDITIONAL_VALIDATION_GUIDE.md)**
- **[Type Reference](https://github.com/fortifyjs/fortifyjs/blob/main/docs/OPERATIONS-REFERENCE.md)**

## 🤝 Contributing

We welcome contributions!

- **Report bugs**: [GitHub Issues](https://github.com/fortifyjs/fortifyjs-vscode/issues)
- **Feature requests**: [GitHub Discussions](https://github.com/fortifyjs/fortifyjs-vscode/discussions)
- **Pull requests**: [Contributing Guide](https://github.com/fortifyjs/fortifyjs-vscode/blob/main/CONTRIBUTING.md)

## 📄 License

MIT © [FortifyJS Team](https://github.com/fortifyjs)

---

**Made with ❤️ for the TypeScript community**
