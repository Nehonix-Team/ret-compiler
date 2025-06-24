import { ConditionalKeyword } from "../../../types";

/**
 * Fortify Schema conditional keywords for defining dynamic validation rules.
 * Provides a straightforward, TypeScript-like syntax for conditionals
 */
export const FORTIFY_CONDITIONAL_KEYWORDS: ConditionalKeyword[] = [
  {
    keyword: "when",
    description:
      "Initiates a conditional validation rule, specifying a condition followed by then/else types.",
    syntax: "when condition *? thenType : elseType",
    examples: [
      '"when role=admin *? string : string?"',
      '"when age>18 *? boolean : boolean?"',
      '"when status.in(active,pending) *? string : string?"',
      '"when email~@company\\.com$ *? =corporate : =personal"',
    ],
  },
];
