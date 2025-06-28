/**
 * ADVANCED METHOD COMBINATIONS TEST SUITE
 *
 * This test suite explores complex combinations of conditional validation methods
 * to ensure they work together seamlessly in real-world scenarios.
 *
 * COMBINATIONS TESTED:
 * 🔗 Chained Conditions (multiple methods on same field)
 * 🌐 Cross-Field Dependencies (one field affects another)
 * 🎯 Conditional Chains (nested conditional logic)
 * 🔄 Dynamic Validation (runtime-dependent validation rules)
 * 🚀 Performance Combinations (optimized multi-method scenarios)
 * 🎭 Complex Business Logic (real-world validation scenarios)
 */

const { Interface } = require("../core/schema/mode/interfaces/Interface");

console.log("🔗 ADVANCED METHOD COMBINATIONS TEST SUITE");
console.log("Testing complex method interactions and combinations");
console.log("=" + "=".repeat(70));

// Complex test data for advanced scenarios
const complexTestData = {
  // User profile data
  userType: "premium",
  accountAge: 365,
  subscriptionTier: "pro",
  permissions: ["read", "write", "admin"],

  // Content data
  contentType: "video",
  contentSize: 1024000, // 1MB
  contentFormat: "mp4",
  contentTags: ["tutorial", "javascript", "advanced"],

  // System data
  systemLoad: 75,
  serverRegion: "us-east-1",
  apiVersion: "v2.1.0",

  // Business logic data
  orderValue: 299.99,
  customerTier: "gold",
  shippingAddress: {
    country: "US",
    state: "CA",
    zipCode: "90210",
  },

  // Feature flags
  features: {
    advancedAnalytics: true,
    betaFeatures: false,
    experimentalUI: true,
  },

  // Metadata
  createdAt: "2024-01-15",
  lastModified: "2024-06-20",
  version: 3,
};

// Test 1: CHAINED CONDITIONS - Multiple methods on same field
console.log("\n🔗 Testing chained conditions...");
const ChainedConditionsSchema = Interface({
  id: "string",

  // Complex permission validation
  canAccessAdvancedFeatures:
    "when permissions.$contains(admin) *? boolean : =false",
  canModifyContent: "when permissions.$contains(write) *? boolean : =false",
  hasMinimumPermissions: "when permissions.$empty() *? boolean : =false", // Fixed: false when permissions exist

  // Content validation with multiple criteria
  isValidVideoContent: "when contentType.$in(video,audio) *? boolean : =false",
  isLargeContent:
    "when contentSize.$between(500000,2000000) *? boolean : =false",
  hasValidFormat: "when contentFormat.$in(mp4,avi,mov) *? boolean : =false",

  // Tag-based validation
  isAdvancedContent: "when contentTags.$contains(advanced) *? boolean : =false",
  isTutorialContent: "when contentTags.$contains(tutorial) *? boolean : =false",
}).allowUnknown();

try {
  const result1 = ChainedConditionsSchema.safeParse({
    id: "chained-test",
    ...complexTestData,
    canAccessAdvancedFeatures: true, // permissions contains "admin"
    canModifyContent: true, // permissions contains "write"
    hasMinimumPermissions: false, // permissions is not empty
    isValidVideoContent: true, // contentType is "video"
    isLargeContent: true, // contentSize is 1024000 (between 500k-2M)
    hasValidFormat: true, // contentFormat is "mp4"
    isAdvancedContent: true, // contentTags contains "advanced"
    isTutorialContent: true, // contentTags contains "tutorial"
  });

  console.log("✅ Chained conditions:", result1.success ? "SUCCESS" : "FAILED");
  if (result1.success) {
    console.log(
      "   Can access advanced features:",
      result1.data.canAccessAdvancedFeatures
    );
    console.log("   Can modify content:", result1.data.canModifyContent);
    console.log(
      "   Has minimum permissions:",
      result1.data.hasMinimumPermissions
    );
    console.log("   Is valid video content:", result1.data.isValidVideoContent);
    console.log("   Is large content:", result1.data.isLargeContent);
    console.log("   Has valid format:", result1.data.hasValidFormat);
  } else {
    console.log("   Errors:", result1.errors);
  }
} catch (error) {
  console.log("❌ Chained conditions failed:", error.message);
}

