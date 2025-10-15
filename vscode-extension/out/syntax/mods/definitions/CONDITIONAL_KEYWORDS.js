"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FORTIFY_CONDITIONAL_KEYWORDS = void 0;
/**
 * ReliantType conditional keywords for defining dynamic validation rules.
 * Provides a straightforward, TypeScript-like syntax for conditionals
 */
exports.FORTIFY_CONDITIONAL_KEYWORDS = [
    {
        keyword: "when",
        description: "Initiates a conditional validation rule, specifying a condition followed by then/else types.",
        syntax: "when condition *? thenType : elseType",
        examples: [
            '"when role=admin *? string : string?"',
            '"when age>18 *? boolean : boolean?"',
            '"when status.$in(active,pending) *? string : string?"',
            '"when email~@company\\.com$ *? =corporate : =personal"',
        ],
    },
];
//# sourceMappingURL=CONDITIONAL_KEYWORDS.js.map