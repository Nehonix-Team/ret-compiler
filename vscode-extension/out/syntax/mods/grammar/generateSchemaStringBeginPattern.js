"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSchemaTemplateBeginPattern = exports.generateSchemaSingleQuoteBeginPattern = exports.generateSchemaStringBeginPattern = void 0;
const FortifySyntaxDefinitions_1 = require("../../FortifySyntaxDefinitions");
/**
 * Generate the begin pattern for schema strings
 */
function generateSchemaStringBeginPattern() {
    // Create a lookahead pattern that matches strings containing any Fortify syntax
    const typeNames = FortifySyntaxDefinitions_1.FortifySyntaxUtils.getAllTypeNames().join("|");
    const operators = ["when", "\\*\\?", "\\|", "=\\w+"];
    const methods = FortifySyntaxDefinitions_1.FortifySyntaxUtils.getAllMethodNames()
        .map((name) => `\\.\\$${name}`)
        .join("|");
    const patterns = [
        typeNames,
        ...operators,
        methods,
        "\\[\\]",
        "\\(\\d+,?\\d*\\)",
        "\\(\\/.*?\\/[gimsuy]*\\)", // Regex patterns like (/^v\\d+\\.\\d+$/)
    ];
    return `"(?=.*(?:${patterns.join("|")}).*")`;
}
exports.generateSchemaStringBeginPattern = generateSchemaStringBeginPattern;
/**
 * Generate the begin pattern for single quote schema strings
 * ENHANCED: Support single quotes for Fortify schema strings
 */
function generateSchemaSingleQuoteBeginPattern() {
    // Create a lookahead pattern that matches single-quoted strings containing any Fortify syntax
    const typeNames = FortifySyntaxDefinitions_1.FortifySyntaxUtils.getAllTypeNames().join("|");
    const operators = ["when", "\\*\\?", "\\|", "=\\w+"];
    const methods = FortifySyntaxDefinitions_1.FortifySyntaxUtils.getAllMethodNames()
        .map((name) => `\\.\\$${name}`)
        .join("|");
    const patterns = [
        typeNames,
        ...operators,
        methods,
        "\\[\\]",
        "\\(\\d+,?\\d*\\)",
        "\\(\\/.*?\\/[gimsuy]*\\)", // Regex patterns like (/^v\\d+\\.\\d+$/)
    ];
    return `'(?=.*(?:${patterns.join("|")}).*')`;
}
exports.generateSchemaSingleQuoteBeginPattern = generateSchemaSingleQuoteBeginPattern;
/**
 * Generate the begin pattern for template literal schema strings
 */
function generateSchemaTemplateBeginPattern() {
    // Create a lookahead pattern that matches template literals containing any Fortify syntax
    const typeNames = FortifySyntaxDefinitions_1.FortifySyntaxUtils.getAllTypeNames().join("|");
    const operators = ["when", "\\*\\?", "\\|", "=\\w+"];
    const methods = FortifySyntaxDefinitions_1.FortifySyntaxUtils.getAllMethodNames()
        .map((name) => `\\.\\$${name}`)
        .join("|");
    const patterns = [
        typeNames,
        ...operators,
        methods,
        "\\[\\]",
        "\\(\\d+,?\\d*\\)",
        "\\(\\/.*?\\/[gimsuy]*\\)",
        "\\$\\{[^}]*\\}", // Template literal expressions
    ];
    return "`(?=.*(?:" + patterns.join("|") + ").*`)";
}
exports.generateSchemaTemplateBeginPattern = generateSchemaTemplateBeginPattern;
//# sourceMappingURL=generateSchemaStringBeginPattern.js.map