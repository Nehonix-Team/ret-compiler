import { FortifyColorScheme } from "../color.scheme";

// 5. ROYAL PURPLE - Elegant purples and gold accents
export const ROYAL_PURPLE_COLOR_SCHEME: FortifyColorScheme = {
  name: "royalpurple",
  description:
    "Elegant royal purples with gold accents for sophisticated coding",
  colors: {
    // Core types - purple family
    basicType: "#8B5CF6", // Violet
    formatType: "#A78BFA", // Light violet
    numericType: "#7C3AED", // Dark violet

    // Conditional syntax - deep purple family
    conditionalKeyword: "#6D28D9", // Purple
    conditionalOperator: "#C4B5FD", // Very light violet
    logicalOperator: "#8B5CF6", // Violet
    comparisonOperator: "#E9D5FF", // Lightest violet

    // Methods - indigo family
    method: "#6366F1", // Indigo
    methodCall: "#4F46E5", // Dark indigo

    // Values - gold family
    constant: "#F59E0B", // Amber gold
    unionSeparator: "#FCD34D", // Light gold

    // Structural - purple-gray family
    constraint: "#6B7280", // Gray
    array: "#9CA3AF", // Light gray
    optional: "#581C87", // Very dark purple

    // Literals
    numericLiteral: "#D97706", // Amber
    stringLiteral: "#A855F7", // Purple
    variable: "#E57373", // Soft red for variables in conditionals - distinctive and readable
  },
};

