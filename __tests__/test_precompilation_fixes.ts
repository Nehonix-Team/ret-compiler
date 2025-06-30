import { Interface } from "../src/core/schema/mode/interfaces/Interface";

console.log("🔍 Test Precompilation Fixes");
console.log("============================\n");

// Test 1: String regex patterns
console.log("Test 1: String regex patterns (should be precompiled)");
const RegexSchema = Interface({
  username: "string(/^[a-zA-Z0-9]+$/)",
});

const regexInternal = RegexSchema as any;
console.log("Regex schema properties:");
console.log("- precompiledValidator:", !!regexInternal.precompiledValidator);
console.log("- optimizationLevel:", regexInternal.optimizationLevel);

const regexTests = [
  { input: "user123", expected: "PASS", description: "valid alphanumeric" },
  { input: "user_123", expected: "FAIL", description: "contains underscore" },
];

for (const test of regexTests) {
  const result = RegexSchema.safeParse({ username: test.input });
  const actual = result.success ? "PASS" : "FAIL";
  const isCorrect = actual === test.expected;

  console.log(
    `  ${test.description}: ${actual} (expected ${test.expected}) ${isCorrect ? "✅" : "❌"}`
  );
  if (!result.success) {
    console.log(`    Errors: ${result.errors}`);
  }
}

// Test 2: Positive numbers
console.log("\nTest 2: Positive numbers (should be precompiled)");
const PositiveSchema = Interface({
  value: "positive",
});

const positiveInternal = PositiveSchema as any;
console.log("Positive schema properties:");
console.log("- precompiledValidator:", !!positiveInternal.precompiledValidator);
console.log("- optimizationLevel:", positiveInternal.optimizationLevel);

const positiveTests = [
  { input: 5, expected: "PASS", description: "positive integer" },
  { input: 0.1, expected: "PASS", description: "positive decimal" },
  { input: -5, expected: "FAIL", description: "negative number" },
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

// Test 3: Negative numbers
console.log("\nTest 3: Negative numbers (should be precompiled)");
const NegativeSchema = Interface({
  value: "negative",
});

const negativeInternal = NegativeSchema as any;
console.log("Negative schema properties:");
console.log("- precompiledValidator:", !!negativeInternal.precompiledValidator);
console.log("- optimizationLevel:", negativeInternal.optimizationLevel);

const negativeTests = [
  { input: -5, expected: "PASS", description: "negative integer" },
  { input: -0.1, expected: "PASS", description: "negative decimal" },
  { input: 5, expected: "FAIL", description: "positive number" },
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

// Test 4: Double numbers
console.log("\nTest 4: Double numbers (should be precompiled)");
const DoubleSchema = Interface({
  value: "double(0,100)",
});

const doubleInternal = DoubleSchema as any;
console.log("Double schema properties:");
console.log("- precompiledValidator:", !!doubleInternal.precompiledValidator);
console.log("- optimizationLevel:", doubleInternal.optimizationLevel);

const doubleTests = [
  { input: 50, expected: "PASS", description: "valid double" },
  { input: 150, expected: "FAIL", description: "too high" },
  { input: -10, expected: "FAIL", description: "too low" },
];

for (const test of doubleTests) {
  const result = DoubleSchema.safeParse({ value: test.input });
  const actual = result.success ? "PASS" : "FAIL";
  const isCorrect = actual === test.expected;

  console.log(
    `  ${test.description}: ${actual} (expected ${test.expected}) ${isCorrect ? "✅" : "❌"}`
  );
  if (!result.success) {
    console.log(`    Errors: ${result.errors}`);
  }
}

console.log(
  "\n🎯 Summary: All tests should show precompilation enabled and correct validation!"
);
