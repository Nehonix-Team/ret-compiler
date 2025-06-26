#!/usr/bin/env node

/**
 * Quick test to verify union performance optimization
 */

const { performance } = require("perf_hooks");

// Import Fortify Schema
let Interface;
try {
  Interface = require("./dist/cjs/index.js").Interface;
} catch (error) {
  console.log("❌ Fortify Schema not found. Please run: npm run build");
  process.exit(1);
}

// Import Zod
let z;
try {
  z = require("zod");
} catch (error) {
  console.log("❌ Zod not found. Installing...");
  require("child_process").execSync("npm install zod", { stdio: "inherit" });
  z = require("zod");
}

console.log("=== UNION PERFORMANCE TEST ===\n");

// Create schemas
const fortifyUnion = Interface({
  status: "active|inactive|pending|suspended",
});

const zodUnion = z.object({
  status: z.enum(["active", "inactive", "pending", "suspended"]),
});

const testData = { status: "active" };
const iterations = 100000;

console.log("Testing with:", testData);
console.log("Iterations:", iterations);
console.log();

// Warm up
for (let i = 0; i < 1000; i++) {
  fortifyUnion.safeParse(testData);
  zodUnion.safeParse(testData);
}

// Test Fortify
console.log("Testing Fortify Schema...");
const fortifyStart = performance.now();
for (let i = 0; i < iterations; i++) {
  fortifyUnion.safeParse(testData);
}
const fortifyEnd = performance.now();
const fortifyTime = fortifyEnd - fortifyStart;

// Test Zod
console.log("Testing Zod...");
const zodStart = performance.now();
for (let i = 0; i < iterations; i++) {
  zodUnion.safeParse(testData);
}
const zodEnd = performance.now();
const zodTime = zodEnd - zodStart;

// Results
console.log("\n=== RESULTS ===");
console.log(`Fortify Schema: ${fortifyTime.toFixed(2)}ms (${(fortifyTime/iterations).toFixed(4)}ms avg)`);
console.log(`Zod:           ${zodTime.toFixed(2)}ms (${(zodTime/iterations).toFixed(4)}ms avg)`);

const speedup = zodTime / fortifyTime;
const winner = speedup > 1 ? "Fortify" : "Zod";
console.log(`Winner: 🏆 ${winner} (${Math.abs(speedup).toFixed(2)}x ${speedup > 1 ? "faster" : "slower"})`);

// Test validation results
console.log("\n=== VALIDATION TEST ===");
console.log("Fortify result:", fortifyUnion.safeParse(testData));
console.log("Zod result:", zodUnion.safeParse(testData));

console.log("\nFortify invalid:", fortifyUnion.safeParse({ status: "invalid" }));
console.log("Zod invalid:", zodUnion.safeParse({ status: "invalid" }));
