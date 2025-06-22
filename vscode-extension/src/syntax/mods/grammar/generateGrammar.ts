import { FortifyPatterns } from "../../FortifyPatterns";
import {
  generateSchemaStringBeginPattern,
  generateSchemaTemplateBeginPattern,
} from "./generateSchemaStringBeginPattern";

/**
 * Generate complete TextMate grammar for Fortify Schema
 */
export function generateFortifyGrammar(): any {
  return {
    name: "Fortify Schema Embedded",
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
          {
            name: "keyword.control.fortify.when",
            match: FortifyPatterns.getConditionalKeywordPattern().source,
          },
          {
            name: "keyword.operator.fortify.conditional-then",
            match: FortifyPatterns.getConditionalOperatorPattern().source,
          },
          {
            name: "punctuation.separator.fortify.conditional-else",
            match: ":",
          },
          {
            name: "keyword.operator.fortify.logical",
            match: FortifyPatterns.getLogicalOperatorPattern().source,
          },
          {
            name: "keyword.operator.fortify.comparison",
            match: FortifyPatterns.getComparisonOperatorPattern().source,
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
