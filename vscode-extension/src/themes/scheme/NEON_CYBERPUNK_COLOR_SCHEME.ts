import { FortifyColorScheme } from "../color.scheme";

// 4. NEON CYBERPUNK - Electric colors for futuristic feel
export const NEON_CYBERPUNK_COLOR_SCHEME: FortifyColorScheme = {
  name: "neoncyberpunk",
  description: "Electric neon colors inspired by cyberpunk aesthetics",
  colors: {
    // Core types - electric blue family
    basicType: "#00F5FF", // Electric cyan
    formatType: "#00BFFF", // Deep sky blue
    numericType: "#1E90FF", // Dodger blue

    // Conditional syntax - neon pink family
    conditionalKeyword: "#FF1493", // Deep pink
    conditionalOperator: "#FF69B4", // Hot pink
    logicalOperator: "#FF6347", // Tomato
    comparisonOperator: "#FFB6C1", // Light pink

    // Methods - neon green family
    method: "#00FF7F", // Spring green
    methodCall: "#32CD32", // Lime green

    // Values - electric purple family
    constant: "#9370DB", // Medium purple
    unionSeparator: "#BA55D3", // Medium orchid

    // Structural - neon gray family
    constraint: "#C0C0C0", // Silver
    array: "#D3D3D3", // Light gray
    optional: "#8A2BE2", // Blue violet

    // Literals
    numericLiteral: "#00FF00", // Lime
    stringLiteral: "#FFFF00", // Yellow
    variable: "#E57373", // Soft red for variables in conditionals - distinctive and readable
  },
};
