/**
 * Debug the empty path issue
 */

import { Interface } from "../src/index";

console.log("🔍 DEBUGGING EMPTY PATH ISSUE");
console.log("=" .repeat(40));

// Test simple case that should show path
const TestSchema = Interface({
  id: "number",
  name: "string"
});

console.log("\n1. Testing with default options:");
const result1 = TestSchema.safeParse({
  id: "test", // Wrong type
  name: "John"
});

console.log("Result 1:", JSON.stringify(result1, null, 2));

console.log("\n2. Testing with skipOptimization:");
const TestSchema2 = Interface({
  id: "number", 
  name: "string"
}, { skipOptimization: true });

const result2 = TestSchema2.safeParse({
  id: "test", // Wrong type
  name: "John"
});

console.log("Result 2:", JSON.stringify(result2, null, 2));

console.log("\n3. Testing nested case:");
const NestedSchema = Interface({
  user: {
    id: "number"
  }
}, { skipOptimization: true });

const result3 = NestedSchema.safeParse({
  user: {
    id: "test" // Wrong type
  }
});

console.log("Result 3:", JSON.stringify(result3, null, 2));
