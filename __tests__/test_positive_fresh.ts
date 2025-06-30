import { Interface } from "../src/core/schema/mode/interfaces/Interface";

console.log("🔍 Fresh Test of Positive Type");
console.log("==============================\n");

// Create a completely fresh schema
const TestSchema = Interface({
  value: "positive",
});

console.log("Testing positive with value -5 (should fail):");
const result = TestSchema.safeParse({ value: -5 });
console.log("Result:", result.success ? "PASS ❌ (BUG)" : "FAIL ✅ (FIXED)");

if (!result.success) {
  console.log("Errors:", result.errors);
} else {
  console.log("🚨 Positive validation is still broken!");
}
