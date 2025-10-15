/**
 * Test file to reproduce all the issues mentioned in the feedback
 */

import { Interface, Make, Mod } from "../src/index";

console.log("=== ReliantType ISSUES REPRODUCTION ===\n");

// ===== ISSUE 1: Make.unionOptional type inference and syntax highlighting =====
console.log("1. Testing Make.unionOptional issues:"); 

const schemaWithUnionOptional = Interface({
  theme: Make.unionOptional("light", "dark", "system"), // Should have proper type inference
});

const testUnionOptional = schemaWithUnionOptional.safeParse({
  theme: "light"
});

console.log("Union optional result:", testUnionOptional);
console.log("Type of theme should be 'light' | 'dark' | 'system' | undefined, but got:", typeof testUnionOptional.data?.theme);

// ===== ISSUE 2: Optional union with parentheses =====
console.log("\n2. Testing optional union with parentheses:");

const SchemaWithParentheses = Interface({
  // @fortify-ignore
  fieldName: "(web | test | ok)?",
});

const resParentheses = SchemaWithParentheses.safeParse({
  fieldName: "web",
});

console.log("Parentheses result:", resParentheses);
if (!resParentheses.success) {
  console.error("ERROR: Should accept 'web' but failed:", resParentheses.errors);
}

// ===== ISSUE 3: Union type inference with spaces =====
console.log("\n3. Testing union type inference with spaces:");

const SchemaWithSpaces = Interface({
  fieldName: "web | test | ok",
});

const resSpaces = SchemaWithSpaces.safeParse({
  fieldName: "ok"
});

console.log("Spaces result:", resSpaces);
console.log("Type inference issue - should be 'web' | 'test' | 'ok' but probably has spaces");

// ===== ISSUE 4: Record type doesn't work =====
console.log("\n4. Testing Record type:");

const SchemaWithRecord = Interface({
  fieldName: "Record<string, any>",
});

const resRecord = SchemaWithRecord.safeParse({
  fieldName: { key1: "value1", key2: 123 },
});

console.log("Record result:", resRecord);
if (!resRecord.success) {
  console.error("ERROR: Record type should work but failed:", resRecord.errors);
}

// ===== ISSUE 5: Unknown types allowed at runtime =====
console.log("\n5. Testing unknown types:");

const SchemaWithUnknownType = Interface({
  fieldName: "unknownType",
});

const resUnknown = SchemaWithUnknownType.safeParse({
  fieldName: "ok",
});

console.log("Unknown type result:", resUnknown);
if (resUnknown.success) {
  console.error("ERROR: Unknown type should fail but succeeded");
}

// ===== ISSUE 6: Omit method bugs =====
console.log("\n6. Testing Mod.omit bugs:");

const SchemaForOmit = Interface({
  fieldName: "object",
  test: "string(1, 50)"
});

const omittedSchema = Mod.omit(SchemaForOmit, ["test"]);
const resOmit = omittedSchema.safeParse({
  fieldName: { some: "object" },
  test: "should be ignored"
});

console.log("Omit result:", resOmit);
if (!resOmit.success) {
  console.error("ERROR: Omit should work but failed:", resOmit.errors);
}

// ===== ISSUE 7: Validation error messages and paths =====
console.log("\n7. Testing validation error messages and paths:");

const NestedSchema = Interface({
  user: {
    name: "string",
    email: "email",
    profile: {
      age: "number",
      bio: "string?"
    }
  }
});

const resNested = NestedSchema.safeParse({
  user: {
    name: 123, // Wrong type
    email: "invalid-email",
    profile: {
      age: "not-a-number", // Wrong type
      bio: "valid bio"
    }
  }
});

console.log("Nested validation result:", resNested);
if (!resNested.success) {
  console.log("Error paths and messages:");
  resNested.errors.forEach(error => {
    console.log(`  Path: [${error.path.join(', ')}], Message: ${error.message}`);
  });
}

// ===== ISSUE 8: Date type error =====
console.log("\n8. Testing date type:");

const SchemaWithDate = Interface({
  createdAt: "date"
});

const resDate1 = SchemaWithDate.safeParse({
  createdAt: new Date()
});

const resDate2 = SchemaWithDate.safeParse({
  createdAt: "2023-01-01"
});

console.log("Date with Date object:", resDate1);
console.log("Date with string:", resDate2);

// ===== ISSUE 9: Complex schema example from feedback =====
console.log("\n9. Testing complex schema from feedback:");

const complexSchema = Interface({
  user_info: {
    email: "string",
    phone: "string?",
    password: "string",
    first_name: "string",
    last_name: "string",
    preferred_language: "string?",
    location: {
      street: "string?",
      city: "string",
      state: "string",
      country: "string",
      postal_code: "string?",
      latitude: "number?",
      longitude: "number?",
    },
  },
  preferences: {
    theme: "light|dark|system", // Should be optional
    notifications_enabled: "boolean?",
    language: "string?",
    timezone: "string?",
    // @fortify-ignore
    privacy_settings: "object",
  }, // Should be optional
  registration_source: "web|mobile|api|unknown", // Should be optional
  voice_sample: "string?",
});

const complexResult = complexSchema.safeParse({
  user_info: {
    email: "test@example.com",
    password: "password123",
    first_name: "John",
    last_name: "Doe",
    location: {
      city: "New York",
      state: "NY",
      country: "USA",
    },
  },
  preferences: {
    theme: "dark",
    privacy_settings: { setting1: "value1" },
  },
  registration_source: "web",
});

console.log("Complex schema result:", complexResult);

console.log("\n=== END OF ISSUES REPRODUCTION ===");
