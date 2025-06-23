import { FortifyColorScheme } from "../color.scheme";

export const DEFAULT_V2_COLOR_SCHEME: FortifyColorScheme = {
  name: "defaultv2",
  description: "Default colors that blend with VSCode's TypeScript theme",
  colors: {
    // Core types - blue family
    basicType: "#569CD6", // TypeScript blue
    formatType: "#4EC9B0", // Cyan for special formats
    numericType: "#B5CEA8", // Light green for numbers

    // Conditional syntax - purple family
    conditionalKeyword: "#C586C0", // Purple for 'when'
    conditionalOperator: "#D4D4D4", // Light gray for *?
    logicalOperator: "#569CD6", // Blue for && ||
    comparisonOperator: "#D4D4D4", // Light gray for = != etc

    // Methods - yellow family
    method: "#DCDCAA", // Yellow for method names
    methodCall: "#DCDCAA", // Same as method

    // Values - green family
    constant: "#B5CEA8", // Light green for constants
    unionSeparator: "#D4D4D4", // Light gray for |

    // Structural - gray family
    constraint: "#808080", // Gray for parentheses
    array: "#D4D4D4", // Light gray for []
    optional: "#C586C0", // Purple for ?

    // Literals
    numericLiteral: "#B5CEA8", // Light green
    stringLiteral: "#CE9178", // Orange for strings
    variable: "#E57373", // Soft red for variables in conditionals - distinctive and readable
  },
};
