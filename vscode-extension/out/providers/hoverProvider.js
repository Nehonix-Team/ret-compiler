"use strict";
/**
 * Fortify Schema Hover Provider
 *
 * Provides hover information for Fortify Schema syntax elements
 * Uses centralized syntax definitions for maintainability
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FortifyHoverProvider = void 0;
const vscode = require("vscode");
const FortifyPatterns_1 = require("../syntax/FortifyPatterns");
const CONDITIONAL_KEYWORDS_1 = require("../syntax/mods/definitions/CONDITIONAL_KEYWORDS");
class FortifyHoverProvider {
    /**
     * Provide hover information for Fortify Schema elements
     */
    provideHover(document, position, _token) {
        const line = document.lineAt(position);
        const lineText = line.text;
        // Check if we're in a string that contains schema syntax AND within an Interface block
        if (!this.isInSchemaContext(lineText, position.character) ||
            !this.isInInterfaceBlock(document, position)) {
            return null;
        }
        // Get word range, including $ prefix for V2 methods
        let range = document.getWordRangeAtPosition(position);
        let word = range ? document.getText(range) : "";
        // Check if there's a $ before the word (V2 method syntax)
        if (range && position.character > 0) {
            const charBefore = lineText.charAt(range.start.character - 1);
            if (charBefore === "$") {
                // Extend range to include the $ prefix
                const extendedRange = new vscode.Range(new vscode.Position(range.start.line, range.start.character - 1), range.end);
                word = document.getText(extendedRange);
                range = extendedRange;
            }
        }
        if (!range || !word) {
            return null;
        }
        // Get hover information based on the word
        const hoverInfo = this.getHoverInfo(word, lineText);
        if (hoverInfo) {
            return new vscode.Hover(hoverInfo.content, range);
        }
        return null;
    }
    /**
     * Check if position is in a schema context (inside quotes with schema syntax)
     */
    isInSchemaContext(lineText, position) {
        const beforePosition = lineText.substring(0, position);
        const quoteCount = (beforePosition.match(/"/g) || []).length;
        // Must be inside quotes (odd number of quotes before position)
        if (quoteCount % 2 === 0) {
            return false;
        }
        // Check if the string contains schema-like patterns
        return FortifyPatterns_1.FortifyPatterns.containsSchemaPattern(lineText);
    }
    /**
     * Check if the current position is within an Interface({...}) block
     */
    isInInterfaceBlock(document, position) {
        const text = document.getText();
        const interfaceBlocks = this.findInterfaceBlocks(text);
        return interfaceBlocks.some((block) => position.line >= block.start && position.line <= block.end);
    }
    /**
     * Finds all Interface({...}) blocks in the text and returns their line ranges
     */
    findInterfaceBlocks(text) {
        const blocks = [];
        const lines = text.split("\n");
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // Look for Interface( pattern
            const interfaceMatch = line.match(/\bInterface\s*\(/);
            if (interfaceMatch) {
                const blockEnd = this.findBlockEnd(lines, i);
                if (blockEnd !== -1) {
                    blocks.push({ start: i, end: blockEnd });
                }
            }
        }
        return blocks;
    }
    /**
     * Finds the end of a block starting from the given line by matching braces
     */
    findBlockEnd(lines, startLine) {
        let braceCount = 0;
        let inString = false;
        let escapeNext = false;
        for (let i = startLine; i < lines.length; i++) {
            const line = lines[i];
            for (let j = 0; j < line.length; j++) {
                const char = line[j];
                if (escapeNext) {
                    escapeNext = false;
                    continue;
                }
                if (char === "\\") {
                    escapeNext = true;
                    continue;
                }
                if (char === '"' && !escapeNext) {
                    inString = !inString;
                    continue;
                }
                if (!inString) {
                    if (char === "{") {
                        braceCount++;
                    }
                    else if (char === "}") {
                        braceCount--;
                        if (braceCount === 0) {
                            return i;
                        }
                    }
                }
            }
        }
        return -1; // Block not properly closed
    }
    /**
     * Get hover information for a specific word
     */
    getHoverInfo(word, context) {
        // Check types first
        const typeInfo = this.getTypeInfo(word);
        if (typeInfo)
            return typeInfo;
        // Check operators
        const operatorInfo = this.getOperatorInfo(word);
        if (operatorInfo)
            return operatorInfo;
        // Check methods
        const methodInfo = this.getMethodInfo(word);
        if (methodInfo)
            return methodInfo;
        // Check conditional keywords
        const conditionalInfo = this.getConditionalInfo(word);
        if (conditionalInfo)
            return conditionalInfo;
        return null;
    }
    /**
     * Get hover info for types using centralized definitions
     */
    getTypeInfo(word) {
        const baseWord = word.replace(/[\?\[\]]/g, "");
        const typeDefinition = FortifyPatterns_1.FortifySyntaxUtils.getTypeDefinition(baseWord);
        if (typeDefinition) {
            const isOptional = word.includes("?");
            const isArray = word.includes("[]");
            const content = new vscode.MarkdownString();
            content.appendMarkdown(`**${word}** - Fortify Schema ${typeDefinition.category} Type\n\n`);
            content.appendMarkdown(`${typeDefinition.description}\n\n`);
            if (isOptional) {
                content.appendMarkdown("*This field is optional*\n\n");
            }
            if (isArray) {
                content.appendMarkdown("*This is an array type*\n\n");
            }
            content.appendMarkdown("**Examples:**\n");
            typeDefinition.examples.forEach((example) => {
                content.appendCodeblock(example, "typescript");
            });
            return { content };
        }
        return null;
    }
    /**
     * Get hover info for operators using centralized definitions
     */
    getOperatorInfo(word) {
        const operatorDefinition = FortifyPatterns_1.FortifySyntaxUtils.getOperatorDefinition(word);
        if (operatorDefinition) {
            const content = new vscode.MarkdownString();
            content.appendMarkdown(`**${word}** - Fortify Schema ${operatorDefinition.category} Operator\n\n`);
            content.appendMarkdown(`${operatorDefinition.description}\n\n`);
            content.appendMarkdown("**Examples:**\n");
            operatorDefinition.examples.forEach((example) => {
                content.appendCodeblock(example, "typescript");
            });
            return { content };
        }
        return null;
    }
    /**
     * Get hover info for methods using centralized definitions
     */
    getMethodInfo(word) {
        // Handle V2 method syntax with $ prefix
        let methodName = word;
        let isV2Method = false;
        if (word.startsWith("$")) {
            methodName = word.substring(1);
            isV2Method = true;
        }
        const methodDefinition = FortifyPatterns_1.FortifySyntaxUtils.getMethodDefinition(methodName);
        if (methodDefinition) {
            const content = new vscode.MarkdownString();
            content.appendMarkdown(`**${word}** - Fortify Schema V2 Method\n\n`);
            content.appendMarkdown(`${methodDefinition.description}\n\n`);
            if (isV2Method) {
                content.appendMarkdown("*This is the V2 runtime method syntax*\n\n");
            }
            content.appendMarkdown("**Syntax:**\n");
            content.appendCodeblock(methodDefinition.syntax, "typescript");
            content.appendMarkdown("**Examples:**\n");
            methodDefinition.examples.forEach((example) => {
                content.appendCodeblock(example, "typescript");
            });
            return { content };
        }
        return null;
    }
    /**
     * Get hover info for conditional keywords
     */
    getConditionalInfo(word) {
        const conditionalKeyword = CONDITIONAL_KEYWORDS_1.FORTIFY_CONDITIONAL_KEYWORDS.find((kw) => kw.keyword === word);
        if (conditionalKeyword) {
            const content = new vscode.MarkdownString();
            content.appendMarkdown(`**${word}** - Conditional Validation Keyword\n\n`);
            content.appendMarkdown(`${conditionalKeyword.description}\n\n`);
            content.appendMarkdown("**Syntax:**\n");
            content.appendCodeblock(conditionalKeyword.syntax, "typescript");
            content.appendMarkdown("**Examples:**\n");
            conditionalKeyword.examples.forEach((example) => {
                content.appendCodeblock(example, "typescript");
            });
            return { content };
        }
        return null;
    }
}
exports.FortifyHoverProvider = FortifyHoverProvider;
//# sourceMappingURL=HoverProvider.js.map