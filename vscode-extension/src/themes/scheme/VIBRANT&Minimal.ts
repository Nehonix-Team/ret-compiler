import { FortifyColorScheme } from "../color.scheme";

/**
 * Vibrant color scheme - more colorful and distinct
 */
export const DEFAULT_VIBRANT: FortifyColorScheme = {
  name: "vibrant",
  description: "Vibrant colors for better visual distinction",
  colors: {
    // Core types - bright and distinct
    basicType: "#4FC3F7", // Bright blue
    formatType: "#26C6DA", // Bright cyan
    numericType: "#FF9800", // Bright orange

    // Conditional syntax - purple/pink family
    conditionalKeyword: "#E91E63", // Bright pink for 'when'
    conditionalOperator: "#9C27B0", // Purple for *?
    logicalOperator: "#673AB7", // Deep purple for && ||
    comparisonOperator: "#3F51B5", // Indigo for = != etc

    // Methods - yellow/amber family
    method: "#FFC107", // Amber for methods
    methodCall: "#FF9800", // Orange for calls

    // Values - green family
    constant: "#4CAF50", // Green for constants
    variable: "#F44336", // Red for variables in conditionals
    unionSeparator: "#607D8B", // Blue gray for |

    // Structural - varied colors
    constraint: "#795548", // Brown for parentheses
    array: "#9E9E9E", // Gray for []
    optional: "#E91E63", // Pink for ?

    // Literals
    numericLiteral: "#8BC34A", // Light green
    stringLiteral: "#FF5722", // Deep orange
  },
};

/**
 * Minimal color scheme - subtle and clean
 */
export const DEFAULT_MINIMAL: FortifyColorScheme = {
  name: "minimal",
  description: "Minimal colors for a clean, distraction-free experience",
  colors: {
    // Core types - subtle blues
    basicType: "#6A9BD1", // Muted blue
    formatType: "#5BA3A3", // Muted teal
    numericType: "#8FA876", // Muted green

    // Conditional syntax - muted purples
    conditionalKeyword: "#A67CA6", // Muted purple
    conditionalOperator: "#999999", // Medium gray
    logicalOperator: "#7A8FA8", // Muted blue
    comparisonOperator: "#888888", // Dark gray

    // Methods - muted yellows
    method: "#B8A965", // Muted yellow
    methodCall: "#B8A965", // Same as method

    // Values - muted greens
    constant: "#8FA876", // Muted green
    variable: "#C67C7C", // Muted red for variables in conditionals
    unionSeparator: "#777777", // Dark gray

    // Structural - grays
    constraint: "#666666", // Medium gray
    array: "#888888", // Dark gray
    optional: "#A67CA6", // Muted purple

    // Literals
    numericLiteral: "#8FA876", // Muted green
    stringLiteral: "#B8956B", // Muted orange
  },
};
