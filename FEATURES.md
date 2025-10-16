# ret-compiler - Complete Feature List

## 🎉 Production-Ready ReliantType Schema Compiler

### Core Features (100% Complete!)

#### 1. **Basic Types** ✅
```rel
name: string
age: number
active: boolean
data: any
unknown: unknown
obj: object
created: date
```

#### 2. **Format Types** ✅
```rel
email: email
website: url
userId: uuid
phone: phone
server: ip
config: json
color: hex
encoded: base64
token: jwt
version: semver
slug: slug
bio: text
password: password
username: username
```

#### 3. **Number Types** ✅
```rel
count: int
price: positive
debt: negative
ratio: float
precise: double
```

#### 4. **Constraints** ✅
```rel
age: number & min(18) & max(120)
username: string & minLength(3) & maxLength(20)
tags: string[] & min(1) & max(10)
```

#### 5. **Optional Fields** ✅
```rel
bio: string?
avatar: url?
tags: string[]?
```

#### 6. **Union Types** ✅
```rel
role: admin | user | guest
status: active | inactive | pending
size: S | M | L | XL
```

#### 7. **Arrays** ✅
```rel
tags: string[]
scores: number[]
items: int[]
emails: email[]
```

#### 8. **Array Constraints** ✅
```rel
tags: string[] & min(1) & max(10)
scores: number[] & min(3)
```

#### 9. **Record Types** ✅
```rel
metadata: record<string, any>
headers: record<string, string>
counts: record<string, number>
```

#### 10. **Literal Values** ✅
```rel
# Direct syntax
version: =1
environment: =production

# Constraint syntax
role: &literal(admin)
apiVersion: &literal(2)
```

#### 11. **Regex Patterns** ✅
```rel
zipCode: string & matches(r"^\d{5}$")
username: string & matches(r"^[a-z0-9_]+$")
hexColor: string & matches(r"^#[0-9A-F]{6}$")
```

#### 12. **Nested Inline Objects** ✅
```rel
profile: {
  bio: string,
  avatar: url?,
  social: {
    twitter: string?,
    github: string?
  }
}
```

#### 13. **Conditional Validation** ✅
```rel
when role = admin {
  adminToken: string
  permissions: string[]
}

when age >= 18 {
  canVote: boolean
  adultContent: boolean
}

when isPremium = true {
  premiumFeatures: string[]
  adFree: boolean
}
```

#### 14. **else-when Blocks** ✅
```rel
when category = electronics {
  warranty: number
  specs: record<string, string>
} else when category = clothing {
  size: S | M | L | XL
  material: string
} else {
  organic: boolean?
}
```

#### 15. **Enums** ✅
```rel
enum UserRole {
  admin
  moderator
  user
  guest
}
```
Generates: `export const UserRoleSchema = "admin|moderator|user|guest";`

#### 16. **Import/Export System** ✅
```rel
# base.rel
define BaseEntity {
  id: uuid
  createdAt: date
}
export BaseEntity

# user.rel
import { BaseEntity } from "./base.rel"
define User {
  id: uuid
  email: email
}
export User

# product.rel
import { User } from "./user.rel"
define Product {
  ownerId: uuid
  name: string
}
export Product
```

**Features:**
- ✅ Automatic dependency resolution
- ✅ Topological sorting
- ✅ Circular dependency detection
- ✅ Single file output with all dependencies
- ✅ No duplicate schemas
- ✅ Cross-file type references

## Generated Output

### TypeScript Interface Schemas
All schemas generate as ReliantType `Interface` schemas:

```typescript
import { Interface } from 'reliant-type';

export const UserSchema = Interface({
  id: "uuid",
  email: "email",
  username: "string(3,20)",
  age: "number(18,120)?",
  role: "admin|user|guest",
  profile: {
    bio: "string?",
    avatar: "url?",
  },
  adminToken: "when role=admin *? string : any?",
  permissions: "when role=admin *? string[] : any?",
});
```

## Test Coverage

### Comprehensive Test Suite
- ✅ 14/14 conditional validation tests passing
- ✅ Role-based conditionals
- ✅ Age-based conditionals
- ✅ Boolean-based conditionals
- ✅ Complex multi-conditional schemas
- ✅ Array constraints in conditionals
- ✅ Nested objects
- ✅ Import/export system

## Usage

### Single File
```bash
cargo run -- build --input schema.rel --output dist
```

### With Imports
```bash
# Compiles product.rel and all its dependencies
cargo run -- build --input product.rel --output dist
```

### Directory
```bash
cargo run -- build --input schemas/ --output dist/
```

## Architecture

### Compiler Pipeline
1. **Lexer** - Tokenizes .rel source code
2. **Parser** - Builds Abstract Syntax Tree (AST)
3. **Resolver** - Resolves imports and dependencies
4. **Generator** - Generates TypeScript/ReliantType code

### Module System
- **ModuleResolver** - Handles dependency resolution
- **Circular dependency detection**
- **Topological sorting** for correct order
- **AST merging** for single output

## Performance

- **Fast compilation** - Rust-based compiler
- **Efficient parsing** - Single-pass lexer/parser
- **Smart caching** - Modules parsed once
- **Minimal output** - Clean, optimized TypeScript

## Compatibility

- **ReliantType v1.0+** - Full compatibility
- **TypeScript 4.5+** - Generated code compatible
- **Node.js 14+** - Runtime compatible

## Future Enhancements

Potential additions:
- [ ] `extends` keyword for schema inheritance
- [ ] `mixin` support for composition
- [ ] Generic types `define List<T> { items: T[] }`
- [ ] Computed fields
- [ ] Custom validation functions
- [ ] Watch mode for development
- [ ] Source maps for debugging

## Status

**🎉 PRODUCTION-READY!**

- ✅ All core features implemented
- ✅ Comprehensive test coverage
- ✅ Full ReliantType compatibility
- ✅ Modular architecture
- ✅ Import/export system
- ✅ Conditional validation
- ✅ Nested objects
- ✅ Complete documentation

The ret-compiler is ready for production use!
