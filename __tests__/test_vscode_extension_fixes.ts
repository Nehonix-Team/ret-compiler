import { Interface } from "../src/core/schema/mode/interfaces/Interface";

// This should NOT have Fortify syntax highlighting (outside Interface block)
const regularString =
  "when field1=value1 && field2=value2 *? thenType : elseType";
const anotherString = "positive negative double string(5,10)";

console.log("Testing VSCode extension fixes...");

// This SHOULD have Fortify syntax highlighting (inside Interface block)
const TestSchema = Interface({
  // Simple types (should be highlighted)
  id: "positive",
  name: "string(2,50)",
  email: "email",

  // Conditional syntax (should be properly parsed)
  condition: "when field1=value1 && field2=value2 *? string : boolean",

  // Complex conditional with nested conditionals
  access:
    "when type.in(admin,supervisor) *? when level>=50 *? =full : =limited : when type=moderator *? when level>=25 *? =moderate : =basic : =minimal",
 
  // Method calls in conditions
  status: "when user.$exists() *? string : string?",

  // Nested property access
  permission: "when user.role.$contains(admin) *? =full : =read",
});

// This should NOT have Fortify syntax highlighting (outside Interface block)
const testString = "when condition *? then : else";

console.log("Schema created successfully!");

// Test the actual validation
const result = TestSchema.safeParse({
  id: 5,
  name: "John",
  email: "john@example.com",
  condition: "test",
  access: "test",
  status: "active",
  permission: "read",
});

console.log("Validation result:", result.success ? "PASS" : "FAIL");
if (!result.success) {
  console.log("Errors:", result.errors);
}
