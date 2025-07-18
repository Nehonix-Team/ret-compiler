/**
 * Fortify Schema Hover Provider
 *
 * Provides hover information for Fortify Schema syntax elements
 * Uses centralized syntax definitions for maintainability
 */

import * as vscode from "vscode";
import { FortifyPatterns, FortifySyntaxUtils } from "../syntax/FortifyPatterns";
import { DocumentationProvider } from "./DocumentationProvider";
import { FORTIFY_CONDITIONAL_KEYWORDS } from "../syntax/mods/definitions/CONDITIONAL_KEYWORDS";

export class FortifyHoverProvider implements vscode.HoverProvider {
  /**
   * Provide hover information for Fortify Schema elements
   */
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Hover> {
    console.log(
      "🔍 Hover provider called at position:",
      position.line,
      position.character
    );

    const line = document.lineAt(position);
    const lineText = line.text;
    console.log("📝 Line text:", lineText);

    // SIMPLIFIED: Only check if we're in an Interface block (same as definition provider)
    const inInterfaceBlock = DocumentationProvider.isInInterfaceBlock(
      document,
      position
    );

    console.log("🔍 Interface block:", inInterfaceBlock);

    if (!inInterfaceBlock) {
      console.log("❌ Not in Interface block, returning null");
      return null;
    }

    // Get word range, including $ prefix for V2 methods
    let range = document.getWordRangeAtPosition(position);
    let word = range ? document.getText(range) : "";
    console.log("📝 Initial word:", word, "range:", range);

    // ENHANCED: If no word found with standard method, try to extract from string context
    if (!word || !range) {
      console.log("🔍 No standard word found, trying string extraction...");

      // Try to find word inside quotes
      const char = position.character;
      let start = char;
      let end = char;

      // Find word boundaries within the line
      while (start > 0 && /[a-zA-Z0-9_<>]/.test(lineText[start - 1])) {
        start--;
      }
      while (end < lineText.length && /[a-zA-Z0-9_<>]/.test(lineText[end])) {
        end++;
      }

      if (start < end) {
        word = lineText.substring(start, end);
        range = new vscode.Range(position.line, start, position.line, end);
        console.log("📝 Extracted word from string:", word);
      }
    }

    // Check if there's a $ before the word (V2 method syntax)
    if (range && position.character > 0) {
      const charBefore = lineText.charAt(range.start.character - 1);
      if (charBefore === "$") {
        // Extend range to include the $ prefix
        const extendedRange = new vscode.Range(
          new vscode.Position(range.start.line, range.start.character - 1),
          range.end
        );
        word = document.getText(extendedRange);
        range = extendedRange;
        console.log("📝 Extended word with $:", word);
      }
    }

    if (!range || !word) {
      console.log("❌ No word found after all attempts, returning null");
      return null;
    }

    console.log("✅ Final word for hover:", word);

    // Get hover information based on the word
    const hoverInfo = this.getHoverInfo(word, lineText);
    console.log("📖 Hover info result:", !!hoverInfo);

    if (hoverInfo) {
      console.log("✅ Returning hover with content");
      return new vscode.Hover(hoverInfo.content, range);
    }

    console.log("❌ No hover info found, returning null");
    return null;
  }

