# Quick Reference

Fast reference guide for Fortify Schema syntax, types, and patterns.

## 🚀 Basic Usage

```typescript
import { Interface } from "fortify-schema";

const Schema = Interface({
  // Your schema definition
});

const result = Schema.safeParse(data);
if (result.success) {
  // Use result.data (fully typed)
} else {
  // Handle result.errors
}
```

## 📝 Basic Types

| Type        | Syntax      | Example             |
| ----------- | ----------- | ------------------- |
| **String**  | `"string"`  | `name: "string"`    |
| **Number**  | `"number"`  | `age: "number"`     |
| **Boolean** | `"boolean"` | `active: "boolean"` |
| **Date**    | `"date"`    | `createdAt: "date"` |
| **Any**     | `"any"`     | `metadata: "any"`   |

## 🎯 Constrained Types

| Type              | Syntax              | Example                |
| ----------------- | ------------------- | ---------------------- |
| **String Length** | `"string(min,max)"` | `name: "string(2,50)"` |
| **Number Range**  | `"number(min,max)"` | `age: "number(0,120)"` |
| **Integer**       | `"int"`             | `count: "int"`         |
| **Positive**      | `"positive"`        | `id: "positive"`       |
| **Negative**      | `"negative"`        | `debt: "negative"`     |

## 📧 Format Types

| Type           | Syntax       | Example             |
| -------------- | ------------ | ------------------- |
| **Email**      | `"email"`    | `email: "email"`    |
| **URL**        | `"url"`      | `website: "url"`    |
| **UUID**       | `"uuid"`     | `id: "uuid"`        |
| **Phone**      | `"phone"`    | `mobile: "phone"`   |
| **IP Address** | `"ip"`       | `server: "ip"`      |
| **JSON**       | `"json"`     | `config: "json"`    |
| **Hex Color**  | `"hexcolor"` | `color: "hexcolor"` |
| **Base64**     | `"base64"`   | `data: "base64"`    |
| **JWT**        | `"jwt"`      | `token: "jwt"`      |
| **SemVer**     | `"semver"`   | `version: "semver"` |

## 🔗 Union Types

```typescript
// Basic unions
status: "active|inactive|pending";
role: "admin|user|guest";

// Mixed type unions
id: "string|number";
value: "string|number|boolean";
```

## 📋 Array Types

```typescript
// Basic arrays
tags: "string[]";
scores: "number[]";

// Optional arrays
categories: "string[]?";

// Array constraints
limitedTags: "string[](1,5)"; // 1-5 items
minItems: "string[](2,)"; // Minimum 2 items
maxItems: "string[](,10)"; // Maximum 10 items

// Combined constraints
usernames: "string(3,20)[](1,100)"; // 1-100 usernames, each 3-20 chars
```

## ❓ Optional Types

```typescript
// Optional fields (can be undefined)
nickname: "string?";
bio: "string(,500)?";
avatar: "url?";

// Optional arrays
tags: "string[]?";
scores: "number[]?";
```

## 🎨 Literal Values

```typescript
// String literals
type: "=user";
version: "=2.0";

// Number literals
apiVersion: "=1";
maxRetries: "=3";

// Boolean literals
isEnabled: "=true";
isLegacy: "=false";

// Complex literals
config: '={"theme":"dark"}';
tags: '=["default","user"]';
```

## 🔍 Custom Patterns

```typescript
// Regex patterns
zipCode: "string(/^\\d{5}(-\\d{4})?$/)";
username: "string(/^[a-zA-Z0-9_]{3,20}$/)";
hexColor: "string(/^#[0-9A-Fa-f]{6}$/)";

// Common patterns
creditCard: "string(/^\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}$/)";
ssn: "string(/^\\d{3}-\\d{2}-\\d{4}$/)";
```

## 🔥 V2 Conditional Validation

### Basic Syntax

```typescript
// Basic conditional
permissions: "when role=admin *? string[] : string[]?";

// V2 runtime methods
hasData: "when config.data.$exists() *? boolean : =false";
```

### V2 Runtime Methods

| Method                  | Syntax                         | Description                 |
| ----------------------- | ------------------------------ | --------------------------- |
| **$exists()**           | `property.$exists()`           | Check if property exists    |
| **$empty()**            | `property.$empty()`            | Check if property is empty  |
| **$null()**             | `property.$null()`             | Check if property is null   |
| **$contains(val)**      | `property.$contains(value)`    | Check if contains value     |
| **$startsWith(prefix)** | `property.$startsWith(prefix)` | Check if starts with prefix |
| **$endsWith(suffix)**   | `property.$endsWith(suffix)`   | Check if ends with suffix   |
| **$between(min,max)**   | `property.$between(min,max)`   | Check if value in range     |
| **$in(val1,val2,...)**  | `property.$in(val1,val2,...)`  | Check if value in list      |

### V2 Examples

```typescript
const V2Schema = Interface({
  config: "any?",
  user: "any?",

  // Property existence
  hasPermissions: "when config.permissions.$exists() *? boolean : =false",

  // Empty checking
  hasContent: "when user.bio.$empty() *? =no_bio : =has_bio",

  // String methods
  isImportant: "when user.message.$contains(urgent) *? boolean : =false",
  isSystemUser: "when user.email.$endsWith(@system.com) *? boolean : =false",

  // Numeric methods
  isAdult: "when user.age.$between(18,65) *? boolean : =false",
  hasElevatedRole: "when user.role.$in(admin,moderator) *? boolean : =false",

  // Complex defaults
  defaultSettings: 'when config.settings.$exists() *? any : ={"theme":"dark"}',
  defaultTags: 'when config.tags.$exists() *? string[] : =["default"]',
});
```

