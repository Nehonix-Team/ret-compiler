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

  // Test validation
  const result = UserSchema.safeParse({
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    status: "active",
    role: "user"
  });

  if (result.success) {
    console.log('✅ Basic validation test passed');
  } else {
    console.log('❌ Basic validation test failed:', result.errors);
    process.exit(1);
  }

  // Test error case
  const errorResult = UserSchema.safeParse({
    id: "not-a-number",
    name: "John",
    email: "invalid-email",
    status: "invalid",
    role: "wrong"
  });

  if (!errorResult.success && errorResult.errors.length > 0) {
    console.log('✅ Error validation test passed');
  } else {
    console.log('❌ Error validation test failed');
    process.exit(1);
  }

  console.log('🎉 CommonJS tests passed!');

} catch (error) {
  console.error('❌ CommonJS test failed:', error.message);
  process.exit(1);
}
