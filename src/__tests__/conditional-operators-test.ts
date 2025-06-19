import { Interface } from "../core/schema/mode/interfaces/Interface";

// ====================================================================
// COMPREHENSIVE CONDITIONAL OPERATORS TEST
// Testing all "when *?" syntax operators with real-world scenarios
// ====================================================================

console.log("🧪 Starting Fortify Schema Conditional Operators Test Suite\n");

// ====================================================================
// 1. BASIC COMPARISON OPERATORS TEST
// ====================================================================

console.log("1️⃣ Testing Basic Comparison Operators (=, !=, >, <, >=, <=)");
 
const UserManagementSchema = Interface({
  // Base fields
  id: "positive",
  username: "string(3,20)",
  email: "email",
  age: "int(13,120)",
  role: "admin|user|guest|moderator",
  accountType: "free|premium|enterprise",
  subscriptionLevel: "basic|pro|enterprise",

  // Equality operator (=)
  adminPermissions: "when role=admin *? string[] : string[]?",
  systemAccess: "when role=admin *? =full : =limited",

  // Inequality operator (!=) - Runtime only
  paymentRequired: "when accountType!=free *? =true : =false",
  supportLevel: "when role!=guest *? =premium : =basic",

  // Numeric comparison operators
  adultContent: "when age>=18 *? boolean : =false",
  seniorDiscount: "when age>=65 *? number(0.1,0.3) : =0",
  youthProgram: "when age<25 *? =eligible : =not_eligible",
  restrictedContent: "when age>21 *? string[] : string[]?",
  earlyAccess: "when age<=30 *? boolean : =false",
});

const testUsers = [
  {
    id: 1,
    username: "admin_user",
    email: "admin@company.com",
    age: 35,
    role: "admin",
    accountType: "enterprise",
    subscriptionLevel: "enterprise",
    adminPermissions: ["read", "write", "delete"],
    systemAccess: "full",
    paymentRequired: true,
    supportLevel: "premium",
    adultContent: true,
    seniorDiscount: 0,
    youthProgram: "not_eligible",
    restrictedContent: ["content1", "content2"],
    earlyAccess: true,
  },
  {
    id: 2,
    username: "young_user",
    email: "user@example.com",
    age: 16,
    role: "user",
    accountType: "free",
    subscriptionLevel: "basic",
    adminPermissions: null,
    systemAccess: "limited",
    paymentRequired: false,
    supportLevel: "premium",
    adultContent: false,
    seniorDiscount: 0,
    youthProgram: "eligible",
    restrictedContent: null,
    earlyAccess: true,
  },
  {
    id: 3,
    username: "senior_member",
    email: "senior@example.com",
    age: 70,
    role: "user",
    accountType: "premium",
    subscriptionLevel: "pro",
    adminPermissions: null,
    systemAccess: "limited",
    paymentRequired: true,
    supportLevel: "premium",
    adultContent: true,
    seniorDiscount: 0.2,
    youthProgram: "not_eligible",
    restrictedContent: ["content1"],
    earlyAccess: false,
  },
];

testUsers.forEach((user, index) => {
  const result = UserManagementSchema.safeParse(user as any);
  console.log(
    `Test User ${index + 1}:`,
    result.success ? "✅ PASS" : "❌ FAIL"
  );
  if (!result.success) {
    console.log("Errors:", result.errors);
  } else if (result.data) {
    console.log(`  - Admin Permissions: ${result.data.adminPermissions}`);
    console.log(`  - System Access: ${result.data.systemAccess}`);
    console.log(`  - Payment Required: ${result.data.paymentRequired}`);
    console.log(`  - Support Level: ${result.data.supportLevel}`);
    console.log(`  - Adult Content: ${result.data.adultContent}`);
    console.log(`  - Senior Discount: ${result.data.seniorDiscount}`);
    console.log(`  - Youth Program: ${result.data.youthProgram}`);
    console.log(`  - Restricted Content: ${result.data.restrictedContent}`);
    console.log(`  - Early Access: ${result.data.earlyAccess}`);
  }
});

