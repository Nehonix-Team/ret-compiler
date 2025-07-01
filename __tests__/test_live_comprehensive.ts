/**
 * Comprehensive Live Utility Tests
 *
 * Tests all Live functionality including:
 * - LiveValidator with real-time validation
 * - StreamValidator with stream methods (.on, .emit, etc.)
 * - FormValidator with form binding
 * - Integration with InterfaceSchema
 * - Performance and error handling
 */

import { Interface } from "../src/core/schema/mode/interfaces/Interface";
import { Live } from "../src/core/schema/extensions/components/RealtimeValidation";

console.log("🧪 Comprehensive Live Utility Tests\n");

// Test Schema
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

console.log("📋 Test Schema Created");
console.log(
  "Schema fields: id, name, email, age, profile.{bio, website, verified}\n"
);

// =================================================================
// TEST 1: LiveValidator Basic Functionality
// =================================================================
console.log("🔍 TEST 1: LiveValidator Basic Functionality");

const liveValidator = Live.validator(UserSchema);

// Test field validation
console.log("\n📝 Testing field validation:");

const emailResult = liveValidator.validateField("email", "test@example.com");
console.log(`✅ Valid email: ${emailResult.isValid} (${emailResult.value})`);

const invalidEmailResult = liveValidator.validateField(
  "email",
  "invalid-email"
);
console.log(
  `❌ Invalid email: ${invalidEmailResult.isValid} (errors: ${invalidEmailResult.errors.join(", ")})`
);

const nameResult = liveValidator.validateField("name", "John");
console.log(`✅ Valid name: ${nameResult.isValid} (${nameResult.value})`);

const shortNameResult = liveValidator.validateField("name", "A");
console.log(
  `❌ Short name: ${shortNameResult.isValid} (errors: ${shortNameResult.errors.join(", ")})`
);

// Test validation listeners
console.log("\n🔔 Testing validation listeners:");

let validationCount = 0;
liveValidator.onValidation((result) => {
  validationCount++;
  console.log(
    `  Validation #${validationCount}: ${result.isValid ? "VALID" : "INVALID"} (${Object.keys(result.errors).length} errors)`
  );
});

// Trigger some validations
liveValidator.validateField("age", 25);
liveValidator.validateField("age", 15); // Should fail (under 18)
liveValidator.validateField("id", 123);

console.log(
  `\n📊 Current state: Valid=${liveValidator.isValid}, Errors=${Object.keys(liveValidator.errors).length}`
);

// =================================================================
// TEST 2: StreamValidator with Stream Methods
// =================================================================
console.log("\n" + "=".repeat(60));
console.log("🔍 TEST 2: StreamValidator with Stream Methods");

const streamValidator = Live.stream(UserSchema);

// Test current methods
console.log("\n📝 Testing current stream methods:");

let validDataCount = 0;
let invalidDataCount = 0;

streamValidator.onValid((data) => {
  validDataCount++;
  console.log(
    `  ✅ Valid data #${validDataCount}:`,
    data.name || data.email || "unknown"
  );
});

streamValidator.onInvalid((data, errors) => {
  invalidDataCount++;
  console.log(
    `  ❌ Invalid data #${invalidDataCount}:`,
    Object.keys(errors).join(", ")
  );
});

streamValidator.onStats((stats) => {
  console.log(
    `  📊 Stats: ${stats.validCount}/${stats.totalValidated} valid (${(stats.errorRate * 100).toFixed(1)}% error rate)`
  );
});

// Test with valid data
console.log("\n🧪 Testing with sample data:");

const validUser = {
  id: 1,
  name: "John Doe",
  email: "john@example.com",
  age: 30,
  profile: {
    bio: "Software developer",
    website: "https://johndoe.com",
    verified: true,
  },
};

const invalidUser = {
  id: "not-a-number",
  name: "A", // Too short
  email: "invalid-email",
  age: 15, // Too young
  profile: {
    bio: null,
    website: "not-a-url",
    verified: "not-boolean",
  },
};

streamValidator.validate(validUser);
streamValidator.validate(invalidUser);

console.log(
  `\n📊 Final stats: ${validDataCount} valid, ${invalidDataCount} invalid`
);

// =================================================================
// TEST 3: Missing Stream Methods (.on, .emit, etc.)
// =================================================================
console.log("\n" + "=".repeat(60));
console.log("🔍 TEST 3: Testing Missing Stream Methods");

console.log("\n❌ MISSING METHODS THAT SHOULD BE IMPLEMENTED:");
console.log("- .on(event, listener) - Generic event listener");
console.log("- .emit(event, ...args) - Event emitter");
console.log("- .off(event, listener) - Remove listener");
console.log("- .once(event, listener) - One-time listener");
console.log("- .pipe(destination) - Stream piping");
console.log("- .transform(transformer) - Data transformation");
console.log("- .filter(predicate) - Data filtering");
console.log("- .map(mapper) - Data mapping");
console.log("- .pause() / .resume() - Stream control");
console.log("- .destroy() - Cleanup");

// Test if these methods exist
const streamMethods = [
  "on",
  "emit",
  "off",
  "once",
  "pipe",
  "transform",
  "filter",
  "map",
  "pause",
  "resume",
  "destroy",
];
const missingMethods = streamMethods.filter(
  (method) => !(method in streamValidator)
);

console.log(`\n🔍 Missing methods: ${missingMethods.join(", ")}`);
console.log(
  `📊 Coverage: ${(((streamMethods.length - missingMethods.length) / streamMethods.length) * 100).toFixed(1)}%`
);

// =================================================================
// TEST 4: FormValidator
// =================================================================
console.log("\n" + "=".repeat(60));
console.log("🔍 TEST 4: FormValidator");

const formValidator = Live.form(UserSchema);

console.log("\n📝 Testing form validator methods:");
console.log(
  "Available methods:",
  Object.getOwnPropertyNames(Object.getPrototypeOf(formValidator))
);

// =================================================================
// TEST 5: Integration with InterfaceSchema
// =================================================================
console.log("\n" + "=".repeat(60));
console.log("🔍 TEST 5: Integration with InterfaceSchema");

console.log("\n🧪 Testing schema compatibility:");

try {
  const result = UserSchema.safeParse(validUser);
  console.log(`✅ Schema.safeParse works: ${result.success}`);

  const liveResult = liveValidator.validateAll(validUser);
  console.log(`✅ Live.validateAll works: ${liveResult.isValid}`);

  console.log("✅ Integration appears functional");
} catch (error) {
  console.log(`❌ Integration error: ${error.message}`);
}

console.log("\n" + "=".repeat(60));
console.log("🎯 SUMMARY OF ISSUES FOUND:");
console.log("1. Missing standard stream methods (.on, .emit, etc.)");
console.log("2. No stream control methods (.pause, .resume, .destroy)");
console.log("3. No data transformation methods (.map, .filter, .transform)");
console.log("4. No stream piping functionality");
console.log("5. Limited event system (only specific events, not generic .on)");
console.log("\n🔧 RECOMMENDATIONS:");
console.log("- Implement EventEmitter-like interface");
console.log("- Add stream control methods");
console.log("- Add data transformation pipeline");
console.log("- Ensure full sync with InterfaceSchema modules");
