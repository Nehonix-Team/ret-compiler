/**
 * Fortify Schema Pattern Generators
 *
 * Generates regex patterns and validation rules from centralized syntax definitions.
 * This ensures consistency across all extension features.
 */

import { FortifySyntaxUtils } from "./FortifySyntaxDefinitions";
import { FORTIFY_CONDITIONAL_KEYWORDS } from "./mods/definitions/CONDITIONAL_KEYWORDS";

// Re-export FortifySyntaxUtils for convenience
export { FortifySyntaxUtils };

export class FortifyPatterns {
  /**
   * Generate regex pattern for all valid types
   */
  static getTypePattern(): RegExp {
    const typeNames = FortifySyntaxUtils.getAllTypeNames();
    const pattern = `\\b(${typeNames.join("|")})\\b`;
    return new RegExp(pattern);
  }

  /**
   * Generate regex pattern for basic types
   */
  static getBasicTypePattern(): RegExp {
    const basicTypes = FortifySyntaxUtils.getTypesByCategory("basic");
    const pattern = `\\b(${basicTypes.map((t) => t.name).join("|")})\\b`;
    return new RegExp(pattern);
  }

  /**
   * Generate regex pattern for format types
   */
  static getFormatTypePattern(): RegExp {
    const formatTypes = FortifySyntaxUtils.getTypesByCategory("format");
    const pattern = `\\b(${formatTypes.map((t) => t.name).join("|")})\\b`;
    return new RegExp(pattern);
  }

  /**
   * Generate regex pattern for numeric types
   */
  static getNumericTypePattern(): RegExp {
    const numericTypes = FortifySyntaxUtils.getTypesByCategory("numeric");
    const pattern = `\\b(${numericTypes.map((t) => t.name).join("|")})\\b`;
    return new RegExp(pattern);
  }

  /**
   * Generate regex pattern for comparison operators
   */
  static getComparisonOperatorPattern(): RegExp {
    const comparisonOps =
      FortifySyntaxUtils.getOperatorsByCategory("comparison");
    // Sort by length (longest first) to avoid partial matches
    const symbols = comparisonOps
      .map((op) => op.symbol)
      .sort((a, b) => b.length - a.length)
      .map((symbol) => this.escapeRegex(symbol));
    const pattern = `(${symbols.join("|")})`;
    return new RegExp(pattern);
  }

  /**
   * Generate regex pattern for logical operators
   */
  static getLogicalOperatorPattern(): RegExp {
    const logicalOps = FortifySyntaxUtils.getOperatorsByCategory("logical");
    const symbols = logicalOps
      .map((op) => op.symbol)
      .map((symbol) => this.escapeRegex(symbol));
    const pattern = `(${symbols.join("|")})`;
    return new RegExp(pattern);
  }

  /**
   * Generate regex pattern for conditional operators
   */
  static getConditionalOperatorPattern(): RegExp {
    const conditionalOps =
      FortifySyntaxUtils.getOperatorsByCategory("conditional");
    const symbols = conditionalOps
      .map((op) => op.symbol)
      .map((symbol) => this.escapeRegex(symbol));
    const pattern = `(${symbols.join("|")})`;
    return new RegExp(pattern);
  }

  /**
   * Generate regex pattern for V2 method calls with $ prefix
   * ENHANCED: Support bracket notation and array indexing
   */
  static getMethodPattern(): RegExp {
    const methods = FortifySyntaxUtils.getAllMethodNames();

    // V2 syntax uses $method() format with enhanced property access
    const patterns = [
      `\\.\\$(${methods.join("|")})\\b`, // Standard: property.$method()
      `\\["[^"]*"\\]\\.\\$(${methods.join("|")})\\b`, // Bracket notation: ["property"].$method()
      `\\['[^']*'\\]\\.\\$(${methods.join("|")})\\b`, // Single quotes: ['property'].$method()
      `\\[\\d+\\]\\.\\$(${methods.join("|")})\\b`, // Array indexing: [0].$method()
    ];

    return new RegExp(`(${patterns.join("|")})`);
  }

