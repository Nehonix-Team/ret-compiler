"use strict";
/**
 * Semantic Tokens Provider for Fortify Schema
 *
 * Provides enhanced syntax highlighting using VSCode's semantic tokens API
 * - More precise token classification than TextMate grammars
 * - Better performance and reliability
 * - Full control over token types and modifiers
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FortifySemanticTokensProvider = exports.FortifyTokenModifier = void 0;
const vscode = require("vscode");
const extension_1 = require("../extension");
const FortifyPatterns_1 = require("../syntax/FortifyPatterns");
/**
 * Token modifiers for additional styling
 */
var FortifyTokenModifier;
(function (FortifyTokenModifier) {
    FortifyTokenModifier["Deprecated"] = "deprecated";
    FortifyTokenModifier["Readonly"] = "readonly";
    FortifyTokenModifier["Static"] = "static";
    FortifyTokenModifier["Declaration"] = "declaration";
    FortifyTokenModifier["Definition"] = "definition";
    FortifyTokenModifier["Async"] = "async";
})(FortifyTokenModifier = exports.FortifyTokenModifier || (exports.FortifyTokenModifier = {}));
/**
 * Semantic tokens provider for Fortify Schema syntax
 */
class FortifySemanticTokensProvider {
    /**
     * Provide semantic tokens for the document
     */
    provideDocumentSemanticTokens(document, token) {
        const tokensBuilder = new vscode.SemanticTokensBuilder(FortifySemanticTokensProvider.legend);
        const text = document.getText();
        // Extract Fortify schema strings from the document
        const schemaStrings = (0, extension_1.extractSchemaStrings)(text);
        for (const schemaString of schemaStrings) {
            if (token.isCancellationRequested) {
                return;
            }
            this.tokenizeSchemaString(document, schemaString.value, schemaString.start + 1, // Skip opening quote
            tokensBuilder);
        }
        return tokensBuilder.build();
    }
    /**
     * Tokenize a single Fortify schema string
     */
    tokenizeSchemaString(document, schemaText, startOffset, tokensBuilder) {
        // First, handle union types specially for better accuracy
        this.tokenizeUnions(document, schemaText, startOffset, tokensBuilder);
        // Use centralized patterns from FortifyPatterns for consistency
        const patterns = [
            // Basic types - use centralized pattern
            {
                regex: new RegExp(FortifyPatterns_1.FortifyPatterns.getBasicTypePattern().source, "g"),
                tokenType: "type",
                tokenModifiers: [],
            },
            // Format types - use centralized pattern
            {
                regex: new RegExp(FortifyPatterns_1.FortifyPatterns.getFormatTypePattern().source, "g"),
                tokenType: "type",
                tokenModifiers: [],
            },
            // Numeric types - use centralized pattern
            {
                regex: new RegExp(FortifyPatterns_1.FortifyPatterns.getNumericTypePattern().source, "g"),
                tokenType: "type",
                tokenModifiers: [],
            },
            // Conditional keywords - use centralized pattern
            {
                regex: new RegExp(FortifyPatterns_1.FortifyPatterns.getConditionalKeywordPattern().source, "g"),
                tokenType: "keyword",
                tokenModifiers: [],
            },
            // Conditional operators - use centralized pattern
            {
                regex: new RegExp(FortifyPatterns_1.FortifyPatterns.getConditionalOperatorPattern().source, "g"),
                tokenType: "operator",
                tokenModifiers: [],
            },
            // Comparison operators - use centralized pattern
            {
                regex: new RegExp(FortifyPatterns_1.FortifyPatterns.getComparisonOperatorPattern().source, "g"),
                tokenType: "operator",
                tokenModifiers: [],
            },
            // Logical operators - use centralized pattern
            {
                regex: new RegExp(FortifyPatterns_1.FortifyPatterns.getLogicalOperatorPattern().source, "g"),
                tokenType: "operator",
                tokenModifiers: [],
            },
            // Methods - use centralized pattern
            {
                regex: new RegExp(FortifyPatterns_1.FortifyPatterns.getMethodPattern().source, "g"),
                tokenType: "function",
                tokenModifiers: [],
            },
            // Constants - use centralized pattern with better token type
            {
                regex: new RegExp(FortifyPatterns_1.FortifyPatterns.getConstantPattern().source, "g"),
                tokenType: "enumMember",
                tokenModifiers: [FortifyTokenModifier.Readonly],
            },
            // Note: Union patterns are handled separately in tokenizeUnions method
            // Numeric literals in constraints - use centralized pattern
            {
                regex: /\b(\d+(?:\.\d+)?)\b/g,
                tokenType: "number",
                tokenModifiers: [],
            },
            // Array notation - use centralized pattern
            {
                regex: new RegExp(FortifyPatterns_1.FortifyPatterns.getArrayPattern().source, "g"),
                tokenType: "punctuation",
                tokenModifiers: [],
            },
            // Optional marker - use centralized pattern
            {
                regex: new RegExp(FortifyPatterns_1.FortifyPatterns.getOptionalPattern().source, "g"),
                tokenType: "punctuation",
                tokenModifiers: [],
            },
            // Constraint parentheses - use centralized pattern
            {
                regex: new RegExp(FortifyPatterns_1.FortifyPatterns.getConstraintPattern().source, "g"),
                tokenType: "punctuation",
                tokenModifiers: [],
            },
        ];
        // Apply each pattern to find and tokenize matches
        for (const pattern of patterns) {
            let match;
            pattern.regex.lastIndex = 0; // Reset regex state
            while ((match = pattern.regex.exec(schemaText)) !== null) {
                const matchStart = startOffset + match.index;
                const matchLength = match[0].length;
                // Convert absolute offset to line/character position
                const startPos = document.positionAt(matchStart);
                // Add token to builder
                tokensBuilder.push(startPos.line, startPos.character, matchLength, this.encodeTokenType(pattern.tokenType), this.encodeTokenModifiers(pattern.tokenModifiers));
            }
        }
    }
    /**
     * Encode token type to legend index
     */
    encodeTokenType(tokenType) {
        const index = FortifySemanticTokensProvider.legend.tokenTypes.indexOf(tokenType);
        return index >= 0 ? index : 0; // Default to first type if not found
    }
    /**
     * Encode token modifiers to bitmask
     */
    encodeTokenModifiers(modifiers) {
        let result = 0;
        for (const modifier of modifiers) {
            const index = FortifySemanticTokensProvider.legend.tokenModifiers.indexOf(modifier);
            if (index >= 0) {
                result |= 1 << index;
            }
        }
        return result;
    }
    /**
     * Specialized tokenization for union types like "admin|user|guest"
     */
    tokenizeUnions(document, schemaText, startOffset, tokensBuilder) {
        // Improved pattern to match union literals more accurately
        const unionPattern = /([a-zA-Z_][a-zA-Z0-9_]*)\s*\|\s*([a-zA-Z_][a-zA-Z0-9_]*(?:\s*\|\s*[a-zA-Z_][a-zA-Z0-9_]*)*)/g;
        let unionMatch;
        while ((unionMatch = unionPattern.exec(schemaText)) !== null) {
            const fullMatch = unionMatch[0];
            const matchStart = startOffset + unionMatch.index;
            // Process each part of the union including separators
            let currentIndex = 0;
            const parts = fullMatch.split(/(\s*\|\s*)/); // Keep separators
            for (const part of parts) {
                if (part.trim() && !part.includes("|")) {
                    // This is a union literal value
                    const partStart = matchStart + fullMatch.indexOf(part, currentIndex);
                    const startPos = document.positionAt(partStart);
                    tokensBuilder.push(startPos.line, startPos.character, part.trim().length, this.encodeTokenType("enumMember"), this.encodeTokenModifiers([FortifyTokenModifier.Static]));
                }
                else if (part.includes("|")) {
                    // This is a separator
                    const separatorIndex = part.indexOf("|");
                    const separatorStart = matchStart + fullMatch.indexOf(part, currentIndex) + separatorIndex;
                    const separatorPos = document.positionAt(separatorStart);
                    tokensBuilder.push(separatorPos.line, separatorPos.character, 1, this.encodeTokenType("operator"), this.encodeTokenModifiers([]));
                }
                currentIndex += part.length;
            }
        }
        // Also handle simple patterns like "word|word" that might be missed
        const simpleUnionPattern = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\|\s*([a-zA-Z_][a-zA-Z0-9_]*)\b/g;
        let simpleMatch;
        while ((simpleMatch = simpleUnionPattern.exec(schemaText)) !== null) {
            // Skip if already processed by the main pattern
            if (unionPattern.lastIndex > simpleMatch.index)
                continue;
            const firstPart = simpleMatch[1];
            const secondPart = simpleMatch[2];
            const matchStart = startOffset + simpleMatch.index;
            // Token for first part
            const firstPos = document.positionAt(matchStart);
            tokensBuilder.push(firstPos.line, firstPos.character, firstPart.length, this.encodeTokenType("enumMember"), this.encodeTokenModifiers([FortifyTokenModifier.Static]));
            // Token for separator
            const separatorIndex = simpleMatch[0].indexOf("|");
            const separatorPos = document.positionAt(matchStart + separatorIndex);
            tokensBuilder.push(separatorPos.line, separatorPos.character, 1, this.encodeTokenType("operator"), this.encodeTokenModifiers([]));
            // Token for second part
            const secondStart = matchStart + simpleMatch[0].lastIndexOf(secondPart);
            const secondPos = document.positionAt(secondStart);
            tokensBuilder.push(secondPos.line, secondPos.character, secondPart.length, this.encodeTokenType("enumMember"), this.encodeTokenModifiers([FortifyTokenModifier.Static]));
        }
    }
}
exports.FortifySemanticTokensProvider = FortifySemanticTokensProvider;
/**
 * Token types legend for VSCode
 */
FortifySemanticTokensProvider.legend = new vscode.SemanticTokensLegend([
    // Map our custom types to VSCode built-in types for fallback
    "type",
    "keyword",
    "operator",
    "function",
    "variable",
    "string",
    "number",
    "punctuation",
    "comment",
    "enumMember", // Union literals and constants
], [
    FortifyTokenModifier.Deprecated,
    FortifyTokenModifier.Readonly,
    FortifyTokenModifier.Static,
    FortifyTokenModifier.Declaration,
    FortifyTokenModifier.Definition,
    FortifyTokenModifier.Async,
]);
//# sourceMappingURL=SemanticTokensProvider.js.map