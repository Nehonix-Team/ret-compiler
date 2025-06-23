"use strict";
/**
 * Fortify Schema Completion Provider
 *
 * Provides intelligent autocompletion for Fortify Schema syntax
 * Uses centralized syntax definitions for maintainability
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FortifyCompletionProvider = void 0;
const vscode = require("vscode");
const FORTIFY_TYPES_1 = require("../syntax/mods/definitions/FORTIFY_TYPES");
const CONDITIONAL_KEYWORDS_1 = require("../syntax/mods/definitions/CONDITIONAL_KEYWORDS");
const OPERATORS_1 = require("../syntax/mods/definitions/OPERATORS");
const FORTIFY_METHODS_1 = require("../syntax/mods/definitions/FORTIFY_METHODS");
class FortifyCompletionProvider {
    /**
     * Provide completion items for Fortify Schema string
     */
    provideCompletionItems(document, position, _token, _context) {
        const line = document.lineAt(position);
        const lineText = line.text;
        const beforeCursor = lineText.substring(0, position.character);
        // Check for @fortify-ignore completion in comments
        if (this.isInComment(beforeCursor)) {
            return this.getFortifyIgnoreCompletions(beforeCursor);
        }
        // Check if we're inside a string AND within an Interface({...}) block
        if (!this.isInSchemaString(beforeCursor) || !this.isInInterfaceBlock(document, position)) {
            return [];
        }
        const completions = [];
        // Add type completions based on categories
        completions.push(...this.getTypeCompletions());
        // Add conditional completions if appropriate
        if (this.shouldShowConditionalCompletions(beforeCursor)) {
            completions.push(...this.getConditionalCompletions());
        }
        // Add method completions if we're after a dot
        if (beforeCursor.endsWith(".")) {
            completions.push(...this.getMethodCompletions());
        }
        return completions;
    }
    /**
     * Check if cursor is inside a comment
     */
    isInComment(text) {
        // Check for single-line comment
        const singleLineComment = text.lastIndexOf('//');
        if (singleLineComment !== -1) {
            // Make sure we're not inside a string when the comment starts
            const beforeComment = text.substring(0, singleLineComment);
            const quoteCount = (beforeComment.match(/"/g) || []).length;
            if (quoteCount % 2 === 0) { // Even number means we're not inside quotes
                return true;
            }
        }
        // Check for multi-line comment
        const multiLineStart = text.lastIndexOf('/*');
        const multiLineEnd = text.lastIndexOf('*/');
        if (multiLineStart !== -1 && (multiLineEnd === -1 || multiLineStart > multiLineEnd)) {
            return true;
        }
        return false;
    }
    /**
     * Get @fortify-ignore completion items
     */
    getFortifyIgnoreCompletions(beforeCursor) {
        const completions = [];
        // Check if user is typing @fortify or similar
        if (beforeCursor.includes('@fortify') || beforeCursor.includes('@fort') || beforeCursor.endsWith('@')) {
            const ignoreItem = new vscode.CompletionItem('@fortify-ignore', vscode.CompletionItemKind.Snippet);
            ignoreItem.detail = 'Disable Fortify Schema validation for this line';
            ignoreItem.documentation = new vscode.MarkdownString(`**@fortify-ignore** - Disables Fortify Schema validation\n\n` +
                `Use this comment to suppress validation warnings for specific lines.\n\n` +
                `**Usage:**\n` +
                `\`\`\`typescript\n` +
                `// @fortify-ignore\n` +
                `const schema = Interface({\n` +
                `  coordinates: "number(-90,90)" // This won't show validation errors\n` +
                `});\n` +
                `\`\`\`\n\n` +
                `**Or inline:**\n` +
                `\`\`\`typescript\n` +
                `coordinates: "number(-90,90)" // @fortify-ignore\n` +
                `\`\`\``);
            ignoreItem.insertText = new vscode.SnippetString('@fortify-ignore');
            ignoreItem.sortText = '0'; // Show at top of completion list
            completions.push(ignoreItem);
            // Also add the full comment version
            const commentItem = new vscode.CompletionItem('// @fortify-ignore', vscode.CompletionItemKind.Snippet);
            commentItem.detail = 'Add @fortify-ignore comment';
            commentItem.documentation = new vscode.MarkdownString(`**// @fortify-ignore** - Complete comment to disable validation\n\n` +
                `Adds a complete comment line to disable Fortify Schema validation for the next line.`);
            commentItem.insertText = new vscode.SnippetString('// @fortify-ignore');
            commentItem.sortText = '1';
            completions.push(commentItem);
            // Add multi-line comment version
            const multiLineItem = new vscode.CompletionItem('/* @fortify-ignore */', vscode.CompletionItemKind.Snippet);
            multiLineItem.detail = 'Add @fortify-ignore block comment';
            multiLineItem.documentation = new vscode.MarkdownString(`**/* @fortify-ignore */** - Block comment to disable validation\n\n` +
                `Adds a block comment to disable Fortify Schema validation.`);
            multiLineItem.insertText = new vscode.SnippetString('/* @fortify-ignore */');
            multiLineItem.sortText = '2';
            completions.push(multiLineItem);
        }
        return completions;
    }
    /**
     * Check if cursor is inside a potential schema string
     */
    isInSchemaString(text) {
        const quoteCount = (text.match(/"/g) || []).length;
        return quoteCount % 2 === 1; // Odd number means we're inside quotes
    }
    /**
     * Check if the current position is within an Interface({...}) block
     */
    isInInterfaceBlock(document, position) {
        const text = document.getText();
        const interfaceBlocks = this.findInterfaceBlocks(text);
        return interfaceBlocks.some(block => position.line >= block.start && position.line <= block.end);
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
                if (char === '\\') {
                    escapeNext = true;
                    continue;
                }
                if (char === '"' && !escapeNext) {
                    inString = !inString;
                    continue;
                }
                if (!inString) {
                    if (char === '{') {
                        braceCount++;
                    }
                    else if (char === '}') {
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
     * Check if we should show conditional completions
     */
    shouldShowConditionalCompletions(text) {
        return text.includes("when ") || text.endsWith("when");
    }
    /**
     * Get all type completions from centralized definitions
     */
    getTypeCompletions() {
        const completions = [];
        for (const type of FORTIFY_TYPES_1.FORTIFY_TYPES) {
            // Add required version
            const requiredItem = new vscode.CompletionItem(type.name, vscode.CompletionItemKind.TypeParameter);
            requiredItem.detail = `${type.category} type - ${type.description}`;
            requiredItem.documentation = new vscode.MarkdownString(`**${type.name}** - ${type.description}\n\n**Examples:**\n${type.examples.map((ex) => `\`${ex}\``).join(", ")}`);
            completions.push(requiredItem);
            // Add constraint examples for numeric types
            if (type.name === 'number' || type.name === 'int' || type.name === 'float') {
                // Add positive range example
                const positiveRangeItem = new vscode.CompletionItem(`${type.name}(0,100)`, vscode.CompletionItemKind.Snippet);
                positiveRangeItem.detail = `${type.category} with positive range constraint`;
                positiveRangeItem.documentation = new vscode.MarkdownString(`**${type.name}(min,max)** - ${type.description} with range constraint\n\n**Example:** \`"${type.name}(0,100)"\` - accepts values from 0 to 100`);
                positiveRangeItem.insertText = new vscode.SnippetString(`${type.name}(\${1:0},\${2:100})`);
                completions.push(positiveRangeItem);
                // Add negative range example
                const negativeRangeItem = new vscode.CompletionItem(`${type.name}(-90,90)`, vscode.CompletionItemKind.Snippet);
                negativeRangeItem.detail = `${type.category} with negative to positive range`;
                negativeRangeItem.documentation = new vscode.MarkdownString(`**${type.name}(min,max)** - ${type.description} with range including negative values\n\n**Example:** \`"${type.name}(-90,90)"\` - accepts values from -90 to 90 (useful for coordinates)`);
                negativeRangeItem.insertText = new vscode.SnippetString(`${type.name}(\${1:-90},\${2:90})`);
                completions.push(negativeRangeItem);
                // Add minimum only constraint
                const minOnlyItem = new vscode.CompletionItem(`${type.name}(0,)`, vscode.CompletionItemKind.Snippet);
                minOnlyItem.detail = `${type.category} with minimum value constraint`;
                minOnlyItem.documentation = new vscode.MarkdownString(`**${type.name}(min,)** - ${type.description} with minimum value only\n\n**Example:** \`"${type.name}(0,)"\` - accepts values >= 0`);
                minOnlyItem.insertText = new vscode.SnippetString(`${type.name}(\${1:0},)`);
                completions.push(minOnlyItem);
                // Add maximum only constraint
                const maxOnlyItem = new vscode.CompletionItem(`${type.name}(,100)`, vscode.CompletionItemKind.Snippet);
                maxOnlyItem.detail = `${type.category} with maximum value constraint`;
                maxOnlyItem.documentation = new vscode.MarkdownString(`**${type.name}(,max)** - ${type.description} with maximum value only\n\n**Example:** \`"${type.name}(,100)"\` - accepts values <= 100`);
                maxOnlyItem.insertText = new vscode.SnippetString(`${type.name}(,\${1:100})`);
                completions.push(maxOnlyItem);
            }
            // Add constraint examples for string types
            if (type.name === 'string') {
                // Add length constraint example
                const lengthConstraintItem = new vscode.CompletionItem('string(2,50)', vscode.CompletionItemKind.Snippet);
                lengthConstraintItem.detail = 'String with length constraint';
                lengthConstraintItem.documentation = new vscode.MarkdownString(`**string(min,max)** - String with length constraint\n\n**Example:** \`"string(2,50)"\` - accepts strings with 2-50 characters`);
                lengthConstraintItem.insertText = new vscode.SnippetString(`string(\${1:2},\${2:50})`);
                completions.push(lengthConstraintItem);
                // Add minimum length only
                const minLengthItem = new vscode.CompletionItem('string(1,)', vscode.CompletionItemKind.Snippet);
                minLengthItem.detail = 'String with minimum length';
                minLengthItem.documentation = new vscode.MarkdownString(`**string(min,)** - String with minimum length only\n\n**Example:** \`"string(1,)"\` - accepts strings with at least 1 character`);
                minLengthItem.insertText = new vscode.SnippetString(`string(\${1:1},)`);
                completions.push(minLengthItem);
                // Add maximum length only
                const maxLengthItem = new vscode.CompletionItem('string(,100)', vscode.CompletionItemKind.Snippet);
                maxLengthItem.detail = 'String with maximum length';
                maxLengthItem.documentation = new vscode.MarkdownString(`**string(,max)** - String with maximum length only\n\n**Example:** \`"string(,100)"\` - accepts strings with up to 100 characters`);
                maxLengthItem.insertText = new vscode.SnippetString(`string(,\${1:100})`);
                completions.push(maxLengthItem);
            }
            // Add optional version if supported
            if (type.supportsOptional) {
                const optionalItem = new vscode.CompletionItem(`${type.name}?`, vscode.CompletionItemKind.TypeParameter);
                optionalItem.detail = `Optional ${type.category} type - ${type.description}`;
                optionalItem.documentation = new vscode.MarkdownString(`**${type.name}?** - Optional ${type.description}\n\n**Examples:**\n${type.examples.map((ex) => `\`${ex}?\``).join(", ")}`);
                completions.push(optionalItem);
            }
            // Add array version if supported
            if (type.supportsArrays) {
                const arrayItem = new vscode.CompletionItem(`${type.name}[]`, vscode.CompletionItemKind.TypeParameter);
                arrayItem.detail = `Array of ${type.category} type - ${type.description}`;
                arrayItem.documentation = new vscode.MarkdownString(`**${type.name}[]** - Array of ${type.description}\n\n**Examples:**\n\`"${type.name}[]"\`, \`"${type.name}[](1,10)"\``);
                completions.push(arrayItem);
                // Add optional array version
                if (type.supportsOptional) {
                    const optionalArrayItem = new vscode.CompletionItem(`${type.name}[]?`, vscode.CompletionItemKind.TypeParameter);
                    optionalArrayItem.detail = `Optional array of ${type.category} type - ${type.description}`;
                    optionalArrayItem.documentation = new vscode.MarkdownString(`**${type.name}[]?** - Optional array of ${type.description}\n\n**Examples:**\n\`"${type.name}[]?"\`, \`"${type.name}[](1,10)?"\``);
                    completions.push(optionalArrayItem);
                }
            }
        }
        return completions;
    }
    /**
     * Get conditional syntax completions from centralized definitions
     */
    getConditionalCompletions() {
        const completions = [];
        // Add conditional keywords
        for (const keyword of CONDITIONAL_KEYWORDS_1.FORTIFY_CONDITIONAL_KEYWORDS) {
            const item = new vscode.CompletionItem(keyword.keyword, vscode.CompletionItemKind.Keyword);
            item.detail = keyword.description;
            item.documentation = new vscode.MarkdownString(`**${keyword.keyword}** - ${keyword.description}\n\n**Syntax:**\n\`${keyword.syntax}\`\n\n**Examples:**\n${keyword.examples.map((ex) => `\`${ex}\``).join("\n")}`);
            completions.push(item);
        }
        // Add operators
        for (const operator of OPERATORS_1.FORTIFY_OPERATORS) {
            if (operator.category === "comparison" ||
                operator.category === "logical" ||
                operator.category === "conditional") {
                const item = new vscode.CompletionItem(operator.symbol, vscode.CompletionItemKind.Operator);
                item.detail = `${operator.name} - ${operator.description}`;
                item.documentation = new vscode.MarkdownString(`**${operator.symbol}** - ${operator.description}\n\n**Examples:**\n${operator.examples.map((ex) => `\`${ex}\``).join("\n")}`);
                completions.push(item);
            }
        }
        return completions;
    }
    /**
     * Get method completions from centralized definitions
     */
    getMethodCompletions() {
        const completions = [];
        for (const method of FORTIFY_METHODS_1.FORTIFY_METHODS) {
            // Add regular method
            const item = new vscode.CompletionItem(method.name, vscode.CompletionItemKind.Method);
            item.detail = method.description;
            item.documentation = new vscode.MarkdownString(`**${method.name}** - ${method.description}\n\n**Syntax:**\n\`${method.syntax}\`\n\n**Examples:**\n${method.examples.map((ex) => `\`${ex}\``).join("\n")}`);
            // Add snippet for methods with parameters
            if (method.parameters.length > 0) {
                const paramSnippets = method.parameters
                    .map((_, index) => `$${index + 1}`)
                    .join(",");
                item.insertText = new vscode.SnippetString(`${method.name}(${paramSnippets})`);
            }
            completions.push(item);
            // Add negated version if supported
            if (method.supportsNegation) {
                const negatedItem = new vscode.CompletionItem(`!${method.name}`, vscode.CompletionItemKind.Method);
                negatedItem.detail = `Negated ${method.description}`;
                negatedItem.documentation = new vscode.MarkdownString(`**!${method.name}** - Negated ${method.description}\n\n**Syntax:**\n\`field.!${method.name}\`\n\n**Examples:**\n\`when field.!${method.name} *? type : type\``);
                if (method.parameters.length > 0) {
                    const paramSnippets = method.parameters
                        .map((_, index) => `$${index + 1}`)
                        .join(",");
                    negatedItem.insertText = new vscode.SnippetString(`!${method.name}(${paramSnippets})`);
                }
                completions.push(negatedItem);
            }
        }
        return completions;
    }
}
exports.FortifyCompletionProvider = FortifyCompletionProvider;
//# sourceMappingURL=CompletionProvider.js.map