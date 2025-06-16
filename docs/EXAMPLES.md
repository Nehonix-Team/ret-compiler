# Fortify Schema - Real-World Examples

A collection of production-ready schema examples for common use cases.

## 🚀 Quick Examples

### Basic User Schema
```typescript
import { Interface, Make } from 'fortify-schema';

const UserSchema = Interface({
  id: "positive",
  email: "email",
  username: "string(3,20)",
  age: "int(13,120)?",
  role: Make.union("user", "admin", "moderator"),
  isActive: "boolean",
  createdAt: "date",
});

// Usage
const result = UserSchema.safeParse({
  id: 1,
  email: "john@example.com",
  username: "johndoe",
  role: "user",
  isActive: true,
  createdAt: new Date()
});
```

### API Response Schema
```typescript
const APIResponseSchema = Interface({
  success: "boolean",
  status: "int(100,599)",
  data: "any?",
  errors: "string[]?",
  timestamp: "date",
  requestId: "uuid",
});

// Usage
const apiResult = APIResponseSchema.safeParse(response);
if (apiResult.success) {
  console.log('API Response:', apiResult.data);
}
```

## 🏢 Enterprise Examples

### E-commerce Product Schema
```typescript
const ProductSchema = Interface({
  // Basic Info
  id: "uuid",
  sku: "string(/^[A-Z]{3}-\\d{4}$/)",          // Format: ABC-1234
  name: "string(1,100)",
  description: "string(,2000)?",
  
  // Pricing
  price: "number(0.01,)",                       // Minimum $0.01
  originalPrice: "number(0.01,)?",
  discount: "float(0,100)?",                    // Percentage
  currency: Make.const("USD"),
  
  // Inventory
  stock: "int(0,)",
  lowStockThreshold: "int(1,)?",
  
  // Categories
  category: Make.union("electronics", "clothing", "books", "home"),
  subcategory: "string?",
  tags: "string[](,20)?",
  
  // Media
  images: "url[](1,10)",                        // 1-10 images required
  videos: "url[](,3)?",                         // Max 3 videos
  
  // Attributes
  weight: "number(0,)?",
  dimensions: {
    length: "number(0,)",
    width: "number(0,)",
    height: "number(0,)"
  },
  
  // Status
  isActive: "boolean",
  isFeatured: "boolean?",
  publishedAt: "date?",
});
```

### User Profile Management
```typescript
const UserProfileSchema = Interface({
  // Identity
  id: "uuid",
  email: "email",
  username: "string(3,30)",
  
  // Personal Info
  firstName: "string(1,50)",
  lastName: "string(1,50)",
  displayName: "string(1,100)?",
  bio: "string(,500)?",
  
  // Contact
  phone: "string(/^\\+?[1-9]\\d{1,14}$/)?",    // International format
  website: "url?",
  location: {
    country: "string(2,2)",                     // ISO country code
    city: "string(1,100)?",
    timezone: "string?"
  },
  
  // Preferences
  settings: {
    theme: Make.union("light", "dark", "auto"),
    language: "string(2,5)",                    // Language code
    notifications: {
      email: "boolean",
      push: "boolean",
      sms: "boolean"
    },
    privacy: {
      profileVisible: "boolean",
      showEmail: "boolean",
      showPhone: "boolean"
    }
  },
  
  // Social
  socialLinks: {
    twitter: "string(/^@[a-zA-Z0-9_]{1,15}$/)?",
    linkedin: "url?",
    github: "string(/^[a-zA-Z0-9-]{1,39}$/)?",
  },
  
  // Metadata
  avatar: "url?",
  coverImage: "url?",
  tags: "string[](,20)?",
  interests: "string[](,50)?",
  
  // System
  role: Make.union("user", "premium", "admin", "moderator"),
  status: Make.union("active", "inactive", "suspended", "pending"),
  emailVerified: "boolean",
  phoneVerified: "boolean",
  
  // Timestamps
  createdAt: "date",
  updatedAt: "date",
  lastLoginAt: "date?",
  emailVerifiedAt: "date?",
});
```

## 🔄 Schema Transformation Examples

### API Versioning
```typescript
import { Mod } from 'fortify-schema';

// Base user schema
const BaseUserSchema = Interface({
  id: "uuid",
  email: "email",
  name: "string",
  createdAt: "date"
});

// V1 API - Basic fields
const UserV1Schema = Mod.pick(BaseUserSchema, ["id", "email", "name"]);

// V2 API - Add timestamps
const UserV2Schema = Mod.extend(UserV1Schema, {
  createdAt: "date",
  updatedAt: "date"
});

// V3 API - Add profile info
const UserV3Schema = Mod.extend(UserV2Schema, {
  profile: {
    avatar: "url?",
    bio: "string(,500)?"
  },
  preferences: {
    theme: Make.union("light", "dark")
  }
});
```

