"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runGrammar = void 0;
const Grammar_1 = require("../../Grammar");
const path = require("path");
const fs = require("fs");
function runGrammar() {
    // Generate grammar if run directly
    const grammar = new Grammar_1.Grammar();
    // Get the correct path to the syntaxes directory (from out/syntax/mods/grammar/ to syntaxes/)
    const outputPath = path.join(__dirname, "../../../../syntaxes/fortify-embedded.tmGrammar.json");
    // Ensure the syntaxes directory exists
    const syntaxesDir = path.dirname(outputPath);
    if (!fs.existsSync(syntaxesDir)) {
        fs.mkdirSync(syntaxesDir, { recursive: true });
    }
    grammar.write(outputPath);
    console.log("✅ Generated ReliantType grammar file");
}
exports.runGrammar = runGrammar;
//# sourceMappingURL=runGrammar.js.map