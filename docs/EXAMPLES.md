# ReliantType Examples

This directory contains comprehensive examples demonstrating the capabilities of the ReliantType Compiler. Each example shows different aspects of the `.rel` language and how it compiles to TypeScript.

## Table of Contents

- [Basic Schema](#basic-schema)
- [Advanced Types](#advanced-types)
- [Conditional Validation](#conditional-validation)
- [Enums and Unions](#enums-and-unions)
- [Validation Rules](#validation-rules)
- [Imports and Exports](#imports-and-exports)
- [Real-World Examples](#real-world-examples)

## Basic Schema

### Simple User Schema

```rel
# schemas/User.rel
define User {
  id: number
  email: string
  name: string
  age: number
  createdAt: date
  isActive: boolean = true
}

export User
```

**Generated TypeScript:**
```typescript
export interface User {
  id: number;
  email: string;
  name: string;
  age: number;
  createdAt: Date;
  isActive: boolean;
}

export const UserSchema = Interface({
  id: NumberSchema,
  email: StringSchema,
  name: StringSchema,
  age: NumberSchema,
  createdAt: DateSchema,
  isActive: BooleanSchema.default(true)
});
```

### Product Schema with Constraints

```rel
# schemas/Product.rel
define Product {
  id: number
  name: string & minLength(1) & maxLength(100)
  price: number & positive
  description: string?
  category: electronics | clothing | books
  tags: string[]
  metadata: record<string, any>
}

export Product
```

**Generated TypeScript:**
```typescript
export interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  category: "electronics" | "clothing" | "books";
  tags: string[];
  metadata: Record<string, any>;
}
```

## Advanced Types

### Nested Objects

```rel
# schemas/Company.rel
define Company {
  id: number
  name: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string & matches(r"^\d{5}(-\d{4})?$")
    country: string = "USA"
  }
  employees: Employee[]
  founded: date
}

define Employee {
  id: number
  name: string
  role: string
  salary: number & positive
  hireDate: date
}

export Company, Employee
```

### Generic Types

```rel
# schemas/ApiResponse.rel
define ApiResponse<T> {
  success: boolean
  data: T
  error: string?
  timestamp: date = now()
}

define PaginatedResponse<T> {
  extends ApiResponse<T[]>
  total: number
  page: number
  limit: number
  hasNext: boolean = page * limit < total
}

export ApiResponse, PaginatedResponse
```

## Conditional Validation

### Product Categories

```rel
# schemas/ProductAdvanced.rel
define Product {
  id: number
  name: string
  price: number & positive
  category: electronics | clothing | books | food

  # Conditional fields based on category
  when category = electronics {
    warranty: number & positive
    specs: record<string, string>
    batteryLife: number?
  } else when category = clothing {
    size: S | M | L | XL | XXL
    material: cotton | wool | polyester | silk
    careInstructions: string?
  } else when category = books {
    isbn: string & matches(r"^\d{10}(\d{3})?$")
    author: string
    pages: number & positive & integer
    genre: fiction | non-fiction | biography | technical
  } else {
    # Food category
    expirationDate: date & future
    organic: boolean = false
    allergens: string[]
  }
}

export Product
```

### User Roles with Permissions

```rel
# schemas/UserWithPermissions.rel
define User {
  id: number
  email: email
  name: string
  role: admin | moderator | user | guest
  permissions: string[]

  # Role-based conditional fields
  when role = admin {
    canDeleteUsers: boolean = true
    canManageSystem: boolean = true
    adminLevel: number & min(1) & max(10)
  } else when role = moderator {
    canModerateContent: boolean = true
    canBanUsers: boolean = true
    moderatedCategories: string[]
  } else when role = user {
    subscriptionType: free | premium | enterprise
    subscriptionExpiry: date?

    when subscriptionType = premium {
      premiumFeatures: string[]
      maxProjects: number = 10
    } else when subscriptionType = enterprise {
      customFeatures: record<string, any>
      supportLevel: basic | priority | dedicated
    }
  }
}

export User
```

## Enums and Unions

### Status Enums

```rel
# schemas/Status.rel
enum OrderStatus {
  pending
  confirmed
  processing
  shipped
  delivered
  cancelled
}

enum PaymentStatus {
  unpaid
  paid
  refunded
  failed
}

define Order {
  id: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  items: OrderItem[]
  total: number & positive
}

define OrderItem {
  productId: number
  quantity: number & positive & integer
  price: number & positive
}

export OrderStatus, PaymentStatus, Order, OrderItem
```

### Complex Unions

```rel
# schemas/Event.rel
define Event {
  id: number
  type: user_action | system_event | api_call
  timestamp: date

  when type = user_action {
    userId: number
    action: login | logout | purchase | view | update_profile
    metadata: record<string, any>

    when action = purchase {
      productId: number
      amount: number & positive
      currency: USD | EUR | GBP
    }
  } else when type = system_event {
    severity: low | medium | high | critical
    message: string
    component: string
    stackTrace: string?
  } else {
    # API call
    endpoint: string
    method: GET | POST | PUT | DELETE | PATCH
    statusCode: number & min(100) & max(599)
    duration: number & positive
    userAgent: string?
  }
}

export Event
```

## Validation Rules

### Business Logic Validation

```rel
# schemas/OrderValidation.rel
define Order {
  id: number
  userId: number
  items: OrderItem[]
  subtotal: number & positive
  taxRate: number & min(0) & max(1) = 0.08
  tax: number = subtotal * taxRate
  total: number = subtotal + tax
  discountCode: string?
  discountAmount: number = 0
  finalTotal: number = total - discountAmount

  # Validation rules
  validate finalTotal >= 0
  validate items.length > 0
  validate discountAmount <= total * 0.5 if discountCode != null
  validate tax = subtotal * taxRate
  validate total = subtotal + tax
  validate finalTotal = total - discountAmount
}

define OrderItem {
  productId: number
  name: string
  price: number & positive
  quantity: number & positive & integer & max(100)
  total: number = price * quantity

  # Item validation
  validate total = price * quantity
  validate quantity > 0
}

export Order, OrderItem
```

### Cross-Field Validation

```rel
# schemas/UserValidation.rel
define User {
  id: number
  email: email
  username: string & minLength(3) & maxLength(20) & matches(r"^[a-zA-Z0-9_]+$")
  password: string & minLength(8) & hasUppercase & hasLowercase & hasNumber
  confirmPassword: string
  firstName: string & minLength(1)
  lastName: string & minLength(1)
  dateOfBirth: date
  age: number = calculateAge(dateOfBirth)

  # Cross-field validations
  validate password = confirmPassword
  validate age >= 13
  validate age <= 120
  validate username != email.split("@")[0]  # Username shouldn't be email prefix
  validate password != "password123"        # Common password check
  validate password != username             # Password shouldn't match username
}

# Helper function for age calculation
let calculateAge = (birthDate: date) => {
  return (now() - birthDate) / (365.25 * 24 * 60 * 60 * 1000)
}

export User
```

## Imports and Exports

### Modular Schemas

```rel
# schemas/types/BaseTypes.rel
export string, number, boolean, date

type Email = string & matches(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
type URL = string & matches(r"^https?://.+")
type UUID = string & matches(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")

export Email, URL, UUID
```

```rel
# schemas/types/Address.rel
from "./BaseTypes.rel" import Email, URL

define Address {
  street: string & minLength(1)
  city: string & minLength(1)
  state: string & minLength(2) & maxLength(2)
  zipCode: string & matches(r"^\d{5}(-\d{4})?$")
  country: string = "USA"
  coordinates: {
    latitude: number & min(-90) & max(90)
    longitude: number & min(-180) & max(180)
  }?
}

export Address
```

```rel
# schemas/UserComplete.rel
from "./BaseTypes.rel" import Email, UUID
from "./Address.rel" import Address

define User {
  id: UUID
  email: Email
  username: string & minLength(3)
  profile: {
    firstName: string
    lastName: string
    avatar: URL?
    bio: string & maxLength(500)?
  }
  address: Address?
  preferences: record<string, any>
  createdAt: date
  updatedAt: date
}

export User
```

## Real-World Examples

### E-commerce Platform

```rel
# schemas/ecommerce/Product.rel
define Product {
  id: number
  sku: string & matches(r"^[A-Z]{2}-\d{6}$")
  name: string & minLength(1) & maxLength(100)
  description: string & maxLength(1000)
  price: number & positive & max(999999.99)
  compareAtPrice: number?
  cost: number & positive
  inventory: {
    quantity: number & min(0)
    tracked: boolean = true
    policy: deny | allow | continue = deny
  }
  images: ProductImage[]
  variants: ProductVariant[]
  tags: string[]
  category: Category
  vendor: string
  productType: string
  status: active | draft | archived = draft
}

define ProductImage {
  id: number
  src: url
  alt: string?
  position: number & min(1)
}

define ProductVariant {
  id: number
  sku: string?
  price: number?
  compareAtPrice: number?
  inventory: number?
  weight: number & positive
  weightUnit: g | kg | lb | oz = g
}

define Category {
  id: number
  name: string
  slug: string & matches(r"^[a-z0-9-]+$")
  parent: Category?
}

export Product, ProductImage, ProductVariant, Category
```

### Blog/CMS System

```rel
# schemas/cms/Content.rel
define Post {
  id: number
  title: string & minLength(1) & maxLength(200)
  slug: string & matches(r"^[a-z0-9-]+$")
  content: string & minLength(10)
  excerpt: string & maxLength(300)?
  status: draft | published | archived = draft
  author: User
  publishedAt: date?
  tags: Tag[]
  categories: Category[]
  featuredImage: Image?
  seo: SEO
  metadata: record<string, any>
}

define User {
  id: number
  email: email
  name: string
  bio: string & maxLength(500)?
  avatar: Image?
  role: admin | editor | author | contributor
}

define Tag {
  id: number
  name: string & minLength(1) & maxLength(50)
  slug: string & matches(r"^[a-z0-9-]+$")
  color: string & matches(r"^#[0-9a-f]{6}$")?
}

define Category {
  id: number
  name: string & minLength(1) & maxLength(50)
  slug: string & matches(r"^[a-z0-9-]+$")
  description: string?
  parent: Category?
}

define Image {
  id: number
  url: url
  alt: string
  width: number & positive
  height: number & positive
  size: number & positive
}

define SEO {
  title: string & maxLength(60)?
  description: string & maxLength(160)?
  keywords: string[]?
  canonical: url?
  noIndex: boolean = false
}

export Post, User, Tag, Category, Image, SEO
```

### API Configuration

```rel
# schemas/api/Config.rel
define APIConfig {
  name: string
  version: string & matches(r"^\d+\.\d+\.\d+$")
  baseURL: url
  timeout: number & positive & max(300000) = 30000
  retries: number & min(0) & max(10) = 3
  headers: record<string, string>
  authentication: APIAuth
  endpoints: APIEndpoint[]
  rateLimit: RateLimit?
}

define APIAuth {
  type: none | basic | bearer | api_key | oauth2

  when type = basic {
    username: string
    password: string
  } else when type = bearer {
    token: string
  } else when type = api_key {
    key: string
    headerName: string = "X-API-Key"
  } else when type = oauth2 {
    clientId: string
    clientSecret: string
    tokenURL: url
    scopes: string[]
  }
}

define APIEndpoint {
  path: string & matches(r"^/")
  method: GET | POST | PUT | DELETE | PATCH
  description: string?
  parameters: APIParameter[]
  requestBody: APISchema?
  responses: record<string, APISchema>
  authentication: boolean = true
}

define APIParameter {
  name: string
  type: string | number | boolean | array | object
  required: boolean = false
  description: string?
  default: any?
}

define APISchema {
  type: string | number | boolean | array | object
  properties: record<string, APISchema>?
  items: APISchema?
  required: string[]?
  enum: any[]?
}

define RateLimit {
  requests: number & positive
  period: number & positive
  unit: second | minute | hour | day = minute
}

export APIConfig, APIAuth, APIEndpoint, APIParameter, APISchema, RateLimit
```

## Running the Examples

### Compile Examples

```bash
# Compile all examples
rel build --input examples --output generated

# Compile specific example
rel build --input examples/User.rel --output generated

# Watch for changes
rel build --input examples --output generated --watch
```

### Validate Examples

```bash
# Validate all examples
rel validate --input examples

# Check syntax only
rel check --input examples
```

### Test Examples

```bash
# Test lexer
rel test-lexer "define User { id: number }"

# Test parser
rel test-parser "define User { id: number }"

# Test generator
rel test-generator "define User { id: number }"
```

## Integration with TypeScript

### Using Generated Types

```typescript
import { User, UserSchema } from './generated/User';
import { Product, ProductSchema } from './generated/Product';

// Type-safe usage
function createUser(data: unknown): User {
  const result = UserSchema.safeParse(data);
  if (!result.success) {
    throw new Error(`Invalid user data: ${result.errors}`);
  }
  return result.data;
}

// Express.js middleware
app.post('/users', (req, res) => {
  try {
    const user = createUser(req.body);
    // user is fully typed as User interface
    res.json({ user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

### Runtime Validation

```typescript
import { OrderSchema } from './generated/Order';

// Validate order data
const orderData = {
  id: 123,
  items: [
    { productId: 1, quantity: 2, price: 29.99 },
    { productId: 2, quantity: 1, price: 49.99 }
  ],
  subtotal: 79.98,
  taxRate: 0.08
};

const result = OrderSchema.safeParse(orderData);
if (result.success) {
  console.log('Order is valid:', result.data);
} else {
  console.log('Validation errors:', result.errors);
}
```

These examples demonstrate the full power and flexibility of the ReliantType language for defining complex schemas with validation rules, conditional logic, and type safety that compiles to clean, usable TypeScript code.