## 🏗️ Nested Objects

```typescript
const NestedSchema = Interface({
  user: {
    id: "uuid",
    profile: {
      name: "string",
      contact: {
        email: "email",
        phone: "phone?",
        address: {
          street: "string",
          city: "string",
          country: "string(2,2)"
        }?
      }
    }
  },

  // Optional nested objects
  settings: {
    theme: "light|dark",
    notifications: {
      email: "boolean",
      push: "boolean"
    }
  }?
});
```

## ⚡ Performance Tips

### Efficient Types

```typescript
// ✅ Fast - Use specific types
email: "email";
id: "uuid";
age: "int(0,120)";

// ❌ Slower - Generic types with validation
email: "string"; // Then validate in code
id: "string"; // Then validate format
age: "number"; // Then check range
```

### Efficient Conditionals

```typescript
// ✅ Fast - Simple existence checks first
hasFeature: "when config.$exists() && config.features.$exists() *? boolean : =false";

// ❌ Slower - Complex operations first
hasFeature: "when config.features.$contains(advanced) && config.$exists() *? boolean : =false";
```

## 🛠️ Common Patterns

### User Schema

```typescript
const UserSchema = Interface({
  id: "uuid",
  email: "email",
  username: "string(3,20)",
  password: "string(8,)",
  profile: {
    firstName: "string(1,50)",
    lastName: "string(1,50)",
    avatar: "url?",
    bio: "string(,500)?",
  },
  role: "admin|user|moderator",
  isActive: "boolean",
  createdAt: "date",
  lastLogin: "date?",
});
```

### API Response Schema

```typescript
const APIResponseSchema = Interface({
  status: "success|error|partial",
  statusCode: "int(100,599)",
  message: "string?",
  data: "any?",
  errors: {
    code: "string",
    message: "string",
    field: "string?"
  }[]?,
  meta: {
    timestamp: "date",
    requestId: "uuid",
    version: "string(/^v\\d+\\.\\d+$/)"
  }
});
```

### E-commerce Product Schema

```typescript
const ProductSchema = Interface({
  id: "uuid",
  sku: "string(/^[A-Z0-9-]{8,20}$/)",
  name: "string(1,200)",
  price: "number(0.01,999999.99)",
  category: "electronics|clothing|books|home",
  inStock: "boolean",
  tags: "string[](0,20)",
  images: {
    primary: "url",
    gallery: "url[](0,10)"
  }?,
  seo: {
    title: "string(,60)?",
    description: "string(,160)?"
  }?
});
```

## 🔧 Validation Methods

### Safe Parsing (Recommended)

```typescript
const result = Schema.safeParse(data);

if (result.success) {
  console.log("Valid:", result.data); // Fully typed
} else {
  console.log("Errors:", result.errors);
  result.errors.forEach((error) => {
    console.log(`${error.path.join(".")}: ${error.message}`);
  });
}
```

### Direct Parsing

```typescript
try {
  const validData = Schema.parse(data);
  // Use validData (fully typed)
} catch (error) {
  console.log("Validation failed:", error.message);
}
```

## 🎨 VS Code Extension

### Trigger Characters

- `"` - Type suggestions
- `:` - Field definitions
- `|` - Union types
- `=` - Constants
- `(` - Constraints
- `.` - Property access
- `$` - V2 methods

### Commands

- `Ctrl+Shift+V` - Validate Schema
- `Ctrl+Shift+T` - Apply Color Scheme
- `F12` - Go to Definition
- `Ctrl+Space` - Trigger Completion

### Settings

```json
{
  "fortify.enableDiagnostics": true,
  "fortify.colorScheme": "professional",
  "editor.semanticHighlighting.enabled": true
}
```

## 🚨 Common Mistakes

### ❌ Wrong Constraint Syntax

```typescript
// Wrong
name: "string(,)"; // Empty constraint
age: "number()"; // Empty parentheses
tags: "string[]("; // Incomplete array constraint

// Correct
name: "string(1,50)"; // Proper min,max
age: "number(0,120)"; // Proper range
tags: "string[](1,10)"; // Proper array constraint
```

### ❌ Invalid Union Syntax

```typescript
// Wrong
status: "active | inactive"; // Spaces around |
role: "admin,user,guest"; // Commas instead of |

// Correct
status: "active|inactive"; // No spaces
role: "admin|user|guest"; // Use | separator
```

### ❌ Incorrect Optional Syntax

```typescript
// Wrong
name: "string | undefined"; // TypeScript syntax
age: "number | null"; // TypeScript syntax

// Correct
name: "string?"; // Fortify optional syntax
age: "number?"; // Simple and clean
```

## 📚 Quick Links

- **[Getting Started](./GETTING-STARTED.md)** - Installation and first steps
- **[Field Types Reference](./FIELD-TYPES.md)** - Complete type guide
- **[Conditional Validation](./CONDITIONAL-VALIDATION.md)** - V1 and V2 conditionals
- **[VS Code Extension](./VSCODE-EXTENSION.md)** - Development tools
- **[Examples Collection](./EXAMPLES.md)** - Real-world patterns
- **[API Reference](./API-REFERENCE.md)** - Complete API docs
