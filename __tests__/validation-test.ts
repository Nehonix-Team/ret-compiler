// Test file to validate generated schemas with actual ReliantType
import { Interface } from 'reliant-type';

// Import all generated schemas
import { AllFormatTypesSchema } from './all-format-types';
import { AllTypesSchema } from './all-types';
import { LiteralValuesSchema } from './test-literals';
import { OptionalTestSchema } from './debug-optional';

console.log('🧪 Testing ReliantType Schema Validation\n');

// Test 1: Basic Types
console.log('Test 1: All Format Types');
const formatTest = AllFormatTypesSchema.safeParse({
  name: "John Doe",
  age: 30,
  active: true,
  created: new Date(),
  data: { foo: "bar" },
  obj: {},
  unknown: "anything",
  email: "test@example.com",
  website: "https://example.com",
  id: "550e8400-e29b-41d4-a716-446655440000",
  mobile: "+1234567890",
  server: "192.168.1.1",
  config: '{"key":"value"}',
  color: "#FF5733",
  encoded: "SGVsbG8gV29ybGQ=",
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U",
  version: "1.0.0",
  urlSlug: "my-test-slug",
  description: "A long text description",
  userPassword: "SecurePass123!",
  username: "john_doe",
  count: 42,
  positiveNum: 100,
  negativeNum: -50,
  floatNum: 3.14,
  doubleNum: 2.718,
  integerNum: 999,
  metadata: { key1: "value1", key2: 123 },
  headers: { "Content-Type": "application/json" },
  counts: { users: 100, posts: 500 }
});

console.log('Format Types Result:', formatTest.success ? '✅ PASS' : '❌ FAIL');
if (!formatTest.success) {
  console.log('Errors:', formatTest.errors);
}

// Test 2: Optional Fields
console.log('\nTest 2: Optional Fields');
const optionalTest1 = OptionalTestSchema.safeParse({
  required: "must have this"
});
console.log('Optional (missing optional):', optionalTest1.success ? '✅ PASS' : '❌ FAIL');

const optionalTest2 = OptionalTestSchema.safeParse({
  required: "must have this",
  optional: "this is optional",
  optionalWithConstraint: "short"
});
console.log('Optional (with optional):', optionalTest2.success ? '✅ PASS' : '❌ FAIL');

// Test 3: Literal Values
console.log('\nTest 3: Literal Values');
const literalTest1 = LiteralValuesSchema.safeParse({
  role: "admin",
  environment: "production",
  version: 1,
  apiVersion: 2,
  isEnabled: true,
  isLegacy: false
});
console.log('Literal Values (correct):', literalTest1.success ? '✅ PASS' : '❌ FAIL');

const literalTest2 = LiteralValuesSchema.safeParse({
  role: "user", // Wrong value
  environment: "production",
  version: 1,
  apiVersion: 2,
  isEnabled: true,
  isLegacy: false
});
console.log('Literal Values (wrong value):', literalTest2.success ? '❌ PASS (should fail)' : '✅ FAIL (expected)');

// Test 4: Constrained Types
console.log('\nTest 4: Constrained Types');
const constrainedTest = AllTypesSchema.parse({
  BasicTypes: {
    name: "Test",
    age: 25,
    isActive: true,
    createdAt: new Date(),
    metadata: {},
    data: {}
  },
  ConstrainedTypes: {
    username: "john",
    password: "password123",
    score: 50,
    count: 10,
    id: 100,
    debt: -50,
    temperature: 98.6
  }
});
console.log('Constrained Types:', '✅ PASS');

console.log('\n✅ All tests completed!');
