/**
 * Comprehensive Edge Case Test Suite for Fortify Schema
 *
 * These tests focus on boundary conditions and edge cases that could break the system
 */

import { Interface } from "../core/schema/mode/interfaces/Interface";

const EdgeCaseTestSuite = [
  {
    name: "🕳️ Null vs Undefined vs Empty Runtime Properties",
    description:
      "Testing how the system handles different 'falsy' runtime conditions",
    schema: Interface({
      id: "string",
      feature1: "when nullProp.$exists() *? boolean : =false",
      feature2: "when undefinedProp.$exists() *? boolean : =false",
      feature3: "when emptyObject.$exists() *? boolean : =false",
      feature4: "when emptyArray.$exists() *? boolean : =false",
      feature5: "when zeroProp.$exists() *? boolean : =false",
      feature6: "when emptyString.$exists() *? boolean : =false",
    }).allowUnknown(),
    input: {
      id: "edge-test",
      nullProp: null,
      undefinedProp: undefined,
      emptyObject: {},
      emptyArray: [],
      zeroProp: 0,
      emptyString: "",

      // User provides values for all features
      feature1: true,
      feature2: true,
      feature3: true,
      feature4: true,
      feature5: true,
      feature6: true,
    },
    expectedBehavior: {
      // Define expected behavior for each case
      nullProp: "should_not_exist", // null should be treated as non-existent
      undefinedProp: "should_not_exist", // undefined should be treated as non-existent
      emptyObject: "should_exist", // {} is an object, should exist
      emptyArray: "should_exist", // [] is an array, should exist
      zeroProp: "should_exist", // 0 is a valid number, should exist
      emptyString: "should_exist", // "" is a valid string, should exist
    },
  },

  {
    name: "🌊 Extremely Deep Nesting (Performance Test)",
    description: "Testing system limits with very deep object nesting",
    schema: Interface({
      id: "string",
      deepFeature:
        "when level1.level2.level3.level4.level5.level6.level7.level8.level9.level10.value.$exists() *? boolean : =false",
    }).allowUnknown(),
    input: {
      id: "deep-nesting-test",
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
                          value:
                            "bingo!!! You found me ! 😎🤣😂 What a journey! 🏆",
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
      deepFeature: true,
    },
  },

  {
    name: "🔢 Numeric Edge Cases",
    description:
      "Testing edge cases with numbers (floats, integers, very large numbers)",
    schema: Interface({
      id: "string",
      floatFeature: "when config.floats.$exists() *? number : =0.1",
      intFeature: "when config.integers.$exists() *? int : =42",
      largeNumberFeature:
        "when config.large.$exists() *? number : =999999999999999",
      negativeFeature: "when config.negative.$exists() *? number : =-1",
    }).allowUnknown(),
    input: {
      id: "numeric-edge-test",
      config: {
        floats: true,
        integers: true,
        large: true,
        negative: true,
      },

      // Test edge cases
      floatFeature: 0.0000000001, // Very small float
      intFeature: 9223372036854775807, // Max safe integer
      largeNumberFeature: 1.7976931348623157e308, // Max number
      negativeFeature: -Infinity, // Negative infinity
    },
  },

  {
    name: "📚 Array Edge Cases",
    description: "Testing arrays with edge case contents",
    schema: Interface({
      id: "string",
      tags: 'when metadata.tagging.$exists() *? string[] : =["default"]',
      numbers: "when metadata.numbers.$exists() *? number[] : =[1,2,3]",
      complex: 'when metadata.complex.$exists() *? object[] : =[{"id":1}]',
    }).allowUnknown(),
    input: {
      id: "array-edge-test",
      metadata: {
        tagging: true,
        numbers: true,
        complex: true,
      },

      // Edge case arrays
      tags: [], // Empty array
      numbers: [NaN, Infinity, -Infinity, 0, -0], // Special number values
      complex: [null, undefined, {}, { nested: { deep: "value" } }], // Mixed content
    },
  },

  {
    name: "🎭 Type Coercion Attempts",
    description:
      "Testing if the system properly rejects type coercion attempts",
    schema: Interface({
      id: "string",
      strictBoolean: "when config.strict.$exists() *? boolean : =false",
      strictNumber: "when config.strict.$exists() *? number : =0",
      strictString: 'when config.strict.$exists() *? string : ="default"',
    }).allowUnknown(),
    input: {
      id: "coercion-test",
      config: { strict: true },

      // Values that could be coerced but shouldn't be
      strictBoolean: "true", // String "true" should not become boolean true
      strictNumber: "123", // String "123" should not become number 123
      strictString: 123, // Number 123 should not become string "123"
    },
    shouldFail: true,
    expectedErrors: [
      "strictBoolean: Expected boolean, got string",
      "strictNumber: Expected number, got string",
      "strictString: Expected string, got number",
    ],
  }, 

  {
    name: "🌀 Circular Reference Handling",
    description:
      "Testing how the system handles circular references in runtime properties",
    schema: Interface({
      id: "string",
      circularFeature: "when circular.ref.$exists() *? boolean : =false",
    }).allowUnknown(),
    createInput: () => {
      const obj: any = {
        id: "circular-test",
        circularFeature: true,
      };

      // Create circular reference
      const circular: any = { ref: true };
      circular.self = circular;
      obj.circular = circular;

      return obj;
    },
  },

  {
    name: "🚫 Special Characters in Runtime Paths",
    description: "Testing runtime property paths with special characters",
    schema: Interface({
      id: "string",
      specialFeature:
        'when config["special-key"].$exists() *? boolean : =false',
      unicodeFeature: "when config.unicode_🚀.$exists() *? boolean : =false",
    }).allowUnknown(),
    input: {
      id: "special-chars-test",
      config: {
        "special-key": true,
        "unicode_🚀": true,
      },
      specialFeature: true,
      unicodeFeature: true,
    },
  },

  {
    name: "⚡ Performance Stress Test - Many Conditions",
    description: "Testing performance with many conditional fields",
    schema: (() => {
      const fields: any = { id: "string" };

      // Create 100 conditional fields
      for (let i = 0; i < 100; i++) {
        fields[`feature${i}`] =
          `when config.feature${i}.$exists() *? boolean : =false`;
      }

      return Interface(fields).allowUnknown();
    })(),
    createInput: () => {
      const input: any = { id: "performance-test" };
      const config: any = {};

      // Enable every other feature (50 conditions true, 50 false)
      for (let i = 0; i < 100; i++) {
        if (i % 2 === 0) {
          config[`feature${i}`] = true;
          input[`feature${i}`] = true;
        } else {
          input[`feature${i}`] = true; // This should be ignored and defaulted
        }
      }

      input.config = config;
      return input;
    },
  },

  {
    name: "🔐 Security Edge Case - Prototype Pollution",
    description: "Testing protection against prototype pollution attempts",
    schema: Interface({
      id: "string",
      normalFeature: "when config.normal.$exists() *? boolean : =false",
    }).allowUnknown(),
    input: {
      id: "security-test",
      constructor: { prototype: { polluted: true } },
      config: { normal: true },
      normalFeature: true,
    },
  },
];

