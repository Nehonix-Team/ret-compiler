import { FortifyColorScheme } from "../color.scheme";

// 5. Electric Storm - High-energy theme with electric colors
export const ELECTRIC_STORM_COLOR_SCHEME: FortifyColorScheme = {
  name: "electric-storm",
  description:
    "High-energy theme with electric blues and lightning-inspired accents",
  colors: {
    basicType: "#00D4FF", // Electric blue
    formatType: "#0099CC", // Deep sky blue
    numericType: "#33CCFF", // Bright blue

    conditionalKeyword: "#FF0080", // Electric pink
    conditionalOperator: "#FFFF00", // Electric yellow
    logicalOperator: "#00FF80", // Electric green
    comparisonOperator: "#FF8000", // Electric orange

    method: "#80FF00", // Chartreuse
    methodCall: "#CCFF00", // Electric lime

    constant: "#8000FF", // Electric violet
    unionSeparator: "#C0C0C0", // Silver

    constraint: "#FF4080", // Electric rose
    array: "#6080FF", // Electric periwinkle
    optional: "#FF80C0", // Electric pink

    numericLiteral: "#00FF40", // Spring green
    stringLiteral: "#FF4040", // Electric red
  },
};
