import { FortifyPatterns } from "../../FortifyPatterns";
import {
  generateSchemaStringBeginPattern,
  generateSchemaSingleQuoteBeginPattern,
  generateSchemaTemplateBeginPattern,
} from "./generateSchemaStringBeginPattern";

/**
 * Generate complete TextMate grammar for Fortify Schema
 */
export function generateFortifyGrammar(): any {
  return {
    name: "Nehonix Fortify Schema Embedded",
    scopeName: "source.ts.fortify",
    injectionSelector:
      "L:source.ts -comment -string, L:source.tsx -comment -string",
    patterns: [
      {
        include: "#fortify-schema-strings",
      },
    ],
    repository: {
      "fortify-schema-strings": {
        patterns: [
          // ENHANCED: Support double quotes
          {
            name: "string.quoted.double.fortify",
            begin: generateSchemaStringBeginPattern(),
            end: '"',
            beginCaptures: {
              "0": {
                name: "punctuation.definition.string.begin.fortify",
              },
            },
            endCaptures: {
              "0": {
                name: "punctuation.definition.string.end.fortify",
              },
            },
            patterns: [
              {
                include: "#fortify-conditional-syntax",
              },
              {
                include: "#fortify-basic-types",
              },
              {
                include: "#fortify-format-types",
              },
              {
                include: "#fortify-numeric-types",
              },
              {
                include: "#fortify-constraints",
              },
              {
                include: "#fortify-arrays",
              },
              {
                include: "#fortify-optional",
              },
              {
                include: "#fortify-unions",
              },
              {
                include: "#fortify-constants",
              },
              {
                include: "#fortify-methods",
              },
              {
                include: "#fortify-operators",
              },
            ],
          },
          // ENHANCED: Support single quotes
          {
            name: "string.quoted.single.fortify",
            begin: generateSchemaSingleQuoteBeginPattern(),
            end: "'",
            beginCaptures: {
              "0": {
                name: "punctuation.definition.string.begin.fortify",
              },
            },
            endCaptures: {
              "0": {
                name: "punctuation.definition.string.end.fortify",
              },
            },
            patterns: [
              {
                include: "#fortify-conditional-syntax",
              },
              {
                include: "#fortify-basic-types",
              },
              {
                include: "#fortify-format-types",
              },
              {
                include: "#fortify-numeric-types",
              },
              {
                include: "#fortify-constraints",
              },
              {
                include: "#fortify-arrays",
              },
              {
                include: "#fortify-optional",
              },
              {
                include: "#fortify-unions",
              },
              {
                include: "#fortify-constants",
              },
              {
                include: "#fortify-methods",
              },
              {
                include: "#fortify-operators",
              },
            ],
          },
          // ENHANCED: Support backticks (template literals)
          {
            name: "string.template.fortify",
            begin: generateSchemaTemplateBeginPattern(),
            end: "`",
            beginCaptures: {
              "0": {
                name: "punctuation.definition.string.begin.fortify",
              },
            },
            endCaptures: {
              "0": {
                name: "punctuation.definition.string.end.fortify",
              },
            },
            patterns: [
              {
                include: "#fortify-conditional-syntax",
              },
              {
                include: "#fortify-basic-types",
              },
              {
                include: "#fortify-format-types",
              },
              {
                include: "#fortify-numeric-types",
              },
              {
                include: "#fortify-constraints",
              },
              {
                include: "#fortify-arrays",
              },
              {
                include: "#fortify-optional",
              },
              {
                include: "#fortify-unions",
              },
              {
                include: "#fortify-constants",
              },
              {
                include: "#fortify-methods",
              },
              {
                include: "#fortify-operators",
              },
              {
                include: "#fortify-template-expressions",
              },
            ],
          },
        ],
      },
      "fortify-conditional-syntax": {
        patterns: [
          // ENHANCED: Complete conditional expression pattern (multi-line support)
          {
            name: "meta.conditional.fortify.complete",
            begin: "\\b(when)\\b",
            end: "(?=\\s*[,}\\]]|$)",
            beginCaptures: {
              "1": {
                name: "keyword.control.fortify.when",
              },
            },
            patterns: [
              // Conditional then operator (*?)
              {
                name: "keyword.operator.fortify.conditional-then",
                match: "\\*\\?",
              },
              // Conditional else separator (:)
              {
                name: "punctuation.separator.fortify.conditional-else",
                match: ":",
              },
              // Include condition patterns
              {
                include: "#fortify-conditional-condition",
              },
              // Include basic types for then/else parts
              {
                include: "#fortify-basic-types",
              },
              {
                include: "#fortify-format-types",
              },
              {
                include: "#fortify-numeric-types",
              },
              {
                include: "#fortify-constraints",
              },
              {
                include: "#fortify-arrays",
              },
              {
                include: "#fortify-unions",
              },
              {
                include: "#fortify-constants",
              },
            ],
          },
          // Standalone conditional operators (for better highlighting)
          {
            name: "keyword.operator.fortify.conditional-then",
            match: "\\*\\?",
          },
          {
            name: "punctuation.separator.fortify.conditional-else",
            match: ":",
          },
        ],
      },
      // ENHANCED: Conditional condition patterns
      "fortify-conditional-condition": {
        patterns: [
          // ENHANCED: Method calls with $ prefix (most specific first)
          {
            name: "meta.method-call.fortify.conditional",
            match: "\\$([a-zA-Z_][a-zA-Z0-9_]*)\\s*\\(",
            captures: {
              "1": {
                name: "support.function.fortify.method",
              },
            },
          },
          // ENHANCED: Property access with bracket notation and methods
          {
            name: "meta.property-access.fortify.conditional",
            match:
              "([a-zA-Z_$][a-zA-Z0-9_$]*(?:\\.[a-zA-Z_$][a-zA-Z0-9_$]*)*(?:\\[(?:[\"'][^\"']*[\"']|\\d+)\\])*)\\.\\$([a-zA-Z_$][a-zA-Z0-9_$]*)\\(([^)]*)\\)",
            captures: {
              "1": {
                name: "variable.other.property.fortify",
              },
              "2": {
                name: "support.function.fortify.method",
              },
              "3": {
                name: "meta.function-call.arguments.fortify",
              },
            },
          },
          // ENHANCED: Simple property access with methods
          {
            name: "meta.property-access.fortify.conditional",
            match:
              "([a-zA-Z_$][a-zA-Z0-9_$.]*)\\.\\$([a-zA-Z_$][a-zA-Z0-9_$]*)\\(([^)]*)\\)",
            captures: {
              "1": {
                name: "variable.other.property.fortify",
              },
              "2": {
                name: "support.function.fortify.method",
              },
              "3": {
                name: "meta.function-call.arguments.fortify",
              },
            },
          },
          // ENHANCED: Property names in conditions
          {
            name: "variable.other.property.fortify",
            match: "\\b([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\\s*[.\\[=!<>~])",
          },
          // ENHANCED: Comparison operators
          {
            name: "keyword.operator.fortify.comparison",
            match: "(!=|>=|<=|!~|=|>|<|~)",
          },
          // ENHANCED: Logical operators
          {
            name: "keyword.operator.fortify.logical",
            match: "(&&|\\|\\|)",
          },
          // ENHANCED: Property access dots
          {
            name: "keyword.operator.fortify.field-access",
            match: "\\.",
          },
          // ENHANCED: Bracket notation
          {
            name: "punctuation.definition.bracket.fortify",
            match: "[\\[\\]]",
          },
          // ENHANCED: Parentheses for method calls
          {
            name: "punctuation.definition.parameters.fortify",
            match: "[\\(\\)]",
          },
          // ENHANCED: String literals in conditions
          {
            name: "string.quoted.single.fortify.condition",
            match: "'[^']*'",
          },
          {
            name: "string.quoted.double.fortify.condition",
            match: '"[^"]*"',
          },
          // ENHANCED: Numbers in conditions
          {
            name: "constant.numeric.fortify.condition",
            match: "\\b\\d+(?:\\.\\d+)?\\b",
          },
        ],
      },
      "fortify-basic-types": {
        patterns: [
          {
            name: "string.quoted.double.fortify.basic-type",
            match: FortifyPatterns.getBasicTypePattern().source,
          },
        ],
      },
      "fortify-format-types": {
        patterns: [
          {
            name: "string.quoted.double.fortify.format-type",
            match: FortifyPatterns.getFormatTypePattern().source,
          },
        ],
      },
      "fortify-numeric-types": {
        patterns: [
          {
            name: "string.quoted.double.fortify.numeric-type",
            match: FortifyPatterns.getNumericTypePattern().source,
          },
        ],
      },
      "fortify-constraints": {
        patterns: [
          {
            name: "punctuation.definition.fortify.constraint",
            begin: "\\(",
            end: "\\)",
            patterns: [
              {
                name: "constant.numeric.fortify.constraint-value",
                match: "\\d+(?:\\.\\d+)?",
              },
              {
                name: "punctuation.separator.fortify.constraint",
                match: ",",
              },
            ],
          },
        ],
      },
      "fortify-arrays": {
        patterns: [
          {
            name: "punctuation.definition.fortify.array",
            match: FortifyPatterns.getArrayPattern().source.replace(/g$/, ""),
          },
        ],
      },
      "fortify-optional": {
        patterns: [
          {
            name: "punctuation.definition.fortify.optional",
            match: FortifyPatterns.getOptionalPattern().source.replace(
              /g$/,
              ""
            ),
          },
        ],
      },
      "fortify-unions": {
        patterns: [
          {
            name: "constant.other.fortify.union-separator",
            match: FortifyPatterns.getUnionPattern().source.replace(/g$/, ""),
          },
        ],
      },
      "fortify-constants": {
        patterns: [
          {
            name: "constant.other.fortify.constant-value",
            match: FortifyPatterns.getConstantPattern().source.replace(
              /g$/,
              ""
            ),
          },
        ],
      },
      "fortify-methods": {
        patterns: [
          {
            name: "support.function.fortify.method",
            match: FortifyPatterns.getMethodPattern().source,
          },
          {
            name: "punctuation.definition.fortify.method-call",
            begin: "\\(",
            end: "\\)",
            patterns: [
              {
                name: "string.unquoted.fortify.method-argument",
                match: "[^,)]+",
              },
              {
                name: "punctuation.separator.fortify.method-argument",
                match: ",",
              },
            ],
          },
        ],
      },
      "fortify-operators": {
        patterns: [
          {
            name: "keyword.operator.fortify.field-access",
            match: "\\.",
          },
        ],
      },
      "fortify-template-expressions": {
        patterns: [
          {
            name: "meta.embedded.expression.fortify",
            begin: "\\$\\{",
            end: "\\}",
            beginCaptures: {
              "0": {
                name: "punctuation.definition.template-expression.begin.fortify",
              },
            },
            endCaptures: {
              "0": {
                name: "punctuation.definition.template-expression.end.fortify",
              },
            },
            patterns: [
              {
                include: "source.ts",
              },
            ],
          },
        ],
      },
    },
  };
}
