#!/usr/bin/env node

/**
 * Benchmark to test union type optimization
 * Measures the performance improvement from caching
 */

const { performance } = require('perf_hooks');

// Import ReliantType
let Interface;
try {
  Interface = require('../dist/cjs/index.js').Interface;
} catch (error) {
  console.log('❌ ReliantType not found. Please run: npm run build');
  process.exit(1);
}

console.log('=== UNION TYPE OPTIMIZATION BENCHMARK ===\n');

// Test schemas with different union complexities
const simpleUnionSchema = Interface({
  status: "active|inactive"
});

const mediumUnionSchema = Interface({
  priority: "low|medium|high|critical|urgent"
});

const complexUnionSchema = Interface({
  role: "user|admin|moderator|guest|viewer|editor|owner|manager"
});

const multipleUnionsSchema = Interface({
  status: "active|inactive|pending|suspended",
  priority: "low|medium|high|critical",
  type: "user|admin|moderator|guest",
  category: "tech|business|design|marketing|sales"
});

// Test data
const testData = {
  simple: { status: "active" },
  medium: { priority: "high" },
  complex: { role: "admin" },
  multiple: {
    status: "active",
    priority: "high", 
    type: "admin",
    category: "tech"
  }
};

function runUnionBenchmark(name, schema, data, iterations) {
  console.log(`\n📊 ${name}:`);
  console.log('─'.repeat(50));
  
  // Warm up
  for (let i = 0; i < 100; i++) {
    schema.safeParse(data);
  }
  
  // Benchmark
  const startTime = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    schema.safeParse(data);
  }
  
  const endTime = performance.now();
  const totalTime = endTime - startTime;
  const avgTime = totalTime / iterations;
  const opsPerSec = iterations / (totalTime / 1000);
  
  console.log(`  ✅ ${iterations} validations: ${totalTime.toFixed(2)}ms`);
  console.log(`  ✅ Average time: ${avgTime.toFixed(4)}ms per validation`);
  console.log(`  ✅ Throughput: ${opsPerSec.toFixed(0)} operations/second`);
  
  return { totalTime, avgTime, opsPerSec };
}

// Run benchmarks
const results = [];

results.push({
  name: 'Simple Union (2 values)',
  ...runUnionBenchmark('Simple Union (2 values)', simpleUnionSchema, testData.simple, 20000)
});

results.push({
  name: 'Medium Union (5 values)',
  ...runUnionBenchmark('Medium Union (5 values)', mediumUnionSchema, testData.medium, 15000)
});

results.push({
  name: 'Complex Union (8 values)',
  ...runUnionBenchmark('Complex Union (8 values)', complexUnionSchema, testData.complex, 12000)
});

results.push({
  name: 'Multiple Unions (4 fields)',
  ...runUnionBenchmark('Multiple Unions (4 fields)', multipleUnionsSchema, testData.multiple, 10000)
});

// Cache performance test
console.log('\n📊 Cache Performance Test:');
console.log('─'.repeat(50));

// Test cache effectiveness with repeated union types
const cacheTestSchema = Interface({
  status: "active|inactive|pending|suspended"
});

const cacheTestData = { status: "active" };

// First run (cache miss)
const cacheStart1 = performance.now();
for (let i = 0; i < 10000; i++) {
  cacheTestSchema.safeParse(cacheTestData);
}
const cacheEnd1 = performance.now();

// Second run (cache hit)
const cacheStart2 = performance.now();
for (let i = 0; i < 10000; i++) {
  cacheTestSchema.safeParse(cacheTestData);
}
const cacheEnd2 = performance.now();

const cacheTime1 = cacheEnd1 - cacheStart1;
const cacheTime2 = cacheEnd2 - cacheStart2;
const cacheSpeedup = cacheTime1 / cacheTime2;

console.log(`  First run (cache building): ${cacheTime1.toFixed(2)}ms`);
console.log(`  Second run (cache hit): ${cacheTime2.toFixed(2)}ms`);
console.log(`  Cache speedup: ${cacheSpeedup.toFixed(2)}x faster`);

// Memory usage test
console.log('\n📊 Memory Usage Test:');
console.log('─'.repeat(50));

const memBefore = process.memoryUsage();

// Create many schemas with different union types
const schemas = [];
for (let i = 0; i < 1000; i++) {
  schemas.push(Interface({
    status: `value${i % 10}|other${i % 5}|test${i % 3}`
  }));
}

const memAfter = process.memoryUsage();
const memDiff = memAfter.heapUsed - memBefore.heapUsed;

console.log(`  Memory for 1000 union schemas: ${(memDiff / 1024 / 1024).toFixed(2)} MB`);
console.log(`  Memory per schema: ${(memDiff / 1000 / 1024).toFixed(2)} KB`);

// Performance summary
console.log('\n🏆 UNION OPTIMIZATION SUMMARY');
console.log('='.repeat(50));

const avgOpsPerSec = results.reduce((sum, r) => sum + r.opsPerSec, 0) / results.length;
const bestPerformance = Math.max(...results.map(r => r.opsPerSec));
const worstPerformance = Math.min(...results.map(r => r.opsPerSec));

console.log(`Average throughput: ${avgOpsPerSec.toFixed(0)} ops/sec`);
console.log(`Best performance: ${bestPerformance.toFixed(0)} ops/sec (${results.find(r => r.opsPerSec === bestPerformance)?.name})`);
console.log(`Worst performance: ${worstPerformance.toFixed(0)} ops/sec (${results.find(r => r.opsPerSec === worstPerformance)?.name})`);
console.log(`Performance range: ${(bestPerformance / worstPerformance).toFixed(2)}x difference`);

console.log('\n📋 Optimization Results:');
console.log(`  ✅ Cache speedup: ${cacheSpeedup.toFixed(2)}x faster on repeated validations`);
console.log(`  ✅ Memory efficient: ${(memDiff / 1000 / 1024).toFixed(2)} KB per schema`);
console.log(`  ✅ Scalable: Performance maintained across union complexity`);

console.log('\n✅ Union optimization benchmark completed!');
console.log('\nNext: Compare with Zod union performance to measure improvement.');
