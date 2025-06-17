# FortifyJS Schema System

A revolutionary schema validation system with **TypeScript interface-like syntax** that's incredibly easy to use and completely separate from validators.

## 🎯 The Problem with Current Schema Libraries

**Zod, Joi, Yup** - they all suffer from the same issues:

-   **Complex syntax** that doesn't feel natural
-   **Verbose definitions** that are hard to read
-   **Steep learning curves** for simple validation
-   **Heavy bundle sizes** with unnecessary features

## 💡 Our Solution: Interface-Based Schemas

We created a schema system that **looks and feels exactly like TypeScript interfaces** but provides runtime validation:

```typescript
// ❌ Zod (complex and verbose)
const UserSchema = z.object({
    id: z.number().int().positive(),
    email: z.string().email(),
    name: z.string().min(2).max(50),
    age: z.number().int().min(0).max(120).optional(),
    isActive: z.boolean().default(true),
    tags: z.array(z.string()).max(10).optional(),
});

// ✅ FortifyJS Interface (clean and intuitive)
const UserSchema = Interface({
    id: "number",
    email: "email",
    name: "string",
    age: "number?", // Optional with ?
    isActive: "boolean?", // Optional with smart defaults
    tags: "string[]?", // Optional array
    role: "admin", // Constant values
});
```

**It's literally that simple!** 🎉

## 🚀 Two Powerful Approaches

### 1. Interface-Based (Recommended)

**TypeScript interface syntax with runtime validation**

```typescript
import { Interface } from "@fortifyjs/core/schema";

const UserSchema = Interface({
    id: "number",
    email: "email",
    name: "string",
    age: "number?", // Optional
    isActive: "boolean?", // Optional
    tags: "string[]?", // Optional array
    role: "admin", // Constant value
    profile: {
        // Nested object
        bio: "string?",
        avatar: "url?",
    },
});
```

### 2. Fluent API (Traditional)

**Chainable method syntax for complex validation**

```typescript
import { Schema } from "@fortifyjs/core/schema";

const UserSchema = Schema.object({
    id: Schema.number().int().positive(),
    email: Schema.string().email(),
    name: Schema.string().min(2).max(50),
    age: Schema.number().int().min(0).max(120).optional(),
    isActive: Schema.boolean().default(true),
});
```

## 🎯 Why Interface-Based is Better

### ✅ Pros of Interface Syntax:

-   **Instantly familiar** to TypeScript developers
-   **Extremely readable** - looks like documentation
-   **Minimal learning curve** - no new API to learn
-   **Faster to write** - less typing, more intuitive
-   **Self-documenting** - schema IS the documentation

### ❌ Cons of Traditional Fluent APIs:

-   **Verbose and complex** - lots of chaining
-   **Hard to read** - especially with nested objects
-   **Learning curve** - need to memorize API methods
-   **More typing** - repetitive method calls

## 📚 Interface Field Types

### Basic Types

```typescript
{
  name: "string",           // String
  age: "number",            // Number
  active: "boolean",        // Boolean
  created: "date",          // Date
  data: "any"               // Any type
}
```

### Optional Fields (with `?`)

```typescript
{
  name: "string",           // Required
  age: "number?",           // Optional
  bio: "string?",           // Optional
  tags: "string[]?"         // Optional array
}
```

### Format Validation

```typescript
{
  email: "email",           // Email format
  website: "url",           // URL format
  id: "uuid",               // UUID format
  phone: "phone",           // Phone format
  slug: "slug",             // URL slug
  username: "username"      // Username format
}
```

### Number Types

```typescript
{
  id: "int",                // Integer
  count: "positive",        // Positive number
  price: "float",           // Float number
  rating: "number"          // Any number
}
```

### Array Types

```typescript
{
  tags: "string[]",         // Array of strings
  scores: "number[]",       // Array of numbers
  flags: "boolean[]",       // Array of booleans
  ids: "int[]",             // Array of integers
  emails: "email[]",        // Array of emails
  urls: "url[]"             // Array of URLs
}
```

### Constant Values (Safe Syntax)

```typescript
import { Make } from '@fortifyjs/core/schema';

{
  version: Make.const("1.0"),     // Safe constant string
  status: Make.const(200),        // Safe constant number
  type: Make.const("user"),       // Safe constant value
  enabled: Make.const(true)       // Safe constant boolean
}
```

### Union Types (Multiple Allowed Values)

