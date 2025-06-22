import * as vscode from "vscode";
import { FortifyPatterns } from "../syntax/FortifyPatterns";
import { FortifySyntaxUtils } from "../syntax/FortifySyntaxDefinitions";

/**
 * Provides diagnostics for Fortify Schema strings in TypeScript/JavaScript files.
 * Validates schema syntax with a focus on simplicity and accuracy, ensuring a
 * TypeScript-like experience that's easier than alternatives like Zod.
 */
export class FortifyDiagnosticsProvider {
  private diagnosticCollection: vscode.DiagnosticCollection;

  constructor() {
    this.diagnosticCollection =
      vscode.languages.createDiagnosticCollection("fortify-schema");
  }

  /**
   * Updates diagnostics for the given document by analyzing Fortify Schema strings.
   * @param document The text document to analyze
   */
  public updateDiagnostics(document: vscode.TextDocument): void {
    if (!["typescript", "javascript"].includes(document.languageId)) {
      return;
    }

    const diagnostics: vscode.Diagnostic[] = [];
    const text = document.getText();
    const schemaStrings = this.extractSchemaStrings(text, document);

    for (const { value, range } of schemaStrings) {
      diagnostics.push(...this.validateSchemaString(value, range));
    }

    this.diagnosticCollection.set(document.uri, diagnostics);
  }

  /**
   * Validate a document and show results
   */
  validateDocument(document: vscode.TextDocument): void {
    this.updateDiagnostics(document);

    const diagnostics = this.diagnosticCollection.get(document.uri) || [];
    const errorCount = diagnostics.filter(
      (d) => d.severity === vscode.DiagnosticSeverity.Error
    ).length;
    const warningCount = diagnostics.filter(
      (d) => d.severity === vscode.DiagnosticSeverity.Warning
    ).length;

    if (errorCount === 0 && warningCount === 0) {
      vscode.window.showInformationMessage(
        "✅ No Fortify Schema issues found!"
      );
    } else {
      vscode.window.showWarningMessage(
        `Found ${errorCount} error(s) and ${warningCount} warning(s) in Fortify Schema`
      );
    }
  }

  /**
   * Dispose of the diagnostic collection
   */
  dispose(): void {
    this.diagnosticCollection.dispose();
  }

