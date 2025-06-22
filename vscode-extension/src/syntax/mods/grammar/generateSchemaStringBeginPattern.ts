import { FortifySyntaxUtils } from "../../FortifySyntaxDefinitions";

/**
 * Generate the begin pattern for schema strings
 */
export function generateSchemaStringBeginPattern(): string {
  // Create a lookahead pattern that matches strings containing any Fortify syntax
  const typeNames = FortifySyntaxUtils.getAllTypeNames().join("|");
  const operators = ["when", "\\*\\?", "\\|", "=\\w+"];
  const methods = FortifySyntaxUtils.getAllMethodNames()
    .map((name: string) => `\\.${name}`)
    .join("|");

  const patterns = [
    typeNames,
    ...operators,
    methods,
    "\\[\\]", // Arrays
    "\\(\\d+,?\\d*\\)", // Constraints
  ];

  return `"(?=.*(?:${patterns.join("|")}).*")`;
}

/**
 * Generate the begin pattern for template literal schema strings
 */
export function generateSchemaTemplateBeginPattern(): string {
  // Create a lookahead pattern that matches template literals containing any Fortify syntax
  const typeNames = FortifySyntaxUtils.getAllTypeNames().join("|");
  const operators = ["when", "\\*\\?", "\\|", "=\\w+"];
  const methods = FortifySyntaxUtils.getAllMethodNames()
    .map((name: string) => `\\.${name}`)
    .join("|");

  const patterns = [
    typeNames,
    ...operators,
    methods,
    "\\[\\]", // Arrays
    "\\(\\d+,?\\d*\\)", // Constraints
    "\\$\\{[^}]*\\}", // Template literal expressions
  ];

  return "`(?=.*(?:" + patterns.join("|") + ").*`)";
}
