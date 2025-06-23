import { FortifyColorScheme } from "../color.scheme";

// 1. OCEAN BREEZE - Cool blues and teals for a calm coding experience
export const OCEAN_BREEZE_COLOR_SCHEME: FortifyColorScheme = {
  name: "oceanbreeze",
  description: "Cool ocean blues and teals for a refreshing development experience",
  colors: {
    // Core types - ocean blue family
    basicType: "#0EA5E9", // Sky blue
    formatType: "#06B6D4", // Cyan
    numericType: "#0891B2", // Dark cyan
    
    // Conditional syntax - teal family
    conditionalKeyword: "#0D9488", // Teal
    conditionalOperator: "#67E8F9", // Light cyan
    logicalOperator: "#22D3EE", // Bright cyan
    comparisonOperator: "#A5F3FC", // Very light cyan
    
    // Methods - blue-green family
    method: "#0284C7", // Blue
    methodCall: "#0369A1", // Dark blue
    
    // Values - sea green family
    constant: "#059669", // Emerald
    unionSeparator: "#6EE7B7", // Light green
    
    // Structural - blue-gray family
    constraint: "#64748B", // Slate gray
    array: "#94A3B8", // Light slate
    optional: "#0F766E", // Dark teal
    
    // Literals
    numericLiteral: "#10B981", // Emerald
    stringLiteral: "#06B6D4", // Cyan
  },
};

