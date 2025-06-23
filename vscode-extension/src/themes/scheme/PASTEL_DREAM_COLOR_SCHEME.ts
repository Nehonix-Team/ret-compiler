import { FortifyColorScheme } from "../color.scheme";

// Pastel dream scheme - soft and aesthetic 🌸✨
export const PASTEL_DREAM_COLOR_SCHEME: FortifyColorScheme = {
  name: "pasteldream",
  description: "Soft pastel colors for comfortable long coding sessions",
  colors: {
    // Core types - pastel blue family
    basicType: "#93C5FD", // Light blue
    formatType: "#BFDBFE", // Very light blue
    numericType: "#60A5FA", // Medium blue

    // Conditional syntax - pastel pink family
    conditionalKeyword: "#F9A8D4", // Light pink
    conditionalOperator: "#FBCFE8", // Very light pink
    logicalOperator: "#EC4899", // Pink
    comparisonOperator: "#FDF2F8", // Lightest pink

    // Methods - pastel green family
    method: "#86EFAC", // Light green
    methodCall: "#4ADE80", // Green

    // Values - pastel purple family
    constant: "#C4B5FD", // Light violet
    unionSeparator: "#DDD6FE", // Very light violet

    // Structural - pastel gray family
    constraint: "#D1D5DB", // Light gray
    array: "#E5E7EB", // Very light gray
    optional: "#A78BFA", // Light violet

    // Literals
    numericLiteral: "#34D399", // Emerald
    stringLiteral: "#FBBF24", // Amber
    variable: "#E57373", // Soft red for variables in conditionals - distinctive and readable
  },
};

