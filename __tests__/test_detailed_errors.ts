/**
 * Test detailed error messages to understand field path behavior
 */

import { Interface } from "../src/index";

console.log("🔍 DETAILED ERROR MESSAGE ANALYSIS");
console.log("=".repeat(50));

// Test simple field error
console.log("\n1. Simple field error:");
const SimpleSchema = Interface(
  {
    name: "string",
    age: "number",
  },
  { skipOptimization: true }
);

const simpleResult = SimpleSchema.safeParse({
  name: "John",
  age: "not a number",
});

if (!simpleResult.success) {
  simpleResult.errors.forEach((error, i) => {
    console.log(`Error ${i + 1}:`);
    console.log(`  Path: [${error.path.join(" → ")}]`);
    console.log(`  Message: ${error.message}`);
    console.log(`  Received: ${JSON.stringify(error.received)}`);
    console.log("");
  });
}

// Test nested field error
console.log("\n2. Nested field error:");
const NestedSchema = Interface(
  {
    user: {
      profile: {
        age: "number",
      },
    },
  },
  { skipOptimization: true }
);

const nestedResult = NestedSchema.safeParse({
  user: {
    profile: {
      age: "not a number",
    },
  },
});

if (!nestedResult.success) {
  nestedResult.errors.forEach((error, i) => {
    console.log(`Error ${i + 1}:`);
    console.log(`  Path: [${error.path.join(" → ")}]`);
    console.log(`  Message: ${error.message}`);
    console.log(`  Received: ${JSON.stringify(error.received)}`);
    console.log("");
  });
}

// Test multiple errors at different levels
console.log("\n3. Multiple errors at different levels:");
const ComplexSchema = Interface(
  {
    id: "number",
    user: {
      name: "string",
      profile: {
        age: "number",
        email: "email",
      },
    },
  },
  { skipOptimization: true }
);

const complexResult = ComplexSchema.safeParse({
  id: "wrong",
  user: {
    name: 123,
    profile: {
      age: "wrong",
      email: "invalid-email",
    },
  },
});

if (!complexResult.success) {
  console.log(`Found ${complexResult.errors.length} errors:`);
  complexResult.errors.forEach((error, i) => {
    console.log(`\nError ${i + 1}:`);
    console.log(`  Path: [${error.path.join(" → ")}]`);
    console.log(`  Message: ${error.message}`);
    console.log(`  Expected: ${error.expected}`);
    console.log(`  Received: ${JSON.stringify(error.received)}`);
    console.log(`  Received Type: ${error.receivedType}`);
  });
}

console.log("\n" + "=".repeat(50));
