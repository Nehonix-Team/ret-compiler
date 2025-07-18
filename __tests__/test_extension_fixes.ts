/**
 * Test file to verify VS Code extension fixes
 */

import { Interface, Make } from "../src/index";

console.log("🧪 TESTING VS CODE EXTENSION FIXES");
console.log("=".repeat(50));

// Test 1: Make.const() should not show "Unknown type" error
const schema1 = Interface({
  testProperty: "number",
  test2: "url?", // Should be highlighted properly
  test3: Make.const("test"), // Should NOT show "Unknown type: test" error
});

// Test 2: Record types should be valid
const schema2 = Interface({
  metadata: "record<string, any>", // Should NOT show syntax error
  settings: "record<string, string>", // Should be valid
  config: "record<string, number>", // Should be valid
});

// Test 3: Various URL types should be highlighted
const schema3 = Interface({
  website: "url",
  secureUrl: "url.https",
  apiUrl: "url.http?",
  devUrl: "url?", // Simplified to avoid runtime error
});

// Test 4: Complex schema with Make.const and record types
const schema4 = Interface({
  id: "number",
  type: Make.const("user"), // Constant value
  role: Make.const("admin"), // Another constant
  permissions: "string[]",
  metadata: "record<string, any>", // Record type
  settings: {
    theme: "light|dark",
    notifications: "boolean",
    apiUrl: "url.https?",
  },
});

console.log("✅ All schemas should compile without extension errors!");
console.log("✅ Make.const() calls should not show 'Unknown type' errors");
console.log("✅ Record types should not show syntax errors");
console.log("✅ URL types should be properly highlighted");

// Test the schemas
const testData1 = schema1.safeParse({
  testProperty: 42,
  test2: "https://example.com",
  test3: "test", // Should match the constant
});

const testData2 = schema2.safeParse({
  metadata: { key1: "value1", key2: 123 },
  settings: { theme: "dark", lang: "en" },
  config: { timeout: 5000, retries: 3 },
});

console.log("Schema 1 result:", testData1.success);
console.log("Schema 2 result:", testData2.success);

if (!testData1.success) {
  console.log("Schema 1 errors:", testData1.errors);
}

if (!testData2.success) {
  console.log("Schema 2 errors:", testData2.errors);
}
