import { FortifySyntaxUtils } from "../../FortifySyntaxDefinitions";

/**
 * Generate the begin pattern for schema strings
 */
export function generateSchemaStringBeginPattern(): string {
  // Create a lookahead pattern that matches strings containing any Fortify syntax
  const typeNames = FortifySyntaxUtils.getAllTypeNames().join("|");
  const operators = ["when", "\\*\\?", "\\|", "=\\w+"];
  const methods = FortifySyntaxUtils.getAllMethodNames()
    .map((name: string) => `\\.\\$${name}`)
    .join("|");

  const patterns = [
    typeNames,
    ...operators,
    methods,
    "\\[\\]", // Arrays
    "\\!", // Required markers
    "\\(\\d+,?\\d*\\)", // Numeric constraints like (1,10)
    "\\(\\/.*?\\/[gimsuy]*\\)", // Regex patterns like (/^v\\d+\\.\\d+$/)
  ];

  return `"(?=.*(?:${patterns.join("|")}).*")`;
}

/**
 * Generate the begin pattern for single quote schema strings
 * ENHANCED: Support single quotes for ReliantType strings
 */
export function generateSchemaSingleQuoteBeginPattern(): string {
  // Create a lookahead pattern that matches single-quoted strings containing any Fortify syntax
  const typeNames = FortifySyntaxUtils.getAllTypeNames().join("|");
  const operators = ["when", "\\*\\?", "\\|", "=\\w+"];
  const methods = FortifySyntaxUtils.getAllMethodNames()
    .map((name: string) => `\\.\\$${name}`)
    .join("|");

  const patterns = [
    typeNames,
    ...operators,
    methods,
    "\\[\\]", // Arrays
    "\\(\\d+,?\\d*\\)", // Numeric constraints like (1,10)
    "\\(\\/.*?\\/[gimsuy]*\\)", // Regex patterns like (/^v\\d+\\.\\d+$/)
  ];

  return `'(?=.*(?:${patterns.join("|")}).*')`;
}

/**
 * Generate the begin pattern for template literal schema strings
 */
export function generateSchemaTemplateBeginPattern(): string {
  // Create a lookahead pattern that matches template literals containing any Fortify syntax
  const typeNames = FortifySyntaxUtils.getAllTypeNames().join("|");
  const operators = ["when", "\\*\\?", "\\|", "=\\w+"];
  const methods = FortifySyntaxUtils.getAllMethodNames()
    .map((name: string) => `\\.\\$${name}`)
    .join("|");

  const patterns = [
    typeNames,
    ...operators,
    methods,
    "\\[\\]", // Arrays
    "\\!", // Required markers
    "\\(\\d+,?\\d*\\)", // Numeric constraints like (1,10)
    "\\(\\/.*?\\/[gimsuy]*\\)", // Regex patterns like (/^v\\d+\\.\\d+$/)
    "\\$\\{[^}]*\\}", // Template literal expressions
  ];

  return "`(?=.*(?:" + patterns.join("|") + ").*`)";
}
