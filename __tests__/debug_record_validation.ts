/**
 * Debug record validation issue
 */

import { Interface } from "./src/index";

console.log("🔍 DEBUGGING RECORD VALIDATION");
console.log("=" .repeat(50));

// Test 1: Simple record validation
console.log("\n1. Testing simple record validation:");
const SimpleRecordSchema = Interface({
  rec: "record<string, number>"
});

const test1 = SimpleRecordSchema.safeParse({
  rec: {
    test: "ok"  // Should fail: string instead of number
  }
});

console.log("Test 1 result:", test1.success);
if (!test1.success) {
  console.log("Test 1 errors:", test1.errors);
} else {
  console.log("Test 1 data:", test1.data);
}

// Test 2: Record with correct data
console.log("\n2. Testing record with correct data:");
const test2 = SimpleRecordSchema.safeParse({
  rec: {
    test: 123  // Should pass: number value
  }
});

console.log("Test 2 result:", test2.success);
if (!test2.success) {
  console.log("Test 2 errors:", test2.errors);
} else {
  console.log("Test 2 data:", test2.data);
}

// Test 3: Mixed schema (like the original)
console.log("\n3. Testing mixed schema:");
const MixedSchema = Interface({
  testProperty: "number?",
  test2: "url?", 
  rec: "record<string, number>"
});

const test3 = MixedSchema.safeParse({
  rec: {
    test: "ok"  // Should fail
  }
});

console.log("Test 3 result:", test3.success);
if (!test3.success) {
  console.log("Test 3 errors:", test3.errors);
} else {
  console.log("Test 3 data:", test3.data);
}

// Test 4: Missing required record field
console.log("\n4. Testing missing required record field:");
const test4 = MixedSchema.safeParse({
  testProperty: 123
  // rec is missing - should fail
});

console.log("Test 4 result:", test4.success);
if (!test4.success) {
  console.log("Test 4 errors:", test4.errors);
} else {
  console.log("Test 4 data:", test4.data);
}

console.log("\n" + "=" .repeat(50));
