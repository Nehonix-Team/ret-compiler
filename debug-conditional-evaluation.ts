import { ConditionalParser } from "./src/core/schema/mode/interfaces/conditional/parser/ConditionalParser";
import { ConditionalEvaluator } from "./src/core/schema/mode/interfaces/conditional/evaluator/ConditionalEvaluator";

console.log("🔍 DEBUGGING CONDITIONAL EVALUATION DETAILS\n");

const parser = new ConditionalParser();

// Test the exact conditional from our failing test
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
console.log("Test data keys:", Object.keys(testData));
console.log("apiKey exists:", "apiKey" in testData);
console.log("apiKey value:", testData.apiKey);
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
  
  console.log("Evaluation success:", evalResult.success);
  console.log("Evaluation value:", JSON.stringify(evalResult.value));
  console.log("Debug info:", JSON.stringify(evalResult.debugInfo, null, 2));
  
  // Check what we expect vs what we get
  console.log("\n🎯 ANALYSIS:");
  console.log("Expected: apiKey.$exists() should return TRUE");
  console.log("Expected: Condition true, so return 'boolean' schema type");
  console.log("Expected: For boolean conditional, computed value should be TRUE");
  console.log("Actual value:", evalResult.value);
  console.log("Actual finalCondition:", evalResult.debugInfo?.finalCondition);
  
  // Test the condition evaluation separately
  console.log("\n🔍 Testing condition separately:");
  if (parseResult.ast.condition) {
    try {
      // We can't evaluate the condition directly due to type issues
      // But we can see what the method call should return
      console.log("Condition type:", parseResult.ast.condition.type);
      if (parseResult.ast.condition.type === "METHOD_CALL") {
        const methodCall = parseResult.ast.condition;
        console.log("Method:", methodCall.method);
        console.log("Field path:", methodCall.field.path);
        console.log("Is runtime method:", methodCall.isRuntimeMethod);
        
        // Manually check what the method should return
        const fieldPath = methodCall.field.path;
        let current = testData;
        for (const segment of fieldPath) {
          current = current[segment];
        }
        console.log("Field value:", current);
        console.log("Field exists:", current !== undefined && current !== null);
      }
    } catch (error) {
      console.log("Error testing condition:", error);
    }
  }
  
} else {
  console.log("❌ Parsing FAILED");
  console.log("Errors:", parseResult.errors);
}
