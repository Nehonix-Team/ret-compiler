import { ConditionalParser } from "./src/core/schema/mode/interfaces/conditional/parser/ConditionalParser";
import { ConditionalEvaluator } from "./src/core/schema/mode/interfaces/conditional/evaluator/ConditionalEvaluator";

console.log("=== DEBUGGING RUNTIME CONDITION ===\n");

const parser = new ConditionalParser({
  allowNestedConditionals: true,
  maxNestingDepth: 5,
  strictMode: false,
  enableDebug: false,
});

// Test the specific conditional that's failing
const testExpression = 'when config.strict.$exists() *? boolean : =false';

const testData = {
  id: "coercion-test",
  config: { strict: true }, // This should make config.strict.$exists() return TRUE
  strictBoolean: "true",
};

console.log("Expression:", testExpression);
console.log("Test data:", JSON.stringify(testData, null, 2));
console.log("config.strict exists:", "strict" in testData.config);
console.log("config.strict value:", testData.config.strict);
console.log("\n" + "=".repeat(50));

// Parse the expression
const parseResult = parser.parse(testExpression);

if (parseResult.ast) {
  console.log("✅ Parsing SUCCESS");
  
  // Evaluate with debug enabled
  console.log("\n🔧 Evaluating with debug...");
  const evalResult = ConditionalEvaluator.evaluate(parseResult.ast, testData, {
    strict: false,
    debug: true,
  });
  
  console.log("Evaluation result:", JSON.stringify(evalResult, null, 2));
  
  // Check what the method actually returned
  console.log(`\n🎯 Expected: config.strict.$exists() should return TRUE (config.strict exists)`);
  console.log(`🎯 Actual: ${evalResult.value}`);
  console.log(`🎯 Result: ${evalResult.value === 'boolean' ? '✅ CORRECT' : '❌ BUG'}`);
  
} else {
  console.log("❌ Parsing FAILED");
  console.log("Errors:", parseResult.errors);
}
