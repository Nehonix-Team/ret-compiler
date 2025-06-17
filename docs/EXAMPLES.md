# Fortify Schema - Real-World Examples

This document provides production-ready schema examples for common use cases, demonstrating practical applications of Fortify Schema.

## Basic Examples

### User Schema

```typescript
import { Interface } from 'fortify-schema';

const UserSchema = Interface({
  id: "positive",                               // Positive integer ID
  email: "email",                               // Email format
  username: "string(3,20)",                     // Username with length constraints
  age: "int(13,120)?",                          // Optional age with range
  role: "user|admin|moderator",                 // Role options
  isActive: "boolean",                          // Active status
  createdAt: "date",                            // Creation date
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

if (result.success) {
  console.log('✓ Valid:', result.data);
} else {
  console.log('✗ Errors:', result.errors);
}
```

### API Response Schema

```typescript
const APIResponseSchema = Interface({
  success: "boolean",                           // Success flag
  status: "int(100,599)",                       // HTTP status code
  data: "any?",                                 // Optional data
  errors: "string[]?",                          // Optional error messages
  timestamp: "date",                            // Response timestamp
  requestId: "uuid",                            // Request ID
});

// Usage
const apiResult = APIResponseSchema.safeParse(response);
if (apiResult.success) {
  console.log('✓ API Response:', apiResult.data);
} else {
  console.log('✗ Errors:', apiResult.errors);
}
```

## Enterprise Examples

### E-commerce Product Schema

```typescript
const ProductSchema = Interface({
  // Basic information
  id: "uuid",                                   // UUID identifier
  sku: "string(/^[A-Z]{3}-\\d{4}$/)",          // SKU format (e.g., ABC-1234)
  name: "string(1,100)",                        // Product name
  description: "string(,2000)?",                // Optional description

  // Pricing
  price: "number(0.01,)",                       // Minimum $0.01
  originalPrice: "number(0.01,)?",              // Optional original price
  discount: "float(0,100)?",                    // Optional discount percentage
  currency: Make.const("USD"),                  // Fixed currency

  // Inventory
  stock: "int(0,)",                             // Non-negative stock count
  lowStockThreshold: "int(1,)?",                // Optional low stock alert

  // Categories
  category: Make.union("electronics", "clothing", "books", "home"), // Category options
  subcategory: "string?",                       // Optional subcategory
  tags: "string[](,20)?",                       // Optional tags

  // Media
  images: "url[](1,10)",                        // 1-10 images
  videos: "url[](,3)?",                         // Optional, max 3 videos

  // Attributes
  weight: "number(0,)?",                        // Optional weight
  dimensions: {
    length: "number(0,)",                       // Length
    width: "number(0,)",                        // Width
    height: "number(0,)"                        // Height
  },

  // Status
  isActive: "boolean",                          // Active status
  isFeatured: "boolean?",                       // Optional featured flag
  publishedAt: "date?",                         // Optional publish date
});
```

### User Profile Management

```typescript
const UserProfileSchema = Interface({
  // Identity
  id: "uuid",                                   // UUID identifier
  email: "email",                               // Email format
  username: "string(3,30)",                     // Username with length constraints

  // Personal information
  firstName: "string(1,50)",                    // First name
  lastName: "string(1,50)",                     // Last name
  displayName: "string(1,100)?",                // Optional display name
  bio: "string(,500)?",                         // Optional bio

  // Contact
  phone: "string(/^\\+?[1-9]\\d{1,14}$/)?",    // Optional international phone
  website: "url?",                              // Optional website
  location: {
    country: "string(2,2)",                     // ISO country code
    city: "string(1,100)?",                     // Optional city
    timezone: "string?"                         // Optional timezone
  },

  // Preferences
  settings: {
    theme: Make.union("light", "dark", "auto"), // Theme options
    language: "string(2,5)",                    // Language code
    notifications: {
      email: "boolean",                         // Email notifications
      push: "boolean",                          // Push notifications
      sms: "boolean"                            // SMS notifications
    },
    privacy: {
      profileVisible: "boolean",                // Profile visibility
      showEmail: "boolean",                     // Show email
      showPhone: "boolean"                      // Show phone
    }
  },

  // Social
  socialLinks: {
    twitter: "string(/^@[a-zA-Z0-9_]{1,15}$/)?", // Optional Twitter handle
    linkedin: "url?",                            // Optional LinkedIn URL
    github: "string(/^[a-zA-Z0-9-]{1,39}$/)?",   // Optional GitHub username
  },

  // Metadata
  avatar: "url?",                               // Optional avatar
  coverImage: "url?",                           // Optional cover image
  tags: "string[](,20)?",                       // Optional tags
  interests: "string[](,50)?",                  // Optional interests

  // System
  role: Make.union("user", "premium", "admin", "moderator"), // Role options
  status: Make.union("active", "inactive", "suspended", "pending"), // Status options
  emailVerified: "boolean",                     // Email verification status
  phoneVerified: "boolean",                     // Phone verification status

  // Timestamps
  createdAt: "date",                            // Creation date
  updatedAt: "date",                            // Last updated
  lastLoginAt: "date?",                         // Optional last login
  emailVerifiedAt: "date?"                      // Optional email verification date
});
```

## Schema Transformation Examples

### API Versioning

