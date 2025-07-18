/**
 * Test the improved error messages and type safety
 */

import { Interface, Mod } from "../src/index";

console.log("🧪 TESTING ERROR MESSAGE AND TYPE SAFETY IMPROVEMENTS");
console.log("=".repeat(60));

// ===== TEST 1: Improved error messages with field paths =====
console.log("\n1. Testing improved error messages with field paths");

const UserSchema = Interface(
  {
    id: "number",
    name: "string",
    profile: {
      age: "number",
      email: "email",
      preferences: {
        theme: "light|dark",
        notifications: "boolean",
      },
    },
  },
  { skipOptimization: true }
); // Force standard validation to test our fixes

// Test with wrong types at different nesting levels
const testData = {
  id: "not a number", // Wrong type at root level
  name: "John", // Correct
  profile: {
    age: "not a number", // Wrong type at nested level
    email: "invalid-email", // Wrong format at nested level
    preferences: {
      theme: "invalid-theme", // Wrong union value at deep nested level
      notifications: "not a boolean", // Wrong type at deep nested level
    },
  },
};

const result = UserSchema.safeParse(testData);

console.log("Validation result:", result.success);
if (!result.success) {
  console.log("\nImproved error messages:");
  result.errors.forEach((error, index) => {
    console.log(`${index + 1}. Path: [${error.path.join(" → ")}]`);
    console.log(`   Message: ${error.message}`);
    console.log(`   Expected: ${error.expected}`);
    console.log(`   Received Type: ${error.receivedType}`);
    console.log("");
  });
}

// ===== TEST 2: Type safety improvements =====
console.log("\n2. Testing type safety improvements in Mod utilities");

try {
  const BaseSchema = Interface({
    id: "number",
    name: "string",
    email: "email?",
  });

  // Test makeOptional with improved type safety
  const FlexibleSchema = Mod.makeOptional(BaseSchema, ["email"]);

  const testResult = FlexibleSchema.safeParse({
    id: 1,
    name: "John",
    // email is optional
  });

  console.log(
    "✅ Mod.makeOptional works with improved type safety:",
    testResult.success
  );

  // Test with wrong type to see improved error message
  const errorResult = FlexibleSchema.safeParse({
    id: "wrong type",
    name: "John",
  });

  if (!errorResult.success) {
    console.log("✅ Error message with field path:");
    errorResult.errors.forEach((error) => {
      console.log(`   ${error.message}`);
    });
  }
} catch (error) {
  console.log("❌ Type safety test failed:", error.message);
}

// ===== TEST 3: Nested object error paths =====
console.log("\n3. Testing nested object error paths");

const NestedSchema = Interface(
  {
    user: {
      profile: {
        personal: {
          name: "string",
          age: "number",
        },
        contact: {
          email: "email",
          phone: "string",
        },
      },
    },
  },
  { skipOptimization: true }
);

const deepNestedTest = NestedSchema.safeParse({
  user: {
    profile: {
      personal: {
        name: 123, // Wrong type at deep level
        age: "not a number", // Wrong type at deep level
      },
      contact: {
        email: "invalid", // Wrong format at deep level
        phone: true, // Wrong type at deep level
      },
    },
  },
});

if (!deepNestedTest.success) {
  console.log("✅ Deep nested error paths:");
  deepNestedTest.errors.forEach((error, index) => {
    console.log(`${index + 1}. Path: [${error.path.join(" → ")}]`);
    console.log(`   Message: ${error.message}`);
    console.log("");
  });
}

console.log("=".repeat(60));
console.log("🎉 Error message and type safety improvements tested!");
console.log("=".repeat(60));
