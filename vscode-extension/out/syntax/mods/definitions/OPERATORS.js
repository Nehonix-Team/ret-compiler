"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FORTIFY_OPERATORS = void 0;
/**
 * ReliantType operators for comparisons, logical conditions, and schema composition.
 * Designed for intuitive use in TypeScript-like schemas, simpler than Zod's operator system.
 */
exports.FORTIFY_OPERATORS = [
    // Comparison Operators
    {
        symbol: "=",
        name: "equals",
        description: "Checks for exact equality with a clean, readable syntax.",
        category: "comparison",
        precedence: 3,
        examples: ['"when role=admin *? string : string?"'],
    },
    {
        symbol: "!=",
        name: "not-equals",
        description: "Checks for inequality, straightforward and type-safe.",
        category: "comparison",
        precedence: 3,
        examples: ['"when status!=inactive *? string : string?"'],
    },
    {
        symbol: ">",
        name: "greater-than",
        description: "Validates if a number is greater than a value.",
        category: "comparison",
        precedence: 3,
        examples: ['"when age>18 *? string : string?"'],
    },
    {
        symbol: ">=",
        name: "greater-equal",
        description: "Validates if a number is greater than or equal to a value.",
        category: "comparison",
        precedence: 3,
        examples: ['"when score>=100 *? string : string?"'],
    },
    {
        symbol: "<",
        name: "less-than",
        description: "Validates if a number is less than a value.",
        category: "comparison",
        precedence: 3,
        examples: ['"when age<65 *? string : string?"'],
    },
    {
        symbol: "<=",
        name: "less-equal",
        description: "Validates if a number is less than or equal to a value.",
        category: "comparison",
        precedence: 3,
        examples: ['"when score<=50 *? string : string?"'],
    },
    {
        symbol: "~",
        name: "regex-match",
        description: "Tests if a string matches a regex pattern, simpler than Zod's regex setup.",
        category: "comparison",
        precedence: 3,
        examples: ['"when code~^[A-Z]{3}$ *? string : string?"'],
    },
    {
        symbol: "!~",
        name: "regex-not-match",
        description: "Tests if a string does not match a regex pattern.",
        category: "comparison",
        precedence: 3,
        examples: ['"when email!~@temp\\. *? string : string?"'],
    },
    // Logical Operators
    {
        symbol: "&&",
        name: "logical-and",
        description: "Combines conditions where both must be true.",
        category: "logical",
        precedence: 2,
        examples: ['"when age>18 && status=active *? string : string?"'],
    },
    {
        symbol: "||",
        name: "logical-or",
        description: "Combines conditions where at least one must be true.",
        category: "logical",
        precedence: 2,
        examples: ['"when role=admin || role=user *? string : string?"'],
    },
    // Conditional Operators
    {
        symbol: "*?",
        name: "conditional-then",
        description: "Separates condition from then/else types in conditionals.",
        category: "conditional",
        precedence: 0,
        examples: ['"when condition *? thenType : elseType"'],
    },
    // Special Operators
    {
        symbol: "|",
        name: "unionSeparator",
        description: "Separates values in union types for flexible schema definitions.",
        category: "special",
        precedence: 0,
        examples: ['"admin|user|guest"'],
    },
    {
        symbol: "?",
        name: "optionalMarker",
        description: "Marks a field as optional, simplifying schema design.",
        category: "special",
        precedence: 0,
        examples: ['"string?"', '"number?"'],
    },
    {
        symbol: "=",
        name: "constantPrefix",
        description: "Defines a constant value with minimal syntax.",
        category: "special",
        precedence: 0,
        examples: ['"=active"', '"=admin"'],
    },
];
//# sourceMappingURL=OPERATORS.js.map