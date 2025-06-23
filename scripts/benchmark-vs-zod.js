#!/usr/bin/env node

/**
 * Direct performance comparison between Fortify Schema and Zod
 * This benchmark tests real-world scenarios with both libraries
 */

const { performance } = require('perf_hooks');

// Import Fortify Schema (assuming it's built)
let Interface;
try {
  Interface = require('../dist/cjs/index.js').Interface;
} catch (error) {
  try {
    Interface = require('../dist/esm/index.js').Interface;
  } catch (error2) {
    console.log('❌ Fortify Schema not found. Please run: npm run build');
    console.log('Error:', error.message);
    process.exit(1);
  }
}

// Try to import Zod (install if needed)
let z;
try {
  z = require('zod');
} catch (error) {
  console.log('❌ Zod not found. Installing...');
  require('child_process').execSync('npm install zod', { stdio: 'inherit' });
  z = require('zod');
}

console.log('=== FORTIFY SCHEMA vs ZOD PERFORMANCE COMPARISON ===\n');

// Test 1: Simple Schema
console.log('📊 Test 1: Simple Schema (5 fields)');
console.log('─'.repeat(50));

const fortifySimple = Interface({
  id: "positive",
  name: "string(2,50)",
  email: "email",
  age: "int(18,120)?",
  active: "boolean"
});

const zodSimple = z.object({
  id: z.number().positive(),
  name: z.string().min(2).max(50),
  email: z.string().email(),
  age: z.number().int().min(18).max(120).optional(),
  active: z.boolean()
});

const simpleData = {
  id: 1,
  name: "John Doe",
  email: "john@example.com",
  age: 25,
  active: true
};

function runComparison(name, fortifySchema, zodSchema, data, iterations) {
  console.log(`\n${name}:`);

  // Warm up both libraries
  for (let i = 0; i < 100; i++) {
    fortifySchema.safeParse(data);
    zodSchema.safeParse(data);
  }

  // Benchmark Fortify Schema
  const fortifyStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    fortifySchema.safeParse(data);
  }
  const fortifyEnd = performance.now();
  const fortifyTime = fortifyEnd - fortifyStart;
  const fortifyAvg = fortifyTime / iterations;
  const fortifyOps = iterations / (fortifyTime / 1000);

  // Benchmark Zod
  const zodStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    zodSchema.safeParse(data);
  }
  const zodEnd = performance.now();
  const zodTime = zodEnd - zodStart;
  const zodAvg = zodTime / iterations;
  const zodOps = iterations / (zodTime / 1000);

  // Calculate performance difference
  const speedup = zodTime / fortifyTime;
  const winner = speedup > 1 ? 'Fortify' : 'Zod';

  console.log(`  Fortify Schema: ${fortifyTime.toFixed(2)}ms (${fortifyAvg.toFixed(4)}ms avg, ${fortifyOps.toFixed(0)} ops/sec)`);
  console.log(`  Zod:           ${zodTime.toFixed(2)}ms (${zodAvg.toFixed(4)}ms avg, ${zodOps.toFixed(0)} ops/sec)`);
  console.log(`  Winner: 🏆 ${winner} (${Math.abs(speedup).toFixed(2)}x ${speedup > 1 ? 'faster' : 'slower'})`);

  return {
    fortify: { time: fortifyTime, avg: fortifyAvg, ops: fortifyOps },
    zod: { time: zodTime, avg: zodAvg, ops: zodOps },
    speedup: speedup,
    winner: winner
  };
}

const simpleResult = runComparison('Simple Schema', fortifySimple, zodSimple, simpleData, 10000);

// Test 2: Complex Schema with Nested Objects
console.log('\n📊 Test 2: Complex Schema (nested objects)');
console.log('─'.repeat(50));

const fortifyComplex = Interface({
  user: {
    id: "positive",
    profile: {
      name: "string(2,100)",
      email: "email",
      phone: "phone?",
      address: {
        street: "string",
        city: "string",
        zipCode: "string(5,10)"
      }
    }
  },
  metadata: {
    created: "date",
    tags: "string[](0,10)?",
    version: "string"
  }
});

