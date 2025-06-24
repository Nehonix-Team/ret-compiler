# Examples Collection

Real-world examples and patterns for Fortify Schema usage across different domains and use cases.

## 📚 Table of Contents

- [User Management](#user-management)
- [E-commerce](#e-commerce)
- [API Development](#api-development)
- [Content Management](#content-management)
- [Financial Applications](#financial-applications)
- [IoT and Sensors](#iot-and-sensors)
- [Social Media](#social-media)
- [Enterprise Applications](#enterprise-applications)

## User Management

### User Registration Schema

```typescript
import { Interface } from "fortify-schema";

const UserRegistrationSchema = Interface({
  // Basic information
  email: "email",
  password: "string(8,128)",
  confirmPassword: "string(8,128)",
  
  // Profile information
  profile: {
    firstName: "string(1,50)",
    lastName: "string(1,50)",
    displayName: "string(3,50)?",
    dateOfBirth: "date?",
    gender: "male|female|other|prefer-not-to-say"?,
    avatar: "url?",
    bio: "string(,500)?"
  },
  
  // Contact information
  contact: {
    phone: "phone?",
    address: {
      street: "string(5,100)",
      city: "string(2,50)",
      state: "string(2,50)",
      zipCode: "string(/^\\d{5}(-\\d{4})?$/)",
      country: "string(/^[A-Z]{2}$/)"
    }?
  }?,
  
  // Preferences
  preferences: {
    theme: "light|dark|auto",
    language: "string(/^[a-z]{2}(-[A-Z]{2})?$/)",
    timezone: "string?",
    notifications: {
      email: "boolean",
      push: "boolean",
      sms: "boolean",
      marketing: "boolean"
    }
  },
  
  // Legal agreements
  agreements: {
    termsOfService: "=true",
    privacyPolicy: "=true",
    marketingConsent: "boolean",
    dataProcessing: "=true"
  },
  
  // Runtime configuration for conditional validation
  config: "any?",
  
  // Conditional fields
  betaFeatures: "when config.beta.$exists() *? string[] : =[]",
  referralCode: "when config.referral.$exists() *? string : =null"
});

// Usage example
const registrationData = {
  email: "john.doe@example.com",
  password: "SecurePass123!",
  confirmPassword: "SecurePass123!",
  profile: {
    firstName: "John",
    lastName: "Doe",
    displayName: "johndoe",
    dateOfBirth: new Date("1990-05-15")
  },
  preferences: {
    theme: "dark",
    language: "en-US",
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketing: false
    }
  },
  agreements: {
    termsOfService: true,
    privacyPolicy: true,
    marketingConsent: false,
    dataProcessing: true
  }
};

const result = UserRegistrationSchema.safeParse(registrationData);
```

### User Profile Update Schema

```typescript
const UserProfileUpdateSchema = Interface({
  // Only fields that can be updated
  profile: {
    firstName: "string(1,50)?",
    lastName: "string(1,50)?",
    displayName: "string(3,50)?",
    avatar: "url?",
    bio: "string(,500)?"
  }?,
  
  contact: {
    phone: "phone?",
    address: {
      street: "string(5,100)?",
      city: "string(2,50)?",
      state: "string(2,50)?",
      zipCode: "string(/^\\d{5}(-\\d{4})?$/)?",
      country: "string(/^[A-Z]{2}$/)?",
    }?
  }?,
  
  preferences: {
    theme: "light|dark|auto"?,
    language: "string(/^[a-z]{2}(-[A-Z]{2})?$/)?",
    timezone: "string?",
    notifications: {
      email: "boolean?",
      push: "boolean?",
      sms: "boolean?",
      marketing: "boolean?"
    }?
  }?,
  
  // Metadata
  lastUpdated: "date",
  updatedBy: "uuid"
});
```

## E-commerce

### Product Catalog Schema

```typescript
const ProductSchema = Interface({
  // Product identification
  id: "uuid",
  sku: "string(/^[A-Z0-9-]{8,20}$/)",
  name: "string(1,200)",
  slug: "string(/^[a-z0-9-]+$/)",
  
  // Pricing
  pricing: {
    basePrice: "number(0.01,999999.99)",
    salePrice: "number(0.01,999999.99)?",
    currency: "string(/^[A-Z]{3}$/)",
    taxRate: "number(0,1)?",
    discountPercentage: "number(0,100)?"
  },
  
  // Product details
  description: "string(10,5000)",
  shortDescription: "string(10,500)?",
  specifications: "any?",
  
  // Categorization
  category: {
    primary: "electronics|clothing|books|home|sports|beauty|toys",
    secondary: "string(2,50)?",
    tags: "string[](1,20)"
  },
  
  // Inventory
  inventory: {
    quantity: "int(0,)",
    trackQuantity: "boolean",
    allowBackorder: "boolean",
    lowStockThreshold: "int(0,)?",
    reservedQuantity: "int(0,)"
  },
  
  // Media
  media: {
    images: {
      primary: "url",
      gallery: "url[](0,20)",
      thumbnails: "url[]?"
    },
    videos: "url[]?",
    documents: "url[]?"
  },
  
  // SEO
  seo: {
    title: "string(10,60)?",
    description: "string(50,160)?",
    keywords: "string[](0,10)",
    canonicalUrl: "url?"
  }?,
  
  // Shipping
  shipping: {
    weight: "number(0,)?",
    dimensions: {
      length: "number(0,)",
      width: "number(0,)",
      height: "number(0,)"
    }?,
    shippingClass: "standard|express|overnight|digital"
  },
  
  // Status and publishing
  status: "draft|active|inactive|archived",
  visibility: "public|private|hidden",
  publishedAt: "date?",
  
  // Timestamps
  createdAt: "date",
  updatedAt: "date",
  
  // Runtime configuration
  config: "any?",
  
  // Conditional fields
  digitalDownload: "when config.isDigital.$exists() *? any : =null",
  subscriptionOptions: "when config.isSubscription.$exists() *? any : =null",
  variantOptions: "when config.hasVariants.$exists() *? any[] : =[]"
});
```

### Shopping Cart Schema

```typescript
const ShoppingCartSchema = Interface({
  id: "uuid",
  userId: "uuid?",
  sessionId: "string?",
  
  items: {
    productId: "uuid",
    variantId: "uuid?",
    quantity: "int(1,)",
    unitPrice: "number(0.01,)",
    totalPrice: "number(0.01,)",
    addedAt: "date"
  }[](0,100),
  
  totals: {
    subtotal: "number(0,)",
    tax: "number(0,)",
    shipping: "number(0,)",
    discount: "number(0,)",
    total: "number(0,)"
  },
  
  discounts: {
    code: "string",
    type: "percentage|fixed|shipping",
    value: "number(0,)",
    appliedAt: "date"
  }[]?,
  
  shipping: {
    method: "standard|express|overnight",
    address: {
      name: "string(1,100)",
      street: "string(5,100)",
      city: "string(2,50)",
      state: "string(2,50)",
      zipCode: "string(/^\\d{5}(-\\d{4})?$/)",
      country: "string(/^[A-Z]{2}$/)",
      phone: "phone?"
    }?
  }?,
  
  createdAt: "date",
  updatedAt: "date",
  expiresAt: "date"
});
```

## API Development

### REST API Response Schema

```typescript
const APIResponseSchema = Interface({
  // Response metadata
  meta: {
    version: "string(/^v\\d+\\.\\d+$/)",
    timestamp: "date",
    requestId: "uuid",
    duration: "number(0,)",
    environment: "development|staging|production",
    rateLimit: {
      limit: "int(1,)",
      remaining: "int(0,)",
      resetAt: "date"
    }?
  },
  
  // Response status
  status: "success|error|partial",
  statusCode: "int(100,599)",
  message: "string?",
  
  // Data payload (varies by endpoint)
  data: "any?",
  
  // Error handling
  errors: {
    code: "string",
    message: "string",
    field: "string?",
    details: "any?",
    documentation: "url?"
  }[]?,
  
  // Warnings (non-blocking issues)
  warnings: {
    code: "string",
    message: "string",
    field: "string?",
    severity: "low|medium|high"
  }[]?,
  
  // Pagination (for list endpoints)
  pagination: {
    page: "int(1,)",
    limit: "int(1,1000)",
    total: "int(0,)",
    totalPages: "int(0,)",
    hasNext: "boolean",
    hasPrev: "boolean"
  }?,
  
  // HATEOAS links
  links: {
    self: "url",
    next: "url?",
    prev: "url?",
    first: "url?",
    last: "url?",
    related: "url[]?"
  }?,
  
  // Runtime context for conditional validation
  context: "any?",
  
  // Conditional fields
  debugInfo: "when context.debug.$exists() *? any : =null",
  performanceMetrics: "when context.includeMetrics.$exists() *? any : =null"
});
```

### GraphQL Query Variables Schema

```typescript
const GraphQLVariablesSchema = Interface({
  // Pagination
  first: "int(1,100)?",
  after: "string?",
  last: "int(1,100)?",
  before: "string?",
  
  // Filtering
  where: {
    id: "uuid?",
    name: "string?",
    email: "email?",
    status: "active|inactive|pending"?,
    createdAt: {
      gte: "date?",
      lte: "date?",
      eq: "date?"
    }?,
    tags: "string[]?"
  }?,
  
  // Sorting
  orderBy: {
    field: "id|name|email|createdAt|updatedAt",
    direction: "ASC|DESC"
  }[]?,
  
  // Field selection
  include: "string[]?",
  exclude: "string[]?",
  
  // Search
  search: {
    query: "string(1,100)",
    fields: "string[]?",
    fuzzy: "boolean?"
  }?
});
```

## Content Management

### Blog Post Schema

```typescript
const BlogPostSchema = Interface({
  id: "uuid",
  title: "string(5,200)",
  slug: "string(/^[a-z0-9-]+$/)",
  
  content: {
    excerpt: "string(50,500)",
    body: "string(100,)",
    format: "markdown|html|plaintext"
  },
  
  author: {
    id: "uuid",
    name: "string",
    email: "email",
    avatar: "url?"
  },
  
  categorization: {
    category: "string",
    tags: "string[](0,20)",
    series: "string?"
  },
  
  media: {
    featuredImage: "url?",
    gallery: "url[]?",
    attachments: {
      name: "string",
      url: "url",
      type: "image|video|document|audio",
      size: "int(0,)"
    }[]?
  },
  
  seo: {
    title: "string(10,60)?",
    description: "string(50,160)?",
    keywords: "string[](0,15)",
    canonicalUrl: "url?",
    noIndex: "boolean?"
  }?,
  
  publishing: {
    status: "draft|published|scheduled|archived",
    publishedAt: "date?",
    scheduledFor: "date?",
    visibility: "public|private|password-protected",
    password: "string?"
  },
  
  engagement: {
    allowComments: "boolean",
    allowSharing: "boolean",
    allowRating: "boolean"
  },
  
  timestamps: {
    createdAt: "date",
    updatedAt: "date",
    lastModifiedBy: "uuid"
  }
});
```

### Comment System Schema

```typescript
const CommentSchema = Interface({
  id: "uuid",
  postId: "uuid",
  parentId: "uuid?",  // For nested comments
  
  author: {
    id: "uuid?",      // Null for anonymous
    name: "string(1,50)",
    email: "email",
    website: "url?",
    avatar: "url?"
  },
  
  content: {
    body: "string(1,2000)",
    format: "plaintext|markdown"
  },
  
  moderation: {
    status: "pending|approved|rejected|spam",
    moderatedBy: "uuid?",
    moderatedAt: "date?",
    reason: "string?"
  },
  
  metadata: {
    ipAddress: "ip",
    userAgent: "string?",
    referrer: "url?"
  },
  
  engagement: {
    likes: "int(0,)",
    dislikes: "int(0,)",
    replies: "int(0,)"
  },
  
  timestamps: {
    createdAt: "date",
    updatedAt: "date?"
  }
});
```

## Financial Applications

### Transaction Schema

```typescript
const TransactionSchema = Interface({
  id: "uuid",
  transactionId: "string(/^TXN[0-9A-Z]{10}$/)",
  
  parties: {
    from: {
      accountId: "uuid",
      accountNumber: "string(/^[0-9]{10,12}$/)",
      name: "string",
      type: "checking|savings|credit|business"
    },
    to: {
      accountId: "uuid",
      accountNumber: "string(/^[0-9]{10,12}$/)",
      name: "string",
      type: "checking|savings|credit|business"
    }
  },
  
  amount: {
    value: "number(0.01,)",
    currency: "string(/^[A-Z]{3}$/)",
    exchangeRate: "number(0,)?"
  },
  
  details: {
    type: "transfer|payment|deposit|withdrawal|fee|interest",
    category: "string?",
    description: "string(1,500)",
    reference: "string?",
    memo: "string(,200)?"
  },
  
  processing: {
    status: "pending|processing|completed|failed|cancelled",
    method: "ach|wire|card|check|cash|crypto",
    processingTime: "instant|same-day|next-day|3-5-days",
    fees: {
      amount: "number(0,)",
      type: "fixed|percentage",
      description: "string"
    }[]?
  },
  
  security: {
    authenticationMethod: "password|2fa|biometric|token",
    riskScore: "number(0,100)",
    fraudFlags: "string[]?",
    encryptionLevel: "standard|high|military"
  },
  
  compliance: {
    amlChecked: "boolean",
    kycVerified: "boolean",
    reportingRequired: "boolean",
    regulatoryFlags: "string[]?"
  },
  
  timestamps: {
    initiatedAt: "date",
    processedAt: "date?",
    completedAt: "date?",
    settledAt: "date?"
  }
});
```

### Investment Portfolio Schema

```typescript
const PortfolioSchema = Interface({
  id: "uuid",
  accountId: "uuid",
  name: "string(1,100)",
  
  holdings: {
    symbol: "string(/^[A-Z]{1,5}$/)",
    name: "string",
    type: "stock|bond|etf|mutual-fund|crypto|commodity",
    quantity: "number(0,)",
    averageCost: "number(0,)",
    currentPrice: "number(0,)",
    marketValue: "number(0,)",
    gainLoss: "number",
    gainLossPercent: "number",
    lastUpdated: "date"
  }[],
  
  allocation: {
    stocks: "number(0,100)",
    bonds: "number(0,100)",
    cash: "number(0,100)",
    alternatives: "number(0,100)",
    international: "number(0,100)"
  },
  
  performance: {
    totalValue: "number(0,)",
    totalGainLoss: "number",
    totalGainLossPercent: "number",
    dayChange: "number",
    dayChangePercent: "number",
    ytdReturn: "number",
    oneYearReturn: "number",
    threeYearReturn: "number?",
    fiveYearReturn: "number?"
  },
  
  riskMetrics: {
    beta: "number?",
    sharpeRatio: "number?",
    volatility: "number(0,100)?",
    maxDrawdown: "number?"
  },
  
  settings: {
    riskTolerance: "conservative|moderate|aggressive",
    investmentGoal: "retirement|education|house|general",
    timeHorizon: "short|medium|long",
    autoRebalance: "boolean",
    dividendReinvestment: "boolean"
  }
});
```

## IoT and Sensors

### Sensor Data Schema

```typescript
const SensorDataSchema = Interface({
  deviceId: "uuid",
  sensorId: "string",
  
  device: {
    name: "string",
    type: "temperature|humidity|pressure|motion|light|sound|air-quality",
    location: "string",
    firmware: "string(/^\\d+\\.\\d+\\.\\d+$/)",
    batteryLevel: "number(0,100)?"
  },
  
  readings: {
    value: "number",
    unit: "string",
    precision: "number(0,10)",
    calibrated: "boolean"
  },
  
  metadata: {
    timestamp: "date",
    timezone: "string",
    quality: "excellent|good|fair|poor",
    confidence: "number(0,100)",
    source: "sensor|calculated|estimated"
  },
  
  environmental: {
    temperature: "number?",
    humidity: "number(0,100)?",
    pressure: "number?",
    altitude: "number?"
  }?,
  
  location: {
    latitude: "number(-90,90)?",
    longitude: "number(-180,180)?",
    accuracy: "number(0,)?"
  }?,
  
  alerts: {
    threshold: "number?",
    triggered: "boolean",
    severity: "low|medium|high|critical"?,
    message: "string?"
  }?,
  
  // Runtime configuration
  config: "any?",
  
  // Conditional processing
  processed: "when config.enableProcessing.$exists() *? boolean : =false",
  aggregated: "when config.enableAggregation.$exists() *? any : =null"
});
```

## Social Media

### Social Media Post Schema

```typescript
const SocialPostSchema = Interface({
  id: "uuid",
  platform: "twitter|facebook|instagram|linkedin|tiktok",
  
  author: {
    id: "string",
    username: "string(/^[a-zA-Z0-9_]{1,30}$/)",
    displayName: "string",
    avatar: "url?",
    verified: "boolean",
    followerCount: "int(0,)?"
  },
  
  content: {
    text: "string(,2000)?",
    hashtags: "string(/^#[a-zA-Z0-9_]+$/)[](0,30)",
    mentions: "string(/^@[a-zA-Z0-9_]+$/)[](0,50)",
    links: "url[]?",
    media: {
      type: "image|video|gif|audio",
      url: "url",
      thumbnail: "url?",
      duration: "number(0,)?"  // For videos/audio
    }[]?
  },
  
  engagement: {
    likes: "int(0,)",
    shares: "int(0,)",
    comments: "int(0,)",
    views: "int(0,)?",
    saves: "int(0,)?"
  },
  
  metadata: {
    language: "string(/^[a-z]{2}$/)?",
    location: {
      name: "string?",
      coordinates: {
        lat: "number(-90,90)",
        lng: "number(-180,180)"
      }?
    }?,
    device: "string?",
    source: "web|mobile|api|third-party"
  },
  
  moderation: {
    flagged: "boolean",
    reasons: "spam|harassment|misinformation|inappropriate|copyright"[]?,
    reviewed: "boolean",
    approved: "boolean?"
  },
  
  timestamps: {
    createdAt: "date",
    updatedAt: "date?",
    scheduledFor: "date?",
    publishedAt: "date?"
  }
});
```

## Enterprise Applications

### Employee Management Schema

```typescript
const EmployeeSchema = Interface({
  id: "uuid",
  employeeId: "string(/^EMP[0-9]{6}$/)",
  
  personal: {
    firstName: "string(1,50)",
    lastName: "string(1,50)",
    middleName: "string(1,50)?",
    preferredName: "string(1,50)?",
    dateOfBirth: "date",
    gender: "male|female|other|prefer-not-to-say"?,
    nationality: "string(/^[A-Z]{2}$/)",
    maritalStatus: "single|married|divorced|widowed|separated"?
  },
  
  contact: {
    email: "email",
    personalEmail: "email?",
    phone: "phone",
    emergencyContact: {
      name: "string",
      relationship: "string",
      phone: "phone",
      email: "email?"
    },
    address: {
      street: "string",
      city: "string",
      state: "string",
      zipCode: "string",
      country: "string(/^[A-Z]{2}$/)"
    }
  },
  
  employment: {
    status: "active|inactive|terminated|on-leave|suspended",
    type: "full-time|part-time|contract|intern|consultant",
    startDate: "date",
    endDate: "date?",
    probationEndDate: "date?",
    department: "string",
    position: "string",
    level: "junior|mid|senior|lead|manager|director|vp|c-level",
    reportsTo: "uuid?",
    location: "string",
    workArrangement: "office|remote|hybrid"
  },
  
  compensation: {
    salary: "number(0,)",
    currency: "string(/^[A-Z]{3}$/)",
    payFrequency: "weekly|bi-weekly|monthly|annually",
    benefits: "string[]?",
    bonusEligible: "boolean",
    equityGrant: "number(0,)?"
  },
  
  performance: {
    lastReviewDate: "date?",
    nextReviewDate: "date?",
    currentRating: "exceeds|meets|below|unsatisfactory"?,
    goals: "string[]?",
    skills: "string[]?"
  },
  
  access: {
    badgeNumber: "string?",
    accessLevel: "basic|elevated|admin|executive",
    systems: "string[]?",
    permissions: "string[]?"
  },
  
  // Runtime HR configuration
  hrConfig: "any?",
  
  // Conditional fields
  visaStatus: "when hrConfig.requiresVisa.$exists() *? any : =null",
  securityClearance: "when hrConfig.requiresClearance.$exists() *? any : =null"
});
```

These examples demonstrate real-world usage patterns across various domains, showing how Fortify Schema can handle complex validation requirements while maintaining type safety and readability.
