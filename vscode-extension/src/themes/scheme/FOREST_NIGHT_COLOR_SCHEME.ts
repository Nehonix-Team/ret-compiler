import { FortifyColorScheme } from "../color.scheme";

// 3. FOREST NIGHT - Deep greens and earth tones
export const FOREST_NIGHT_COLOR_SCHEME: FortifyColorScheme = {
  name: "forestnight",
  description: "Deep forest greens with earthy tones for focused coding",
  colors: {
    // Core types - green family
    basicType: "#22C55E", // Green
    formatType: "#16A34A", // Dark green
    numericType: "#15803D", // Darker green
    
    // Conditional syntax - lime family
    conditionalKeyword: "#65A30D", // Lime
    conditionalOperator: "#BEF264", // Light lime
    logicalOperator: "#84CC16", // Bright lime
    comparisonOperator: "#ECFCCB", // Very light lime
    
    // Methods - emerald family
    method: "#059669", // Emerald
    methodCall: "#047857", // Dark emerald
    
    // Values - yellow-green family
    constant: "#A3A3A3", // Gray for contrast
    unionSeparator: "#D4D4AA", // Light olive
    
    // Structural - gray-green family
    constraint: "#6B7280", // Gray
    array: "#9CA3AF", // Light gray
    optional: "#166534", // Very dark green
    
    // Literals
    numericLiteral: "#22C55E", // Green
    stringLiteral: "#4ADE80", // Light green
  },
};

