import { Interface } from "./src/core/schema/mode/interfaces/Interface";

console.log("=== DEBUGGING TYPE COERCION ===\n");

const schema = Interface({
  id: "string",
  strictBoolean: "when config.strict.$exists() *? boolean : =false",
  strictNumber: "when config.strict.$exists() *? number : =0",
  strictString: 'when config.strict.$exists() *? string : ="default"',
}).allowUnknown();

const input = {
  id: "coercion-test",
  config: { strict: true }, // This makes the runtime condition TRUE
  
  // These should be REJECTED because they're wrong types
  strictBoolean: "true", // String "true" should not become boolean true
  strictNumber: "123", // String "123" should not become number 123  
  strictString: 123, // Number 123 should not become string "123"
};

console.log("📥 Input:", JSON.stringify(input, null, 2));
console.log("\n🔧 Testing...");

const result = schema.safeParse(input);

console.log(`\n⏱️  Execution Time: ${performance.now()}ms`);

if (result.success) {
  console.log("⚠️  UNEXPECTED SUCCESS - This should have failed!");
  console.log("📤 Output:", JSON.stringify(result.data, null, 2));
  
  // Let's analyze what happened
  console.log("\n🔍 ANALYSIS:");
  console.log(`strictBoolean: input="${input.strictBoolean}" (${typeof input.strictBoolean}) → output="${result.data.strictBoolean}" (${typeof result.data.strictBoolean})`);
  console.log(`strictNumber: input="${input.strictNumber}" (${typeof input.strictNumber}) → output="${result.data.strictNumber}" (${typeof result.data.strictNumber})`);
  console.log(`strictString: input="${input.strictString}" (${typeof input.strictString}) → output="${result.data.strictString}" (${typeof result.data.strictString})`);
  
} else {
  console.log("✅ EXPECTED FAILURE");
  console.log("🚨 Errors:", result.errors);
}
