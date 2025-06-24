import { ConditionalLexer } from "./src/core/schema/mode/interfaces/conditional/parser/ConditionalLexer";

console.log("=== DEBUGGING PARSER FLOW ===\n");

// Let's see what tokens are generated for our problematic expression
const testExpression = 'when internationalization.$exists() *? array : =["USD"]';

console.log(`Expression: ${testExpression}`);
console.log("─".repeat(60));

const lexer = new ConditionalLexer(testExpression);
const { tokens, errors } = lexer.tokenize();

console.log("TOKENS:");
tokens.forEach((token, index) => {
  console.log(`${index.toString().padStart(2)}: ${token.type.padEnd(20)} | "${token.value}" | pos: ${token.position}`);
});

if (errors.length > 0) {
  console.log("\nLEXER ERRORS:");
  errors.forEach(error => console.log(error));
}

// Let's specifically look at the tokens around position 48
console.log("\n=== TOKENS AROUND POSITION 48 ===");
const relevantTokens = tokens.filter(token => token.position >= 45 && token.position <= 55);
relevantTokens.forEach(token => {
  console.log(`${token.type.padEnd(20)} | "${token.value}" | pos: ${token.position}`);
});
