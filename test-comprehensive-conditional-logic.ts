import { Interface } from "./src/core/schema/mode/interfaces/Interface";

console.log("🧪 COMPREHENSIVE CONDITIONAL LOGIC ANALYSIS");
console.log("Following Zod-like validation principles\n");

// Real-world schema: User profile with conditional fields
const UserProfileSchema = Interface({
  // Basic required fields
  userId: "string",
  email: "string",
  
  // Conditional fields based on runtime data
  hasApiKey: "when apiKey.$exists() *? boolean : =false",
  canUpload: "when permissions.$exists() *? boolean : =false", 
  accountType: "when subscription.$exists() *? string : =free",
  maxFileSize: "when limits.$exists() *? int : =1024",
}).allowUnknown();

console.log("Schema created successfully!\n");

// Test cases that mirror real-world scenarios
const testCases = [
  {
    name: "Complete User Profile",
    description: "User provides all data including runtime properties",
    input: {
      userId: "user123",
      email: "user@example.com",
      apiKey: "sk-abc123",           // Runtime property EXISTS
      permissions: ["read", "write"], // Runtime property EXISTS  
      subscription: "premium",        // Runtime property EXISTS
      limits: { maxSize: 5120 },     // Runtime property EXISTS
      hasApiKey: true,               // User says they have API key
      canUpload: true,               // User says they can upload
      accountType: "premium",        // User says premium account
      maxFileSize: 5120,             // User says 5120 limit
    },
    expectedLogic: {
      // Since runtime properties exist, validate against expected types
      hasApiKey: "boolean (user provided true, apiKey exists → expect boolean → valid)",
      canUpload: "boolean (user provided true, permissions exist → expect boolean → valid)",
      accountType: "string (user provided 'premium', subscription exists → expect string → valid)",
      maxFileSize: "int (user provided 5120, limits exist → expect int → valid)",
    }
  },
  
  {
    name: "Partial User Profile", 
    description: "User provides some data, missing some runtime properties",
    input: {
      userId: "user456", 
      email: "user456@example.com",
      apiKey: "sk-def456",           // Runtime property EXISTS
      // permissions: MISSING         // Runtime property MISSING
      // subscription: MISSING        // Runtime property MISSING
      limits: { maxSize: 2048 },     // Runtime property EXISTS
      hasApiKey: false,              // User says they DON'T have API key (contradiction?)
      canUpload: true,               // User says they can upload
      accountType: "basic",          // User says basic account
      maxFileSize: 2048,             // User says 2048 limit
    },
    expectedLogic: {
      hasApiKey: "boolean (user provided false, apiKey exists → expect boolean → valid)",
      canUpload: "use default false (permissions missing → use =false default)",
      accountType: "use default 'free' (subscription missing → use =free default)", 
      maxFileSize: "int (user provided 2048, limits exist → expect int → valid)",
    }
  },
  
  {
    name: "Minimal User Profile",
    description: "User provides only required fields, no runtime properties",
    input: {
      userId: "user789",
      email: "user789@example.com", 
      // No runtime properties at all
      hasApiKey: false,
      canUpload: false,
      accountType: "free",
      maxFileSize: 512,
    },
    expectedLogic: {
      hasApiKey: "use default false (apiKey missing → use =false default)",
      canUpload: "use default false (permissions missing → use =false default)",
      accountType: "use default 'free' (subscription missing → use =free default)",
      maxFileSize: "use default 1024 (limits missing → use =1024 default)",
    }
  },
  
  {
    name: "Type Mismatch Scenario",
    description: "User provides wrong types when runtime properties exist",
    input: {
      userId: "user999",
      email: "user999@example.com",
      apiKey: "sk-ghi789",           // Runtime property EXISTS
      permissions: ["admin"],        // Runtime property EXISTS
      hasApiKey: "yes",              // WRONG TYPE: string instead of boolean
      canUpload: "true",             // WRONG TYPE: string instead of boolean
    },
    expectedLogic: {
      hasApiKey: "VALIDATION ERROR (apiKey exists → expect boolean, got string)",
      canUpload: "VALIDATION ERROR (permissions exist → expect boolean, got string)",
      accountType: "use default 'free' (subscription missing → use =free default)",
      maxFileSize: "use default 1024 (limits missing → use =1024 default)",
    }
  }
];

