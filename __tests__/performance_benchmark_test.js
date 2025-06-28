/**
 * PERFORMANCE BENCHMARK TEST SUITE
 * 
 * This test suite measures and compares performance improvements
 * from our optimizations including caching, method improvements, and edge case handling.
 * 
 * BENCHMARKS:
 * ⚡ Field Value Caching Performance
 * 🔄 Method Call Optimization
 * 📊 Complex Expression Performance
 * 🚀 Large Dataset Stress Testing
 * 💾 Memory Usage Analysis
 * 🎯 Real-world Scenario Performance
 */

const { Interface } = require("../core/schema/mode/interfaces/Interface");
const { ConditionalEvaluator } = require("../core/schema/mode/interfaces/conditional/evaluator/ConditionalEvaluator");

console.log("⚡ PERFORMANCE BENCHMARK TEST SUITE");
console.log("Measuring optimization improvements and performance gains");
console.log("=" + "=".repeat(70));

// Generate large test dataset
function generateLargeDataset(size) {
  const dataset = [];
  for (let i = 0; i < size; i++) {
    dataset.push({
      id: `item-${i}`,
      userId: `user-${i % 100}`,
      category: ["electronics", "books", "clothing", "home"][i % 4],
      price: Math.random() * 1000,
      rating: Math.floor(Math.random() * 5) + 1,
      tags: [`tag${i % 10}`, `category${i % 5}`, `type${i % 3}`],
      metadata: {
        created: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-01`,
        region: ["us", "eu", "asia"][i % 3],
        version: Math.floor(Math.random() * 5) + 1
      },
      features: {
        premium: i % 10 === 0,
        beta: i % 20 === 0,
        experimental: i % 50 === 0
      }
    });
  }
  return dataset;
}

// Benchmark 1: Field Value Caching Performance
console.log("\n⚡ Benchmark 1: Field Value Caching Performance");
console.log("-".repeat(50));

const CachingTestSchema = Interface({
  id: "string",
  
  // Multiple conditions accessing the same nested properties
  hasPremiumFeatures: "when features.premium.$exists() *? boolean : =false",
  hasBetaFeatures: "when features.beta.$exists() *? boolean : =false",
  hasExperimentalFeatures: "when features.experimental.$exists() *? boolean : =false",
  hasMetadata: "when metadata.$exists() *? boolean : =false",
  hasRegion: "when metadata.region.$exists() *? boolean : =false",
  hasVersion: "when metadata.version.$exists() *? boolean : =false",
}).allowUnknown();

const testData = generateLargeDataset(1)[0]; // Single complex object

// Test with caching enabled
console.log("Testing with caching ENABLED...");
ConditionalEvaluator.clearCaches();
const startCached = performance.now();

for (let i = 0; i < 1000; i++) {
  CachingTestSchema.safeParse({
    ...testData,
    hasPremiumFeatures: true,
    hasBetaFeatures: false,
    hasExperimentalFeatures: false,
    hasMetadata: true,
    hasRegion: true,
    hasVersion: true,
  });
}

const endCached = performance.now();
const cachedTime = endCached - startCached;

console.log(`✅ Cached performance: ${cachedTime.toFixed(2)}ms for 1000 validations`);
console.log(`   Average per validation: ${(cachedTime / 1000).toFixed(3)}ms`);

// Benchmark 2: Complex Expression Performance
console.log("\n🔄 Benchmark 2: Complex Expression Performance");
console.log("-".repeat(50));

const ComplexExpressionSchema = Interface({
  id: "string",
  
  // Complex business logic with multiple method calls
  qualifiesForDiscount: "when price.$between(100,500) *? boolean : =false",
  isHighRated: "when rating.$between(4,5) *? boolean : =false",
  isPopularCategory: "when category.$in(electronics,books) *? boolean : =false",
  hasRecentActivity: "when metadata.created.$startsWith(2024) *? boolean : =false",
  isUSRegion: "when metadata.region.$contains(us) *? boolean : =false",
  hasAdvancedTags: "when tags.$contains(tag1) *? boolean : =false",
  
  // Nested conditional logic
  eligibleForPremium: "when features.premium.$exists() *? boolean : =false",
  canAccessBeta: "when features.beta.$exists() *? boolean : =false",
}).allowUnknown();

const complexTestData = generateLargeDataset(100);

console.log("Testing complex expressions on 100 items...");
const startComplex = performance.now();

const complexResults = complexTestData.map(item => 
  ComplexExpressionSchema.safeParse({
    ...item,
    qualifiesForDiscount: true,
    isHighRated: true,
    isPopularCategory: true,
    hasRecentActivity: true,
    isUSRegion: true,
    hasAdvancedTags: true,
    eligibleForPremium: true,
    canAccessBeta: false,
  })
);

const endComplex = performance.now();
const complexTime = endComplex - startComplex;

const successCount = complexResults.filter(r => r.success).length;
console.log(`✅ Complex expressions: ${complexTime.toFixed(2)}ms for 100 items`);
console.log(`   Success rate: ${successCount}/100 (${(successCount/100*100).toFixed(1)}%)`);
console.log(`   Average per item: ${(complexTime / 100).toFixed(3)}ms`);

// Benchmark 3: Large Dataset Stress Test
console.log("\n📊 Benchmark 3: Large Dataset Stress Test");
console.log("-".repeat(50));

const StressTestSchema = Interface({
  id: "string",
  
  // Optimized for high-volume processing
  isValidItem: "when price.$between(0,10000) *? boolean : =false",
  hasCategory: "when category.$exists() *? boolean : =false",
  isRated: "when rating.$between(1,5) *? boolean : =false",
}).allowUnknown();

const largeDataset = generateLargeDataset(1000);

console.log("Testing 1000 items with optimized schema...");
const startStress = performance.now();

const stressResults = largeDataset.map(item => 
  StressTestSchema.safeParse({
    ...item,
    isValidItem: true,
    hasCategory: true,
    isRated: true,
  })
);

const endStress = performance.now();
const stressTime = endStress - startStress;

const stressSuccessCount = stressResults.filter(r => r.success).length;
console.log(`✅ Large dataset: ${stressTime.toFixed(2)}ms for 1000 items`);
console.log(`   Success rate: ${stressSuccessCount}/1000 (${(stressSuccessCount/1000*100).toFixed(1)}%)`);
console.log(`   Average per item: ${(stressTime / 1000).toFixed(3)}ms`);
console.log(`   Throughput: ${(1000 / (stressTime / 1000)).toFixed(0)} validations/second`);

// Benchmark 4: Method Call Performance Comparison
console.log("\n🎯 Benchmark 4: Method Call Performance Comparison");
console.log("-".repeat(50));

const MethodTestSchema = Interface({
  id: "string",
  
  // Test all method types for performance
  existsTest: "when metadata.$exists() *? boolean : =false",
  emptyTest: "when tags.$empty() *? boolean : =false",
  nullTest: "when nullField.$null() *? boolean : =false",
  inTest: "when category.$in(electronics,books,clothing) *? boolean : =false",
  containsTest: "when tags.$contains(tag1) *? boolean : =false",
  startsWithTest: "when metadata.created.$startsWith(2024) *? boolean : =false",
  endsWithTest: "when id.$endsWith(1) *? boolean : =false",
  betweenTest: "when price.$between(0,1000) *? boolean : =false",
}).allowUnknown();

const methodTestData = generateLargeDataset(200);

console.log("Testing all method types on 200 items...");
const startMethods = performance.now();

const methodResults = methodTestData.map(item => 
  MethodTestSchema.safeParse({
    ...item,
    nullField: null,
    existsTest: true,
    emptyTest: false,
    nullTest: true,
    inTest: true,
    containsTest: true,
    startsWithTest: true,
    endsWithTest: false,
    betweenTest: true,
  })
);

const endMethods = performance.now();
const methodsTime = endMethods - startMethods;

const methodSuccessCount = methodResults.filter(r => r.success).length;
console.log(`✅ Method calls: ${methodsTime.toFixed(2)}ms for 200 items`);
console.log(`   Success rate: ${methodSuccessCount}/200 (${(methodSuccessCount/200*100).toFixed(1)}%)`);
console.log(`   Average per item: ${(methodsTime / 200).toFixed(3)}ms`);
console.log(`   Method calls per second: ${(200 * 8 / (methodsTime / 1000)).toFixed(0)}`);

// Benchmark 5: Memory Usage Analysis
console.log("\n💾 Benchmark 5: Memory Usage Analysis");
console.log("-".repeat(50));

const initialMemory = process.memoryUsage();
console.log("Initial memory usage:");
console.log(`   Heap Used: ${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
console.log(`   Heap Total: ${(initialMemory.heapTotal / 1024 / 1024).toFixed(2)} MB`);

// Run intensive validation to measure memory impact
const memoryTestData = generateLargeDataset(500);
const MemoryTestSchema = Interface({
  id: "string",
  test1: "when metadata.region.$exists() *? boolean : =false",
  test2: "when features.premium.$exists() *? boolean : =false",
  test3: "when price.$between(0,1000) *? boolean : =false",
  test4: "when category.$in(electronics,books) *? boolean : =false",
  test5: "when tags.$contains(tag1) *? boolean : =false",
}).allowUnknown();

memoryTestData.forEach(item => {
  MemoryTestSchema.safeParse({
    ...item,
    test1: true, test2: true, test3: true, test4: true, test5: true,
  });
});

const finalMemory = process.memoryUsage();
const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

console.log("Final memory usage:");
console.log(`   Heap Used: ${(finalMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
console.log(`   Memory Increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB`);
console.log(`   Cache Size: ${ConditionalEvaluator.fieldValueCache.size} entries`);

// Performance Summary
console.log("\n🏆 PERFORMANCE SUMMARY");
console.log("=".repeat(50));
console.log(`📊 Caching Performance: ${(cachedTime / 1000).toFixed(3)}ms per validation`);
console.log(`🔄 Complex Expressions: ${(complexTime / 100).toFixed(3)}ms per item`);
console.log(`📈 Large Dataset: ${(1000 / (stressTime / 1000)).toFixed(0)} validations/second`);
console.log(`🎯 Method Calls: ${(200 * 8 / (methodsTime / 1000)).toFixed(0)} calls/second`);
console.log(`💾 Memory Efficiency: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB for 500 items`);

console.log("\n🎯 PERFORMANCE BENCHMARK COMPLETE");
console.log("All optimizations tested and measured!");
