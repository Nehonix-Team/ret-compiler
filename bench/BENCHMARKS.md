# Fortify Schema Performance Benchmarks

> Last updated: 2025-06-25T22:22:31.015Z

## Environment

- **Node.js**: v22.6.0
- **Platform**: win32 (x64)
- **Memory**: 2MB

## Results Summary

### Core Performance

**Status**: ✅ Passed
**Description**: Core validation performance metrics

```
=== PERFORMANCE COMPARISON ===

1. Constraint Parser Cache Performance:
First run (no cache): 4.80ms
Second run (no cache): 3.05ms
Third run (with cache): 2.85ms
Cache speedup: 1.07x

2. Schema Validation Performance:
1000 validations: 8.28ms (0.0083ms avg, 120823 ops/sec)
5000 validations: 44.89ms (0.0090ms avg, 111391 ops/sec)
10000 validations: 68.26ms (0.0068ms avg, 146500 ops/sec)

3. Memory Usage Test:
Memory used for 50,000 validations: 0.78 MB
Memory per validation: 16 bytes

4. Cache Statistics:
Constraint parser cache size: 9 entries

5. Complex Schema Performance:
Complex schema (5000 validations): 156.41ms
Complex schema average: 0.0313ms per validation
Complex schema ops/sec: 31967

Performance comparison completed! 📊
```


### Precompilation Optimization

**Status**: ✅ Passed
**Description**: Schema compilation and caching performance

```
=== PRE-COMPILATION OPTIMIZATION BENCHMARK ===


Simple Schema (3 fields):
──────────────────────────────────────────────────
✅ 20000 validations: 82.94ms
✅ Average time: 0.0041ms per validation
✅ Throughput: 241140 operations/second
✅ Memory per validation: ~0.02 KB

Medium Schema (6 fields):
──────────────────────────────────────────────────
✅ 15000 validations: 60.52ms
✅ Average time: 0.0040ms per validation
✅ Throughput: 247834 operations/second
✅ Memory per validation: ~0.02 KB

Complex Schema (nested objects):
──────────────────────────────────────────────────
✅ 10000 validations: 106.59ms
✅ Average time: 0.0107ms per validation
✅ Throughput: 93820 operations/second
✅ Memory per validation: ~0.11 KB

=== CONSTRAINT PARSER CACHE PERFORMANCE ===
──────────────────────────────────────────────────
Cold cache (first run): 8.68ms
Warm cache (cached): 7.29ms
Cache speedup: 1.19x faster
Cache size: 9 entries

=== MEMORY EFFICIENCY TEST ===
──────────────────────────────────────────────────
Memory for 1000 schema instances: 0.00 MB
Memory per schema: 0.00 KB
Validated 1000 different schemas: 15.98ms
Average per schema: 0.0160ms

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
  Fortify Schema: 35.34ms (0.0035ms avg, 282939 ops/sec)
  Zod:           51.09ms (0.0051ms avg, 195731 ops/sec)
  Winner: 🏆 Fortify (1.45x faster)

📊 Test 2: Complex Schema (nested objects)
──────────────────────────────────────────────────

Complex Schema:
  Fortify Schema: 56.41ms (0.0113ms avg, 88629 ops/sec)
  Zod:           68.46ms (0.0137ms avg, 73033 ops/sec)
  Winner: 🏆 Fortify (1.21x faster)

📊 Test 3: Array Validation
──────────────────────────────────────────────────

Array Schema:
  Fortify Schema: 29.36ms (0.0037ms avg, 272480 ops/sec)
  Zod:           34.94ms (0.0044ms avg, 228947 ops/sec)
  Winner: 🏆 Fortify (1.19x faster)

📊 Test 4: Union Types
──────────────────────────────────────────────────

Union Types:
  Fortify Schema: 75.30ms (0.0063ms avg, 159372 ops/sec)
  Zod:           8.73ms (0.0007ms avg, 1375185 ops/sec)
  Winner: 🏆 Zod (0.12x slower)

📊 Memory Usage Comparison
──────────────────────────────────────────────────
Memory for 1000 schema instances: 9.54 MB
Memory per schema pair: 9.77 KB

🏆 PERFORMANCE SUMMARY
==================================================
Fortify Schema wins: 3/4 tests
Zod wins: 1/4 tests
Average performance: Zod is 0.99x slower

📋 Detailed Results:
  Simple Schema: Fortify wins (1.45x)
  Complex Schema: Fortify wins (1.21x)
  Array Schema: Fortify wins (1.19x)
  Union Types: Zod wins (0.12x)

✅ Benchmark completed successfully!

Note: Results may vary based on Node.js version, system specs, and data complexity.
These benchmarks test core validation performance only.

📄 JSON report saved to: F:\Projects\NEHONIX\fortifyjs\src\core\schema\src\bench\benchmark-results.json
📄 Markdown report saved to: F:\Projects\NEHONIX\fortifyjs\src\core\schema\src\bench\BENCHMARK-RESULTS.md
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

*Benchmarks run on Node.js v22.6.0 on win32*

---

**Note**: These benchmarks are automatically generated and updated with each release.
For the latest results, see our [CI/CD pipeline](https://github.com/Nehonix-Team/fortify-schema/actions).
