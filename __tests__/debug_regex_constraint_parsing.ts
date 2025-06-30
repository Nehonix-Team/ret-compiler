console.log("🔍 Debug Regex Constraint Parsing");
console.log("==================================\n");

// Test constraint parsing directly
const ConstraintParser = require("./src/core/schema/mode/interfaces/validators/ConstraintParser").ConstraintParser;

const testPatterns = [
  "string(/^[a-zA-Z0-9]+$/)",
  "string(/^test$/)",
  "string(3,10)",
  "string(/^[A-Z]{2}\\d+$/)",
];

for (const pattern of testPatterns) {
  console.log(`Testing pattern: ${pattern}`);
  try {
    const parsed = ConstraintParser.parseConstraints(pattern);
    console.log("  Parsed successfully:");
    console.log("  - type:", parsed.type);
    console.log("  - constraints:", JSON.stringify(parsed.constraints));
    console.log("  - optional:", parsed.optional);
    
    if (parsed.constraints.pattern) {
      console.log("  - regex pattern:", parsed.constraints.pattern);
      console.log("  - regex source:", parsed.constraints.pattern.source);
      console.log("  - regex flags:", parsed.constraints.pattern.flags);
    }
  } catch (error) {
    console.log("  ❌ Error:", error.message);
  }
  console.log("");
}

// Test actual validation
console.log("=".repeat(50));
console.log("Testing actual validation:");

const { Interface } = require("./src/core/schema/mode/interfaces/Interface");

try {
  const TestSchema = Interface({
    username: "string(/^[a-zA-Z0-9]+$/)"
  });
  
  console.log("✅ Schema created successfully");
  
  const testValues = ["user123", "user_123", "user@123"];
  
  for (const value of testValues) {
    const result = TestSchema.safeParse({ username: value });
    console.log(`Testing "${value}": ${result.success ? "PASS" : "FAIL"}`);
    if (!result.success) {
      console.log(`  Errors: ${result.errors}`);
    }
  }
  
} catch (error) {
  console.log("❌ Schema creation failed:", error.message);
}
