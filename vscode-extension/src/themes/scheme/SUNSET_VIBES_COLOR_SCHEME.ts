import { FortifyColorScheme } from "../color.scheme";

// Sunset Vibes scheme - warm oranges and purples 🌅🏖️
export const SUNSET_VIBES_COLOR_SCHEME: FortifyColorScheme = {
  name: "sunset_vibes",
  description:
    "Golden hour colors - warm and inspiring like a perfect sunset 🌅",
  colors: {
    // Core types - Sunset skies
    basicType: "#FB8C00", // Sunset orange - warm and inviting
    formatType: "#FF7043", // Coral sunset - tropical vibes
    numericType: "#8BC34A", // Palm tree green

    // Conditional syntax - Twilight magic
    conditionalKeyword: "#8E24AA", // Twilight purple - magical hour
    conditionalOperator: "#E65100", // Deep sunset orange - attention-grabbing
    logicalOperator: "#5E35B1", // Deep twilight purple
    comparisonOperator: "#FF6F00", // Bright sunset - comparisons like sun rays

    // Methods - Golden hour
    method: "#FFD600", // Pure gold - sun at horizon
    methodCall: "#FFAB00", // Rich amber - golden calls

    // Values - Beach elements
    constant: "#689F38", // Dune grass green
    unionSeparator: "#8D6E63", // Driftwood brown - natural separation

    // Structural - Beach materials
    constraint: "#A1887F", // Sand brown - structural like dunes
    array: "#BCAAA4", // Light sand - array containers
    optional: "#AB47BC", // Sunset purple - optional beauty

    // Literals
    numericLiteral: "#7CB342", // Tropical green
    stringLiteral: "#FF5722", // Fire orange - strings like flames
    variable: "#E57373", // Soft red for variables in conditionals - distinctive and readable
  },
};
