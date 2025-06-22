/**
 * Comprehensive Test for VSCode Extension
 *
 * This file tests all Fortify Schema syntax patterns to ensure the VSCode extension
 * provides proper syntax highlighting, validation, and IntelliSense support.
 */

import { Interface } from "../src/core/schema/mode/interfaces/Interface";
 
// ✅ BASIC TYPES - Should have proper syntax highlighting
const BasicTypesSchema = Interface({
  // Basic types
  name: "string",
  age: "number",
  active: "boolean",
  created: "date",
  data: "any",

  // Format types
  email: "email",
  website: "url",
  id: "uuid",
  contact: "phone",
  handle: "slug",
  login: "username",

  // Numeric types
  count: "int",
  score: "positive",
  debt: "negative",
  price: "float",

  // invalid type
  invalid: "invalidtype",
});

// ✅ CONSTRAINTS - Should validate properly
const ConstraintsSchema = Interface({
  // String constraints
  title: "string(1,100)",
  description: "string(,500)",
  code: "string(3,3)",

  // Number constraints
  percentage: "number(0,100)",
  rating: "int(1,5)",
  amount: "positive(0.01,)",

  // Array constraints
  tags: "string[](1,10)",
  scores: "number[](,5)",
});

// ✅ REGEX PATTERNS - Should validate regex syntax
const RegexSchema = Interface({
  // Valid regex patterns
  zipCode: "string(/^\\d{5}$/)",
  phoneNumber: "string(/^\\+?[1-9]\\d{1,14}$/)",
  hexColor: "string(/^#[0-9A-Fa-f]{6}$/)",

  // ❌ INVALID - Should show error for malformed regex
  badRegex: "string(/[unclosed/)",

  // ❌ INVALID - Should show error for invalid regex
  invalidPattern: "string(/(?/)",
});

// ✅ UNION TYPES - Should handle literal unions correctly
const UnionSchema = Interface({
  // Literal unions - should NOT show "unknown type" errors
  role: "admin|user|guest",
  status: "active|inactive|pending",
  theme: "light|dark|auto",

  // Mixed unions
  priority: "low|medium|high|critical",

  // ❌ INVALID - Should show error for empty union values
  badUnion: "admin||guest",
  emptyUnion: "|user|admin",
});

// ✅ CONSTANTS - Should recognize =value syntax
const ConstantsSchema = Interface({
  // Constants should NOT show "unknown type" errors
  type: "=user",
  version: "=1.0", 
  environment: "=production",
  defaultRole: "=guest",
});

// ✅ OPTIONAL FIELDS - Should handle ? syntax
const OptionalSchema = Interface({
  required: "string",
  optional: "string?",
  optionalNumber: "number?",
  optionalArray: "string[]?",
  optionalConstant: "=default?",
});

const age = 65; 

// ✅ CONDITIONAL VALIDATION - Should validate all operators
const ConditionalSchema = Interface({
  role: "admin|user|guest",
  age: "int(13,120)",  
  email: "email",  
  status: "active|inactive",
 
  // Basic conditional - should work  
  permissions: "when role=admin *? string[] : string[]?",
 
  // Comparison operators
  adultContent: "when age>=18 *? boolean : =false",
  seniorDiscount: "when age>65 *? number(0,0.5) : =0",
   
  dynamic: `when age> ${age} *? number(0,0.5) : =0`,

  // Inequality operator (runtime only, no IDE error expected)
  paymentRequired: "when role!=admin *? boolean : =false", 

  // Pattern matching
  isCompanyEmail: "when email~@company.com *? =corporate : =personal",
  notTempEmail: "when email!~@temp *? =permanent : =temporary",

  // Logical operators  
  fullAccess: "when role=admin && status=active *? =granted : =denied",
  limitedAccess: "when role=user || role=guest *? =limited : =none",
 
  // Method calls
  hasPermissions: "when role.in(admin,moderator) *? string[] : =null",
  isVerified: "when email.exists *? boolean : =false",
  hasContent: "when email.!empty *? =verified : =pending",

  // ❌ INVALID - Should show errors
  missingThen: "when role=admin string",
  missingElse: "when role=admin *? string",
  invalidOperator: "when role===admin *? string : string?",
});

// ✅ COMPLEX NESTED CONDITIONALS
const ComplexConditionalSchema = Interface({
  userType: "free|premium|enterprise",
  accountStatus: "trial|active|suspended",
  region: "us|eu|asia", 

  // Nested conditionals
  features:
    "when userType=premium *? string[] : when userType=enterprise *? string[] : =null",

  // Multiple conditions
  supportLevel:
    "when userType=enterprise && region=us *? =priority : =standard",

  // Complex pattern matching
  emailType:
    "when email~@(company|corp|enterprise) *? =corporate : when email~@(gmail|yahoo|hotmail) *? =personal : =unknown",
});

// ✅ ARRAY TYPES - Should handle array syntax
const ArraySchema = Interface({
  // Basic arrays
  tags: "string[]",
  numbers: "number[]",
  flags: "boolean[]",

  // Optional arrays
  optionalTags: "string[]?",

  // Array constraints
  limitedTags: "string[](1,5)",
  scores: "number[](,10)",
});

// ✅ METHOD CALLS - Should validate method names and negation
const MethodSchema = Interface({
  email: "email",
  tags: "string[]",
  age: "int",

  // Valid methods
  hasEmail: "when email.exists *? =verified : =unverified",
  isEmpty: "when tags.empty *? =no_tags : =has_tags",
  isAdult: "when age.between(18,65) *? =adult : =minor",

  // Negated methods
  notEmpty: "when tags.!empty *? =has_content : =empty",
  notExists: "when email.!exists *? =missing : =present",

  // String methods
  isAdmin: "when email.contains(admin) *? =admin_user : =regular_user",
  isCompany: "when email.endsWith(.com) *? =company : =other",

  // ❌ INVALID - Should show errors for unknown methods
  invalidMethod: "when email.unknownMethod() *? string : string?",

  // ❌ INVALID - Should show errors for unsupported negation
  badNegation: "when age.!between(18,65) *? string : string?",

  // ❌ INVALID - Should show error for unknown type
  invalidType: "invalidtype",
});

// Test the schemas
console.log("🧪 Testing VSCode Extension Validation...");

// This should parse successfully
const validData = {
  // BasicTypesSchema
  name: "John Doe",
  age: 30,
  active: true,
  created: new Date(),
  data: { any: "value" },
  email: "john@example.com",
  website: "https://example.com",
  id: "123e4567-e89b-12d3-a456-426614174000",
  contact: "+1234567890",
  handle: "john-doe",
  login: "johndoe",
  count: 42,
  score: 95,
  debt: -100,
  price: 29.99,
};

console.log("✅ Extension validation test complete!");
console.log(
  "📝 Check VSCode for proper syntax highlighting and error detection"
);
