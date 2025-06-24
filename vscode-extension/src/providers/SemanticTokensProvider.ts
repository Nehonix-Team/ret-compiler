/**
 * Semantic Tokens Provider for Fortify Schema
 *
 * Provides enhanced syntax highlighting using VSCode's semantic tokens API
 * - More precise token classification than TextMate grammars
 * - Better performance and reliability
 * - Full control over token types and modifiers
 */

import * as vscode from "vscode";
import { FortifyPatterns } from "../syntax/FortifyPatterns";

/**
 * Token modifiers for additional styling
 */
export enum FortifyTokenModifier {
  Deprecated = "deprecated",
  Readonly = "readonly",
  Static = "static",
  Declaration = "declaration",
  Definition = "definition",
  Async = "async",
}

/**
 * Semantic tokens provider for Fortify Schema syntax
 */
export class FortifySemanticTokensProvider
  implements vscode.DocumentSemanticTokensProvider
{
  /**
   * Token types legend for VSCode
   */
  static readonly legend = new vscode.SemanticTokensLegend(
    [
      // Map our custom types to VSCode built-in types for fallback
      "type", // BasicType, FormatType, NumericType
      "keyword", // ConditionalKeyword
      "operator", // All operators
      "function", // Method, MethodCall
      "variable", // Constant
      "string", // StringLiteral
      "number", // NumericLiteral
      "punctuation", // Structural elements
      "comment", // For debugging/info
      "enumMember", // Union literals and constants
    ],
    [
      FortifyTokenModifier.Deprecated,
      FortifyTokenModifier.Readonly,
      FortifyTokenModifier.Static,
      FortifyTokenModifier.Declaration,
      FortifyTokenModifier.Definition,
      FortifyTokenModifier.Async,
    ]
  );

  /**
   * Provide semantic tokens for the document
   */
  provideDocumentSemanticTokens(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.SemanticTokens> {
    const tokensBuilder = new vscode.SemanticTokensBuilder(
      FortifySemanticTokensProvider.legend
    );
    const text = document.getText();

    // Extract Fortify schema strings ONLY from Interface({...}) blocks
    const schemaStrings = this.extractSchemaStrings(text, document);

    for (const schemaString of schemaStrings) {
      if (token.isCancellationRequested) {
        return;
      }

      this.tokenizeSchemaString(
        document,
        schemaString.value,
        schemaString.range.start, // Use range start position
        tokensBuilder
      );
    }

    return tokensBuilder.build();
  }

  /**
   * Extracts Fortify Schema strings ONLY from Interface({...}) blocks
   * This ensures syntax highlighting is only applied where it's relevant
   */
  private extractSchemaStrings(
    text: string,
    document: vscode.TextDocument
  ): Array<{ value: string; range: vscode.Range }> {
    const results: Array<{ value: string; range: vscode.Range }> = [];

    // Find all Interface({...}) blocks in the document
    const interfaceBlocks = this.findInterfaceBlocks(text);

    if (interfaceBlocks.length === 0) {
      return results; // No Interface blocks found, no highlighting needed
    }

    const lines = text.split("\n");

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];

      // Check if this line is within any Interface block
      if (!this.isLineInInterfaceBlock(lineIndex, interfaceBlocks)) {
        continue;
      }

      const stringMatches = line.matchAll(/"([^"\\]|\\.)*"/g);

      for (const match of stringMatches) {
        if (match.index !== undefined) {
          const stringValue = match[0].slice(1, -1); // Remove quotes

          // Within Interface blocks, highlight all strings that could be schemas
          if (this.couldBeSchemaString(stringValue)) {
            const startPos = new vscode.Position(lineIndex, match.index + 1); // Skip opening quote
            const endPos = new vscode.Position(
              lineIndex,
              match.index + match[0].length - 1 // Skip closing quote
            );
            results.push({
              value: stringValue,
              range: new vscode.Range(startPos, endPos),
            });
          }
        }
      }
    }

    return results;
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
   * Checks if a line is within any of the Interface blocks
   */
  private isLineInInterfaceBlock(
    lineIndex: number,
    blocks: Array<{ start: number; end: number }>
  ): boolean {
    return blocks.some(
      (block) => lineIndex >= block.start && lineIndex <= block.end
    );
  }

  /**
   * Determines if a string could potentially be a Fortify schema string
   */
  private couldBeSchemaString(value: string): boolean {
    // Skip obvious non-schema strings
    if (value.length === 0 || value.length > 200) {
      return false;
    }

    // Skip URLs, file paths, and other obvious non-schema patterns
    if (
      value.startsWith("http") ||
      value.startsWith("/") ||
      value.includes("\\")
    ) {
      return false;
    }

    // Skip very long strings that are clearly not schemas
    if (value.includes(" ") && value.length > 50) {
      return false;
    }

    // Within Interface blocks, be more permissive - highlight most short strings
    return true;
  }

  /**
   * Tokenize a single Fortify schema string
   */
  private tokenizeSchemaString(
    document: vscode.TextDocument,
    schemaText: string,
    startPosition: vscode.Position,
    tokensBuilder: vscode.SemanticTokensBuilder
  ): void {
    // Calculate the absolute offset from the position
    const startOffset = document.offsetAt(startPosition);

    // First, handle union types specially for better accuracy
    this.tokenizeUnions(document, schemaText, startOffset, tokensBuilder);

    // Use centralized patterns from FortifyPatterns for consistency
    const patterns = [
      // Basic types - use centralized pattern
      {
        regex: new RegExp(FortifyPatterns.getBasicTypePattern().source, "g"),
        tokenType: "type",
        tokenModifiers: [],
      },

      // Format types - use centralized pattern
      {
        regex: new RegExp(FortifyPatterns.getFormatTypePattern().source, "g"),
        tokenType: "type",
        tokenModifiers: [],
      },

      // Numeric types - use centralized pattern
      {
        regex: new RegExp(FortifyPatterns.getNumericTypePattern().source, "g"),
        tokenType: "type",
        tokenModifiers: [],
      },

      // Conditional keywords - use centralized pattern
      {
        regex: new RegExp(
          FortifyPatterns.getConditionalKeywordPattern().source,
          "g"
        ),
        tokenType: "keyword",
        tokenModifiers: [],
      },

      // Conditional operators - use centralized pattern
      {
        regex: new RegExp(
          FortifyPatterns.getConditionalOperatorPattern().source,
          "g"
        ),
        tokenType: "operator",
        tokenModifiers: [],
      },

      // Comparison operators - use centralized pattern
      {
        regex: new RegExp(
          FortifyPatterns.getComparisonOperatorPattern().source,
          "g"
        ),
        tokenType: "operator",
        tokenModifiers: [],
      },

      // Logical operators - use centralized pattern
      {
        regex: new RegExp(
          FortifyPatterns.getLogicalOperatorPattern().source,
          "g"
        ),
        tokenType: "operator",
        tokenModifiers: [],
      },

      // Methods - use centralized pattern
      {
        regex: new RegExp(FortifyPatterns.getMethodPattern().source, "g"),
        tokenType: "function",
        tokenModifiers: [],
      },

      // Constants - use centralized pattern with better token type
      {
        regex: new RegExp(FortifyPatterns.getConstantPattern().source, "g"),
        tokenType: "enumMember", // Better color for constants
        tokenModifiers: [FortifyTokenModifier.Readonly],
      },

      // Variables in conditional expressions (e.g., "accountType" in "when accountType=premium")
      {
        regex: /\bwhen\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*[=!<>]/g,
        tokenType: "variable",
        tokenModifiers: [FortifyTokenModifier.Declaration],
        captureGroup: 1, // Capture only the variable name
      },

      // Variables in method-based conditionals (e.g., "fields" in "when fields.exists")
      {
        regex: /\bwhen\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\./g,
        tokenType: "variable",
        tokenModifiers: [FortifyTokenModifier.Declaration],
        captureGroup: 1, // Capture only the variable name before the dot
      },

      // Property paths in method conditionals (e.g., "user.profile" in "when user.profile.name.exists")
      {
        regex:
          /\bwhen\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)+)\s*\./g,
        tokenType: "variable",
        tokenModifiers: [FortifyTokenModifier.Declaration],
        captureGroup: 1, // Capture the full property path
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
        regex: new RegExp(FortifyPatterns.getArrayPattern().source, "g"),
        tokenType: "punctuation",
        tokenModifiers: [],
      },

      // Optional marker - use centralized pattern
      {
        regex: new RegExp(FortifyPatterns.getOptionalPattern().source, "g"),
        tokenType: "punctuation",
        tokenModifiers: [],
      },

      // Constraint parentheses - use centralized pattern
      {
        regex: new RegExp(FortifyPatterns.getConstraintPattern().source, "g"),
        tokenType: "punctuation",
        tokenModifiers: [],
      },
    ];

    // Apply each pattern to find and tokenize matches
    for (const pattern of patterns) {
      let match;
      pattern.regex.lastIndex = 0; // Reset regex state

      while ((match = pattern.regex.exec(schemaText)) !== null) {
        let matchStart: number;
        let matchLength: number;

        // Handle capture groups for more precise highlighting
        if (
          (pattern as any).captureGroup &&
          match[(pattern as any).captureGroup]
        ) {
          const captureGroup = (pattern as any).captureGroup;
          const captureMatch = match[captureGroup];
          const captureIndex = match[0].indexOf(captureMatch);
          matchStart = startOffset + match.index + captureIndex;
          matchLength = captureMatch.length;
        } else {
          matchStart = startOffset + match.index;
          matchLength = match[0].length;
        }

        // Convert absolute offset to line/character position
        const startPos = document.positionAt(matchStart);

        // Add token to builder
        tokensBuilder.push(
          startPos.line,
          startPos.character,
          matchLength,
          this.encodeTokenType(pattern.tokenType),
          this.encodeTokenModifiers(pattern.tokenModifiers)
        );
      }
    }
  }

  /**
   * Encode token type to legend index
   */
  private encodeTokenType(tokenType: string): number {
    const index =
      FortifySemanticTokensProvider.legend.tokenTypes.indexOf(tokenType);
    return index >= 0 ? index : 0; // Default to first type if not found
  }

  /**
   * Encode token modifiers to bitmask
   */
  private encodeTokenModifiers(modifiers: string[]): number {
    let result = 0;
    for (const modifier of modifiers) {
      const index =
        FortifySemanticTokensProvider.legend.tokenModifiers.indexOf(modifier);
      if (index >= 0) {
        result |= 1 << index;
      }
    }
    return result;
  }

  /**
   * Specialized tokenization for union types like "admin|user|guest"
   */
  private tokenizeUnions(
    document: vscode.TextDocument,
    schemaText: string,
    startOffset: number,
    tokensBuilder: vscode.SemanticTokensBuilder
  ): void {
    // Improved pattern to match union literals more accurately
    const unionPattern =
      /([a-zA-Z_][a-zA-Z0-9_]*)\s*\|\s*([a-zA-Z_][a-zA-Z0-9_]*(?:\s*\|\s*[a-zA-Z_][a-zA-Z0-9_]*)*)/g;
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

          tokensBuilder.push(
            startPos.line,
            startPos.character,
            part.trim().length,
            this.encodeTokenType("enumMember"),
            this.encodeTokenModifiers([FortifyTokenModifier.Static])
          );
        } else if (part.includes("|")) {
          // This is a separator
          const separatorIndex = part.indexOf("|");
          const separatorStart =
            matchStart + fullMatch.indexOf(part, currentIndex) + separatorIndex;
          const separatorPos = document.positionAt(separatorStart);

          tokensBuilder.push(
            separatorPos.line,
            separatorPos.character,
            1,
            this.encodeTokenType("operator"),
            this.encodeTokenModifiers([])
          );
        }

        currentIndex += part.length;
      }
    }

    // Also handle simple patterns like "word|word" that might be missed
    const simpleUnionPattern =
      /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\|\s*([a-zA-Z_][a-zA-Z0-9_]*)\b/g;
    let simpleMatch;

    while ((simpleMatch = simpleUnionPattern.exec(schemaText)) !== null) {
      // Skip if already processed by the main pattern
      if (unionPattern.lastIndex > simpleMatch.index) continue;

      const firstPart = simpleMatch[1];
      const secondPart = simpleMatch[2];
      const matchStart = startOffset + simpleMatch.index;

      // Token for first part
      const firstPos = document.positionAt(matchStart);
      tokensBuilder.push(
        firstPos.line,
        firstPos.character,
        firstPart.length,
        this.encodeTokenType("enumMember"),
        this.encodeTokenModifiers([FortifyTokenModifier.Static])
      );

      // Token for separator
      const separatorIndex = simpleMatch[0].indexOf("|");
      const separatorPos = document.positionAt(matchStart + separatorIndex);
      tokensBuilder.push(
        separatorPos.line,
        separatorPos.character,
        1,
        this.encodeTokenType("operator"),
        this.encodeTokenModifiers([])
      );

      // Token for second part
      const secondStart = matchStart + simpleMatch[0].lastIndexOf(secondPart);
      const secondPos = document.positionAt(secondStart);
      tokensBuilder.push(
        secondPos.line,
        secondPos.character,
        secondPart.length,
        this.encodeTokenType("enumMember"),
        this.encodeTokenModifiers([FortifyTokenModifier.Static])
      );
    }
  }
}
