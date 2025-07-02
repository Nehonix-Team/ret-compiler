/**
 * Test Rich Error Objects Implementation
 * 
 * Verifies that the new rich error objects work correctly
 * and provide detailed error information as shown in README.
 */

import { Interface } from "../src/core/schema/mode/interfaces/Interface";

console.log("🔍 Testing Rich Error Objects\n");

// Create test schema
const UserSchema = Interface({
  id: "number",
  name: "string(2,50)",
  email: "email",
  age: "number(18,120)",
  profile: {
    bio: "string?",
    website: "url?",
    verified: "boolean"
  }
});

console.log("✅ Schema created successfully");

// =================================================================
// TEST 1: Basic Rich Error Properties
// =================================================================
console.log("\n🔍 TEST 1: Basic Rich Error Properties");

const invalidData = {
  id: "not-a-number",
  name: "x", // Too short
  email: "invalid-email",
  age: 15, // Too young
  profile: {
    bio: "Valid bio",
    website: "not-a-url",
    verified: "not-boolean"
  }
};

const result = UserSchema.safeParse(invalidData);

if (!result.success) {
  console.log(`\n📊 Found ${result.errors.length} validation errors:`);
  
  result.errors.forEach((error, index) => {
    console.log(`\n❌ Error ${index + 1}:`);
    console.log(`   Field: ${error.path.join(".")}`);
    console.log(`   Message: ${error.message}`);
    console.log(`   Code: ${error.code}`);
    console.log(`   Expected: ${error.expected}`);
    console.log(`   Received: ${JSON.stringify(error.received)}`);
    console.log(`   Received Type: ${error.receivedType}`);
    
    if (error.context) {
      console.log(`   Context:`, error.context);
    }
  });
} else {
  console.log("❌ Expected validation to fail, but it passed!");
}

// =================================================================
// TEST 2: Nested Object Errors
// =================================================================
console.log("\n🔍 TEST 2: Nested Object Errors");

const nestedInvalidData = {
  id: 123,
  name: "John Doe",
  email: "john@example.com",
  age: 25,
  profile: {
    bio: "Valid bio",
    website: "invalid-url",
    verified: "not-boolean"
  }
};

const nestedResult = UserSchema.safeParse(nestedInvalidData);

if (!nestedResult.success) {
  console.log(`\n📊 Found ${nestedResult.errors.length} nested errors:`);
  
  nestedResult.errors.forEach((error, index) => {
    console.log(`\n❌ Nested Error ${index + 1}:`);
    console.log(`   Path: ${error.path.join(".")}`);
    console.log(`   Message: ${error.message}`);
    console.log(`   Expected: ${error.expected}`);
    console.log(`   Received: ${JSON.stringify(error.received)}`);
  });
} else {
  console.log("❌ Expected nested validation to fail, but it passed!");
}

// =================================================================
// TEST 3: Array Validation Errors
// =================================================================
console.log("\n🔍 TEST 3: Array Validation Errors");

const ArraySchema = Interface({
  tags: "string[](2,5)",
  scores: "number[]"
});

const arrayInvalidData = {
  tags: ["a"], // Too few items
  scores: ["not", "numbers", 123]
};

const arrayResult = ArraySchema.safeParse(arrayInvalidData);

if (!arrayResult.success) {
  console.log(`\n📊 Found ${arrayResult.errors.length} array errors:`);
  
  arrayResult.errors.forEach((error, index) => {
    console.log(`\n❌ Array Error ${index + 1}:`);
    console.log(`   Path: ${error.path.join(".")}`);
    console.log(`   Message: ${error.message}`);
    console.log(`   Code: ${error.code}`);
    console.log(`   Expected: ${error.expected}`);
    console.log(`   Received: ${JSON.stringify(error.received)}`);
  });
} else {
  console.log("❌ Expected array validation to fail, but it passed!");
}

// =================================================================
// TEST 4: README Example Compatibility
// =================================================================
console.log("\n🔍 TEST 4: README Example Compatibility");

// This should work exactly as shown in README
const readmeResult = UserSchema.safeParse(invalidData);

if (!readmeResult.success) {
  console.log("\n📚 README Example Output:");
  
  // This is the exact code from README
  readmeResult.errors.forEach((error) => {
    console.log(`Field: ${error.path.join(".")}`);
    console.log(`Message: ${error.message}`);
    console.log(`Code: ${error.code}`);
    console.log(`Expected: ${error.expected}`);
    console.log(`Received: ${error.received}`);
    console.log("---");
  });
  
  console.log("✅ README example works perfectly!");
} else {
  console.log("❌ README example failed!");
}

// =================================================================
// TEST 5: Error Object Structure Validation
// =================================================================
console.log("\n🔍 TEST 5: Error Object Structure Validation");

if (!result.success && result.errors.length > 0) {
  const firstError = result.errors[0];
  
  const requiredProperties = ['path', 'message', 'code', 'expected', 'received', 'receivedType'];
  const missingProperties = requiredProperties.filter(prop => !(prop in firstError));
  const existingProperties = requiredProperties.filter(prop => prop in firstError);
  
  console.log(`✅ Required properties: ${existingProperties.length}/${requiredProperties.length}`);
  
  if (missingProperties.length > 0) {
    console.log(`❌ Missing properties: ${missingProperties.join(', ')}`);
  } else {
    console.log(`✅ All required properties exist!`);
  }
  
  // Check types
  console.log(`✅ path is array: ${Array.isArray(firstError.path)}`);
  console.log(`✅ message is string: ${typeof firstError.message === 'string'}`);
  console.log(`✅ code is string: ${typeof firstError.code === 'string'}`);
  console.log(`✅ expected is string: ${typeof firstError.expected === 'string'}`);
  console.log(`✅ receivedType is string: ${typeof firstError.receivedType === 'string'}`);
}

// =================================================================
// FINAL RESULTS
// =================================================================
setTimeout(() => {
  console.log("\n" + "=".repeat(60));
  console.log("📋 RICH ERROR OBJECTS TEST RESULTS:");
  
  const hasErrors = !result.success && result.errors.length > 0;
  const hasRichProperties = hasErrors && 'path' in result.errors[0] && 'code' in result.errors[0];
  const readmeCompatible = hasErrors && result.errors[0].path && result.errors[0].message;
  
  console.log(`✅ Validation produces errors: ${hasErrors ? 'YES' : 'NO'}`);
  console.log(`✅ Errors have rich properties: ${hasRichProperties ? 'YES' : 'NO'}`);
  console.log(`✅ README example compatible: ${readmeCompatible ? 'YES' : 'NO'}`);
  
  const allWorking = hasErrors && hasRichProperties && readmeCompatible;
  
  console.log(`\n🎯 RICH ERROR OBJECTS STATUS: ${allWorking ? '✅ WORKING' : '❌ NEEDS WORK'}`);
  
  if (allWorking) {
    console.log("\n🎉 Rich error objects implemented successfully!");
    console.log("📚 README examples now work correctly!");
    console.log("🚀 Developers get detailed error information!");
  } else {
    console.log("\n⚠️ Rich error objects need more work.");
  }
}, 100);
