import { ConditionalLexer } from "./src/core/schema/mode/interfaces/conditional/parser/ConditionalLexer";

console.log("🔍 DEBUGGING NEGATIVE NUMBER PARSING\n");

const testCases = [
  "=-1",
  "=1", 
  "=-42",
  "=42",
  "=-1.5",
  "=1.5"
];

testCases.forEach(testCase => {
  console.log(`Testing: "${testCase}"`);
  
  const lexer = new ConditionalLexer(testCase);
  const result = lexer.tokenize();
  
  console.log(`  Tokens: ${JSON.stringify(result.tokens, null, 2)}`);
  console.log(`  Errors: ${JSON.stringify(result.errors, null, 2)}`);
  console.log("");
});
