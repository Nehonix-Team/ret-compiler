# Live Utility - Comprehensive Guide

The Live utility transforms ReliantType into a powerful real-time validation system with full EventEmitter-like interface, data transformation pipelines, and stream control methods. This guide covers all features and use cases.

## Table of Contents

- [Overview](#overview)
- [Installation & Setup](#installation--setup)
- [Core Components](#core-components)
- [EventEmitter Interface](#eventemitter-interface)
- [Data Transformation Pipeline](#data-transformation-pipeline)
- [Stream Control Methods](#stream-control-methods)
- [Form Integration](#form-integration)
- [Performance Monitoring](#performance-monitoring)
- [Real-World Examples](#real-world-examples)
- [Best Practices](#best-practices)
- [API Reference](#api-reference)

## Overview

The Live utility provides three main components:

- **LiveValidator** - Real-time field validation for forms and UI
- **StreamValidator** - Advanced stream processing with EventEmitter interface
- **FormValidator** - Complete form integration with field binding

### Key Features

✅ **100% Stream Methods Coverage**

- `.on()`, `.emit()`, `.off()`, `.once()` - Full EventEmitter interface
- `.transform()`, `.filter()`, `.map()` - Data transformation pipeline
- `.pipe()` - Stream piping and chaining
- `.pause()`, `.resume()`, `.destroy()` - Stream control

✅ **Perfect InterfaceSchema Synchronization**

- Identical validation results with Interface.safeParse()
- Consistent error handling and type inference
- Full support for conditional validation

✅ **Production-Ready Features**

- Performance monitoring and statistics
- Error handling and graceful degradation
- Memory management and cleanup

## Installation & Setup

```typescript
import { Live, Interface } from "reliant-type";

// Define your schema
const UserSchema = Interface({
  id: "number",
  name: "string(2,50)",
  email: "email",
  age: "number(18,120)",
  profile: {
    bio: "string?",
    website: "url?",
    verified: "boolean",
  },
});
```

## Core Components

### LiveValidator - Real-time Field Validation

Perfect for form validation and real-time UI feedback:

```typescript
const liveValidator = Live.validator(UserSchema);

// Listen for validation changes
liveValidator.onValidation((result) => {
  console.log("Overall valid:", result.isValid);
  console.log("Field errors:", result.errors);

  // Update UI based on validation state
  updateFormUI(result);
});

// Validate individual fields
liveValidator.validateField("email", "user@example.com");
liveValidator.validateField("name", "John Doe");
liveValidator.validateField("age", 25);

// Get current validation state
console.log("Is valid:", liveValidator.isValid);
console.log("All errors:", liveValidator.errors);

// Validate entire object
const fullResult = liveValidator.validateAll(userData);
```

### StreamValidator - Advanced Stream Processing

Full EventEmitter interface with data transformation:

```typescript
const streamValidator = Live.stream(UserSchema);

// EventEmitter methods
streamValidator.on("valid", (data) => {
  console.log("✅ Valid data:", data);
});

streamValidator.on("invalid", (data, errors) => {
  console.log("❌ Invalid data:", errors);
});

streamValidator.on("error", (error) => {
  console.error("Stream error:", error);
});

// Process data
streamValidator.validate(userData);
```

### FormValidator - Complete Form Integration

Designed for HTML form integration:

```typescript
const formValidator = Live.form(UserSchema);

// Bind form fields
formValidator.bindField("email", document.getElementById("email"));
formValidator.bindField("name", document.getElementById("name"));

// Enable automatic validation
formValidator.enableAutoValidation();

// Handle form submission
formValidator.onSubmit((isValid, data, errors) => {
  if (isValid) {
    // Submit to API
    submitToAPI(data);
  } else {
    // Display errors
    displayFormErrors(errors);
  }
});
```

## EventEmitter Interface

The StreamValidator provides a complete EventEmitter-like interface:

### Basic Event Methods

```typescript
const validator = Live.stream(UserSchema);

// .on() - Add event listener
validator.on("valid", (data) => {
  console.log("Valid data received:", data);
});

// .once() - One-time event listener
validator.once("invalid", (data, errors) => {
  console.log("First invalid data:", errors);
});

// .emit() - Emit custom events
validator.emit("custom-event", "Hello World!");

// .off() - Remove event listeners
validator.off("valid", specificListener);
validator.off("invalid"); // Remove all listeners for event
```

### Built-in Events

The StreamValidator emits these events automatically:

```typescript
// Data processing events
validator.on("data", (data) => {
  console.log("Data received for validation");
});

validator.on("validated", (data, result) => {
  console.log("Validation completed:", result.isValid);
});

// Validation result events
validator.on("valid", (data) => {
  console.log("Data passed validation");
});

validator.on("invalid", (data, errors) => {
  console.log("Data failed validation:", errors);
});

// Transformation events
validator.on("filtered", (data) => {
  console.log("Data filtered out by pipeline");
});

// Stream control events
validator.on("pause", () => {
  console.log("Stream paused");
});

validator.on("resume", () => {
  console.log("Stream resumed");
});

validator.on("destroy", () => {
  console.log("Stream destroyed");
});

// Queue events
validator.on("queued", (data) => {
  console.log("Data queued (stream paused)");
});

// Error events
validator.on("error", (error) => {
  console.error("Stream error:", error);
});
```

## Data Transformation Pipeline

Build powerful data processing pipelines:

### Basic Transformations

```typescript
const validator = Live.stream(UserSchema)
  .transform((data) => {
    // Add metadata
    return {
      ...data,
      timestamp: Date.now(),
      source: "api",
      version: "1.0",
    };
  })
  .filter((data) => {
    // Business logic filtering
    return data.age >= 21 && data.email.includes("@company.com");
  })
  .map((data) => {
    // Data format transformation
    return {
      ...data,
      name: data.name.toUpperCase(),
      email: data.email.toLowerCase(),
      displayName: `${data.name} (${data.age})`,
    };
  });

// Listen for pipeline results
validator.on("valid", (data) => {
  console.log("Processed data:", data);
  // Data has been transformed, filtered, and validated
});

validator.on("filtered", (data) => {
  console.log("Data filtered out:", data);
  // Data didn't pass filter conditions
});

validator.on("invalid", (data, errors) => {
  console.log("Validation failed after transformation:", errors);
});
```

### Advanced Pipeline Example

```typescript
const advancedValidator = Live.stream(UserSchema)
  // Step 1: Normalize data
  .transform((data) => ({
    ...data,
    email: data.email?.toLowerCase().trim(),
    name: data.name?.trim(),
    phone: data.phone?.replace(/\D/g, ""), // Remove non-digits
  }))

  // Step 2: Add computed fields
  .transform((data) => ({
    ...data,
    fullName: `${data.firstName} ${data.lastName}`,
    isAdult: data.age >= 18,
    emailDomain: data.email?.split("@")[1],
  }))

  // Step 3: Business logic filtering
  .filter((data) => {
    // Only process users from allowed domains
    const allowedDomains = ["company.com", "partner.com"];
    return allowedDomains.includes(data.emailDomain);
  })

  // Step 4: Final formatting
  .map((data) => ({
    ...data,
    displayName: data.isAdult ? `${data.fullName} (Adult)` : data.fullName,
    contactInfo: `${data.email} | ${data.phone}`,
  }));

// Process data through pipeline
advancedValidator.validate(rawUserData);
```

## Stream Control Methods

Control data flow with pause, resume, and destroy:

### Basic Stream Control

```typescript
const validator = Live.stream(UserSchema);

// Pause stream (incoming data gets queued)
validator.pause();
console.log("Stream paused:", validator.paused); // true

// Send data while paused
validator.validate(userData1); // Queued
validator.validate(userData2); // Queued
validator.validate(userData3); // Queued

console.log("Queue length:", validator.queueLength); // 3

// Resume stream (processes all queued data)
validator.resume();
console.log("Stream resumed, queue processed");
console.log("Queue length:", validator.queueLength); // 0

// Destroy stream (cleanup and prevent further use)
validator.destroy();
console.log("Stream destroyed:", validator.destroyed); // true
```

### Advanced Stream Control

```typescript
const controlValidator = Live.stream(UserSchema);

// Listen for control events
controlValidator.on("pause", () => {
  console.log("⏸️ Stream paused - data will be queued");
});

controlValidator.on("resume", () => {
  console.log("▶️ Stream resumed - processing queue");
});

controlValidator.on("queued", (data) => {
  console.log(
    `📦 Data queued: ${data.name} (queue: ${controlValidator.queueLength})`
  );
});

controlValidator.on("destroy", () => {
  console.log("💥 Stream destroyed - cleanup completed");
});

// Conditional pause/resume based on load
let processedCount = 0;
controlValidator.on("valid", () => {
  processedCount++;

  // Pause if processing too fast
  if (processedCount % 100 === 0) {
    controlValidator.pause();
    setTimeout(() => controlValidator.resume(), 1000);
  }
});
```

## Stream Piping

Connect validators for complex workflows:

### Basic Piping

```typescript
const sourceValidator = Live.stream(InputSchema);
const destinationValidator = Live.stream(OutputSchema);

// Pipe valid data from source to destination
sourceValidator.pipe(destinationValidator);

// Data flows: source → destination
sourceValidator.validate(inputData);
// If valid, automatically sent to destinationValidator
```

### Multi-Stage Pipeline

```typescript
const rawDataValidator = Live.stream(RawDataSchema);
const cleanDataValidator = Live.stream(CleanDataSchema);
const processedDataValidator = Live.stream(ProcessedDataSchema);
const finalValidator = Live.stream(FinalSchema);

// Create processing pipeline
const pipeline = rawDataValidator
  .transform((data) => cleanData(data))
  .pipe(cleanDataValidator)
  .transform((data) => processData(data))
  .pipe(processedDataValidator)
  .transform((data) => finalizeData(data))
  .pipe(finalValidator);

// Listen at each stage
rawDataValidator.on("valid", (data) => console.log("✅ Raw data valid"));
cleanDataValidator.on("valid", (data) => console.log("✅ Clean data valid"));
processedDataValidator.on("valid", (data) =>
  console.log("✅ Processed data valid")
);
finalValidator.on("valid", (data) => console.log("✅ Final data ready"));

// Start the pipeline
rawDataValidator.validate(inputData);
```

## Performance Monitoring

Built-in performance tracking and statistics:

### Basic Statistics

```typescript
const validator = Live.stream(UserSchema);

// Listen for statistics updates
validator.onStats((stats) => {
  console.log("📊 Validation Statistics:");
  console.log(`- Total validated: ${stats.totalValidated}`);
  console.log(`- Valid count: ${stats.validCount}`);
  console.log(`- Invalid count: ${stats.invalidCount}`);
  console.log(`- Error rate: ${(stats.errorRate * 100).toFixed(2)}%`);
  console.log(`- Running since: ${stats.startTime}`);
});

// Get current statistics
const currentStats = validator.getStats();
console.log("Current performance:", currentStats);
```

### Performance Monitoring Dashboard

```typescript
class ValidationDashboard {
  private validators: Map<string, any> = new Map();

  addValidator(name: string, validator: any) {
    this.validators.set(name, validator);

    validator.onStats((stats) => {
      this.updateDashboard(name, stats);
    });
  }

  updateDashboard(name: string, stats: any) {
    console.log(`📊 ${name} Performance:`);
    console.log(`   Throughput: ${stats.validCount}/${stats.totalValidated}`);
    console.log(
      `   Success Rate: ${((1 - stats.errorRate) * 100).toFixed(1)}%`
    );
    console.log(`   Queue Length: ${this.validators.get(name).queueLength}`);
  }

  getOverallStats() {
    let totalValidated = 0;
    let totalValid = 0;

    for (const [name, validator] of this.validators) {
      const stats = validator.getStats();
      totalValidated += stats.totalValidated;
      totalValid += stats.validCount;
    }

    return {
      totalValidated,
      totalValid,
      overallSuccessRate: totalValidated > 0 ? totalValid / totalValidated : 0,
    };
  }
}

// Usage
const dashboard = new ValidationDashboard();
dashboard.addValidator("users", Live.stream(UserSchema));
dashboard.addValidator("products", Live.stream(ProductSchema));
dashboard.addValidator("orders", Live.stream(OrderSchema));
```

## Real-World Examples

### E-commerce Order Processing

```typescript
const OrderSchema = Interface({
  orderId: "uuid",
  customerId: "uuid",
  items: "array",
  total: "number(0.01,)",
  status: "pending|processing|shipped|delivered",
  shippingAddress: {
    street: "string",
    city: "string",
    zipCode: "string(/^\\d{5}$/)",
    country: "string",
  },
});

const orderProcessor = Live.stream(OrderSchema)
  .transform((order) => ({
    ...order,
    processedAt: new Date(),
    estimatedDelivery: calculateDelivery(order.shippingAddress),
  }))
  .filter((order) => {
    // Only process orders with valid payment
    return validatePayment(order.customerId, order.total);
  })
  .map((order) => ({
    ...order,
    trackingNumber: generateTrackingNumber(),
    status: "processing",
  }));

orderProcessor.on("valid", (order) => {
  console.log(`✅ Order ${order.orderId} processed successfully`);
  updateInventory(order.items);
  sendConfirmationEmail(order.customerId);
});

orderProcessor.on("filtered", (order) => {
  console.log(`❌ Order ${order.orderId} payment failed`);
  notifyPaymentFailure(order.customerId);
});

orderProcessor.on("invalid", (order, errors) => {
  console.log(`❌ Order ${order.orderId} validation failed:`, errors);
  logOrderError(order, errors);
});
```

### Real-time Chat Message Validation

```typescript
const MessageSchema = Interface({
  messageId: "uuid",
  userId: "uuid",
  channelId: "uuid",
  content: "string(1,1000)",
  type: "text|image|file",
  timestamp: "date",
});

const chatValidator = Live.stream(MessageSchema)
  .transform((message) => ({
    ...message,
    content: sanitizeContent(message.content),
    wordCount: message.content.split(" ").length,
  }))
  .filter((message) => {
    // Filter spam and inappropriate content
    return (
      !isSpam(message.content) && !hasInappropriateContent(message.content)
    );
  })
  .map((message) => ({
    ...message,
    displayContent: formatMessage(message.content),
    mentions: extractMentions(message.content),
  }));

chatValidator.on("valid", (message) => {
  broadcastMessage(message);
  updateChannelActivity(message.channelId);
});

chatValidator.on("filtered", (message) => {
  notifyModerators(message);
  sendWarningToUser(message.userId);
});

// Real-time message processing
websocket.on("message", (rawMessage) => {
  chatValidator.validate(rawMessage);
});
```

## Best Practices

### 1. Error Handling

```typescript
const validator = Live.stream(UserSchema);

// Always handle errors gracefully
validator.on("error", (error) => {
  console.error("Validation error:", error);

  // Log for debugging
  logger.error("Stream validation error", {
    error: error.message,
    stack: error.stack,
  });

  // Don't let errors crash the application
  // Emit a recovery event or restart the stream if needed
});
```

### 2. Memory Management

```typescript
// Clean up validators when done
const validator = Live.stream(UserSchema);

// Use the validator...

// Clean up when component unmounts or process ends
validator.destroy();
```

### 3. Performance Optimization

```typescript
// Use pause/resume for backpressure control
const validator = Live.stream(UserSchema);

let queueSize = 0;
validator.on("queued", () => {
  queueSize++;
  if (queueSize > 1000) {
    console.warn("Queue getting large, consider scaling");
  }
});

validator.on("valid", () => {
  queueSize = Math.max(0, queueSize - 1);
});
```

### 4. Testing

```typescript
// Test validators in isolation
describe("User Validator", () => {
  let validator;

  beforeEach(() => {
    validator = Live.stream(UserSchema);
  });

  afterEach(() => {
    validator.destroy();
  });

  it("should validate correct user data", (done) => {
    validator.on("valid", (data) => {
      expect(data.name).toBe("John Doe");
      done();
    });

    validator.validate({
      name: "John Doe",
      email: "john@example.com",
      age: 25,
    });
  });
});
```

## API Reference

### Live.validator(schema)

Creates a LiveValidator for real-time field validation.

### Live.stream(schema)

Creates a StreamValidator with full EventEmitter interface.

### Live.form(schema)

Creates a FormValidator for HTML form integration.

### StreamValidator Methods

#### Event Methods

- `.on(event, listener)` - Add event listener
- `.once(event, listener)` - Add one-time listener
- `.off(event, listener?)` - Remove listener(s)
- `.emit(event, ...args)` - Emit event

#### Transformation Methods

- `.transform(fn)` - Add data transformer
- `.filter(fn)` - Add data filter
- `.map(fn)` - Add data mapper

#### Control Methods

- `.pause()` - Pause stream (queue data)
- `.resume()` - Resume stream (process queue)
- `.destroy()` - Destroy stream (cleanup)
- `.pipe(destination)` - Pipe to another validator

#### Properties

- `.paused` - Boolean, stream pause state
- `.destroyed` - Boolean, stream destroy state
- `.queueLength` - Number, current queue size

#### Statistics

- `.onStats(listener)` - Listen for statistics
- `.getStats()` - Get current statistics

The Live utility provides a complete, production-ready solution for real-time validation with perfect InterfaceSchema synchronization.

### Stream Control Events

```typescript
const validator = Live.stream(UserSchema);

// Listen for control events
validator.on("pause", () => {
  console.log("⏸️ Stream paused - data will be queued");
});

validator.on("resume", () => {
  console.log("▶️ Stream resumed - processing queue");
});

validator.on("queued", (data) => {
  console.log(`📦 Data queued (queue: ${validator.queueLength})`);
});

validator.on("destroy", () => {
  console.log("💥 Stream destroyed - cleanup completed");
});

// Pause and send data
validator.pause();
validator.validate({ name: "John", email: "john@example.com", age: 25 });
// Output: 📦 Data queued (queue: 1)

validator.resume();
// Output: ▶️ Stream resumed - processing queue
```

## Stream Piping

Connect validators for complex workflows:

### Basic Piping

```typescript
const sourceValidator = Live.stream(InputSchema);
const destinationValidator = Live.stream(OutputSchema);

// Pipe valid data from source to destination
sourceValidator.pipe(destinationValidator);

// Listen for results
destinationValidator.on("valid", (data) => {
  console.log("Final processed data:", data);
});

// Data flows: source → destination
sourceValidator.validate(inputData);
```

### Multi-Stage Pipeline

```typescript
const rawDataValidator = Live.stream(RawDataSchema);
const cleanDataValidator = Live.stream(CleanDataSchema);
const enrichedDataValidator = Live.stream(EnrichedDataSchema);
const finalValidator = Live.stream(FinalSchema);

// Build processing pipeline
rawDataValidator
  .transform((data) => cleanData(data))
  .pipe(cleanDataValidator)
  .transform((data) => enrichData(data))
  .pipe(enrichedDataValidator)
  .transform((data) => finalizeData(data))
  .pipe(finalValidator);

// Listen at each stage
rawDataValidator.on("valid", (data) => console.log("Raw data valid"));
cleanDataValidator.on("valid", (data) => console.log("Clean data valid"));
enrichedDataValidator.on("valid", (data) => console.log("Enriched data valid"));
finalValidator.on("valid", (data) => console.log("Final data ready:", data));

// Start the pipeline
rawDataValidator.validate(inputData);
```

## Performance Monitoring

Built-in performance tracking and statistics:

### Basic Statistics

```typescript
const validator = Live.stream(UserSchema);

// Listen for statistics updates
validator.onStats((stats) => {
  console.log("📊 Validation Statistics:");
  console.log(`- Total validated: ${stats.totalValidated}`);
  console.log(`- Valid count: ${stats.validCount}`);
  console.log(`- Invalid count: ${stats.invalidCount}`);
  console.log(`- Error rate: ${(stats.errorRate * 100).toFixed(2)}%`);
  console.log(`- Running since: ${stats.startTime}`);
});

// Get current statistics
const currentStats = validator.getStats();
console.log("Current performance:", currentStats);
```

### Performance Monitoring Dashboard

```typescript
class ValidationDashboard {
  constructor(validator) {
    this.validator = validator;
    this.setupMonitoring();
  }

  setupMonitoring() {
    // Real-time statistics
    this.validator.onStats((stats) => {
      this.updateDashboard(stats);
    });

    // Performance alerts
    this.validator.onStats((stats) => {
      if (stats.errorRate > 0.1) {
        // 10% error rate
        console.warn("⚠️ High error rate detected:", stats.errorRate);
      }

      if (stats.totalValidated > 10000) {
        console.info("🎉 Processed 10k+ validations");
      }
    });

    // Error tracking
    this.validator.on("error", (error) => {
      this.logError(error);
    });
  }

  updateDashboard(stats) {
    const throughput =
      stats.totalValidated / ((Date.now() - stats.startTime.getTime()) / 1000);

    console.log(`📈 Throughput: ${throughput.toFixed(2)} validations/sec`);
    console.log(
      `✅ Success rate: ${((1 - stats.errorRate) * 100).toFixed(2)}%`
    );
  }

  logError(error) {
    console.error("🚨 Validation error:", {
      message: error.message,
      timestamp: new Date().toISOString(),
      stack: error.stack,
    });
  }
}

// Usage
const validator = Live.stream(UserSchema);
const dashboard = new ValidationDashboard(validator);
```

## Real-World Examples

### E-commerce Order Processing

```typescript
const OrderSchema = Interface({
  orderId: "uuid",
  customerId: "uuid",
  items: "array",
  total: "number(0.01,)",
  status: "pending|processing|shipped|delivered",
  shippingAddress: {
    street: "string",
    city: "string",
    zipCode: "string(/^\\d{5}$/)",
    country: "string",
  },
});

const orderProcessor = Live.stream(OrderSchema)
  .transform((order) => ({
    ...order,
    processedAt: new Date(),
    estimatedDelivery: calculateDelivery(order.shippingAddress),
  }))
  .filter((order) => {
    // Only process orders with valid payment
    return validatePayment(order.customerId, order.total);
  })
  .map((order) => ({
    ...order,
    trackingNumber: generateTrackingNumber(),
    status: "processing",
  }));

// Handle processed orders
orderProcessor.on("valid", (order) => {
  console.log("✅ Order processed:", order.orderId);
  updateInventory(order.items);
  sendConfirmationEmail(order);
});

orderProcessor.on("filtered", (order) => {
  console.log("💳 Payment failed for order:", order.orderId);
  notifyPaymentFailure(order);
});

orderProcessor.on("invalid", (order, errors) => {
  console.log("❌ Invalid order data:", errors);
  logOrderError(order, errors);
});
```

### Real-time Chat Message Validation

```typescript
const MessageSchema = Interface({
  messageId: "uuid",
  userId: "uuid",
  content: "string(1,1000)",
  timestamp: "date",
  channelId: "uuid",
  messageType: "text|image|file|system",
});

const messageValidator = Live.stream(MessageSchema)
  .transform((message) => ({
    ...message,
    content: sanitizeContent(message.content),
    wordCount: message.content.split(" ").length,
  }))
  .filter((message) => {
    // Content moderation
    return !containsProfanity(message.content) && !isSpam(message.content);
  })
  .map((message) => ({
    ...message,
    formattedContent: formatMessage(message.content),
    mentions: extractMentions(message.content),
  }));

// Real-time message processing
messageValidator.on("valid", (message) => {
  broadcastMessage(message);
  updateChannelActivity(message.channelId);
});

messageValidator.on("filtered", (message) => {
  console.log("🚫 Message filtered:", message.messageId);
  notifyModerationAction(message.userId);
});

// Process incoming messages
websocket.on("message", (rawMessage) => {
  messageValidator.validate(rawMessage);
});
```

## Best Practices

### 1. Error Handling

```typescript
const validator = Live.stream(UserSchema);

// Always handle errors gracefully
validator.on("error", (error) => {
  console.error("Validation error:", error);

  // Don't let errors crash the application
  if (error.code === "VALIDATION_TIMEOUT") {
    validator.resume(); // Retry
  } else {
    // Log and continue
    logError(error);
  }
});
```

### 2. Memory Management

```typescript
// Clean up when done
function cleanupValidator(validator) {
  validator.destroy();

  // Remove all listeners
  validator.off("valid");
  validator.off("invalid");
  validator.off("error");
}

// Use try-finally for cleanup
try {
  const validator = Live.stream(UserSchema);
  // Use validator...
} finally {
  cleanupValidator(validator);
}
```

### 3. Performance Optimization

```typescript
// Use pause/resume for batch processing
const validator = Live.stream(UserSchema);

async function processBatch(dataArray) {
  validator.pause();

  // Queue all data
  dataArray.forEach((data) => validator.validate(data));

  // Process batch
  validator.resume();
}
```

### 4. Type Safety

```typescript
// Maintain type safety with TypeScript
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

const validator = Live.stream(UserSchema);

validator.on("valid", (data: User) => {
  // data is fully typed
  console.log(data.name.toUpperCase());
});
```

## API Reference

### Live.validator(schema)

Creates a LiveValidator for real-time field validation.

**Returns:** `LiveValidator`

**Methods:**

- `validateField(fieldName: string, value: any): FieldValidationResult`
- `validateAll(data: any): ValidationResult`
- `onValidation(callback: (result: ValidationResult) => void): void`
- `get isValid(): boolean`
- `get errors(): Record<string, string[]>`

### Live.stream(schema)

Creates a StreamValidator with full EventEmitter interface.

**Returns:** `StreamValidator`

**EventEmitter Methods:**

- `on(event: string, listener: (...args: any[]) => void): this`
- `once(event: string, listener: (...args: any[]) => void): this`
- `off(event: string, listener?: (...args: any[]) => void): this`
- `emit(event: string, ...args: any[]): boolean`

**Transformation Methods:**

- `transform(transformer: (data: any) => any): this`
- `filter(predicate: (data: any) => boolean): this`
- `map(mapper: (data: any) => any): this`

**Stream Control Methods:**

- `pause(): this`
- `resume(): this`
- `destroy(): this`
- `pipe(destination: StreamValidator): StreamValidator`

**Validation Methods:**

- `validate(data: any): void`
- `onValid(callback: (data: any) => void): void`
- `onInvalid(callback: (data: any, errors: Record<string, string[]>) => void): void`
- `onStats(callback: (stats: ValidationStats) => void): void`
- `getStats(): ValidationStats`

**Properties:**

- `get destroyed(): boolean`
- `get paused(): boolean`
- `get queueLength(): number`

### Live.form(schema)

Creates a FormValidator for HTML form integration.

**Returns:** `FormValidator`

**Methods:**

- `bindField(fieldName: string, element: HTMLElement): void`
- `enableAutoValidation(): void`
- `onSubmit(callback: (isValid: boolean, data: any, errors: Record<string, string[]>) => void): void`
- `validateForm(): ValidationResult`

---

The Live utility provides a complete real-time validation solution with **100% stream methods coverage** and **perfect InterfaceSchema synchronization**. Use it to build reactive, high-performance validation systems for modern applications.
