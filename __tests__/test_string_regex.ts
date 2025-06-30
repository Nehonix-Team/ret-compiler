import { Interface } from "../src/core/schema/mode/interfaces/Interface";

console.log("🔍 Test String Regex Validation");
console.log("===============================\n");

// Test 1: Basic regex pattern
console.log("Test 1: Basic regex pattern - alphanumeric only");
const AlphanumericSchema = Interface({
  username: "string(/^[a-zA-Z0-9]+$/)",
});

const alphanumericTests = [
  { input: "user123", expected: "PASS", description: "valid alphanumeric" },
  { input: "user_123", expected: "FAIL", description: "contains underscore" },
  { input: "user-123", expected: "FAIL", description: "contains hyphen" },
  { input: "user@123", expected: "FAIL", description: "contains special char" },
  { input: "", expected: "FAIL", description: "empty string" },
];

for (const test of alphanumericTests) {
  const result = AlphanumericSchema.safeParse({ username: test.input });
  const actual = result.success ? "PASS" : "FAIL";
  const isCorrect = actual === test.expected;

  console.log(
    `  ${test.description}: ${actual} (expected ${test.expected}) ${isCorrect ? "✅" : "❌"}`
  );
  if (!result.success) {
    console.log(`    Errors: ${result.errors}`);
  }
}

// Test 2: Email-like regex pattern
console.log("\nTest 2: Email-like regex pattern");
const EmailRegexSchema = Interface({
  email: "string(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/)",
});

const emailRegexTests = [
  {
    input: "test@example.com",
    expected: "PASS",
    description: "valid email format",
  },
  {
    input: "user.name@domain.co.uk",
    expected: "PASS",
    description: "complex valid email",
  },
  { input: "invalid-email", expected: "FAIL", description: "no @ symbol" },
  { input: "test@", expected: "FAIL", description: "incomplete email" },
  { input: "test@domain", expected: "FAIL", description: "no TLD" },
];

for (const test of emailRegexTests) {
  const result = EmailRegexSchema.safeParse({ email: test.input });
  const actual = result.success ? "PASS" : "FAIL";
  const isCorrect = actual === test.expected;

  console.log(
    `  ${test.description}: ${actual} (expected ${test.expected}) ${isCorrect ? "✅" : "❌"}`
  );
  if (!result.success) {
    console.log(`    Errors: ${result.errors}`);
  }
}

// Test 3: Phone number regex pattern
console.log("\nTest 3: Phone number regex pattern");
const PhoneRegexSchema = Interface({
  phone: "string(/^\\+?[1-9]\\d{1,14}$/)",
});

const phoneRegexTests = [
  {
    input: "+1234567890",
    expected: "PASS",
    description: "valid international phone",
  },
  {
    input: "1234567890",
    expected: "PASS",
    description: "valid domestic phone",
  },
  { input: "+123", expected: "PASS", description: "short valid phone" },
  { input: "0123456789", expected: "FAIL", description: "starts with 0" },
  { input: "+0123456789", expected: "FAIL", description: "starts with +0" },
  { input: "123-456-7890", expected: "FAIL", description: "contains hyphens" },
];

for (const test of phoneRegexTests) {
  const result = PhoneRegexSchema.safeParse({ phone: test.input });
  const actual = result.success ? "PASS" : "FAIL";
  const isCorrect = actual === test.expected;

  console.log(
    `  ${test.description}: ${actual} (expected ${test.expected}) ${isCorrect ? "✅" : "❌"}`
  );
  if (!result.success) {
    console.log(`    Errors: ${result.errors}`);
  }
}

// Test 4: Complex regex with constraints
console.log("\nTest 4: Regex with length constraints");
const ComplexSchema = Interface({
  code: "string(3,10,/^[A-Z]{2}\\d+$/)",
});

const complexTests = [
  {
    input: "AB123",
    expected: "PASS",
    description: "valid code format and length",
  },
  { input: "AB1", expected: "PASS", description: "minimum length valid" },
  { input: "AB1234567890", expected: "FAIL", description: "too long" },
  { input: "AB", expected: "FAIL", description: "too short" },
  { input: "ab123", expected: "FAIL", description: "lowercase letters" },
  { input: "A1123", expected: "FAIL", description: "only one letter" },
];

for (const test of complexTests) {
  const result = ComplexSchema.safeParse({ code: test.input });
  const actual = result.success ? "PASS" : "FAIL";
  const isCorrect = actual === test.expected;

  console.log(
    `  ${test.description}: ${actual} (expected ${test.expected}) ${isCorrect ? "✅" : "❌"}`
  );
  if (!result.success) {
    console.log(`    Errors: ${result.errors}`);
  }
}

// Test 5: Check schema properties
console.log("\nTest 5: Schema properties check");
const RegexSchema = Interface({
  pattern: "string(/^test$/)",
});

const regexInternal = RegexSchema as any;
console.log("Regex schema properties:");
console.log("- precompiledValidator:", !!regexInternal.precompiledValidator);
console.log("- optimizationLevel:", regexInternal.optimizationLevel);

console.log("\nTesting simple regex pattern:");
const simpleResult = RegexSchema.safeParse({ pattern: "test" });
console.log("Result for 'test':", simpleResult.success ? "PASS ✅" : "FAIL ❌");

const simpleFailResult = RegexSchema.safeParse({ pattern: "testing" });
console.log(
  "Result for 'testing':",
  simpleFailResult.success ? "PASS ❌" : "FAIL ✅"
);
if (!simpleFailResult.success) {
  console.log("Errors:", simpleFailResult.errors);
}
