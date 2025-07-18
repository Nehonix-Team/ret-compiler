/**
 * Debug field processing to understand why record fields are being ignored
 */

import { Interface } from "./src/index";

console.log("🔍 DEBUGGING FIELD PROCESSING");
console.log("=" .repeat(50));

// Test with detailed logging
const schema = Interface({
  normalField: "string",
  recordField: "record<string, number>"
}, { skipOptimization: true }); // Force standard validation

console.log("Schema definition:", schema.definition);

const testData = {
  normalField: "test",
  recordField: {
    key1: 123,
    key2: "invalid"  // Should fail
  }
};

console.log("Test data:", testData);

const result = schema.safeParse(testData);

console.log("Validation result:", result.success);
console.log("Validated data:", result.data);

if (!result.success) {
  console.log("Errors:", result.errors);
}

// Test with missing record field
console.log("\n--- Testing missing record field ---");
const result2 = schema.safeParse({
  normalField: "test"
  // recordField is missing
});

console.log("Result 2:", result2.success);
console.log("Data 2:", result2.data);
if (!result2.success) {
  console.log("Errors 2:", result2.errors);
}
