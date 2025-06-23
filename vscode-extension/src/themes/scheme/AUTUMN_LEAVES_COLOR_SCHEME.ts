import { FortifyColorScheme } from "../color.scheme";

// 8. AUTUMN LEAVES - Warm browns and oranges
export const AUTUMN_LEAVES_COLOR_SCHEME: FortifyColorScheme = {
  name: "autumnleaves",
  description: "Warm autumn colors with browns, oranges, and golds",
  colors: {
    // Core types - brown family
    basicType: "#D2691E", // Chocolate
    formatType: "#CD853F", // Peru
    numericType: "#A0522D", // Sienna
    
    // Conditional syntax - red-brown family
    conditionalKeyword: "#B22222", // Fire brick
    conditionalOperator: "#F4A460", // Sandy brown
    logicalOperator: "#DC143C", // Crimson
    comparisonOperator: "#FFE4E1", // Misty rose
    
    // Methods - orange family
    method: "#FF8C00", // Dark orange
    methodCall: "#FF7F50", // Coral
    
    // Values - gold family
    constant: "#DAA520", // Goldenrod
    unionSeparator: "#F0E68C", // Khaki
    
    // Structural - tan family
    constraint: "#BC8F8F", // Rosy brown
    array: "#D2B48C", // Tan
    optional: "#8B4513", // Saddle brown
    
    // Literals
    numericLiteral: "#DEB887", // Burlywood
    stringLiteral: "#F4A460", // Sandy brown
  },
};