### Form Validation
```typescript
// Registration form
const RegistrationSchema = Interface({
  email: "email",
  password: "string(8,)",
  confirmPassword: "string(8,)",
  firstName: "string(1,50)",
  lastName: "string(1,50)",
  agreeToTerms: Make.const(true),               // Must be true
  newsletter: "boolean?"
});

// Login form
const LoginSchema = Mod.pick(RegistrationSchema, ["email", "password"]);

// Password reset form
const PasswordResetSchema = Interface({
  email: "email",
  token: "string(/^[a-zA-Z0-9]{32}$/)",        // 32-char token
  newPassword: "string(8,)",
  confirmPassword: "string(8,)"
});

// Profile update form (all optional)
const ProfileUpdateSchema = Mod.partial(
  Mod.omit(RegistrationSchema, ["password", "confirmPassword", "agreeToTerms"])
);
```

## 🌐 API Integration Examples

### REST API Schemas
```typescript
// GET /users/:id response
const GetUserResponseSchema = Interface({
  success: "boolean",
  data: UserProfileSchema,
  meta: {
    requestId: "uuid",
    timestamp: "date",
    version: Make.const("1.0")
  }
});

// POST /users request body
const CreateUserRequestSchema = Mod.omit(UserProfileSchema, [
  "id", "createdAt", "updatedAt", "lastLoginAt"
]);

// PATCH /users/:id request body
const UpdateUserRequestSchema = Mod.partial(CreateUserRequestSchema);

// GET /users list response
const GetUsersResponseSchema = Interface({
  success: "boolean",
  data: UserProfileSchema.array(),              // Array of users
  pagination: {
    page: "int(1,)",
    limit: "int(1,100)",
    total: "int(0,)",
    hasNext: "boolean",
    hasPrev: "boolean"
  },
  meta: {
    requestId: "uuid",
    timestamp: "date"
  }
});
```

### GraphQL Integration
```typescript
// GraphQL User type
const GraphQLUserSchema = Interface({
  id: "uuid",
  email: "email",
  profile: {
    firstName: "string",
    lastName: "string",
    avatar: "url?"
  },
  posts: {
    id: "uuid",
    title: "string",
    content: "string",
    publishedAt: "date?"
  }.array(),
  followers: "int(0,)",
  following: "int(0,)"
});

// GraphQL Query variables
const GetUserQuerySchema = Interface({
  id: "uuid",
  includeProfile: "boolean?",
  includePosts: "boolean?",
  postsLimit: "int(1,50)?"
});
```

## 🔒 Security & Validation Examples

### Input Sanitization
```typescript
const SecureInputSchema = Interface({
  // Prevent XSS
  title: "string(/^[a-zA-Z0-9\\s\\-_.,!?]{1,100}$/)",
  
  // SQL injection prevention
  searchQuery: "string(/^[a-zA-Z0-9\\s]{1,50}$/)",
  
  // File upload validation
  filename: "string(/^[a-zA-Z0-9._-]{1,255}$/)",
  fileType: Make.union("image/jpeg", "image/png", "image/gif", "application/pdf"),
  fileSize: "int(1,10485760)",                  // Max 10MB
  
  // Rate limiting
  requestsPerMinute: "int(1,100)",
  
  // IP validation
  clientIP: "string(/^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$/)",
});
```

### Authentication Schemas
```typescript
const JWTPayloadSchema = Interface({
  sub: "uuid",                                  // Subject (user ID)
  iat: "int(1,)",                              // Issued at
  exp: "int(1,)",                              // Expires at
  aud: "string",                               // Audience
  iss: "string",                               // Issuer
  scope: "string[]",                           // Permissions
  role: Make.union("user", "admin", "service")
});

const AuthRequestSchema = Interface({
  email: "email",
  password: "string(1,)",
  rememberMe: "boolean?",
  captcha: "string(/^[a-zA-Z0-9]{6}$/)?",      // 6-char captcha
});

const RefreshTokenSchema = Interface({
  refreshToken: "string(/^[a-zA-Z0-9+/]{40,}={0,2}$/)", // Base64 token
  deviceId: "uuid?"
});
```

---

**📖 [Back to Documentation](./README.md)** | **🚀 [Quick Reference](./QUICK-REFERENCE.md)**
