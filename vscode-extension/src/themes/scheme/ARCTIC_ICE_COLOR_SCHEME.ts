import { FortifyColorScheme } from "../color.scheme";

// ARCTIC ICE - Cool blues and whites
export const ARCTIC_ICE_COLOR_SCHEME: FortifyColorScheme = {
  name: "arcticicе",
  description: "Cool arctic theme with icy blues and crisp whites",
  colors: {
    // Core types - ice blue family
    basicType: "#B0E0E6", // Powder blue
    formatType: "#87CEEB", // Sky blue
    numericType: "#4682B4", // Steel blue
    
    // Conditional syntax - winter blue family
    conditionalKeyword: "#1E90FF", // Dodger blue
    conditionalOperator: "#E0F6FF", // Alice blue
    logicalOperator: "#00BFFF", // Deep sky blue
    comparisonOperator: "#F0F8FF", // Alice blue
    
    // Methods - frost blue family
    method: "#5F9EA0", // Cadet blue
    methodCall: "#708090", // Slate gray
    
    // Values - ice white family
    constant: "#F8F8FF", // Ghost white
    unionSeparator: "#E6E6FA", // Lavender
    
    // Structural - gray-blue family
    constraint: "#778899", // Light slate gray
    array: "#B0C4DE", // Light steel blue
    optional: "#2F4F4F", // Dark slate gray
    
    // Literals
    numericLiteral: "#87CEFA", // Light sky blue
    stringLiteral: "#E0FFFF", // Light cyan
  },
};
