import { Interface } from "../src/core/schema/mode/interfaces/Interface";

console.log("🔍 Debug Email Validation");
console.log("=========================\n");

// Test email schema
const EmailSchema = Interface({
  email: "email",
});

const emailInternal = EmailSchema as any;
console.log("Email schema properties:");
console.log("- precompiledValidator:", !!emailInternal.precompiledValidator);
console.log("- optimizationLevel:", emailInternal.optimizationLevel);

// Test with optimization disabled
const {
  InterfaceSchema,
} = require("./src/core/schema/mode/interfaces/InterfaceSchema");

const EmailSchemaNoOpt = new InterfaceSchema(
  {
    email: "email",
  },
  {
    skipOptimization: true,
    allowUnknown: false,
    strict: false,
  }
);

console.log("\nEmail schema (no optimization) properties:");
console.log("- precompiledValidator:", !!EmailSchemaNoOpt.precompiledValidator);

const testEmails = [
  { email: "test@example.com", expected: "PASS", description: "valid email" },
  {
    email: "notemail#@gmail.com",
    expected: "FAIL",
    description: "invalid email with #",
  },
  { email: "user@domain", expected: "FAIL", description: "missing TLD" },
  { email: "invalid-email", expected: "FAIL", description: "no @ symbol" },
];

for (const test of testEmails) {
  console.log(`\nTesting: ${test.description} (${test.email})`);

  console.log("Optimized result:");
  const optimizedResult = EmailSchema.safeParse({ email: test.email });
  const optimizedActual = optimizedResult.success ? "PASS" : "FAIL";
  const optimizedCorrect = optimizedActual === test.expected;
  console.log(
    `  Result: ${optimizedActual} (expected ${test.expected}) ${optimizedCorrect ? "✅" : "❌"}`
  );
  if (!optimizedResult.success) {
    console.log(`  Errors: ${optimizedResult.errors}`);
  }

  console.log("Unoptimized result:");
  const unoptimizedResult = EmailSchemaNoOpt.safeParse({ email: test.email });
  const unoptimizedActual = unoptimizedResult.success ? "PASS" : "FAIL";
  const unoptimizedCorrect = unoptimizedActual === test.expected;
  console.log(
    `  Result: ${unoptimizedActual} (expected ${test.expected}) ${unoptimizedCorrect ? "✅" : "❌"}`
  );
  if (!unoptimizedResult.success) {
    console.log(`  Errors: ${unoptimizedResult.errors}`);
  }
}
