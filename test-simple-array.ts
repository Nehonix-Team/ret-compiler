import { ConditionalParser } from "./src/core/schema/mode/interfaces/conditional/parser/ConditionalParser";

console.log("=== TESTING SIMPLE ARRAY PARSING ===\n");

const parser = new ConditionalParser({
  enableDebug: true,
});

// Test a very simple conditional with array
const testExpression = 'when test=value *? string : =["USD"]';

console.log(`Testing: ${testExpression}`);
console.log("─".repeat(50));

try {
  const result = parser.parse(testExpression);
  
  if (result.ast) {
    console.log("✅ SUCCESS!");
    console.log("AST:", JSON.stringify(result.ast, null, 2));
  } else {
    console.log("❌ FAILED!");
    console.log("Errors:", result.errors);
  }
} catch (error) {
  console.log("💥 EXCEPTION:", error.message);
}
