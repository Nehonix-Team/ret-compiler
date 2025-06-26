# Fortify Schema vs Zod - Performance Benchmark Results

## 📊 Executive Summary

**Generated:** 25/06/2025 22:33:42
**Node.js Version:** v22.6.0
**Platform:** win32 (x64)

### 🏆 Overall Results

| Metric | Value |
|--------|-------|
| **Total Tests** | 4 |
| **Fortify Schema Wins** | 1/4 tests |
| **Zod Wins** | 3/4 tests |
| **Overall Winner** | **Zod** |
| **Average Performance** | Zod is 0.67x slower |

### 💾 Memory Usage

- **Total Memory for 1000 schemas:** 6.28 MB
- **Memory per schema pair:** 6.43 KB

## 📋 Detailed Test Results


### 1. Simple Schema

**Winner:** 🏆 **Zod** (0.48x slower)

| Library | Total Time | Avg Time | Ops/Second |
|---------|------------|----------|------------|
| **Fortify Schema** | 118.32ms | 0.0118ms | 84516 |
| **Zod** | 56.90ms | 0.0057ms | 175748 |


### 2. Complex Schema

**Winner:** 🏆 **Zod** (0.81x slower)

| Library | Total Time | Avg Time | Ops/Second |
|---------|------------|----------|------------|
| **Fortify Schema** | 61.14ms | 0.0122ms | 81780 |
| **Zod** | 49.30ms | 0.0099ms | 101418 |


### 3. Array Schema

**Winner:** 🏆 **Fortify** (1.34x faster)

| Library | Total Time | Avg Time | Ops/Second |
|---------|------------|----------|------------|
| **Fortify Schema** | 29.84ms | 0.0037ms | 268129 |
| **Zod** | 39.87ms | 0.0050ms | 200660 |


### 4. Union Types

**Winner:** 🏆 **Zod** (0.06x slower)

| Library | Total Time | Avg Time | Ops/Second |
|---------|------------|----------|------------|
| **Fortify Schema** | 130.31ms | 0.0109ms | 92090 |
| **Zod** | 8.34ms | 0.0007ms | 1439056 |


## 🎯 Performance Analysis

### Strengths of Fortify Schema
- **Array Schema**: 1.34x faster than Zod

### Strengths of Zod
- **Simple Schema**: 2.08x faster than Fortify Schema
- **Complex Schema**: 1.24x faster than Fortify Schema
- **Union Types**: 15.63x faster than Fortify Schema

## 📈 Performance Trends

### Best Performing Test Cases
1. **Array Schema**: 268129 ops/sec
1. **Union Types**: 92090 ops/sec

### Areas for Improvement
- **Union Types**: Currently 15.63x slower than Zod
- **Simple Schema**: Currently 2.08x slower than Zod
- **Complex Schema**: Currently 1.24x slower than Zod

## 🔧 Technical Details

### Test Environment
- **Node.js:** v22.6.0
- **Platform:** win32
- **Architecture:** x64
- **Fortify Schema Version:** 2.0.1
- **Zod Version:** 3.25.67

### Methodology
- Each test includes a warm-up phase of 100 iterations
- Performance measurements exclude warm-up time
- Memory usage measured for 1000 schema instances
- Results averaged across multiple runs for consistency

## 📝 Notes

- Results may vary based on Node.js version, system specifications, and data complexity
- These benchmarks test core validation performance only
- Memory usage includes both libraries for fair comparison
- All tests use equivalent validation logic between libraries

---

*Last updated: 25/06/2025 22:33:42*
*Generated automatically by scripts/benchmark-vs-zod.js !*
*Try it yourself: bun run scripts/benchmark-vs-zod.js or npx tsx scripts/benchmark-vs-zod.js*
