import { FortifyColorScheme } from "../color.scheme";

// 9. Crystal Cave - Mystical theme with gem-like colors
export const CRYSTAL_CAVE_COLOR_SCHEME: FortifyColorScheme = {
  name: "crystal-cave",
  description:
    "Mystical underground theme with crystalline gems and mineral colors",
  colors: {
    basicType: "#9966CC", // Amethyst
    formatType: "#6A5ACD", // Slate blue
    numericType: "#4169E1", // Royal blue

    conditionalKeyword: "#FF1493", // Deep pink
    conditionalOperator: "#FF6347", // Tomato
    logicalOperator: "#32CD32", // Lime green
    comparisonOperator: "#FFD700", // Gold

    method: "#00FA9A", // Medium spring green
    methodCall: "#00FF7F", // Spring green

    constant: "#FF69B4", // Hot pink
    unionSeparator: "#C0C0C0", // Silver

    constraint: "#8A2BE2", // Blue violet
    array: "#483D8B", // Dark slate blue
    optional: "#DA70D6", // Orchid

    numericLiteral: "#00CED1", // Dark turquoise
    stringLiteral: "#FF1493", // Deep pink
    variable: "#E57373", // Soft red for variables in conditionals - distinctive and readable
  },
};
