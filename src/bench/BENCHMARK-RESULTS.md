# Fortify Schema vs Zod - Performance Benchmark Results

## 📊 Executive Summary

**Generated:** 24/06/2025 19:13:56
**Node.js Version:** v22.6.0
**Platform:** win32 (x64)

### 🏆 Overall Results

| Metric | Value |
|--------|-------|
| **Total Tests** | 4 |
| **Fortify Schema Wins** | 1/4 tests |
| **Zod Wins** | 3/4 tests |
| **Overall Winner** | **Fortify Schema** |
| **Average Performance** | Fortify Schema is 1.03x faster |

### 💾 Memory Usage

- **Total Memory for 1000 schemas:** 2.41 MB
- **Memory per schema pair:** 2.47 KB

## 📋 Detailed Test Results


### 1. Simple Schema

**Winner:** 🏆 **Zod** (0.87x slower)

| Library | Total Time | Avg Time | Ops/Second |
|---------|------------|----------|------------|
| **Fortify Schema** | 56.02ms | 0.0056ms | 178496 |
| **Zod** | 48.46ms | 0.0048ms | 206344 |


### 2. Complex Schema

**Winner:** 🏆 **Zod** (0.89x slower)

| Library | Total Time | Avg Time | Ops/Second |
|---------|------------|----------|------------|
| **Fortify Schema** | 49.51ms | 0.0099ms | 100985 |
| **Zod** | 43.98ms | 0.0088ms | 113684 |


### 3. Array Schema

**Winner:** 🏆 **Fortify** (1.60x faster)

| Library | Total Time | Avg Time | Ops/Second |
|---------|------------|----------|------------|
| **Fortify Schema** | 30.90ms | 0.0039ms | 258910 |
| **Zod** | 49.44ms | 0.0062ms | 161822 |


### 4. Union Types

**Winner:** 🏆 **Zod** (0.75x slower)

| Library | Total Time | Avg Time | Ops/Second |
|---------|------------|----------|------------|
| **Fortify Schema** | 26.07ms | 0.0022ms | 460214 |
| **Zod** | 19.56ms | 0.0016ms | 613362 |


## 🎯 Performance Analysis

### Strengths of Fortify Schema
- **Array Schema**: 1.60x faster than Zod

### Strengths of Zod
- **Simple Schema**: 1.16x faster than Fortify Schema
- **Complex Schema**: 1.13x faster than Fortify Schema
- **Union Types**: 1.33x faster than Fortify Schema

## 📈 Performance Trends

### Best Performing Test Cases
1. **Union Types**: 460214 ops/sec
1. **Array Schema**: 258910 ops/sec

### Areas for Improvement
- **Union Types**: Currently 1.33x slower than Zod
- **Simple Schema**: Currently 1.16x slower than Zod
- **Complex Schema**: Currently 1.13x slower than Zod

## 🔧 Technical Details

### Test Environment
- **Node.js:** v22.6.0
- **Platform:** win32
- **Architecture:** x64
- **Fortify Schema Version:** 1.0.0
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

*Last updated: 24/06/2025 19:13:56*
*Generated automatically by scripts/enchmark-vs-zod.js !*
*Try it yourself: bun run scripts/enchmark-vs-zod.js or npx tsx scriptsenchmark-vs-zod.js*