```typescript
import { Mod } from 'fortify-schema';

const BaseUserSchema = Interface({
  id: "uuid",                                   // UUID identifier
  email: "email",                               // Email format
  name: "string",                               // Name
  createdAt: "date"                             // Creation date
});

// V1 API: Basic fields
const UserV1Schema = Mod.pick(BaseUserSchema, ["id", "email", "name"]);

// V2 API: Add timestamps
const UserV2Schema = Mod.extend(UserV1Schema, {
  createdAt: "date",                            // Creation date
  updatedAt: "date"                             // Last updated
});

// V3 API: Add profile information
const UserV3Schema = Mod.extend(UserV2Schema, {
  profile: {
    avatar: "url?",                             // Optional avatar
    bio: "string(,500)?"                        // Optional bio
  },
  preferences: {
    theme: Make.union("light", "dark")          // Theme options
  }
});
```

### Form Validation

```typescript
const RegistrationSchema = Interface({
  email: "email",                               // Email format
  password: "string(8,)",                       // Minimum 8 characters
  confirmPassword: "string(8,)",                // Minimum 8 characters
  firstName: "string(1,50)",                    // First name
  lastName: "string(1,50)",                     // Last name
  agreeToTerms: Make.const(true),               // Must be true
  newsletter: "boolean?"                        // Optional newsletter subscription
});

const LoginSchema = Mod.pick(RegistrationSchema, ["email", "password"]);

const PasswordResetSchema = Interface({
  email: "email",                               // Email format
  token: "string(/^[a-zA-Z0-9]{32}$/)",        // 32-character token
  newPassword: "string(8,)",                    // Minimum 8 characters
  confirmPassword: "string(8,)"                 // Minimum 8 characters
});

const ProfileUpdateSchema = Mod.partial(
  Mod.omit(RegistrationSchema, ["password", "confirmPassword", "agreeToTerms"])
);
```

## API Integration Examples

### REST API Schemas

```typescript
const GetUserResponseSchema = Interface({
  success: "boolean",                           // Success flag
  data: UserProfileSchema,                      // User profile data
  meta: {
    requestId: "uuid",                          // Request ID
    timestamp: "date",                          // Response timestamp
    version: Make.const("1.0")                  // API version
  }
});

const CreateUserRequestSchema = Mod.omit(UserProfileSchema, [
  "id", "createdAt", "updatedAt", "lastLoginAt"
]);

const UpdateUserRequestSchema = Mod.partial(CreateUserRequestSchema);

const GetUsersResponseSchema = Interface({
  success: "boolean",                           // Success flag
  data: UserProfileSchema.array(),              // Array of users
  pagination: {
    page: "int(1,)",                            // Current page
    limit: "int(1,100)",                        // Items per page
    total: "int(0,)",                           // Total items
    hasNext: "boolean",                         // Has next page
    hasPrev: "boolean"                          // Has previous page
  },
  meta: {
    requestId: "uuid",                          // Request ID
    timestamp: "date"                           // Response timestamp
  }
});
```

### GraphQL Integration

```typescript
const GraphQLUserSchema = Interface({
  id: "uuid",                                   // UUID identifier
  email: "email",                               // Email format
  profile: {
    firstName: "string",                        // First name
    lastName: "string",                         // Last name
    avatar: "url?"                              // Optional avatar
  },
  posts: {
    id: "uuid",                                 // Post ID
    title: "string",                            // Post title
    content: "string",                          // Post content
    publishedAt: "date?"                        // Optional publish date
  }.array(),
  followers: "int(0,)",                         // Follower count
  following: "int(0,)"                          // Following count
});

const GetUserQuerySchema = Interface({
  id: "uuid",                                   // User ID
  includeProfile: "boolean?",                   // Include profile data
  includePosts: "boolean?",                     // Include posts
  postsLimit: "int(1,50)?"                      // Optional post limit
});
```

## Security & Validation Examples

### Input Sanitization

```typescript
const SecureInputSchema = Interface({
  title: "string(/^[a-zA-Z0-9\\s\\-_.,!?]{1,100}$/)", // Prevent XSS
  searchQuery: "string(/^[a-zA-Z0-9\\s]{1,50}$/)",    // Prevent SQL injection
  filename: "string(/^[a-zA-Z0-9._-]{1,255}$/)",      // File upload validation
  fileType: Make.union("image/jpeg", "image/png", "image/gif", "application/pdf"), // Allowed file types
  fileSize: "int(1,10485760)",                        // Max 10MB
  requestsPerMinute: "int(1,100)",                    // Rate limiting
  clientIP: "string(/^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$/)" // IP validation
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
  role: Make.union("user", "admin", "service") // Role options
});

const AuthRequestSchema = Interface({
  email: "email",                               // Email format
  password: "string(1,)",                      // Non-empty password
  rememberMe: "boolean?",                      // Optional remember me
  captcha: "string(/^[a-zA-Z0-9]{6}$/)?"       // Optional 6-char captcha
});

const RefreshTokenSchema = Interface({
  refreshToken: "string(/^[a-zA-Z0-9+/]{40,}={0,2}$/)", // Base64 token
  deviceId: "uuid?"                             // Optional device ID
});
```

---

**Related Resources**  
[Complete Documentation](./README.md) | [Quick Reference](./QUICK-REFERENCE.md)