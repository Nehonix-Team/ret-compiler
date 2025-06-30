console.log("🔍 Debug Precompiled Schema");
console.log("===========================\n");

// Patch the SchemaPrecompiler to add logging
const SchemaPrecompiler = require("./src/core/schema/mode/interfaces/precompilation/SchemaPrecompiler").SchemaPrecompiler;

const originalPrecompileSchema = SchemaPrecompiler.precompileSchema;

SchemaPrecompiler.precompileSchema = function(schemaDefinition, options) {
  console.log("🔍 precompileSchema called with definition:", JSON.stringify(schemaDefinition));
  
  const result = originalPrecompileSchema.call(this, schemaDefinition, options);
  
  console.log("🔍 precompileSchema result created");
  console.log("🔍 result._isPrecompiled:", result._isPrecompiled);
  console.log("🔍 result._optimizationLevel:", result._optimizationLevel);
  
  // Wrap the result to add logging
  const originalValidator = result;
  const wrappedValidator = function(data) {
    console.log("🔍 Precompiled validator executing with data:", JSON.stringify(data));
    const validationResult = originalValidator(data);
    console.log("🔍 Precompiled validator result:", validationResult.success ? "PASS" : "FAIL");
    if (!validationResult.success) {
      console.log("🔍 Precompiled validator errors:", validationResult.errors);
    }
    return validationResult;
  };
  
  // Copy properties
  wrappedValidator._isPrecompiled = originalValidator._isPrecompiled;
  wrappedValidator._schemaHash = originalValidator._schemaHash;
  wrappedValidator._optimizationLevel = originalValidator._optimizationLevel;
  
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
