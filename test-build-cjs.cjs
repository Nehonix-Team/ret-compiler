#!/usr/bin/env node

// CommonJS test to verify the build works
const { Interface, SchemaHelpers } = require('./dist/cjs/index.js');

console.log('🧪 Testing CommonJS build...');

try {
  // Test basic interface
  const UserSchema = Interface({
    id: "number",
    name: "string",
    email: "email",
    status: SchemaHelpers.union("active", "inactive"),
    role: SchemaHelpers.const("user")
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

  // Test loose mode (should pass with warning)
  const looseSchema = UserSchema.loose();
  const looseResult = looseSchema.safeParse({
    id: "1", // String that can be converted to number
    name: "John Doe",
    email: "john@example.com",
    status: "active",
    role: "user"
  });

  if (looseResult.success && looseResult.warnings.some(w => w.includes('String converted to number'))) {
    console.log('✅ Loose mode test passed - correctly converted string to number');
  } else {
    console.log('❌ Loose mode test failed');
    console.log('Result:', looseResult);
    process.exit(1);
  }

  console.log('🎉 CommonJS tests passed!');

} catch (error) {
  console.error('❌ CommonJS test failed:', error.message);
  process.exit(1);
}
