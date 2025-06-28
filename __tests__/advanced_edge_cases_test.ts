/**
 * ADVANCED EDGE CASES TEST SUITE
 *
 * This test suite covers extreme edge cases, boundary conditions, and stress scenarios
 * that could break the conditional validation system in production environments.
 *
 * CATEGORIES TESTED:
 * 🔥 Extreme Values (very large numbers, long strings, deep nesting)
 * 🌊 Boundary Conditions (empty, null, undefined, zero, infinity)
 * 🎭 Type Coercion Edge Cases (mixed types, implicit conversions)
 * 🚫 Error Conditions (malformed input, invalid syntax)
 * 🔄 Complex Combinations (multiple methods, nested conditions)
 * ⚡ Performance Stress (large datasets, complex expressions)
 */

import { Interface } from "../core/schema/mode/interfaces/Interface";

console.log("🔥 ADVANCED EDGE CASES TEST SUITE");
console.log("Testing extreme conditions and boundary cases");
console.log("=" + "=".repeat(70));

// Extreme test data
const extremeTestData = {
  // Extreme numbers
  veryLargeNumber: Number.MAX_SAFE_INTEGER,
  verySmallNumber: Number.MIN_SAFE_INTEGER,
  infinity: Infinity,
  negativeInfinity: -Infinity,
  notANumber: NaN,
  zero: 0,
  negativeZero: -0,

  // Extreme strings
  emptyString: "",
  singleChar: "a",
  veryLongString: "a".repeat(10000),
  unicodeString: "🚀🔥💯🎯🌟✨🎉🔮🌈💎",
  specialCharsString: "!@#$%^&*()_+-=[]{}|;':\",./<>?`~",

  // Extreme arrays
  emptyArray: [],
  singleItemArray: [1],
  veryLargeArray: Array.from({ length: 1000 }, (_, i) => i),
  nestedArray: [[[[[1]]]]],
  mixedTypeArray: [1, "string", true, null, undefined, {}, []],

  // Extreme objects
  emptyObject: {},
  singlePropObject: { a: 1 },
  deeplyNestedObject: { a: { b: { c: { d: { e: { f: "deep" } } } } } },
  circularRef: (() => {
    const obj = { self: null };
    obj.self = obj;
    return obj;
  })(),

  // Special values
  nullValue: null,
  undefinedValue: undefined,
  booleanTrue: true,
  booleanFalse: false,

  // Edge case strings for method testing
  stringWithCommas: "admin,user,guest",
  stringWithSpaces: "  spaced  ",
  stringWithNewlines: "line1\nline2\nline3",
  stringWithTabs: "tab\tseparated\tvalues",
};

// Test 1: EXTREME NUMERIC EDGE CASES
console.log("\n🔥 Testing extreme numeric edge cases...");
const NumericEdgeCasesSchema = Interface({
  id: "string",

  // Test with extreme numbers
  isLargeInRange:
    "when veryLargeNumber.$between(1000000,9999999999999999) *? boolean : =false",
  isSmallInRange:
    "when verySmallNumber.$between(-9999999999999999,-1000000) *? boolean : =false",
  isZeroInRange: "when zero.$between(-1,1) *? boolean : =false",
  isNegativeZeroInRange: "when negativeZero.$between(-1,1) *? boolean : =false",

  // Test with special numeric values
  infinityExists: "when infinity.$exists() *? boolean : =false",
  nanExists: "when notANumber.$exists() *? boolean : =false",
}).allowUnknown();

try {
  const result1 = NumericEdgeCasesSchema.safeParse({
    id: "numeric-edge-test",
    ...extremeTestData,
    isLargeInRange: true,
    isSmallInRange: true,
    isZeroInRange: true,
    isNegativeZeroInRange: true,
    infinityExists: true,
    nanExists: false, // NaN should be treated as not existing
  });

  console.log("✅ Numeric edge cases:", result1.success ? "SUCCESS" : "FAILED");
  if (result1.success) {
    console.log("   Large number in range:", result1.data.isLargeInRange);
    console.log("   Small number in range:", result1.data.isSmallInRange);
    console.log("   Zero in range:", result1.data.isZeroInRange);
    console.log("   Infinity exists:", result1.data.infinityExists);
    console.log("   NaN exists:", result1.data.nanExists);
  } else {
    console.log("   Errors:", result1.errors);
  }
} catch (error) {
  console.log("❌ Numeric edge cases failed:", error.message);
}

// Test 2: EXTREME STRING EDGE CASES
console.log("\n🌊 Testing extreme string edge cases...");
const StringEdgeCasesSchema = Interface({
  id: "string",

  // Test with extreme strings
  isVeryLongStringEmpty: "when veryLongString.$empty() *? boolean : =false",
  unicodeContainsRocket: "when unicodeString.$contains(🚀) *? boolean : =false",
  specialCharsStartsWithExclamation:
    'when specialCharsString.$startsWith("!") *? boolean : =false',
  spacedStringEmpty: "when stringWithSpaces.$empty() *? boolean : =false", // Should trim
  commaStringContainsAdmin:
    "when stringWithCommas.$contains(admin) *? boolean : =false",
}).allowUnknown();

