import { Interface } from "./src/core/schema/mode/interfaces/Interface";

console.log("=== DEBUGGING VALIDATION FLOW ===\n");

// Create a simple test case to isolate the issue
const schema = Interface({
  strictBoolean: "when config.strict.$exists() *? boolean : =false",
}).allowUnknown();

const input = {
  config: { strict: true }, // This should make the condition TRUE
  strictBoolean: "true", // This should be REJECTED as wrong type
};

console.log("📥 Input:", JSON.stringify(input, null, 2));
console.log("Expected behavior:");
console.log("  1. config.strict.$exists() should return TRUE");
console.log("  2. Expected schema should be 'boolean'");
console.log("  3. User input 'true' (string) should be REJECTED");
console.log("  4. Validation should FAIL with type error");
console.log("\n" + "=".repeat(50));

const result = schema.safeParse(input);

console.log(`\n⏱️  Execution Time: ${performance.now()}ms`);

if (result.success) {
  console.log("⚠️  UNEXPECTED SUCCESS - This should have failed!");
  console.log("📤 Output:", JSON.stringify(result.data, null, 2));
  
  console.log("\n🔍 DETAILED ANALYSIS:");
  console.log(`Input strictBoolean: "${input.strictBoolean}" (${typeof input.strictBoolean})`);
  console.log(`Output strictBoolean: "${result.data.strictBoolean}" (${typeof result.data.strictBoolean})`);
  
  if (result.data.strictBoolean === false) {
    console.log("❌ BUG: System used DEFAULT value instead of validating input!");
    console.log("❌ This means the condition was evaluated as FALSE when it should be TRUE");
  } else if (result.data.strictBoolean === "true") {
    console.log("❌ BUG: System accepted string 'true' as boolean!");
    console.log("❌ This means type validation failed");
  } else if (result.data.strictBoolean === true) {
    console.log("❌ BUG: System coerced string 'true' to boolean true!");
    console.log("❌ This means type coercion occurred when it shouldn't");
  }
  
} else {
  console.log("✅ EXPECTED FAILURE");
  console.log("🚨 Errors:", result.errors);
  
  // Check if the error message is what we expect
  const expectedError = "Expected boolean, got string";
  const hasExpectedError = result.errors.some(error => error.includes(expectedError));
  
  if (hasExpectedError) {
    console.log("✅ Correct error message found");
  } else {
    console.log("⚠️  Unexpected error message");
  }
}

console.log("\n" + "=".repeat(50));
console.log("🔧 DEBUGGING CONCLUSION:");

if (result.success && result.data.strictBoolean === false) {
  console.log("❌ CRITICAL BUG: Conditional evaluation is returning FALSE when it should be TRUE");
  console.log("   The runtime property 'config.strict' exists but the condition is not being met");
  console.log("   This suggests a bug in the ConditionalEvaluator or field path resolution");
} else if (result.success && result.data.strictBoolean !== false) {
  console.log("❌ CRITICAL BUG: Type validation is not working correctly");
  console.log("   The condition is TRUE but type validation is not rejecting wrong types");
} else {
  console.log("✅ System is working correctly - rejecting invalid types as expected");
}
