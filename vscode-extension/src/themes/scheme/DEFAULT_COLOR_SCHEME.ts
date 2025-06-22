import { FortifyColorScheme } from "../color.scheme";

export const DEFAULT_COLOR_SCHEME: FortifyColorScheme = {
  name: "default",
  description:
    "Modern, user-friendly colors optimized for readability and visual hierarchy",
  colors: {
    // Core types - Modern blue/teal palette for better readability
    basicType: "#4FC3F7", // Bright sky blue - easy to spot, not harsh
    formatType: "#26C6DA", // Cyan - distinctive for special formats like email, url
    numericType: "#66BB6A", // Soft green - pleasant for numbers and ranges

    // Conditional syntax - Purple/magenta family with better contrast
    conditionalKeyword: "#AB47BC", // Rich purple for 'when' - stands out clearly
    conditionalOperator: "#FF7043", // Warm orange for *? - unique and attention-grabbing
    logicalOperator: "#5C6BC0", // Indigo for && || - different from purple but harmonious
    comparisonOperator: "#FFA726", // Amber for = != < > - warm but distinct from orange

    // Methods - Golden yellow family for function-like elements
    method: "#FFD54F", // Soft gold - warm and inviting
    methodCall: "#FFCC02", // Brighter gold for calls - slightly more prominent

    // Values - Green family with better saturation
    constant: "#81C784", // Soft mint green - easy on eyes for constants
    unionSeparator: "#90A4AE", // Blue-gray for | - subtle but visible

    // Structural elements - Refined grays with subtle tints
    constraint: "#78909C", // Blue-gray for parentheses - not too dull
    array: "#9E9E9E", // Neutral gray for [] - unobtrusive
    optional: "#BA68C8", // Light purple for ? - matches conditional theme

    // Literals with improved contrast
    numericLiteral: "#7CB342", // Vibrant green - energetic but readable
    stringLiteral: "#FF8A65", // Coral - warm and friendly for strings
  },
};
