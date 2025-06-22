import { FortifyColorScheme } from "../color.scheme";

// Matrix Code scheme - green on black hacker vibes 💚🖥️
export const MATRIX_CODE_COLOR_SCHEME: FortifyColorScheme = {
  name: "matrix_code",
  description: "Green rain code - pure hacker aesthetic like The Matrix 💚",
  colors: {
    // Core types - Matrix greens
    basicType: "#00FF41", // Classic Matrix green - the one
    formatType: "#39FF14", // Bright neon green - special formats
    numericType: "#00FF00", // Pure green - numbers in the matrix

    // Conditional syntax - Deeper matrix
    conditionalKeyword: "#ADFF2F", // Green yellow - when the matrix bends
    conditionalOperator: "#32CD32", // Lime green - operators like code rain
    logicalOperator: "#228B22", // Forest green - deep logic
    comparisonOperator: "#7CFC00", // Lawn green - comparisons

    // Methods - Bright terminals
    method: "#00FA9A", // Medium spring green - method calls
    methodCall: "#98FB98", // Pale green - executed methods

    // Values - Code elements
    constant: "#90EE90", // Light green - constants in the code
    unionSeparator: "#6B8E23", // Olive drab - separators

    // Structural - Matrix architecture
    constraint: "#556B2F", // Dark olive - constraints
    array: "#9ACD32", // Yellow green - array structures
    optional: "#B8860B", // Dark golden rod - optional elements

    // Literals
    numericLiteral: "#FFFF00", // Yellow - numbers glow different
    stringLiteral: "#FFA500", // Orange - strings break the matrix
  },
};
