#!/usr/bin/env node

// ES Module test to verify the build works
import { Interface, SchemaHelpers as SH} from './dist/esm/index.js';

console.log('🧪 Testing ES Module build...');

try {
  // Test basic interface
  const UserSchema = Interface({
    id: "number",
    name: "string",
    email: "email",
    status: SH.union("active", "inactive"),
    role: SH.const("user")
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

  console.log('🎉 ES Module tests passed!');

} catch (error) {
  console.error('❌ ES Module test failed:', error.message);
  process.exit(1);
}
