console.log("🔍 Debug Field Compilation");
console.log("==========================\n");

// Patch the FieldPrecompilers to add logging
const FieldPrecompilers = require("./src/core/schema/mode/interfaces/precompilation/FieldPrecompilers").FieldPrecompilers;

const originalParseAndCompile = FieldPrecompilers.parseAndCompile;

FieldPrecompilers.parseAndCompile = function(fieldType) {
  console.log("🔍 parseAndCompile called with fieldType:", fieldType);
  
  const result = originalParseAndCompile.call(this, fieldType);
  
  console.log("🔍 parseAndCompile result:");
  console.log("  - _fieldType:", result._fieldType);
  console.log("  - _isCompiled:", result._isCompiled);
  
  // Wrap the result to add logging
  const originalValidator = result;
  const wrappedValidator = function(value) {
    console.log(`🔍 Field validator (${result._fieldType}) executing with value:`, value);
    const validationResult = originalValidator(value);
    console.log(`🔍 Field validator (${result._fieldType}) result:`, validationResult.success ? "PASS" : "FAIL");
    if (!validationResult.success) {
      console.log(`🔍 Field validator (${result._fieldType}) errors:`, validationResult.errors);
    }
    return validationResult;
  };
  
  // Copy properties
  wrappedValidator._fieldType = originalValidator._fieldType;
  wrappedValidator._isCompiled = originalValidator._isCompiled;
  
  return wrappedValidator;
};

// Now test
const { Interface } = require("./src/core/schema/mode/interfaces/Interface");

console.log("Creating positive schema...");
const PositiveSchema = Interface({
  value: "positive"
});

console.log("\nTesting with -5...");
const result = PositiveSchema.safeParse({ value: -5 });
console.log("Final result:", result.success ? "PASS ❌" : "FAIL ✅");
