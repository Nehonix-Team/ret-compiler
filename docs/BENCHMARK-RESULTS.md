# Fortify Schema vs Zod - Performance Benchmark Results

## 📊 Executive Summary

**Generated:** 23/06/2025 11:07:37
**Node.js Version:** v22.12.0
**Platform:** win32 (x64)

### 🏆 Overall Results

| Metric | Value |
|--------|-------|
| **Total Tests** | 4 |
| **Fortify Schema Wins** | 3/4 tests |
| **Zod Wins** | 1/4 tests |
| **Overall Winner** | **Zod** |
| **Average Performance** | Zod is 0.92x slower |

### 💾 Memory Usage

- **Total Memory for 1000 schemas:** 9.58 MB
- **Memory per schema pair:** 9.81 KB

## 📋 Detailed Test Results


### 1. Simple Schema

**Winner:** 🏆 **Fortify** (1.19x faster)

| Library | Total Time | Avg Time | Ops/Second |
|---------|------------|----------|------------|
| **Fortify Schema** | 50.84ms | 0.0051ms | 196692 |
| **Zod** | 60.38ms | 0.0060ms | 165619 |


### 2. Complex Schema

**Winner:** 🏆 **Fortify** (1.07x faster)

| Library | Total Time | Avg Time | Ops/Second |
|---------|------------|----------|------------|
| **Fortify Schema** | 72.61ms | 0.0145ms | 68860 |
| **Zod** | 77.39ms | 0.0155ms | 64607 |


### 3. Array Schema

**Winner:** 🏆 **Fortify** (1.08x faster)

| Library | Total Time | Avg Time | Ops/Second |
|---------|------------|----------|------------|
| **Fortify Schema** | 41.15ms | 0.0051ms | 194405 |
| **Zod** | 44.52ms | 0.0056ms | 179694 |


### 4. Union Types

**Winner:** 🏆 **Zod** (0.33x slower)

| Library | Total Time | Avg Time | Ops/Second |
|---------|------------|----------|------------|
| **Fortify Schema** | 27.18ms | 0.0023ms | 441449 |
| **Zod** | 9.06ms | 0.0008ms | 1323846 |


## 🎯 Performance Analysis

### Strengths of Fortify Schema
- **Simple Schema**: 1.19x faster than Zod
- **Complex Schema**: 1.07x faster than Zod
- **Array Schema**: 1.08x faster than Zod

### Strengths of Zod
- **Union Types**: 3.00x faster than Fortify Schema

## 📈 Performance Trends

### Best Performing Test Cases
1. **Union Types**: 441449 ops/sec
1. **Simple Schema**: 196692 ops/sec

### Areas for Improvement
- **Union Types**: Currently 3.00x slower than Zod

## 🔧 Technical Details

### Test Environment
- **Node.js:** v22.12.0
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

*Last updated: 23/06/2025 11:07:37*
*Generated automatically by benchmark-vs-zod.js*
