import { FortifyColorScheme } from "../color.scheme";

// 7. DARK VOID - High contrast dark theme
export const DARK_VOID_COLOR_SCHEME: FortifyColorScheme = {
  name: "darkvoid",
  description: "High contrast dark theme with bright accents",
  colors: {
    // Core types - bright blue family
    basicType: "#00D4FF", // Bright cyan
    formatType: "#00A8CC", // Dark cyan
    numericType: "#0080A0", // Darker cyan
     variable: "#FF0000", // Red for variables in conditionals

    // Conditional syntax - bright orange family
    conditionalKeyword: "#FF8C00", // Dark orange
    conditionalOperator: "#FFA500", // Orange
    logicalOperator: "#FFB347", // Light orange
    comparisonOperator: "#FFCC80", // Very light orange
    
    // Methods - bright green family
    method: "#00FF80", // Bright green
    methodCall: "#00CC66", // Green
    
    // Values - bright purple family
    constant: "#CC99FF", // Light purple
    unionSeparator: "#B380FF", // Purple
    
    // Structural - gray family
    constraint: "#CCCCCC", // Light gray
    array: "#999999", // Gray
    optional: "#9966FF", // Purple
    
    // Literals
    numericLiteral: "#66FF99", // Light green
    stringLiteral: "#FFFF99", // Light yellow
  },
};