import { ConditionalParser } from "./src/core/schema/mode/interfaces/conditional/parser/ConditionalParser";

console.log("=== DEBUGGING CONDITIONAL PARSER ===\n");

const parser = new ConditionalParser({
  allowNestedConditionals: true,
  maxNestingDepth: 5,
  strictMode: false,
  enableDebug: false,
});

// Test the failing conditional expressions
const testCases = [
  "when fields.exists *? boolean : =false",
  "when email.exists *? string : string?",
  "when tags.exists *? int : =0",
  "when profile.bio.exists *? int : =0",
  "when role=admin *? string : string?", // This should work (equality-based)
];

for (const testCase of testCases) {
  console.log(`\n🔍 Testing: "${testCase}"`);
  console.log("─".repeat(50));

  const result = parser.parse(testCase);

  console.log("AST exists:", !!result.ast);
  console.log("Errors count:", result.errors.length);
  console.log("Errors:", result.errors);

  if (result.ast && result.errors.length === 0) {
    console.log("✅ Parsing SUCCESS (would be used in schema)");
  } else if (result.ast && result.errors.length > 0) {
    console.log(
      "⚠️ Parsing SUCCESS but has errors (would fallback to ConstraintParser)"
    );
  } else {
    console.log("❌ Parsing FAILED (would fallback to ConstraintParser)");
  }
}
