import { Interface } from "../src/index";

console.log("🧪 Testing Required Field Syntax (!)");

// Test schema with required fields
const TestSchema = Interface({
  // Required string (cannot be empty)
  name: "string!",
  
  // Required number (cannot be zero)
  age: "number!",
  
  // Normal fields (can be empty/zero)
  nickname: "string",
  score: "number",
  
  // Optional fields
  bio: "string?",
  rating: "number?",
});

console.log("\n=== Testing Required String Field ===");

// Test valid required string
const validStringResult = TestSchema.safeParse({
  name: "John Doe",
  age: 25,
  nickname: "",
  score: 0,
});
console.log("✅ Valid required string:", validStringResult.success);

// Test invalid required string (empty)
const invalidStringResult = TestSchema.safeParse({
  name: "", // Empty string should fail
  age: 25,
  nickname: "",
  score: 0,
});
console.log("❌ Empty required string:", invalidStringResult.success);
if (!invalidStringResult.success) {
  console.log("   Error:", invalidStringResult.errors[0]?.message);
}

console.log("\n=== Testing Required Number Field ===");

// Test valid required number
const validNumberResult = TestSchema.safeParse({
  name: "John Doe",
  age: 25, // Non-zero number should pass
  nickname: "",
  score: 0,
});
console.log("✅ Valid required number:", validNumberResult.success);

// Test invalid required number (zero)
const invalidNumberResult = TestSchema.safeParse({
  name: "John Doe",
  age: 0, // Zero should fail for required number
  nickname: "",
  score: 0,
});
console.log("❌ Zero required number:", invalidNumberResult.success);
if (!invalidNumberResult.success) {
  console.log("   Error:", invalidNumberResult.errors[0]?.message);
}

console.log("\n=== Testing Normal Fields (Can Be Empty) ===");

// Test that normal fields can be empty/zero
const normalFieldsResult = TestSchema.safeParse({
  name: "John Doe",
  age: 25,
  nickname: "", // Empty string should be OK for normal field
  score: 0,     // Zero should be OK for normal field
});
console.log("✅ Normal fields can be empty/zero:", normalFieldsResult.success);

console.log("\n=== Testing Type Inference ===");

// Test that TypeScript inference works correctly
type InferredType = typeof TestSchema._type;

// This should show proper typing with required fields
const typedData: InferredType = {
  name: "John Doe",
  age: 25,
  nickname: "",
  score: 0,
  bio: undefined,
  rating: undefined,
};

console.log("✅ Type inference works:", typeof typedData);

console.log("\n=== Testing Record Types ===");

// Test record type inference
const RecordSchema = Interface({
  metadata: "record<string, any>",
  scores: "record<string, number>",
  translations: "record<string, string>",
});

const recordResult = RecordSchema.safeParse({
  metadata: {
    userId: "123",
    timestamp: new Date(),
    flags: ["active", "verified"]
  },
  scores: {
    math: 95,
    science: 87,
    english: 92
  },
  translations: {
    hello: "Hola",
    goodbye: "Adiós",
    welcome: "Bienvenido"
  }
});

console.log("✅ Record types validation:", recordResult.success);

// Test record type inference
type RecordInferredType = typeof RecordSchema._type;
const recordTypedData: RecordInferredType = {
  metadata: { test: "value" },
  scores: { math: 95 },
  translations: { hello: "world" }
};

console.log("✅ Record type inference:", typeof recordTypedData);

console.log("\n🎉 Required field syntax tests completed!");
