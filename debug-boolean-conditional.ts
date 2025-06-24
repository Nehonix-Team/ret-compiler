import { Interface } from "./src/core/schema/mode/interfaces/Interface";

console.log("🔍 DEBUGGING BOOLEAN CONDITIONAL SPECIFICALLY\n");

const TestSchema = Interface({
  userId: "string",
  hasApiKey: "when apiKey.$exists() *? boolean : =false",
  hasPermissions: "when permissions.$exists() *? boolean : =false",
}).allowUnknown();

console.log("Schema created successfully!\n");

const testData = {
  userId: "user456",
  apiKey: "secret123", // This exists
  permissions: ["read", "write"], // This exists
  hasApiKey: false, // Should be overridden to true
  hasPermissions: false, // Should be overridden to true
};

console.log("Input:", JSON.stringify(testData, null, 2));
console.log(
  "Expected: hasApiKey should be TRUE (apiKey exists, condition true, return boolean value)"
);
console.log("Validating...\n");

const result = TestSchema.safeParse(testData);

console.log("Result:", result.success ? "SUCCESS" : "FAILED");
if (result.success) {
  console.log("Output:", JSON.stringify(result.data, null, 2));
  console.log("\n🔍 ANALYSIS:");
  console.log(
    `hasApiKey: ${result.data.hasApiKey} (expected: true) ${result.data.hasApiKey === true ? "✅" : "❌"}`
  );

  if (result.data.hasApiKey !== true) {
    console.log("\n❌ BUG DETECTED:");
    console.log("- apiKey exists in input data");
    console.log("- apiKey.$exists() should return true");
    console.log("- Condition true, so should use 'boolean' type");
    console.log(
      "- For boolean conditional, should return the condition result (true)"
    );
    console.log("- But got:", result.data.hasApiKey);
  }
} else {
  console.log("Errors:", result.errors);
}
