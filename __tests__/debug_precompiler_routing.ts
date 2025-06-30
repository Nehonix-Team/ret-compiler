console.log("🔍 Debug Precompiler Routing");
console.log("============================\n");

// Patch the parseAndCompile method to see which case is being hit
const FieldPrecompilers = require("./src/core/schema/mode/interfaces/precompilation/FieldPrecompilers").FieldPrecompilers;

const originalParseAndCompile = FieldPrecompilers.parseAndCompile;

FieldPrecompilers.parseAndCompile = function(fieldType) {
  console.log("🔍 parseAndCompile called with fieldType:", fieldType);
  
  // Handle optional fields
  const isOptional = fieldType.endsWith("?");
  const baseType = isOptional ? fieldType.slice(0, -1) : fieldType;
  console.log("🔍 baseType:", baseType, "isOptional:", isOptional);

  // Handle basic types with constraints
  const constraintMatch = baseType.match(/^([\w.]+)(?:\(([^)]*)\))?$/);
  if (constraintMatch) {
    const [, type, constraintsStr] = constraintMatch;
    console.log("🔍 Matched type:", type, "constraintsStr:", constraintsStr);
    
    if (type === "positive") {
      console.log("🔍 Routing to POSITIVE case");
    } else if (type === "negative") {
      console.log("🔍 Routing to NEGATIVE case");
    } else {
      console.log("🔍 Routing to other case:", type);
    }
  }
  
  const result = originalParseAndCompile.call(this, fieldType);
  console.log("🔍 parseAndCompile result created");
  
  return result;
};

// Also patch the specific methods to see if they're called
const originalPrecompilePositiveNumber = FieldPrecompilers.precompilePositiveNumber;
const originalPrecompileNegativeNumber = FieldPrecompilers.precompileNegativeNumber;

FieldPrecompilers.precompilePositiveNumber = function(constraints) {
  console.log("🔍 ✅ precompilePositiveNumber CALLED with constraints:", JSON.stringify(constraints));
  return originalPrecompilePositiveNumber.call(this, constraints);
};

FieldPrecompilers.precompileNegativeNumber = function(constraints) {
  console.log("🔍 ✅ precompileNegativeNumber CALLED with constraints:", JSON.stringify(constraints));
  return originalPrecompileNegativeNumber.call(this, constraints);
};

// Now test
const { Interface } = require("./src/core/schema/mode/interfaces/Interface");

console.log("Creating positive schema...");
const PositiveSchema = Interface({
  value: "positive"
});

console.log("\nTesting with -5...");
const result = PositiveSchema.safeParse({ value: -5 });
console.log("Result:", result.success ? "PASS ❌" : "FAIL ✅");