// Run comprehensive tests
testCases.forEach((testCase, index) => {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`TEST ${index + 1}: ${testCase.name}`);
  console.log(`Description: ${testCase.description}`);
  console.log(`${"=".repeat(60)}`);
  
  console.log("\n📥 INPUT:");
  console.log(JSON.stringify(testCase.input, null, 2));
  
  console.log("\n🤔 EXPECTED LOGIC:");
  Object.entries(testCase.expectedLogic).forEach(([field, logic]) => {
    console.log(`  ${field}: ${logic}`);
  });
  
  console.log("\n⚡ ACTUAL RESULT:");
  const result = UserProfileSchema.safeParse(testCase.input);
  
  if (result.success) {
    console.log("✅ Validation: SUCCESS");
    console.log("📤 OUTPUT:");
    console.log(JSON.stringify(result.data, null, 2));
    
    console.log("\n🔍 FIELD-BY-FIELD ANALYSIS:");
    
    // Analyze each conditional field
    const conditionalFields = ['hasApiKey', 'canUpload', 'accountType', 'maxFileSize'];
    conditionalFields.forEach(field => {
      const inputValue = testCase.input[field];
      const outputValue = result.data[field];
      const expectedLogic = testCase.expectedLogic[field];
      
      console.log(`\n  ${field}:`);
      console.log(`    Input: ${JSON.stringify(inputValue)} (${typeof inputValue})`);
      console.log(`    Output: ${JSON.stringify(outputValue)} (${typeof outputValue})`);
      console.log(`    Expected Logic: ${expectedLogic}`);
      
      // Check if the result matches logical expectations
      const runtimePropertyExists = checkRuntimeProperty(field, testCase.input);
      console.log(`    Runtime Property Exists: ${runtimePropertyExists}`);
      
      // Determine if result is logically correct
      const isLogicallyCorrect = analyzeFieldLogic(field, testCase.input, outputValue, runtimePropertyExists);
      console.log(`    Logically Correct: ${isLogicallyCorrect ? "✅ YES" : "❌ NO"}`);
    });
    
  } else {
    console.log("❌ Validation: FAILED");
    console.log("🚨 ERRORS:");
    result.errors.forEach(error => console.log(`  - ${error}`));
  }
});

// Helper functions for analysis
function checkRuntimeProperty(field: string, input: any): boolean {
  const runtimePropertyMap = {
    hasApiKey: 'apiKey',
    canUpload: 'permissions', 
    accountType: 'subscription',
    maxFileSize: 'limits'
  };
  
  const runtimeProp = runtimePropertyMap[field];
  return runtimeProp ? (runtimeProp in input) : false;
}

function analyzeFieldLogic(field: string, input: any, output: any, runtimeExists: boolean): boolean {
  const defaults = {
    hasApiKey: false,
    canUpload: false,
    accountType: 'free',
    maxFileSize: 1024
  };
  
  if (runtimeExists) {
    // Runtime property exists → should validate user's input type and keep their value
    const userValue = input[field];
    const expectedType = getExpectedType(field);
    
    if (typeof userValue === expectedType) {
      return output === userValue; // Should keep user's value
    } else {
      return false; // Should have failed validation
    }
  } else {
    // Runtime property missing → should use default value
    return output === defaults[field];
  }
}

function getExpectedType(field: string): string {
  const typeMap = {
    hasApiKey: 'boolean',
    canUpload: 'boolean',
    accountType: 'string', 
    maxFileSize: 'number'
  };
  return typeMap[field] || 'unknown';
}

console.log(`\n${"=".repeat(60)}`);
console.log("🎯 COMPREHENSIVE ANALYSIS COMPLETE");
console.log("Focus: Logical correctness over pass/fail indicators");
console.log(`${"=".repeat(60)}`);
