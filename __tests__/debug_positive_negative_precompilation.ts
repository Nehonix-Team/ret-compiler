import { Interface } from "../src/core/schema/mode/interfaces/Interface";

console.log("🔍 Debug Positive/Negative Precompilation");
console.log("=========================================\n");

// Test positive schema
const PositiveSchema = Interface({
  value: "positive",
});

const positiveInternal = PositiveSchema as any;
console.log("Positive schema properties:");
console.log("- precompiledValidator:", !!positiveInternal.precompiledValidator);
console.log("- optimizationLevel:", positiveInternal.optimizationLevel);

// Test negative schema
const NegativeSchema = Interface({
  value: "negative",
});

const negativeInternal = NegativeSchema as any;
console.log("\nNegative schema properties:");
console.log("- precompiledValidator:", !!negativeInternal.precompiledValidator);
console.log("- optimizationLevel:", negativeInternal.optimizationLevel);

// Test with optimization disabled
const {
  InterfaceSchema,
} = require("./src/core/schema/mode/interfaces/InterfaceSchema");

const PositiveSchemaNoOpt = new InterfaceSchema(
  {
    value: "positive",
  },
  {
    skipOptimization: true,
    allowUnknown: false,
    strict: false,
  }
);

const NegativeSchemaNoOpt = new InterfaceSchema(
  {
    value: "negative",
  },
  {
    skipOptimization: true,
    allowUnknown: false,
    strict: false,
  }
);

console.log("\nPositive schema (no optimization) properties:");
console.log(
  "- precompiledValidator:",
  !!PositiveSchemaNoOpt.precompiledValidator
);

console.log("\nNegative schema (no optimization) properties:");
console.log(
  "- precompiledValidator:",
  !!NegativeSchemaNoOpt.precompiledValidator
);

// Test validation with both optimized and unoptimized
console.log("\n" + "=".repeat(50));
console.log("Testing positive validation:");

console.log("\nOptimized positive with -5 (should fail):");
const optimizedResult1 = PositiveSchema.safeParse({ value: -5 });
console.log("Result:", optimizedResult1.success ? "PASS ❌" : "FAIL ✅");
if (!optimizedResult1.success) {
  console.log("Errors:", optimizedResult1.errors);
}

console.log("\nUnoptimized positive with -5 (should fail):");
const unoptimizedResult1 = PositiveSchemaNoOpt.safeParse({ value: -5 });
console.log("Result:", unoptimizedResult1.success ? "PASS ❌" : "FAIL ✅");
if (!unoptimizedResult1.success) {
  console.log("Errors:", unoptimizedResult1.errors);
}

console.log("\n" + "=".repeat(50));
console.log("Testing negative validation:");

console.log("\nOptimized negative with 5 (should fail):");
const optimizedResult2 = NegativeSchema.safeParse({ value: 5 });
console.log("Result:", optimizedResult2.success ? "PASS ❌" : "FAIL ✅");
if (!optimizedResult2.success) {
  console.log("Errors:", optimizedResult2.errors);
}

console.log("\nUnoptimized negative with 5 (should fail):");
const unoptimizedResult2 = NegativeSchemaNoOpt.safeParse({ value: 5 });
console.log("Result:", unoptimizedResult2.success ? "PASS ❌" : "FAIL ✅");
if (!unoptimizedResult2.success) {
  console.log("Errors:", unoptimizedResult2.errors);
}
