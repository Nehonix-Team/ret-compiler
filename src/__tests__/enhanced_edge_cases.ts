import { Interface } from "../core/schema/mode/interfaces/Interface";

console.log("🔬 ENHANCED EDGE CASE TEST SUITE - ADDRESSING FEEDBACK");
console.log("=" + "=".repeat(70));

// Test cases addressing the critical feedback issues
const EnhancedEdgeCases = [
  {
    name: "🔢 Critical Numeric Edge Cases - Data Integrity",
    description: "Testing how the system handles special numeric values without data loss",
    tests: [
      {
        name: "Infinity Values",
        schema: Interface({
          id: "string",
          positiveInf: "when config.test.$exists() *? number : =0",
          negativeInf: "when config.test.$exists() *? number : =0",
        }).allowUnknown(),
        input: {
          id: "infinity-test",
          config: { test: true },
          positiveInf: Infinity,
          negativeInf: -Infinity,
        },
        expectedBehavior: "should_preserve_infinity_values",
      },
      {
        name: "NaN Values",
        schema: Interface({
          id: "string",
          nanValue: "when config.test.$exists() *? number : =0",
        }).allowUnknown(),
        input: {
          id: "nan-test",
          config: { test: true },
          nanValue: NaN,
        },
        expectedBehavior: "should_preserve_nan_or_error",
      },
      {
        name: "Zero Variants",
        schema: Interface({
          id: "string",
          positiveZero: "when config.test.$exists() *? number : =1",
          negativeZero: "when config.test.$exists() *? number : =1",
        }).allowUnknown(),
        input: {
          id: "zero-test",
          config: { test: true },
          positiveZero: 0,
          negativeZero: -0,
        },
        expectedBehavior: "should_distinguish_zero_signs",
      }
    ]
  },

  {
    name: "📊 Array Content Integrity",
    description: "Testing array validation without silent coercion",
    tests: [
      {
        name: "Special Numeric Arrays",
        schema: Interface({
          id: "string",
          specialNumbers: "when config.test.$exists() *? number[] : =[1,2,3]",
        }).allowUnknown(),
        input: {
          id: "array-test",
          config: { test: true },
          specialNumbers: [NaN, Infinity, -Infinity, 0, -0],
        },
        expectedBehavior: "should_preserve_or_error_on_special_values",
      },
      {
        name: "Mixed Type Arrays",
        schema: Interface({
          id: "string",
          mixedArray: "when config.test.$exists() *? any[] : =[]",
        }).allowUnknown(),
        input: {
          id: "mixed-test",
          config: { test: true },
          mixedArray: [null, undefined, NaN, Infinity, "string", 42, true],
        },
        expectedBehavior: "should_preserve_all_types",
      }
    ]
  },

  {
    name: "🛡️ Validation Mode Testing",
    description: "Testing different validation strictness levels",
    tests: [
      {
        name: "Strict Mode Simulation",
        schema: Interface({
          id: "string",
          strictNumber: "when config.strict.$exists() *? number : =0",
        }).allowUnknown(),
        input: {
          id: "strict-test",
          config: { strict: true },
          strictNumber: "123", // Should fail in strict mode
        },
        shouldFail: true,
        expectedBehavior: "should_reject_type_coercion",
      }
    ]
  },

  {
    name: "🔍 Data Loss Detection",
    description: "Detecting silent data transformations",
    tests: [
      {
        name: "BigInt Handling",
        schema: Interface({
          id: "string",
          bigIntValue: "when config.test.$exists() *? any : =0",
        }).allowUnknown(),
        input: {
          id: "bigint-test",
          config: { test: true },
          bigIntValue: BigInt("9007199254740991123456789"),
        },
        expectedBehavior: "should_preserve_bigint",
      },
      {
        name: "Symbol Properties",
        schema: Interface({
          id: "string",
          symbolValue: "when config.test.$exists() *? any : =null",
        }).allowUnknown(),
        input: {
          id: "symbol-test",
          config: { test: true },
          symbolValue: Symbol("test"),
        },
        expectedBehavior: "should_handle_symbols",
      }
    ]
  }
];

// Enhanced test runner with detailed analysis
function runEnhancedEdgeCases() {
  let totalTests = 0;
  let passedTests = 0;
  let dataIntegrityIssues = 0;

  EnhancedEdgeCases.forEach((category, categoryIndex) => {
    console.log(`\n🔬 Category ${categoryIndex + 1}: ${category.name}`);
    console.log(`Description: ${category.description}`);
    console.log("-".repeat(60));

    category.tests.forEach((test, testIndex) => {
      totalTests++;
      console.log(`\n  Test ${testIndex + 1}: ${test.name}`);
      
      try {
        const startTime = performance.now();
        const result = test.schema.safeParse(test.input);
        const endTime = performance.now();

        console.log(`  ⏱️  Time: ${(endTime - startTime).toFixed(2)}ms`);

        if (result.success) {
          if (test.shouldFail) {
            console.log("  ⚠️  UNEXPECTED SUCCESS - Should have failed!");
            dataIntegrityIssues++;
          } else {
            console.log("  ✅ SUCCESS");
            passedTests++;
            
            // Analyze data integrity
            analyzeDataIntegrity(test, result.data);
          }
        } else {
          if (test.shouldFail) {
            console.log("  ✅ EXPECTED FAILURE");
            console.log(`  🚨 Errors: ${result.errors}`);
            passedTests++;
          } else {
            console.log("  ❌ UNEXPECTED FAILURE");
            console.log(`  🚨 Errors: ${result.errors}`);
          }
        }
      } catch (error: any) {
        console.log(`  💥 EXCEPTION: ${error.message}`);
      }
    });
  });

  console.log("\n" + "=".repeat(70));
  console.log("📊 ENHANCED TEST RESULTS:");
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`⚠️  Data Integrity Issues: ${dataIntegrityIssues}`);
  console.log(`🎯 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (dataIntegrityIssues > 0) {
    console.log("\n🚨 CRITICAL: Data integrity issues detected!");
    console.log("   Recommendation: Fix numeric handling before production use");
  } else {
    console.log("\n🎉 All data integrity checks passed!");
  }
}

function analyzeDataIntegrity(test: any, output: any) {
  const input = test.input;
  
  // Check for data transformations
  Object.keys(input).forEach(key => {
    if (key === 'id' || key === 'config') return;
    
    const inputValue = input[key];
    const outputValue = output[key];
    
    // Check for silent transformations
    if (inputValue !== outputValue) {
      if (Number.isNaN(inputValue) && outputValue === null) {
        console.log(`  ⚠️  Data Loss: NaN → null for ${key}`);
      } else if (inputValue === Infinity && outputValue === null) {
        console.log(`  ⚠️  Data Loss: Infinity → null for ${key}`);
      } else if (inputValue === -Infinity && outputValue === null) {
        console.log(`  ⚠️  Data Loss: -Infinity → null for ${key}`);
      } else if (typeof inputValue !== typeof outputValue) {
        console.log(`  ⚠️  Type Change: ${typeof inputValue} → ${typeof outputValue} for ${key}`);
      } else {
        console.log(`  ℹ️  Value Change: ${inputValue} → ${outputValue} for ${key}`);
      }
    } else {
      console.log(`  ✅ Preserved: ${key} = ${inputValue}`);
    }
  });
}

if (require.main === module) {
  runEnhancedEdgeCases();
}

export { EnhancedEdgeCases, runEnhancedEdgeCases };
