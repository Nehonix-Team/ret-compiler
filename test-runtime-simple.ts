import { Interface } from "./src/core/schema/mode/interfaces/Interface";

console.log("=== RUNTIME METHOD DEMONSTRATION ===\n");

// Runtime methods check for properties that may exist in runtime data
// but are NOT part of the validated schema output
const RuntimeSchema = Interface({
  // This field will be computed based on runtime data
  hasFields: "when fields.$exists() *? boolean : =false",
  hasEmail: "when email.$exists() *? boolean : =false",
});

console.log("Schema created successfully!");
console.log(
  "Note: Runtime methods check for properties that may exist in input data"
);
console.log("but are not part of the validated schema output.\n");

// Test 1: Provide only the schema-defined properties
const cleanData = {
  hasFields: true, // Will be validated against the conditional logic
  hasEmail: false, // Will be validated against the conditional logic
};

// Test 2: Simulate validation with runtime context
// In a real app, you might pass additional context to the validator
const dataWithContext = {
  hasFields: true, // Should be true because fields exists in context
  hasEmail: false, // Should be false because email doesn't exist in context
};

console.log("Test 1 - Clean data (no runtime properties):");
console.log("Input:", cleanData);
const result1 = RuntimeSchema.safeParse(cleanData);
console.log("Result:", result1.success ? "✅ SUCCESS" : "❌ FAILED");
if (result1.success) {
  console.log("Output:", result1.data);
} else {
  console.log("Errors:", result1.errors);
}

console.log("\nTest 2 - Data with context:");
console.log("Input:", dataWithContext);
const result2 = RuntimeSchema.safeParse(dataWithContext);
console.log("Result:", result2.success ? "✅ SUCCESS" : "❌ FAILED");
if (result2.success) {
  console.log("Output:", result2.data);
} else {
  console.log("Errors:", result2.errors);
}
