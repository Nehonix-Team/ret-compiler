import { Interface } from "./src/core/schema/mode/interfaces/Interface";

console.log("🎉 FORTIFY SCHEMA: NEW RUNTIME METHOD SYNTAX DEMO\n");
console.log("=" .repeat(60));

// ===================================================================
// DEMO 1: LEGACY SYNTAX - Schema-defined properties
// ===================================================================
console.log("\n📋 DEMO 1: LEGACY SYNTAX (.method)");
console.log("For properties defined in the schema");
console.log("-".repeat(40));

const LegacySchema = Interface({
  // Schema-defined properties
  name: "string",
  email: "email?",
  tags: "string[]?",
  
  // Legacy conditional syntax - validates against schema
  hasName: "when name.exists *? boolean : =false",
  hasEmail: "when email.exists *? boolean : =false", 
  tagCount: "when tags.exists *? int : =0",
});

const legacyData = {
  name: "John Doe",
  email: "john@example.com",
  tags: ["developer", "typescript"],
  hasName: true,
  hasEmail: true,
  tagCount: 2,
};

console.log("Input:", JSON.stringify(legacyData, null, 2));
const legacyResult = LegacySchema.safeParse(legacyData);
console.log("Result:", legacyResult.success ? "✅ SUCCESS" : "❌ FAILED");
if (legacyResult.success) {
  console.log("Output:", JSON.stringify(legacyResult.data, null, 2));
} else {
  console.log("Errors:", legacyResult.errors);
}

// ===================================================================
// DEMO 2: RUNTIME SYNTAX - Runtime-only properties  
// ===================================================================
console.log("\n🚀 DEMO 2: RUNTIME SYNTAX (.$method())");
console.log("For properties that may exist in runtime data");
console.log("-".repeat(40));

const RuntimeSchema = Interface({
  // Only schema-validated properties
  userId: "string",
  isActive: "boolean",
  
  // Runtime conditionals - check for external properties
  hasApiKey: "when apiKey.$exists() *? boolean : =false",
  hasPermissions: "when permissions.$exists() *? boolean : =false",
  contextType: "when requestType.$exists() *? string : =unknown",
});

const runtimeData = {
  userId: "user123",
  isActive: true,
  hasApiKey: false,      // apiKey doesn't exist in data
  hasPermissions: false, // permissions doesn't exist in data  
  contextType: "unknown", // requestType doesn't exist in data
};

console.log("Input:", JSON.stringify(runtimeData, null, 2));
const runtimeResult = RuntimeSchema.safeParse(runtimeData);
console.log("Result:", runtimeResult.success ? "✅ SUCCESS" : "❌ FAILED");
if (runtimeResult.success) {
  console.log("Output:", JSON.stringify(runtimeResult.data, null, 2));
} else {
  console.log("Errors:", runtimeResult.errors);
}

// ===================================================================
// DEMO 3: MIXED SYNTAX - Both approaches together
// ===================================================================
console.log("\n🔄 DEMO 3: MIXED SYNTAX");
console.log("Combining both legacy and runtime methods");
console.log("-".repeat(40));

const MixedSchema = Interface({
  // Schema properties
  profile: {
    name: "string",
    bio: "string?",
  },
  
  // Legacy methods for schema properties
  hasProfile: "when profile.exists *? boolean : =false",
  hasBio: "when profile.bio.exists *? boolean : =false",
  
  // Runtime methods for external properties
  hasExternalId: "when externalId.$exists() *? boolean : =false",
  hasMetadata: "when metadata.$exists() *? boolean : =false",
});

const mixedData = {
  profile: {
    name: "Alice Smith",
    bio: "Software Engineer",
  },
  hasProfile: true,
  hasBio: true,
  hasExternalId: false, // externalId doesn't exist
  hasMetadata: false,   // metadata doesn't exist
};

console.log("Input:", JSON.stringify(mixedData, null, 2));
const mixedResult = MixedSchema.safeParse(mixedData);
console.log("Result:", mixedResult.success ? "✅ SUCCESS" : "❌ FAILED");
if (mixedResult.success) {
  console.log("Output:", JSON.stringify(mixedResult.data, null, 2));
} else {
  console.log("Errors:", mixedResult.errors);
}

console.log("\n" + "=".repeat(60));
console.log("🎯 SUMMARY:");
console.log("✅ Legacy syntax (.method) - for schema-defined properties");
console.log("✅ Runtime syntax (.$method()) - for runtime-only properties");
console.log("✅ Both syntaxes can be used together in the same schema");
console.log("=" .repeat(60));
