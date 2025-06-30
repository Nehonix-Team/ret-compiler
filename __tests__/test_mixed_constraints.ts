import { Interface } from "../src/core/schema/mode/interfaces/Interface";

console.log("🔍 Test Mixed Constraints (Length + Regex)");
console.log("==========================================\n");

// Test if we can combine length and regex constraints
console.log("Test 1: Attempting mixed constraints");

try {
  const MixedSchema = Interface({
    code: "string(3,10,/^[A-Z]{2}\\d+$/)",
  });

  console.log("✅ Mixed constraint schema created successfully");

  const mixedTests = [
    {
      input: "AB123",
      expected: "PASS",
      description: "valid format and length",
    },
    { input: "AB1", expected: "PASS", description: "minimum length valid" },
    { input: "AB1234567890", expected: "FAIL", description: "too long" },
    { input: "AB", expected: "FAIL", description: "too short" },
    { input: "ab123", expected: "FAIL", description: "lowercase letters" },
    { input: "A1123", expected: "FAIL", description: "only one letter" },
  ];

  for (const test of mixedTests) {
    const result = MixedSchema.safeParse({ code: test.input });
    const actual = result.success ? "PASS" : "FAIL";
    const isCorrect = actual === test.expected;

    console.log(
      `  ${test.description}: ${actual} (expected ${test.expected}) ${isCorrect ? "✅" : "❌"}`
    );
    if (!result.success) {
      console.log(`    Errors: ${result.errors}`);
    }
  }
} catch (error) {
  console.log("❌ Mixed constraint schema creation failed:", error.message);
  console.log(
    "This is expected - mixed constraints are not currently supported"
  );
}

// Test 2: Alternative approach - separate schemas
console.log("\nTest 2: Alternative approach - separate validation");

const LengthOnlySchema = Interface({
  code: "string(3,10)",
});

const RegexOnlySchema = Interface({
  code: "string(/^[A-Z]{2}\\d+$/)",
});

console.log("Testing separate length and regex validation:");

const testValue = "AB123";
console.log(`\nTesting value: "${testValue}"`);

const lengthResult = LengthOnlySchema.safeParse({ code: testValue });
console.log(
  `Length validation: ${lengthResult.success ? "PASS ✅" : "FAIL ❌"}`
);
if (!lengthResult.success) {
  console.log(`  Errors: ${lengthResult.errors}`);
}

const regexResult = RegexOnlySchema.safeParse({ code: testValue });
console.log(`Regex validation: ${regexResult.success ? "PASS ✅" : "FAIL ❌"}`);
if (!regexResult.success) {
  console.log(`  Errors: ${regexResult.errors}`);
}

// Test 3: Edge cases for regex patterns
console.log("\nTest 3: Edge cases for regex patterns");

const EdgeCaseSchema = Interface({
  pattern: "string(/^[a-z]+$/i)", // Case-insensitive flag
});

const edgeCaseTests = [
  { input: "hello", expected: "PASS", description: "lowercase letters" },
  {
    input: "HELLO",
    expected: "PASS",
    description: "uppercase letters (case-insensitive)",
  },
  { input: "Hello", expected: "PASS", description: "mixed case" },
  { input: "hello123", expected: "FAIL", description: "contains numbers" },
];

for (const test of edgeCaseTests) {
  const result = EdgeCaseSchema.safeParse({ pattern: test.input });
  const actual = result.success ? "PASS" : "FAIL";
  const isCorrect = actual === test.expected;

  console.log(
    `  ${test.description}: ${actual} (expected ${test.expected}) ${isCorrect ? "✅" : "❌"}`
  );
  if (!result.success) {
    console.log(`    Errors: ${result.errors}`);
  }
}
