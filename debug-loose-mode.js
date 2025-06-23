// Debug loose mode issue
const { Interface } = require('./dist/cjs/index.js');

console.log('=== DEBUGGING LOOSE MODE ===');

// Create a simple schema
const TestSchema = Interface({
  id: "number",
  name: "string"
});

console.log('1. Testing strict mode (default):');
const strictResult = TestSchema.safeParse({
  id: "123", // String instead of number
  name: "John"
});
console.log('Strict result:', strictResult);

console.log('\n2. Testing loose mode:');
const looseSchema = TestSchema.loose();
console.log('Loose schema options:', looseSchema.options);

const looseResult = looseSchema.safeParse({
  id: "123", // String that should be converted to number
  name: "John"
});
console.log('Loose result:', looseResult);

console.log('\n3. Testing individual field validation:');
// Let's test the TypeValidators directly
const { TypeValidators } = require('./dist/cjs/core/schema/mode/interfaces/validators/TypeValidators.js');

const numberResult = TypeValidators.validateNumber("123", { loose: true }, {});
console.log('Direct number validation with loose=true:', numberResult);

const numberResultStrict = TypeValidators.validateNumber("123", { loose: false }, {});
console.log('Direct number validation with loose=false:', numberResultStrict);
