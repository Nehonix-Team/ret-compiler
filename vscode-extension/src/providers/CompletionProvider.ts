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
   * Provide completion items for Fortify Schema string
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

    // Check for @fortify-ignore completion in comments
    if (this.isInComment(beforeCursor)) {
      return this.getFortifyIgnoreCompletions(beforeCursor);
    }

    // Check if we're inside a string AND within an Interface({...}) block
    if (
      !this.isInSchemaString(beforeCursor) ||
      !this.isInInterfaceBlock(document, position)
    ) {
      return [];
    }

    const completions: vscode.CompletionItem[] = [];

    // Add type completions based on categories
    completions.push(...this.getTypeCompletions());

    // Add conditional completions if appropriate
    if (this.shouldShowConditionalCompletions(beforeCursor)) {
      completions.push(...this.getConditionalCompletions());
    }

    // ENHANCED: Add method completions for various syntax patterns
    if (this.shouldShowMethodCompletions(beforeCursor)) {
      completions.push(...this.getMethodCompletions());
    }

    // ENHANCED: Add bracket notation property completions
    if (this.shouldShowBracketPropertyCompletions(beforeCursor)) {
      completions.push(
        ...this.getBracketPropertyCompletions(document, position, beforeCursor)
      );
    }

    // Add property suggestions when typing property names in conditions
    if (this.shouldShowPropertySuggestions(beforeCursor)) {
      completions.push(
        ...this.getPropertySuggestions(document, position, beforeCursor)
      );
    }

    // Add nested property suggestions when typing after a dot
    if (this.shouldShowNestedPropertySuggestions(beforeCursor)) {
      completions.push(
        ...this.getNestedPropertySuggestions(document, position, beforeCursor)
      );
    }

    return completions;
  }

  /**
   * Check if cursor is inside a comment
   */
  private isInComment(text: string): boolean {
    // Check for single-line comment
    const singleLineComment = text.lastIndexOf("//");
    if (singleLineComment !== -1) {
      // Make sure we're not inside a string when the comment starts
      const beforeComment = text.substring(0, singleLineComment);
      const quoteCount = (beforeComment.match(/"/g) || []).length;
      if (quoteCount % 2 === 0) {
        // Even number means we're not inside quotes
        return true;
      }
    }

    // Check for multi-line comment
    const multiLineStart = text.lastIndexOf("/*");
    const multiLineEnd = text.lastIndexOf("*/");
    if (
      multiLineStart !== -1 &&
      (multiLineEnd === -1 || multiLineStart > multiLineEnd)
    ) {
      return true;
    }

    return false;
  }

  /**
   * Get @fortify-ignore completion items
   */
  private getFortifyIgnoreCompletions(
    beforeCursor: string
  ): vscode.CompletionItem[] {
    const completions: vscode.CompletionItem[] = [];

    // Check if user is typing @fortify or similar
    if (
      beforeCursor.includes("@fortify") ||
      beforeCursor.includes("@fort") ||
      beforeCursor.endsWith("@")
    ) {
      const ignoreItem = new vscode.CompletionItem(
        "@fortify-ignore",
        vscode.CompletionItemKind.Snippet
      );
      ignoreItem.detail = "Disable Fortify Schema validation for this line";
      ignoreItem.documentation = new vscode.MarkdownString(
        `**@fortify-ignore** - Disables Fortify Schema validation\n\n` +
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
          `\`\`\``
      );
      ignoreItem.insertText = new vscode.SnippetString("@fortify-ignore");
      ignoreItem.sortText = "0"; // Show at top of completion list
      completions.push(ignoreItem);

      // Also add the full comment version
      const commentItem = new vscode.CompletionItem(
        "// @fortify-ignore",
        vscode.CompletionItemKind.Snippet
      );
      commentItem.detail = "Add @fortify-ignore comment";
      commentItem.documentation = new vscode.MarkdownString(
        `**// @fortify-ignore** - Complete comment to disable validation\n\n` +
          `Adds a complete comment line to disable Fortify Schema validation for the next line.`
      );
      commentItem.insertText = new vscode.SnippetString("// @fortify-ignore");
      commentItem.sortText = "1";
      completions.push(commentItem);

      // Add multi-line comment version
      const multiLineItem = new vscode.CompletionItem(
        "/* @fortify-ignore */",
        vscode.CompletionItemKind.Snippet
      );
      multiLineItem.detail = "Add @fortify-ignore block comment";
      multiLineItem.documentation = new vscode.MarkdownString(
        `**/* @fortify-ignore */** - Block comment to disable validation\n\n` +
          `Adds a block comment to disable Fortify Schema validation.`
      );
      multiLineItem.insertText = new vscode.SnippetString(
        "/* @fortify-ignore */"
      );
      multiLineItem.sortText = "2";
      completions.push(multiLineItem);
    }

    return completions;
  }

  /**
   * Check if cursor is inside a potential schema string
   * ENHANCED: Support all quote types - double quotes, single quotes, and backticks
   */
  private isInSchemaString(text: string): boolean {
    // Check for double quotes
    const doubleQuoteCount = (text.match(/"/g) || []).length;
    if (doubleQuoteCount % 2 === 1) {
      return true; // Inside double quotes
    }

    // Check for single quotes (but not inside double quotes)
    const singleQuoteCount = (text.match(/'/g) || []).length;
    if (singleQuoteCount % 2 === 1) {
      return true; // Inside single quotes
    }

    // Check for backticks (template literals)
    const backtickCount = (text.match(/`/g) || []).length;
    if (backtickCount % 2 === 1) {
      return true; // Inside backticks
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
   * Check if we should show conditional completions
   */
  private shouldShowConditionalCompletions(text: string): boolean {
    return (
      text.normalize().trim().includes("when") ||
      text.normalize().trim().endsWith("when")
    );
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

      // Add constraint examples for numeric types
      if (
        type.name === "number" ||
        type.name === "int" ||
        type.name === "float"
      ) {
        // Add positive range example
        const positiveRangeItem = new vscode.CompletionItem(
          `${type.name}(0,100)`,
          vscode.CompletionItemKind.Snippet
        );
        positiveRangeItem.detail = `${type.category} with positive range constraint`;
        positiveRangeItem.documentation = new vscode.MarkdownString(
          `**${type.name}(min,max)** - ${type.description} with range constraint\n\n**Example:** \`"${type.name}(0,100)"\` - accepts values from 0 to 100`
        );
        positiveRangeItem.insertText = new vscode.SnippetString(
          `${type.name}(\${1:0},\${2:100})`
        );
        completions.push(positiveRangeItem);

        // Add negative range example
        const negativeRangeItem = new vscode.CompletionItem(
          `${type.name}(-90,90)`,
          vscode.CompletionItemKind.Snippet
        );
        negativeRangeItem.detail = `${type.category} with negative to positive range`;
        negativeRangeItem.documentation = new vscode.MarkdownString(
          `**${type.name}(min,max)** - ${type.description} with range including negative values\n\n**Example:** \`"${type.name}(-90,90)"\` - accepts values from -90 to 90 (useful for coordinates)`
        );
        negativeRangeItem.insertText = new vscode.SnippetString(
          `${type.name}(\${1:-90},\${2:90})`
        );
        completions.push(negativeRangeItem);

        // Add minimum only constraint
        const minOnlyItem = new vscode.CompletionItem(
          `${type.name}(0,)`,
          vscode.CompletionItemKind.Snippet
        );
        minOnlyItem.detail = `${type.category} with minimum value constraint`;
        minOnlyItem.documentation = new vscode.MarkdownString(
          `**${type.name}(min,)** - ${type.description} with minimum value only\n\n**Example:** \`"${type.name}(0,)"\` - accepts values >= 0`
        );
        minOnlyItem.insertText = new vscode.SnippetString(
          `${type.name}(\${1:0},)`
        );
        completions.push(minOnlyItem);

        // Add maximum only constraint
        const maxOnlyItem = new vscode.CompletionItem(
          `${type.name}(,100)`,
          vscode.CompletionItemKind.Snippet
        );
        maxOnlyItem.detail = `${type.category} with maximum value constraint`;
        maxOnlyItem.documentation = new vscode.MarkdownString(
          `**${type.name}(,max)** - ${type.description} with maximum value only\n\n**Example:** \`"${type.name}(,100)"\` - accepts values <= 100`
        );
        maxOnlyItem.insertText = new vscode.SnippetString(
          `${type.name}(,\${1:100})`
        );
        completions.push(maxOnlyItem);
      }

      // Add constraint examples for string types
      if (type.name === "string") {
        // Add length constraint example
        const lengthConstraintItem = new vscode.CompletionItem(
          "string(2,50)",
          vscode.CompletionItemKind.Snippet
        );
        lengthConstraintItem.detail = "String with length constraint";
        lengthConstraintItem.documentation = new vscode.MarkdownString(
          `**string(min,max)** - String with length constraint\n\n**Example:** \`"string(2,50)"\` - accepts strings with 2-50 characters`
        );
        lengthConstraintItem.insertText = new vscode.SnippetString(
          `string(\${1:2},\${2:50})`
        );
        completions.push(lengthConstraintItem);

        // Add minimum length only
        const minLengthItem = new vscode.CompletionItem(
          "string(1,)",
          vscode.CompletionItemKind.Snippet
        );
        minLengthItem.detail = "String with minimum length";
        minLengthItem.documentation = new vscode.MarkdownString(
          `**string(min,)** - String with minimum length only\n\n**Example:** \`"string(1,)"\` - accepts strings with at least 1 character`
        );
        minLengthItem.insertText = new vscode.SnippetString(`string(\${1:1},)`);
        completions.push(minLengthItem);

        // Add maximum length only
        const maxLengthItem = new vscode.CompletionItem(
          "string(,100)",
          vscode.CompletionItemKind.Snippet
        );
        maxLengthItem.detail = "String with maximum length";
        maxLengthItem.documentation = new vscode.MarkdownString(
          `**string(,max)** - String with maximum length only\n\n**Example:** \`"string(,100)"\` - accepts strings with up to 100 characters`
        );
        maxLengthItem.insertText = new vscode.SnippetString(
          `string(,\${1:100})`
        );
        completions.push(maxLengthItem);
      }

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
   * ENHANCED: Check if we should show method completions for various syntax patterns
   */
  private shouldShowMethodCompletions(text: string): boolean {
    return (
      text.endsWith(".$") || // Standard: property.$
      text.endsWith("$") || // Just $
      text.endsWith("].$") || // Bracket notation: ["property"].$
      text.endsWith("][0].$") || // Array indexing: ["property"][0].$
      /\[["'][^"']*["']\]\.$/.test(text) || // Bracket with quotes: ["prop"].$
      /\[\d+\]\.$/.test(text) // Array index: [0].$
    );
  }

  /**
   * ENHANCED: Check if we should show bracket property completions
   */
  private shouldShowBracketPropertyCompletions(text: string): boolean {
    return (
      text.endsWith('["') || // Double quote bracket: ["
      text.endsWith("['") || // Single quote bracket: ['
      /\w+\[["']$/.test(text) || // Property with bracket: config["
      /\w+\[["'][^"']*$/.test(text) // Partial property: config["admin
    );
  }

  /**
   * ENHANCED: Get bracket notation property completions
   */
  private getBracketPropertyCompletions(
    document: vscode.TextDocument,
    position: vscode.Position,
    beforeCursor: string
  ): vscode.CompletionItem[] {
    const completions: vscode.CompletionItem[] = [];

    // Extract the schema properties
    const schemaProperties = this.extractSchemaProperties(document, position);

    // Get the current typing context for bracket notation
    const typingContext = this.getBracketTypingContext(beforeCursor);

    // Add special character properties that are common in schemas
    const specialProperties = [
      "admin-override",
      "special config",
      "app.version",
      "user-settings",
      "api-key",
      "feature-flags",
      "cache-config",
      "db-connection",
      "auth-settings",
    ];

    // Combine schema properties with special properties
    const allProperties = [...schemaProperties, ...specialProperties];

    // Filter based on what user is typing
    const filteredProperties = allProperties.filter(
      (prop) =>
        typingContext === "" ||
        prop.toLowerCase().includes(typingContext.toLowerCase())
    );

    // Add property completions
    filteredProperties.forEach((property) => {
      const item = new vscode.CompletionItem(
        property,
        vscode.CompletionItemKind.Property
      );
      item.detail = `Bracket notation property: ${property}`;
      item.documentation = new vscode.MarkdownString(
        `**${property}** - Property accessible via bracket notation\n\n` +
          `**Usage examples:**\n` +
          `- \`config["${property}"].$exists()\` - Check if property exists\n` +
          `- \`config["${property}"].$empty()\` - Check if property is empty\n` +
          `- \`config["${property}"].$contains("value")\` - Check if contains value`
      );

      // Determine the quote character being used
      const quoteChar = beforeCursor.includes('["') ? '"' : "'";

      // Insert the property name with closing quote and bracket
      item.insertText = new vscode.SnippetString(`${property}${quoteChar}]`);

      // Set sort priority
      item.sortText = property
        .toLowerCase()
        .includes(typingContext.toLowerCase())
        ? `0${property}`
        : `1${property}`;

      completions.push(item);
    });

    return completions;
  }

  /**
   * Get typing context for bracket notation
   */
  private getBracketTypingContext(text: string): string {
    // Extract what the user is typing inside the brackets
    const bracketMatch = text.match(/\[["']([^"']*)$/);
    return bracketMatch ? bracketMatch[1] : "";
  }

  /**
   * Get V2 method completions with $ prefix
   */
  private getMethodCompletions(): vscode.CompletionItem[] {
    const completions: vscode.CompletionItem[] = [];

    for (const method of FORTIFY_METHODS) {
      // Add V2 method with $ prefix
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
      } else {
        // For methods without parameters, still add parentheses
        item.insertText = new vscode.SnippetString(`${method.name}()`);
      }

      completions.push(item);
    }

    return completions;
  }

  /**
   * Check if we should show property suggestions
   */
  private shouldShowPropertySuggestions(text: string): boolean {
    // Show property suggestions when we're in a conditional context
    // and typing after "when " but not in method context
    return (
      text.includes("when ") &&
      !text.endsWith(".$") &&
      !text.endsWith("$") &&
      !text.includes("*?") &&
      !text.includes(":") &&
      !this.isInNestedPropertyContext(text)
    );
  }

  /**
   * Check if we should show nested property suggestions
   */
  private shouldShowNestedPropertySuggestions(text: string): boolean {
    // Show nested property suggestions when we're in a conditional context
    // and typing after a property followed by a dot (but not .$)
    return (
      text.includes("when ") &&
      this.isInNestedPropertyContext(text) &&
      !text.endsWith(".$") &&
      !text.endsWith("$") &&
      !text.includes("*?") &&
      !text.includes(":")
    );
  }

  /**
   * Check if we're in a nested property context (property.something)
   */
  private isInNestedPropertyContext(text: string): boolean {
    // Look for pattern like "when property." or "when property.nested."
    const nestedMatch = text.match(
      /when\s+[a-zA-Z_$][a-zA-Z0-9_$]*\.[a-zA-Z0-9_$]*\.?$/
    );
    return !!nestedMatch;
  }

  /**
   * Get property suggestions based on context
   */
  private getPropertySuggestions(
    document: vscode.TextDocument,
    position: vscode.Position,
    beforeCursor: string
  ): vscode.CompletionItem[] {
    const completions: vscode.CompletionItem[] = [];

    // Extract the schema object to find available properties
    const schemaProperties = this.extractSchemaProperties(document, position);

    // Get the current typing context (what the user is typing)
    const typingContext = this.getTypingContext(beforeCursor);

    // Filter properties based on what user is typing
    const filteredProperties = schemaProperties.filter(
      (prop) =>
        typingContext === "" ||
        prop.toLowerCase().startsWith(typingContext.toLowerCase())
    );

    // Add property completions
    filteredProperties.forEach((property) => {
      const item = new vscode.CompletionItem(
        property,
        vscode.CompletionItemKind.Property
      );
      item.detail = `Schema property: ${property}`;
      item.documentation = new vscode.MarkdownString(
        `**${property}** - Property from the current schema object\n\n` +
          `**Usage examples:**\n` +
          `- \`${property}=${"value"}\` - Equality comparison\n` +
          `- \`${property}.$exists()\` - Check if property exists\n` +
          `- \`${property}.$empty()\` - Check if property is empty\n` +
          `- \`${property}.$contains("text")\` - Check if contains text`
      );

      // If user hasn't typed anything yet, suggest the property name only
      if (typingContext === "") {
        item.insertText = property;
      } else {
        // If user is typing, complete with method suggestion
        item.insertText = new vscode.SnippetString(
          `${property}$\${1|=,!=,>,>=,<,<=,.$exists(),.$empty(),.$null(),.$contains(),.$startsWith(),.$endsWith(),.$in()|}$2`
        );
      }

      // Set sort priority based on how well it matches
      if (property.toLowerCase().startsWith(typingContext.toLowerCase())) {
        item.sortText = `0${property}`; // Higher priority for exact matches
      } else {
        item.sortText = `1${property}`;
      }

      completions.push(item);
    });

    return completions;
  }

  /**
   * Get nested property suggestions based on context
   */
  private getNestedPropertySuggestions(
    document: vscode.TextDocument,
    position: vscode.Position,
    beforeCursor: string
  ): vscode.CompletionItem[] {
    const completions: vscode.CompletionItem[] = [];

    // Extract the property path being typed (e.g., "user.profile.")
    const propertyPath = this.getNestedPropertyPath(beforeCursor);
    if (!propertyPath) return completions;

    // Get the schema properties and try to infer nested structure
    const schemaProperties = this.extractSchemaProperties(document, position);
    const nestedProperties = this.inferNestedProperties(
      propertyPath,
      schemaProperties
    );

    // Get the current typing context
    const typingContext = this.getNestedTypingContext(beforeCursor);

    // Filter properties based on what user is typing
    const filteredProperties = nestedProperties.filter((prop) =>
      prop.toLowerCase().startsWith(typingContext.toLowerCase())
    );

    // Add nested property completions
    filteredProperties.forEach((property) => {
      const item = new vscode.CompletionItem(
        property,
        vscode.CompletionItemKind.Property
      );
      item.detail = `Nested property: ${propertyPath}.${property}`;
      item.documentation = new vscode.MarkdownString(
        `**${property}** - Nested property of \`${propertyPath}\`\n\n` +
          `Use with V2 methods: \`${propertyPath}.${property}.$exists()\`, \`${propertyPath}.${property}.$empty()\`, etc.`
      );

      // Add snippet for common usage
      item.insertText = new vscode.SnippetString(
        `${property}.$\${1|exists,empty,null,contains,startsWith,endsWith,between,in|}($2)`
      );

      completions.push(item);
    });

    return completions;
  }

  /**
   * Extract the property path from nested context (e.g., "user.profile" from "when user.profile.")
   */
  private getNestedPropertyPath(beforeCursor: string): string | null {
    const nestedMatch = beforeCursor.match(
      /when\s+([a-zA-Z_$][a-zA-Z0-9_$.]*)\.[a-zA-Z0-9_$]*$/
    );
    if (nestedMatch) {
      const fullPath = nestedMatch[1];
      // Remove the last incomplete part after the last dot
      const lastDotIndex = fullPath.lastIndexOf(".");
      return lastDotIndex > 0 ? fullPath.substring(0, lastDotIndex) : fullPath;
    }
    return null;
  }

  /**
   * Get what the user is currently typing for nested property suggestions
   */
  private getNestedTypingContext(beforeCursor: string): string {
    const nestedMatch = beforeCursor.match(/\.([a-zA-Z_$][a-zA-Z0-9_$]*)$/);
    return nestedMatch ? nestedMatch[1] : "";
  }

  /**
   * Infer nested properties based on common patterns and property path
   */
  private inferNestedProperties(
    propertyPath: string,
    schemaProperties: string[]
  ): string[] {
    // For now, return common nested property names based on the property name
    // In a real implementation, you might want to analyze the schema more deeply
    const commonNestedProperties: Record<string, string[]> = {
      user: ["id", "name", "email", "profile", "settings", "preferences"],
      profile: ["firstName", "lastName", "avatar", "bio", "dateOfBirth"],
      settings: ["theme", "language", "notifications", "privacy"],
      config: ["enabled", "value", "options", "metadata"],
      data: ["value", "type", "timestamp", "source"],
      address: ["street", "city", "state", "zipCode", "country"],
      contact: ["email", "phone", "address", "social"],
    };

    // Get the last part of the property path to determine context
    const pathParts = propertyPath.split(".");
    const lastPart = pathParts[pathParts.length - 1];

    // Return common properties for the context, or generic ones
    return (
      commonNestedProperties[lastPart] || [
        "id",
        "name",
        "value",
        "type",
        "enabled",
        "data",
        "config",
        "options",
      ]
    );
  }

  /**
   * Extract property names from the current schema object
   */
  private extractSchemaProperties(
    document: vscode.TextDocument,
    position: vscode.Position
  ): string[] {
    const properties: string[] = [];

    try {
      // Find the Interface({ ... }) block containing the current position
      const text = document.getText();
      const lines = text.split("\n");

      // Look for Interface({ pattern and extract properties
      let inInterfaceBlock = false;
      let braceCount = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Check if we're entering an Interface block
        // @fortify-ignore
        if (line.includes("Interface({")) {
          inInterfaceBlock = true;
          braceCount =
            (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
          continue;
        }

        if (inInterfaceBlock) {
          // Update brace count
          braceCount +=
            (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;

          // Extract property names from lines like: propertyName: "type",
          const propertyMatch = line.match(
            /^\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/
          );
          if (propertyMatch) {
            properties.push(propertyMatch[1]);
          }

          // Exit when we close the Interface block
          if (braceCount <= 0) {
            break;
          }
        }
      }
    } catch (error) {
      console.warn("Failed to extract schema properties:", error);
    }

    return properties;
  }

  /**
   * Get what the user is currently typing for property suggestions
   */
  private getTypingContext(beforeCursor: string): string {
    // Extract the word being typed after "when "
    const whenMatch = beforeCursor.match(/when\s+([a-zA-Z_$][a-zA-Z0-9_$]*)$/);
    if (whenMatch) {
      return whenMatch[1];
    }

    // Check if user just typed "when " with nothing after
    if (beforeCursor.endsWith("when ")) {
      return "";
    }

    return "";
  }
}
