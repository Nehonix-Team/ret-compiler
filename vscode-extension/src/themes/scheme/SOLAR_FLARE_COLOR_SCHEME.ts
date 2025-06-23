import { FortifyColorScheme } from "../color.scheme";

// Solar Flare - Intense theme with solar energy colors
export const SOLAR_FLARE_COLOR_SCHEME: FortifyColorScheme = {
  name: "solar-flare",
  description: "Intense solar theme with plasma colors and stellar energy",
  colors: {
    basicType: "#FF4500", // Orange red
    formatType: "#FF6347", // Tomato
    numericType: "#FF7F50", // Coral

    conditionalKeyword: "#DC143C", // Crimson
    conditionalOperator: "#FF0000", // Red
    logicalOperator: "#B22222", // Fire brick
    comparisonOperator: "#FF8C00", // Dark orange

    method: "#FFD700", // Gold
    methodCall: "#FFA500", // Orange

    constant: "#00BFFF", // Deep sky blue
    unionSeparator: "#CD853F", // Peru

    constraint: "#9932CC", // Dark orchid
    array: "#8B0000", // Dark red
    optional: "#FF69B4", // Hot pink

    numericLiteral: "#00FFFF", // Cyan
    stringLiteral: "#FFFF00", // Yellow
    variable: "#E57373", // Soft red for variables in conditionals - distinctive and readable
  },
};
