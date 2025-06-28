/**
 * DIAGNOSTIC TEST FOR $empty() METHOD
 * 
 * This test specifically investigates the $empty() method behavior
 * to understand the logical inconsistency identified in feedback1.md
 */

const { Interface } = require("../core/schema/mode/interfaces/Interface");

console.log("🔍 DIAGNOSTIC TEST FOR $empty() METHOD");
console.log("Investigating the logical inconsistency");
console.log("=" + "=".repeat(50));

// Test data - same as in the advanced test
const testData = {
  permissions: ["read", "write", "admin"],  // NOT empty array
  emptyPermissions: [],                     // Empty array
  nullPermissions: null,                    // Null value
  undefinedPermissions: undefined,          // Undefined value
  stringField: "not empty",                 // Non-empty string
  emptyString: "",                          // Empty string
  objectField: { key: "value" },           // Non-empty object
  emptyObject: {},                          // Empty object
};

// Test 1: Basic $empty() behavior
console.log("\n🧪 Test 1: Basic $empty() behavior");
const BasicEmptySchema = Interface({
  id: "string",
  
  // Test $empty() on different types
  arrayEmpty: "when permissions.$empty() *? boolean : =false",
  emptyArrayEmpty: "when emptyPermissions.$empty() *? boolean : =false",
  nullEmpty: "when nullPermissions.$empty() *? boolean : =false",
  undefinedEmpty: "when undefinedPermissions.$empty() *? boolean : =false",
  stringEmpty: "when stringField.$empty() *? boolean : =false",
  emptyStringEmpty: "when emptyString.$empty() *? boolean : =false",
  objectEmpty: "when objectField.$empty() *? boolean : =false",
  emptyObjectEmpty: "when emptyObject.$empty() *? boolean : =false",
}).allowUnknown();

try {
  const result1 = BasicEmptySchema.safeParse({
    id: "basic-test",
    ...testData,
    // What we expect based on logical behavior:
    arrayEmpty: false,        // permissions is NOT empty -> condition false -> use default false
    emptyArrayEmpty: true,    // emptyPermissions IS empty -> condition true -> validate true
    nullEmpty: true,          // null IS empty -> condition true -> validate true
    undefinedEmpty: true,     // undefined IS empty -> condition true -> validate true
    stringEmpty: false,       // stringField is NOT empty -> condition false -> use default false
    emptyStringEmpty: true,   // emptyString IS empty -> condition true -> validate true
    objectEmpty: false,       // objectField is NOT empty -> condition false -> use default false
    emptyObjectEmpty: true,   // emptyObject IS empty -> condition true -> validate true
  });
  
  console.log("✅ Basic empty test:", result1.success ? "SUCCESS" : "FAILED");
  if (result1.success) {
    console.log("   Array (not empty) -> empty():", result1.data.arrayEmpty, "(expected: false)");
    console.log("   Empty array -> empty():", result1.data.emptyArrayEmpty, "(expected: true)");
    console.log("   Null -> empty():", result1.data.nullEmpty, "(expected: true)");
    console.log("   Undefined -> empty():", result1.data.undefinedEmpty, "(expected: true)");
    console.log("   String (not empty) -> empty():", result1.data.stringEmpty, "(expected: false)");
    console.log("   Empty string -> empty():", result1.data.emptyStringEmpty, "(expected: true)");
    console.log("   Object (not empty) -> empty():", result1.data.objectEmpty, "(expected: false)");
    console.log("   Empty object -> empty():", result1.data.emptyObjectEmpty, "(expected: true)");
  } else {
    console.log("   Errors:", result1.errors);
  }
} catch (error) {
  console.log("❌ Basic empty test failed:", error.message);
}

// Test 2: Reproduce the exact issue from feedback
console.log("\n🎯 Test 2: Reproducing the exact feedback issue");
const FeedbackIssueSchema = Interface({
  id: "string",
  
  // Exact same rule from the feedback
  hasMinimumPermissions: "when permissions.$empty() *? boolean : =true",
}).allowUnknown();

try {
  const result2 = FeedbackIssueSchema.safeParse({
    id: "feedback-test",
    ...testData,
    // What the test currently expects (from feedback analysis)
    hasMinimumPermissions: false,  // Test expects false, but logic says should be true
  });
  
  console.log("✅ Feedback issue test:", result2.success ? "SUCCESS" : "FAILED");
  if (result2.success) {
    console.log("   hasMinimumPermissions result:", result2.data.hasMinimumPermissions);
    console.log("   Expected by test: false");
    console.log("   Expected by logic: true (permissions is not empty, so condition false, use default =true)");
  } else {
    console.log("   Errors:", result2.errors);
  }
} catch (error) {
  console.log("❌ Feedback issue test failed:", error.message);
}

// Test 3: Corrected logic test
console.log("\n✅ Test 3: Corrected logic test");
const CorrectedLogicSchema = Interface({
  id: "string",
  
  // Corrected rule - what the test probably intended
  hasMinimumPermissions: "when permissions.$empty() *? boolean : =false",  // Default false when not empty
}).allowUnknown();

try {
  const result3 = CorrectedLogicSchema.safeParse({
    id: "corrected-test",
    ...testData,
    // Now this makes sense
    hasMinimumPermissions: false,  // permissions is not empty, so condition false, use default false
  });
  
  console.log("✅ Corrected logic test:", result3.success ? "SUCCESS" : "FAILED");
  if (result3.success) {
    console.log("   hasMinimumPermissions result:", result3.data.hasMinimumPermissions);
    console.log("   This makes logical sense: permissions exist, so hasMinimumPermissions = false");
  } else {
    console.log("   Errors:", result3.errors);
  }
} catch (error) {
  console.log("❌ Corrected logic test failed:", error.message);
}

// Test 4: Alternative approach - test with empty permissions
console.log("\n🔄 Test 4: Testing with empty permissions");
const EmptyPermissionsSchema = Interface({
  id: "string",
  
  // Original rule
  hasMinimumPermissions: "when permissions.$empty() *? boolean : =true",
}).allowUnknown();

try {
  const result4 = EmptyPermissionsSchema.safeParse({
    id: "empty-permissions-test",
    permissions: [],  // Empty permissions array
    hasMinimumPermissions: true,  // Empty permissions, so condition true, validate true
  });
  
  console.log("✅ Empty permissions test:", result4.success ? "SUCCESS" : "FAILED");
  if (result4.success) {
    console.log("   hasMinimumPermissions result:", result4.data.hasMinimumPermissions);
    console.log("   This makes sense: no permissions, so hasMinimumPermissions = true");
  } else {
    console.log("   Errors:", result4.errors);
  }
} catch (error) {
  console.log("❌ Empty permissions test failed:", error.message);
}

console.log("\n🎯 DIAGNOSTIC COMPLETE");
console.log("Analysis of $empty() method behavior finished!");
