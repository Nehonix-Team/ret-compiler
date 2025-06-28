 // ====================================================================
// COMPREHENSIVE OPERATOR TEST - All Documented Operators
// ====================================================================

import { Interface } from "../core/schema/mode/interfaces/Interface";


console.log("🧪 Testing All Documented Operators\n");

// Test schema with ALL documented operators
const ComprehensiveSchema = Interface({
  // Base fields
  role: "admin|user|guest|moderator",
  status: "active|inactive|pending",
  age: "number",
  email: "string?",
  tags: "string[]?",
  metadata: "string?",
  filename: "string",
  content: "string?",

  // ✅ Comparison Operators
  equalityTest: "when role=admin *? =admin_access : =limited_access",
  inequalityTest: "when role!=guest *? =full_features : =restricted_features",
  greaterTest: "when age>18 *? =adult_content : =minor_content",
  lessTest: "when age<65 *? =working_age : =senior_age",
  greaterEqualTest: "when age>=21 *? =drinking_allowed : =no_alcohol",
  lessEqualTest: "when age<=12 *? =child_content : =teen_content",

  // ✅ Pattern Operators
  regexMatchTest: "when email~^admin *? =admin_email : =regular_email",
  regexNotMatchTest: "when email!~@temp *? =permanent_email : =temporary_email",

  // ✅ Existence Operators
  existsTest: "when email.exists *? =has_email : =no_email",
  notExistsTest: "when email.!exists *? =email_required : =email_optional",

  // ✅ State Operators
  emptyTest: "when content.empty *? =content_required : =has_content",
  notEmptyTest: "when content.!empty *? =content_provided : =no_content",
  nullTest: "when metadata.null *? =no_metadata : =has_metadata",
  notNullTest: "when metadata.!null *? =metadata_available : =metadata_missing",

  // ✅ Array Operators
  inTest: "when role.in(admin,moderator) *? =elevated_access : =standard_access",
  notInTest: "when role.!in(guest) *? =member_access : =guest_access",

  // ✅ String Operators
  startsWithTest: "when filename.startsWith(temp_) *? =temporary_file : =permanent_file",
  endsWithTest: "when filename.endsWith(.tmp) *? =temp_extension : =normal_extension",
  containsTest: "when filename.contains(backup) *? =backup_file : =regular_file",
  notContainsTest: "when filename.!contains(test) *? =production_file : =test_file",
});

// Test data covering all scenarios
const testCases = [
  {
    name: "Admin User Test",
    data: {
      role: "admin",
      status: "active",
      age: 30,
      email: "admin@company.com",
      tags: ["important", "priority"],
      metadata: "user_metadata",
      filename: "backup_report.pdf",
      content: "This is important content",
    },
    expected: {
      equalityTest: "admin_access",
      inequalityTest: "full_features",
      greaterTest: "adult_content",
      lessTest: "working_age",
      greaterEqualTest: "drinking_allowed",
      lessEqualTest: "teen_content",
      regexMatchTest: "admin_email",
      regexNotMatchTest: "permanent_email",
      existsTest: "has_email",
      notExistsTest: "email_optional",
      emptyTest: "has_content",
      notEmptyTest: "content_provided",
      nullTest: "has_metadata",
      notNullTest: "metadata_available",
      inTest: "elevated_access",
      notInTest: "member_access",
      startsWithTest: "permanent_file",
      endsWithTest: "normal_extension",
      containsTest: "backup_file",
      notContainsTest: "production_file",
    },
  },
  {
    name: "Guest User Test",
    data: {
      role: "guest",
      status: "pending",
      age: 16,
      email: undefined,
      tags: undefined,
      metadata: null,
      filename: "temp_test_file.tmp",
      content: "",
    },
    expected: {
      equalityTest: "limited_access",
      inequalityTest: "restricted_features",
      greaterTest: "minor_content",
      lessTest: "working_age",
      greaterEqualTest: "no_alcohol",
      lessEqualTest: "teen_content",
      regexMatchTest: "regular_email",
      regexNotMatchTest: "permanent_email",
      existsTest: "no_email",
      notExistsTest: "email_required",
      emptyTest: "content_required",
      notEmptyTest: "no_content",
      nullTest: "no_metadata",
      notNullTest: "metadata_missing",
      inTest: "standard_access",
      notInTest: "guest_access",
      startsWithTest: "temporary_file",
      endsWithTest: "temp_extension",
      containsTest: "regular_file",
      notContainsTest: "test_file",
    },
  },
];

// Run tests
testCases.forEach((testCase, index) => {
  console.log(`\n${index + 1}. ${testCase.name}`);
  console.log("─".repeat(50));

  const result = ComprehensiveSchema.safeParse(testCase.data);

  if (result.success) {
    console.log("✅ VALIDATION PASSED");

    // Check each operator result
    let allCorrect = true;
    Object.entries(testCase.expected).forEach(([field, expectedValue]) => {
      const actualValue = result.data?.[field];
      const isCorrect = actualValue === expectedValue;
      
      if (!isCorrect) {
        allCorrect = false;
      }

      console.log(
        `  ${isCorrect ? "✅" : "❌"} ${field}: ${actualValue} ${
          isCorrect ? "" : `(expected: ${expectedValue})`
        }`
      );
    });

    console.log(`\n🎯 Overall: ${allCorrect ? "ALL CORRECT" : "SOME ERRORS"}`);
  } else {
    console.log("❌ VALIDATION FAILED");
    console.log("Errors:", result.errors);
  }
});

// Type inference test - check IDE support
console.log("\n🔍 IDE Type Inference Test");
console.log("─".repeat(50));
console.log("Hover over these fields in your IDE to see type inference:");

// These should show proper union types in IDE, not 'any'
const schema = Interface({
  testField: "string",
  optionalField: "string?",
  
  // These should show union types like "admin_access" | "limited_access"
  typeTest: "when testField=admin *? =admin_access : =limited_access",
  existsTest: "when optionalField.exists *? =field_exists : =field_missing",
  emptyTest: "when testField.empty *? =is_empty : =has_content",
  nullTest: "when optionalField.null *? =is_null : =not_null",
});

// This should be fully typed
const typedResult = schema.safeParse({
  testField: "admin",
  optionalField: "test",
});

if (typedResult.success) {
  // These should have proper type inference
  const typeTest = typedResult.data.typeTest; // Should be "admin_access" | "limited_access"
  const existsTest = typedResult.data.existsTest; // Should be "field_exists" | "field_missing"
  const emptyTest = typedResult.data.emptyTest; // Should be "is_empty" | "has_content"
  const nullTest = typedResult.data.nullTest; // Should be "is_null" | "not_null"
  
  console.log("✅ Type inference working - check IDE hover support!");
  console.log(`typeTest: ${typeTest}`);
  console.log(`existsTest: ${existsTest}`);
  console.log(`emptyTest: ${emptyTest}`);
  console.log(`nullTest: ${nullTest}`);
}

console.log("\n🎉 Operator Test Complete!");
