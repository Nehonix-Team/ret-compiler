import { FortifyColorScheme } from "../color.scheme";

// 8. Copper Patina - Vintage industrial theme with copper and brass
export const COPPER_PATINA_COLOR_SCHEME: FortifyColorScheme = {
  name: "copper-patina",
  description:
    "Vintage industrial theme with aged copper, brass, and verdigris patina",
  colors: {
    basicType: "#B87333", // Copper
    formatType: "#CD7F32", // Bronze
    numericType: "#DAA520", // Goldenrod

    conditionalKeyword: "#2F4F4F", // Dark slate gray
    conditionalOperator: "#B22222", // Fire brick
    logicalOperator: "#708090", // Slate gray
    comparisonOperator: "#D2691E", // Chocolate

    method: "#FFD700", // Gold
    methodCall: "#FFA500", // Orange

    constant: "#40E0D0", // Turquoise (patina)
    unionSeparator: "#696969", // Dim gray

    constraint: "#2E8B57", // Sea green
    array: "#A0522D", // Sienna
    optional: "#9370DB", // Medium purple

    numericLiteral: "#20B2AA", // Light sea green
    stringLiteral: "#DC143C", // Crimson
  },
};
