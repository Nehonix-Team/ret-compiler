import { FortifyColorScheme } from "../color.scheme";

// 2. SUNSET FIRE - Warm oranges and reds for energy
export const SUNSET_FIRE_COLOR_SCHEME: FortifyColorScheme = {
  name: "sunsetfire",
  description: "Warm sunset colors with fiery oranges and deep reds",
  colors: {
    // Core types - orange family
    basicType: "#F97316", // Orange
    formatType: "#FB923C", // Light orange
    numericType: "#EA580C", // Dark orange
    
    // Conditional syntax - red family
    conditionalKeyword: "#DC2626", // Red
    conditionalOperator: "#FCA5A5", // Light red
    logicalOperator: "#EF4444", // Bright red
    comparisonOperator: "#FEE2E2", // Very light red
    
    // Methods - amber family
    method: "#D97706", // Amber
    methodCall: "#B45309", // Dark amber
    
    // Values - yellow family
    constant: "#EAB308", // Yellow
    unionSeparator: "#FDE047", // Light yellow
    
    // Structural - warm gray family
    constraint: "#78716C", // Stone
    array: "#A8A29E", // Light stone
    optional: "#C2410C", // Dark orange
    
    // Literals
    numericLiteral: "#F59E0B", // Amber
    stringLiteral: "#F97316", // Orange
  },
};