// ====================================================================
// 2. PATTERN OPERATORS TEST (~ and !~)
// ====================================================================

console.log("\n2️⃣ Testing Pattern Operators (~ and !~)");

const EmailProcessingSchema = Interface({
  email: "email",
  domain: "string",
  username: "string",
  accountType: "personal|business|education",

  // Regex pattern matching
  isAdminEmail: "when email~^admin *? =true : =false",
  isOrgEmail: "when email~@(company|org|gov) *? =institutional : =personal",
  isTempEmail: "when email~(temp|disposable|10min) *? =temporary : =permanent",

  // Negative regex matching
  isNotTestEmail: "when email!~(test|demo|example) *? =production : =testing",
  isSecureEmail: "when email!~@(gmail|yahoo|hotmail) *? =corporate : =consumer",
  isPermanentEmail:
    "when domain!~(temp|trash|guerrilla) *? =permanent : =disposable",
});

const testEmails = [
  {
    email: "admin@company.com",
    domain: "company.com",
    username: "admin",
    accountType: "business",
    isAdminEmail: true,
    isOrgEmail: "institutional",
    isTempEmail: "permanent",
    isNotTestEmail: "production",
    isSecureEmail: "corporate",
    isPermanentEmail: "permanent",
  },
  {
    email: "user@tempmail.org",
    domain: "tempmail.org",
    username: "user",
    accountType: "personal",
    isAdminEmail: false,
    isOrgEmail: "institutional",
    isTempEmail: "temporary",
    isNotTestEmail: "production",
    isSecureEmail: "corporate",
    isPermanentEmail: "disposable",
  },
  {
    email: "test@gmail.com",
    domain: "gmail.com",
    username: "test",
    accountType: "personal",
    isAdminEmail: false,
    isOrgEmail: "personal",
    isTempEmail: "permanent",
    isNotTestEmail: "testing",
    isSecureEmail: "consumer",
    isPermanentEmail: "permanent",
  },
];

testEmails.forEach((emailData, index) => {
  const result = EmailProcessingSchema.safeParse(emailData as any);
  console.log(
    `Email Test ${index + 1}:`,
    result.success ? "✅ PASS" : "❌ FAIL"
  );
  if (result.success) {
    console.log(`  - Admin: ${result?.data?.isAdminEmail}`);
    console.log(`  - Org: ${result?.data?.isOrgEmail}`);
    console.log(`  - Temp: ${result?.data?.isTempEmail}`);
    console.log(`  - Not Test: ${result?.data?.isNotTestEmail}`);
    console.log(`  - Secure: ${result?.data?.isSecureEmail}`);
    console.log(`  - Permanent: ${result?.data?.isPermanentEmail}`);
  } else {
    console.log("Errors:", result.errors);
  }
});

// ====================================================================
// 3. EXISTENCE OPERATORS TEST (.exists and .!exists)
// ====================================================================

console.log("\n3️⃣ Testing Existence Operators (.exists and .!exists)");

const OrderProcessingSchema = Interface({
  orderId: "positive",
  customerEmail: "email",
  paymentMethod: "string?",
  shippingAddress: "string?",
  promoCode: "string?",
  giftMessage: "string?",

  // Existence checks
  paymentProcessing:
    "when paymentMethod.exists *? =required : =cash_on_delivery",
  shippingRequired: "when shippingAddress.exists *? =ship : =pickup",
  discountApplied: "when promoCode.exists *? number(0.05,0.5) : =0",

  // Non-existence checks
  expressShipping: "when giftMessage.!exists *? boolean : =false",
  standardProcessing: "when paymentMethod.!exists *? =delayed : =immediate",
  defaultShipping: "when shippingAddress.!exists *? =store_pickup : =delivery",
});

