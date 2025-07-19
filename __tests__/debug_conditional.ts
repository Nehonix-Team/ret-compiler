import { Interface } from "../src/index";

console.log("🔍 Debugging Conditional Expression Detection");

// Test the conditional expression detection
const testFieldType = "when testProperty.exists *? string(1, 20) : =disabled";

// Test the regex pattern directly
const conditionalPattern = /^\s*when\s+.+?\s*\*\?\s*.+/;
const isConditional = conditionalPattern.test(testFieldType);

console.log("Field type:", testFieldType);
console.log("Is conditional (regex):", isConditional);

// Test the schema creation
console.log("\n=== Creating Schema ===");
try {
  const schema = Interface({
    testProperty: "number?",
    test4: "when testProperty.exists *? string(1, 20) : =disabled",
  });

  console.log("✅ Schema created successfully");
  
  // Test validation
  console.log("\n=== Testing Validation ===");
  const result = schema.safeParse({
    testProperty: 1,
    test4: "",
  });

  if (!result.success) {
    console.log("❌ Validation failed:");
    result.errors.forEach(error => {
      console.log(`  - ${error.message}`);
    });
  } else {
    console.log("✅ Validation passed:", result.data);
  }

} catch (error) {
  console.log("❌ Schema creation failed:", error);
}
