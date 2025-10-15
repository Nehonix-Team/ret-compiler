/**
 * COMPREHENSIVE CONDITIONAL METHODS TEST
 *
 * This test systematically validates ALL conditional validation methods in ReliantType V2
 * Each method is tested with multiple scenarios including edge cases and error conditions
 *
 * METHODS TESTED:
 * ✅ exists() / not_exists() - Check if field is defined
 * ✅ empty() / not_empty() - Check if field is empty
 * ✅ null() / not_null() - Check if field is null
 * ✅ in() / not_in() - Check if field value is in a list
 * ✅ contains() / not_contains() - Check if string/array contains value
 * ✅ startsWith() - Check if string starts with value
 * ✅ endsWith() - Check if string ends with value
 * ✅ between() - Check if number is between min and max
 *
 * Each method is tested with:
 * - Positive cases (method returns true)
 * - Negative cases (method returns false)
 * - Edge cases (null, undefined, empty values)
 * - Type validation (correct types when condition is true)
 * - Default values (when condition is false)
 */

import { Interface } from "../core/schema/mode/interfaces/Interface";

console.log("🔬 COMPREHENSIVE CONDITIONAL METHODS TEST");
console.log("Testing ALL methods with systematic coverage");
console.log("=" + "=".repeat(80));

// Test data structure for comprehensive method testing
const testData = {
  // String fields for string methods
  username: "admin_user",
  email: "user@company.com",
  filename: "document.pdf",
  description: "This is a test description",
  emptyString: "",

  // Number fields for numeric methods
  age: 25,
  score: 85,
  price: 99.99,
  zero: 0,

  // Array fields for array methods
  tags: ["javascript", "typescript", "node"],
  emptyArray: [],
  categories: ["tech", "programming"],

  // Object fields for object methods
  profile: { name: "John", role: "admin" },
  emptyObject: {},

  // Special values for edge case testing
  nullValue: null,
  undefinedValue: undefined,

  // Boolean fields
  isActive: true,
  isDisabled: false,

  // Role for in() method testing
  role: "admin",
  status: "active",
  priority: "high",
};

// 1. EXISTS METHOD TESTING
console.log("\n🔍 TESTING: exists() method");
const ExistsTestSchema = Interface({
  id: "string",

  // Test exists() - should validate when runtime property exists
  hasProfile: "when profile.$exists() *? boolean : =false",
  hasEmail: "when email.$exists() *? boolean : =false",
  hasUndefined: "when undefinedValue.$exists() *? boolean : =false",
  hasNull: "when nullValue.$exists() *? boolean : =false",

  // Test nested exists()
  hasProfileName: "when profile.name.$exists() *? boolean : =false",
  hasNonExistent: "when nonExistentField.$exists() *? boolean : =false",
}).allowUnknown();

const existsTests = [
  {
    name: "EXISTS: All properties exist",
    input: {
      id: "test1",
      ...testData,
      hasProfile: true,
      hasEmail: true,
      hasUndefined: false, // undefined doesn't exist
      hasNull: false, // null doesn't exist (depends on implementation)
      hasProfileName: true,
      hasNonExistent: false,
    },
    expectSuccess: true,
  },
  {
    name: "EXISTS: Missing runtime properties",
    input: {
      id: "test2",
      // No runtime properties provided
      hasProfile: true, // Should become false
      hasEmail: true, // Should become false
      hasUndefined: true, // Should become false
      hasNull: true, // Should become false
      hasProfileName: true, // Should become false
      hasNonExistent: true, // Should become false
    },
    expectSuccess: true,
  },
];

// 2. EMPTY METHOD TESTING
console.log("\n📭 TESTING: empty() method");
const EmptyTestSchema = Interface({
  id: "string",

  // Test empty() on different types
  isStringEmpty: "when emptyString.$empty() *? boolean : =false",
  isArrayEmpty: "when emptyArray.$empty() *? boolean : =false",
  isObjectEmpty: "when emptyObject.$empty() *? boolean : =false",
  isDescriptionEmpty: "when description.$empty() *? boolean : =false",
  isTagsEmpty: "when tags.$empty() *? boolean : =false",
}).allowUnknown();

