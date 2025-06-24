import { Interface } from "./src/core/schema/mode/interfaces/Interface";

console.log("🧪 SIMPLE RUNTIME METHOD TEST");
console.log("Testing basic runtime method syntax");
console.log("=" + "=".repeat(50));

// Simple test data
const testData = {
  id: "simple-test",
  config: {
    hasFeature: true,
    "special-key": true,
  },
};

// Test basic .$exists() method
const SimpleSchema = Interface({
  id: "string",
  
  // Test basic .$exists() method
  existsTest: "when config.hasFeature.$exists() *? boolean : =false",
  
  // Test bracket notation
  bracketTest: 'when config["special-key"].$exists() *? boolean : =false',
  
}).allowUnknown();

console.log("\n📥 Input Data:");
console.log(JSON.stringify(testData, null, 2));

console.log("\n🔬 Running Test...");

try {
  const result = SimpleSchema.safeParse(testData);
  
  if (result.success) {
    console.log("\n✅ SUCCESS!");
    console.log("📤 Output Data:");
    console.log(JSON.stringify(result.data, null, 2));
  } else {
    console.log("\n❌ FAILED!");
    console.log("🚨 Errors:");
    result.errors.forEach(error => console.log(`   - ${error}`));
  }
} catch (error: any) {
  console.log("\n💥 EXCEPTION:");
  console.log(`   ${error.message}`);
}
 