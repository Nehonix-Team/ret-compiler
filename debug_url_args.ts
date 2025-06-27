import { UrlArgs } from "./src/core/utils/UrlArgs";

console.log("🔍 Debug URL Args Validation");
console.log("============================\n");

// Test the UrlArgs validation directly
const testArgs = [
  "url.https",
  "url.http", 
  "url.web",
  "url.dev",
  "url.ftp",
  "url.invalid",
  "url.xyz",
  "url.test",
  "url.",
  "noturl.https"
];

console.log("Testing UrlArgs.isCorrectArg():");
testArgs.forEach(arg => {
  const result = UrlArgs.isCorrectArg(arg);
  console.log(`${arg}: ${result.isValid ? "✅ VALID" : "❌ INVALID"}`);
  if (!result.isValid) {
    console.log(`  Error: ${result.error}`);
  }
});

console.log("\nTesting UrlArgs.selectArg():");
testArgs.forEach(arg => {
  try {
    const result = UrlArgs.selectArg(arg as any);
    console.log(`${arg}: ✅ Returns config (protocols: ${result.match.protocols.join(", ")})`);
  } catch (error) {
    console.log(`${arg}: ❌ Throws error: ${error.message}`);
  }
});

// Test the validation flow
console.log("\nTesting validation flow:");
import { UrlValidation } from "./src/core/schema/mode/interfaces/validators/mods/urlValidation";

const invalidArgs = ["url.invalid", "url.xyz"];
invalidArgs.forEach(arg => {
  console.log(`\nTesting ${arg} with UrlValidation:`);
  try {
    const result = UrlValidation("https://example.com", arg as any);
    console.log(`  Result: ${result.success ? "✅ PASSED" : "❌ FAILED"}`);
    if (!result.success) {
      console.log(`  Error: ${result.errors[0]}`);
    }
  } catch (error) {
    console.log(`  💥 Exception: ${error.message}`);
  }
});