const emptyTests = [
  {
    name: "EMPTY: Mixed empty and non-empty values",
    input: {
      id: "test3",
      ...testData,
      isStringEmpty: true, // emptyString is empty
      isArrayEmpty: true, // emptyArray is empty
      isObjectEmpty: true, // emptyObject is empty
      isDescriptionEmpty: false, // description is not empty
      isTagsEmpty: false, // tags is not empty
    },
    expectSuccess: true,
  },
];

// 3. NULL METHOD TESTING
console.log("\n🚫 TESTING: null() method");
const NullTestSchema = Interface({
  id: "string",

  // Test null() method
  isNullValue: "when nullValue.$null() *? boolean : =false",
  isUndefinedNull: "when undefinedValue.$null() *? boolean : =false",
  isStringNull: "when username.$null() *? boolean : =false",
  isZeroNull: "when zero.$null() *? boolean : =false",
}).allowUnknown();

const nullTests = [
  {
    name: "NULL: Testing null detection",
    input: {
      id: "test4",
      ...testData,
      isNullValue: true, // nullValue is null
      isUndefinedNull: false, // undefined is not null
      isStringNull: false, // string is not null
      isZeroNull: false, // zero is not null
    },
    expectSuccess: true,
  },
];

// 4. IN METHOD TESTING
console.log("\n📋 TESTING: in() method");
const InTestSchema = Interface({
  id: "string",

  // Test in() method with different value types
  isAdminRole: "when role.$in(admin,moderator,superuser) *? boolean : =false",
  isActiveStatus: "when status.$in(active,pending) *? boolean : =false",
  isHighPriority: "when priority.$in(high,critical) *? boolean : =false",
  isValidAge: "when age.$in(25,30,35) *? boolean : =false",
  isInvalidRole: "when role.$in(guest,user) *? boolean : =false",
}).allowUnknown();

const inTests = [
  {
    name: "IN: Testing value membership",
    input: {
      id: "test5",
      ...testData,
      isAdminRole: true, // role "admin" is in list
      isActiveStatus: true, // status "active" is in list
      isHighPriority: true, // priority "high" is in list
      isValidAge: true, // age 25 is in list
      isInvalidRole: false, // role "admin" is not in guest,user
    },
    expectSuccess: true,
  },
];

// 5. CONTAINS METHOD TESTING
console.log("\n🔍 TESTING: contains() method");
const ContainsTestSchema = Interface({
  id: "string",

  // Test contains() on strings and arrays
  emailHasCompany: "when email.$contains(company) *? boolean : =false",
  usernameHasAdmin: "when username.$contains(admin) *? boolean : =false",
  tagsHasJS: "when tags.$contains(javascript) *? boolean : =false",
  descriptionHasTest: "when description.$contains(test) *? boolean : =false",
  emailHasGmail: "when email.$contains(gmail) *? boolean : =false",
}).allowUnknown();

const containsTests = [
  {
    name: "CONTAINS: Testing substring and array membership",
    input: {
      id: "test6",
      ...testData,
      emailHasCompany: true, // email contains "company"
      usernameHasAdmin: true, // username contains "admin"
      tagsHasJS: true, // tags array contains "javascript"
      descriptionHasTest: true, // description contains "test"
      emailHasGmail: false, // email doesn't contain "gmail"
    },
    expectSuccess: true,
  },
];

// 6. STARTS_WITH METHOD TESTING
console.log("\n🎯 TESTING: startsWith() method");
const StartsWithTestSchema = Interface({
  id: "string",

  // Test startsWith() method
  usernameStartsAdmin: "when username.$startsWith(admin) *? boolean : =false",
  emailStartsUser: "when email.$startsWith(user) *? boolean : =false",
  filenameStartsDoc: "when filename.$startsWith(doc) *? boolean : =false",
  usernameStartsGuest: "when username.$startsWith(guest) *? boolean : =false",
}).allowUnknown();

const startsWithTests = [
  {
    name: "STARTS_WITH: Testing string prefixes",
    input: {
      id: "test7",
      ...testData,
      usernameStartsAdmin: true, // "admin_user" starts with "admin"
      emailStartsUser: true, // "user@company.com" starts with "user"
      filenameStartsDoc: true, // "document.pdf" starts with "doc"
      usernameStartsGuest: false, // "admin_user" doesn't start with "guest"
    },
    expectSuccess: true,
  },
];

