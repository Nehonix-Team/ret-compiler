/**
 * Debug specific Mod methods to understand their current implementations
 */

import { Interface, Mod } from "../src/index";

console.log("🔍 DEBUGGING SPECIFIC MOD METHODS");
console.log("=" .repeat(40));

// ===== TEST deepPartial =====
console.log("\n1. Testing deepPartial()");
try {
  const schema = Interface({
    user: {
      profile: {
        name: "string",
        bio: "string",
      },
    },
  });

  console.log("Original schema definition:", JSON.stringify((schema as any).definition, null, 2));
  
  const deepPartialSchema = Mod.deepPartial(schema);
  console.log("DeepPartial schema definition:", JSON.stringify((deepPartialSchema as any).definition, null, 2));
  
  const result = deepPartialSchema.safeParse({});
  console.log("Empty object result:", result.success);
} catch (error) {
  console.error("deepPartial error:", error.message);
}

// ===== TEST defaults =====
console.log("\n2. Testing defaults()");
try {
  const schema = Interface({
    id: "number",
    name: "string",
    role: "string?",
  });

  console.log("Original schema definition:", JSON.stringify((schema as any).definition, null, 2));
  
  const withDefaults = Mod.defaults(schema, { role: "user" });
  console.log("With defaults schema definition:", JSON.stringify((withDefaults as any).definition, null, 2));
  
  const result = withDefaults.safeParse({ id: 1, name: "John" });
  console.log("Parse result:", result);
} catch (error) {
  console.error("defaults error:", error.message);
}

// ===== TEST strict =====
console.log("\n3. Testing strict()");
try {
  const schema = Interface({
    id: "number",
    name: "string",
  });

  console.log("Original schema options:", JSON.stringify((schema as any).options, null, 2));
  
  const strictSchema = Mod.strict(schema);
  console.log("Strict schema options:", JSON.stringify((strictSchema as any).options, null, 2));
  
  const result = strictSchema.safeParse({
    id: 1,
    name: "John",
    extra: "should be rejected",
  });
  console.log("Strict parse result (should fail):", result.success);
  if (!result.success) {
    console.log("Errors:", result.errors.map(e => e.message));
  }
} catch (error) {
  console.error("strict error:", error.message);
}

// ===== TEST passthrough =====
console.log("\n4. Testing passthrough()");
try {
  const schema = Interface({
    id: "number",
    name: "string",
  });

  console.log("Original schema options:", JSON.stringify((schema as any).options, null, 2));
  
  const passthroughSchema = Mod.passthrough(schema);
  console.log("Passthrough schema options:", JSON.stringify((passthroughSchema as any).options, null, 2));
  
  const result = passthroughSchema.safeParse({
    id: 1,
    name: "John",
    extra: "should be allowed",
  });
  console.log("Passthrough parse result (should succeed):", result.success);
  if (result.success) {
    console.log("Data:", result.data);
  }
} catch (error) {
  console.error("passthrough error:", error.message);
}

// ===== TEST info =====
console.log("\n5. Testing info()");
try {
  const schema = Interface({
    id: "number",
    name: "string",
    email: "email",
    profile: {
      bio: "string?",
      age: "number",
    },
    tags: "string[]?",
  });

  const info = Mod.info(schema);
  console.log("Schema info:", info);
} catch (error) {
  console.error("info error:", error.message);
}

console.log("\n" + "=" .repeat(40));
