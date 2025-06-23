import { FortifyColorScheme } from "../color.scheme";

/**
 * @name CYBERPUNK_COLOR_SCHEME
 * Neon cyberpunk scheme - vibrant and futuristic 🌈⚡
 */

export const CYBERPUNK_COLOR_SCHEME: FortifyColorScheme = {
  name: "cyberpunk",
  description: "Electric neon colors for a futuristic coding experience 🔥",
  colors: {
    // Core types - Electric blues and cyans
    basicType: "#00E5FF", // Electric cyan - super bright and cool
    formatType: "#1DE9B6", // Neon mint - pops off the screen
    numericType: "#76FF03", // Electric lime - energetic and fresh

    // Conditional syntax - Hot pinks and purples
    conditionalKeyword: "#E91E63", // Hot pink - impossible to miss
    conditionalOperator: "#FF6D00", // Electric orange - blazing hot
    logicalOperator: "#651FFF", // Deep purple - mystical
    comparisonOperator: "#FF9100", // Neon amber - bright and attention-grabbing

    // Methods - Electric yellows
    method: "#FFEB3B", // Neon yellow - like lightning
    methodCall: "#FFC400", // Electric gold - premium feel

    // Values - Neon greens and electric blues
    constant: "#00FF41", // Matrix green - iconic
    unionSeparator: "#03DAC6", // Electric teal - separates beautifully

    // Structural - Bright metallics
    constraint: "#9C27B0", // Electric purple - structural but vibrant
    array: "#00BCD4", // Electric cyan - cool and modern
    optional: "#E040FB", // Neon magenta - optional but noticeable

    // Literals
    numericLiteral: "#64DD17", // Bright green - energetic numbers
    stringLiteral: "#FF5722", // Electric red-orange - hot strings
    variable: "#E57373", // Soft red for variables in conditionals - distinctive and readable
  },
};
