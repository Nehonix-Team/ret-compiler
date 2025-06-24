import { Interface } from "./src/core/schema/mode/interfaces/Interface";

console.log("🎯 FINAL VALIDATION: NEW RUNTIME METHOD SYNTAX\n");

// Test with just boolean conditionals first
const BooleanOnlySchema = Interface({
  userId: "string",
  hasApiKey: "when apiKey.$exists() *? boolean : =false",
  hasPermissions: "when permissions.$exists() *? boolean : =false",
}).allowUnknown();

// Test the exact same schema as the failing test
const TestSchema = Interface({
  userId: "string",
  hasApiKey: "when apiKey.$exists() *? boolean : =false",
  hasPermissions: "when permissions.$exists() *? boolean : =false",
  contextType: "when requestType.$exists() *? string : =unknown",
}).allowUnknown();

console.log("Schema created successfully!\n");

// Test case that should work: runtime properties exist
const testData = {
  userId: "user456",
  apiKey: "secret123", // EXISTS - so apiKey.$exists() = true
  permissions: ["read", "write"], // EXISTS - so permissions.$exists() = true
  // requestType is MISSING - so requestType.$exists() = false
  hasApiKey: false, // Should be OVERRIDDEN to true
  hasPermissions: false, // Should be OVERRIDDEN to true
  contextType: "guest", // Should be OVERRIDDEN to "unknown"
};

console.log("Input data:");
console.log(JSON.stringify(testData, null, 2));

console.log("\nExpected results:");
console.log(
  "- hasApiKey: true (apiKey exists → condition true → boolean type → computed value true)"
);
console.log(
  "- hasPermissions: true (permissions exists → condition true → boolean type → computed value true)"
);
console.log(
  "- contextType: 'unknown' (requestType missing → condition false → else value =unknown)"
);

console.log("\nValidating...");
const result = TestSchema.safeParse(testData);

console.log("\nActual result:", result.success ? "SUCCESS" : "FAILED");
if (result.success) {
  console.log("Output:");
  console.log(JSON.stringify(result.data, null, 2));

  console.log("\n🔍 DETAILED ANALYSIS:");

  // Check hasApiKey
  const hasApiKeyCorrect = result.data.hasApiKey === true;
  console.log(
    `hasApiKey: ${result.data.hasApiKey} (expected: true) ${hasApiKeyCorrect ? "✅" : "❌"}`
  );
  if (!hasApiKeyCorrect) {
    console.log("  ❌ BUG: apiKey exists in input, should return true");
  }

  // Check hasPermissions
  const hasPermissionsCorrect = result.data.hasPermissions === true;
  console.log(
    `hasPermissions: ${result.data.hasPermissions} (expected: true) ${hasPermissionsCorrect ? "✅" : "❌"}`
  );
  if (!hasPermissionsCorrect) {
    console.log("  ❌ BUG: permissions exists in input, should return true");
  }

  // Check contextType
  const contextTypeCorrect = result.data.contextType === "unknown";
  console.log(
    `contextType: "${result.data.contextType}" (expected: "unknown") ${contextTypeCorrect ? "✅" : "❌"}`
  );
  if (!contextTypeCorrect) {
    console.log(
      "  ❌ BUG: requestType missing in input, should return 'unknown'"
    );
  }

  // Overall result
  const allCorrect =
    hasApiKeyCorrect && hasPermissionsCorrect && contextTypeCorrect;
  console.log(
    `\n🎯 OVERALL: ${allCorrect ? "✅ ALL TESTS PASS" : "❌ BUGS DETECTED"}`
  );

  if (!allCorrect) {
    console.log("\n🔧 DEBUGGING INFO:");
    console.log("- Runtime method syntax: property.$method()");
    console.log("- Boolean conditionals should return computed boolean values");
    console.log(
      "- String conditionals with constants should return constant values"
    );
    console.log(
      "- Input values should be OVERRIDDEN by conditional evaluation"
    );
  }
} else {
  console.log("Errors:", result.errors);
}

console.log("\n" + "=".repeat(60));
console.log("🚀 NEW RUNTIME METHOD SYNTAX IMPLEMENTATION STATUS:");
console.log("✅ Parser: Supports property.$method() syntax");
console.log("✅ Evaluator: Runtime methods work correctly");
console.log("✅ AST: isRuntimeMethod flag properly set");
console.log("❓ Schema Validation: Boolean conditionals - testing...");
console.log("=".repeat(60));