const zodComplex = z.object({
  user: z.object({
    id: z.number().positive(),
    profile: z.object({
      name: z.string().min(2).max(100),
      email: z.string().email(),
      phone: z.string().optional(),
      address: z.object({
        street: z.string(),
        city: z.string(),
        zipCode: z.string().min(5).max(10)
      })
    })
  }),
  metadata: z.object({
    created: z.date(),
    tags: z.array(z.string()).max(10).optional(),
    version: z.string()
  })
});

const complexData = {
  user: {
    id: 1,
    profile: {
      name: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
      address: {
        street: "123 Main St",
        city: "New York",
        zipCode: "10001"
      }
    }
  },
  metadata: {
    created: new Date(),
    tags: ["user", "verified"],
    version: "1.0.0"
  }
};

const complexResult = runComparison('Complex Schema', fortifyComplex, zodComplex, complexData, 5000);

// Test 3: Array Validation
console.log('\n📊 Test 3: Array Validation');
console.log('─'.repeat(50));

const fortifyArray = Interface({
  users: "any[](1,100)",
  tags: "string[](0,20)",
  scores: "number[](3,5)"
});

const zodArray = z.object({
  users: z.array(z.any()).min(1).max(100),
  tags: z.array(z.string()).max(20),
  scores: z.array(z.number()).min(3).max(5)
});

const arrayData = {
  users: [{ id: 1 }, { id: 2 }, { id: 3 }],
  tags: ["typescript", "validation", "performance"],
  scores: [85, 92, 78, 95]
};

const arrayResult = runComparison('Array Schema', fortifyArray, zodArray, arrayData, 8000);

// Test 4: Union Types
console.log('\n📊 Test 4: Union Types');
console.log('─'.repeat(50));

const fortifyUnion = Interface({
  status: "active|inactive|pending|suspended",
  priority: "low|medium|high|critical",
  type: "user|admin|moderator|guest"
});

const zodUnion = z.object({
  status: z.enum(["active", "inactive", "pending", "suspended"]),
  priority: z.enum(["low", "medium", "high", "critical"]),
  type: z.enum(["user", "admin", "moderator", "guest"])
});

const unionData = {
  status: "active",
  priority: "high",
  type: "admin"
};

const unionResult = runComparison('Union Types', fortifyUnion, zodUnion, unionData, 12000);

// Memory Usage Comparison
console.log('\n📊 Memory Usage Comparison');
console.log('─'.repeat(50));

const memBefore = process.memoryUsage();

// Create many schema instances
const fortifySchemas = [];
const zodSchemas = [];

for (let i = 0; i < 1000; i++) {
  fortifySchemas.push(Interface({
    id: "positive",
    name: "string(2,50)",
    email: "email"
  }));

  zodSchemas.push(z.object({
    id: z.number().positive(),
    name: z.string().min(2).max(50),
    email: z.string().email()
  }));
}

const memAfter = process.memoryUsage();
const memDiff = memAfter.heapUsed - memBefore.heapUsed;

console.log(`Memory for 1000 schema instances: ${(memDiff / 1024 / 1024).toFixed(2)} MB`);
console.log(`Memory per schema pair: ${(memDiff / 1000 / 1024).toFixed(2)} KB`);

// Summary
console.log('\n🏆 PERFORMANCE SUMMARY');
console.log('='.repeat(50));

const results = [simpleResult, complexResult, arrayResult, unionResult];
const fortifyWins = results.filter(r => r.winner === 'Fortify').length;
const zodWins = results.filter(r => r.winner === 'Zod').length;

console.log(`Fortify Schema wins: ${fortifyWins}/${results.length} tests`);
console.log(`Zod wins: ${zodWins}/${results.length} tests`);

const avgSpeedup = results.reduce((sum, r) => sum + r.speedup, 0) / results.length;
console.log(`Average performance: ${avgSpeedup > 1 ? 'Fortify' : 'Zod'} is ${Math.abs(avgSpeedup).toFixed(2)}x ${avgSpeedup > 1 ? 'faster' : 'slower'}`);

console.log('\n📋 Detailed Results:');
results.forEach((result, i) => {
  const testNames = ['Simple Schema', 'Complex Schema', 'Array Schema', 'Union Types'];
  console.log(`  ${testNames[i]}: ${result.winner} wins (${result.speedup.toFixed(2)}x)`);
});

console.log('\n✅ Benchmark completed successfully!');
console.log('\nNote: Results may vary based on Node.js version, system specs, and data complexity.');
console.log('These benchmarks test core validation performance only.');
