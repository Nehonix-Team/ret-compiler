import { Interface } from "./src/core/schema/mode/interfaces/Interface";

console.log("🔍 DEBUGGING SCHEMA VALIDATION FLOW\n");

const TestSchema = Interface({
  userId: "string",
  hasApiKey: "when apiKey.$exists() *? boolean : =false",
}).allowUnknown(); // Allow unknown properties for runtime method testing

console.log("Schema created successfully!\n");

const testData = {
  userId: "user456",
  apiKey: "secret123", // Runtime property that exists
  hasApiKey: false, // This should be overridden to true
};

console.log("Input:", JSON.stringify(testData, null, 2));
console.log("Validating...\n");

const result = TestSchema.safeParse(testData);

console.log("Result:", result.success ? "SUCCESS" : "FAILED");
if (result.success) {
  console.log("Output:", JSON.stringify(result.data, null, 2));
  console.log("\n🔍 ANALYSIS:");
  console.log(
    `hasApiKey: ${result.data?.hasApiKey} (expected: true) ${result.data?.hasApiKey === true ? "✅" : "❌"}`
  );
} else {
  console.log("Errors:", result.errors);
}
