console.log("Testing simple expression...");

// Let's manually trace what should happen
const expression = '=["USD"]';
console.log(`Expression: ${expression}`);

// Position 0: =
// Position 1: [
// Position 2: "
// Position 3: U
// Position 4: S
// Position 5: D
// Position 6: "
// Position 7: ]

console.log("Expected token sequence:");
console.log("0: EQUALS = '='");
console.log("1: LBRACKET = '['");
console.log("2: STRING = 'USD'");
console.log("3: RBRACKET = ']'");

console.log("\nThe parser should:");
console.log("1. See EQUALS token");
console.log("2. Advance past EQUALS");
console.log("3. Check for LBRACKET");
console.log("4. Call parseArray()");
console.log("5. Return createConstant with JSON.stringify result");
