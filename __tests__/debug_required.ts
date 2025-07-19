import { Interface } from "../src/index";
import { ConstraintParser } from "../src/core/schema/mode/interfaces/validators/ConstraintParser";

console.log("🔍 Debugging Required Field Validation");

// Test 1: Check if ConstraintParser correctly parses required fields
console.log("\n=== ConstraintParser Test ===");
const stringRequiredParsed = ConstraintParser.parseConstraints("string!");
const numberRequiredParsed = ConstraintParser.parseConstraints("number!");
const stringOptionalParsed = ConstraintParser.parseConstraints("string?");

console.log("string! parsed:", stringRequiredParsed);
console.log("number! parsed:", numberRequiredParsed);
console.log("string? parsed:", stringOptionalParsed);

// Test 2: Test schema validation
console.log("\n=== Schema Validation Test ===");
const testSchema = Interface({
  requiredString: "string!",
  requiredNumber: "number!",
  normalString: "string",
  normalNumber: "number",
});

// Test with empty string (should fail for required field)
console.log("\n--- Test: Empty required string ---");
const emptyStringResult = testSchema.safeParse({
  requiredString: "",  // Should fail
  requiredNumber: 5,
  normalString: "",    // Should pass
  normalNumber: 0,     // Should pass
});

if (!emptyStringResult.success) {
  console.log("❌ Failed (expected):", emptyStringResult.errors[0]?.message);
} else {
  console.log("❌ Unexpectedly passed:", emptyStringResult.data);
}

// Test with zero required number (should fail for required field)
console.log("\n--- Test: Zero required number ---");
const zeroNumberResult = testSchema.safeParse({
  requiredString: "hello",
  requiredNumber: 0,   // Should fail
  normalString: "",
  normalNumber: 0,
});

if (!zeroNumberResult.success) {
  console.log("❌ Failed (expected):", zeroNumberResult.errors[0]?.message);
} else {
  console.log("❌ Unexpectedly passed:", zeroNumberResult.data);
}

// Test with valid values (should pass)
console.log("\n--- Test: Valid values ---");
const validResult = testSchema.safeParse({
  requiredString: "hello",
  requiredNumber: 5,
  normalString: "",
  normalNumber: 0,
});

if (!validResult.success) {
  console.log("❌ Unexpectedly failed:", validResult.errors[0]?.message);
} else {
  console.log("✅ Passed:", validResult.data);
}
