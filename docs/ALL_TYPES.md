
## 📝 Basic Types

| Type        | Syntax      | Example               |
| ----------- | ----------- | --------------------- |
| **String**  | `"string"`  | `name: "string"`      |
| **Number**  | `"number"`  | `age: "number"`       |
| **Boolean** | `"boolean"` | `active: "boolean"`   |
| **Date**    | `"date"`    | `createdAt: "date"`   |
| **Any**     | `"any"`     | `metadata: "any"`     |
| **unknown** | `"unknown"` | `property: "unknown"` |
| **object**  | `"object"`  | `data: "object"`      |

_Note: Bool is an aliax for Boolean_

## 🎯 Constrained Types

| Type              | Syntax              | Example                |
| ----------------- | ------------------- | ---------------------- |
| **String Length** | `"string(min,max)"` | `name: "string(2,50)"` |
| **Number Range**  | `"number(min,max)"` | `age: "number(0,120)"` |
| **Integer**       | `"int"`             | `count: "int"`         |
| **Positive**      | `"positive"`        | `id: "positive"`       |
| **Negative**      | `"negative"`        | `debt: "negative"`     |
| **double**        | `"double"`          | `fl: "double"`         |

## 📧 Format Types

| Type           | Syntax       | Example                |
| -------------- | ------------ | ---------------------- |
| **Email**      | `"email"`    | `email: "email"`       |
| **text**       | `"text"`     | `description: "text"`  |
| **password**   | `"password"` | `userPass: "password"` |
| **URL**        | `"url"`      | `website: "url"`       |
| **UUID**       | `"uuid"`     | `id: "uuid"`           |
| **Phone**      | `"phone"`    | `mobile: "phone"`      |
| **IP Address** | `"ip"`       | `server: "ip"`         |
| **JSON**       | `"json"`     | `config: "json"`       |
| **Hex Color**  | `"hexcolor"` | `color: "hexcolor"`    |
| **Base64**     | `"base64"`   | `data: "base64"`       |
| **JWT**        | `"jwt"`      | `token: "jwt"`         |
| **SemVer**     | `"semver"`   | `version: "semver"`    |
| **slug**       | `"slug"`     | `test: "semver"`       |

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