const testOrders = [
  {
    orderId: 1,
    customerEmail: "customer@example.com",
    paymentMethod: "credit_card",
    shippingAddress: "123 Main St, City, State",
    promoCode: "SAVE20",
    giftMessage: undefined,
    paymentProcessing: "required",
    shippingRequired: "ship",
    discountApplied: 0.2,
    expressShipping: true,
    standardProcessing: "immediate",
    defaultShipping: "delivery",
  },
  {
    orderId: 2,
    customerEmail: "customer2@example.com",
    paymentProcessing: "cash_on_delivery",
    shippingRequired: "pickup",
    discountApplied: 0,
    expressShipping: true,
    standardProcessing: "delayed",
    defaultShipping: "store_pickup",
  },
  {
    orderId: 3,
    customerEmail: "customer3@example.com",
    giftMessage: "Happy Birthday!",
    paymentProcessing: "cash_on_delivery",
    shippingRequired: "pickup",
    discountApplied: 0,
    expressShipping: false,
    standardProcessing: "delayed",
    defaultShipping: "store_pickup",
  },
];

testOrders.forEach((order, index) => {
  const result = OrderProcessingSchema.safeParse(order as any);
  console.log(
    `Order Test ${index + 1}:`,
    result.success ? "✅ PASS" : "❌ FAIL"
  );
  if (result.success) {
    console.log(`  - Payment: ${result.data?.paymentProcessing}`);
    console.log(`  - Shipping: ${result.data?.shippingRequired}`);
    console.log(`  - Discount: ${result.data?.discountApplied}`);
    console.log(`  - Express Shipping: ${result.data?.expressShipping}`);
    console.log(`  - Standard Processing: ${result.data?.standardProcessing}`);
    console.log(`  - Default Shipping: ${result.data?.defaultShipping}`);
  } else {
    console.log("Errors:", result.errors);
  }
});

// ====================================================================
// 4. STATE OPERATORS TEST (.empty, .!empty, .null, .!null)
// ====================================================================

console.log("\n4️⃣ Testing State Operators (.empty, .!empty, .null, .!null)");

const ContentManagementSchema = Interface({
  title: "string",
  content: "string?",
  tags: "string[]?",
  metadata: "string?",
  status: "draft|published|archived",

  // Empty state checks
  contentWarning: "when content.empty *? =required : =optional",
  tagsRequired: "when tags.empty *? =add_tags : =tagged",

  // Non-empty state checks
  contentLength: "when content.!empty *? int(1,) : =0",
  tagCount: "when tags.!empty *? int(1,) : =0",

  // Null checks
  metadataStatus: "when metadata.null *? =no_metadata : =has_metadata",

  // Non-null checks
  hasMetadata: "when metadata.!null *? =true : =false",
});

const testContent = [
  {
    title: "Complete Article",
    content: "This is a full article with content",
    tags: ["tech", "programming"],
    metadata: "author: John Doe",
    status: "published",
    contentWarning: "optional",
    tagsRequired: "tagged",
    contentLength: 34,
    tagCount: 2,
    metadataStatus: "has_metadata",
    hasMetadata: true,
  },
  {
    title: "Empty Draft",
    content: "",
    tags: [],
    metadata: null,
    status: "draft",
    contentWarning: "required",
    tagsRequired: "add_tags",
    contentLength: 0,
    tagCount: 0,
    metadataStatus: "no_metadata",
    hasMetadata: false,
  },
  {
    title: "Partial Content",
    content: "Some content",
    tags: undefined,
    metadata: undefined,
    status: "draft",
    contentWarning: "optional",
    tagsRequired: "add_tags",
    contentLength: 12,
    tagCount: 0,
    metadataStatus: "no_metadata",
    hasMetadata: false,
  },
];

