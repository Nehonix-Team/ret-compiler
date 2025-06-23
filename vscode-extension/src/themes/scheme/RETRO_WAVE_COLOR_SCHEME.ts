import { FortifyColorScheme } from "../color.scheme";

// Retro Wave scheme - 80s synthwave vibes 🌸💜
export const RETRO_WAVE_COLOR_SCHEME: FortifyColorScheme = {
  name: "retro_wave",
  description: "80s synthwave aesthetic - neon pinks and purples 🌸💜",
  colors: {
    // Core types - Synthwave basics
    basicType: "#FF1493", // Deep pink - classic synthwave
    formatType: "#FF69B4", // Hot pink - special formats pop
    numericType: "#00FFFF", // Cyan - 80s computer vibes

    // Conditional syntax - Neon nights
    conditionalKeyword: "#8A2BE2", // Blue violet - when the synth drops
    conditionalOperator: "#FF4500", // Orange red - blazing operators
    logicalOperator: "#9370DB", // Medium purple - logical waves
    comparisonOperator: "#FF6347", // Tomato - comparison highlights

    // Methods - Electric dreams
    method: "#FFFF00", // Yellow - like neon signs
    methodCall: "#FFD700", // Gold - premium method calls

    // Values - Retro elements
    constant: "#7FFFD4", // Aquamarine - constants like laser beams
    unionSeparator: "#DA70D6", // Orchid - separating the waves

    // Structural - 80s architecture
    constraint: "#BA55D3", // Medium orchid - structural elements
    array: "#DDA0DD", // Plum - array containers
    optional: "#EE82EE", // Violet - optional elements

    // Literals
    numericLiteral: "#00CED1", // Dark turquoise - retro numbers
    stringLiteral: "#FF7F50", // Coral - strings like laser text
    variable: "#E57373", // Soft red for variables in conditionals - distinctive and readable
  },
};
