 console.log("🔍 Debug Precompiled Validators");
console.log("===============================\n");

// Patch the precompiled validators to add logging
const FieldPrecompilers = require("./src/core/schema/mode/interfaces/precompilation/FieldPrecompilers").FieldPrecompilers;

const originalPrecompilePositiveNumber = FieldPrecompilers.precompilePositiveNumber;
const originalPrecompileNegativeNumber = FieldPrecompilers.precompileNegativeNumber;
const originalPrecompileFloat = FieldPrecompilers.precompileFloat;

FieldPrecompilers.precompilePositiveNumber = function(constraints) {
  console.log("🔍 precompilePositiveNumber called with constraints:", JSON.stringify(constraints));
  
  const validator = originalPrecompilePositiveNumber.call(this, constraints);
  
  // Wrap the validator to add logging
  const originalValidator = validator;
  const wrappedValidator = function(value) {
    console.log("🔍 Positive validator executing with value:", value);
    const result = originalValidator(value);
    console.log("🔍 Positive validator result:", result.success ? "PASS" : "FAIL");
    if (!result.success) {
      console.log("🔍 Positive validator errors:", result.errors);
    }
    return result;
  };
  
  // Copy properties
  wrappedValidator._fieldType = originalValidator._fieldType;
  wrappedValidator._isCompiled = originalValidator._isCompiled;
  
  return wrappedValidator;
};

FieldPrecompilers.precompileNegativeNumber = function(constraints) {
  console.log("🔍 precompileNegativeNumber called with constraints:", JSON.stringify(constraints));
  
  const validator = originalPrecompileNegativeNumber.call(this, constraints);
  
  // Wrap the validator to add logging
  const originalValidator = validator;
  const wrappedValidator = function(value) {
    console.log("🔍 Negative validator executing with value:", value);
    const result = originalValidator(value);
    console.log("🔍 Negative validator result:", result.success ? "PASS" : "FAIL");
    if (!result.success) {
      console.log("🔍 Negative validator errors:", result.errors);
    }
    return result;
  };
  
  // Copy properties
  wrappedValidator._fieldType = originalValidator._fieldType;
  wrappedValidator._isCompiled = originalValidator._isCompiled;
  
  return wrappedValidator;
};

FieldPrecompilers.precompileFloat = function(constraints) {
  console.log("🔍 precompileFloat called with constraints:", JSON.stringify(constraints));
  
  const validator = originalPrecompileFloat.call(this, constraints);
  
  // Wrap the validator to add logging
  const originalValidator = validator;
  const wrappedValidator = function(value) {
    console.log("🔍 Float validator executing with value:", value);
    const result = originalValidator(value);
    console.log("🔍 Float validator result:", result.success ? "PASS" : "FAIL");
    if (!result.success) {
      console.log("🔍 Float validator errors:", result.errors);
    }
    return result;
  };
  
  // Copy properties
  wrappedValidator._fieldType = originalValidator._fieldType;
  wrappedValidator._isCompiled = originalValidator._isCompiled;
  
  return wrappedValidator;
};

// Now test the schemas
const { Interface } = require("./src/core/schema/mode/interfaces/Interface");

console.log("Creating positive schema...");
const PositiveSchema = Interface({
  value: "positive"
});

console.log("\nTesting positive with -5 (should fail)...");
const result1 = PositiveSchema.safeParse({ value: -5 });
console.log("Final result:", result1.success ? "PASS ❌" : "FAIL ✅");

console.log("\n" + "=".repeat(50));
console.log("Creating double schema...");
const DoubleSchema = Interface({
  // @fortify-ignore
  value: "double(0,100)"
});

console.log("\nTesting double with 150 (should fail)...");
const result2 = DoubleSchema.safeParse({ value: 150 });
console.log("Final result:", result2.success ? "PASS ❌" : "FAIL ✅");
