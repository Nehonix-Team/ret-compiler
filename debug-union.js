#!/usr/bin/env node

/**
 * Debug union validation to see which path is taken
 */

// Import the OptimizedUnionValidator directly
const { OptimizedUnionValidator } = require("./dist/cjs/core/schema/mode/interfaces/validators/UnionCache.js");

console.log("=== UNION VALIDATION DEBUG ===\n");

const unionType = "active|inactive|pending|suspended";
const testValue = "active";

console.log("Union type:", unionType);
console.log("Test value:", testValue);
console.log();

// Test the isSimpleLiteralUnion check
console.log("Testing isSimpleLiteralUnion...");
try {
  // We need to access the private method, so let's test the public validateUnion
  const result = OptimizedUnionValidator.validateUnion(unionType, testValue);
  console.log("Validation result:", result);
} catch (error) {
  console.error("Error:", error);
}

// Test the cache directly
console.log("\nTesting UnionCache...");
try {
  const { UnionCache } = require("./dist/cjs/core/schema/mode/interfaces/validators/UnionCache.js");
  const cachedValues = UnionCache.getCachedUnion(unionType);
  console.log("Cached values:", Array.from(cachedValues));
  console.log("Has 'active':", cachedValues.has("active"));
  console.log("Has 'invalid':", cachedValues.has("invalid"));
} catch (error) {
  console.error("Cache error:", error);
}

// Performance test of just the core validation
console.log("\n=== CORE VALIDATION PERFORMANCE ===");
const iterations = 100000;

console.log("Testing core OptimizedUnionValidator...");
const start = performance.now();
for (let i = 0; i < iterations; i++) {
  OptimizedUnionValidator.validateUnion(unionType, testValue);
}
const end = performance.now();
const time = end - start;

console.log(`Core validation: ${time.toFixed(2)}ms (${(time/iterations).toFixed(4)}ms avg)`);
console.log(`Ops/sec: ${(iterations / (time / 1000)).toFixed(0)}`);

// Test Zod for comparison
console.log("\nTesting Zod enum...");
const z = require("zod");
const zodEnum = z.enum(["active", "inactive", "pending", "suspended"]);

const zodStart = performance.now();
for (let i = 0; i < iterations; i++) {
  zodEnum.safeParse(testValue);
}
const zodEnd = performance.now();
const zodTime = zodEnd - zodStart;

console.log(`Zod enum: ${zodTime.toFixed(2)}ms (${(zodTime/iterations).toFixed(4)}ms avg)`);
console.log(`Ops/sec: ${(iterations / (zodTime / 1000)).toFixed(0)}`);

const speedup = zodTime / time;
console.log(`\nSpeedup: ${speedup.toFixed(2)}x ${speedup > 1 ? "faster" : "slower"}`);
