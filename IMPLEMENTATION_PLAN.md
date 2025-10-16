# Implementation Plan for Missing Features

## Phase 1: Critical Fixes (DONE ✅)
- [x] Optional fields with `?` suffix
- [x] Single file compilation mode
- [x] TypeName tokens as field names (e.g., `email: email`)
- [x] Basic type conversions

## Phase 2: High Priority Features (NEXT)

### 1. Literal Values (Const Values)
**ReliantType Syntax:** `role: "=admin"`
**Proposed .rel Syntax:** `role: =admin` or `role: const(admin)`

```rel
define Config {
  version: =1.0
  environment: =production
  isEnabled: =true
  defaultConfig: ={"theme":"dark"}
}
```

### 2. Record Types (Generic Objects)
**ReliantType Syntax:** `"record<string,any>"`
**Current .rel Syntax:** `record<string, string>` (already parsed!)

```rel
define Schema {
  metadata: record<string, any>
  headers: record<string, string>
  counts: record<string, number>
}
```

### 3. Regex Patterns
**ReliantType Syntax:** `"string(/^\\d{5}$/)"`
**Proposed .rel Syntax:** `zipCode: string & matches(/^\d{5}$/)`

```rel
define Patterns {
  zipCode: string & matches(/^\d{5}$/)
  username: string & matches(/^[a-zA-Z0-9_]{3,20}$/)
  hexColor: string & matches(/^#[0-9A-Fa-f]{6}$/)
}
```

### 4. Array Constraints
**ReliantType Syntax:** `"string[](1,5)"`
**Proposed .rel Syntax:** `tags: string[] & min(1) & max(5)`

```rel
define ArrayConstraints {
  tags: string[] & min(1) & max(10)
  scores: number[] & min(3)
  flags: boolean[] & max(5)
}
```

### 5. Nested Objects
**ReliantType Syntax:** Inline object definition
**Proposed .rel Syntax:** Inline object or reference

```rel
define Order {
  id: uuid
  customer: {
    name: string
    email: email
    address: {
      street: string
      city: string
      zipCode: string
    }
  }
  items: [{
    name: string
    price: number
    quantity: int
  }]
}
```

## Phase 3: Conditional Validation

### V1 Conditional Syntax
**ReliantType Syntax:** `"when role=admin *? string[] : string[]?"`
**Proposed .rel Syntax:** Inline conditional

```rel
define ConditionalV1 {
  role: admin | user | guest
  permissions: when role=admin *? string[] : string[]?
  adminAccess: when role!=guest *? boolean : boolean?
  adultContent: when age>=18 *? boolean : boolean?
}
```

### V2 Runtime Methods
**ReliantType Syntax:** `"when config.permissions.$exists() *? boolean : =false"`
**Proposed .rel Syntax:** Same as V1 but with method calls

```rel
define ConditionalV2 {
  config: any?
  user: any?
  
  hasPermissions: when config.permissions.$exists() *? boolean : =false
  hasProfile: when user.profile.$exists() *? boolean : =false
  isListEmpty: when config.items.$empty() *? boolean : =true
}
```

## Phase 4: Advanced Features

### 1. Default Values
```rel
define Defaults {
  active: boolean = true
  role: string = "user"
  count: number = 0
}
```

### 2. Computed Fields
```rel
define Computed {
  subtotal: number
  taxRate: number
  tax: number = subtotal * taxRate
  total: number = subtotal + tax
}
```

### 3. Extends (Inheritance)
```rel
define User {
  id: uuid
  email: email
  name: string
}

define Admin extends User {
  permissions: string[]
  role: =admin
}
```

### 4. Mixins (Composition)
```rel
mixin Timestamps {
  createdAt: date
  updatedAt: date
}

define User with Timestamps {
  id: uuid
  email: email
  name: string
}
```

### 5. Generics
```rel
define Response<T> {
  success: boolean
  data: T
  errors: string[]?
}

define UserResponse extends Response<User> {
  # Inherits all Response fields with T = User
}
```

### 6. Enums
```rel
enum Status {
  active
  inactive
  pending
  suspended
}

define User {
  status: Status
}
```

### 7. Type Aliases
```rel
type ID = uuid
type Email = email
type Timestamp = date

define User {
  id: ID
  email: Email
  createdAt: Timestamp
}
```

### 8. Imports/Exports
```rel
import { User, Admin } from "./users"
import { Timestamps } from "./mixins"

export User
export Admin
```

## Implementation Priority

1. **IMMEDIATE (This Session)**
   - [x] Fix optional fields ✅
   - [ ] Add literal values (const)
   - [ ] Test record types (already parsed)
   - [ ] Add missing format types (text, password, unknown)

2. **SHORT TERM (Next Session)**
   - [ ] Regex patterns with matches()
   - [ ] Array constraints
   - [ ] Nested objects
   - [ ] Conditional validation (inline syntax)

3. **MEDIUM TERM**
   - [ ] Default values
   - [ ] Computed fields
   - [ ] Extends/inheritance
   - [ ] Mixins

4. **LONG TERM**
   - [ ] Generics
   - [ ] Enums (generate TypeScript enums)
   - [ ] Type aliases
   - [ ] Import/export system

## Testing Strategy

For each feature:
1. Create test `.rel` file
2. Compile to TypeScript
3. Verify output matches ReliantType syntax
4. Test with actual ReliantType validation
5. Document in FEATURE_MATRIX.md
