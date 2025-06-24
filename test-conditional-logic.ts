import { Interface } from "./src/core/schema/mode/interfaces/Interface";

console.log("🔍 TESTING CONDITIONAL LOGIC - PROPER ANALYSIS\n");

const TestSchema = Interface({
  userId: "string",

  // These conditionals should compute values based on runtime properties
  hasApiKey: "when apiKey.$exists() *? boolean : =false",
  hasPermissions: "when permissions.$exists() *? boolean : =false",
  contextType: "when requestType.$exists() *? string : =unknown",
}).allowUnknown(); // Allow runtime properties in input data

console.log("Schema created successfully!\n");

// Test 1: Data WITHOUT runtime properties
console.log("=== TEST 1: No Runtime Properties ===");
const testData1 = {
  userId: "user123",
  hasApiKey: true, // This should be OVERRIDDEN to false
  hasPermissions: true, // This should be OVERRIDDEN to false
  contextType: "admin", // This should be OVERRIDDEN to "unknown"
};

console.log("Input:", JSON.stringify(testData1, null, 2));
console.log("\nExpected results:");
console.log(
  "- hasApiKey: false (apiKey.$exists() = false, use else value =false)"
);
console.log(
  "- hasPermissions: false (permissions.$exists() = false, use else value =false)"
);
console.log(
  "- contextType: 'unknown' (requestType.$exists() = false, use else value =unknown)"
);

const result1 = TestSchema.safeParse(testData1);
console.log("\nActual result:", result1.success ? "SUCCESS" : "FAILED");
if (result1.success) {
  console.log("Output:", JSON.stringify(result1.data, null, 2));

  // Analyze results
  console.log("\n🔍 ANALYSIS:");
  console.log(
    `hasApiKey: ${result1.data.hasApiKey} (expected: false) ${result1.data.hasApiKey === false ? "✅" : "❌"}`
  );
  console.log(
    `hasPermissions: ${result1.data.hasPermissions} (expected: false) ${result1.data.hasPermissions === false ? "✅" : "❌"}`
  );
  console.log(
    `contextType: "${result1.data.contextType}" (expected: "unknown") ${result1.data.contextType === "unknown" ? "✅" : "❌"}`
  );
} else {
  console.log("Errors:", result1.errors);
}

// Test 2: Data WITH runtime properties (simulate external context)
console.log("\n=== TEST 2: With Runtime Properties ===");
const testData2 = {
  userId: "user456",
  apiKey: "secret123", // This property exists
  permissions: ["read", "write"], // This property exists
  // requestType is missing
  hasApiKey: false, // This should be OVERRIDDEN to true
  hasPermissions: false, // This should be OVERRIDDEN to true
  contextType: "guest", // This should be OVERRIDDEN to "unknown"
};

console.log("Input:", JSON.stringify(testData2, null, 2));
console.log("\nExpected results:");
console.log(
  "- hasApiKey: true (apiKey.$exists() = true, use then value boolean)"
);
console.log(
  "- hasPermissions: true (permissions.$exists() = true, use then value boolean)"
);
console.log(
  "- contextType: 'unknown' (requestType.$exists() = false, use else value =unknown)"
);

const result2 = TestSchema.safeParse(testData2);
console.log("\nActual result:", result2.success ? "SUCCESS" : "FAILED");
if (result2.success) {
  console.log("Output:", JSON.stringify(result2.data, null, 2));

  // Analyze results
  console.log("\n🔍 ANALYSIS:");
  console.log(
    `hasApiKey: ${result2.data.hasApiKey} (expected: true) ${result2.data.hasApiKey === true ? "✅" : "❌"}`
  );
  console.log(
    `hasPermissions: ${result2.data.hasPermissions} (expected: true) ${result2.data.hasPermissions === true ? "✅" : "❌"}`
  );
  console.log(
    `contextType: "${result2.data.contextType}" (expected: "unknown") ${result2.data.contextType === "unknown" ? "✅" : "❌"}`
  );
} else {
  console.log("Errors:", result2.errors);
}

console.log("\n" + "=".repeat(60));
console.log("🎯 SUMMARY:");
console.log("If conditional logic is working correctly:");
console.log("- Input values should be OVERRIDDEN by conditional evaluation");
console.log("- Runtime methods should check actual data properties");
console.log("- Results should match expected values based on conditions");
console.log("=".repeat(60));
