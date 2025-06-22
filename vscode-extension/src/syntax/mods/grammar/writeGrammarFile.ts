import { generateFortifyGrammar } from "./generateGrammar";

/**
 * Write the generated grammar to file
 */
export function writeGrammarFile(outputPath: string): void {
  const grammar = generateFortifyGrammar();
  const fs = require("fs");
  fs.writeFileSync(outputPath, JSON.stringify(grammar, null, 2));
}

