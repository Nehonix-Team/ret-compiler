"use strict";
/**
 * Fortify Schema Pattern Generators
 *
 * Generates regex patterns and validation rules from centralized syntax definitions.
 * This ensures consistency across all extension features.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FortifyPatterns = exports.FortifySyntaxUtils = void 0;
const FortifySyntaxDefinitions_1 = require("./FortifySyntaxDefinitions");
Object.defineProperty(exports, "FortifySyntaxUtils", { enumerable: true, get: function () { return FortifySyntaxDefinitions_1.FortifySyntaxUtils; } });
const CONDITIONAL_KEYWORDS_1 = require("./mods/definitions/CONDITIONAL_KEYWORDS");
class FortifyPatterns {
    /**
     * Generate regex pattern for all valid types
     */
    static getTypePattern() {
        const typeNames = FortifySyntaxDefinitions_1.FortifySyntaxUtils.getAllTypeNames();
        const pattern = `\\b(${typeNames.join("|")})\\b`;
        return new RegExp(pattern);
    }
    /**
     * Generate regex pattern for basic types
     */
    static getBasicTypePattern() {
        const basicTypes = FortifySyntaxDefinitions_1.FortifySyntaxUtils.getTypesByCategory("basic");
        const pattern = `\\b(${basicTypes.map((t) => t.name).join("|")})\\b`;
        return new RegExp(pattern);
    }
    /**
     * Generate regex pattern for format types
     */
    static getFormatTypePattern() {
        const formatTypes = FortifySyntaxDefinitions_1.FortifySyntaxUtils.getTypesByCategory("format");
        const pattern = `\\b(${formatTypes.map((t) => t.name).join("|")})\\b`;
        return new RegExp(pattern);
    }
    /**
     * Generate regex pattern for numeric types
     */
    static getNumericTypePattern() {
        const numericTypes = FortifySyntaxDefinitions_1.FortifySyntaxUtils.getTypesByCategory("numeric");
        const pattern = `\\b(${numericTypes.map((t) => t.name).join("|")})\\b`;
        return new RegExp(pattern);
    }
    /**
     * Generate regex pattern for comparison operators
     */
    static getComparisonOperatorPattern() {
        const comparisonOps = FortifySyntaxDefinitions_1.FortifySyntaxUtils.getOperatorsByCategory("comparison");
        // Sort by length (longest first) to avoid partial matches
        const symbols = comparisonOps
            .map((op) => op.symbol)
            .sort((a, b) => b.length - a.length)
            .map((symbol) => this.escapeRegex(symbol));
        const pattern = `(${symbols.join("|")})`;
        return new RegExp(pattern);
    }
    /**
     * Generate regex pattern for logical operators
     */
    static getLogicalOperatorPattern() {
        const logicalOps = FortifySyntaxDefinitions_1.FortifySyntaxUtils.getOperatorsByCategory("logical");
        const symbols = logicalOps
            .map((op) => op.symbol)
            .map((symbol) => this.escapeRegex(symbol));
        const pattern = `(${symbols.join("|")})`;
        return new RegExp(pattern);
    }
    /**
     * Generate regex pattern for conditional operators
     */
    static getConditionalOperatorPattern() {
        const conditionalOps = FortifySyntaxDefinitions_1.FortifySyntaxUtils.getOperatorsByCategory("conditional");
        const symbols = conditionalOps
            .map((op) => op.symbol)
            .map((symbol) => this.escapeRegex(symbol));
        const pattern = `(${symbols.join("|")})`;
        return new RegExp(pattern);
    }
    /**
     * Generate regex pattern for V2 method calls with $ prefix
     */
    static getMethodPattern() {
        const methods = FortifySyntaxDefinitions_1.FortifySyntaxUtils.getAllMethodNames();
        // V2 syntax uses $method() format
        const pattern = `\\.\\$(${methods.join("|")})\\b`;
        return new RegExp(pattern);
    }
    /**
     * Generate regex pattern for conditional keywords
     */
    static getConditionalKeywordPattern() {
        const keywords = CONDITIONAL_KEYWORDS_1.FORTIFY_CONDITIONAL_KEYWORDS.map((kw) => kw.keyword);
        const pattern = `\\b(${keywords.join("|")})\\b`;
        return new RegExp(pattern);
    }
    /**
     * Generate regex pattern for constraints
     */
    static getConstraintPattern() {
        return /\(([^)]*)\)/g;
    }
    /**
     * Generate regex pattern for arrays
     */
    static getArrayPattern() {
        return /\[\](\([^)]*\))?/g;
    }
    /**
     * Generate regex pattern for optional markers
     */
    static getOptionalPattern() {
        return /\?/g;
    }
    /**
     * Generate regex pattern for union separators
     */
    static getUnionPattern() {
        return /\|/g;
    }
    /**
     * Generate regex pattern for constants
     */
    static getConstantPattern() {
        return /=\w+/g;
    }
    /**
     * Generate comprehensive schema detection pattern
     */
    static getSchemaDetectionPattern() {
        const typePattern = this.getTypePattern().source;
        const constraintPattern = this.getConstraintPattern().source;
        const conditionalPattern = this.getConditionalKeywordPattern().source;
        const methodPattern = this.getMethodPattern().source;
        const patterns = [
            typePattern,
            `${typePattern}\\s*${constraintPattern}`,
            "\\b\\w+\\s*\\|\\s*\\w+",
            "=\\w+",
            conditionalPattern,
            "\\*\\?",
            methodPattern,
            "\\[\\]", // Arrays
        ];
        return new RegExp(`(${patterns.join("|")})`);
    }
    /**
     * Check if text contains Fortify schema syntax
     * Uses centralized type definitions for better extensibility
     */
    static containsSchemaPattern(text) {
        // Be more specific to avoid false positives in source code
        // Only consider it a schema if it has specific patterns
        // Check for conditional patterns (must have "when" + "*?" + ":")
        if (text.includes("when") && text.includes("*?") && text.includes(":")) {
            return true;
        }
        // Check for union patterns (including invalid ones with "||" so they can be validated)
        if (text.includes("|")) {
            return true;
        }
        // Check for constants (starts with =)
        if (text.startsWith("=")) {
            return true;
        }
        // Get all valid type names dynamically from centralized definitions
        const allTypeNames = FortifySyntaxDefinitions_1.FortifySyntaxUtils.getAllTypeNames();
        const typeNamesPattern = allTypeNames.join("|");
        // Check for types with constraints or arrays using dynamic type list
        const typeWithConstraints = new RegExp(`^(${typeNamesPattern})(\\([^)]*\\)|\\[\\]|\\?)`);
        if (typeWithConstraints.test(text)) {
            return true;
        }
        // Check for simple valid types using dynamic type list
        const simpleTypes = new RegExp(`^(${typeNamesPattern})$`);
        if (simpleTypes.test(text)) {
            return true;
        }
        // Check for potential type names (single words that could be types)
        // This catches invalid types like "invalidtype" so they can be validated
        const potentialType = /^[a-zA-Z][a-zA-Z0-9]*(\?|\[\](\([^)]*\))?)?$/;
        if (potentialType.test(text)) {
            return true;
        }
        return false;
    }
    /**
     * Extract all schema-like strings from text
     */
    static extractSchemaStrings(text) {
        const results = [];
        const stringRegex = /"([^"\\]|\\.)*"/g;
        let match;
        while ((match = stringRegex.exec(text)) !== null) {
            const stringValue = match[0].slice(1, -1); // Remove quotes
            if (this.containsSchemaPattern(stringValue)) {
                results.push({
                    value: stringValue,
                    start: match.index,
                    end: match.index + match[0].length,
                });
            }
        }
        return results;
    }
    /**
     * Validate schema syntax
     */
    static validateSyntax(schema) {
        const errors = [];
        // Check for unknown types
        const typeMatches = schema.match(/\b(\w+)(?:\?|\[\]|\([^)]*\))*/g);
        if (typeMatches) {
            for (const match of typeMatches) {
                const baseType = match.replace(/[\?\[\]()0-9,.\s]/g, "");
                if (baseType && !schema.includes("when") && baseType !== "when") {
                    if (!FortifySyntaxDefinitions_1.FortifySyntaxUtils.isValidType(baseType)) {
                        errors.push({
                            message: `Unknown type: "${baseType}"`,
                            type: "unknown-type",
                        });
                    }
                }
            }
        }
        // Check conditional syntax
        if (schema.includes("when")) {
            if (!schema.includes("*?")) {
                errors.push({
                    message: 'Conditional syntax missing "*?" operator',
                    type: "missing-conditional-then",
                });
            }
        }
        // Check for empty union values
        if (schema.includes("|")) {
            const unionParts = schema.split("|");
            for (const part of unionParts) {
                if (part.trim() === "") {
                    errors.push({
                        message: "Empty union value",
                        type: "empty-union-value",
                    });
                }
            }
        }
        return {
            isValid: errors.length === 0,
            errors,
        };
    }
    /**
     * Generate TextMate grammar patterns
     */
    static generateTextMatePatterns() {
        return {
            "fortify-basic-types": {
                patterns: [
                    {
                        name: "string.quoted.double.fortify.basic-type",
                        match: this.getBasicTypePattern().source,
                    },
                ],
            },
            "fortify-format-types": {
                patterns: [
                    {
                        name: "string.quoted.double.fortify.format-type",
                        match: this.getFormatTypePattern().source,
                    },
                ],
            },
            "fortify-numeric-types": {
                patterns: [
                    {
                        name: "string.quoted.double.fortify.numeric-type",
                        match: this.getNumericTypePattern().source,
                    },
                ],
            },
            "fortify-conditional-keywords": {
                patterns: [
                    {
                        name: "keyword.control.fortify.when",
                        match: this.getConditionalKeywordPattern().source,
                    },
                ],
            },
            "fortify-conditional-operators": {
                patterns: [
                    {
                        name: "keyword.operator.fortify.conditional-then",
                        match: this.getConditionalOperatorPattern().source,
                    },
                ],
            },
            "fortify-comparison-operators": {
                patterns: [
                    {
                        name: "keyword.operator.fortify.comparison",
                        match: this.getComparisonOperatorPattern().source,
                    },
                ],
            },
            "fortify-logical-operators": {
                patterns: [
                    {
                        name: "keyword.operator.fortify.logical",
                        match: this.getLogicalOperatorPattern().source,
                    },
                ],
            },
            "fortify-methods": {
                patterns: [
                    {
                        name: "support.function.fortify.method",
                        match: this.getMethodPattern().source,
                    },
                ],
            },
        };
    }
    /**
     * Escape special regex characters
     */
    static escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
}
exports.FortifyPatterns = FortifyPatterns;
//# sourceMappingURL=FortifyPatterns.js.map