  /**
   * Check if position is in a schema context (inside quotes with schema syntax)
   * ENHANCED: Support all quote types - double quotes, single quotes, and backticks
   */
  private isInSchemaContext(lineText: string, position: number): boolean {
    const beforePosition = lineText.substring(0, position);

    // Check for double quotes
    const doubleQuoteCount = (beforePosition.match(/"/g) || []).length;
    if (doubleQuoteCount % 2 === 1) {
      return FortifyPatterns.containsSchemaPattern(lineText);
    }

    // Check for single quotes
    const singleQuoteCount = (beforePosition.match(/'/g) || []).length;
    if (singleQuoteCount % 2 === 1) {
      return FortifyPatterns.containsSchemaPattern(lineText);
    }

    // Check for backticks
    const backtickCount = (beforePosition.match(/`/g) || []).length;
    if (backtickCount % 2 === 1) {
      return FortifyPatterns.containsSchemaPattern(lineText);
    }

    return false; // Not inside any quotes
  }

  /**
   * Check if the current position is within an Interface({...}) block
   */
  private isInInterfaceBlock(
    document: vscode.TextDocument,
    position: vscode.Position
  ): boolean {
    const text = document.getText();
    const interfaceBlocks = this.findInterfaceBlocks(text);

    return interfaceBlocks.some(
      (block) => position.line >= block.start && position.line <= block.end
    );
  }

  /**
   * Finds all Interface({...}) blocks in the text and returns their line ranges
   */
  private findInterfaceBlocks(
    text: string
  ): Array<{ start: number; end: number }> {
    const blocks: Array<{ start: number; end: number }> = [];
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
  private findBlockEnd(lines: string[], startLine: number): number {
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
          } else if (char === "}") {
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
  private getHoverInfo(
    word: string,
    context: string
  ): { content: vscode.MarkdownString } | null {
    console.log("🔍 getHoverInfo called with word:", word, "context:", context);

    // ENHANCED: Check documentation provider first for comprehensive documentation
    const docEntry = DocumentationProvider.getDocumentation(word);
    console.log("📖 Documentation entry found:", !!docEntry, docEntry?.name);

    if (docEntry) {
      return {
        content: DocumentationProvider.createHoverMessage(docEntry),
      };
    }

    // Check for Make.const() function calls
    if (
      context.includes("Make.const") &&
      (word === "Make" || word === "const")
    ) {
      const makeConstEntry =
        DocumentationProvider.getDocumentation("Make.const");
      if (makeConstEntry) {
        return {
          content: DocumentationProvider.createHoverMessage(makeConstEntry),
        };
      }
    }

    // Check for record types
    if (word === "record" || context.includes("record<")) {
      const recordEntry = DocumentationProvider.getDocumentation("record");
      if (recordEntry) {
        return {
          content: DocumentationProvider.createHoverMessage(recordEntry),
        };
      }
    }

    // Fallback to existing logic for types not in documentation
    const typeInfo = this.getTypeInfo(word);
    if (typeInfo) return typeInfo;

    // Check operators
    const operatorInfo = this.getOperatorInfo(word);
    if (operatorInfo) return operatorInfo;

    // Check methods
    const methodInfo = this.getMethodInfo(word);
    if (methodInfo) return methodInfo;

    // Check conditional keywords
    const conditionalInfo = this.getConditionalInfo(word);
    if (conditionalInfo) return conditionalInfo;

    return null;
  }

  /**
   * Get hover info for types using centralized definitions
   */
  private getTypeInfo(word: string): { content: vscode.MarkdownString } | null {
    const baseWord = word.replace(/[\?\[\]]/g, "");
    const typeDefinition = FortifySyntaxUtils.getTypeDefinition(baseWord);

    if (typeDefinition) {
      const isOptional = word.includes("?");
      const isArray = word.includes("[]");

      const content = new vscode.MarkdownString();
      content.appendMarkdown(
        `**${word}** - Fortify Schema ${typeDefinition.category} Type\n\n`
      );
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
  private getOperatorInfo(
    word: string
  ): { content: vscode.MarkdownString } | null {
    const operatorDefinition = FortifySyntaxUtils.getOperatorDefinition(word);

    if (operatorDefinition) {
      const content = new vscode.MarkdownString();
      content.appendMarkdown(
        `**${word}** - Fortify Schema ${operatorDefinition.category} Operator\n\n`
      );
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
  private getMethodInfo(
    word: string
  ): { content: vscode.MarkdownString } | null {
    // Handle V2 method syntax with $ prefix
    let methodName = word;
    let isV2Method = false;

    if (word.startsWith("$")) {
      methodName = word.substring(1);
      isV2Method = true;
    }

    const methodDefinition = FortifySyntaxUtils.getMethodDefinition(methodName);

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
  private getConditionalInfo(
    word: string
  ): { content: vscode.MarkdownString } | null {
    const conditionalKeyword = FORTIFY_CONDITIONAL_KEYWORDS.find(
      (kw) => kw.keyword === word
    );

    if (conditionalKeyword) {
      const content = new vscode.MarkdownString();
      content.appendMarkdown(
        `**${word}** - Conditional Validation Keyword\n\n`
      );
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
