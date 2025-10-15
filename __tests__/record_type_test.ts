/**
 * Comprehensive tests for all the fixes and new features implemented
 * This file tests all the issues that were reported and fixed
 */

import { Interface, Make, Mod } from "../src/index";

console.log("🧪 COMPREHENSIVE TESTS FOR ReliantType FIXES");
console.log("=".repeat(60));

let passedTests = 0;
let totalTests = 0;

function test(name: string, testFn: () => boolean): void {
  totalTests++;
  try {
    const result = testFn();
    if (result) {
      console.log(`✅ ${name}`);
      passedTests++;
    } else {
      console.log(`❌ ${name}`);
    }
  } catch (error) {
    console.log(`❌ ${name} - Error: ${error.message}`);
  }
}

// ===== TEST 1: Make.unionOptional type inference =====
console.log("\n📋 Test Group 1: Make.unionOptional type inference");

test("Make.unionOptional creates proper union types", () => {
  const schema = Interface({
    theme: Make.unionOptional("light", "dark", "system"),
  });

  const result1 = schema.safeParse({ theme: "light" });
  const result2 = schema.safeParse({ theme: "dark" });
  const result3 = schema.safeParse({ theme: "system" });
  const result4 = schema.safeParse({}); // Should work (optional)
  const result5 = schema.safeParse({ theme: "invalid" }); // Should fail

  return (
    result1.success &&
    result2.success &&
    result3.success &&
    result4.success &&
    !result5.success
  );
});

// ===== TEST 2: Optional union with parentheses =====
console.log("\n📋 Test Group 2: Optional union with parentheses");

test("Parentheses syntax for optional unions works", () => {
  const schema = Interface({
    // @fortify-ignore
    status: "(pending | active | inactive)?",
  });

  const result1 = schema.safeParse({ status: "pending" });
  const result2 = schema.safeParse({ status: "active" });
  const result3 = schema.safeParse({}); // Should work (optional)
  const result4 = schema.safeParse({ status: "invalid" }); // Should fail

  return (
    result1.success && result2.success && result3.success && !result4.success
  );
});

// ===== TEST 3: Union type inference with spaces =====
console.log("\n📋 Test Group 3: Union type inference with spaces");

test("Union types with spaces are parsed correctly", () => {
  const schema = Interface({
    priority: "low | medium | high",
  });

  const result1 = schema.safeParse({ priority: "low" });
  const result2 = schema.safeParse({ priority: "medium" });
  const result3 = schema.safeParse({ priority: "high" });
  const result4 = schema.safeParse({ priority: "invalid" }); // Should fail

  return (
    result1.success && result2.success && result3.success && !result4.success
  );
});

// ===== TEST 4: Record type support =====
console.log("\n📋 Test Group 4: Record type support");

test("Record<string, any> types work correctly", () => {
  const schema = Interface(
    {
      metadata: "Record<string, any>",
    },
    { skipOptimization: true }
  ); // Force standard validation to test our fixes

  const result1 = schema.safeParse({
    metadata: { key1: "value1", key2: 123, key3: true },
  });
  const result2 = schema.safeParse({ metadata: "not an object" }); // Should fail

  return result1.success && !result2.success;
});

test("record<string, string> types work correctly", () => {
  const schema = Interface(
    {
      labels: "record<string, string>",
    },
    { skipOptimization: true }
  ); // Force standard validation to test our fixes

  const result1 = schema.safeParse({
    labels: { env: "production", version: "1.0.0" },
  });
  const result2 = schema.safeParse({
    labels: { env: "production", version: 123 }, // Should fail (number value)
  });

  return result1.success && !result2.success;
});

// ===== TEST 5: Unknown type validation =====
console.log("\n📋 Test Group 5: Unknown type validation");

test("Unknown types are properly rejected", () => {
  try {
    const schema = Interface({
      field: "unknownType",
    });
    return false; // Should not reach here
  } catch (error) {
    return error.message.includes("Invalid base type");
  }
});

