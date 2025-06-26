# Fortify Schema vs Zod - Performance Benchmark Results

## 📊 Executive Summary

**Generated:** 26/06/2025 12:17:50
**Node.js Version:** v22.12.0
**Platform:** win32 (x64)

### 🏆 Overall Results  

| Metric | Value |
|--------|-------|
| **Total Tests** | 4 |
| **Fortify Schema Wins** | 3/4 tests |
| **Zod Wins** | 1/4 tests |
| **Overall Winner** | **Fortify Schema** |
| **Average Performance** | Fortify Schema is 8.99x faster |

### 💾 Memory Usage

- **Total Memory for 1000 schemas:** 9.54 MB
- **Memory per schema pair:** 9.77 KB

## 📋 Detailed Test Results


### 1. Simple Schema

**Winner:** 🏆 **Fortify** (4.01x faster)

| Library | Total Time | Avg Time | Ops/Second |
|---------|------------|----------|------------|
| **Fortify Schema** | 47.33ms | 0.0005ms | 2112709 |
| **Zod** | 189.92ms | 0.0019ms | 526528 |


### 2. Complex Schema

**Winner:** 🏆 **Fortify** (28.37x faster)

| Library | Total Time | Avg Time | Ops/Second |
|---------|------------|----------|------------|
| **Fortify Schema** | 1.13ms | 0.0002ms | 4422431 |
| **Zod** | 32.07ms | 0.0064ms | 155897 |


### 3. Array Schema

**Winner:** 🏆 **Fortify** (2.91x faster)

| Library | Total Time | Avg Time | Ops/Second |
|---------|------------|----------|------------|
| **Fortify Schema** | 6.17ms | 0.0008ms | 1297501 |
| **Zod** | 17.94ms | 0.0022ms | 445951 |


### 4. Union Types

**Winner:** 🏆 **Zod** (0.67x slower)

| Library | Total Time | Avg Time | Ops/Second |
|---------|------------|----------|------------|
| **Fortify Schema** | 12.21ms | 0.0010ms | 982463 |
| **Zod** | 8.19ms | 0.0007ms | 1465720 |


## 🎯 Performance Analysis

### Strengths of Fortify Schema
- **Simple Schema**: 4.01x faster than Zod
- **Complex Schema**: 28.37x faster than Zod
- **Array Schema**: 2.91x faster than Zod

### Strengths of Zod
- **Union Types**: 1.49x faster than Fortify Schema

## 📈 Performance Trends

### Best Performing Test Cases
1. **Complex Schema**: 4422431 ops/sec
1. **Simple Schema**: 2112709 ops/sec

### Areas for Improvement
- **Union Types**: Currently 1.49x slower than Zod

## 🔧 Technical Details

### Test Environment
- **Node.js:** v22.12.0
- **Platform:** win32
- **Architecture:** x64
- **Fortify Schema Version:** 2.0.2
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

*Last updated: 26/06/2025 12:17:50*
*Generated automatically by scripts/benchmark-vs-zod.js !*
*Try it yourself: bun run scripts/benchmark-vs-zod.js or npx tsx scripts/benchmark-vs-zod.js*
