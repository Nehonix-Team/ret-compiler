import { ConditionalParser } from "./src/core/schema/mode/interfaces/conditional/parser/ConditionalParser";
import { ConditionalEvaluator } from "./src/core/schema/mode/interfaces/conditional/evaluator/ConditionalEvaluator";

console.log("=== DEBUGGING RUNTIME METHODS ===\n");

const parser = new ConditionalParser({
  allowNestedConditionals: true,
  maxNestingDepth: 5,
  strictMode: false,
  enableDebug: false,
});

// Test the new runtime method syntax
const testCases = [
  "when fields.$exists() *? boolean : =false",
  "when email.$exists() *? string : string?",
  "when tags.$exists() *? int : =0",
];

const testData = {
  fields: ["field1", "field2"],
  email: "test@example.com", 
  tags: ["tag1", "tag2"],
};

for (const testCase of testCases) {
  console.log(`\n🔍 Testing: "${testCase}"`);
  console.log("─".repeat(50));
  
  const result = parser.parse(testCase);
  
  if (result.ast) {
    console.log("✅ Parsing SUCCESS");
    console.log("AST:", JSON.stringify(result.ast, null, 2));
    
    // Test evaluation
    console.log("\n🔧 Evaluating against test data...");
    try {
      const evalResult = ConditionalEvaluator.evaluate(result.ast, testData, {
        strict: false,
        debug: true,
      });
      console.log("Evaluation result:", evalResult);
    } catch (error) {
      console.log("❌ Evaluation failed:", error);
    }
  } else {
    console.log("❌ Parsing FAILED");
    console.log("Errors:", result.errors);
  }
}
