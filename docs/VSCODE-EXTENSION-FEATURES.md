# Fortify Schema VSCode Extension - User Guide

## Overview

The Fortify Schema VSCode Extension helps you write and validate schema definitions with intelligent code completion and error detection. This guide covers the latest features and improvements to enhance your development experience.

## What's New

### Recent Improvements

**Fixed Negative Number Validation**: The extension now correctly handles negative number constraints without showing false errors.

**Added Ignore Comments**: You can now suppress validation warnings for specific lines using special comments.

**Enhanced Auto-completion**: Improved IntelliSense with better suggestions for constraints and ignore comments.

## Features

### 1. Negative Number Constraints

You can now use negative numbers in your constraints without getting validation errors.

#### Supported Patterns

```typescript
// Geographic coordinates
latitude: "number(-90,90)"
longitude: "number(-180,180)"

// Financial data
balance: "number(-999999,999999)"
profitLoss: "number(-100000,100000)"

// Scientific measurements
temperature: "number(-273,1000)"
velocity: "number(-300,300)"

// Percentage changes
changePercent: "number(-100,100)"
```

#### Common Use Cases

**Geographic Data**
```typescript
const LocationSchema = Interface({
  latitude: "number(-90,90)",      // Valid latitude range
  longitude: "number(-180,180)",   // Valid longitude range
  elevation: "number(-500,9000)"   // Below/above sea level
});
```

**Financial Applications**
```typescript
const FinanceSchema = Interface({
  accountBalance: "number(-999999,999999)", // Can be negative (debt)
  monthlyProfit: "number(-100000,100000)",  // Profit or loss
  changePercent: "number(-100,100)"         // Percentage change
});
```

**Scientific Data**
```typescript
const SensorSchema = Interface({
  temperature: "number(-273,1000)",  // Celsius (absolute zero to high)
  velocity: "number(-300,300)",      // Can be negative (direction)
  acceleration: "number(-50,50)"     // Positive/negative acceleration
});
```

### 2. Ignore Comments

Sometimes you need to use custom validation types that the extension doesn't recognize. Use ignore comments to suppress validation warnings.

#### How to Use Ignore Comments

**Line Above (Recommended)**
```typescript
// @fortify-ignore
customField: "MyCustomValidator<T>",
```

**Inline Comment**
```typescript
field: "custom-type", // @fortify-ignore
```

**Block Comment**
```typescript
/* @fortify-ignore */
field: "invalid-type",
```

**Multi-line Block**
```typescript
/*
 * @fortify-ignore
 * This field uses custom validation from another library
 */
complexField: "ThirdPartyValidator"
```

#### When to Use Ignore Comments

- **Custom validation types** not recognized by Fortify
- **Legacy code migration** where you're gradually adopting Fortify
- **Experimental patterns** you're testing
- **Third-party integrations** with their own validation systems

#### Example: Mixed Schema
```typescript
const MixedSchema = Interface({
  // Standard Fortify validation
  name: "string(1,100)",
  age: "number(0,150)",
  
  // @fortify-ignore - Custom validation library
  complexField: "MyCustomValidator<User>",
  
  // Geographic data (now works correctly)
  coordinates: "number(-90,90)"
});
```

### 3. Enhanced Auto-completion

The extension now provides smarter suggestions as you type.

#### Auto-completion Features

**Constraint Snippets**
- Type `string(` to see length constraint options
- Type `number(` to see range constraint examples
- Includes placeholders for easy editing

**Ignore Comment Completion**
- Type `@` in any comment to get `@fortify-ignore` suggestions
- Works in both line and block comments

**Negative Number Patterns**
- Common patterns like `number(-90,90)` for coordinates
- Financial ranges like `number(-999,999)`
- Scientific ranges with negative values

## Getting Started

### Installation

1. Open VSCode
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Fortify Schema"
4. Click Install

### Basic Usage

1. **Create a schema file** (usually with `.ts` or `.js` extension)

2. **Import Fortify** (if using TypeScript/JavaScript):
```typescript
import { Interface } from 'your-fortify-library';
```

3. **Define your schema**:
```typescript
const UserSchema = Interface({
  name: "string(1,50)",
  email: "string(5,100)",
  age: "number(0,150)",
  balance: "number(-999999,999999)" // Now works without errors!
});
```

4. **Use ignore comments** when needed:
```typescript
const CustomSchema = Interface({
  standardField: "string(1,100)",
  
  // @fortify-ignore
  customField: "MySpecialValidator"
});
```

## Tips and Best Practices

### Constraint Best Practices

**Be Specific with Ranges**
```typescript
// Good - specific business rules
age: "number(0,150)",
price: "number(0.01,999999.99)",
percentage: "number(0,100)"

// Better - real-world constraints
latitude: "number(-90,90)",
longitude: "number(-180,180)"
```

**Use Appropriate String Lengths**
```typescript
// Good - reasonable limits
username: "string(3,20)",
email: "string(5,100)",
description: "string(0,500)"
```

### Using Ignore Comments Effectively

**Document Why You're Ignoring**
```typescript
/*
 * @fortify-ignore
 * Using Zod validator for complex nested validation
 * TODO: Migrate to Fortify when nested objects are supported
 */
complexData: "z.object({...})"
```

**Use Sparingly**
- Only ignore validation when absolutely necessary
- Consider if you can restructure to use standard Fortify patterns
- Document the reason for ignoring validation

### Migration Tips

**Gradual Migration**
```typescript
const MigrationSchema = Interface({
  // New fields - use Fortify
  newField: "string(1,100)",
  
  // @fortify-ignore - Legacy field during migration
  legacyField: "OldValidationType",
  
  // Updated fields - now use proper constraints
  coordinates: "number(-90,90)" // Fixed - no more false errors
});
```

## Troubleshooting

### Common Issues

**Q: I'm still seeing errors for negative numbers**
A: Make sure you have the latest version of the extension installed. Update through VSCode's Extensions panel.

**Q: Ignore comments aren't working**  
A: Ensure the comment format is exactly `@fortify-ignore` (case-sensitive) and is in a proper comment block.

**Q: Auto-completion isn't showing up**
A: Make sure you're in a TypeScript/JavaScript file and that the extension is active (check the status bar).

### Getting Help

If you encounter issues:
1. Check that you have the latest extension version
2. Restart VSCode
3. Check the VSCode output panel for any error messages
4. Consult the extension's documentation or support channels

## Summary

The updated Fortify Schema VSCode Extension provides:

- ✅ **Accurate validation** for negative number constraints
- ✅ **Flexible ignore system** for custom validation types  
- ✅ **Smart auto-completion** for faster development
- ✅ **Real-world pattern support** for geographic, financial, and scientific data
- ✅ **Professional development experience** with fewer false errors

These improvements make the extension more practical for real-world applications while maintaining the robust validation that makes Fortify Schema valuable.

---

*Happy coding with Fortify Schema! 🚀*