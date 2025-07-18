# Fortify Schema Reference Documentation

## Table of Contents
- [Basic Types](#basic-types)
- [Format Types](#format-types)
- [Numeric Types](#numeric-types)
- [Advanced Types](#advanced-types)
- [Modifiers](#modifiers)
- [Constraints](#constraints)
- [Utility Functions](#utility-functions)
- [Union Types](#union-types)
- [Conditional Logic](#conditional-logic)

---

## Basic Types

### `string`
**Description:** Validates string values.
**Example:** `"string"`, `"string?"`, `"string[]"`
**Use Cases:** Names, descriptions, text content
```typescript
const schema = Interface({
  name: "string",
  description: "string?"
});
```

### `number`
**Description:** Validates numeric values (integers and floats).
**Example:** `"number"`, `"number(1,100)"`, `"number[]"`
**Use Cases:** IDs, counts, measurements
```typescript
const schema = Interface({
  id: "number",
  age: "number(0,120)",
  scores: "number[]"
});
```

### `boolean`
**Description:** Validates boolean values (true/false).
**Example:** `"boolean"`, `"boolean?"`
**Use Cases:** Flags, toggles, status indicators
```typescript
const schema = Interface({
  isActive: "boolean",
  hasPermission: "boolean?"
});
```

### `date`
**Description:** Validates Date objects and ISO date strings.
**Example:** `"date"`, `"date?"`, `"date[]"`
**Use Cases:** Timestamps, birthdays, deadlines
```typescript
const schema = Interface({
  createdAt: "date",
  updatedAt: "date?",
  milestones: "date[]"
});
```

### `any`
**Description:** Accepts any value type (use sparingly).
**Example:** `"any"`, `"any?"`
**Use Cases:** Dynamic content, migration scenarios
```typescript
const schema = Interface({
  metadata: "any",
  config: "record<string, any>"
});
```

---

## Format Types

### `email`
**Description:** Validates email addresses with proper format.
**Example:** `"email"`, `"email?"`, `"email[]"`
**Validation:** Must contain @ symbol and valid domain structure
```typescript
const schema = Interface({
  primaryEmail: "email",
  alternateEmails: "email[]"
});
```

### `url`
**Description:** Validates URL strings.
**Example:** `"url"`, `"url?"`, `"url.https"`
**Variants:** `url.http`, `url.https`, `url.dev`
```typescript
const schema = Interface({
  website: "url",
  apiEndpoint: "url.https",
  devUrl: "url.dev?"
});
```

### `phone`
**Description:** Validates phone number formats.
**Example:** `"phone"`, `"phone?"`
**Use Cases:** Contact information
```typescript
const schema = Interface({
  mobile: "phone",
  landline: "phone?"
});
```

### `uuid`
**Description:** Validates UUID strings (v4 format).
**Example:** `"uuid"`, `"uuid?"`
**Use Cases:** Unique identifiers, database keys
```typescript
const schema = Interface({
  id: "uuid",
  sessionId: "uuid?"
});
```

---

## Numeric Types

### `positive`
**Description:** Validates positive numbers (> 0).
**Example:** `"positive"`, `"positive(1,100)"`
**Use Cases:** Quantities, prices, counts
```typescript
const schema = Interface({
  price: "positive",
  quantity: "positive(1,999)"
});
```

### `negative`
**Description:** Validates negative numbers (< 0).
**Example:** `"negative"`, `"negative(-100,-1)"`
**Use Cases:** Debts, temperature below zero
```typescript
const schema = Interface({
  debt: "negative",
  temperature: "negative(-50,0)"
});
```

### `double`
**Description:** Validates floating-point numbers with decimal precision.
**Example:** `"double"`, `"double(0.1,99.9)"`
**Use Cases:** Precise measurements, percentages
```typescript
const schema = Interface({
  percentage: "double(0,100)",
  measurement: "double"
});
```

---

## Advanced Types

### `record<K, V>`
**Description:** Validates objects with dynamic keys of type K and values of type V.
**Example:** `"record<string, any>"`, `"record<string, number>"`
**Use Cases:** Dynamic mappings, configuration objects
```typescript
const schema = Interface({
  settings: "record<string, string>",
  counters: "record<string, number>",
  metadata: "record<string, any>"
});
```

---

## Modifiers

### Optional (`?`)
**Description:** Makes a field optional (can be undefined).
**Example:** `"string?"`, `"number?"`, `"email?"`
**Usage:** Append `?` to any type
```typescript
const schema = Interface({
  required: "string",
  optional: "string?"
});
```

### Arrays (`[]`)
**Description:** Validates arrays of the specified type.
**Example:** `"string[]"`, `"number[]"`, `"email[]"`
**Usage:** Append `[]` to any type
```typescript
const schema = Interface({
  tags: "string[]",
  scores: "number[]",
  contacts: "email[]"
});
```

### Array with Constraints (`[](min,max)`)
**Description:** Validates arrays with length constraints.
**Example:** `"string[](1,5)"`, `"number[](0,10)"`
**Usage:** Append `[](min,max)` to any type
```typescript
const schema = Interface({
  tags: "string[](1,10)",
  scores: "number[](3,5)"
});
```

---

## Constraints

### Numeric Constraints `(min,max)`
**Description:** Validates numbers within a specific range.
**Example:** `"number(1,100)"`, `"positive(0,999)"`
**Usage:** Works with all numeric types
```typescript
const schema = Interface({
  age: "number(0,120)",
  score: "positive(1,100)",
  temperature: "double(-50.0,50.0)"
});
```

### String Length Constraints `(min,max)`
**Description:** Validates string length within specified bounds.
**Example:** `"string(3,50)"`, `"string(1,255)"`
**Usage:** Append `(min,max)` to string type
```typescript
const schema = Interface({
  username: "string(3,20)",
  description: "string(0,500)"
});
```

### Regex Constraints `(/pattern/flags)`
**Description:** Validates strings against regular expressions.
**Example:** `"string(/^[A-Z]+$/)"`, `"string(/\\d{4}/g)"`
**Usage:** Append `(/regex/)` to string type
```typescript
const schema = Interface({
  code: "string(/^[A-Z]{3}$/)",
  version: "string(/^v\\d+\\.\\d+$/)"
});
```

---

## Utility Functions

### `Make.const(value)`
**Description:** Creates a constant value that must match exactly.
**Example:** `Make.const("admin")`, `Make.const(42)`
**Use Cases:** Literal values, enums, fixed configurations
```typescript
const schema = Interface({
  type: Make.const("user"),
  version: Make.const("1.0"),
  status: Make.const(200)
});
```

---

## Union Types

### Basic Unions (`type1|type2`)
**Description:** Validates against multiple possible types.
**Example:** `"string|number"`, `"email|phone"`
**Use Cases:** Flexible input types
```typescript
const schema = Interface({
  id: "string|number",
  contact: "email|phone",
  value: "string|number|boolean"
});
```

### Literal Unions (`"value1"|"value2"`)
**Description:** Validates against specific literal values.
**Example:** `"admin"|"user"`, `"light"|"dark"`
**Use Cases:** Enums, predefined options
```typescript
const schema = Interface({
  role: "admin"|"user"|"guest",
  theme: "light"|"dark",
  status: "active"|"inactive"|"pending"
});
```

---

## Conditional Logic

### `when` Conditions
**Description:** Applies conditional validation based on other field values.
**Syntax:** `when condition *? thenType : elseType`
**Example:** `when role === "admin" *? "string" : "string?"`
**Use Cases:** Dynamic validation, role-based schemas
```typescript
const schema = Interface({
  role: "admin"|"user",
  permissions: 'when role === "admin" *? "string[]" : "string[]?"',
  adminKey: 'when role === "admin" *? "string" : undefined'
});
```

### Nested Conditions
**Description:** Complex conditional logic with multiple branches.
**Example:** Nested when statements for complex business logic
```typescript
const schema = Interface({
  userType: "premium"|"basic"|"trial",
  features: 'when userType === "premium" *? "string[]" : when userType === "basic" *? "string[](0,5)" : "string[](0,2)"'
});
```
