#!/usr/bin/env node

/**
 * Benchmark to identify and optimize complex schema performance bottlenecks
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

console.log('=== COMPLEX SCHEMA OPTIMIZATION ANALYSIS ===\n');

// Test different levels of nesting complexity
const level1Schema = Interface({
  id: "positive",
  name: "string(2,50)",
  email: "email"
});

const level2Schema = Interface({
  user: {
    id: "positive",
    name: "string(2,50)",
    email: "email"
  },
  metadata: {
    created: "date",
    version: "string"
  }
});

const level3Schema = Interface({
  user: {
    id: "positive",
    profile: {
      name: "string(2,50)",
      email: "email",
      address: {
        street: "string",
        city: "string",
        country: "string"
      }
    }
  },
  metadata: {
    created: "date",
    updated: "date?",
    tags: "string[]?"
  }
});

const level4Schema = Interface({
  user: {
    id: "positive",
    profile: {
      name: "string(2,50)",
      email: "email",
      address: {
        street: "string",
        city: "string",
        country: "string",
        coordinates: {
          lat: "number(-90,90)",
          lng: "number(-180,180)",
        },
      },
      preferences: {
        theme: "light|dark",
        notifications: "boolean",
        language: "string(2,5)",
      },
    },
  },
  deepNested: {
    deep: {
      deeper: {
        deepest: "string",
        moreNested: {
          level1: {
            level2: {
              level3: {
                level4: {
                  level5: {
                    level6: {
                      level7: {
                        level8: {
                          level9: {
                            level10: {
                              level11: {
                                level12: {
                                  level13: {
                                    level14: {
                                      level15: {
                                        level16: {
                                          level17: {
                                            level18: {
                                              level19: {
                                                level20: {
                                                  value: "string[]",
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  permissions: "string[]?",
  metadata: {
    created: "date",
    updated: "date?",
    tags: "string[]?",
    version: "string",
  },
});

// Test data for each level
const testData = {
  level1: {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
  },
  level2: {
    user: {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
    },
    metadata: {
      created: new Date(),
      version: "1.0.0",
    },
  },
  level3: {
    user: {
      id: 1,
      profile: {
        name: "John Doe",
        email: "john@example.com",
        address: {
          street: "123 Main St",
          city: "New York",
          country: "USA",
        },
      },
    },
    metadata: {
      created: new Date(),
      updated: new Date(),
      tags: ["user", "verified"],
    },
  },
  level4: {
    user: {
      id: 1,
      profile: {
        name: "John Doe",
        email: "john@example.com",
        address: {
          street: "123 Main St",
          city: "New York",
          country: "USA",
          coordinates: {
            lat: 40.7128,
            lng: -74.006,
          },
        },
        preferences: {
          theme: "dark",
          notifications: true,
          language: "en",
        },
      },
    },
    deepNested: {
      deep: {
        deeper: {
          deepest: "Hello world",
          moreNested: {
            level1: {
              level2: {
                level3: {
                  level4: {
                    level5: {
                      level6: {
                        level7: {
                          level8: {
                            level9: {
                              level10: {
                                level11: {
                                  level12: {
                                    level13: {
                                      level14: {
                                        level15: {
                                          level16: {
                                            level17: {
                                              level18: {
                                                level19: {
                                                  level20: {
                                                    value:
                                                      "bingo!!! You found me ! 😎🤣😂 What a journey! 🏆 My name's deepest nesting property. You deserve a cookie! 🍪😛😜😝🤣😂",
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    permissions: ["read", "write"],
    metadata: {
      created: new Date(),
      updated: new Date(),
      tags: ["user", "verified"],
      version: "1.0.0",
    },
  },
};

function benchmarkComplexity(name, schema, data, iterations) {
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
  
  return { totalTime, avgTime, opsPerSec, complexity: name };
}

// Run complexity benchmarks
const results = [];

results.push(benchmarkComplexity('Level 1 (Flat)', level1Schema, testData.level1, 20000));
results.push(benchmarkComplexity('Level 2 (1 level nesting)', level2Schema, testData.level2, 15000));
results.push(benchmarkComplexity('Level 3 (2 levels nesting)', level3Schema, testData.level3, 10000));
results.push(benchmarkComplexity('Level 4 (3 levels nesting)', level4Schema, testData.level4, 8000));

// Analyze performance degradation
console.log('\n📊 Performance Degradation Analysis:');
console.log('─'.repeat(50));

const baselineOps = results[0].opsPerSec;
for (let i = 0; i < results.length; i++) {
  const result = results[i];
  const degradation = baselineOps / result.opsPerSec;
  console.log(`  ${result.complexity}: ${degradation.toFixed(2)}x slower than baseline`);
}

// Field count impact
console.log('\n📊 Field Count Impact:');
console.log('─'.repeat(50));

const fieldCounts = [3, 6, 12, 20]; // Approximate field counts for each level
for (let i = 0; i < results.length; i++) {
  const fieldsPerMs = fieldCounts[i] / results[i].avgTime;
  console.log(`  ${results[i].complexity}: ${fieldsPerMs.toFixed(0)} fields/ms`);
}

// Memory usage by complexity
console.log('\n📊 Memory Usage by Complexity:');
console.log('─'.repeat(50));

const schemas = [level1Schema, level2Schema, level3Schema, level4Schema];
const memBefore = process.memoryUsage();

// Create multiple instances of each schema type
for (let i = 0; i < 100; i++) {
  schemas.forEach(schema => {
    schema.safeParse(testData.level1); // Use simple data to isolate schema overhead
  });
}

const memAfter = process.memoryUsage();
const memDiff = memAfter.heapUsed - memBefore.heapUsed;

console.log(`  Memory for 400 schema validations: ${(memDiff / 1024 / 1024).toFixed(2)} MB`);
console.log(`  Memory per validation: ${(memDiff / 400).toFixed(0)} bytes`);

// Optimization recommendations
console.log('\n🚀 OPTIMIZATION RECOMMENDATIONS:');
console.log('='.repeat(50));

const worstPerformance = Math.min(...results.map(r => r.opsPerSec));
const bestPerformance = Math.max(...results.map(r => r.opsPerSec));
const performanceRange = bestPerformance / worstPerformance;

console.log(`Performance range: ${performanceRange.toFixed(2)}x difference`);
console.log(`Worst case: ${worstPerformance.toFixed(0)} ops/sec`);
console.log(`Best case: ${bestPerformance.toFixed(0)} ops/sec`);

if (performanceRange > 3) {
  console.log('\n⚠️  HIGH PERFORMANCE DEGRADATION DETECTED');
  console.log('Recommendations:');
  console.log('  1. Implement object validation caching');
  console.log('  2. Optimize nested object traversal');
  console.log('  3. Pre-compile nested schema structures');
  console.log('  4. Consider schema flattening for hot paths');
} else {
  console.log('\n✅ ACCEPTABLE PERFORMANCE DEGRADATION');
  console.log('Complex schemas maintain reasonable performance');
}

console.log('\n✅ Complex schema analysis completed!');
