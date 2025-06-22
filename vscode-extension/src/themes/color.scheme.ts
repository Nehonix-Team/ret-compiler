/**
 * Color scheme definitions for different themes
 */
export interface FortifyColorScheme {
  name: string;
  description: string;
  colors: {
    // Core types
    basicType: string;
    formatType: string;
    numericType: string;

    // Conditional syntax
    conditionalKeyword: string;
    conditionalOperator: string;
    logicalOperator: string;
    comparisonOperator: string;

    // Methods and functions
    method: string;
    methodCall: string;

    // Values and constants
    constant: string;
    unionSeparator: string;

    // Structural elements
    constraint: string;
    array: string;
    optional: string;

    // Literals
    numericLiteral: string;
    stringLiteral: string;
  };
}
