import { Interface, Make } from "../core/schema/mode/interfaces/Interface";


// Define schema like a TypeScript interface
const UserSchema = Interface({
    id: "string[](2,3)",
    email: "email",
    name: "string",
    test: {
        test: "string",
       x: {
            nested: "string",
        }
    },
    age: "number?", // Optional
    isActive: "boolean?", // Optional
    tags: "string[]?", // Optional array
    status: Make.union("active", "inactive", "pending", "expired"),
    role: Make.const("user"), // Safe constant
  });

  // Validate data with unknown property (testing invalid data)
  const result = UserSchema.safeParseUnknown({
    id: ["1", "2", "3", ],
    email: "user@example.com",
    name: "John Doe",
    status: "active",
      test: {
        test: "Hi there",
        x: {
            nested: "string",
        }
    },
    role: "user",
    isActive: true, // Optional
    noValidProperty: true  // This should be rejected
  });

  if (result.success) {
    console.log("❌ BUG: This should have failed due to noValidProperty!");
    console.log("Valid user:", result.data?.status);
    if(result.data?.status === "active"){
        console.log("✅ FIXED: Correctly rejected unknown property!");
    }
    console.log("Valid user:", result.data?.role);
  } else {
    console.log("✅ FIXED: Correctly rejected unknown property!");
    console.log("Validation errors:", result.errors);
  }

// Additional strict validation tests
console.log("\n🛡️ Testing Strict Validation by Default...");

const StrictTestSchema = Interface({
    id: "number",
    name: "string"
});

// Test 1: Valid data should pass
const strictTest1 = StrictTestSchema.safeParse({
    id: 1,
    name: "John"
});

// Test 2: Extra property should be rejected
const strictTest2 = StrictTestSchema.safeParse({
    id: 1,
    name: "John",
    extraProperty: "This should be rejected"
});

console.log("✅ Valid data test:", strictTest1.success);
console.log("❌ Extra property test:", strictTest2.success, strictTest2.errors);

// Test allowUnknown mode
const AllowUnknownSchema = StrictTestSchema.allowUnknown();

const allowUnknownTest = AllowUnknownSchema.safeParse({
    id: 1,
    name: "John",
    extraProperty: "This should be allowed"
});

console.log("✅ Allow unknown test:", allowUnknownTest.success, "Data:", allowUnknownTest.data);

// Test type inference
console.log("\n🎯 Testing Type Inference...");

// Simple test first
console.log("Simple schema type test...");
const SimpleSchema = Interface({
    id: "typeerr",
    name: "string",
  active: "boolean",
});

console.log(SimpleSchema.safeParse({ id: 1, name: "John", active: true , ok: ""}));

console.log("Simple schema type test ended");


// Complex test

const TypedSchema = Interface({
    id: "number",
    name: "string",
    email: "email",
    age: "number?",
    isActive: "boolean?",
    tags: "string[]?",
    score: "number(0,100)",
    username: "string(3,20)",
    profile: {
        bio: "string?",
        avatar: "url?"
    }
});

// This should now have full type inference
const typedResult = TypedSchema.safeParse({
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    age: 25,
    isActive: true,
    tags: ["developer", "typescript"],
    score: 95,
    username: "johndoe",
    profile: {
        bio: "I love TypeScript!",
        avatar: "https://example.com/avatar.jpg"
    }
});

console.log("✅ Typed result:", typedResult.success);

if (typedResult.success ) {
  if(typedResult.data){
    // These should all be properly typed now
    console.log("ID (number):", typedResult.data.id);
    console.log("Name (string):", typedResult.data.name);
    console.log("Email (string):", typedResult.data.email);
    console.log("Age (number | undefined):", typedResult.data.age);
    console.log("Tags (string[] | undefined):", typedResult.data.tags);
    console.log("Profile bio (string | undefined):", typedResult.data.profile.bio);}
} else {
    console.log("❌ Typed result failed. Errors:", typedResult.errors);
    console.log("Warnings:", typedResult.warnings);
}
