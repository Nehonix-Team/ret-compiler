#!/usr/bin/env node

// ES Module test to verify the build works
import { Interface, Make} from '../dist/esm/index.js';

console.log('🧪 Testing ES Module build...');

try {
  // Test basic interface
  const UserSchema = Interface({
    id: "number",
    name: "string",
    email: "email",
    status: Make.union("active", "inactive"),
    role: Make.const("user")
  });

  // Test strict validation (should pass)
  const validResult = UserSchema.safeParse({
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    status: "active",
    role: "user"
  });

  if (validResult.success) {
    console.log('✅ Valid data test passed');
  } else {
    console.log('❌ Valid data test failed:', validResult.errors);
    process.exit(1);
  }

  // Test strict validation (should fail - string instead of number)
  const strictResult = UserSchema.safeParse({
    id: "1", // String instead of number - should fail in strict mode
    name: "John Doe",
    email: "john@example.com",
    status: "active",
    role: "user"
  });

  if (!strictResult.success && strictResult.errors.some(e => e.includes('Expected number, got string'))) {
    console.log('✅ Strict validation test passed - correctly rejected string for number');
  } else {
    console.log('❌ Strict validation test failed - should have rejected string for number');
    console.log('Result:', strictResult);
    process.exit(1);
  }

  console.log('🎉 ES Module tests passed!');

} catch (error) {
  console.error('❌ ES Module test failed:', error.message);
  process.exit(1);
}
