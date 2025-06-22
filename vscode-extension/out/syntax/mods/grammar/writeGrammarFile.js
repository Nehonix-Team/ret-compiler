"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeGrammarFile = void 0;
const generateGrammar_1 = require("./generateGrammar");
/**
 * Write the generated grammar to file
 */
function writeGrammarFile(outputPath) {
    const grammar = (0, generateGrammar_1.generateFortifyGrammar)();
    const fs = require("fs");
    fs.writeFileSync(outputPath, JSON.stringify(grammar, null, 2));
}
exports.writeGrammarFile = writeGrammarFile;
//# sourceMappingURL=writeGrammarFile.js.map