testContent.forEach((content, index) => {
  const result = ContentManagementSchema.safeParse(content);
  console.log(
    `Content Test ${index + 1}:`,
    result.success ? "✅ PASS" : "❌ FAIL"
  );
  if (result.success) {
    console.log(`  - Content Warning: ${result.data.contentWarning}`);
    console.log(`  - Tags Required: ${result.data.tagsRequired}`);
    console.log(`  - Content Length: ${result.data.contentLength}`);
    console.log(`  - Tag Count: ${result.data.tagCount}`);
    console.log(`  - Metadata Status: ${result.data.metadataStatus}`);
    console.log(`  - Has Metadata: ${result.data.hasMetadata}`);
  } else {
    console.log("Errors:", result.errors);
  }
});

// ====================================================================
// 5. ARRAY OPERATORS TEST (.in() and .!in())
// ====================================================================

console.log("\n5️⃣ Testing Array Operators (.in() and .!in())");

const ProjectManagementSchema = Interface({
  userId: "positive",
  role: "developer|designer|manager|tester|admin",
  department: "engineering|design|marketing|sales|hr",
  clearanceLevel: "public|internal|confidential|secret",
  skills: "string[]",

  // Array inclusion checks
  advancedFeatures: "when role.in(admin,manager) *? string[] : string[]?",
  highSecurity:
    "when clearanceLevel.in(confidential,secret) *? =enabled : =disabled",
  crossDepartment: "when department.in(engineering,design) *? boolean : =false",

  // Array exclusion checks
  restrictedAccess: "when role.!in(guest,intern) *? string[] : string[]?",
  standardSecurity: "when clearanceLevel.!in(secret) *? =standard : =enhanced",
  generalAccess: "when department.!in(hr,legal) *? =granted : =restricted",
});

const testProjects = [
  {
    userId: 1,
    role: "admin",
    department: "engineering",
    clearanceLevel: "secret",
    skills: ["leadership", "architecture"],
    advancedFeatures: ["feature1", "feature2"],
    highSecurity: "enabled",
    crossDepartment: true,
    restrictedAccess: ["access1"],
    standardSecurity: "enhanced",
    generalAccess: "granted",
  },
  {
    userId: 2,
    role: "developer",
    department: "marketing",
    clearanceLevel: "public",
    skills: ["javascript", "react"],
    advancedFeatures: null,
    highSecurity: "disabled",
    crossDepartment: false,
    restrictedAccess: ["access1"],
    standardSecurity: "standard",
    generalAccess: "granted",
  },
  {
    userId: 3,
    role: "designer",
    department: "design",
    clearanceLevel: "confidential",
    skills: ["ui", "ux", "figma"],
    advancedFeatures: null,
    highSecurity: "enabled",
    crossDepartment: true,
    restrictedAccess: ["access1"],
    standardSecurity: "standard",
    generalAccess: "granted",
  },
];

testProjects.forEach((project, index) => {
  const result = ProjectManagementSchema.safeParse(project);
  console.log(
    `Project Test ${index + 1}:`,
    result.success ? "✅ PASS" : "❌ FAIL"
  );
  if (result.success) {
    console.log(
      `  - Advanced Features: ${Array.isArray(result.data.advancedFeatures) ? "Array" : result.data.advancedFeatures}`
    );
    console.log(`  - High Security: ${result.data.highSecurity}`);
    console.log(`  - Cross Department: ${result.data.crossDepartment}`);
    console.log(`  - Restricted Access: ${result.data.restrictedAccess}`);
    console.log(`  - Standard Security: ${result.data.standardSecurity}`);
    console.log(`  - General Access: ${result.data.generalAccess}`);
  } else {
    console.log("Errors:", result.errors);
  }
});

// ====================================================================
// 6. STRING OPERATORS TEST (.startsWith(), .endsWith(), .contains(), .!contains())
// ====================================================================

console.log(
  "\n6️⃣ Testing String Operators (.startsWith(), .endsWith(), .contains(), .!contains())"
);

