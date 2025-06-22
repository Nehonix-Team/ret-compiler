import { FortifyColorScheme } from "../color.scheme";

// Ocean depth scheme - deep blues and teals 🌊🐋
export const OCEAN_DEPTH_COLOR_SCHEME: FortifyColorScheme = {
  name: "ocean_depth",
  description: "Deep ocean vibes with rich blues, teals, and aqua tones 🌊",
  colors: {
    // Core types - Ocean blues
    basicType: "#0288D1", // Deep ocean blue - professional depth
    formatType: "#00ACC1", // Tropical teal - like coral reefs
    numericType: "#26A69A", // Sea green - natural and calming

    // Conditional syntax - Deep purples and bright aquas
    conditionalKeyword: "#5E35B1", // Deep sea purple - mysterious depths
    conditionalOperator: "#FF4081", // Coral pink - pops like tropical fish
    logicalOperator: "#3949AB", // Navy blue - strong and reliable
    comparisonOperator: "#FFA000", // Sunset orange - warm contrast to cool blues

    // Methods - Golden beach tones
    method: "#FFB300", // Beach sand gold - warm against ocean
    methodCall: "#FF8F00", // Deeper sunset gold

    // Values - Aquatic life colors
    constant: "#4DB6AC", // Seafoam green - constant like tides
    unionSeparator: "#78909C", // Driftwood gray - natural separator

    // Structural - Deep sea elements
    constraint: "#455A64", // Deep sea gray - structural depth
    array: "#607D8B", // Ocean rock blue - solid arrays
    optional: "#7E57C2", // Deep purple coral - optional beauty

    // Literals
    numericLiteral: "#00897B", // Deep teal - numbers like depths
    stringLiteral: "#F57C00", // Sunset orange - strings like beach fire
  },
};
