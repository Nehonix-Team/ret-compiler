// Fresh test to avoid any caching issues
import { Interface } from "../src/core/schema/mode/interfaces/Interface";

console.log("🔍 Fresh Test - Positive Validation");
console.log("===================================\n");

// Create a completely new schema
const TestSchema = Interface({
  number: "positive",
});

console.log("Schema created. Testing validation...");

// Test with negative number (should fail)
console.log("\nTest 1: Negative number -5 (should FAIL)");
const result1 = TestSchema.safeParse({ number: -5 });
console.log("Result:", result1.success ? "PASS ❌ BUG!" : "FAIL ✅ CORRECT");
if (!result1.success) {
  console.log("Errors:", result1.errors);
}

// Test with zero (should fail)
console.log("\nTest 2: Zero (should FAIL)");
const result2 = TestSchema.safeParse({ number: 0 });
console.log("Result:", result2.success ? "PASS ❌ BUG!" : "FAIL ✅ CORRECT");
if (!result2.success) {
  console.log("Errors:", result2.errors);
}

// Test with positive number (should pass)
console.log("\nTest 3: Positive number 5 (should PASS)");
const result3 = TestSchema.safeParse({ number: 5 });
console.log("Result:", result3.success ? "PASS ✅ CORRECT" : "FAIL ❌ BUG!");
if (!result3.success) {
  console.log("Errors:", result3.errors);
}

// Check schema properties
const internal = TestSchema as any;
console.log("\nSchema properties:");
console.log("- precompiledValidator:", !!internal.precompiledValidator);
console.log("- optimizationLevel:", internal.optimizationLevel);
