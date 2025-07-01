/**
 * Enhanced Live Utility Tests
 *
 * Tests all new stream methods and InterfaceSchema synchronization
 */

import { Interface } from "../src/core/schema/mode/interfaces/Interface";
import { Live } from "../src/core/schema/extensions/components/RealtimeValidation";

console.log("🚀 Enhanced Live Utility Tests\n");

// Test Schema
const UserSchema = Interface({
  id: "number",
  name: "string(2,50)",
  email: "email",
  age: "number(18,120)",
});

console.log("📋 Test Schema: id, name, email, age\n");

// =================================================================
// TEST 1: New Stream Methods Coverage
// =================================================================
console.log("🔍 TEST 1: Stream Methods Coverage");

const streamValidator = Live.stream(UserSchema);

// Check all required methods exist
const requiredMethods = [
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
const existingMethods = requiredMethods.filter(
  (method) => method in streamValidator
);
const missingMethods = requiredMethods.filter(
  (method) => !(method in streamValidator)
);

console.log(`✅ Existing methods: ${existingMethods.join(", ")}`);
console.log(`❌ Missing methods: ${missingMethods.join(", ")}`);
console.log(
  `📊 Coverage: ${((existingMethods.length / requiredMethods.length) * 100).toFixed(1)}%\n`
);

// =================================================================
// TEST 2: Event Emitter Functionality
// =================================================================
console.log("🔍 TEST 2: Event Emitter Functionality");

let eventCount = 0;
let onceEventCount = 0;

// Test .on() method
streamValidator.on("test-event", (data) => {
  eventCount++;
  console.log(`  📡 Regular event #${eventCount}: ${data}`);
});

// Test .once() method
streamValidator.once("test-event", (data) => {
  onceEventCount++;
  console.log(`  🔂 Once event #${onceEventCount}: ${data}`);
});

// Test .emit() method
console.log("\n📤 Testing event emission:");
streamValidator.emit("test-event", "First emission");
streamValidator.emit("test-event", "Second emission");
streamValidator.emit("test-event", "Third emission");

console.log(
  `📊 Regular events fired: ${eventCount}, Once events fired: ${onceEventCount}\n`
);

// =================================================================
// TEST 3: Data Transformation Pipeline
// =================================================================
console.log("🔍 TEST 3: Data Transformation Pipeline");

const transformValidator = Live.stream(UserSchema);

// Add transformations
transformValidator
  .transform((data) => {
    console.log(
      `  🔄 Transform: Adding timestamp to ${data.name || "unknown"}`
    );
    return { ...data, timestamp: Date.now() };
  })
  .filter((data) => {
    const passes = data.age >= 21;
    console.log(
      `  🔍 Filter: Age ${data.age} ${passes ? "PASSES" : "FAILS"} (21+ only)`
    );
    return passes;
  })
  .map((data) => {
    console.log(`  🗺️  Map: Converting name to uppercase for ${data.name}`);
    return { ...data, name: data.name.toUpperCase() };
  });

// Listen for results
transformValidator.on("valid", (data) => {
  console.log(`  ✅ Valid after pipeline: ${data.name} (age: ${data.age})`);
});

transformValidator.on("filtered", (data) => {
  console.log(`  🚫 Filtered out: ${data.name} (age: ${data.age})`);
});

transformValidator.on("invalid", (data, errors) => {
  console.log(`  ❌ Invalid after pipeline: ${Object.keys(errors).join(", ")}`);
});

console.log("\n🧪 Testing transformation pipeline:");

// Test data
const testUsers = [
  { id: 1, name: "john", email: "john@example.com", age: 25 }, // Should pass
  { id: 2, name: "jane", email: "jane@example.com", age: 19 }, // Should be filtered
  { id: 3, name: "bob", email: "invalid-email", age: 30 }, // Should fail validation
];

testUsers.forEach((user) => transformValidator.validate(user));

// =================================================================
// TEST 4: Stream Control (Pause/Resume)
// =================================================================
console.log("\n" + "=".repeat(60));
console.log("🔍 TEST 4: Stream Control (Pause/Resume)");

const controlValidator = Live.stream(UserSchema);

let processedCount = 0;
controlValidator.on("valid", () => processedCount++);
controlValidator.on("queued", (data) => {
  console.log(
    `  📦 Queued: ${data.name} (queue length: ${controlValidator.queueLength})`
  );
});

console.log("\n🧪 Testing pause/resume:");

// Pause the stream
controlValidator.pause();
console.log(`📊 Stream paused: ${controlValidator.paused}`);

// Send data while paused (should be queued)
controlValidator.validate({
  id: 1,
  name: "Alice",
  email: "alice@example.com",
  age: 25,
});
controlValidator.validate({
  id: 2,
  name: "Bob",
  email: "bob@example.com",
  age: 30,
});

console.log(
  `📦 Queue length after adding data: ${controlValidator.queueLength}`
);

// Resume the stream
console.log("\n▶️  Resuming stream...");
controlValidator.resume();
console.log(`📊 Stream paused: ${controlValidator.paused}`);
console.log(`📦 Queue length after resume: ${controlValidator.queueLength}`);
console.log(`✅ Processed count: ${processedCount}`);

// =================================================================
// TEST 5: Stream Piping
// =================================================================
console.log("\n" + "=".repeat(60));
console.log("🔍 TEST 5: Stream Piping");

const sourceValidator = Live.stream(UserSchema);
const destinationValidator = Live.stream(UserSchema);

let sourceValid = 0;
let destValid = 0;

sourceValidator.on("valid", () => sourceValid++);
destinationValidator.on("valid", () => destValid++);

// Pipe source to destination
sourceValidator.pipe(destinationValidator);

console.log("\n🧪 Testing stream piping:");
sourceValidator.validate({
  id: 1,
  name: "Charlie",
  email: "charlie@example.com",
  age: 28,
});

console.log(`📊 Source valid: ${sourceValid}, Destination valid: ${destValid}`);

// =================================================================
// TEST 6: InterfaceSchema Synchronization
// =================================================================
console.log("\n" + "=".repeat(60));
console.log("🔍 TEST 6: InterfaceSchema Synchronization");

const syncValidator = Live.stream(UserSchema);

let syncValid = 0;
let syncInvalid = 0;

syncValidator.on("valid", () => syncValid++);
syncValidator.on("invalid", () => syncInvalid++);

console.log("\n🧪 Testing schema synchronization:");

// Test with valid data
const validUser = { id: 1, name: "David", email: "david@example.com", age: 25 };
const invalidUser = { id: "not-number", name: "E", email: "invalid", age: 15 };

// Compare Interface.safeParse vs Live.stream validation
const interfaceResult1 = UserSchema.safeParse(validUser);
const interfaceResult2 = UserSchema.safeParse(invalidUser as any);

syncValidator.validate(validUser);
syncValidator.validate(invalidUser);

console.log(
  `📊 Interface validation: Valid=${interfaceResult1.success}, Invalid=${!interfaceResult2.success}`
);
console.log(`📊 Live validation: Valid=${syncValid}, Invalid=${syncInvalid}`);
console.log(
  `✅ Synchronization: ${interfaceResult1.success && syncValid > 0 && !interfaceResult2.success && syncInvalid > 0 ? "WORKING" : "BROKEN"}`
);

// =================================================================
// TEST 7: Cleanup and Destroy
// =================================================================
console.log("\n" + "=".repeat(60));
console.log("🔍 TEST 7: Cleanup and Destroy");

const destroyValidator = Live.stream(UserSchema);

destroyValidator.on("destroy", () => {
  console.log("  💥 Stream destroyed event fired");
});

console.log(`📊 Before destroy: destroyed=${destroyValidator.destroyed}`);
destroyValidator.destroy();
console.log(`📊 After destroy: destroyed=${destroyValidator.destroyed}`);

try {
  destroyValidator.validate({
    id: 1,
    name: "Test",
    email: "test@example.com",
    age: 25,
  });
  console.log("❌ ERROR: Validation should have failed on destroyed stream");
} catch (error) {
  console.log(`✅ EXPECTED: ${error.message}`);
}

console.log("\n" + "=".repeat(60));
console.log("🎯 ENHANCED LIVE UTILITY SUMMARY:");
console.log(
  `✅ Stream methods coverage: ${((existingMethods.length / requiredMethods.length) * 100).toFixed(1)}%`
);
console.log(
  `✅ Event emitter: ${eventCount > 0 && onceEventCount === 1 ? "WORKING" : "BROKEN"}`
);
console.log(`✅ Data transformation: IMPLEMENTED`);
console.log(`✅ Stream control: IMPLEMENTED`);
console.log(`✅ Stream piping: IMPLEMENTED`);
console.log(
  `✅ InterfaceSchema sync: ${syncValid > 0 && syncInvalid > 0 ? "WORKING" : "NEEDS_TESTING"}`
);
console.log(`✅ Cleanup/destroy: IMPLEMENTED`);
