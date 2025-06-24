import { ConditionalParser } from "./src/core/schema/mode/interfaces/conditional/parser/ConditionalParser";
import { ConditionalEvaluator } from "./src/core/schema/mode/interfaces/conditional/evaluator/ConditionalEvaluator";

console.log("🔍 DEBUGGING RUNTIME METHOD EVALUATION\n");

const parser = new ConditionalParser();

// Test the specific failing case
const testExpression = "when apiKey.$exists() *? boolean : =false";
const testData = {
  userId: "user456",
  apiKey: "secret123",           // This property EXISTS
  permissions: ["read", "write"], // This property EXISTS
  hasApiKey: false,
  hasPermissions: false,
  contextType: "guest"
};

console.log("Expression:", testExpression);
console.log("Test data:", JSON.stringify(testData, null, 2));
console.log("\n" + "=".repeat(50));

// Parse the expression
const parseResult = parser.parse(testExpression);

if (parseResult.ast) {
  console.log("✅ Parsing SUCCESS");
  console.log("AST:", JSON.stringify(parseResult.ast, null, 2));
  
  // Check if it's marked as runtime method
  const methodCall = parseResult.ast.condition;
  if (methodCall.type === "METHOD_CALL") {
    console.log(`\n🔍 Method Call Analysis:`);
    console.log(`- Method: ${methodCall.method}`);
    console.log(`- Field path: ${methodCall.field.path.join(".")}`);
    console.log(`- Is runtime method: ${methodCall.isRuntimeMethod}`);
  }
  
  // Evaluate the expression
  console.log("\n🔧 Evaluating...");
  try {
    const evalResult = ConditionalEvaluator.evaluate(parseResult.ast, testData, {
      strict: false,
      debug: true,
    });
    
    console.log("Evaluation result:", JSON.stringify(evalResult, null, 2));
    
    // Analyze the debug path
    if (evalResult.debugInfo?.evaluationPath) {
      console.log("\n📋 Debug Path:");
      evalResult.debugInfo.evaluationPath.forEach((step, i) => {
        console.log(`${i + 1}. ${step}`);
      });
    }
    
    // Check what the method actually returned
    console.log(`\n🎯 Expected: apiKey.$exists() should return TRUE (apiKey exists in data)`);
    console.log(`🎯 Actual: ${evalResult.debugInfo?.finalCondition}`);
    console.log(`🎯 Result: ${evalResult.debugInfo?.finalCondition === true ? '✅ CORRECT' : '❌ BUG'}`);
    
  } catch (error) {
    console.log("❌ Evaluation failed:", error);
  }
} else {
  console.log("❌ Parsing FAILED");
  console.log("Errors:", parseResult.errors);
}
