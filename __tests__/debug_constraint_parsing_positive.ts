console.log("🔍 Debug Constraint Parsing for Positive/Negative");
console.log("================================================\n");

// Patch the parseNumberConstraints method to see what's happening
const FieldPrecompilers = require("./src/core/schema/mode/interfaces/precompilation/FieldPrecompilers").FieldPrecompilers;

const originalParseNumberConstraints = FieldPrecompilers.parseNumberConstraints;
 
FieldPrecompilers.parseNumberConstraints = function(constraintsStr, type) {
  console.log("🔍 parseNumberConstraints called:");
  console.log("  - constraintsStr:", constraintsStr);
  console.log("  - type:", type);
  
  const result = originalParseNumberConstraints.call(this, constraintsStr, type);
  console.log("  - parsed constraints:", JSON.stringify(result));
  
  return result;
};

// Also patch precompileNumber to see what constraints it receives
const originalPrecompileNumber = FieldPrecompilers.precompileNumber;

FieldPrecompilers.precompileNumber = function(constraints) {
  console.log("🔍 precompileNumber called:");
  console.log("  - constraints:", JSON.stringify(constraints));
  
  const result = originalPrecompileNumber.call(this, constraints);
  console.log("  - validator created");
  
  return result;
};

// Now test the positive schema
const { Interface } = require("./src/core/schema/mode/interfaces/Interface");

console.log("Creating positive schema...");
const PositiveSchema = Interface({
  value: "positive"
});

console.log("\nTesting with value -5...");
const result = PositiveSchema.safeParse({ value: -5 });
console.log("Result:", result.success ? "PASS ❌" : "FAIL ✅");
if (!result.success) {
  console.log("Errors:", result.errors);
}

console.log("\n" + "=".repeat(50));
console.log("Creating negative schema...");
const NegativeSchema = Interface({
  value: "negative"
});

console.log("\nTesting with value 5...");
const result2 = NegativeSchema.safeParse({ value: 5 });
console.log("Result:", result2.success ? "PASS ❌" : "FAIL ✅");
if (!result2.success) {
  console.log("Errors:", result2.errors);
}
