import { FortifyColorScheme } from "../color.scheme";

// 2. Golden Hour - Warm, cozy theme inspired by sunset photography
export const GOLDEN_HOUR_COLOR_SCHEME: FortifyColorScheme = {
  name: "golden-hour",
  description:
    "Warm and cozy theme capturing the magic of golden hour lighting",
  colors: {
    basicType: "#F39C12", // Golden amber
    formatType: "#E67E22", // Burnt orange
    numericType: "#D35400", // Deep orange

    conditionalKeyword: "#8E44AD", // Royal purple
    conditionalOperator: "#E74C3C", // Sunset red
    logicalOperator: "#9B59B6", // Amethyst
    comparisonOperator: "#F39C12", // Gold

    method: "#F1C40F", // Sunflower yellow
    methodCall: "#F39C12", // Golden rod

    constant: "#2ECC71", // Emerald green
    unionSeparator: "#BDC3C7", // Silver

    constraint: "#34495E", // Dark slate
    array: "#7F8C8D", // Gray
    optional: "#E91E63", // Pink accent

    numericLiteral: "#16A085", // Teal
    stringLiteral: "#FF6B6B", // Coral pink
    variable: "#E57373", // Soft red for variables in conditionals - distinctive and readable
  },
};
