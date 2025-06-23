import { FortifyColorScheme } from "../color.scheme";

// 7. Polar Aurora - Cool theme inspired by northern lights
export const POLAR_AURORA_COLOR_SCHEME: FortifyColorScheme = {
  name: "polar-aurora",
  description:
    "Cool polar theme with aurora borealis colors dancing across the code",
  colors: {
    basicType: "#00E5FF", // Cyan
    formatType: "#1DE9B6", // Teal
    numericType: "#64FFDA", // Aqua

    conditionalKeyword: "#7C4DFF", // Deep purple
    conditionalOperator: "#E040FB", // Magenta
    logicalOperator: "#3F51B5", // Indigo
    comparisonOperator: "#2196F3", // Blue

    method: "#FFEB3B", // Yellow
    methodCall: "#FFC107", // Amber

    constant: "#4CAF50", // Green
    unionSeparator: "#9E9E9E", // Gray

    constraint: "#FF5722", // Deep orange
    array: "#607D8B", // Blue gray
    optional: "#9C27B0", // Purple

    numericLiteral: "#00BCD4", // Cyan
    stringLiteral: "#FF4081", // Pink accent
  },
};
