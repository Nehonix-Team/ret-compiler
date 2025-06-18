/**
 * Performance comparison between optimized and original implementations
 */

import { Interface } from "../core/schema/mode/interfaces/Interface";
import { ConstraintParser } from "../core/schema/mode/interfaces/validators/ConstraintParser";

console.log("=== PERFORMANCE COMPARISON ===\n");

// Test schema
const testSchema = Interface({
  id: "positive",
  email: "email",
  name: "string(2,50)",
  age: "int(18,120)?",
  tags: "string[](1,10)?",
  status: "active|inactive|pending",
  metadata: {
    created: "date",
    updated: "date?",
    version: "string",
  },
});

// Test data
const testData: any = {
  id: 1,
  email: "test@example.com",
  name: "John Doe",
  age: 25,
  tags: ["developer", "typescript", "nodejs"],
  status: "active",
  metadata: {
    created: new Date(),
    updated: new Date(),
    version: "1.0.0",
  },
};

console.log("1. Constraint Parser Cache Performance:");

// Test constraint parsing performance
const constraintTypes = [
  "string(2,50)",
  "int(18,120)?",
  "string[](1,10)?",
  "email",
  "positive",
  "active|inactive|pending",
];

// First run (cache miss)
const startParse1 = performance.now();
for (let i = 0; i < 10000; i++) {
  for (const type of constraintTypes) {
    ConstraintParser.parseConstraints(type);
  }
}
const endParse1 = performance.now();

// Clear cache and run again
ConstraintParser.clearCache();

// Second run (cache miss again)
const startParse2 = performance.now();
for (let i = 0; i < 10000; i++) {
  for (const type of constraintTypes) {
    ConstraintParser.parseConstraints(type);
  }
}
const endParse2 = performance.now();

// Third run (cache hit)
const startParse3 = performance.now();
for (let i = 0; i < 10000; i++) {
  for (const type of constraintTypes) {
    ConstraintParser.parseConstraints(type);
  }
}
const endParse3 = performance.now();

console.log(`First run (no cache): ${(endParse1 - startParse1).toFixed(2)}ms`);
console.log(`Second run (no cache): ${(endParse2 - startParse2).toFixed(2)}ms`);
console.log(
  `Third run (with cache): ${(endParse3 - startParse3).toFixed(2)}ms`
);
console.log(
  `Cache speedup: ${((endParse2 - startParse2) / (endParse3 - startParse3)).toFixed(2)}x`
);

console.log("\n2. Schema Validation Performance:");

// Warm up
for (let i = 0; i < 1000; i++) {
  testSchema.safeParse(testData);
}

// Test different data sizes
const testSizes = [1000, 5000, 10000];

for (const size of testSizes) {
  const startTime = performance.now();

  for (let i = 0; i < size; i++) {
    testSchema.safeParse(testData);
  }

  const endTime = performance.now();
  const totalTime = endTime - startTime;
  const avgTime = totalTime / size;
  const opsPerSec = size / (totalTime / 1000);

  console.log(
    `${size} validations: ${totalTime.toFixed(2)}ms (${avgTime.toFixed(4)}ms avg, ${opsPerSec.toFixed(0)} ops/sec)`
  );
}

console.log("\n3. Memory Usage Test:");

// Test memory usage with many validations
const memBefore = process.memoryUsage();

for (let i = 0; i < 50000; i++) {
  testSchema.safeParse(testData);
}

const memAfter = process.memoryUsage();
const memDiff = memAfter.heapUsed - memBefore.heapUsed;

console.log(
  `Memory used for 50,000 validations: ${(memDiff / 1024 / 1024).toFixed(2)} MB`
);
console.log(`Memory per validation: ${(memDiff / 50000).toFixed(0)} bytes`);

console.log("\n4. Cache Statistics:");

const cacheStats = ConstraintParser.getCacheStats();
console.log(`Constraint parser cache size: ${cacheStats.size} entries`);

console.log("\n5. Complex Schema Performance:");

// Test with a more complex schema
const complexSchema = Interface({
  user: {
    id: "positive",
    profile: {
      name: "string(2,100)",
      email: "email",
      phone: "phone?",
      address: {
        street: "string",
        city: "string",
        country: "string",
        zipCode: "string",
      },
    },
    preferences: {
      theme: "light|dark",
      notifications: "boolean",
      language: "string(2,5)",
    },
  },
  permissions: "when user.profile.email~@admin *? string[] : string[]?",
  metadata: {
    created: "date",
    updated: "date?",
    tags: "string[](0,20)?",
  },
});

const complexData: any = {
  user: {
    id: 1,
    profile: {
      name: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
      address: {
        street: "123 Main St",
        city: "New York",
        country: "USA",
        zipCode: "10001",
      },
    },
    preferences: {
      theme: "dark",
      notifications: true,
      language: "en",
    },
  },
  metadata: {
    created: new Date(),
    updated: new Date(),
    tags: ["user", "premium", "verified"],
  },
};

const complexIterations = 5000;
const complexStart = performance.now();

for (let i = 0; i < complexIterations; i++) {
  complexSchema.safeParse(complexData);
}

const complexEnd = performance.now();
const complexTime = complexEnd - complexStart;
const complexAvg = complexTime / complexIterations;
const complexOps = complexIterations / (complexTime / 1000);

console.log(
  `Complex schema (${complexIterations} validations): ${complexTime.toFixed(2)}ms`
);
console.log(
  `Complex schema average: ${complexAvg.toFixed(4)}ms per validation`
);
console.log(`Complex schema ops/sec: ${complexOps.toFixed(0)}`);

console.log("\nPerformance comparison completed! 📊");