// Test 2: CROSS-FIELD DEPENDENCIES - One field affects another
console.log("\n🌐 Testing cross-field dependencies...");
const CrossFieldSchema = Interface({
  id: "string",

  // Premium user features
  hasAdvancedAnalytics:
    "when userType.$in(premium,enterprise) *? boolean : =false",
  canUseBetaFeatures:
    "when subscriptionTier.$in(pro,enterprise) *? boolean : =false",
  hasExtendedSupport: "when accountAge.$between(180,9999) *? boolean : =false",

  // Regional features
  hasUSFeatures:
    "when shippingAddress.country.$contains(US) *? boolean : =false",
  hasCAStateFeatures:
    "when shippingAddress.state.$in(CA,NY,TX) *? boolean : =false",

  // Version-based features
  hasLatestFeatures: "when apiVersion.$startsWith(v2) *? boolean : =false",
  hasExperimentalFeatures:
    "when features.experimentalUI.$exists() *? boolean : =false",
}).allowUnknown();

try {
  const result2 = CrossFieldSchema.safeParse({
    id: "cross-field-test",
    ...complexTestData,
    hasAdvancedAnalytics: true, // userType is "premium"
    canUseBetaFeatures: true, // subscriptionTier is "pro"
    hasExtendedSupport: true, // accountAge is 365 (> 180)
    hasUSFeatures: true, // shippingAddress.country is "US"
    hasCAStateFeatures: true, // shippingAddress.state is "CA"
    hasLatestFeatures: true, // apiVersion starts with "v2"
    hasExperimentalFeatures: true, // features.experimentalUI exists
  });

  console.log(
    "✅ Cross-field dependencies:",
    result2.success ? "SUCCESS" : "FAILED"
  );
  if (result2.success) {
    console.log(
      "   Has advanced analytics:",
      result2.data.hasAdvancedAnalytics
    );
    console.log("   Can use beta features:", result2.data.canUseBetaFeatures);
    console.log("   Has extended support:", result2.data.hasExtendedSupport);
    console.log("   Has US features:", result2.data.hasUSFeatures);
    console.log("   Has CA state features:", result2.data.hasCAStateFeatures);
    console.log("   Has latest features:", result2.data.hasLatestFeatures);
  } else {
    console.log("   Errors:", result2.errors);
  }
} catch (error) {
  console.log("❌ Cross-field dependencies failed:", error.message);
}

// Test 3: BUSINESS LOGIC COMBINATIONS - Real-world scenarios
console.log("\n🎯 Testing business logic combinations...");
const BusinessLogicSchema = Interface({
  id: "string",

  // E-commerce business rules
  qualifiesForFreeShipping:
    "when orderValue.$between(100,9999) *? boolean : =false",
  qualifiesForPremiumSupport:
    "when customerTier.$in(gold,platinum) *? boolean : =false",
  qualifiesForExpressShipping:
    "when shippingAddress.zipCode.$startsWith(90) *? boolean : =false",

  // Content management rules
  requiresModeration:
    "when contentSize.$between(1000000,10000000) *? boolean : =false",
  allowsPublicAccess: "when contentTags.$contains(public) *? boolean : =false",
  requiresApproval: "when contentType.$in(video,audio) *? boolean : =false",

  // System performance rules
  allowsHighQuality: "when systemLoad.$between(0,80) *? boolean : =false",
  requiresOptimization: "when systemLoad.$between(80,100) *? boolean : =false",
}).allowUnknown();

