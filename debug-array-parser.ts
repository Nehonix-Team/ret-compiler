import { ConditionalParser } from "./src/core/schema/mode/interfaces/conditional/parser/ConditionalParser";

console.log("=== DEBUGGING ARRAY LITERAL PARSING ===\n");

const parser = new ConditionalParser({
  allowNestedConditionals: true,
  maxNestingDepth: 5,
  strictMode: false,
  enableDebug: true,
});

// Test the specific failing expression
const testExpression = 'when internationalization.$exists() *? array : =["USD"]';

console.log(`Testing expression: ${testExpression}`);
console.log("─".repeat(60));

const result = parser.parse(testExpression);

if (result.ast) {
  console.log("✅ PARSING SUCCESS!");
  console.log("AST:", JSON.stringify(result.ast, null, 2));
} else {
  console.log("❌ PARSING FAILED!");
  console.log("Errors:", result.errors);
}

// Test simpler array expressions
console.log("\n=== TESTING SIMPLER ARRAY EXPRESSIONS ===");

const simpleTests = [
  '=["USD"]',
  '["USD"]',
  'when test *? array : =["USD"]',
  'when test *? string : ="USD"',
];

simpleTests.forEach((test, index) => {
  console.log(`\nTest ${index + 1}: ${test}`);
  const result = parser.parse(test);
  if (result.ast) {
    console.log("✅ SUCCESS");
  } else {
    console.log("❌ FAILED:", result.errors[0]?.message || "Unknown error");
  }
});
