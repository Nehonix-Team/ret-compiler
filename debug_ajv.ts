import Ajv from "ajv";

console.log("🔍 Debug AJV Schema");
console.log("==================\n");

const ajv = new Ajv({ strict: false, allErrors: true }); // Disable strict mode

// Test schema - use properties instead of required
const schema = {
  type: "object",
  not: {
    anyOf: [
      { properties: { __proto__: {} } },
      { properties: { constructor: {} } },
      { properties: { prototype: {} } },
    ],
  },
  additionalProperties: true,
};

const validate = ajv.compile(schema);

// Test cases
const testCases = [
  { name: "Safe object", data: { name: "John", age: 30 }, shouldPass: true },
  {
    name: "__proto__ attack",
    data: { __proto__: { admin: true } },
    shouldPass: false,
  },
  {
    name: "constructor attack",
    data: { constructor: { prototype: { admin: true } } },
    shouldPass: false,
  },
  {
    name: "prototype attack",
    data: { prototype: { admin: true } },
    shouldPass: false,
  },
];

for (const test of testCases) {
  const isValid = validate(test.data);
  const result = isValid === test.shouldPass ? "✅ CORRECT" : "❌ WRONG";

  console.log(`${result} ${test.name}: ${isValid ? "PASSED" : "FAILED"}`);

  if (!isValid && validate.errors) {
    console.log(`  Errors: ${JSON.stringify(validate.errors, null, 2)}`);
  }
}

// Test with JSON parsing
console.log("\n🔍 Testing with JSON.parse:");
const jsonTests = [
  '{"name": "John"}',
  '{"__proto__": {"admin": true}}',
  '{"constructor": {"prototype": {"admin": true}}}',
  '{"prototype": {"admin": true}}',
];

for (const jsonStr of jsonTests) {
  try {
    const parsed = JSON.parse(jsonStr);
    const isValid = validate(parsed);
    console.log(`${jsonStr}: ${isValid ? "VALID" : "INVALID"}`);
    if (!isValid && validate.errors) {
      console.log(`  Error: ${validate.errors[0]?.message}`);
    }
  } catch (e) {
    console.log(`${jsonStr}: PARSE ERROR`);
  }
}
