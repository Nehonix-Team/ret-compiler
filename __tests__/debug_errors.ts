/**
 * Debug Error Structure
 * 
 * Let's see what the current error structure actually looks like
 */

import { Interface } from "../src/core/schema/mode/interfaces/Interface";

console.log("🔍 Debugging Error Structure\n");

const UserSchema = Interface({
  id: "number",
  name: "string(2,50)"
});

const invalidData = {
  id: "not-a-number",
  name: "x"
};

const result = UserSchema.safeParse(invalidData);

console.log("Result success:", result.success);
console.log("Result errors:", result.errors);
console.log("Errors length:", result.errors?.length);

if (result.errors && result.errors.length > 0) {
  console.log("\nFirst error:");
  console.log("Type:", typeof result.errors[0]);
  console.log("Value:", result.errors[0]);
  console.log("Keys:", Object.keys(result.errors[0] || {}));
  
  if (typeof result.errors[0] === 'object') {
    console.log("Properties:");
    for (const [key, value] of Object.entries(result.errors[0] || {})) {
      console.log(`  ${key}:`, value);
    }
  }
}
