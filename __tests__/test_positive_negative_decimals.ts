import { Interface } from "../src/core/schema/mode/interfaces/Interface";

console.log("🔍 Test Positive/Negative with Decimals");
console.log("=======================================\n");

// Test positive with decimals
const PositiveSchema = Interface({
  value: "positive",
});

console.log("Testing positive type:");
const positiveTests = [
  { input: 5, expected: "PASS", description: "integer 5" },
  { input: 0.1, expected: "PASS", description: "decimal 0.1" },
  { input: -5, expected: "FAIL", description: "negative -5" },
  { input: 0, expected: "FAIL", description: "zero" },
];

for (const test of positiveTests) {
  const result = PositiveSchema.safeParse({ value: test.input });
  const actual = result.success ? "PASS" : "FAIL";
  const isCorrect = actual === test.expected;

  console.log(
    `  ${test.description}: ${actual} (expected ${test.expected}) ${isCorrect ? "✅" : "❌"}`
  );
  if (!result.success) {
    console.log(`    Errors: ${result.errors}`);
  }
}

// Test negative with decimals
const NegativeSchema = Interface({
  value: "negative",
});

console.log("\nTesting negative type:");
const negativeTests = [
  { input: -5, expected: "PASS", description: "integer -5" },
  { input: -0.1, expected: "PASS", description: "decimal -0.1" },
  { input: 5, expected: "FAIL", description: "positive 5" },
  { input: 0, expected: "FAIL", description: "zero" },
];

for (const test of negativeTests) {
  const result = NegativeSchema.safeParse({ value: test.input });
  const actual = result.success ? "PASS" : "FAIL";
  const isCorrect = actual === test.expected;

  console.log(
    `  ${test.description}: ${actual} (expected ${test.expected}) ${isCorrect ? "✅" : "❌"}`
  );
  if (!result.success) {
    console.log(`    Errors: ${result.errors}`);
  }
}