// ===== TEST 6: Mod.omit method =====
console.log("\n📋 Test Group 6: Mod.omit method");

test("Mod.omit properly excludes fields", () => {
  const baseSchema = Interface({
    id: "number",
    name: "string",
    password: "string",
    email: "email",
  });

  const publicSchema = Mod.omit(baseSchema, ["password"]);

  const result1 = publicSchema.safeParse({
    id: 1,
    name: "John",
    email: "john@example.com",
  });

  const result2 = publicSchema.safeParse({
    id: 1,
    name: "John",
    email: "john@example.com",
    password: "should be ignored", // Should be silently ignored
  });

  return result1.success && result2.success;
});

// ===== TEST 7: Error path tracking =====
console.log("\n📋 Test Group 7: Error path tracking");

test("Nested validation errors have correct paths", () => {
  const schema = Interface(
    {
      user: {
        profile: {
          name: "string",
          age: "number",
        },
      },
    },
    { skipOptimization: true }
  ); // Force standard validation to test our fixes

  const result = schema.safeParse({
    user: {
      profile: {
        name: 123, // Wrong type
        age: "not a number", // Wrong type
      },
    },
  });

  if (result.success) return false;

  const nameError = result.errors.find(
    (e) =>
      e.path.length === 3 &&
      e.path[0] === "user" &&
      e.path[1] === "profile" &&
      e.path[2] === "name"
  );

  const ageError = result.errors.find(
    (e) =>
      e.path.length === 3 &&
      e.path[0] === "user" &&
      e.path[1] === "profile" &&
      e.path[2] === "age"
  );

  return nameError !== undefined && ageError !== undefined;
});

// ===== TEST 8: Date type validation =====
console.log("\n📋 Test Group 8: Date type validation");

test("Date objects are accepted", () => {
  const schema = Interface({
    createdAt: "date",
  });

  const result = schema.safeParse({
    createdAt: new Date(),
  });

  return result.success;
});

test("Date strings are accepted and converted", () => {
  const schema = Interface({
    createdAt: "date",
  });

  const result = schema.safeParse({
    createdAt: "2023-01-01",
  });

  return result.success && result.data?.createdAt instanceof Date;
});

// ===== TEST 9: Mod.makeOptional method =====
console.log("\n📋 Test Group 9: Mod.makeOptional method");

test("Mod.makeOptional makes string fields optional", () => {
  const schema = Interface({
    id: "number",
    name: "string",
    email: "email",
  });

  const flexibleSchema = Mod.makeOptional(schema, ["email"]);

  const result1 = flexibleSchema.safeParse({
    id: 1,
    name: "John",
    // email is now optional
  });

  const result2 = flexibleSchema.safeParse({
    id: 1,
    name: "John",
    email: "john@example.com",
  });

  return result1.success && result2.success;
});

test("Mod.makeOptional makes nested object fields optional", () => {
  const schema = Interface(
    {
      id: "number",
      name: "string",
      preferences: {
        theme: "light|dark",
        notifications: "boolean",
      },
    },
    { skipOptimization: true }
  ); // Force standard validation to test our fixes

  const flexibleSchema = Mod.makeOptional(schema, ["preferences"]);

  const result1 = flexibleSchema.safeParse({
    id: 1,
    name: "John",
    // preferences is now optional
  });

  const result2 = flexibleSchema.safeParse({
    id: 1,
    name: "John",
    preferences: {
      theme: "dark",
      notifications: true,
    },
  });

  return result1.success && result2.success;
});

// ===== SUMMARY =====
console.log("\n" + "=".repeat(60));
console.log(`📊 TEST SUMMARY: ${passedTests}/${totalTests} tests passed`);

if (passedTests === totalTests) {
  console.log("🎉 ALL TESTS PASSED! All issues have been successfully fixed.");
} else {
  console.log(
    `⚠️  ${totalTests - passedTests} test(s) failed. Some issues may need attention.`
  );
}

console.log("=".repeat(60));
