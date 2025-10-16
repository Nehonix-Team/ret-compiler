# ReliantType Feature Coverage Matrix

This document tracks which ReliantType features are supported in the `.rel` compiler.

## Legend
- ✅ Fully Implemented
- 🚧 Partially Implemented
- ❌ Not Implemented
- 📝 Planned

## Basic Types

| Feature | Status | .rel Syntax | ReliantType Output | Notes |
|---------|--------|-------------|-------------------|-------|
| String | ✅ | `name: string` | `"string"` | |
| Number | ✅ | `age: number` | `"number"` | |
| Boolean | ✅ | `active: boolean` | `"boolean"` | |
| Date | ✅ | `created: date` | `"date"` | |
| Any | ✅ | `data: any` | `"any"` | |
| Object | ✅ | `obj: object` | `"object"` | |
| Unknown | ❌ | N/A | `"unknown"` | Need to add |

## Constrained Types

| Feature | Status | .rel Syntax | ReliantType Output | Notes |
|---------|--------|-------------|-------------------|-------|
| String Length | ✅ | `name: string & min(3) & max(20)` | `"string(3,20)"` | |
| String Min Only | ✅ | `password: string & min(8)` | `"string(8,)"` | |
| String Max Only | ✅ | `bio: string & max(500)` | `"string(,500)"` | |
| Number Range | ✅ | `age: number & min(0) & max(120)` | `"number(0,120)"` | |
| Number Min Only | ✅ | `price: number & min(0.01)` | `"number(0.01,)"` | |
| Number Max Only | ✅ | `discount: number & max(1.0)` | `"number(,1.0)"` | |
| Integer | ✅ | `count: integer` | `"integer"` | |
| Positive | ✅ | `id: positive` | `"positive"` | |
| Negative | ✅ | `debt: negative` | `"negative"` | |
| Float/Double | ✅ | `temp: float` | `"float"` | |
| Int (alias) | ✅ | `count: int` | `"int"` | |

## Format Types

| Feature | Status | .rel Syntax | ReliantType Output | Notes |
|---------|--------|-------------|-------------------|-------|
| Email | ✅ | `email: email` | `"email"` | |
| URL | ✅ | `website: url` | `"url"` | |
| UUID | ✅ | `id: uuid` | `"uuid"` | |
| Phone | ✅ | `mobile: phone` | `"phone"` | |
| IP Address | ✅ | `server: ip` | `"ip"` | |
| JSON | ✅ | `config: json` | `"json"` | |
| Hex Color | ✅ | `color: hexcolor` | `"hexcolor"` | |
| Base64 | ✅ | `data: base64` | `"base64"` | |
| JWT | ✅ | `token: jwt` | `"jwt"` | |
| SemVer | ✅ | `version: semver` | `"semver"` | |
| Slug | ✅ | `slug: slug` | `"slug"` | |
| Text | ❌ | N/A | `"text"` | Need to add |
| Password | ❌ | N/A | `"password"` | Need to add |

## Union Types

| Feature | Status | .rel Syntax | ReliantType Output | Notes |
|---------|--------|-------------|-------------------|-------|
| String Unions | ✅ | `role: admin \| user \| guest` | `"admin\|user\|guest"` | |
| Mixed Type Unions | ❌ | N/A | `"string\|number"` | Need syntax |

## Array Types

| Feature | Status | .rel Syntax | ReliantType Output | Notes |
|---------|--------|-------------|-------------------|-------|
| Basic Arrays | ✅ | `tags: string[]` | `"string[]"` | |
| Optional Arrays | ❌ | `tags: string[]?` | `"string[]?"` | Parser issue |
| Array Constraints | ❌ | N/A | `"string[](1,5)"` | Need syntax |
| Nested Arrays | ❌ | N/A | `"string[][]"` | Need to test |

## Optional Types

| Feature | Status | .rel Syntax | ReliantType Output | Notes |
|---------|--------|-------------|-------------------|-------|
| Optional Fields | ❌ | `bio: string?` | `"string?"` | Parser captures but generator doesn't apply |
| Optional with Constraints | ❌ | `bio: string & max(200)?` | `"string(,200)?"` | Same issue |

## Literal Values

| Feature | Status | .rel Syntax | ReliantType Output | Notes |
|---------|--------|-------------|-------------------|-------|
| String Literals | ❌ | N/A | `"=user"` | Need syntax |
| Number Literals | ❌ | N/A | `"=1"` | Need syntax |
| Boolean Literals | ❌ | N/A | `"=true"` | Need syntax |
| Object Literals | ❌ | N/A | `'={"theme":"dark"}'` | Need syntax |

## Custom Patterns (Regex)

| Feature | Status | .rel Syntax | ReliantType Output | Notes |
|---------|--------|-------------|-------------------|-------|
| Regex Patterns | ❌ | N/A | `"string(/^\\d{5}$/)"` | Need syntax |

## Nested Objects

| Feature | Status | .rel Syntax | ReliantType Output | Notes |
|---------|--------|-------------|-------------------|-------|
| Nested Objects | ❌ | N/A | `{ name: "string" }` | Need syntax |
| Nested Arrays | ❌ | N/A | `[{ name: "string" }]` | Need syntax |

## Conditional Validation

| Feature | Status | .rel Syntax | ReliantType Output | Notes |
|---------|--------|-------------|-------------------|-------|
| When Blocks | 🚧 | `when category = electronics { ... }` | TODO comment | Parsed but not generated |
| V1 Syntax | ❌ | N/A | `"when role=admin *? string[] : string[]?"` | Need syntax |
| V2 Runtime Methods | ❌ | N/A | `"when config.permissions.$exists() *? boolean : =false"` | Need syntax |

## Advanced Features

| Feature | Status | .rel Syntax | ReliantType Output | Notes |
|---------|--------|-------------|-------------------|-------|
| Computed Fields | ❌ | N/A | `tax: number = subtotal * 0.1` | Need syntax |
| Default Values | ❌ | N/A | `active: boolean = true` | Need syntax |
| Validation Rules | 🚧 | `validate User.age >= 18` | N/A | Parsed but not used |
| Extends | 🚧 | `define Admin extends User` | N/A | Parsed but not used |
| Mixins | 🚧 | `define User with Timestamps` | N/A | Parsed but not used |
| Generics | 🚧 | `define Response<T>` | N/A | Parsed but not used |
| Enums | 🚧 | `enum Status { ... }` | N/A | Parsed but not used |
| Type Aliases | 🚧 | `type ID = uuid` | N/A | Parsed but not used |
| Imports/Exports | 🚧 | `import { User } from "./user"` | N/A | Parsed but not used |

## Priority Issues to Fix

1. **CRITICAL: Optional Fields** - Parser captures `?` but generator doesn't output it
2. **HIGH: Mixed Type Unions** - Need syntax for `string|number`
3. **HIGH: Literal Values** - Need syntax for `=value`
4. **HIGH: Regex Patterns** - Need syntax for custom patterns
5. **MEDIUM: Nested Objects** - Need inline object syntax
6. **MEDIUM: Array Constraints** - Need syntax for `string[](1,5)`
7. **MEDIUM: Conditional Validation** - Complete the when block implementation
8. **LOW: Advanced Features** - Extends, mixins, generics, etc.
