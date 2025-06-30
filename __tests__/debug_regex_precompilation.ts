import { Interface } from "../src/core/schema/mode/interfaces/Interface";

console.log("🔍 Debug Regex Precompilation Issue");
console.log("===================================\n");

// Test with optimization enabled (default)
const OptimizedSchema = Interface({
  username: "string(/^[a-zA-Z0-9]+$/)",
});

const optimizedInternal = OptimizedSchema as any;
console.log("Optimized schema properties:");
console.log(
  "- precompiledValidator:",
  !!optimizedInternal.precompiledValidator
);
console.log("- optimizationLevel:", optimizedInternal.optimizationLevel);

// Test with optimization disabled
const {
  InterfaceSchema,
} = require("./src/core/schema/mode/interfaces/InterfaceSchema");

const UnoptimizedSchema = new InterfaceSchema(
  {
    username: "string(/^[a-zA-Z0-9]+$/)",
  },
  {
    skipOptimization: true,
    allowUnknown: false,
    strict: false,
  }
);

console.log("\nUnoptimized schema properties:");
console.log(
  "- precompiledValidator:",
  !!UnoptimizedSchema.precompiledValidator
);

const testValues = [
  { input: "user123", expected: "PASS", description: "valid alphanumeric" },
  { input: "user_123", expected: "FAIL", description: "contains underscore" },
  { input: "user@123", expected: "FAIL", description: "contains @ symbol" },
];

for (const test of testValues) {
  console.log(`\nTesting: ${test.description} ("${test.input}")`);

  console.log("Optimized result:");
  const optimizedResult = OptimizedSchema.safeParse({ username: test.input });
  const optimizedActual = optimizedResult.success ? "PASS" : "FAIL";
  const optimizedCorrect = optimizedActual === test.expected;
  console.log(
    `  Result: ${optimizedActual} (expected ${test.expected}) ${optimizedCorrect ? "✅" : "❌"}`
  );
  if (!optimizedResult.success) {
    console.log(`  Errors: ${optimizedResult.errors}`);
  }

  console.log("Unoptimized result:");
  const unoptimizedResult = UnoptimizedSchema.safeParse({
    username: test.input,
  });
  const unoptimizedActual = unoptimizedResult.success ? "PASS" : "FAIL";
  const unoptimizedCorrect = unoptimizedActual === test.expected;
  console.log(
    `  Result: ${unoptimizedActual} (expected ${test.expected}) ${unoptimizedCorrect ? "✅" : "❌"}`
  );
  if (!unoptimizedResult.success) {
    console.log(`  Errors: ${unoptimizedResult.errors}`);
  }
}
