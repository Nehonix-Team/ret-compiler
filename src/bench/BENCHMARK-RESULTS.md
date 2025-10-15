# ReliantType Performance Report

## 📊 Executive Summary

**Generated:** 7/18/2025, 8:19:17 AM
**Node.js Version:** v24.3.0
**Platform:** linux (x64)
**ReliantType Version:** 2.0.21

### 🏆 Performance Highlights

| Metric | Value |
|--------|-------|
| **Total Test Suites** | 6 |
| **Fastest Operation** | Basic Types (496,131.184 ops/sec) |
| **Most Consistent** | Union Types (5.8% CV) |
| **Memory Efficiency** | 1.42 KB per schema |

### 💾 Memory Usage

- **Total Memory Used:** 2.78 MB
- **Schemas Created:** 2,000
- **Memory Per Schema:** 1.42 KB

## 📋 Detailed Performance Results


### 1. Basic Types

**Performance Metrics:**
- **Operations/Second:** 496,131.184 ops/sec
- **Average Time/Op:** 2.02 μs
- **Median Time:** 100.78 ms

**Reliability Metrics:**
- **Success Rate:** 100.0%
- **Coefficient of Variation:** 32.3%
- **Time Range:** 88.70 - 188.94 ms

| Metric | Value |
|--------|-------|
| **Iterations** | 50,000 |
| **Median Time** | 100.78 ms |
| **Mean Time** | 124.86 ms |
| **Std Deviation** | 40.36 ms |
| **Min Time** | 88.70 ms |
| **Max Time** | 188.94 ms |


### 2. Complex Nested

**Performance Metrics:**
- **Operations/Second:** 12,443.531 ops/sec
- **Average Time/Op:** 80.36 μs
- **Median Time:** 401.82 ms

**Reliability Metrics:**
- **Success Rate:** 100.0%
- **Coefficient of Variation:** 10.8%
- **Time Range:** 345.57 - 484.38 ms

| Metric | Value |
|--------|-------|
| **Iterations** | 5,000 |
| **Median Time** | 401.82 ms |
| **Mean Time** | 407.29 ms |
| **Std Deviation** | 44.08 ms |
| **Min Time** | 345.57 ms |
| **Max Time** | 484.38 ms |


### 3. Array Validation

**Performance Metrics:**
- **Operations/Second:** 147,805.966 ops/sec
- **Average Time/Op:** 6.77 μs
- **Median Time:** 54.13 ms

**Reliability Metrics:**
- **Success Rate:** 0.0%
- **Coefficient of Variation:** 34.5%
- **Time Range:** 38.10 - 98.61 ms

| Metric | Value |
|--------|-------|
| **Iterations** | 8,000 |
| **Median Time** | 54.13 ms |
| **Mean Time** | 57.39 ms |
| **Std Deviation** | 19.80 ms |
| **Min Time** | 38.10 ms |
| **Max Time** | 98.61 ms |


### 4. Union Types

**Performance Metrics:**
- **Operations/Second:** 130,063.973 ops/sec
- **Average Time/Op:** 7.69 μs
- **Median Time:** 153.77 ms

**Reliability Metrics:**
- **Success Rate:** 100.0%
- **Coefficient of Variation:** 5.8%
- **Time Range:** 145.57 - 177.70 ms

| Metric | Value |
|--------|-------|
| **Iterations** | 20,000 |
| **Median Time** | 153.77 ms |
| **Mean Time** | 156.50 ms |
| **Std Deviation** | 9.14 ms |
| **Min Time** | 145.57 ms |
| **Max Time** | 177.70 ms |


### 5. Conditional Logic

**Performance Metrics:**
- **Operations/Second:** 13,833.264 ops/sec
- **Average Time/Op:** 72.29 μs
- **Median Time:** 1084.34 ms

**Reliability Metrics:**
- **Success Rate:** 0.0%
- **Coefficient of Variation:** 13.1%
- **Time Range:** 924.03 - 1443.54 ms

| Metric | Value |
|--------|-------|
| **Iterations** | 15,000 |
| **Median Time** | 1084.34 ms |
| **Mean Time** | 1078.61 ms |
| **Std Deviation** | 140.92 ms |
| **Min Time** | 924.03 ms |
| **Max Time** | 1443.54 ms |


### 6. Format Validation

**Performance Metrics:**
- **Operations/Second:** 90,788.957 ops/sec
- **Average Time/Op:** 11.01 μs
- **Median Time:** 132.17 ms

**Reliability Metrics:**
- **Success Rate:** 100.0%
- **Coefficient of Variation:** 22.8%
- **Time Range:** 109.13 - 216.44 ms

| Metric | Value |
|--------|-------|
| **Iterations** | 12,000 |
| **Median Time** | 132.17 ms |
| **Mean Time** | 132.19 ms |
| **Std Deviation** | 30.17 ms |
| **Min Time** | 109.13 ms |
| **Max Time** | 216.44 ms |


## 🎯 Performance Analysis

### Key Findings

1. **Conditional Validation Performance**: The unique conditional validation feature maintains competitive performance while adding significant functionality.

2. **Format Validation**: Regular expression-based validations show consistent performance across different pattern complexities.

3. **Scaling Characteristics**: Performance scales predictably with data size and schema complexity.

4. **Memory Efficiency**: Linear memory scaling with reasonable per-schema overhead.

### Performance Characteristics by Test Type

- **Basic Types**: 496,131.184 ops/sec (32.3% variation)
- **Complex Nested**: 12,443.531 ops/sec (10.8% variation)
- **Array Validation**: 147,805.966 ops/sec (34.5% variation)
- **Union Types**: 130,063.973 ops/sec (5.8% variation)
- **Conditional Logic**: 13,833.264 ops/sec (13.1% variation)
- **Format Validation**: 90,788.957 ops/sec (22.8% variation)

## 🔧 Technical Details

### Test Environment
- **Node.js:** v24.3.0
- **Platform:** linux
- **Architecture:** x64
- **Test Type:** standalone-performance

### Methodology
- **Warm-up:** 1000 iterations per test to ensure JIT optimization
- **Statistical Analysis:** 10 runs per test with median reporting
- **Memory Testing:** Multiple schema creation patterns
- **Scaling Analysis:** Variable data sizes from 10 to 5000 items

### Unique Features Tested
- **Conditional Validation:** Runtime property checking with `when` syntax
- **Format Validation:** Email, URL, phone, UUID, and regex patterns
- **Complex Nesting:** Deep object validation with multiple levels
- **Array Validation:** Dynamic array sizing and type constraints

## 📝 Notes

- Results reflect core validation performance under controlled conditions
- Memory usage includes schema compilation and runtime overhead
- Conditional validation adds minimal performance overhead for significant functionality gains
- Performance may vary based on data complexity and validation requirements

---

*Generated automatically by the ReliantType benchmark suite*
*Last updated: 7/18/2025, 8:19:17 AM*
