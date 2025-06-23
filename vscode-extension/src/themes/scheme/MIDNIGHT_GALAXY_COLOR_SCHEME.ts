import { FortifyColorScheme } from "../color.scheme";

// 3. Midnight Galaxy - Deep space theme with cosmic colors
export const MIDNIGHT_GALAXY_COLOR_SCHEME: FortifyColorScheme = {
  name: "midnight-galaxy",
  description: "Deep space theme with cosmic nebula colors and stellar accents",
  colors: {
    basicType: "#667EEA", // Nebula blue
    formatType: "#764BA2", // Galaxy purple
    numericType: "#F093FB", // Cosmic pink

    conditionalKeyword: "#4FACFE", // Star blue
    conditionalOperator: "#00F2FE", // Cyan nova
    logicalOperator: "#43E97B", // Aurora green
    comparisonOperator: "#38F9D7", // Turquoise

    method: "#FFECD2", // Stardust
    methodCall: "#FCB69F", // Sunset nebula

    constant: "#A8EDEA", // Ice blue
    unionSeparator: "#D299C2", // Cosmic dust

    constraint: "#89F7FE", // Plasma blue
    array: "#66A6FF", // Deep space blue
    optional: "#C471ED", // Purple star

    numericLiteral: "#12C2E9", // Electric blue
    stringLiteral: "#C471F5", // Magenta cosmos
  },
};
