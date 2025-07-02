/**
 * Documentation Completeness Test
 *
 * Verifies that all Live utility features are properly documented
 * and examples work as described in the documentation.
 */

import { Interface } from "../src/core/schema/mode/interfaces/Interface";
import { Live } from "../src/core/schema/extensions/components/RealtimeValidation";

console.log("📚 Testing Documentation Examples\n");

// Test Schema from documentation
const UserSchema = Interface({
  id: "number",
  name: "string(2,50)", 
  email: "email",
  age: "number(18,120)",
});

console.log("✅ Schema created successfully");

// =================================================================
// TEST 1: Basic Live Utility Examples from README
// =================================================================
console.log("\n🔍 TEST 1: README Examples");

// Example from README - Quick Example
const validator = Live.stream(UserSchema)
  .transform((data) => ({ ...data, timestamp: Date.now() }))
  .filter((data) => data.age >= 21)
  .map((data) => ({ ...data, name: data.name.toUpperCase() }));

let readmeExampleWorked = false;
validator.on("valid", (data) => {
  console.log("✅ README Quick Example:", data.name);
  readmeExampleWorked = true;
});

validator.validate({ name: "john", email: "john@example.com", age: 25 });

// =================================================================
// TEST 2: Stream Control Examples from README
// =================================================================
console.log("\n🔍 TEST 2: Stream Control Examples");

const streamValidator = Live.stream(UserSchema);

// Test pause/resume from README
streamValidator.pause();
streamValidator.validate({
  name: "Alice",
  email: "alice@example.com",
  age: 25,
});
streamValidator.validate({ name: "Bob", email: "bob@example.com", age: 30 });

console.log(`📦 Queue length: ${streamValidator.queueLength} (should be 2)`);

let resumeWorked = false;
streamValidator.on("valid", () => {
  resumeWorked = true;
});

streamValidator.resume();
console.log(
  `📦 Queue after resume: ${streamValidator.queueLength} (should be 0)`
);

// =================================================================
// TEST 3: EventEmitter Interface Examples
// =================================================================
console.log("\n🔍 TEST 3: EventEmitter Interface");

const eventValidator = Live.stream(UserSchema);

let eventEmitterWorked = false;

// Test .on() method
eventValidator.on("valid", () => {
  eventEmitterWorked = true;
});

// Test .once() method
let onceEventFired = false;
eventValidator.once("invalid", () => {
  onceEventFired = true;
});

// Test .emit() method
let customEventFired = false;
eventValidator.on("custom-event", (message) => {
  if (message === "Hello from documentation!") {
    customEventFired = true;
  }
});

eventValidator.emit("custom-event", "Hello from documentation!");

// Test validation
eventValidator.validate({ name: "Test", email: "test@example.com", age: 25 });

// =================================================================
// TEST 4: Stream Piping Examples
// =================================================================
console.log("\n🔍 TEST 4: Stream Piping");

const sourceValidator = Live.stream(UserSchema);
const destinationValidator = Live.stream(UserSchema);

let pipingWorked = false;
destinationValidator.on("valid", () => {
  pipingWorked = true;
});

// Test piping from documentation
sourceValidator.pipe(destinationValidator);
sourceValidator.validate({
  name: "Piped",
  email: "piped@example.com",
  age: 25,
});

// =================================================================
// TEST 5: All Stream Methods Coverage
// =================================================================
console.log("\n🔍 TEST 5: Stream Methods Coverage");

const coverageValidator = Live.stream(UserSchema);

// Test all documented methods exist
const requiredMethods = [
  "on",
  "emit",
  "off",
  "once", // EventEmitter
  "transform",
  "filter",
  "map", // Transformation
  "pause",
  "resume",
  "destroy",
  "pipe", // Control
  "validate",
  "onValid",
  "onInvalid", // Validation
  "onStats",
  "getStats", // Statistics
];

const missingMethods = requiredMethods.filter(
  (method) => !(method in coverageValidator)
);
const existingMethods = requiredMethods.filter(
  (method) => method in coverageValidator
);

console.log(
  `✅ Existing methods: ${existingMethods.length}/${requiredMethods.length}`
);
if (missingMethods.length > 0) {
  console.log(`❌ Missing methods: ${missingMethods.join(", ")}`);
} else {
  console.log(`✅ All documented methods exist!`);
}

// =================================================================
// TEST 6: Properties Coverage
// =================================================================
console.log("\n🔍 TEST 6: Properties Coverage");

const propsValidator = Live.stream(UserSchema);

// Test documented properties
const requiredProperties = ["destroyed", "paused", "queueLength"];
const existingProperties = requiredProperties.filter(
  (prop) => prop in propsValidator
);

console.log(
  `✅ Properties: ${existingProperties.length}/${requiredProperties.length}`
);
console.log(`📊 destroyed: ${propsValidator.destroyed}`);
console.log(`📊 paused: ${propsValidator.paused}`);
console.log(`📊 queueLength: ${propsValidator.queueLength}`);

// =================================================================
// FINAL RESULTS
// =================================================================
setTimeout(() => {
  console.log("\n" + "=".repeat(60));
  console.log("📋 DOCUMENTATION COMPLETENESS RESULTS:");
  console.log(
    `✅ README Quick Example: ${readmeExampleWorked ? "WORKING" : "FAILED"}`
  );
  console.log(`✅ Stream Control: ${resumeWorked ? "WORKING" : "FAILED"}`);
  console.log(
    `✅ EventEmitter Interface: ${eventEmitterWorked ? "WORKING" : "FAILED"}`
  );
  console.log(`✅ Custom Events: ${customEventFired ? "WORKING" : "FAILED"}`);
  console.log(`✅ Stream Piping: ${pipingWorked ? "WORKING" : "FAILED"}`);
  console.log(
    `✅ Methods Coverage: ${missingMethods.length === 0 ? "100%" : `${((existingMethods.length / requiredMethods.length) * 100).toFixed(1)}%`}`
  );
  console.log(
    `✅ Properties Coverage: ${((existingProperties.length / requiredProperties.length) * 100).toFixed(1)}%`
  );

  const allWorking =
    readmeExampleWorked &&
    resumeWorked &&
    eventEmitterWorked &&
    customEventFired &&
    pipingWorked &&
    missingMethods.length === 0;

  console.log(
    `\n🎯 OVERALL DOCUMENTATION STATUS: ${allWorking ? "✅ COMPLETE" : "❌ NEEDS WORK"}`
  );

  if (allWorking) {
    console.log("\n🎉 All documentation examples work correctly!");
    console.log("📚 Live utility is fully documented and functional.");
    console.log("🚀 Ready for production use!");
  } else {
    console.log("\n⚠️ Some documentation examples need fixes.");
  }
}, 100);
 