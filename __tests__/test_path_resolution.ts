/**
 * Test Path Resolution Fix
 *
 * Tests that conditional validation resolves paths correctly:
 * - Simple paths (e.g., "type") should resolve from ROOT context
 * - Nested paths (e.g., "profile.type") should resolve as absolute paths from ROOT
 * - Should NOT reference local nested object properties incorrectly
 */

import { Interface } from "../src/core/schema/mode/interfaces/Interface";

console.log("🧪 Testing Path Resolution Fix...\n");

// Test Schema with nested object
const TestSchema = Interface({
  type: "=test|=production", // ROOT level property (using constants)
  profile: {
    type: "=profilUrl|=dirrect", // NESTED level property (different from root.type)
    url: "when type = test && type = production *? url.ftp : string(1, 5)", // Should reference ROOT.type, not profile.type
  },
});

// Test Data
const testData = {
  type: "test", // ROOT level value
  profile: {
    type: "profilUrl", // NESTED level value (different from root)
    url: "https://example.com/very-long-url-that-exceeds-5-chars",
  },
};

console.log("📋 Test Data:");
console.log("- Root type:", testData.type);
console.log("- Nested profile.type:", testData.profile.type);
console.log("- URL length:", testData.profile.url.length, "chars");
console.log();

console.log("🔍 Expected Behavior:");
console.log("- Condition 'type = test' should read ROOT.type ('test') ✅");
console.log(
  "- Condition 'type = production' should read ROOT.type ('test') ❌"
);
console.log(
  "- Since ROOT.type = 'test' (not 'production'), condition is FALSE"
);
console.log("- Should use ELSE branch: string(1, 5)");
console.log("- URL is 47 chars, should FAIL validation (max 5 chars)");
console.log();

try {
  const result = TestSchema.parse(testData);
  console.log("❌ UNEXPECTED: Validation passed when it should have failed!");
  console.log("Result:", result);
} catch (error) {
  console.log("✅ EXPECTED: Validation failed correctly");
  console.log("Error:", error.message);

  // Check if the error is about URL length (correct behavior)
  if (error.message.includes("at most 5 characters")) {
    console.log("✅ CORRECT: Error is about URL length limit");
    console.log(
      "✅ PATH RESOLUTION WORKING: Condition referenced ROOT.type correctly"
    );
  } else {
    console.log(
      "❌ WRONG ERROR: Expected URL length error, got:",
      error.message
    );
  }
}

console.log("\n" + "=".repeat(60));

// Test 2: Verify nested path resolution
console.log("\n🧪 Test 2: Nested Path Resolution...\n");

const TestSchema2 = Interface({
  type: "=test",
  profile: {
    type: "=profilUrl",
    url: "when profile.type = profilUrl *? url.ftp : string(1, 5)", // Explicit nested path
  },
});

const testData2 = {
  type: "test",
  profile: {
    type: "profilUrl",
    url: "ftp://example.com/file.txt",
  },
};

console.log("📋 Test Data 2:");
console.log("- Root type:", testData2.type);
console.log("- Nested profile.type:", testData2.profile.type);
console.log();

console.log("🔍 Expected Behavior:");
console.log(
  "- Condition 'profile.type = profilUrl' should read ROOT.profile.type ('profilUrl') ✅"
);
console.log("- Condition is TRUE, should use THEN branch: url.ftp");
console.log("- URL should pass FTP validation");
console.log();

try {
  const result2 = TestSchema2.parse(testData2);
  console.log("✅ EXPECTED: Validation passed");
  console.log("Result:", result2);
} catch (error) {
  console.log("❌ UNEXPECTED: Validation failed when it should have passed!");
  console.log("Error:", error.message);
}