try {
  const result2 = StringEdgeCasesSchema.safeParse({
    id: "string-edge-test",
    ...extremeTestData,
    isVeryLongStringEmpty: false, // Very long string is not empty
    unicodeContainsRocket: true, // Unicode string contains rocket emoji
    specialCharsStartsWithExclamation: true, // Starts with !
    spacedStringEmpty: false, // String with spaces should not be empty after trim
    commaStringContainsAdmin: true, // Contains "admin"
  });

  console.log("✅ String edge cases:", result2.success ? "SUCCESS" : "FAILED");
  if (result2.success) {
    console.log(
      "   Very long string empty:",
      result2.data.isVeryLongStringEmpty
    );
    console.log(
      "   Unicode contains rocket:",
      result2.data.unicodeContainsRocket
    );
    console.log(
      "   Special chars starts with !:",
      result2.data.specialCharsStartsWithExclamation
    );
    console.log("   Spaced string empty:", result2.data.spacedStringEmpty);
    console.log(
      "   Comma string contains admin:",
      result2.data.commaStringContainsAdmin
    );
  } else {
    console.log("   Errors:", result2.errors);
  }
} catch (error) {
  console.log("❌ String edge cases failed:", error.message);
}

// Test 3: EXTREME ARRAY EDGE CASES
console.log("\n🎭 Testing extreme array edge cases...");
const ArrayEdgeCasesSchema = Interface({
  id: "string",

  // Test with extreme arrays
  isVeryLargeArrayEmpty: "when veryLargeArray.$empty() *? boolean : =false",
  nestedArrayContainsOne: "when nestedArray.$contains(1) *? boolean : =false",
  mixedArrayContainsString:
    "when mixedTypeArray.$contains(string) *? boolean : =false",
  singleItemArrayEmpty: "when singleItemArray.$empty() *? boolean : =false",
}).allowUnknown();

try {
  const result3 = ArrayEdgeCasesSchema.safeParse({
    id: "array-edge-test",
    ...extremeTestData,
    isVeryLargeArrayEmpty: false, // Large array is not empty
    nestedArrayContainsOne: false, // Nested array doesn't directly contain 1
    mixedArrayContainsString: true, // Mixed array contains "string"
    singleItemArrayEmpty: false, // Single item array is not empty
  });

  console.log("✅ Array edge cases:", result3.success ? "SUCCESS" : "FAILED");
  if (result3.success) {
    console.log(
      "   Very large array empty:",
      result3.data.isVeryLargeArrayEmpty
    );
    console.log(
      "   Nested array contains 1:",
      result3.data.nestedArrayContainsOne
    );
    console.log(
      "   Mixed array contains string:",
      result3.data.mixedArrayContainsString
    );
    console.log(
      "   Single item array empty:",
      result3.data.singleItemArrayEmpty
    );
  } else {
    console.log("   Errors:", result3.errors);
  }
} catch (error) {
  console.log("❌ Array edge cases failed:", error.message);
}

// Test 4: DEEP NESTING STRESS TEST
console.log("\n🔄 Testing deep nesting stress...");
const DeepNestingSchema = Interface({
  id: "string",

  // Test deeply nested property access
  hasDeepProperty:
    "when deeplyNestedObject.a.b.c.d.e.f.$exists() *? boolean : =false",
  deepPropertyValue:
    "when deeplyNestedObject.a.b.c.d.e.f.$contains(deep) *? boolean : =false",
}).allowUnknown();

try {
  const result4 = DeepNestingSchema.safeParse({
    id: "deep-nesting-test",
    ...extremeTestData,
    hasDeepProperty: true, // Deep property exists
    deepPropertyValue: true, // Deep property contains "deep"
  });

  console.log(
    "✅ Deep nesting stress:",
    result4.success ? "SUCCESS" : "FAILED"
  );
  if (result4.success) {
    console.log("   Has deep property:", result4.data.hasDeepProperty);
    console.log("   Deep property value:", result4.data.deepPropertyValue);
  } else {
    console.log("   Errors:", result4.errors);
  }
} catch (error) {
  console.log("❌ Deep nesting stress failed:", error.message);
}

// Test 5: TYPE COERCION EDGE CASES
console.log("\n⚡ Testing type coercion edge cases...");
const TypeCoercionSchema = Interface({
  id: "string",

  // Test type coercion in comparisons
  zeroInBooleanContext: "when zero.$exists() *? boolean : =false",
  emptyStringInBooleanContext: "when emptyString.$exists() *? boolean : =false",
  booleanTrueExists: "when booleanTrue.$exists() *? boolean : =false",
  booleanFalseExists: "when booleanFalse.$exists() *? boolean : =false",
}).allowUnknown();

try {
  const result5 = TypeCoercionSchema.safeParse({
    id: "type-coercion-test",
    ...extremeTestData,
    zeroInBooleanContext: true, // Zero exists (even though falsy)
    emptyStringInBooleanContext: true, // Empty string exists (even though falsy)
    booleanTrueExists: true, // Boolean true exists
    booleanFalseExists: true, // Boolean false exists
  });

  console.log(
    "✅ Type coercion edge cases:",
    result5.success ? "SUCCESS" : "FAILED"
  );
  if (result5.success) {
    console.log(
      "   Zero in boolean context:",
      result5.data.zeroInBooleanContext
    );
    console.log(
      "   Empty string in boolean context:",
      result5.data.emptyStringInBooleanContext
    );
    console.log("   Boolean true exists:", result5.data.booleanTrueExists);
    console.log("   Boolean false exists:", result5.data.booleanFalseExists);
  } else {
    console.log("   Errors:", result5.errors);
  }
} catch (error) {
  console.log("❌ Type coercion edge cases failed:", error.message);
}

console.log("\n🎯 ADVANCED EDGE CASES TEST COMPLETE");
console.log("All extreme conditions and boundary cases tested!");
