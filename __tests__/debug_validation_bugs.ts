import { Interface } from "../src/core/schema/mode/interfaces/Interface";

console.log("🔍 Debug Validation Bugs");
console.log("========================\n");

// Test 1: Positive type validation
console.log("Test 1: Positive type validation");
const PositiveSchema = Interface({
  value: "positive",
});

const positiveTests = [
  { input: 5, expected: "PASS", description: "positive number 5" },
  { input: -5, expected: "FAIL", description: "negative number -5" },
  { input: 0, expected: "FAIL", description: "zero" },
  { input: 0.1, expected: "PASS", description: "positive decimal 0.1" },
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

// Test 2: Negative type validation
console.log("\nTest 2: Negative type validation");
const NegativeSchema = Interface({
  value: "negative",
});

const negativeTests = [
  { input: -5, expected: "PASS", description: "negative number -5" },
  { input: 5, expected: "FAIL", description: "positive number 5" },
  { input: 0, expected: "FAIL", description: "zero" },
  { input: -0.1, expected: "PASS", description: "negative decimal -0.1" },
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

// Test 3: Email validation
console.log("\nTest 3: Email validation");
const EmailSchema = Interface({
  email: "email",
});

const emailTests = [
  { input: "test@example.com", expected: "PASS", description: "valid email" },
  {
    input: "notemail#@gmail.com",
    expected: "FAIL",
    description: "invalid email with #",
  },
  {
    input: "invalid-email",
    expected: "FAIL",
    description: "invalid email format",
  },
  { input: "test@", expected: "FAIL", description: "incomplete email" },
];

for (const test of emailTests) {
  const result = EmailSchema.safeParse({ email: test.input });
  const actual = result.success ? "PASS" : "FAIL";
  const isCorrect = actual === test.expected;

  console.log(
    `  ${test.description}: ${actual} (expected ${test.expected}) ${isCorrect ? "✅" : "❌"}`
  );
  if (!result.success) {
    console.log(`    Errors: ${result.errors}`);
  }
}

// Test 4: Original gl.ts test case
console.log("\nTest 4: Original gl.ts test case");
const UserSchema = Interface({
  id: "string",
  email: "email",
  name: "string(2,50)",
  age: "negative",
  role: "admin|user|guest",
});

const result = UserSchema.safeParse({
  email: "notemail#@gmail.com", // Invalid email
  id: "eiuaznz",
  name: "John",
  role: "admin",
  age: 17, // Positive number for negative field
});

console.log(
  `Result: ${result.success ? "PASS ❌ (BUG!)" : "FAIL ✅ (CORRECT)"}`
);
if (result.success) {
  console.log("🚨 BUGS CONFIRMED:");
  console.log("  - Invalid email passed validation");
  console.log("  - Positive number (17) passed negative validation");
  console.log("Data:", JSON.stringify(result.data, null, 2));
} else {
  console.log("✅ Validation correctly failed");
  console.log("Errors:", result.errors);
}
