import { Interface } from "./src/core/schema/mode/interfaces/Interface";

console.log("🧪 COMPREHENSIVE RUNTIME METHODS TEST SUITE");
console.log("Testing ALL available runtime methods with V2 syntax");
console.log("=" + "=".repeat(70));

// Test data with various scenarios
const testData = {
  id: "test-all-methods",

  // Runtime configuration objects
  config: {
    hasFeature: true,
    adminMode: true,
    "special-key": true,
    "unicode_🚀": true,
    retries: 5,
    tags: ["admin", "premium"],
    email: "admin@company.com",
    username: "DrSmith",
    filename: "document.pdf",
    age: 35,
    description: "",
    metadata: null,
    emptyArray: [],
    emptyObject: {},
  },

  // Test data for various scenarios
  testString: "hello world",
  testNumber: 42,
  testArray: ["item1", "item2", "item3"],
  testNull: null,
  testUndefined: undefined,
  testEmpty: "",
};

// Comprehensive schema testing all runtime methods
const AllMethodsSchema = Interface({
  id: "string",

  // 🧪 TEST 1: .$exists() method
  existsTest1: "when config.hasFeature.$exists() *? boolean : =false",
  existsTest2: "when config.nonExistent.$exists() *? boolean : =true",

  // 🧪 TEST 2: .$in() method
  inTest1: "when config.tags.$in(admin,premium) *? boolean : =false",
  inTest2: "when config.tags.$in(guest,basic) *? boolean : =true",

  // 🧪 TEST 3: .$contains() method
  containsTest1:
    "when config.email.$contains(@company.com) *? boolean : =false",
  containsTest2: "when config.email.$contains(@gmail.com) *? boolean : =true",

  // 🧪 TEST 4: .$startsWith() method
  startsWithTest1: "when config.username.$startsWith(Dr) *? boolean : =false",
  startsWithTest2: "when config.username.$startsWith(Mr) *? boolean : =true",

  // 🧪 TEST 5: .$endsWith() method
  endsWithTest1: "when config.filename.$endsWith(.pdf) *? boolean : =false",
  endsWithTest2: "when config.filename.$endsWith(.doc) *? boolean : =true",

  // 🧪 TEST 6: .$between() method (using numeric property)
  betweenTest1: "when config.retries.$between(1,10) *? boolean : =false",
  betweenTest2: "when config.retries.$between(20,30) *? boolean : =true",

  // 🧪 TEST 7: .$empty() method
  emptyTest1: "when config.description.$empty() *? boolean : =false",
  emptyTest2: "when config.nonEmptyField.$empty() *? boolean : =true",

  // 🧪 TEST 8: .$null() method
  nullTest1: "when config.metadata.$null() *? boolean : =false",
  nullTest2: "when config.nonNullField.$null() *? boolean : =true",

  // 🧪 TEST 9: Bracket notation with methods
  bracketTest1: 'when config["special-key"].$exists() *? boolean : =false',
  bracketTest2: 'when config["non-existent"].$exists() *? boolean : =true',

  // 🧪 TEST 10: Unicode/emoji properties with methods
  unicodeTest1: "when config.unicode_🚀.$exists() *? boolean : =false",
  unicodeTest2: "when config.unicode_🎯.$exists() *? boolean : =true",

  // 🧪 TEST 11: Complex nested properties
  nestedTest1: "when config.nested.deep.property.$exists() *? boolean : =false",
  nestedTest2: "when config.hasFeature.$exists() *? boolean : =true",

  // 🧪 TEST 12: Array methods
  arrayContainsTest1: "when config.tags.$contains(admin) *? boolean : =false",
  arrayContainsTest2: "when config.tags.$contains(guest) *? boolean : =true",
}).allowUnknown();

