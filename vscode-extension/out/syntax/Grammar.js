"use strict";
/**
 * Grammar Generator for Fortify Schema
 *
 * Generates TextMate grammar from centralized syntax definitions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Grammar = void 0;
const G = require("./mods/grammar");
const runGrammar_1 = require("./mods/grammar/runGrammar");
class Grammar {
    /**
     * Generate complete TextMate grammar for Fortify Schema
     */
    generate() {
        return G.generateFortifyGrammar();
    }
    /**
     * Write the generated grammar to file
     */
    write(outputPath) {
        G.writeGrammarFile(outputPath);
    }
}
exports.Grammar = Grammar;
if (require.main === module) {
    (0, runGrammar_1.runGrammar)();
}
//# sourceMappingURL=Grammar.js.map