// Helper function to safely stringify objects with circular references
function safeStringify(obj: any, indent: number = 0): string {
  const seen = new WeakSet();

  return JSON.stringify(
    obj,
    (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return "[Circular Reference]";
        }
        seen.add(value);
      }
      return value;
    },
    indent
  );
}

// Test runner for edge cases
function runEdgeCaseTests() {
  console.log("🕳️ EDGE CASE TEST SUITE");
  console.log("=" + "=".repeat(50));

  EdgeCaseTestSuite.forEach((testCase, index) => {
    console.log(`\n🔍 Edge Test ${index + 1}: ${testCase.name}`);
    console.log(`Description: ${testCase.description}`);

    try {
      // Handle dynamic input creation
      const input =
        typeof testCase.createInput === "function"
          ? testCase.createInput()
          : testCase.input;

      console.log("\n📥 Input:", safeStringify(input, 2));

      const startTime = performance.now();
      const result = testCase.schema.safeParse(input);
      const endTime = performance.now();

      console.log(`⏱️  Execution Time: ${(endTime - startTime).toFixed(2)}ms`);

      if (result.success) {
        if (testCase.shouldFail) {
          console.log("⚠️  UNEXPECTED SUCCESS - This test should have failed!");
        } else {
          console.log("✅ SUCCESS");
          console.log("📤 Output:", safeStringify(result.data, 2));

          // Special analysis for edge cases
          if (testCase.expectedBehavior) {
            analyzeEdgeCaseBehavior(testCase, result.data, input);
          }
        }
      } else {
        if (testCase.shouldFail) {
          console.log("✅ EXPECTED FAILURE");
          console.log("🚨 Errors:", result.errors);

          if (testCase.expectedErrors) {
            validateExpectedErrors(result.errors, testCase.expectedErrors);
          }
        } else {
          console.log("❌ UNEXPECTED FAILURE");
          console.log("🚨 Errors:", result.errors);
        }
      }
    } catch (error) {
      console.log("💥 EXCEPTION:", error.message);
    }
  });
}

function analyzeEdgeCaseBehavior(testCase: any, output: any, input: any) {
  console.log("\n🧠 Edge Case Analysis:");

  if (testCase.name.includes("Null vs Undefined")) {
    const behaviors = testCase.expectedBehavior;

    Object.keys(behaviors).forEach((prop) => {
      const expected = behaviors[prop];
      const featureName = `feature${Object.keys(behaviors).indexOf(prop) + 1}`;
      const outputValue = output[featureName];
      const inputValue = input[prop];

      console.log(
        `  ${prop} (${typeof inputValue}, value: ${JSON.stringify(inputValue)}):`
      );
      console.log(`    Expected: ${expected}`);
      console.log(
        `    Feature Output: ${outputValue} (${expected === "should_exist" ? outputValue === true : outputValue === false ? "✅" : "❌"})`
      );
    });
  }
}

function validateExpectedErrors(actualErrors: any[], expectedErrors: string[]) {
  console.log("\n🔍 Error Validation:");

  expectedErrors.forEach((expectedError) => {
    const found = actualErrors.some(
      (error) =>
        error.toString().includes(expectedError) ||
        error.message?.includes(expectedError)
    );

    console.log(`  "${expectedError}": ${found ? "✅" : "❌"}`);
  });
}

if (require.main === module) {
  runEdgeCaseTests();
}
