/**
 * Debug lexer tokenization
 */

import { ConditionalLexer } from "../core/schema/mode/interfaces/conditional/parser/ConditionalLexer";

// Test what tokens are generated for object constants
const testExpressions = [
  '={"theme":"dark"}',
  'when config.test.$exists() *? any : ={"theme":"dark"}',
  '={"name":"test","value":null}',
];

console.log("🔍 Debugging lexer tokenization...\n");

for (const expr of testExpressions) {
  console.log(`Expression: ${expr}`);

  const lexer = new ConditionalLexer(expr);
  const result = lexer.tokenize();

  if (result.errors.length === 0) {
    console.log("Tokens:");
    result.tokens.forEach((token, i) => {
      console.log(`  ${i}: ${token.type} = "${token.value}"`);
    });
  } else {
    console.log("Lexer errors:", result.errors);
  }

  console.log("");
}
