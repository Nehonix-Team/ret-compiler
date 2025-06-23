import { FortifyColorScheme } from "../color.scheme";

// 1. Volcanic Ash - Dark, sophisticated theme with warm accents
export const VOLCANIC_ASH_COLOR_SCHEME: FortifyColorScheme = {
  name: "volcanic-ash",
  description:
    "Dark sophisticated theme with volcanic warm tones and ash-gray undertones",
  colors: {
    basicType: "#FF6B35", // Lava orange
    formatType: "#F7931E", // Molten gold
    numericType: "#C1666B", // Dusty rose

    conditionalKeyword: "#D4A574", // Warm sand
    conditionalOperator: "#FF4757", // Volcanic red
    logicalOperator: "#A4B0BE", // Ash gray
    comparisonOperator: "#FFA502", // Amber glow

    method: "#FFDD59", // Sulfur yellow
    methodCall: "#F1C40F", // Bright sulfur

    constant: "#70A1FF", // Cool blue contrast
    unionSeparator: "#747D8C", // Charcoal gray

    constraint: "#5F27CD", // Deep purple
    array: "#636E72", // Stone gray
    optional: "#A29BFE", // Lavender

    numericLiteral: "#00D2D3", // Turquoise accent
    stringLiteral: "#FF9FF3", // Pink quartz
  },
};
