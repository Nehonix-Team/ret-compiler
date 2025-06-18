/**
 * Test script for optimized interface validation
 * Verifies that optimizations don't break functionality
 */

import { Interface } from '../core/schema/mode/interfaces/Interface';

console.log('=== OPTIMIZATION TESTS ===\n');

// Test basic validation still works
const UserSchema = Interface({
  id: "positive",
  email: "email",
  name: "string(2,50)",
  age: "int(18,120)?",
  tags: "string[](1,5)?",
  status: "active|inactive|pending",
  role: "admin|user"
});

console.log('1. Basic Validation Test:');

const validUser = {
  id: 1,
  email: "test@example.com",
  name: "John Doe",
  age: 25,
  tags: ["developer", "typescript"],
  status: "active",
  role: "user"
};

const result1 = UserSchema.safeParse(validUser);
console.log('✅ Valid user:', result1.success ? 'PASSED' : 'FAILED');
if (!result1.success) {
  console.log('Errors:', result1.errors);
}

console.log('\n2. Invalid Data Test:');

const invalidUser = {
  id: -1, // Should fail - not positive
  email: "invalid-email", // Should fail - invalid format
  name: "J", // Should fail - too short
  status: "unknown", // Should fail - not in union
  role: "admin"
};

const result2 = UserSchema.safeParse(invalidUser);
console.log('❌ Invalid user:', result2.success ? 'FAILED' : 'PASSED');
console.log('Expected errors found:', result2.errors.length > 0 ? 'YES' : 'NO');

console.log('\n3. Performance Test:');

const iterations = 10000;
const startTime = performance.now();

for (let i = 0; i < iterations; i++) {
  UserSchema.safeParse(validUser);
}

const endTime = performance.now();
const totalTime = endTime - startTime;
const avgTime = totalTime / iterations;

console.log(`✅ Validated ${iterations} objects in ${totalTime.toFixed(2)}ms`);
console.log(`✅ Average time per validation: ${avgTime.toFixed(4)}ms`);
console.log(`✅ Operations per second: ${(iterations / (totalTime / 1000)).toFixed(0)}`);

console.log('\n4. Conditional Validation Test:');

const ConditionalSchema = Interface({
  role: "admin|user",
  permissions: "when role=admin *? string[] : string[]?"
});

const adminData = { role: "admin", permissions: ["read", "write"] };
const userData = { role: "user" };

const adminResult = ConditionalSchema.safeParse(adminData);
const userResult = ConditionalSchema.safeParse(userData);

console.log('✅ Admin with permissions:', adminResult.success ? 'PASSED' : 'FAILED');
console.log('✅ User without permissions:', userResult.success ? 'PASSED' : 'FAILED');

console.log('\n5. Array Validation Test:');

const ArraySchema = Interface({
  tags: "string[](1,3)",
  numbers: "int[]?"
});

const arrayData = {
  tags: ["tag1", "tag2"],
  numbers: [1, 2, 3]
};

const arrayResult = ArraySchema.safeParse(arrayData);
console.log('✅ Array validation:', arrayResult.success ? 'PASSED' : 'FAILED');

console.log('\nOptimization tests completed! 🎊');