  /**
   * Extracts Fortify Schema strings from the document, ensuring only strings within
   * Interface({...}) blocks are considered for validation.
   * @param text The document text
   * @param document The VS Code text document
   * @returns Array of schema strings with their ranges
   */
  private extractSchemaStrings(
    text: string,
    document: vscode.TextDocument
  ): Array<{ value: string; range: vscode.Range }> {
    const results: Array<{ value: string; range: vscode.Range }> = [];

    // Find all Interface({...}) blocks in the document
    const interfaceBlocks = this.findInterfaceBlocks(text);

    if (interfaceBlocks.length === 0) {
      return results; // No Interface blocks found, no validation needed
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

          // Within Interface blocks, validate all strings that could be schemas
          if (this.couldBeSchemaString(stringValue)) {
            const startPos = new vscode.Position(lineIndex, match.index);
            const endPos = new vscode.Position(
              lineIndex,
              match.index + match[0].length
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
   * Finds all Interface({...}) blocks in the text and returns their line ranges.
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
   * Finds the end of a block starting from the given line by matching braces.
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
   * Checks if a line is within any of the Interface blocks.
   */
  private isLineInInterfaceBlock(lineIndex: number, blocks: Array<{ start: number; end: number }>): boolean {
    return blocks.some(block => lineIndex >= block.start && lineIndex <= block.end);
  }

  /**
   * Determines if a string could potentially be a Fortify schema string.
   * More permissive than the original containsSchemaPattern for Interface contexts.
   */
  private couldBeSchemaString(value: string): boolean {
    // Skip obvious non-schema strings
    if (value.length === 0 || value.length > 200) {
      return false;
    }

    // Skip URLs, file paths, and other obvious non-schema patterns
    if (value.startsWith('http') || value.startsWith('/') || value.includes('\\')) {
      return false;
    }

    // Skip very long strings that are clearly not schemas
    if (value.includes(' ') && value.length > 50) {
      return false;
    }

    // Within Interface blocks, be more permissive - validate most short strings
    return true;
  }

  /**
   * Validates a Fortify Schema string, delegating to specific validation methods
   * based on schema type (conditional, union, constant, or regular).
   * @param schema The schema string to validate
   * @param range The range of the schema string in the document
   * @returns Array of diagnostics
   */
  private validateSchemaString(
    schema: string,
    range: vscode.Range
  ): vscode.Diagnostic[] {
    const trimmedSchema = schema.trim();

    if (trimmedSchema.includes("when")) {
      return this.validateConditionalSchema(trimmedSchema, range);
    } else if (trimmedSchema.includes("|")) {
      return this.validateUnionSchema(trimmedSchema, range);
    } else if (trimmedSchema.startsWith("=")) {
      return this.validateConstantSchema(trimmedSchema, range);
    } else {
      return this.validateRegularSchema(trimmedSchema, range);
    }
  }

  /**
   * Validates a regular schema (e.g., "string", "number(1,10)", "string[]").
   * @param schema The schema string
   * @param range The range of the schema string
   * @returns Array of diagnostics
   */
  private validateRegularSchema(
    schema: string,
    range: vscode.Range
  ): vscode.Diagnostic[] {
    const diagnostics: vscode.Diagnostic[] = [];

    // Handle optional types (string?, number?, etc.)
    const optionalMatch = schema.match(/^(.+)\?$/);
    if (optionalMatch) {
      return this.validateRegularSchema(optionalMatch[1], range); // Validate base type without ?
    }

    // Handle array types with constraints (string[](1,10))
    const arrayConstraintMatch = schema.match(/^(\w+)\[\]\(([^)]*)\)$/);
    if (arrayConstraintMatch) {
      const [, type, constraints] = arrayConstraintMatch;

      // Validate base type
      if (!FortifySyntaxUtils.isValidType(type)) {
        diagnostics.push(
          new vscode.Diagnostic(
            range,
            `Unknown type: "${type}".`,
            vscode.DiagnosticSeverity.Error
          )
        );
      }

      // Validate array constraints
      diagnostics.push(
        ...this.validateConstraintSyntax(constraints, type, range)
      );
      return diagnostics;
    }

    // Handle simple array types (string[], number[])
    const arrayMatch = schema.match(/^(\w+)\[\]$/);
    if (arrayMatch) {
      const type = arrayMatch[1];
      if (!FortifySyntaxUtils.isValidType(type)) {
        diagnostics.push(
          new vscode.Diagnostic(
            range,
            `Unknown type: "${type}".`,
            vscode.DiagnosticSeverity.Error
          )
        );
      }
      return diagnostics;
    }

    // Handle types with constraints (string(1,10), number(0,100))
    const constraintMatch = schema.match(/^(\w+)\(([^)]*)\)$/);
    if (constraintMatch) {
      const [, type, constraints] = constraintMatch;

      // Validate base type
      if (!FortifySyntaxUtils.isValidType(type)) {
        diagnostics.push(
          new vscode.Diagnostic(
            range,
            `Unknown type: "${type}".`,
            vscode.DiagnosticSeverity.Error
          )
        );
      }

      // Validate constraints
      diagnostics.push(
        ...this.validateConstraintSyntax(constraints, type, range)
      );
      return diagnostics;
    }

    // Handle simple types (string, number, boolean) - but also catch invalid types
    const simpleMatch = schema.match(/^(\w+)$/);
    if (simpleMatch) {
      const type = simpleMatch[1];
      if (!FortifySyntaxUtils.isValidType(type)) {
        // For standalone schemas (not in unions), validate type names strictly
        // This catches "invalidtype" while allowing union literals like "admin"
        diagnostics.push(
          new vscode.Diagnostic(
            range,
            `Unknown type: "${type}".`,
            vscode.DiagnosticSeverity.Error
          )
        );
      }
      return diagnostics;
    }

    // If none of the patterns match, it's invalid syntax
    diagnostics.push(
      new vscode.Diagnostic(
        range,
        `Invalid schema syntax: "${schema}". Expected a type, type(constraints), type[], or type?`,
        vscode.DiagnosticSeverity.Error
      )
    );

    return diagnostics;
  }

  /**
   * Validates constraints (e.g., "(1,10)", "(/^[a-z]+$/)" for string).
   * @param constraints The constraint string
   * @param type The base type
   * @param range The range of the schema string
   * @returns Array of diagnostics
   */
  private validateConstraintSyntax(
    constraints: string,
    type: string,
    range: vscode.Range
  ): vscode.Diagnostic[] {
    const diagnostics: vscode.Diagnostic[] = [];

    // Handle regex constraints for strings (e.g., /^[a-z]+$/)
    if (type === "string" && constraints.startsWith("/")) {
      return this.validateRegexPatterns(constraints, range);
    }

    // Handle numeric constraints (e.g., number(1,10), positive(0.01,))
    const params = constraints.split(",").map((p) => p.trim());
    for (const param of params) {
      // Allow empty params (for open ranges like "0.01," or ",100")
      if (param && !/^\d*\.?\d*$/.test(param)) {
        diagnostics.push(
          new vscode.Diagnostic(
            range,
            `Invalid constraint: "${param}". Expected a number or decimal.`,
            vscode.DiagnosticSeverity.Error
          )
        );
      }
    }

    return diagnostics;
  }

  /**
   * Validates regex patterns in constraints (e.g., "string(/^[a-z]+$/)" ).
   * @param constraints The constraint string
   * @param range The range of the schema string
   * @returns Array of diagnostics
   */
  private validateRegexPatterns(
    constraints: string,
    range: vscode.Range
  ): vscode.Diagnostic[] {
    const diagnostics: vscode.Diagnostic[] = [];

    // Handle regex patterns like /^[a-z]+$/ or /^[a-z]+$/flags
    const regexPattern = /^\/(.*)\/([gimsuy]*)$/;
    const match = constraints.match(regexPattern);

    if (!match) {
      diagnostics.push(
        new vscode.Diagnostic(
          range,
          `Invalid regex constraint: "${constraints}". Expected /pattern/ or /pattern/flags.`,
          vscode.DiagnosticSeverity.Error
        )
      );
      return diagnostics;
    }

    const [, regexContent, flags] = match;
    try {
      new RegExp(regexContent, flags);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Invalid regex pattern";
      diagnostics.push(
        new vscode.Diagnostic(
          range,
          `Invalid regex pattern: /${regexContent}/${flags}. ${errorMessage}`,
          vscode.DiagnosticSeverity.Error
        )
      );
    }

    return diagnostics;
  }

  /**
   * Validates union schemas (e.g., "admin|user|guest").
   * @param schema The schema string
   * @param range The range of the schema string
   * @returns Array of diagnostics
   */
  private validateUnionSchema(
    schema: string,
    range: vscode.Range
  ): vscode.Diagnostic[] {
    const diagnostics: vscode.Diagnostic[] = [];

    // Check for double pipes (||) which is invalid in union syntax
    const doublePipeRegex = /\|\|/;
    if (doublePipeRegex.test(schema)) {
      diagnostics.push(
        new vscode.Diagnostic(
          range,
          'Invalid union syntax: "||" is not allowed. Use single "|" for unions. Double "||" is only for conditional logic.',
          vscode.DiagnosticSeverity.Error
        )
      );
      return diagnostics;
    }

    const parts = schema.split("|").map((p) => p.trim());

    for (const part of parts) {
      if (part === "") {
        diagnostics.push(
          new vscode.Diagnostic(
            range,
            'Empty union value. Remove extra "|" or add missing value.',
            vscode.DiagnosticSeverity.Error
          )
        );
        continue;
      }

      // Allow constants and literals without type validation
      if (part.startsWith("=") || this.isLiteralValue(part)) {
        continue; // Literals and constants are valid
      }

      // Validate as type
      diagnostics.push(...this.validateRegularSchema(part, range));
    }

    return diagnostics;
  }

  /**
   * Determines if a value is a valid literal for union types.
   * Production-ready logic that properly categorizes values for real-world usage.
   * @param value The value to check
   * @returns True if the value should be treated as a literal (not validated as a type)
   */
  private isLiteralValue(value: string): boolean {
    // If it's a known valid type, validate it as a type, not a literal
    if (FortifySyntaxUtils.isValidType(value)) {
      return false;
    }

    // For union syntax: treat everything else as literals
    // Simple rule: admin, user, guest, dark, us, etc. are all valid literals
    // Only validate basic pattern for safety
    return /^[a-zA-Z][a-zA-Z0-9_.-]*$/.test(value);
  }

  /**
   * Validates constant schemas (e.g., "=active", "=1.0", "=default?").
   * @param schema The schema string
   * @param range The range of the schema string
   * @returns Array of diagnostics
   */
  private validateConstantSchema(
    schema: string,
    range: vscode.Range
  ): vscode.Diagnostic[] {
    const diagnostics: vscode.Diagnostic[] = [];

    // Allow constants with alphanumeric, dots, underscores, and optional ? at the end
    if (!schema.match(/^=[a-zA-Z0-9_.]+\??$/)) {
      diagnostics.push(
        new vscode.Diagnostic(
          range,
          `Invalid constant: "${schema}". Expected "=value" or "=value?".`,
          vscode.DiagnosticSeverity.Error
        )
      );
    }
    return diagnostics;
  }

  /**
   * Validates conditional schemas (e.g., "when role=admin *? string[] : string[]?").
   * @param schema The schema string
   * @param range The range of the schema string
   * @returns Array of diagnostics
   */
  private validateConditionalSchema(
    schema: string,
    range: vscode.Range
  ): vscode.Diagnostic[] {
    const diagnostics: vscode.Diagnostic[] = [];

    // Find the first *? to split condition from then/else
    const firstThenIndex = schema.indexOf("*?");
    if (firstThenIndex === -1) {
      diagnostics.push(
        new vscode.Diagnostic(
          range,
          `Invalid conditional schema: "${schema}". Missing "*?" operator.`,
          vscode.DiagnosticSeverity.Error
        )
      );
      return diagnostics;
    }

    const condition = schema.substring(0, firstThenIndex).trim();
    const thenElsePart = schema.substring(firstThenIndex + 2).trim();

    // For nested conditionals, we need to be more flexible with the : splitting
    // Find the first : that's not part of a nested conditional
    let colonIndex = -1;
    let depth = 0;
    for (let i = 0; i < thenElsePart.length; i++) {
      if (thenElsePart.substring(i).startsWith("when")) {
        depth++;
      } else if (thenElsePart[i] === ":" && depth === 0) {
        colonIndex = i;
        break;
      } else if (thenElsePart.substring(i).startsWith("*?")) {
        depth--;
        i++; // Skip the next character
      }
    }

    if (colonIndex === -1) {
      diagnostics.push(
        new vscode.Diagnostic(
          range,
          `Invalid conditional schema: "${schema}". Missing ":" separator.`,
          vscode.DiagnosticSeverity.Error
        )
      );
      return diagnostics;
    }

    const thenPart = thenElsePart.substring(0, colonIndex).trim();
    const elsePart = thenElsePart.substring(colonIndex + 1).trim();

    // Validate condition
    diagnostics.push(...this.validateConditionalOperators(condition, range));

    // Validate then and else schemas (recursively for nested conditionals)
    diagnostics.push(...this.validateSchemaString(thenPart, range));
    diagnostics.push(...this.validateSchemaString(elsePart, range));

    return diagnostics;
  }

  /**
   * Validates operators and methods in conditional expressions.
   * @param condition The condition string
   * @param range The range of the schema string
   * @returns Array of diagnostics
   */
  private validateConditionalOperators(
    condition: string,
    range: vscode.Range
  ): vscode.Diagnostic[] {
    const diagnostics: vscode.Diagnostic[] = [];

    // Remove "when " prefix if present
    const cleanCondition = condition.replace(/^when\s+/, "");

    // Check for method calls like field.method() or field.!method()
    // But exclude patterns like email~@company.com where .com is part of a domain
    const methodMatch = cleanCondition.match(/(\w+)\.(!?)(\w+)(\([^)]*\))?/);
    if (methodMatch) {
      const [fullMatch, , isNegated, method, hasParens] = methodMatch;

      // Skip if this is part of a domain pattern (preceded by @ or ~)
      const beforeMatch = cleanCondition.substring(
        0,
        cleanCondition.indexOf(fullMatch)
      );
      if (beforeMatch.includes("@") || beforeMatch.endsWith("~")) {
        // This is part of a pattern like email~@company.com, not a method call
        return diagnostics;
      }
      const validMethods = FortifySyntaxUtils.getAllMethodNames();

      if (!validMethods.includes(method)) {
        diagnostics.push(
          new vscode.Diagnostic(
            range,
            `Unknown method: "${method}". Expected one of ${validMethods.join(", ")}.`,
            vscode.DiagnosticSeverity.Error
          )
        );
      }

      // Validate method arguments if parentheses are present
      if (hasParens) {
        const args = hasParens.slice(1, -1); // Remove parentheses
        const argList = args.split(",").map((a) => a.trim());

        // Allow literals, quoted strings, numbers, and domain-like patterns
        if (
          args &&
          argList.some(
            (arg) =>
              !this.isLiteralValue(arg) &&
              !arg.match(/^["'].*["']$/) &&
              !arg.match(/^\d+(\.\d+)?$/) &&
              !arg.match(/^\.[a-zA-Z0-9]+$/) && // Allow .com, .org, etc.
              !arg.match(/^[a-zA-Z0-9_.-]+$/) // Allow domain-like patterns
          )
        ) {
          diagnostics.push(
            new vscode.Diagnostic(
              range,
              `Invalid arguments in "${method}": "${args}". Expected literals, quoted strings, numbers, or patterns.`,
              vscode.DiagnosticSeverity.Error
            )
          );
        }
      }
      return diagnostics;
    }

    // Check for comparison operators (=, !=, >, <, >=, <=, ~, !~)
    const comparisonMatch = cleanCondition.match(
      /(\w+)\s*([!~=><]+|~|!~)\s*(.+)/
    );
    if (comparisonMatch) {
      const [, , operator, value] = comparisonMatch;

      // Validate regex patterns for ~ and !~ operators
      if (operator === "~" || operator === "!~") {
        // For patterns like email~@company.com, don't validate as regex
        if (!value.startsWith("/") && !value.endsWith("/")) {
          return diagnostics; // Allow pattern matching without regex validation
        }

        try {
          new RegExp(value.slice(1, -1)); // Remove / delimiters
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Invalid regex";
          diagnostics.push(
            new vscode.Diagnostic(
              range,
              `Invalid regex in condition: "${value}". ${errorMessage}`,
              vscode.DiagnosticSeverity.Error
            )
          );
        }
      }
      return diagnostics;
    }

    // Check for logical operators (&&, ||)
    if (cleanCondition.includes("&&") || cleanCondition.includes("||")) {
      // Split by logical operators and validate each part
      const parts = cleanCondition.split(/\s*(\&\&|\|\|)\s*/);
      for (let i = 0; i < parts.length; i += 2) {
        // Skip the operators
        const part = parts[i].trim();
        if (part) {
          const subDiagnostics = this.validateConditionalOperators(
            `when ${part}`,
            range
          );
          diagnostics.push(...subDiagnostics);
        }
      }
      return diagnostics;
    }

    // If no pattern matches, it might be invalid
    if (cleanCondition.trim()) {
      diagnostics.push(
        new vscode.Diagnostic(
          range,
          `Invalid condition: "${cleanCondition}". Expected field=value, field.method(), or field~pattern.`,
          vscode.DiagnosticSeverity.Warning
        )
      );
    }

    return diagnostics;
  }
}
