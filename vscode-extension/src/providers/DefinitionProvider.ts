/**
 * Definition Provider for ReliantType
 *
 * Provides go-to-definition functionality for variables in conditional expressions
 * - Ctrl+click on "property" in "when property=premium" jumps to the property definition
 * - Works within Interface({...}) blocks
 * - Supports nested object properties
 */

import * as vscode from "vscode";
import { DocumentationProvider } from "./DocumentationProvider";

export class FortifyDefinitionProvider implements vscode.DefinitionProvider {
  /**
   * Provide definition for the symbol at the given position
   */
  async provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): Promise<vscode.Definition | vscode.LocationLink[] | undefined> {
    const text = document.getText();
    const line = document.lineAt(position);
    const lineText = line.text;

    // Check if we're in an Interface block
    if (!this.isInInterfaceBlock(document, position)) {
      return undefined;
    }

    // Get the word at the cursor position
    const wordRange = document.getWordRangeAtPosition(position);
    if (!wordRange) {
      return undefined;
    }

    const word = document.getText(wordRange);

    // ENHANCED: Check for documentation links first (Ctrl+Click to open docs)
    const docLocation = await this.getDocumentationLocation(word, lineText);
    if (docLocation) {
      return docLocation;
    }

    // Check if this word is a variable in a conditional expression
    if (!this.isVariableInConditional(lineText, word, position.character)) {
      return undefined;
    }

    // Find the property definition in the same Interface block
    const propertyLocation = this.findPropertyDefinition(
      document,
      position,
      word
    );
    if (propertyLocation) {
      return new vscode.Location(document.uri, propertyLocation);
    }

    return undefined;
  }

  /**
   * Check if the current position is within an Interface({...}) block
   */
  private isInInterfaceBlock(
    document: vscode.TextDocument,
    position: vscode.Position
  ): boolean {
    const text = document.getText();
    const lines = text.split("\n");

    // Find Interface blocks
    const interfaceBlocks = this.findInterfaceBlocks(lines);

    return interfaceBlocks.some(
      (block) => position.line >= block.start && position.line <= block.end
    );
  }

  /**
   * Find all Interface({...}) blocks in the document
   */
  private findInterfaceBlocks(
    lines: string[]
  ): Array<{ start: number; end: number }> {
    const blocks: Array<{ start: number; end: number }> = [];

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
   * Find the end of a block by matching braces
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

    return -1;
  }

  /**
   * Check if the word at the given position is a variable in a conditional expression
   */
  private isVariableInConditional(
    lineText: string,
    word: string,
    charPosition: number
  ): boolean {
    // Look for patterns like:
    // 1. "when accountType=premium" (equality conditionals)
    // 2. "when fields.exists" (method conditionals)
    // 3. "when user.profile.name.startsWith('A')" (nested property method conditionals)
    const conditionalPatterns = [
      // Equality conditionals: when accountType=premium
      new RegExp(`\\bwhen\\s+(${word})\\s*[=!<>]`, "g"),
      new RegExp(`\\b(${word})\\s*[=!<>].*\\*\\?`, "g"),

      // Method conditionals: when fields.exists, when fields.method()
      new RegExp(`\\bwhen\\s+(${word})\\s*\\.`, "g"),

      // Property path conditionals: when user.profile (where word is "user")
      new RegExp(`\\bwhen\\s+(${word})\\.[a-zA-Z_][a-zA-Z0-9_.]*`, "g"),

      // Nested property conditionals: when user.profile.name (where word could be any part)
      new RegExp(
        `\\bwhen\\s+[a-zA-Z_][a-zA-Z0-9_.]*\\b(${word})\\b[a-zA-Z0-9_.]*`,
        "g"
      ),
    ];

    for (const pattern of conditionalPatterns) {
      let match;
      while ((match = pattern.exec(lineText)) !== null) {
        // Find the position of the word in the match
        const matchText = match[0];
        const wordIndex = matchText.indexOf(word);

        if (wordIndex !== -1) {
          const variableStart = match.index + wordIndex;
          const variableEnd = variableStart + word.length;

          // Check if cursor is within the variable
          if (charPosition >= variableStart && charPosition <= variableEnd) {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * Find the property definition within the same Interface block
   */
  private findPropertyDefinition(
    document: vscode.TextDocument,
    currentPosition: vscode.Position,
    propertyName: string
  ): vscode.Range | undefined {
    const text = document.getText();
    const lines = text.split("\n");

    // Find the Interface block containing the current position
    const interfaceBlocks = this.findInterfaceBlocks(lines);
    const currentBlock = interfaceBlocks.find(
      (block) =>
        currentPosition.line >= block.start && currentPosition.line <= block.end
    );

    if (!currentBlock) {
      return undefined;
    }

    // Check if this is a property path (e.g., "user.profile.name")
    if (propertyName.includes(".")) {
      return this.findNestedPropertyDefinition(
        document,
        currentPosition,
        propertyName
      );
    }

    // Search for simple property definition within the block
    for (let i = currentBlock.start; i <= currentBlock.end; i++) {
      const line = lines[i];

      // Look for property definition patterns:
      // 1. "propertyName:" (object property)
      // 2. propertyName: "type" (direct property)
      // 3. propertyName: { (nested object)
      const propertyPatterns = [
        new RegExp(`^\\s*(${propertyName})\\s*:`, "g"),
        new RegExp(`[{,]\\s*(${propertyName})\\s*:`, "g"),
        new RegExp(`\\s+(${propertyName})\\s*:`, "g"), // More flexible whitespace
      ];

      for (const pattern of propertyPatterns) {
        let match;
        while ((match = pattern.exec(line)) !== null) {
          const propertyStart = match.index + match[0].indexOf(propertyName);
          const propertyEnd = propertyStart + propertyName.length;

          return new vscode.Range(
            new vscode.Position(i, propertyStart),
            new vscode.Position(i, propertyEnd)
          );
        }
      }
    }

    return undefined;
  }

  /**
   * Find nested property definitions (e.g., "user.profile.name")
   * Enhanced to handle property paths and method calls
   */
  private findNestedPropertyDefinition(
    document: vscode.TextDocument,
    currentPosition: vscode.Position,
    propertyPath: string
  ): vscode.Range | undefined {
    const parts = propertyPath.split(".");
    if (parts.length === 1) {
      return this.findPropertyDefinition(document, currentPosition, parts[0]);
    }

    // For nested properties, start with the root property
    // Example: "user.profile.name" -> find "user" first
    const rootProperty = parts[0];

    // Try to find the root property definition
    const rootDefinition = this.findPropertyDefinition(
      document,
      currentPosition,
      rootProperty
    );

    if (rootDefinition) {
      // For now, return the root property definition
      // In the future, we could enhance this to navigate to nested properties
      return rootDefinition;
    }

    return undefined;
  }

  /**
   * ENHANCED: Get documentation location for ReliantType types
   * Provides Ctrl+Click functionality to open documentation
   */
  private async getDocumentationLocation(
    word: string,
    lineText: string
  ): Promise<vscode.Location | undefined> {
    let targetWord = word;

    // Handle Make.const() function calls
    if (
      lineText.includes("Make.const") &&
      (word === "Make" || word === "const")
    ) {
      targetWord = "Make.const";
    }

    // Handle record types
    if (word === "record" || lineText.includes("record<")) {
      targetWord = "record";
    }

    // Check if we have documentation for this type
    const docEntry = DocumentationProvider.getDocumentation(targetWord);
    if (!docEntry) {
      return undefined;
    }

    // Create a location pointing to the documentation file
    const docPath = DocumentationProvider.getDocumentationPath();
    const docUri = vscode.Uri.file(docPath);

    try {
      // Open the documentation file and find the specific section
      const docDocument = await vscode.workspace.openTextDocument(docUri);
      const text = docDocument.getText();
      const lines = text.split("\n");

      // Look for the specific type definition
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Look for exact match: ### `url`
        if (line.startsWith("### ") && line.includes(`\`${targetWord}\``)) {
          const position = new vscode.Position(i, 0);
          const range = new vscode.Range(position, position);
          return new vscode.Location(docUri, range);
        }

        // Look for partial match: ### url (without backticks)
        if (
          line.startsWith("### ") &&
          line.toLowerCase().includes(targetWord.toLowerCase())
        ) {
          const position = new vscode.Position(i, 0);
          const range = new vscode.Range(position, position);
          return new vscode.Location(docUri, range);
        }
      }

      // Fallback to the beginning of the file
      const position = new vscode.Position(0, 0);
      const range = new vscode.Range(position, position);
      return new vscode.Location(docUri, range);
    } catch (error) {
      console.error("Failed to find specific section in documentation:", error);

      // Fallback: just open the documentation file at the beginning
      const position = new vscode.Position(0, 0);
      const range = new vscode.Range(position, position);
      return new vscode.Location(docUri, range);
    }
  }
}
