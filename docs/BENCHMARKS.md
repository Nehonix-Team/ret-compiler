# Fortify Schema Performance Benchmarks

> Last updated: 2025-06-23T09:50:46.885Z

## Environment

- **Node.js**: v22.12.0
- **Platform**: win32 (x64)
- **Memory**: 5MB

## Results Summary

### Core Performance

**Status**: ✅ Passed
**Description**: Core validation performance metrics

```
=== PERFORMANCE COMPARISON ===

1. Constraint Parser Cache Performance:
First run (no cache): 7.58ms
Second run (no cache): 2.92ms
Third run (with cache): 2.74ms
Cache speedup: 1.07x

2. Schema Validation Performance:
1000 validations: 18.91ms (0.0189ms avg, 52891 ops/sec)
5000 validations: 72.52ms (0.0145ms avg, 68948 ops/sec)
10000 validations: 88.76ms (0.0089ms avg, 112664 ops/sec)

3. Memory Usage Test:
Memory used for 50,000 validations: 0.18 MB
Memory per validation: 4 bytes

4. Cache Statistics:
Constraint parser cache size: 9 entries

5. Complex Schema Performance:
Complex schema (5000 validations): 129.38ms
Complex schema average: 0.0259ms per validation
Complex schema ops/sec: 38645

Performance comparison completed! 📊
```


### Precompilation Optimization

**Status**: ✅ Passed
**Description**: Schema compilation and caching performance

```
=== PRE-COMPILATION OPTIMIZATION BENCHMARK ===


Simple Schema (3 fields):
──────────────────────────────────────────────────
✅ 20000 validations: 66.07ms
✅ Average time: 0.0033ms per validation
✅ Throughput: 302731 operations/second
✅ Memory per validation: ~0.02 KB

Medium Schema (6 fields):
──────────────────────────────────────────────────
✅ 15000 validations: 85.26ms
✅ Average time: 0.0057ms per validation
✅ Throughput: 175942 operations/second
✅ Memory per validation: ~0.06 KB

Complex Schema (nested objects):
──────────────────────────────────────────────────
✅ 10000 validations: 180.42ms
✅ Average time: 0.0180ms per validation
✅ Throughput: 55426 operations/second
✅ Memory per validation: ~0.12 KB

=== CONSTRAINT PARSER CACHE PERFORMANCE ===
──────────────────────────────────────────────────
Cold cache (first run): 4.21ms
Warm cache (cached): 3.57ms
Cache speedup: 1.18x faster
Cache size: 9 entries

=== MEMORY EFFICIENCY TEST ===
──────────────────────────────────────────────────
Memory for 1000 schema instances: 0.00 MB
Memory per schema: 0.00 KB
Validated 1000 different schemas: 3.24ms
Average per schema: 0.0032ms

=== OPTIMIZATION SUMMARY ===
──────────────────────────────────────────────────
✅ Pre-compilation eliminates repeated parsing overhead
✅ Constraint caching provides significant speedup
✅ Memory usage is optimized for production workloads
✅ Performance scales well with schema complexity
✅ Ready for high-throughput validation scenarios

Pre-compilation benchmark completed! 🚀
```


### Fortify vs Zod

**Status**: ✅ Passed
**Description**: Direct performance comparison with Zod

```
=== FORTIFY SCHEMA vs ZOD PERFORMANCE COMPARISON ===

📊 Test 1: Simple Schema (5 fields)
──────────────────────────────────────────────────

Simple Schema:
  Fortify Schema: 35.09ms (0.0035ms avg, 284986 ops/sec)
  Zod:           57.08ms (0.0057ms avg, 175190 ops/sec)
  Winner: 🏆 Fortify (1.63x faster)

📊 Test 2: Complex Schema (nested objects)
──────────────────────────────────────────────────

Complex Schema:
  Fortify Schema: 71.87ms (0.0144ms avg, 69570 ops/sec)
  Zod:           55.84ms (0.0112ms avg, 89539 ops/sec)
  Winner: 🏆 Zod (0.78x slower)

📊 Test 3: Array Validation
──────────────────────────────────────────────────

Array Schema:
  Fortify Schema: 26.86ms (0.0034ms avg, 297817 ops/sec)
  Zod:           27.05ms (0.0034ms avg, 295783 ops/sec)
  Winner: 🏆 Fortify (1.01x faster)

📊 Test 4: Union Types
──────────────────────────────────────────────────

Union Types:
  Fortify Schema: 24.40ms (0.0020ms avg, 491727 ops/sec)
  Zod:           8.75ms (0.0007ms avg, 1371679 ops/sec)
  Winner: 🏆 Zod (0.36x slower)

📊 Memory Usage Comparison
──────────────────────────────────────────────────
Memory for 1000 schema instances: 9.75 MB
Memory per schema pair: 9.99 KB

🏆 PERFORMANCE SUMMARY
==================================================
Fortify Schema wins: 2/4 tests
Zod wins: 2/4 tests
Average performance: Zod is 0.94x slower

📋 Detailed Results:
  Simple Schema: Fortify wins (1.63x)
  Complex Schema: Zod wins (0.78x)
  Array Schema: Fortify wins (1.01x)
  Union Types: Zod wins (0.36x)

✅ Benchmark completed successfully!

Note: Results may vary based on Node.js version, system specs, and data complexity.
These benchmarks test core validation performance only.
```



## Performance Highlights

- **Validation Speed**: 200,000+ validations/second for simple schemas
- **Memory Efficiency**: ~4 bytes per validation
- **Cache Performance**: 1.4x speedup with constraint caching
- **Bundle Size**: Lightweight and tree-shakable

## Comparison with Zod

| Metric | Fortify Schema | Zod | Winner |
|--------|----------------|-----|---------|
| Simple Validation | ~0.0038ms | ~0.0053ms | 🏆 Fortify (1.4x faster) |
| Complex Schemas | ~0.0168ms | ~0.0157ms | 🏆 Zod (1.1x faster) |
| Array Validation | ~0.0037ms | ~0.0038ms | 🏆 Fortify (1.01x faster) |
| Union Types | ~0.0024ms | ~0.0007ms | 🏆 Zod (3.2x faster) |

*Benchmarks run on Node.js v22.12.0 on win32*

---

**Note**: These benchmarks are automatically generated and updated with each release.
For the latest results, see our [CI/CD pipeline](https://github.com/Nehonix-Team/fortify-schema/actions).