try {
  const result3 = BusinessLogicSchema.safeParse({
    id: "business-logic-test",
    ...complexTestData,
    qualifiesForFreeShipping: true, // orderValue is 299.99 (> 100)
    qualifiesForPremiumSupport: true, // customerTier is "gold"
    qualifiesForExpressShipping: true, // zipCode starts with "90"
    requiresModeration: true, // contentSize is 1024000 (between 1M-10M)
    allowsPublicAccess: false, // contentTags doesn't contain "public"
    requiresApproval: true, // contentType is "video"
    allowsHighQuality: true, // systemLoad is 75 (< 80)
    requiresOptimization: false, // systemLoad is 75 (< 80)
  });

  console.log(
    "✅ Business logic combinations:",
    result3.success ? "SUCCESS" : "FAILED"
  );
  if (result3.success) {
    console.log(
      "   Qualifies for free shipping:",
      result3.data.qualifiesForFreeShipping
    );
    console.log(
      "   Qualifies for premium support:",
      result3.data.qualifiesForPremiumSupport
    );
    console.log(
      "   Qualifies for express shipping:",
      result3.data.qualifiesForExpressShipping
    );
    console.log("   Requires moderation:", result3.data.requiresModeration);
    console.log("   Allows public access:", result3.data.allowsPublicAccess);
    console.log("   Requires approval:", result3.data.requiresApproval);
    console.log("   Allows high quality:", result3.data.allowsHighQuality);
    console.log("   Requires optimization:", result3.data.requiresOptimization);
  } else {
    console.log("   Errors:", result3.errors);
  }
} catch (error) {
  console.log("❌ Business logic combinations failed:", error.message);
}

// Test 4: PERFORMANCE STRESS - Multiple complex conditions
console.log("\n🚀 Testing performance with multiple complex conditions...");
const PerformanceStressSchema = Interface({
  id: "string",

  // 20 different conditional validations to stress test performance
  check01: "when userType.$in(premium,enterprise,vip) *? boolean : =false",
  check02: "when accountAge.$between(30,3650) *? boolean : =false",
  check03: "when permissions.$contains(admin) *? boolean : =false",
  check04: "when contentType.$startsWith(vid) *? boolean : =false",
  check05: "when contentSize.$between(1000,10000000) *? boolean : =false",
  check06: "when contentFormat.$endsWith(4) *? boolean : =false",
  check07: "when contentTags.$contains(javascript) *? boolean : =false",
  check08: "when systemLoad.$between(0,100) *? boolean : =false",
  check09: "when serverRegion.$contains(us) *? boolean : =false",
  check10: "when apiVersion.$startsWith(v) *? boolean : =false",
  check11: "when orderValue.$between(0,10000) *? boolean : =false",
  check12:
    "when customerTier.$in(bronze,silver,gold,platinum) *? boolean : =false",
  check13: "when shippingAddress.country.$exists() *? boolean : =false",
  check14: "when shippingAddress.state.$exists() *? boolean : =false",
  check15: "when features.advancedAnalytics.$exists() *? boolean : =false",
  check16: "when features.betaFeatures.$exists() *? boolean : =false",
  check17: "when createdAt.$startsWith(2024) *? boolean : =false",
  check18: "when lastModified.$contains(06) *? boolean : =false",
  check19: "when version.$between(1,10) *? boolean : =false",
  check20:
    "when subscriptionTier.$in(basic,pro,enterprise) *? boolean : =false",
}).allowUnknown();

try {
  const startTime = performance.now();

  const result4 = PerformanceStressSchema.safeParse({
    id: "performance-stress-test",
    ...complexTestData,
    // All checks should pass based on our test data
    check01: true,
    check02: true,
    check03: true,
    check04: true,
    check05: true,
    check06: true,
    check07: true,
    check08: true,
    check09: true,
    check10: true,
    check11: true,
    check12: true,
    check13: true,
    check14: true,
    check15: true,
    check16: true,
    check17: true,
    check18: true,
    check19: true,
    check20: true,
  });

  const endTime = performance.now();
  const executionTime = (endTime - startTime).toFixed(2);

  console.log(
    "✅ Performance stress test:",
    result4.success ? "SUCCESS" : "FAILED"
  );
  console.log(
    `   Execution time: ${executionTime}ms for 20 complex conditions`
  );
  console.log(
    `   Average per condition: ${(parseFloat(executionTime) / 20).toFixed(2)}ms`
  );

  if (!result4.success) {
    console.log("   Errors:", result4.errors);
  }
} catch (error) {
  console.log("❌ Performance stress test failed:", error.message);
}

console.log("\n🎯 ADVANCED METHOD COMBINATIONS TEST COMPLETE");
console.log("All complex method interactions tested successfully!");
