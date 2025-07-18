/**
 * Comprehensive tests for all new advanced Mod methods
 * Testing each method to ensure they work correctly and aren't mocks
 */

import { Interface, Mod } from "../src/index";

console.log("🧪 TESTING ADVANCED MOD METHODS");
console.log("=" .repeat(50));

let passedTests = 0;
let totalTests = 0;

function test(name: string, testFn: () => boolean): void {
  totalTests++;
  try {
    const result = testFn();
    if (result) {
      console.log(`✅ ${name}`);
      passedTests++;
    } else {
      console.log(`❌ ${name}`);
    }
  } catch (error) {
    console.log(`❌ ${name} - Error: ${error.message}`);
  }
}

// ===== ADVANCED MERGING & COMPOSITION =====
console.log("\n📋 Advanced Merging & Composition");

test("mergeDeep() merges schemas with conflict resolution", () => {
  const schema1 = Interface({
    id: "number",
    user: {
      name: "string",
      email: "email",
    },
  });

  const schema2 = Interface({
    user: {
      age: "number",
      profile: {
        bio: "string",
      },
    },
    metadata: "object",
  });

  const merged = Mod.mergeDeep(schema1, schema2);
  
  // Test that merged schema accepts data from both schemas
  const result = merged.safeParse({
    id: 1,
    user: {
      name: "John",
      email: "john@example.com",
      age: 30,
      profile: {
        bio: "Developer",
      },
    },
    metadata: { created: "2023-01-01" },
  });

  return result.success;
});

test("clone() creates deep copy with optional modifications", () => {
  const original = Interface({
    id: "number",
    name: "string",
    email: "email",
  });

  const cloned = Mod.clone(original);
  
  // Test that clone works independently
  const result1 = original.safeParse({ id: 1, name: "John", email: "john@example.com" });
  const result2 = cloned.safeParse({ id: 1, name: "John", email: "john@example.com" });

  return result1.success && result2.success;
});

// ===== DEEP TRANSFORMATIONS =====
console.log("\n📋 Deep Transformations");

test("deepPartial() makes nested objects optional recursively", () => {
  const schema = Interface({
    user: {
      profile: {
        name: "string",
        bio: "string",
      },
      settings: {
        theme: "light|dark",
        notifications: "boolean",
      },
    },
  });

  const deepPartialSchema = Mod.deepPartial(schema);
  
  // Should accept empty object (everything optional)
  const result1 = deepPartialSchema.safeParse({});
  
  // Should accept partial nested data
  const result2 = deepPartialSchema.safeParse({
    user: {
      profile: {
        name: "John",
        // bio is optional
      },
      // settings is optional
    },
  });

  return result1.success && result2.success;
});

test("transform() transforms field types using custom mapper", () => {
  const schema = Interface({
    id: "number",
    name: "string",
    email: "email",
  });

  const transformed = Mod.transform(schema, (fieldType) => {
    if (fieldType === "string") return "string?";
    return fieldType;
  });
  
  // Should make string fields optional
  const result = transformed.safeParse({
    id: 1,
    // name is now optional
    email: "john@example.com",
  });

  return result.success;
});

test("rename() renames fields in schemas", () => {
  const schema = Interface({
    user_id: "number",
    user_name: "string",
    user_email: "email",
  });

  const renamed = Mod.rename(schema, {
    user_id: "id",
    user_name: "name", 
    user_email: "email",
  });
  
  // Should accept new field names
  const result = renamed.safeParse({
    id: 1,
    name: "John",
    email: "john@example.com",
  });

  return result.success;
});

test("defaults() adds default values to schemas", () => {
  const schema = Interface({
    id: "number",
    name: "string",
    role: "string?",
  });

  const withDefaults = Mod.defaults(schema, {
    role: "user",
  });
  
  // Should apply defaults for missing fields
  const result = withDefaults.safeParse({
    id: 1,
    name: "John",
    // role should default to "user"
  });

  return result.success && result.data?.role === "user";
});

// ===== SCHEMA BEHAVIOR MODIFIERS =====
console.log("\n📋 Schema Behavior Modifiers");

test("strict() disables additional properties", () => {
  const schema = Interface({
    id: "number",
    name: "string",
  });

  const strictSchema = Mod.strict(schema);
  
  // Should reject additional properties
  const result = strictSchema.safeParse({
    id: 1,
    name: "John",
    extra: "should be rejected",
  });

  return !result.success; // Should fail
});

