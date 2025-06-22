import { FortifyColorScheme } from "../color.scheme";

// Retro synthwave scheme - 80s vibes with hot pinks and electric blues 🌆🎵
export const SYNTHWAVE_COLOR_SCHEME: FortifyColorScheme = {
  name: "synthwave",
  description:
    "80s retro synthwave vibes - hot pink, electric blue, and neon magic ✨",
  colors: {
    // Core types - Classic synthwave
    basicType: "#00FFFF", // Electric cyan - classic 80s computer
    formatType: "#FF1493", // Hot pink - iconic synthwave color
    numericType: "#ADFF2F", // Electric lime - retro terminal green

    // Conditional syntax - Hot synthwave palette
    conditionalKeyword: "#FF69B4", // Hot pink - impossible to miss
    conditionalOperator: "#FF6347", // Tomato red - vibrant 80s energy
    logicalOperator: "#9370DB", // Medium purple - mystical 80s
    comparisonOperator: "#FFD700", // Gold - like 80s jewelry

    // Methods - Neon yellows and oranges
    method: "#ffff00e9", // Electric yellow - bright as neon signs
    methodCall: "#FFA500", // Orange - warm 80s sunset

    // Values - Classic retro
    constant: "#00FF7F", // Spring green - retro computer green
    unionSeparator: "#DA70D6", // Orchid - separates with style

    // Structural - 80s tech colors
    constraint: "#c1bff5", // Blue violet - tech mystique
    array: "#40E0D0", // Turquoise - like 80s tech interfaces
    optional: "#FF1493", // Deep pink - optional but flashy

    // Literals
    numericLiteral: "#32CD32", // Lime green - retro terminal numbers
    stringLiteral: "#FF69B4", // Hot pink - strings like neon signs
  },
};
