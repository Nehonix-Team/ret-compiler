import { Grammar } from "../../Grammar";
import * as path from "path";
import * as fs from "fs";

export function runGrammar() {
  // Generate grammar if run directly
  const grammar = new Grammar();

  // Get the correct path to the syntaxes directory (from out/syntax/mods/grammar/ to syntaxes/)
  const outputPath = path.join(
    __dirname,
    "../../../../syntaxes/fortify-embedded.tmGrammar.json"
  );

  // Ensure the syntaxes directory exists
  const syntaxesDir = path.dirname(outputPath);
  if (!fs.existsSync(syntaxesDir)) {
    fs.mkdirSync(syntaxesDir, { recursive: true });
  }

  grammar.write(outputPath);
  console.log("✅ Generated ReliantType grammar file");
}
