console.log("🔍 Test Precompiler Methods Directly");
console.log("====================================\n");

try {
  const FieldPrecompilers = require("./src/core/schema/mode/interfaces/precompilation/FieldPrecompilers").FieldPrecompilers;
  
  console.log("FieldPrecompilers loaded successfully");
  console.log("Available methods:", Object.getOwnPropertyNames(FieldPrecompilers).filter(name => name.startsWith('precompile')));
  
  // Test if the new methods exist
  console.log("\nChecking new methods:");
  console.log("- precompilePositiveNumber exists:", typeof FieldPrecompilers.precompilePositiveNumber === 'function');
  console.log("- precompileNegativeNumber exists:", typeof FieldPrecompilers.precompileNegativeNumber === 'function');
  
  if (typeof FieldPrecompilers.precompilePositiveNumber === 'function') {
    console.log("\nTesting precompilePositiveNumber directly:");
    const validator = FieldPrecompilers.precompilePositiveNumber({});
    console.log("Validator created:", !!validator);
    
    if (validator) {
      console.log("Testing validator with -5:");
      const result = validator(-5);
      console.log("Result:", result.success ? "PASS ❌" : "FAIL ✅");
      if (!result.success) {
        console.log("Errors:", result.errors);
      }
    }
  }
  
} catch (error) {
  console.log("❌ Error loading FieldPrecompilers:", error.message);
  console.log("Stack:", error.stack);
}