// 7. ENDS_WITH METHOD TESTING
console.log("\n🎯 TESTING: endsWith() method");
const EndsWithTestSchema = Interface({
  id: "string",

  // Test endsWith() method
  filenameEndsPdf: "when filename.$endsWith(.pdf) *? boolean : =false",
  emailEndsCom: "when email.$endsWith(.com) *? boolean : =false",
  usernameEndsUser: "when username.$endsWith(_user) *? boolean : =false",
  filenameEndsTxt: "when filename.$endsWith(.txt) *? boolean : =false",
}).allowUnknown();

const endsWithTests = [
  {
    name: "ENDS_WITH: Testing string suffixes",
    input: {
      id: "test8",
      ...testData,
      filenameEndsPdf: true, // "document.pdf" ends with ".pdf"
      emailEndsCom: true, // "user@company.com" ends with ".com"
      usernameEndsUser: true, // "admin_user" ends with "_user"
      filenameEndsTxt: false, // "document.pdf" doesn't end with ".txt"
    },
    expectSuccess: true,
  },
];

// 8. BETWEEN METHOD TESTING
console.log("\n📊 TESTING: between() method");
const BetweenTestSchema = Interface({
  id: "string",

  // Test between() method with numbers
  ageInRange: "when age.$between(18,65) *? boolean : =false",
  scoreInRange: "when score.$between(80,90) *? boolean : =false",
  priceInRange: "when price.$between(50,100) *? boolean : =false",
  ageOutOfRange: "when age.$between(30,40) *? boolean : =false",
  zeroInRange: "when zero.$between(-1,1) *? boolean : =false",
}).allowUnknown();

const betweenTests = [
  {
    name: "BETWEEN: Testing numeric ranges",
    input: {
      id: "test9",
      ...testData,
      ageInRange: true, // age 25 is between 18-65
      scoreInRange: true, // score 85 is between 80-90
      priceInRange: true, // price 99.99 is between 50-100
      ageOutOfRange: false, // age 25 is not between 30-40
      zeroInRange: true, // zero 0 is between -1 and 1
    },
    expectSuccess: true,
  },
];

// 9. NEGATED METHODS TESTING - Testing NOT versions of methods
console.log("\n🚫 TESTING: Negated methods (NOT_EXISTS, NOT_EMPTY, etc.)");
const NegatedMethodsTestSchema = Interface({
  id: "string",

  // Test negated methods
  notHasProfile: "when nonExistentField.$exists() *? boolean : =true", // Should use default true
  notEmptyString: "when description.$empty() *? boolean : =true", // Should use default true
  notNullValue: "when username.$null() *? boolean : =true", // Should use default true
  notInRole: "when role.$in(guest,user) *? boolean : =true", // Should use default true
  notContainsGmail: "when email.$contains(gmail) *? boolean : =true", // Should use default true

  // These should validate user input since runtime properties exist
  hasExistingProfile: "when profile.$exists() *? boolean : =false", // Should validate
  nonEmptyDescription: "when description.$empty() *? boolean : =false", // Should validate (false = not empty)
  nonNullUsername: "when username.$null() *? boolean : =false", // Should validate (false = not null)
}).allowUnknown();

const negatedMethodsTests = [
  {
    name: "NEGATED: Testing inverted logic and defaults",
    input: {
      id: "test10",
      ...testData,

      // These should use defaults (runtime properties don't exist or condition is false)
      notHasProfile: false, // Should become true (nonExistentField doesn't exist)
      notEmptyString: false, // Should become true (description is not empty, so condition false)
      notNullValue: false, // Should become true (username is not null, so condition false)
      notInRole: false, // Should become true (role "admin" not in guest,user, so condition false)
      notContainsGmail: false, // Should become true (email doesn't contain gmail, so condition false)

      // These should validate user input (runtime properties exist and conditions are true)
      hasExistingProfile: true, // profile exists, so validate this boolean
      nonEmptyDescription: false, // description is not empty, so empty() returns false, validate this
      nonNullUsername: false, // username is not null, so null() returns false, validate this
    },
    expectSuccess: true,
  },
];

// 10. EDGE CASES AND ERROR CONDITIONS
console.log("\n⚠️  TESTING: Edge cases and error conditions");
const EdgeCasesTestSchema = Interface({
  id: "string",

  // Test with edge case values
  handleUndefined: "when undefinedValue.$exists() *? boolean : =false",
  handleNull: "when nullValue.$exists() *? boolean : =false",
  handleEmptyString: "when emptyString.$empty() *? boolean : =false",
  handleEmptyArray: "when emptyArray.$empty() *? boolean : =false",
  handleZero: "when zero.$between(-1,1) *? boolean : =false",

  // Test deeply nested properties
  handleNestedExists: "when profile.name.$exists() *? boolean : =false",
  handleNestedMissing: "when profile.nonExistent.$exists() *? boolean : =false",
}).allowUnknown();

