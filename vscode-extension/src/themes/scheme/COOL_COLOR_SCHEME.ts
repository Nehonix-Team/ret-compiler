import { FortifyColorScheme } from "../color.scheme";

/**
 * @name cool
 * Cool-toned palette with excellent contrast and modern feel
 */

export const COOL_COLOR_SCHEME: FortifyColorScheme = {
  name: "cool",
  description: "Cool-toned palette with excellent contrast and modern feel",
  colors: {
    // Core types - Cool blues and teals
    basicType: "#42A5F5", // Professional blue
    formatType: "#1DE9B6", // Bright teal - very distinctive
    numericType: "#8BC34A", // Fresh green

    // Conditional syntax - Purple and blue family
    conditionalKeyword: "#9C27B0", // Deep purple - authoritative
    conditionalOperator: "#FF5722", // Red-orange - high contrast
    logicalOperator: "#3F51B5", // Deep blue - professional
    comparisonOperator: "#FF9800", // Orange - warm accent in cool palette

    // Methods - Bright yellows
    method: "#FFC107", // Amber - bright but not harsh
    methodCall: "#FFB300", // Deeper amber

    // Values - Cool greens and grays
    constant: "#4CAF50", // Clean green
    unionSeparator: "#607D8B", // Blue-gray - sophisticated

    // Structural - Refined cool grays
    constraint: "#546E7A", // Dark blue-gray
    array: "#90A4AE", // Light blue-gray
    optional: "#9575CD", // Soft purple

    // Literals
    numericLiteral: "#689F38", // Darker green - good contrast
    stringLiteral: "#FF7043", // Coral-orange
  },
};
