import { FortifyColorScheme } from "../color.scheme";

// MATRIX GREEN - Classic terminal green theme
export const MATRIX_GREEN_COLOR_SCHEME: FortifyColorScheme = {
  name: "matrixgreen",
  description: "Classic terminal-inspired matrix green theme",
  colors: {
    // Core types - matrix green family
    basicType: "#00FF41", // Matrix green
    formatType: "#00CC33", // Dark matrix green
    numericType: "#008F11", // Darker green
    
    // Conditional syntax - bright green family
    conditionalKeyword: "#39FF14", // Neon green
    conditionalOperator: "#CCFFCC", // Very light green
    logicalOperator: "#00FF00", // Lime
    comparisonOperator: "#E6FFE6", // Lightest green
    
    // Methods - terminal green family
    method: "#00FF7F", // Spring green
    methodCall: "#32CD32", // Lime green
    
    // Values - phosphor green family
    constant: "#ADFF2F", // Green yellow
    unionSeparator: "#98FB98", // Pale green
    
    // Structural - console gray family
    constraint: "#C0C0C0", // Silver
    array: "#D3D3D3", // Light gray
    optional: "#006400", // Dark green
    
    // Literals
    numericLiteral: "#7FFF00", // Chartreuse
    stringLiteral: "#90EE90", // Light green
  },
};