const FileManagementSchema = Interface({
  filename: "string",
  filepath: "string",
  fileType: "document|image|video|audio|code",
  permissions: "string",

  // String starts with checks
  tempFileAction: "when filename.startsWith(temp_) *? =delete : =keep",
  backupFileAction: "when filename.startsWith(backup_) *? =archive : =process",

  // String ends with checks
  imageProcessing: "when filename.endsWith(.jpg,.png,.gif) *? =resize : =skip",
  configValidation:
    "when filename.endsWith(.config,.json) *? =validate : =ignore",

  // String contains checks
  securityLevel: "when filepath.contains(/secure/) *? =high : =normal",
  privateAccess: "when filepath.contains(/private/) *? =restricted : =public",

  // String does not contain checks
  publicAccess: "when filepath.!contains(/admin/) *? =allowed : =denied",
  standardProcessing:
    "when filename.!contains(test_) *? =production : =testing",
});

const testFiles = [
  {
    filename: "temp_user_data.json",
    filepath: "/app/secure/temp/temp_user_data.json",
    fileType: "document",
    permissions: "rw-------",
    tempFileAction: "delete",
    backupFileAction: "process",
    imageProcessing: "resize",
    configValidation: "validate",
    securityLevel: "high",
    privateAccess: "public",
    publicAccess: "allowed",
    standardProcessing: "production",
  },
  {
    filename: "profile_image.jpg",
    filepath: "/app/public/images/profile_image.jpg",
    fileType: "image",
    permissions: "rw-r--r--",
    tempFileAction: "keep",
    backupFileAction: "process",
    imageProcessing: "resize",
    configValidation: "ignore",
    securityLevel: "normal",
    privateAccess: "public",
    publicAccess: "allowed",
    standardProcessing: "production",
  },
  {
    filename: "backup_database.sql",
    filepath: "/app/private/backups/backup_database.sql",
    fileType: "document",
    permissions: "rw-------",
    tempFileAction: "keep",
    backupFileAction: "archive",
    imageProcessing: "skip",
    configValidation: "ignore",
    securityLevel: "normal",
    privateAccess: "restricted",
    publicAccess: "allowed",
    standardProcessing: "production",
  },
  {
    filename: "test_config.json",
    filepath: "/app/admin/config/test_config.json",
    fileType: "document",
    permissions: "rw-rw-r--",
    tempFileAction: "keep",
    backupFileAction: "process",
    imageProcessing: "resize",
    configValidation: "validate",
    securityLevel: "normal",
    privateAccess: "public",
    publicAccess: "denied",
    standardProcessing: "testing",
  },
];

testFiles.forEach((file, index) => {
  const result = FileManagementSchema.safeParse(file);
  console.log(
    `File Test ${index + 1}:`,
    result.success ? "✅ PASS" : "❌ FAIL"
  );
  if (result.success) {
    console.log(`  - Temp File Action: ${result.data.tempFileAction}`);
    console.log(`  - Backup File Action: ${result.data.backupFileAction}`);
    console.log(`  - Image Processing: ${result.data.imageProcessing}`);
    console.log(`  - Config Validation: ${result.data.configValidation}`);
    console.log(`  - Security Level: ${result.data.securityLevel}`);
    console.log(`  - Private Access: ${result.data.privateAccess}`);
    console.log(`  - Public Access: ${result.data.publicAccess}`);
    console.log(`  - Standard Processing: ${result.data.standardProcessing}`);
  } else {
    console.log("Errors:", result.errors);
  }
});

// ====================================================================
// 7. COMPLEX NESTED CONDITIONS TEST
// ====================================================================

console.log("\n7️⃣ Testing Complex Nested Conditions (Real-World Scenarios)");

