# Fortify Schema VS Code Extension

[![VS Code Extension](https://img.shields.io/badge/VS%20Code-Extension%20Available-blue)](https://marketplace.visualstudio.com/items?itemName=NEHONIX.fortify-schema-vscode)

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

## Contributing

We welcome feedback and contributions! See our [Contributing Guide](https://github.com/Nehonix-Team/fortify-schema/blob/main/CONTRIBUTING.md) or report issues at [GitHub Issues](https://github.com/Nehonix-Team/fortify-schema/issues).

## License

MIT © [Nehonix Team](https://github.com/Nehonix-Team)

---

Built with care for the Fortify Schema community.