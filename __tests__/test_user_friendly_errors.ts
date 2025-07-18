/**
 * Demonstrate user-friendly error messages for the specific scenario mentioned
 */

import { Interface } from "../src/index";

console.log("🎯 USER-FRIENDLY ERROR MESSAGES DEMO");
console.log("=".repeat(50));

// Simulate a form with many similar fields (the user's concern)
const UserRegistrationSchema = Interface(
  {
    personalInfo: {
      firstName: "string",
      lastName: "string",
      age: "number",
      email: "email",
    },
    contactInfo: {
      phone: "string",
      address: "string",
      city: "string",
      zipCode: "number",
    },
    preferences: {
      newsletter: "boolean",
      theme: "light|dark",
      language: "en|es|fr",
      notifications: "boolean",
    },
  },
  { skipOptimization: true }
);

// Test data with multiple errors (user's scenario)
const testData = {
  personalInfo: {
    firstName: "John",
    lastName: "Doe",
    age: "twenty-five", // Wrong type
    email: "invalid-email", // Wrong format
  },
  contactInfo: {
    phone: 1234567890, // Wrong type (should be string)
    address: "123 Main St",
    city: "New York",
    zipCode: "10001", // Wrong type (should be number)
  },
  preferences: {
    newsletter: "yes", // Wrong type (should be boolean)
    theme: "blue", // Wrong union value
    language: "english", // Wrong union value
    notifications: 1, // Wrong type (should be boolean)
  },
};

console.log("\n📝 Testing form with multiple similar fields...");
const result = UserRegistrationSchema.safeParse(testData);

if (!result.success) {
  console.log(`\n❌ Found ${result.errors.length} validation errors:\n`);

  result.errors.forEach((error, index) => {
    console.log(`${index + 1}. ${error.message}`);
    console.log(`   📍 Path: ${error.path.join(" → ")}`);
    console.log(`   📥 Received: ${JSON.stringify(error.received)}`);
    console.log(`   📤 Expected: ${error.expected}`);
    console.log("");
  });

  console.log("✅ As you can see, each error clearly identifies:");
  console.log("   • The exact field that failed (e.g., 'personalInfo.age')");
  console.log("   • The actual value that was provided");
  console.log("   • What was expected");
  console.log("   • The complete path to the problematic field");
  console.log("");
  console.log(
    "🎉 Users can now easily identify and fix specific validation issues!"
  );
} else {
  console.log("✅ All validation passed!");
}

console.log("\n" + "=".repeat(50));