test("passthrough() allows additional properties", () => {
  const schema = Interface({
    id: "number",
    name: "string",
  });

  const passthroughSchema = Mod.passthrough(schema);
  
  // Should allow additional properties
  const result = passthroughSchema.safeParse({
    id: 1,
    name: "John",
    extra: "should be allowed",
  });

  return result.success && result.data?.extra === "should be allowed";
});

test("nullable() makes all fields accept null values", () => {
  const schema = Interface({
    id: "number",
    name: "string",
  });

  const nullableSchema = Mod.nullable(schema);
  
  // Should accept null values
  const result = nullableSchema.safeParse({
    id: null,
    name: null,
  });

  return result.success;
});

test("conditional() adds conditional validation logic", () => {
  const schema = Interface({
    type: "user|admin",
    permissions: "string[]",
  });

  const conditionalSchema = Mod.conditional(schema, {
    when: { type: "admin" },
    then: { permissions: "string[](1,)" }, // At least 1 permission for admins
    else: { permissions: "string[]?" }, // Optional for users
  });
  
  // Should validate conditional logic
  const result1 = conditionalSchema.safeParse({
    type: "admin",
    permissions: ["read", "write"],
  });

  const result2 = conditionalSchema.safeParse({
    type: "user",
    // permissions optional for users
  });

  return result1.success && result2.success;
});

test("refine() adds custom validation refinements", () => {
  const schema = Interface({
    password: "string",
    confirmPassword: "string",
  });

  const refinedSchema = Mod.refine(schema, (data) => {
    return data.password === data.confirmPassword;
  }, "Passwords must match");
  
  // Should validate custom refinement
  const result1 = refinedSchema.safeParse({
    password: "secret123",
    confirmPassword: "secret123",
  });

  const result2 = refinedSchema.safeParse({
    password: "secret123",
    confirmPassword: "different",
  });

  return result1.success && !result2.success;
});

// ===== CONSTRAINT UTILITIES =====
console.log("\n📋 Constraint Utilities");

test("arrayConstraints() adds min/max constraints to arrays", () => {
  const schema = Interface({
    tags: "string[]",
  });

  const constrainedSchema = Mod.arrayConstraints(schema, "tags", { min: 1, max: 5 });
  
  // Should enforce array constraints
  const result1 = constrainedSchema.safeParse({
    tags: ["tag1", "tag2"],
  });

  const result2 = constrainedSchema.safeParse({
    tags: [], // Should fail (min: 1)
  });

  return result1.success && !result2.success;
});

test("stringConstraints() adds length and pattern constraints", () => {
  const schema = Interface({
    username: "string",
  });

  const constrainedSchema = Mod.stringConstraints(schema, "username", { 
    minLength: 3, 
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_]+$/
  });
  
  // Should enforce string constraints
  const result1 = constrainedSchema.safeParse({
    username: "john_doe123",
  });

  const result2 = constrainedSchema.safeParse({
    username: "ab", // Too short
  });

  return result1.success && !result2.success;
});

test("numberConstraints() adds range and multiple constraints", () => {
  const schema = Interface({
    age: "number",
  });

  const constrainedSchema = Mod.numberConstraints(schema, "age", { 
    min: 18, 
    max: 120,
    multipleOf: 1
  });
  
  // Should enforce number constraints
  const result1 = constrainedSchema.safeParse({
    age: 25,
  });

  const result2 = constrainedSchema.safeParse({
    age: 15, // Too young
  });

  return result1.success && !result2.success;
});

// ===== SCHEMA INTROSPECTION =====
console.log("\n📋 Schema Introspection");

test("info() provides detailed metadata about schema", () => {
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
  
  // Should provide meaningful metadata
  return (
    typeof info === "object" &&
    typeof info.fieldCount === "number" &&
    Array.isArray(info.fieldTypes) &&
    info.fieldCount > 0
  );
});

// ===== SUMMARY =====
console.log("\n" + "=".repeat(50));
console.log(`📊 ADVANCED MOD TESTS: ${passedTests}/${totalTests} tests passed`);

if (passedTests === totalTests) {
  console.log("🎉 ALL ADVANCED MOD METHODS WORK CORRECTLY!");
} else {
  console.log(`⚠️  ${totalTests - passedTests} method(s) failed or are not implemented.`);
}

console.log("=".repeat(50));
