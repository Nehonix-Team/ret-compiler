import { Interface } from "../src/core/schema/mode/interfaces/Interface";

console.log("🔍 Simple Debug Positive");
console.log("========================\n");

const PositiveSchema = Interface({
  value: "positive"
});

console.log("Testing positive with -5:");
const result = PositiveSchema.safeParse({ value: -5 });
console.log("Result:", result.success ? "PASS ❌" : "FAIL ✅");
if (!result.success) {
  console.log("Errors:", result.errors);
} else {
  console.log("🚨 This should have failed!");
}
