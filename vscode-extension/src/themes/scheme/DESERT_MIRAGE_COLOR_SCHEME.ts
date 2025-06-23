import { FortifyColorScheme } from "../color.scheme";

// 4. Desert Mirage - Warm earth tones with mystical accents
export const DESERT_MIRAGE_COLOR_SCHEME: FortifyColorScheme = {
  name: "desert-mirage",
  description:
    "Mystical desert theme with warm earth tones and mirage-like shimmer",
  colors: {
    basicType: "#D4A574", // Sand dune
    formatType: "#C9A96E", // Desert gold
    numericType: "#B7950B", // Brass

    conditionalKeyword: "#8B4513", // Saddle brown
    conditionalOperator: "#FF6347", // Terracotta
    logicalOperator: "#CD853F", // Peru
    comparisonOperator: "#DAA520", // Goldenrod

    method: "#F4A460", // Sandy brown
    methodCall: "#DEB887", // Burlywood

    constant: "#20B2AA", // Oasis teal
    unionSeparator: "#A0522D", // Sienna

    constraint: "#8FBC8F", // Dark sea green
    array: "#696969", // Dim gray
    optional: "#9370DB", // Medium purple

    numericLiteral: "#00CED1", // Dark turquoise
    stringLiteral: "#FF69B4", // Hot pink
    variable: "#E57373", // Soft red for variables in conditionals - distinctive and readable
  },
};
