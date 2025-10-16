# 🚀 Advanced Features - Implementation Complete

## ✅ Working Features (2/4)

### 1. Variables (`declare var`) - ✅ FULLY WORKING

**Syntax:**
```rel
declare var maxAge: number = 120
declare var minAge: number = 18
declare var emailPattern: string = r"^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"

define User {
  age: number & min(::minAge) & max(::maxAge)
  email: string & matches(::emailPattern)
}
```

**Generated Output:**
```typescript
export const User = Interface({
  age: "number(18,120)",
  email: "string(^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$)",
});
```

**How It Works:**
1. `declare var name: type = value` - Declares a variable
2. `::variableName` - References the variable value
3. Variables are resolved at compile time
4. Supports: numbers, strings, raw strings (regex), booleans

**Use Cases:**
- Centralize configuration values
- Reuse constraints across multiple fields
- DRY principle for validation rules
- Easy maintenance (change once, update everywhere)

---

### 2. Type Aliases (`declare type`) - ✅ FULLY WORKING

**Syntax:**
```rel
declare var maxAge: number = 120
declare var minAge: number = 18

declare type Age = number & min(::minAge) & max(::maxAge)
declare type Email = string & matches(r"^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$")
declare type Username = string & minLength(3) & maxLength(20)

define User {
  age: Age
  email: Email
  username: Username
}
```

**Generated Output:**
```typescript
export const User = Interface({
  age: "number(18,120)",
  email: "string(^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$)",
  username: "string(3,20)",
});
```

**How It Works:**
1. `declare type Name = TypeDefinition` - Declares a type alias
2. Use the type name anywhere you'd use a type
3. Types are expanded inline at compile time
4. Supports recursive expansion (types can reference variables)

**Use Cases:**
- Create reusable type definitions
- Semantic naming (Age, Email, Username)
- Combine multiple constraints into one type
- Build type libraries for your domain

---

## 🔧 Implementation Details

### Architecture

```
Source Code (.rel)
    ↓
Lexer (tokens: declare, var, ::, etc.)
    ↓
Parser (AST: DeclareVarNode, DeclareTypeNode)
    ↓
Context (stores variables & types)
    ↓
Generator (resolves :: and expands types)
    ↓
TypeScript Output (.ts)
```

### Key Components

**1. Lexer (`src/lexer.rs`)**
- Added tokens: `Declare`, `Var`, `DoubleColon` (::)
- Recognizes keywords: `declare`, `var`, `type`
- Handles `::` as a single token

**2. Parser (`src/parser.rs`)**
- `parse_declare()` - Parses `declare var` and `declare type`
- `parse_term()` - Parses `::variableName` references
- Creates AST nodes: `DeclareVarNode`, `DeclareTypeNode`

**3. Context (`src/context.rs`)**
- Stores variables: `HashMap<String, ExpressionNode>`
- Stores type aliases: `HashMap<String, TypeNode>`
- Provides lookup methods for resolution

**4. Generator (`src/generator.rs`)**
- First pass: Collects all declarations
- `expression_to_string()` - Resolves `::variableName`
- `expand_type_inline()` - Expands type aliases recursively

### Data Flow Example

**Input:**
```rel
declare var max: number = 100
declare type Score = number & max(::max)
define Game { score: Score }
```

**Processing:**
1. Lexer: `declare` → `Declare`, `::max` → `DoubleColon` + `Identifier`
2. Parser: Creates `DeclareVarNode(max, 100)`, `DeclareTypeNode(Score, ...)`
3. Context: Stores `max → Number(100)`, `Score → number & max(::max)`
4. Generator:
   - Sees `Score` → looks up type alias
   - Expands to `number & max(::max)`
   - Resolves `::max` → `100`
   - Generates `"number(,100)"`

**Output:**
```typescript
export const Game = Interface({
  score: "number(,100)",
});
```

---

## 📊 Feature Comparison

| Feature | Status | Complexity | Use Cases |
|---------|--------|------------|-----------|
| **Variables** | ✅ Done | Low | Config values, reusable constraints |
| **Type Aliases** | ✅ Done | Medium | Reusable types, semantic naming |
| **Functions** | 🔧 Partial | High | Type generators, computed types |
| **Loops** | 🔧 Partial | High | Repeated fields, dynamic schemas |