const ECommerceSchema = Interface({
  // Customer data
  customerId: "positive",
  customerType: "guest|registered|premium|vip",
  age: "int(13,120)",
  country: "string(2)",

  // Order data
  orderValue: "number(0.01,)",
  itemCount: "int(1,)",
  shippingMethod: "standard|express|overnight",
  paymentMethod: "cash|card|paypal|crypto",

  // Product data
  productCategory: "electronics|clothing|books|food|home",
  productBrand: "string?",
  isLuxury: "boolean",

  // Complex conditional logic
  shippingCost:
    "when orderValue>=100 *? =0 : when shippingMethod=express *? number(15,25) : number(5,15)",
  taxRate:
    "when country.in(US,CA) *? when orderValue>=50 *? number(0.05,0.15) : number(0.08,0.18) : number(0,0.25)",
  loyaltyPoints:
    "when customerType.in(premium,vip) *? when orderValue>=200 *? int(20,) : int(10,) : when customerType=registered *? int(1,10) : =0",
  freeShipping:
    "when customerType=vip *? =true : when orderValue>=75 *? =true : when country.in(US,CA,UK) *? when orderValue>=50 *? =true : =false : =false",
  expressEligible:
    "when age>=18 *? when paymentMethod.!in(cash) *? when country.in(US,CA,UK,DE,FR) *? =true : =false : =false : =false",
  luxuryTax:
    "when isLuxury=true *? when orderValue>=1000 *? number(0.1,0.3) : number(0.05,0.15) : =0",
  bulkDiscount:
    "when itemCount>=10 *? when customerType.in(premium,vip) *? number(0.15,0.25) : number(0.05,0.15) : when itemCount>=5 *? number(0.02,0.08) : =0",
});

const testECommerceOrders = [
  {
    customerId: 1,
    customerType: "vip",
    age: 45,
    country: "US",
    orderValue: 250.0,
    itemCount: 3,
    shippingMethod: "express",
    paymentMethod: "card",
    productCategory: "electronics",
    productBrand: "Apple",
    isLuxury: true,
    shippingCost: 0,
    taxRate: 0.1,
    loyaltyPoints: 20,
    freeShipping: true,
    expressEligible: true,
    luxuryTax: 0.05,
    bulkDiscount: 0,
  },
  {
    customerId: 2,
    customerType: "guest",
    age: 22,
    country: "FR",
    orderValue: 35.99,
    itemCount: 2,
    shippingMethod: "standard",
    paymentMethod: "paypal",
    productCategory: "clothing",
    isLuxury: false,
    shippingCost: 5,
    taxRate: 0.1,
    loyaltyPoints: 0,
    freeShipping: false,
    expressEligible: true,
    luxuryTax: 0,
    bulkDiscount: 0,
  },
  {
    customerId: 3,
    customerType: "premium",
    age: 35,
    country: "CA",
    orderValue: 1200.0,
    itemCount: 15,
    shippingMethod: "overnight",
    paymentMethod: "crypto",
    productCategory: "electronics",
    productBrand: "Samsung",
    isLuxury: true,
    shippingCost: 0,
    taxRate: 0.1,
    loyaltyPoints: 20,
    freeShipping: true,
    expressEligible: true,
    luxuryTax: 0.2,
    bulkDiscount: 0.2,
  },
];

testECommerceOrders.forEach((order, index) => {
  const result = ECommerceSchema.safeParse(order);
  console.log(
    `E-Commerce Test ${index + 1}:`,
    result.success ? "✅ PASS" : "❌ FAIL"
  );
  if (result.success) {
    console.log(`  - Shipping Cost: ${result.data.shippingCost}`);
    console.log(`  - Tax Rate: ${result.data.taxRate}`);
    console.log(`  - Loyalty Points: ${result.data.loyaltyPoints}`);
    console.log(`  - Free Shipping: ${result.data.freeShipping}`);
    console.log(`  - Express Eligible: ${result.data.expressEligible}`);
    console.log(`  - Luxury Tax: ${result.data.luxuryTax}`);
    console.log(`  - Bulk Discount: ${result.data.bulkDiscount}`);
  } else {
    console.log("Errors:", result.errors);
  }
});

// ====================================================================
// 8. EDGE CASES AND ERROR HANDLING TEST
// ====================================================================

