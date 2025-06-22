/**
 * Fortify Schema Completion Provider
 *
 * Provides intelligent autocompletion for Fortify Schema syntax
 * Uses centralized syntax definitions for maintainability
 */

import * as vscode from "vscode";
import { FORTIFY_TYPES } from "../syntax/mods/definitions/FORTIFY_TYPES";
import { FORTIFY_CONDITIONAL_KEYWORDS } from "../syntax/mods/definitions/CONDITIONAL_KEYWORDS";
import { FORTIFY_OPERATORS } from "../syntax/mods/definitions/OPERATORS";
import { FORTIFY_METHODS } from "../syntax/mods/definitions/FORTIFY_METHODS";

export class FortifyCompletionProvider
  implements vscode.CompletionItemProvider
{
  /**
   * Provide completion items for Fortify Schema
   */
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken,
    _context: vscode.CompletionContext
  ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    const line = document.lineAt(position);
    const lineText = line.text;
    const beforeCursor = lineText.substring(0, position.character);

    // Check if we're inside a string that looks like a schema definition
    if (!this.isInSchemaString(beforeCursor)) {
      return [];
    }

    const completions: vscode.CompletionItem[] = [];

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
   * Check if cursor is inside a potential schema string
   */
  private isInSchemaString(text: string): boolean {
    const quoteCount = (text.match(/"/g) || []).length;
    return quoteCount % 2 === 1; // Odd number means we're inside quotes
  }

  /**
   * Check if we should show conditional completions
   */
  private shouldShowConditionalCompletions(text: string): boolean {
    return text.includes("when ") || text.endsWith("when");
  }

  /**
   * Get all type completions from centralized definitions
   */
  private getTypeCompletions(): vscode.CompletionItem[] {
    const completions: vscode.CompletionItem[] = [];

    for (const type of FORTIFY_TYPES) {
      // Add required version
      const requiredItem = new vscode.CompletionItem(
        type.name,
        vscode.CompletionItemKind.TypeParameter
      );
      requiredItem.detail = `${type.category} type - ${type.description}`;
      requiredItem.documentation = new vscode.MarkdownString(
        `**${type.name}** - ${type.description}\n\n**Examples:**\n${type.examples.map((ex) => `\`${ex}\``).join(", ")}`
      );
      completions.push(requiredItem);

      // Add optional version if supported
      if (type.supportsOptional) {
        const optionalItem = new vscode.CompletionItem(
          `${type.name}?`,
          vscode.CompletionItemKind.TypeParameter
        );
        optionalItem.detail = `Optional ${type.category} type - ${type.description}`;
        optionalItem.documentation = new vscode.MarkdownString(
          `**${type.name}?** - Optional ${type.description}\n\n**Examples:**\n${type.examples.map((ex) => `\`${ex}?\``).join(", ")}`
        );
        completions.push(optionalItem);
      }

      // Add array version if supported
      if (type.supportsArrays) {
        const arrayItem = new vscode.CompletionItem(
          `${type.name}[]`,
          vscode.CompletionItemKind.TypeParameter
        );
        arrayItem.detail = `Array of ${type.category} type - ${type.description}`;
        arrayItem.documentation = new vscode.MarkdownString(
          `**${type.name}[]** - Array of ${type.description}\n\n**Examples:**\n\`"${type.name}[]"\`, \`"${type.name}[](1,10)"\``
        );
        completions.push(arrayItem);

        // Add optional array version
        if (type.supportsOptional) {
          const optionalArrayItem = new vscode.CompletionItem(
            `${type.name}[]?`,
            vscode.CompletionItemKind.TypeParameter
          );
          optionalArrayItem.detail = `Optional array of ${type.category} type - ${type.description}`;
          optionalArrayItem.documentation = new vscode.MarkdownString(
            `**${type.name}[]?** - Optional array of ${type.description}\n\n**Examples:**\n\`"${type.name}[]?"\`, \`"${type.name}[](1,10)?"\``
          );
          completions.push(optionalArrayItem);
        }
      }
    }

    return completions;
  }

  /**
   * Get conditional syntax completions from centralized definitions
   */
  private getConditionalCompletions(): vscode.CompletionItem[] {
    const completions: vscode.CompletionItem[] = [];

    // Add conditional keywords
    for (const keyword of FORTIFY_CONDITIONAL_KEYWORDS) {
      const item = new vscode.CompletionItem(
        keyword.keyword,
        vscode.CompletionItemKind.Keyword
      );
      item.detail = keyword.description;
      item.documentation = new vscode.MarkdownString(
        `**${keyword.keyword}** - ${keyword.description}\n\n**Syntax:**\n\`${keyword.syntax}\`\n\n**Examples:**\n${keyword.examples.map((ex) => `\`${ex}\``).join("\n")}`
      );
      completions.push(item);
    }

    // Add operators
    for (const operator of FORTIFY_OPERATORS) {
      if (
        operator.category === "comparison" ||
        operator.category === "logical" ||
        operator.category === "conditional"
      ) {
        const item = new vscode.CompletionItem(
          operator.symbol,
          vscode.CompletionItemKind.Operator
        );
        item.detail = `${operator.name} - ${operator.description}`;
        item.documentation = new vscode.MarkdownString(
          `**${operator.symbol}** - ${operator.description}\n\n**Examples:**\n${operator.examples.map((ex) => `\`${ex}\``).join("\n")}`
        );
        completions.push(item);
      }
    }

    return completions;
  }

  /**
   * Get method completions from centralized definitions
   */
  private getMethodCompletions(): vscode.CompletionItem[] {
    const completions: vscode.CompletionItem[] = [];

    for (const method of FORTIFY_METHODS) {
      // Add regular method
      const item = new vscode.CompletionItem( 
        method.name,
        vscode.CompletionItemKind.Method
      );
      item.detail = method.description;
      item.documentation = new vscode.MarkdownString(
        `**${method.name}** - ${method.description}\n\n**Syntax:**\n\`${method.syntax}\`\n\n**Examples:**\n${method.examples.map((ex) => `\`${ex}\``).join("\n")}`
      );

      // Add snippet for methods with parameters
      if (method.parameters.length > 0) {
        const paramSnippets = method.parameters
          .map((_, index) => `$${index + 1}`)
          .join(",");
        item.insertText = new vscode.SnippetString(
          `${method.name}(${paramSnippets})`
        );
      }

      completions.push(item);

      // Add negated version if supported
      if (method.supportsNegation) {
        const negatedItem = new vscode.CompletionItem(
          `!${method.name}`,
          vscode.CompletionItemKind.Method
        );
        negatedItem.detail = `Negated ${method.description}`;
        negatedItem.documentation = new vscode.MarkdownString(
          `**!${method.name}** - Negated ${method.description}\n\n**Syntax:**\n\`field.!${method.name}\`\n\n**Examples:**\n\`when field.!${method.name} *? type : type\``
        );

        if (method.parameters.length > 0) {
          const paramSnippets = method.parameters
            .map((_, index) => `$${index + 1}`)
            .join(",");
          negatedItem.insertText = new vscode.SnippetString(
            `!${method.name}(${paramSnippets})`
          );
        }

        completions.push(negatedItem);
      }
    }

    return completions;
  }
}
