/**
 * Test file for VSCode extension features:
 * 1. Variable highlighting in conditional expressions
 * 2. Go-to-definition for variables (Ctrl+click)
 */

import { Interface } from "./src/core/schema/mode/interfaces/Interface";

// Test Schema 1: Equality-based conditionals (WORKING)
const EqualitySchema = Interface({
  // Property definitions (jump targets)
  accountType: "free|premium",
  userRole: "admin|user|guest",

  // Conditional expressions (test variable highlighting and go-to-definition)
  maxProjects: "when accountType=free *? int(1,3) : int(1,10)",
  //                  ^^^^^^^^^^^
  //                  Should be highlighted in red/coral
  //                  Ctrl+click should jump to line 11

  adminAccess: "when userRole=admin *? boolean : =false",
  //                 ^^^^^^^^
  //                 Should be highlighted in red/coral
  //                 Ctrl+click should jump to line 12
});

// Test Schema 2: Method-based conditionals (ENHANCED)
const MethodSchema = Interface({
  // Property definitions (jump targets for method conditionals)
  fields: "string[]?",
  email: "email?",
  tags: "string[]?",
  profile: {
    bio: "string?",
    avatar: "url?",
    preferences: "string[]?",
  },

  // Method-based conditional expressions
  hasFields: "when fields.exists *? =true : =false",
  //               ^^^^^^
  //               Should be highlighted in red/coral
  //               Ctrl+click should jump to "fields" property above

  emailRequired: "when email.exists *? string : string?",
  //                   ^^^^^
  //                   Should be highlighted and clickable

  tagsCount: "when tags.exists *? int : =0",
  //               ^^^^
  //               Should be highlighted and clickable
 
  // Nested property method conditionals
  bioLength: "when profile.bio.exists *? int : =0",
  //               ^^^^^^^
  //               Should be highlighted and jump to "profile" property

  hasAvatar: "when profile.avatar.exists *? boolean : =false",
  //               ^^^^^^^
  //               Should be highlighted and clickable

  prefCount: "when profile.preferences.exists *? int : =0",
  //               ^^^^^^^
  //               Should be highlighted and clickable
});

// Test data for equality schema
const equalityTestData = {
  accountType: "free" as const,
  userRole: "admin" as const,
  maxProjects: 2,
  adminAccess: true,
};

// Test data for method schema
const methodTestData = {
  fields: ["field1", "field2"],
  email: "test@example.com",
  tags: ["tag1", "tag2"],
  profile: {
    bio: "Hello world",
    avatar: "https://example.com/avatar.jpg",
    preferences: ["pref1", "pref2"],
  },
  hasFields: true,
  emailRequired: "test@example.com",
  tagsCount: 2,
  bioLength: 11,
  hasAvatar: true,
  prefCount: 2,
};

// Validate both schemas
const equalityResult = EqualitySchema.safeParse(equalityTestData);
const methodResult = MethodSchema.safeParse(methodTestData);

console.log(
  "Equality Schema:",
  equalityResult.success ? "✅ Valid" : "❌ Invalid",
  equalityResult
);
console.log(
  "Method Schema:",
  methodResult.success ? "✅ Valid" : "❌ Invalid",
  methodResult
);

/**
 * Testing Instructions:
 *
 * 1. Open this file in VSCode with Fortify extension active
 * 2. Check variable highlighting:
 *    - "accountType" in line 16 should be highlighted in red/coral
 *    - "userRole" in line 21 should be highlighted in red/coral
 *
 * 3. Test go-to-definition:
 *    - Ctrl+click on "accountType" in line 16 → should jump to line 11
 *    - Ctrl+click on "userRole" in line 21 → should jump to line 12
 *
 * 4. Test method-based conditionals (NEW FEATURE):
 *    - "fields" in line 40 should be highlighted in red/coral
 *    - "email" in line 45 should be highlighted in red/coral
 *    - "tags" in line 49 should be highlighted in red/coral
 *    - "profile" in lines 54, 58, 62 should be highlighted in red/coral
 *    - Ctrl+click on any of these should jump to their property definitions
 *
 * 5. If not working, try these troubleshooting steps:
 *    a) Reload VSCode window: Ctrl+Shift+P → "Developer: Reload Window"
 *    b) Check extension status: Ctrl+Shift+P → "Extensions: Show Installed Extensions" → Find "Fortify Schema"
 *    c) Check for errors: Ctrl+Shift+P → "Developer: Toggle Developer Tools" → Console tab
 *    d) Verify extension is active: Look for "✨ Fortify Schema extension loaded!" message
 *    e) Check semantic tokens: Ctrl+Shift+P → "Developer: Inspect Editor Tokens and Scopes"
 *    f) Try applying color scheme: Ctrl+Shift+P → "Fortify: Apply Fortify Color Scheme"
 *
 * 5. Manual verification:
 *    - Extension should be compiled: Check vscode-extension/out/ folder exists
 *    - Extension should be registered: Check VSCode Extensions panel
 *    - Semantic tokens should be active: Use "Inspect Editor Tokens" on variables
 */