console.log("\n8️⃣ Testing Edge Cases and Error Handling");

const EdgeCaseSchema = Interface({
  testField: "string",
  numericField: "number?",
  arrayField: "string[]?",
  booleanField: "boolean?",

  // Testing edge cases
  emptyStringTest: "when testField.empty *? =empty_detected : =has_content",
  zeroNumberTest: "when numericField=0 *? =zero_detected : =non_zero",
  falseTest: "when booleanField=false *? =false_detected : =not_false",
  undefinedTest:
    "when numericField.!exists *? =undefined_detected : =has_value",
});

const edgeCases = [
  {
    testField: "",
    numericField: 0,
    arrayField: [],
    booleanField: false,
    emptyStringTest: "empty_detected",
    zeroNumberTest: "zero_detected",
    falseTest: "false_detected",
    undefinedTest: "has_value",
  },
  {
    testField: "content",
    numericField: undefined,
    arrayField: undefined,
    booleanField: undefined,
    emptyStringTest: "has_content",
    zeroNumberTest: "non_zero",
    falseTest: "not_false",
    undefinedTest: "undefined_detected",
  },
  {
    testField: "   ",
    numericField: -1,
    arrayField: ["item"],
    booleanField: true,
    emptyStringTest: "has_content",
    zeroNumberTest: "non_zero",
    falseTest: "not_false",
    undefinedTest: "has_value",
  },
];

edgeCases.forEach((testCase, index) => {
  const result = EdgeCaseSchema.safeParse(testCase);
  console.log(
    `Edge Case Test ${index + 1}:`,
    result.success ? "✅ PASS" : "❌ FAIL"
  );
  if (result.success) {
    console.log(`  - Empty String: ${result.data.emptyStringTest}`);
    console.log(`  - Zero Number: ${result.data.zeroNumberTest}`);
    console.log(`  - False Test: ${result.data.falseTest}`);
    console.log(`  - Undefined Test: ${result.data.undefinedTest}`);
  } else {
    console.log("Errors:", result.errors);
  }
});

// ====================================================================
// 9. PERFORMANCE AND STRESS TEST
// ====================================================================

console.log("\n9️⃣ Performance and Stress Test (1000 validations)");

const PerformanceSchema = Interface({
  id: "positive",
  type: "user|admin|guest|moderator|supervisor",
  level: "int(1,100)",
  status: "active|inactive|pending|suspended",

  // Multiple conditions to stress test
  access:
    "when type.in(admin,supervisor) *? when level>=50 *? =full : =limited : when type=moderator *? when level>=25 *? =moderate : =basic : =minimal",
  features:
    "when status=active *? when type!=guest *? string[] : string[]? : string[]?",
  priority:
    "when level>=75 *? =high : when level>=50 *? =medium : when level>=25 *? =normal : =low",
});

// Generate 1000 test cases
const performanceTestCases = Array.from({ length: 1000 }, (_, index) => ({
  id: index + 1,
  type: ["user", "admin", "guest", "moderator", "supervisor"][index % 5],
  level: Math.floor(Math.random() * 100) + 1,
  status: ["active", "inactive", "pending", "suspended"][index % 4],
  access: ["minimal", "basic", "moderate", "limited", "full"][index % 5],
  features:
    ["feature1", "feature2"][index % 2] === 0 ? ["feature1", "feature2"] : null,
  priority: ["low", "normal", "medium", "high"][index % 4],
}));

console.time("Performance Test");
let performancePassCount = 0;
performanceTestCases.forEach((testCase, index) => {
  const result = PerformanceSchema.safeParse(testCase);
  if (result.success) {
    performancePassCount++;
  } else {
    console.log(`Performance Test ${index + 1} Failed:`, result.errors);
  }
});
console.timeEnd("Performance Test");
console.log(
  `Performance Test Results: ${performancePassCount}/1000 tests passed (${((performancePassCount / 1000) * 100).toFixed(2)}%)`
);
