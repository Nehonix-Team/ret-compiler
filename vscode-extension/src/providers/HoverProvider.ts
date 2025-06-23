/**
 * Fortify Schema Hover Provider
 *
 * Provides hover information for Fortify Schema syntax elements
 * Uses centralized syntax definitions for maintainability
 */

import * as vscode from "vscode";
import { FortifyPatterns, FortifySyntaxUtils } from "../syntax/FortifyPatterns";
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
    const range = document.getWordRangeAtPosition(position);
    if (!range) {
      return null;
    }

    const word = document.getText(range);
    const line = document.lineAt(position);
    const lineText = line.text;

    // Check if we're in a string that contains schema syntax AND within an Interface block
    if (!this.isInSchemaContext(lineText, position.character) || !this.isInInterfaceBlock(document, position)) {
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
  private isInSchemaContext(lineText: string, position: number): boolean {
    const beforePosition = lineText.substring(0, position);
    const quoteCount = (beforePosition.match(/"/g) || []).length;

    // Must be inside quotes (odd number of quotes before position)
    if (quoteCount % 2 === 0) {
      return false;
    }

    // Check if the string contains schema-like patterns
    return FortifyPatterns.containsSchemaPattern(lineText);
  }

  /**
   * Check if the current position is within an Interface({...}) block
   */
  private isInInterfaceBlock(document: vscode.TextDocument, position: vscode.Position): boolean {
    const text = document.getText();
    const interfaceBlocks = this.findInterfaceBlocks(text);

    return interfaceBlocks.some(block =>
      position.line >= block.start && position.line <= block.end
    );
  }

  /**
   * Finds all Interface({...}) blocks in the text and returns their line ranges
   */
  private findInterfaceBlocks(text: string): Array<{ start: number; end: number }> {
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
          } else if (char === '}') {
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
    // Check types first
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
    // Handle negated methods
    const methodName = word.startsWith("!") ? word.substring(1) : word;
    const isNegated = word.startsWith("!");

    const methodDefinition = FortifySyntaxUtils.getMethodDefinition(methodName);

    if (methodDefinition) {
      const content = new vscode.MarkdownString();
      content.appendMarkdown(`**${word}** - Fortify Schema Method\n\n`);
      content.appendMarkdown(`${methodDefinition.description}\n\n`);

      if (isNegated) {
        content.appendMarkdown(
          "*This is the negated version of the method*\n\n"
        );
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