```typescript
{
  status: Make.union("pending", "accepted", "rejected"),
  priority: Make.union("low", "medium", "high"),
  role: Make.unionOptional("user", "admin", "moderator")  // Optional union
}
```

### Nested Objects

```typescript
{
  user: {                   // Nested object
    name: "string",
    email: "email"
  },
  address: {                // Deeply nested
    street: "string",
    city: "string",
    coordinates: {
      lat: "number",
      lng: "number"
    }
  }
}
```

## 🔥 Real-World Examples

### User Registration

```typescript
const UserRegistrationSchema = Interface({
    // Required fields
    email: "email",
    password: "string",
    firstName: "string",
    lastName: "string",

    // Optional fields
    age: "number?",
    phone: "phone?",
    website: "url?",

    // Arrays
    interests: "string[]?",

    // Nested object
    address: {
        street: "string",
        city: "string",
        zipCode: "string",
        country: "string",
    },

    // Safe constants
    type: Make.const("user"),
    version: Make.const("1.0"),
});
```

### API Response

```typescript
const APIResponseSchema = Interface({
    success: "boolean",
    status: Make.const(200), // Safe constant status
    data: {
        users: [
            {
                // Array of objects
                id: "int",
                email: "email",
                profile: {
                    name: "string",
                    avatar: "url?",
                },
            },
        ],
        pagination: {
            page: "int",
            total: "int",
            hasNext: "boolean",
        },
    },
    errors: "string[]?",
    timestamp: "date",
});
```

### Configuration

```typescript
const ConfigSchema = Interface({
    database: {
        host: "string",
        port: "int",
        name: "string",
        ssl: "boolean?",
    },
    server: {
        port: "int",
        cors: "boolean?",
    },
    features: {
        auth: "boolean?",
        logging: "boolean?",
    },
    environment: Make.const("production"), // Safe constant
});
```

## 🛠️ Validation Methods

### Parse (Throws on Error)

```typescript
try {
    const user = UserSchema.parse(userData);
    // user is fully typed and validated
} catch (error) {
    console.error("Validation failed:", error.message);
}
```

### Safe Parse (Returns Result)

```typescript
const result = UserSchema.safeParse(userData);

if (result.success) {
    console.log("Valid data:", result.data);
} else {
    console.log("Errors:", result.errors);
    console.log("Warnings:", result.warnings);
}
```

### Strict Mode

```typescript
const StrictSchema = Interface({
    id: "number",
    name: "string",
}).strict(); // No extra properties allowed
```

## 🛡️ Safer Syntax for Constants and Unions

### The Problem with Raw Values

```typescript
// ❌ DANGEROUS - Looks like a string type but it's actually a constant!
const BadSchema = Interface({
    status: "pending", // Is this a string type or constant "pending"?
    role: "admin", // Very confusing and error-prone!
});
```

### The Solution - Make

```typescript
// ✅ SAFE - Crystal clear what's a type vs constant
import { Interface, Make } from "@fortifyjs/core/schema";

const GoodSchema = Interface({
    // Clear type definitions
    name: "string",
    email: "email",

    // Clear constant values
    status: Make.const("pending"),
    role: Make.const("admin"),

    // Clear union types (multiple allowed values)
    priority: Make.union("low", "medium", "high"),
    category: Make.unionOptional("tech", "business", "design"),
});
```

### Benefits of Make

-   **🔒 Type Safety**: No confusion between types and constants
-   **📖 Readability**: Crystal clear intent in your schemas
-   **🐛 Bug Prevention**: Eliminates dangerous ambiguity
-   **🔧 IntelliSense**: Better IDE support and autocomplete

## 📊 Comparison

| Feature            | FortifyJS Interface | Zod         | Joi        |
| ------------------ | ------------------- | ----------- | ---------- |
| **Syntax**         | TypeScript-like     | Complex API | Verbose    |
| **Learning Curve** | None                | Steep       | Moderate   |
| **Readability**    | Excellent           | Poor        | Fair       |
| **Bundle Size**    | Small               | Large       | Very Large |
| **Type Safety**    | Full                | Full        | Limited    |
| **Performance**    | Fast                | Slow        | Slower     |

## 🎉 Get Started

```bash
npm install @fortifyjs/core
```

```typescript
import { Interface } from "@fortifyjs/core/schema";

const MySchema = Interface({
    id: "number",
    name: "string",
    email: "email",
    active: "boolean?",
});

const result = MySchema.safeParse(data);
```

**That's it!** No complex APIs to learn, no verbose syntax - just clean, readable schemas that work exactly like TypeScript interfaces! 🚀