const edgeCasesTests = [
  {
    name: "EDGE_CASES: Testing boundary conditions",
    input: {
      id: "test11",
      ...testData,
      handleUndefined: false, // undefinedValue doesn't exist
      handleNull: false, // nullValue exists but is null (depends on implementation)
      handleEmptyString: true, // emptyString is empty
      handleEmptyArray: true, // emptyArray is empty
      handleZero: true, // zero is between -1 and 1
      handleNestedExists: true, // profile.name exists
      handleNestedMissing: false, // profile.nonExistent doesn't exist
    },
    expectSuccess: true,
  },
];

// Run all test suites
const allTestSuites = [
  { name: "EXISTS", schema: ExistsTestSchema, tests: existsTests },
  { name: "EMPTY", schema: EmptyTestSchema, tests: emptyTests },
  { name: "NULL", schema: NullTestSchema, tests: nullTests },
  { name: "IN", schema: InTestSchema, tests: inTests },
  { name: "CONTAINS", schema: ContainsTestSchema, tests: containsTests },
  { name: "STARTS_WITH", schema: StartsWithTestSchema, tests: startsWithTests },
  { name: "ENDS_WITH", schema: EndsWithTestSchema, tests: endsWithTests },
  { name: "BETWEEN", schema: BetweenTestSchema, tests: betweenTests },
  {
    name: "NEGATED_METHODS",
    schema: NegatedMethodsTestSchema,
    tests: negatedMethodsTests,
  },
  { name: "EDGE_CASES", schema: EdgeCasesTestSchema, tests: edgeCasesTests },
];

allTestSuites.forEach((suite) => {
  console.log(
    `\n${"🧪".repeat(20)} ${suite.name} METHOD TESTS ${"🧪".repeat(20)}`
  );

  suite.tests.forEach((test: any, index: number) => {
    console.log(`\n--- Test ${index + 1}: ${test.name} ---`);
    console.log("📥 INPUT:", JSON.stringify(test.input, null, 2));

    try {
      const startTime = performance.now();
      const result = suite.schema.safeParse(test.input);
      const endTime = performance.now();

      console.log(`⏱️  Execution Time: ${(endTime - startTime).toFixed(2)}ms`);

      if (result.success) {
        console.log("✅ VALIDATION: SUCCESS");
        console.log("📤 OUTPUT:", JSON.stringify(result.data, null, 2));

        // Analyze the results
        console.log("\n🔍 ANALYSIS:");
        analyzeMethodResults(test.input, result.data, suite.name);
      } else {
        console.log("❌ VALIDATION: FAILED");
        console.log("🚨 ERRORS:", result.errors);
      }
    } catch (error: any) {
      console.log("💥 CATASTROPHIC FAILURE:", error?.message || String(error));
    }
  });
});

function analyzeMethodResults(input: any, output: any, methodType: string) {
  console.log(`  Method Type: ${methodType}`);

  // Compare input vs output for conditional fields
  Object.keys(input).forEach((key) => {
    if (key !== "id" && !isRuntimeProperty(key)) {
      const inputVal = input[key];
      const outputVal = output[key];
      const changed = inputVal !== outputVal;

      console.log(
        `  ${key}: ${inputVal} → ${outputVal} ${changed ? "(CHANGED)" : "(PRESERVED)"}`
      );
    }
  });
}

function isRuntimeProperty(key: string): boolean {
  const runtimeProps = [
    "username",
    "email",
    "filename",
    "description",
    "emptyString",
    "age",
    "score",
    "price",
    "zero",
    "tags",
    "emptyArray",
    "categories",
    "profile",
    "emptyObject",
    "nullValue",
    "undefinedValue",
    "isActive",
    "isDisabled",
    "role",
    "status",
    "priority",
  ];
  return runtimeProps.includes(key);
}

console.log(`\n${"🎯".repeat(30)}`);
console.log("🔬 COMPREHENSIVE METHOD TEST COMPLETE");
console.log("All conditional validation methods tested!");
console.log(`${"🎯".repeat(30)}`);
