/**
 * Quick JavaScript test to verify our conditional method fixes
 * This bypasses TypeScript compilation issues and tests the core functionality
 */

const { Interface } = require("../core/schema/mode/interfaces/Interface");

console.log("🔧 QUICK METHOD VALIDATION TEST");
console.log("Testing our fixes to conditional validation methods");
console.log("=" + "=".repeat(60));

// Test data
const testData = {
  username: "admin_user",
  email: "user@company.com",
  filename: "document.pdf",
  description: "This is a test description",
  emptyString: "",
  age: 25,
  score: 85,
  price: 99.99,
  zero: 0,
  tags: ["javascript", "typescript", "node"],
  emptyArray: [],
  profile: { name: "John", role: "admin" },
  emptyObject: {},
  nullValue: null,
  undefinedValue: undefined,
  role: "admin",
  status: "active",
};

// Test 1: EXISTS method
console.log("\n🔍 Testing EXISTS method...");
const ExistsSchema = Interface({
  id: "string",
  hasProfile: "when profile.$exists() *? boolean : =false",
  hasEmail: "when email.$exists() *? boolean : =false",
  hasUndefined: "when undefinedValue.$exists() *? boolean : =false",
  hasNull: "when nullValue.$exists() *? boolean : =false",
}).allowUnknown();

try {
  const result1 = ExistsSchema.safeParse({
    id: "test1",
    ...testData,
    hasProfile: true,
    hasEmail: true,
    hasUndefined: false,
    hasNull: false,
  });

  console.log("✅ EXISTS test result:", result1.success ? "SUCCESS" : "FAILED");
  if (result1.success) {
    console.log("   hasProfile:", result1.data.hasProfile, "(should be true)");
    console.log("   hasEmail:", result1.data.hasEmail, "(should be true)");
    console.log(
      "   hasUndefined:",
      result1.data.hasUndefined,
      "(should be false)"
    );
    console.log("   hasNull:", result1.data.hasNull, "(should be false)");
  } else {
    console.log("   Errors:", result1.errors);
  }
} catch (error) {
  console.log("❌ EXISTS test failed:", error.message);
}

// Test 2: EMPTY method (with our object fix)
console.log("\n📭 Testing EMPTY method...");
const EmptySchema = Interface({
  id: "string",
  isStringEmpty: "when emptyString.$empty() *? boolean : =false",
  isArrayEmpty: "when emptyArray.$empty() *? boolean : =false",
  isObjectEmpty: "when emptyObject.$empty() *? boolean : =false",
  isDescriptionEmpty: "when description.$empty() *? boolean : =false",
}).allowUnknown();

try {
  const result2 = EmptySchema.safeParse({
    id: "test2",
    ...testData,
    isStringEmpty: true,
    isArrayEmpty: true,
    isObjectEmpty: true,
    isDescriptionEmpty: false,
  });

  console.log("✅ EMPTY test result:", result2.success ? "SUCCESS" : "FAILED");
  if (result2.success) {
    console.log(
      "   isStringEmpty:",
      result2.data.isStringEmpty,
      "(should be true)"
    );
    console.log(
      "   isArrayEmpty:",
      result2.data.isArrayEmpty,
      "(should be true)"
    );
    console.log(
      "   isObjectEmpty:",
      result2.data.isObjectEmpty,
      "(should be true)"
    );
    console.log(
      "   isDescriptionEmpty:",
      result2.data.isDescriptionEmpty,
      "(should be false)"
    );
  } else {
    console.log("   Errors:", result2.errors);
  }
} catch (error) {
  console.log("❌ EMPTY test failed:", error.message);
}

// Test 3: IN method (with our validation fix)
console.log("\n📋 Testing IN method...");
const InSchema = Interface({
  id: "string",
  isAdminRole: "when role.$in(admin,moderator,superuser) *? boolean : =false",
  isActiveStatus: "when status.$in(active,pending) *? boolean : =false",
  isValidAge: "when age.$in(25,30,35) *? boolean : =false",
}).allowUnknown();

try {
  const result3 = InSchema.safeParse({
    id: "test3",
    ...testData,
    isAdminRole: true,
    isActiveStatus: true,
    isValidAge: true,
  });

  console.log("✅ IN test result:", result3.success ? "SUCCESS" : "FAILED");
  if (result3.success) {
    console.log(
      "   isAdminRole:",
      result3.data.isAdminRole,
      "(should be true)"
    );
    console.log(
      "   isActiveStatus:",
      result3.data.isActiveStatus,
      "(should be true)"
    );
    console.log("   isValidAge:", result3.data.isValidAge, "(should be true)");
  } else {
    console.log("   Errors:", result3.errors);
  }
} catch (error) {
  console.log("❌ IN test failed:", error.message);
}

// Test 4: BETWEEN method (with our NaN validation fix)
console.log("\n📊 Testing BETWEEN method...");
const BetweenSchema = Interface({
  id: "string",
  ageInRange: "when age.$between(18,65) *? boolean : =false",
  scoreInRange: "when score.$between(80,90) *? boolean : =false",
  zeroInRange: "when zero.$between(-1,1) *? boolean : =false",
}).allowUnknown();

try {
  const result4 = BetweenSchema.safeParse({
    id: "test4",
    ...testData,
    ageInRange: true,
    scoreInRange: true,
    zeroInRange: true,
  });

  console.log(
    "✅ BETWEEN test result:",
    result4.success ? "SUCCESS" : "FAILED"
  );
  if (result4.success) {
    console.log("   ageInRange:", result4.data.ageInRange, "(should be true)");
    console.log(
      "   scoreInRange:",
      result4.data.scoreInRange,
      "(should be true)"
    );
    console.log(
      "   zeroInRange:",
      result4.data.zeroInRange,
      "(should be true)"
    );
  } else {
    console.log("   Errors:", result4.errors);
  }
} catch (error) {
  console.log("❌ BETWEEN test failed:", error.message);
}

// Test 5: Nested property access
console.log("\n🏗️  Testing nested property access...");
const NestedSchema = Interface({
  id: "string",
  hasProfileName: "when profile.name.$exists() *? boolean : =false",
  hasProfileRole: "when profile.role.$exists() *? boolean : =false",
}).allowUnknown();

try {
  const result5 = NestedSchema.safeParse({
    id: "test5",
    ...testData,
    hasProfileName: true,
    hasProfileRole: true,
  });

  console.log("✅ NESTED test result:", result5.success ? "SUCCESS" : "FAILED");
  if (result5.success) {
    console.log(
      "   hasProfileName:",
      result5.data.hasProfileName,
      "(should be true)"
    );
    console.log(
      "   hasProfileRole:",
      result5.data.hasProfileRole,
      "(should be true)"
    );
  } else {
    console.log("   Errors:", result5.errors);
  }
} catch (error) {
  console.log("❌ NESTED test failed:", error.message);
}

console.log("\n🎯 QUICK TEST COMPLETE");
console.log("All major conditional methods tested with our fixes!");
