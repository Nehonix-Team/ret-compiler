import { Interface } from "./src/core/schema/mode/interfaces/Interface";

console.log("=== DEBUGGING WITHOUT OPTIMIZATION ===\n");

// Test the exact same schema structure but with skipOptimization
const schema = Interface({
  id: "string",
  strictBoolean: "when config.strict.$exists() *? boolean : =false",
  strictNumber: "when config.strict.$exists() *? number : =0",
  strictString: 'when config.strict.$exists() *? string : ="default"',
}, {
  skipOptimization: true  // ← DISABLE OPTIMIZATIONS
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
console.log("🔧 Testing with skipOptimization: true");
console.log("Expected: ALL validations should FAIL with type errors");
console.log("\n" + "=".repeat(50));

const result = schema.safeParse(input);

console.log(`\n⏱️  Execution Time: ${performance.now()}ms`);

if (result.success) {
  console.log("⚠️  UNEXPECTED SUCCESS - This should have failed!");
  console.log("📤 Output:", JSON.stringify(result.data, null, 2));
  
  console.log("\n🔍 ANALYSIS:");
  
  // Check if defaults were used (indicating FALSE conditions)
  const usedDefaults = 
    result.data.strictBoolean === false &&
    result.data.strictNumber === 0 &&
    result.data.strictString === "default";
  
  if (usedDefaults) {
    console.log("❌ BUG CONFIRMED: Even without optimization, conditions evaluate as FALSE");
    console.log("   This means the bug is in the core conditional evaluation logic");
  } else {
    console.log("✅ OPTIMIZATION WAS THE ISSUE: Without optimization, validation works differently");
  }
  
} else {
  console.log("✅ EXPECTED FAILURE - Validation working correctly!");
  console.log("🚨 Errors:", result.errors);
  console.log("✅ CONCLUSION: The bug was in the optimization logic!");
}

console.log("\n" + "=".repeat(50));

// Also test with a simpler schema to see complexity threshold
console.log("🔬 TESTING COMPLEXITY THRESHOLD:");

const simpleSchema = Interface({
  strictBoolean: "when config.strict.$exists() *? boolean : =false",
}).allowUnknown();

const simpleResult = simpleSchema.safeParse(input);

console.log(`Simple schema result: ${simpleResult.success ? 'SUCCESS' : 'FAILURE'}`);
if (simpleResult.success) {
  console.log(`Simple output: ${JSON.stringify(simpleResult.data)}`);
  if (simpleResult.data.strictBoolean === false) {
    console.log("❌ Even simple schema has the bug - not optimization related");
  } else {
    console.log("✅ Simple schema works - complexity threshold issue");
  }
}
