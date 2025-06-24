import { Interface } from "./src/core/schema/mode/interfaces/Interface";

console.log("=== DEBUGGING MULTI-FIELD CONDITIONAL ===\n");

// Test the exact same schema structure as the edge case test
const schema = Interface({
  id: "string",
  strictBoolean: "when config.strict.$exists() *? boolean : =false",
  strictNumber: "when config.strict.$exists() *? number : =0",
  strictString: 'when config.strict.$exists() *? string : ="default"',
}).allowUnknown();

const input = {
  id: "coercion-test",
  config: { strict: true }, // This should make ALL conditions TRUE
  
  // These should ALL be REJECTED because they're wrong types
  strictBoolean: "true", // String "true" should not become boolean true
  strictNumber: "123", // String "123" should not become number 123  
  strictString: 123, // Number 123 should not become string "123"
};

console.log("📥 Input:", JSON.stringify(input, null, 2));
console.log("Expected behavior:");
console.log("  1. config.strict.$exists() should return TRUE for ALL fields");
console.log("  2. ALL fields should validate user input against expected types");
console.log("  3. ALL validations should FAIL with type errors");
console.log("\n" + "=".repeat(50));

const result = schema.safeParse(input);

console.log(`\n⏱️  Execution Time: ${performance.now()}ms`);

if (result.success) {
  console.log("⚠️  UNEXPECTED SUCCESS - This should have failed!");
  console.log("📤 Output:", JSON.stringify(result.data, null, 2));
  
  console.log("\n🔍 FIELD-BY-FIELD ANALYSIS:");
  
  // Check each field
  const fields = ['strictBoolean', 'strictNumber', 'strictString'];
  const expectedTypes = ['boolean', 'number', 'string'];
  const defaultValues = [false, 0, 'default'];
  
  fields.forEach((field, index) => {
    const inputValue = input[field];
    const outputValue = result.data[field];
    const expectedType = expectedTypes[index];
    const defaultValue = defaultValues[index];
    
    console.log(`\n  📊 ${field}:`);
    console.log(`     Input: "${inputValue}" (${typeof inputValue})`);
    console.log(`     Output: "${outputValue}" (${typeof outputValue})`);
    console.log(`     Expected Type: ${expectedType}`);
    console.log(`     Default Value: ${defaultValue}`);
    
    if (outputValue === defaultValue) {
      console.log(`     ❌ BUG: Used default value - condition evaluated as FALSE`);
    } else if (typeof outputValue === expectedType && outputValue === inputValue) {
      console.log(`     ❌ BUG: Accepted wrong type without validation`);
    } else if (typeof outputValue === expectedType && outputValue !== inputValue) {
      console.log(`     ❌ BUG: Type coercion occurred`);
    } else {
      console.log(`     ✅ Behavior unclear - needs investigation`);
    }
  });
  
} else {
  console.log("✅ EXPECTED FAILURE");
  console.log("🚨 Errors:", result.errors);
  
  // Analyze which fields failed
  const errorFields = result.errors.map(error => {
    const match = error.match(/^(\w+):/);
    return match ? match[1] : 'unknown';
  });
  
  console.log("Failed fields:", errorFields);
}

console.log("\n" + "=".repeat(50));
console.log("🔧 DEBUGGING CONCLUSION:");

if (result.success) {
  console.log("❌ CRITICAL BUG: Multi-field conditional validation is not working");
  console.log("   This suggests an issue with field compilation or optimization");
} else {
  console.log("✅ Multi-field conditional validation is working correctly");
}
