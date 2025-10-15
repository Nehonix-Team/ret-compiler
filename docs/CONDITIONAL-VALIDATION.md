# Conditional Validation Guide

Complete guide to ReliantType's conditional validation - from basic V1 syntax to advanced V2 runtime methods.

## 📚 Table of Contents

- [Introduction](#introduction)
- [V1 Conditional Validation (Legacy)](#v1-conditional-validation-legacy)
- [V2 Conditional Validation (Current)](#v2-conditional-validation-current)
- [V2 Runtime Methods](#v2-runtime-methods)
- [Advanced Patterns](#advanced-patterns)
- [Migration from V1 to V2](#migration-from-v1-to-v2)
- [Best Practices](#best-practices)

## Introduction

Conditional validation allows you to create dynamic validation rules based on the values of other fields or runtime properties. ReliantType supports both V1 (legacy) and V2 (current) conditional validation syntax.

### Basic Concept

```typescript
const Schema = Interface({
  role: "admin|user|guest",

  // Conditional validation: "when condition *? then : else"
  permissions: "when role=admin *? string[] : string[]?",
  //           ^^^^           ^^           ^
  //           keyword        operator     separator
});
```

## V1 Conditional Validation (Legacy)

V1 syntax is still supported for backward compatibility but V2 is recommended for new projects. But the same logic can be applied to V2, only the methods call syntax are different.

### Basic V1 Syntax

```typescript
const V1Schema = Interface({
  role: "admin|user|guest",
  accountType: "free|premium|enterprise",
  age: "number(13,120)",

  // Basic equality
  adminAccess: "when role=admin *? string[] : string[]?",

  // Inequality
  nonGuestAccess: "when role!=guest *? boolean : boolean?",

  // Numeric comparisons
  adultContent: "when age>=18 *? boolean : boolean?",
  seniorDiscount: "when age>65 *? number(0,50) : number(0,0)",
  youthProgram: "when age<25 *? boolean : boolean?",

  // Value inclusion
  premiumFeatures:
    "when accountType.$in(premium,enterprise) *? string[] : string[]?",
});
```

### V1 Operators

| Operator | Description           | Example                         |
| -------- | --------------------- | ------------------------------- |
| `=`      | Equals                | `when role=admin`               |
| `!=`     | Not equals            | `when role!=guest`              |
| `>`      | Greater than          | `when age>18`                   |
| `>=`     | Greater than or equal | `when age>=21`                  |
| `<`      | Less than             | `when age<65`                   |
| `<=`     | Less than or equal    | `when age<=25`                  |
| `.in()`  | Value in list         | `when role.in(admin,moderator)` |

### V1 Limitations

- Will be deprecated in future versions
- Limited to simple property comparisons
- No runtime property existence checking
- No complex method calls
- Limited string operations

## V2 Conditional Validation (Current)

V2 introduces powerful runtime property checking with the new `property.$method()` syntax.

### Basic V2 Syntax

```typescript
const V2Schema = Interface({
  // Runtime data objects
  config: "any?",
  user: "any?",
  features: "any?",

  // Basic user data
  id: "uuid",
  email: "email",
  role: "admin|user|guest",

  // V2 Runtime Methods - Enhanced property checking
  hasPermissions: "when config.permissions.$exists() *? boolean : =false",
  hasProfile: "when user.profile.$exists() *? boolean : =false",
  isListEmpty: "when config.items.$empty() *? boolean : =true",
  hasAdminRole: "when user.roles.$contains(admin) *? boolean : =false",
});
```

### V2 Advantages

- **Runtime property checking** - Check if properties exist at runtime
- **Deep property access** - Navigate nested objects safely
- **String operations** - Advanced string checking methods
- **Numeric operations** - Range and value checking
- **Complex defaults** - Object and array default values
- **Special character support** - Handle properties with special characters

## V2 Runtime Methods

### Property Existence Methods

#### `$exists()` - Check Property Existence

```typescript
const ExistsSchema = Interface({
  config: "any?",
  user: "any?",

  // Basic existence checking
  hasConfig: "when config.$exists() *? boolean : =false",
  hasUserProfile: "when user.profile.$exists() *? boolean : =false",

  // Deep nested checking
  hasAdvancedSettings:
    "when user.profile.settings.advanced.$exists() *? boolean : =false",

  // Special characters
  hasSpecialFeature:
    'when config["admin-override"].$exists() *? boolean : =false',

  // Unicode support
  hasUnicodeFeature: "when features.feature_🚀.$exists() *? boolean : =false",
});
```

### Empty/Null Checking Methods

#### `$empty()` - Check if Empty

```typescript
const EmptySchema = Interface({
  data: "any?",

  // String empty checking
  hasContent: "when data.description.$empty() *? =no_content : =has_content",

  // Array empty checking
  hasItems: "when data.items.$empty() *? =no_items : =has_items",

  // Object empty checking
  hasMetadata: "when data.metadata.$empty() *? =no_metadata : =has_metadata",
});
```

#### `$null()` - Check if Null

```typescript
const NullSchema = Interface({
  data: "any?",

  // Null checking
  isDataNull: "when data.value.$null() *? =is_null : =not_null",

  // Combined with existence
  hasValidData:
    "when data.value.$exists() && !data.value.$null() *? boolean : =false",
});
```

### String Methods

#### `$contains(value)` - Check String Contains

```typescript
const ContainsSchema = Interface({
  data: "any?",

  // Basic contains
  hasImportantInfo:
    "when data.description.$contains(important) *? boolean : =none",

  // Multiple contains checks
  hasKeywords:
    "when data.content.$contains(urgent) || data.content.$contains(priority) *? boolean : =no_keywords",

  // Case-sensitive checking
  hasExactMatch: "when data.title.$contains(URGENT) *? boolean : =no_match",
});

const data = {
  title: "Big title ..... ",
  content: "something more beautifull....urgent",
  description: `Lorem ipsum dolor sit amet consectetur, adipisicing elit. Harum neque
    architecto commodi ipsam excepturi repellat consequatur, provident
    asperiores. Excepturi earum vero amet enim consequatur quasi, fugit
    cupiditate! Corrupti, incidunt exercitationem. something ..... `,
};
const result = ContainsSchema.safeParse({
  data,
  hasExactMatch: "no_match",
  hasImportantInfo: "none",
  hasKeywords: "no_keywords",
});
if (result.success) {
  console.log("✅ Expected success:", result.data);
} else {
  console.log("❌ Expected errors:", result.errors);
}
```

#### `$startsWith(prefix)` - Check String Prefix

```typescript
const StartsWithSchema = Interface({
  data: "any?",

  // Prefix checking
  isSystemMessage: "when data.message.$startsWith(SYSTEM:) *? boolean : =false",
  isErrorCode: "when data.code.$startsWith(ERR_) *? boolean : =false",

  // URL checking
  isSecureUrl: "when data.url.$startsWith(https://) *? boolean : =false",
});
```

#### `$endsWith(suffix)` - Check String Suffix

```typescript
const EndsWithSchema = Interface({
  data: "any?",

  // File extension checking
  isPdfFile: "when data.filename.$endsWith(.pdf) *? boolean : =no_pdf_file",
  isImageFile:
    "when data.filename.$endsWith(.jpg) || data.filename.$endsWith(.png) *? boolean : =no_img",

  // Domain checking
  isCorporateEmail:
    "when data.email.$endsWith(@company.com) *? boolean : =no_itsnot_corporated",
});

const data = {
  filename: "super_file.ehezezpaozdj.pdf", //is pdf
  email: "mail@somethingelse.com", //false so should fail
};
const result = EndsWithSchema.safeParse({
  data,
  isPdfFile: true,
  isCorporateEmail: true,
  isImageFile: "no_img",
});
if (result.success) {
  console.log("✅ Expected success:", result.data);
} else {
  console.log("❌ Expected errors:", result.errors);
}
```

### Numeric Methods

#### `$between(min,max)` - Check Numeric Range

```typescript
const BetweenSchema = Interface({
  data: "any?",

  // Age range checking
  isAdult: "when data.age.$between(18,65) *? boolean : =isnt_adult",

  // Score validation
  isPassingGrade:
    "when data.score.$between(60,100) *? boolean : =itsnt_passgrade",

  // Price range
  isAffordable: "when data.price.$between(0,100) *? boolean : =yes_itis",
});

const data = {
  age: 17,
  score: 59,
  price: 40,
};
const result = BetweenSchema.safeParse({
  data,
  isAdult: true, //should fail because of age >= 18
  isPassingGrade: true, //should also faild
  isAffordable: true,
});
if (result.success) {
  console.log("✅ Expected success:", result.data);
} else {
  console.log("❌ Expected errors:", result.errors);
}
```

#### `$in(val1,val2,...)` - Check Value Inclusion

```typescript
const InSchema = Interface({
  data: "any?",

  // Role checking
  hasElevatedAccess:
    "when data.role.$in(admin,moderator,super_admin) *? boolean : =not_allowed",

  // Status checking
  isActiveStatus:
    "when data.status.$in(active,pending,processing) *? boolean : =not_active",

  // Category checking
  isPremiumCategory:
    "when data.category.$in(premium,enterprise,vip) *? boolean : =itsnot_premium",
});

const data = {
  age: 17,
  role: "admin",
  status: "active",
  category: "premium",
};
const result = InSchema.safeParse({
  data,
  hasElevatedAccess: true,
  isActiveStatus: "not_active", //should faild because "status" contains one of the requirements
  isPremiumCategory: "itsnot_premium", // should faild also
});
if (result.success) {
  console.log("✅ Expected success:", result.data);
} else {
  console.log("❌ Expected errors:", result.errors);
}
```

## Advanced Patterns

### Complex Default Values

```typescript

const ComplexDefaultsSchema = Interface({
  config: "any?",

  // Object defaults
  // @fortify-ignore
  defaultSettings:
    'when config.settings.$exists() *? any : ={"theme":"dark","lang":"en"}',

  // Array defaults
  // @fortify-ignore
  defaultTags: 'when config.tags.$exists() *? string[] : =["default","user"]',

  // Nested object defaults
  defaultProfile:
    'when config.profile.$exists() *? any : ={"name":"Anonymous","avatar":null}',

  // Complex conditional defaults
  advancedConfig:
    'when config.advanced.$exists() *? any : ={"features":[],"permissions":{}}',
});

const config = {
  // settings: "yes", //not exist
  // advancedConfig: "yes", //not exist
  defaultProfile: "yes",
  defaultTags: "yes"
};
const result = ComplexDefaultsSchema.safeParse({
  config,
  defaultSettings: "",
  defaultTags: true,
  defaultProfile: true,
  advancedConfig: ""
});
if (result.success) {
  console.log("✅ Expected success:", result.data);
} else {
  console.log("❌ Expected errors:", result.errors);
}

```

### Method Combinations

```typescript
const CombinedMethodsSchema = Interface({
  user: "any?",
  config: "any?",

  // Logical AND
  isValidUser:
    "when user.email.$exists() && user.verified.$exists() *? boolean : =false",

  // Logical OR
  hasContact:
    "when user.email.$exists() || user.phone.$exists() *? boolean : =false",

  // Complex combinations
  canAccessFeature:
    "when user.role.$in(admin,premium) && config.features.$contains(advanced) *? boolean : =false",

  // Nested conditions
  accessLevel:
    "when user.role=admin *? when config.superAdmin.$exists() *? =super : =admin : =user",
});
```

### Deep Property Access

```typescript
const DeepAccessSchema = Interface({
  data: "any?",

  // Multi-level property access
  hasDeepFeature:
    "when data.user.profile.settings.advanced.features.$exists() *? boolean : =false",

  // Array property access
  hasFirstItem: "when data.items[0].$exists() *? boolean : =false",

  // Mixed access patterns
  hasNestedValue:
    "when data.config.nested.deep.value.$exists() *? boolean : =false",
});
```

### Special Characters and Unicode

```typescript

const SpecialCharsSchema = Interface({
  config: "any?",

  // Properties with hyphens
  hasAdminOverride:
    'when config["admin-override"].$exists() *? boolean : =not_allowed',

  // Properties with spaces
  hasSpecialConfig:
    'when config["special config"].$exists() *? boolean : =no_sp_config',
});

const config = {
  "admin-override": true,
  "special config":  true
}

const result = SpecialCharsSchema.safeParse({
  config,
  hasAdminOverride: "not_allowed", // should throw err
  hasSpecialConfig: "no_sp_config", // should also throw err
});
if (result.success) {
  console.log("✅ Expected success:", result.data);
} else {
  console.log("❌ Expected errors:", result.errors);
}

```

## Migration from V1 to V2

### Migration Examples

#### Basic Property Checking

```typescript

const Schema1 = Interface({
  role: "admin|user|guest",
  permissions: "when role=admin *? string[] : string[]?",
});

const Schema2 = Interface({
  role: "admin|user|guest",
  config: "any?",
  permissions: "when config.hasPermissions.$exists() *? string[] : =[]",
});
```

#### Complex Business Logic

```typescript
const V1BusinessSchema = Interface({
  accountType: "free|premium|enterprise",
  userLevel: "basic|advanced|expert",

  maxProjects: "when accountType=free *? number(1,3) : number(1,100)",
  advancedFeatures:
    "when userLevel.in(advanced,expert) *? string[] : string[]?",
});

const V2BusinessSchema = Interface({
  accountType: "free|premium|enterprise",
  userLevel: "basic|advanced|expert",
  config: "any?",
  features: "any?",

  maxProjects:
    "when config.account.$in(free,trial) *? number(1,3) : number(1,100)",
  advancedFeatures: "when features.advanced.$exists() *? string[] : =[]",

  // New capabilities not possible in V1
  dynamicLimits: "when config.limits.$exists() *? any : ={}",
  customFeatures: "when features.custom.$exists() *? string[] : =[]",
});
```

### Migration Strategy

1. **Identify V1 patterns** in your existing schemas
2. **Add runtime data objects** (`config: "any?"`, `features: "any?"`)
3. **Replace simple comparisons** with runtime method calls
4. **Enhance with new capabilities** available in V2
5. **Test thoroughly** to ensure behavior matches expectations

## Best Practices

### 1. Use Descriptive Property Names

```typescript
// ✅ Good
const Schema = Interface({
  config: "any?",
  hasPermissions: "when config.permissions.$exists() *? boolean : =false",
  canEditContent: "when config.editRights.$exists() *? boolean : =false",
});

// ❌ Avoid
const Schema = Interface({
  config: "any?",
  p: "when config.permissions.$exists() *? boolean : =false",
  e: "when config.editRights.$exists() *? boolean : =false",
});
```

### 2. Provide Meaningful Defaults

```typescript
// ✅ Good - Clear default values
const Schema = Interface({
  config: "any?",
  userRole: "when config.role.$exists() *? string : =guest",
  permissions: "when config.permissions.$exists() *? string[] : =[]",
  settings: 'when config.settings.$exists() *? any : ={"theme":"light"}',
});

// ❌ Avoid - Unclear defaults
const Schema = Interface({
  config: "any?",
  userRole: "when config.role.$exists() *? string : =unknown",
  permissions: "when config.permissions.$exists() *? string[] : =null",
});
```

### 3. Use Appropriate Methods

```typescript
// ✅ Good - Use specific methods for specific checks
const Schema = Interface({
  data: "any?",
  hasContent:
    "when data.description.$exists() && !data.description.$empty() *? boolean : =false",
  isValidEmail:
    "when data.email.$exists() && data.email.$contains(@) *? boolean : =false",
  isAdminUser: "when data.role.$in(admin,super_admin) *? boolean : =false",
});

// ❌ Avoid - Generic existence checking when specific methods exist
const Schema = Interface({
  data: "any?",
  hasContent: "when data.description.$exists() *? boolean : =false", // Doesn't check if empty
  isValidEmail: "when data.email.$exists() *? boolean : =false", // Doesn't validate format
  isAdminUser: "when data.role.$exists() *? boolean : =false", // Doesn't check specific values
});
```

### 4. Handle Edge Cases

```typescript
const RobustSchema = Interface({
  user: "any?",
  config: "any?",

  // Handle missing nested properties safely
  hasValidProfile:
    "when user.$exists() && user.profile.$exists() && !user.profile.$empty() *? boolean : =false",

  // Provide fallbacks for missing configuration
  maxRetries: "when config.retries.$exists() *? number : =3",
  timeout: "when config.timeout.$exists() *? number : =5000",

  // Handle array edge cases
  hasItems:
    "when config.items.$exists() && !config.items.$empty() *? boolean : =false",
});
```

### 5. Performance Considerations

```typescript
// ✅ Good - Efficient condition ordering
const Schema = Interface({
  config: "any?",

  // Check existence first (fastest)
  hasFeature:
    "when config.$exists() && config.features.$exists() *? boolean : =false",

  // Simple checks before complex ones
  isEnabled:
    "when config.enabled.$exists() && config.features.$contains(advanced) *? boolean : =false",
});

// ❌ Avoid - Inefficient ordering
const Schema = Interface({
  config: "any?",

  // Complex check before existence check
  hasFeature:
    "when config.features.$contains(advanced) && config.$exists() *? boolean : =false",
});
```

## 🔗 Related Documentation

- **[Getting Started](./GETTING-STARTED.md)** - Basic ReliantType usage
- **[Field Types Reference](./FIELD-TYPES.md)** - Complete type reference
- **[Examples Collection](./EXAMPLES.md)** - Real-world usage patterns
- **[Quick Reference](./QUICK-REFERENCE.md)** - Syntax cheat sheet
