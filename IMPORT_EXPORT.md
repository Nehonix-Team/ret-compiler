# Import/Export System - Complete Guide

## Overview

The ret-compiler implements **proper JavaScript/TypeScript-style** import/export semantics:

✅ **Unused imports throw errors**  
✅ **Only export what's explicitly exported**  
✅ **Track import usage**  
✅ **Resolve dependencies automatically**  

## Syntax

### Import
```rel
import { Type1, Type2 } from "./file.rel"
```

### Export
```rel
export Type1, Type2
```

## How It Works

### 1. Unused Import Detection

**Error if you import but don't use:**

```rel
# ❌ ERROR: Unused import
import { User } from "./user.rel"

define Product {
  id: uuid
  # Not using User!
}

export Product
```

**Error message:**
```
Unused imports detected: User. Remove them or use them in your schemas.
```

### 2. Only Export What's Explicitly Exported

**Only schemas in the export statement are exported:**

```rel
# types.rel
define Address { ... }
define Contact { ... }
export Address  # Only Address is exported!
```

**Generated output:**
```typescript
export const AddressSchema = Interface({ ... });
export { Address };  // Only Address!
```

### 3. Automatic Dependency Resolution

**Imported types are automatically included:**

```rel
# user.rel
import { Address, Contact } from "./types.rel"

define User {
  address: Address  # Uses imported type
  contact: Contact  # Uses imported type
}

export User
```

**Generated output includes:**
- ✅ AddressSchema (because User uses it)
- ✅ ContactSchema (because User uses it)
- ✅ UserSchema
- ✅ Only `export { User };` (not Address or Contact)

## Examples

### Example 1: Simple Import/Export

**types.rel:**
```rel
define Address {
  street: string
  city: string
}

export Address
```

**user.rel:**
```rel
import { Address } from "./types.rel"

define User {
  name: string
  address: Address
}

export User
```

**Command:**
```bash
cargo run -- build --input user.rel --output dist
```

**Generated user.ts:**
```typescript
import { Interface } from 'reliant-type';

export const AddressSchema = Interface({
  street: "string",
  city: "string",
});

export const UserSchema = Interface({
  name: "string",
  address: "Address",
});

export { User };  // Only User is exported!
```

### Example 2: Multiple Imports

**base.rel:**
```rel
define BaseEntity {
  id: uuid
  createdAt: date
}

export BaseEntity
```

**user.rel:**
```rel
define User {
  email: email
  username: string
}

export User
```

**product.rel:**
```rel
import { User } from "./user.rel"

define Product {
  name: string
  owner: User
}

export Product
```

**Generated product.ts:**
```typescript
// Includes User because Product uses it
export const UserSchema = Interface({ ... });

export const ProductSchema = Interface({
  name: "string",
  owner: "User",
});

export { Product };  // Only Product!
```

### Example 3: Unused Import Error

**product.rel:**
```rel
import { User } from "./user.rel"
import { Address } from "./types.rel"

define Product {
  name: string
  owner: User  // Uses User ✅
  # Not using Address! ❌
}

export Product
```

**Result:**
```
❌ Error: Unused imports detected: Address
```

## Comparison with JavaScript/TypeScript

### JavaScript
```javascript
// types.js
export const Address = { ... };
export const Contact = { ... };

// user.js
import { Address, Contact } from './types.js';
export const User = { address: Address, contact: Contact };
```

### ret-compiler (Same behavior!)
```rel
# types.rel
define Address { ... }
define Contact { ... }
export Address, Contact

# user.rel
import { Address, Contact } from "./types.rel"
define User { address: Address, contact: Contact }
export User
```

## Benefits

### 1. **Prevents Errors**
- Catches unused imports at compile time
- No dead code in generated files

### 2. **Clean Output**
- Only includes what's needed
- Smaller generated files
- Clear export statements

### 3. **Modular Architecture**
- Split schemas across multiple files
- Reuse common types
- Better organization

### 4. **Type Safety**
- Verifies imported types are used
- Tracks dependencies automatically
- Proper type references

## Advanced Features

### Transitive Dependencies

If A imports B, and B imports C, and A uses B which uses C:
- ✅ C is automatically included
- ✅ Only A is exported (if that's what you export)

**Example:**
```rel
# base.rel
define Base { id: uuid }
export Base

# user.rel
import { Base } from "./base.rel"
define User { base: Base }
export User

# product.rel
import { User } from "./user.rel"
define Product { owner: User }
export Product
```

**Generated product.ts includes:**
- Base (transitive dependency)
- User (direct dependency)
- Product (main export)

**But only exports:**
- `export { Product };`

### Circular Dependency Detection

```rel
# a.rel
import { B } from "./b.rel"
define A { b: B }
export A

# b.rel
import { A } from "./a.rel"  # ❌ Circular!
define B { a: A }
export B
```

**Error:**
```
Circular dependency detected: a.rel -> b.rel -> a.rel
```

## Best Practices

### 1. **Keep Base Types Separate**
```rel
# types/base.rel
define UUID { ... }
define Timestamp { ... }
export UUID, Timestamp
```

### 2. **Import Only What You Need**
```rel
# ✅ Good
import { User } from "./user.rel"

# ❌ Bad (if you don't use Product)
import { User, Product } from "./user.rel"
```

### 3. **Export Explicitly**
```rel
# ✅ Good - Clear what's public API
export User, Product

# ❌ Bad - Unclear
# (no export statement)
```

### 4. **Organize by Domain**
```
schemas/
  ├── base/
  │   ├── types.rel
  │   └── entities.rel
  ├── user/
  │   ├── user.rel
  │   └── profile.rel
  └── product/
      ├── product.rel
      └── category.rel
```

## Summary

The ret-compiler's import/export system works **exactly like JavaScript/TypeScript**:

✅ Unused imports = Error  
✅ Only export what you declare  
✅ Automatic dependency resolution  
✅ Clean, minimal output  
✅ Type-safe references  

This makes the ret-compiler feel natural for JavaScript/TypeScript developers while providing powerful modular schema architecture!