---

## 🎯 Real-World Examples

### Example 1: User Management System

```rel
# Configuration
declare var MIN_PASSWORD_LENGTH: number = 8
declare var MAX_PASSWORD_LENGTH: number = 128
declare var MIN_USERNAME_LENGTH: number = 3
declare var MAX_USERNAME_LENGTH: number = 20

# Reusable Types
declare type Password = string & minLength(::MIN_PASSWORD_LENGTH) & maxLength(::MAX_PASSWORD_LENGTH)
declare type Username = string & minLength(::MIN_USERNAME_LENGTH) & maxLength(::MAX_USERNAME_LENGTH)
declare type Email = string & matches(r"^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$")
declare type Age = number & min(13) & max(120)

# Schemas
define UserRegistration {
  username: Username
  email: Email
  password: Password
  confirmPassword: Password
  age: Age
}

define UserProfile {
  username: Username
  email: Email
  age: Age
  bio: string & maxLength(500)
}

export UserRegistration
export UserProfile
```

### Example 2: E-commerce Product System

```rel
# Business Rules
declare var MAX_PRICE: number = 999999
declare var MIN_PRICE: number = 0
declare var MAX_QUANTITY: number = 10000

# Domain Types
declare type Price = number & min(::MIN_PRICE) & max(::MAX_PRICE) & positive
declare type Quantity = number & min(0) & max(::MAX_QUANTITY) & int
declare type SKU = string & matches(r"^[A-Z0-9-]+$") & minLength(5) & maxLength(20)
declare type ProductName = string & minLength(3) & maxLength(100)

# Product Schema
define Product {
  sku: SKU
  name: ProductName
  price: Price
  quantity: Quantity
  description: string & maxLength(500)
  inStock: boolean
  
  when inStock {
    availableQuantity: Quantity
  }
}

export Product
```

---

## 🔥 Benefits

### 1. **DRY (Don't Repeat Yourself)**
```rel
# Before (repetitive)
define User {
  age: number & min(18) & max(120)
}
define Admin {
  age: number & min(18) & max(120)
}

# After (DRY)
declare type Age = number & min(18) & max(120)
define User { age: Age }
define Admin { age: Age }
```

### 2. **Maintainability**
```rel
# Change once
declare var MAX_AGE: number = 120

# Updates everywhere automatically
declare type Age = number & max(::MAX_AGE)
```

### 3. **Semantic Clarity**
```rel
# Clear intent
email: Email
username: Username
age: Age

# vs unclear
email: string
username: string
age: number
```

### 4. **Type Safety**
- Catch errors at compile time
- Consistent validation rules
- Self-documenting schemas

---

## 📝 Test Files

**Variables Test:**
- File: `examples/test-variables.rel`
- Output: `examples/test-variables.ts`
- Tests: Variable declaration, `::` resolution

**Type Aliases Test:**
- File: `examples/test-type-aliases.rel`
- Output: `examples/test-type-aliases.ts`
- Tests: Type aliases, variables in types, recursive expansion

---

## 🚀 Next Steps (Optional)

### 3. Functions (`@fn`) - 60% Complete
```rel
@fn Ranged(min: number, max: number) -> type {
  return number & min(::min) & max(::max)
}

define Product {
  price: Ranged(0, 10000)
}
```

**Status:** AST nodes ✅, Lexer ✅, Parser ✅, Generator ⏳

### 4. Loops (`@for`) - 40% Complete
```rel
define Calendar {
  @for day in 1..31 {
    day::day: date?
  }
}
```

**Status:** AST nodes ✅, Lexer ✅, Parser ⏳, Generator ⏳

---

## 🎉 Conclusion

**Two powerful features are now fully working:**
- ✅ Variables - Reusable values with `::` syntax
- ✅ Type Aliases - Reusable type definitions

These features alone provide significant value:
- Reduce code duplication
- Improve maintainability
- Enable semantic type naming
- Support complex validation patterns

The rel language is now significantly more powerful and developer-friendly! 🚀
