import { Interface } from "./src/core/schema/mode/interfaces/Interface";

console.log("=== UNDERSTANDING CONDITIONAL BEHAVIOR ===\n");

// Test with equality-based conditional (known to work)
const EqualitySchema = Interface({
  accountType: "free|premium",
  maxProjects: "when accountType=free *? int(1,3) : int(1,10)",
});

console.log("🔍 Testing equality-based conditional:");
console.log("Schema: maxProjects: 'when accountType=free *? int(1,3) : int(1,10)'");

const testData1 = {
  accountType: "free",
  maxProjects: 2, // Should be valid (1-3 range)
};

const testData2 = {
  accountType: "premium", 
  maxProjects: 5, // Should be valid (1-10 range)
};

console.log("\nTest 1 - Free account:");
console.log("Input:", testData1);
const result1 = EqualitySchema.safeParse(testData1);
console.log("Result:", result1.success ? "✅ Valid" : "❌ Invalid", result1);

console.log("\nTest 2 - Premium account:");
console.log("Input:", testData2);
const result2 = EqualitySchema.safeParse(testData2);
console.log("Result:", result2.success ? "✅ Valid" : "❌ Invalid", result2);

// Now test with runtime method
console.log("\n" + "=".repeat(50));
console.log("🔍 Testing runtime method conditional:");

const RuntimeSchema = Interface({
  hasFields: "when fields.$exists() *? boolean : =false",
});

console.log("Schema: hasFields: 'when fields.$exists() *? boolean : =false'");

const testData3 = {
  fields: ["a", "b"],
  hasFields: true, // Should be valid boolean
};

const testData4 = {
  // No fields property
  hasFields: false, // Should be valid (default value)
};

console.log("\nTest 3 - With fields:");
console.log("Input:", testData3);
const result3 = RuntimeSchema.safeParse(testData3);
console.log("Result:", result3.success ? "✅ Valid" : "❌ Invalid", result3);

console.log("\nTest 4 - Without fields:");
console.log("Input:", testData4);
const result4 = RuntimeSchema.safeParse(testData4);
console.log("Result:", result4.success ? "✅ Valid" : "❌ Invalid", result4);
