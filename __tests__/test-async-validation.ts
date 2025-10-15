/**
 * Test script for async validation methods
 * Demonstrates the new parseAsync, safeParseAsync, and safeParseUnknownAsync methods
 */

import { Interface } from "../core/schema/mode/interfaces/Interface";

console.log("=== ReliantType ASYNC VALIDATION TESTS ===\n");

// Define a test schema
const UserSchema = Interface({
  id: "uuid",
  email: "email",
  name: "string(2,50)",
  age: "number(0,120)?",
  isActive: "boolean",
});

// Test data
const validUser = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  email: "john@example.com",
  name: "John Doe",
  age: 30,
  isActive: true,
};

const invalidUser = {
  id: "invalid-uuid",
  email: "not-an-email",
  name: "J", // Too short
  age: -5, // Invalid age
  isActive: "maybe", // Invalid boolean
};

// ===== ASYNC PARSE TESTS =====
console.log("1. Testing parseAsync (throws on error):");

async function testParseAsync() {
  try {
    console.log("Testing valid data...");
    const result = await UserSchema.parseAsync(validUser);
    console.log("✅ parseAsync with valid data:", result);
  } catch (error) {
    console.log("❌ parseAsync failed:", error.message);
  }

  try {
    console.log("\nTesting invalid data...");
    const result = await UserSchema.parseAsync(invalidUser);
    console.log("✅ parseAsync with invalid data (unexpected):", result);
  } catch (error) {
    console.log("✅ parseAsync correctly threw error:", error.message);
  }
}

// ===== SAFE PARSE ASYNC TESTS =====
console.log("\n2. Testing safeParseAsync (never throws):");

async function testSafeParseAsync() {
  console.log("Testing valid data...");
  const validResult = await UserSchema.safeParseAsync(validUser);
  if (validResult.success) {
    console.log("✅ safeParseAsync with valid data:", validResult.data);
  } else {
    console.log("❌ safeParseAsync failed unexpectedly:", validResult.errors);
  }

  console.log("\nTesting invalid data...");
  const invalidResult = await UserSchema.safeParseAsync(invalidUser);
  if (invalidResult.success) {
    console.log("❌ safeParseAsync should have failed:", invalidResult.data);
  } else {
    console.log("✅ safeParseAsync correctly failed:", invalidResult.errors);
  }
}

// ===== SAFE PARSE UNKNOWN ASYNC TESTS =====
console.log("\n3. Testing safeParseUnknownAsync (accepts any input):");

async function testSafeParseUnknownAsync() {
  const unknownData = "this is not an object";
  
  console.log("Testing with string input...");
  const result = await UserSchema.safeParseUnknownAsync(unknownData);
  if (result.success) {
    console.log("❌ safeParseUnknownAsync should have failed:", result.data);
  } else {
    console.log("✅ safeParseUnknownAsync correctly failed:", result.errors);
  }

  console.log("\nTesting with valid object...");
  const validResult = await UserSchema.safeParseUnknownAsync(validUser);
  if (validResult.success) {
    console.log("✅ safeParseUnknownAsync with valid data:", validResult.data);
  } else {
    console.log("❌ safeParseUnknownAsync failed unexpectedly:", validResult.errors);
  }
}

// ===== BATCH ASYNC VALIDATION =====
console.log("\n4. Testing batch async validation:");

async function testBatchAsync() {
  const users = [validUser, invalidUser, validUser];
  
  console.log("Testing batch validation...");
  const results = await Promise.all(
    users.map((user) => UserSchema.safeParseAsync(user))
  );
  
  results.forEach((result, index) => {
    if (result.success) {
      console.log(`✅ User ${index + 1} valid:`, result.data?.name);
    } else {
      console.log(`❌ User ${index + 1} invalid:`, result.errors[0]);
    }
  });
}

// ===== PERFORMANCE COMPARISON =====
console.log("\n5. Performance comparison (sync vs async):");

async function testPerformance() {
  const iterations = 1000;
  const testData = validUser;

  // Test sync performance
  console.log(`Testing sync validation (${iterations} iterations)...`);
  const syncStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    UserSchema.safeParse(testData);
  }
  const syncEnd = performance.now();
  const syncTime = syncEnd - syncStart;

  // Test async performance
  console.log(`Testing async validation (${iterations} iterations)...`);
  const asyncStart = performance.now();
  const asyncPromises = [];
  for (let i = 0; i < iterations; i++) {
    asyncPromises.push(UserSchema.safeParseAsync(testData));
  }
  await Promise.all(asyncPromises);
  const asyncEnd = performance.now();
  const asyncTime = asyncEnd - asyncStart;

  console.log(`📊 Performance Results:`);
  console.log(`   Sync:  ${syncTime.toFixed(2)}ms (${(syncTime / iterations).toFixed(4)}ms per validation)`);
  console.log(`   Async: ${asyncTime.toFixed(2)}ms (${(asyncTime / iterations).toFixed(4)}ms per validation)`);
  console.log(`   Ratio: ${(asyncTime / syncTime).toFixed(2)}x slower (expected due to Promise overhead)`);
}

// Run all tests
async function runAllTests() {
  await testParseAsync();
  await testSafeParseAsync();
  await testSafeParseUnknownAsync();
  await testBatchAsync();
  await testPerformance();
  
  console.log("\n🎉 All async validation tests completed!");
}

// Execute tests
runAllTests().catch(console.error);