  /**
   * Generate regex pattern for property access (bracket notation and array indexing)
   * ENHANCED: Support advanced property access patterns
   */
  static getPropertyAccessPattern(): RegExp {
    const patterns = [
      `\\["[^"]*"\\]`, // Bracket notation with double quotes: ["property-name"]
      `\\['[^']*'\\]`, // Bracket notation with single quotes: ['property-name']
      `\\[\\d+\\]`, // Array indexing: [0], [1], etc.
    ];

    return new RegExp(`(${patterns.join("|")})`);
  }

  /**
   * Generate regex pattern for conditional keywords
   */
  static getConditionalKeywordPattern(): RegExp {
    const keywords = FORTIFY_CONDITIONAL_KEYWORDS.map((kw) => kw.keyword);
    const pattern = `\\b(${keywords.join("|")})\\b`;
    return new RegExp(pattern);
  }

  /**
   * Generate regex pattern for constraints
   */
  static getConstraintPattern(): RegExp {
    return /\(([^)]*)\)/g;
  }

  /**
   * Generate regex pattern for arrays
   */
  static getArrayPattern(): RegExp {
    return /\[\](\([^)]*\))?/g;
  }

  /**
   * Generate regex pattern for optional markers
   */
  static getOptionalPattern(): RegExp {
    return /\?/g;
  }

  /**
   * Generate regex pattern for union separators
   */
  static getUnionPattern(): RegExp {
    return /\|/g;
  }

  /**
   * Generate regex pattern for constants
   */
  static getConstantPattern(): RegExp {
    return /=\w+/g;
  }

  /**
   * Generate comprehensive schema detection pattern
   * ENHANCED: Include bracket notation and array indexing patterns
   */
  static getSchemaDetectionPattern(): RegExp {
    const typePattern = this.getTypePattern().source;
    const constraintPattern = this.getConstraintPattern().source;
    const conditionalPattern = this.getConditionalKeywordPattern().source;
    const methodPattern = this.getMethodPattern().source;
    const propertyAccessPattern = this.getPropertyAccessPattern().source;

    const patterns = [
      typePattern,
      `${typePattern}\\s*${constraintPattern}`,
      "\\b\\w+\\s*\\|\\s*\\w+", // Union types
      "=\\w+", // Constants
      conditionalPattern,
      "\\*\\?", // Conditional then
      methodPattern,
      propertyAccessPattern, // ENHANCED: Bracket notation and array indexing
      "\\[\\]", // Arrays
    ];

    return new RegExp(`(${patterns.join("|")})`);
  }

  /**
   * Check if text contains Fortify schema syntax
   * Uses centralized type definitions for better extensibility
   */
  static containsSchemaPattern(text: string): boolean {
    // Be more specific to avoid false positives in source code
    // Only consider it a schema if it has specific patterns

    // Check for conditional patterns (must have "when" + "*?" + ":")
    if (text.includes("when") && text.includes("*?") && text.includes(":")) {
      return true;
    }

    // Check for union patterns (including invalid ones with "||" so they can be validated)
    if (text.includes("|")) {
      return true;
    }

    // Check for constants (starts with =)
    if (text.startsWith("=")) {
      return true;
    }

    // Get all valid type names dynamically from centralized definitions
    const allTypeNames = FortifySyntaxUtils.getAllTypeNames();
    const typeNamesPattern = allTypeNames.join("|");

    // Check for types with constraints or arrays using dynamic type list
    const typeWithConstraints = new RegExp(
      `^(${typeNamesPattern})(\\([^)]*\\)|\\[\\]|\\?)`
    );
    if (typeWithConstraints.test(text)) {
      return true;
    }

    // Check for simple valid types using dynamic type list
    const simpleTypes = new RegExp(`^(${typeNamesPattern})$`);
    if (simpleTypes.test(text)) {
      return true;
    }

    // Check for potential type names (single words that could be types)
    // This catches invalid types like "invalidtype" so they can be validated
    const potentialType = /^[a-zA-Z][a-zA-Z0-9]*(\?|\[\](\([^)]*\))?)?$/;
    if (potentialType.test(text)) {
      return true;
    }

    return false;
  }

  /**
   * Extract all schema-like strings from text
   */
  static extractSchemaStrings(text: string): Array<{
    value: string;
    start: number;
    end: number;
  }> {
    const results: Array<{ value: string; start: number; end: number }> = [];
    const stringRegex = /"([^"\\]|\\.)*"/g;
    let match;

    while ((match = stringRegex.exec(text)) !== null) {
      const stringValue = match[0].slice(1, -1); // Remove quotes
      if (this.containsSchemaPattern(stringValue)) {
        results.push({
          value: stringValue,
          start: match.index,
          end: match.index + match[0].length,
        });
      }
    }

    return results;
  }

  /**
   * Validate schema syntax
   */
  static validateSyntax(schema: string): {
    isValid: boolean;
    errors: Array<{ message: string; type: string }>;
  } {
    const errors: Array<{ message: string; type: string }> = [];

    // Check for unknown types
    const typeMatches = schema.match(/\b(\w+)(?:\?|\[\]|\([^)]*\))*/g);
    if (typeMatches) {
      for (const match of typeMatches) {
        const baseType = match.replace(/[\?\[\]()0-9,.\s]/g, "");
        if (baseType && !schema.includes("when") && baseType !== "when") {
          if (!FortifySyntaxUtils.isValidType(baseType)) {
            errors.push({
              message: `Unknown type: "${baseType}"`,
              type: "unknown-type",
            });
          }
        }
      }
    }

    // Check conditional syntax
    if (schema.includes("when")) {
      if (!schema.includes("*?")) {
        errors.push({
          message: 'Conditional syntax missing "*?" operator',
          type: "missing-conditional-then",
        });
      }
    }

    // Check for empty union values
    if (schema.includes("|")) {
      const unionParts = schema.split("|");
      for (const part of unionParts) {
        if (part.trim() === "") {
          errors.push({
            message: "Empty union value",
            type: "empty-union-value",
          });
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate TextMate grammar patterns
   */
  static generateTextMatePatterns(): any {
    return {
      "fortify-basic-types": {
        patterns: [
          {
            name: "string.quoted.double.fortify.basic-type",
            match: this.getBasicTypePattern().source,
          },
        ],
      },
      "fortify-format-types": {
        patterns: [
          {
            name: "string.quoted.double.fortify.format-type",
            match: this.getFormatTypePattern().source,
          },
        ],
      },
      "fortify-numeric-types": {
        patterns: [
          {
            name: "string.quoted.double.fortify.numeric-type",
            match: this.getNumericTypePattern().source,
          },
        ],
      },
      "fortify-conditional-keywords": {
        patterns: [
          {
            name: "keyword.control.fortify.when",
            match: this.getConditionalKeywordPattern().source,
          },
        ],
      },
      "fortify-conditional-operators": {
        patterns: [
          {
            name: "keyword.operator.fortify.conditional-then",
            match: this.getConditionalOperatorPattern().source,
          },
        ],
      },
      "fortify-comparison-operators": {
        patterns: [
          {
            name: "keyword.operator.fortify.comparison",
            match: this.getComparisonOperatorPattern().source,
          },
        ],
      },
      "fortify-logical-operators": {
        patterns: [
          {
            name: "keyword.operator.fortify.logical",
            match: this.getLogicalOperatorPattern().source,
          },
        ],
      },
      "fortify-methods": {
        patterns: [
          {
            name: "support.function.fortify.method",
            match: this.getMethodPattern().source,
          },
        ],
      },
    };
  }

  /**
   * Escape special regex characters
   */
  private static escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}