// Test runner function
function runAllMethodsTest() {
  console.log("\n🔬 RUNNING COMPREHENSIVE RUNTIME METHODS TEST:");
  console.log("-".repeat(70));

  const startTime = performance.now();
  const result = AllMethodsSchema.safeParse(testData);
  const endTime = performance.now();

  console.log(
    `⏱️  Total Execution Time: ${(endTime - startTime).toFixed(2)}ms`
  );

  if (result.success) {
    console.log("\n✅ SCHEMA VALIDATION: SUCCESS");
    console.log("\n📊 INDIVIDUAL METHOD TEST RESULTS:");

    // Analyze each test result
    const tests = [
      { name: ".$exists() - positive", field: "existsTest1", expected: true },
      { name: ".$exists() - negative", field: "existsTest2", expected: false },
      { name: ".$in() - positive", field: "inTest1", expected: true },
      { name: ".$in() - negative", field: "inTest2", expected: false },
      {
        name: ".$contains() - positive",
        field: "containsTest1",
        expected: true,
      },
      {
        name: ".$contains() - negative",
        field: "containsTest2",
        expected: false,
      },
      {
        name: ".$startsWith() - positive",
        field: "startsWithTest1",
        expected: true,
      },
      {
        name: ".$startsWith() - negative",
        field: "startsWithTest2",
        expected: false,
      },
      {
        name: ".$endsWith() - positive",
        field: "endsWithTest1",
        expected: true,
      },
      {
        name: ".$endsWith() - negative",
        field: "endsWithTest2",
        expected: false,
      },
      { name: ".$between() - positive", field: "betweenTest1", expected: true },
      {
        name: ".$between() - negative",
        field: "betweenTest2",
        expected: false,
      },
      { name: ".$empty() - positive", field: "emptyTest1", expected: true },
      { name: ".$empty() - negative", field: "emptyTest2", expected: false },
      { name: ".$null() - positive", field: "nullTest1", expected: true },
      { name: ".$null() - negative", field: "nullTest2", expected: false },
      {
        name: "bracket notation - positive",
        field: "bracketTest1",
        expected: true,
      },
      {
        name: "bracket notation - negative",
        field: "bracketTest2",
        expected: false,
      },
      {
        name: "unicode/emoji - positive",
        field: "unicodeTest1",
        expected: true,
      },
      {
        name: "unicode/emoji - negative",
        field: "unicodeTest2",
        expected: false,
      },
      {
        name: "nested properties - positive",
        field: "nestedTest1",
        expected: false,
      },
      {
        name: "nested properties - negative",
        field: "nestedTest2",
        expected: true,
      },
      {
        name: "array contains - positive",
        field: "arrayContainsTest1",
        expected: true,
      },
      {
        name: "array contains - negative",
        field: "arrayContainsTest2",
        expected: false,
      },
    ];

    let passedTests = 0;
    let failedTests = 0;

    tests.forEach((test, index) => {
      const actualValue = result.data[test.field];
      const passed = actualValue === test.expected;

      if (passed) {
        console.log(
          `   ${(index + 1).toString().padStart(2)}. ✅ ${test.name}`
        );
        passedTests++;
      } else {
        console.log(
          `   ${(index + 1).toString().padStart(2)}. ❌ ${test.name} (expected: ${test.expected}, got: ${actualValue})`
        );
        failedTests++;
      }
    });

    console.log("\n" + "=".repeat(70));
    console.log("📊 FINAL RESULTS:");
    console.log(`✅ Passed: ${passedTests}/${tests.length}`);
    console.log(`❌ Failed: ${failedTests}/${tests.length}`);
    console.log(
      `🎯 Success Rate: ${((passedTests / tests.length) * 100).toFixed(1)}%`
    );

    if (failedTests === 0) {
      console.log("\n🎉 ALL RUNTIME METHODS WORKING PERFECTLY!");
      console.log("🚀 V2 Conditional Validation is fully operational!");
    } else {
      console.log(`\n⚠️  ${failedTests} methods need attention`);
    }
  } else {
    console.log("\n❌ SCHEMA VALIDATION: FAILED");
    console.log("🚨 Errors:", result.errors);
  }
}

// Run the comprehensive test
if (require.main === module) {
  runAllMethodsTest();
}

export { AllMethodsSchema, runAllMethodsTest };
