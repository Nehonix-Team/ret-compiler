"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFortifyGrammar = void 0;
/**
 * Generate complete TextMate grammar for ReliantType with improved conditional parsing
 */
function generateFortifyGrammar() {
    return {
        name: "Nehonix ReliantType Embedded",
        scopeName: "source.ts.fortify",
        injectionSelector: "L:source.ts -comment -string, L:source.tsx -comment -string",
        patterns: [
            {
                include: "#fortify-interface-blocks",
            },
        ],
        repository: {
            "fortify-interface-blocks": {
                patterns: [
                    {
                        name: "meta.interface-block.fortify",
                        begin: "\\b(Interface)\\s*\\(\\s*\\{",
                        end: "\\}\\s*\\)",
                        beginCaptures: {
                            "1": {
                                name: "support.function.fortify.interface",
                            },
                        },
                        patterns: [
                            {
                                include: "#fortify-object-properties",
                            },
                        ],
                    },
                ],
            },
            "fortify-object-properties": {
                patterns: [
                    // Property with schema string value (double quotes)
                    {
                        name: "meta.property.fortify",
                        begin: '([a-zA-Z_$][a-zA-Z0-9_$]*)\\s*:\\s*(")',
                        end: '("),?',
                        beginCaptures: {
                            "1": {
                                name: "entity.name.tag.fortify.property",
                            },
                            "2": {
                                name: "punctuation.definition.string.begin.fortify",
                            },
                        },
                        endCaptures: {
                            "1": {
                                name: "punctuation.definition.string.end.fortify",
                            },
                        },
                        contentName: "string.quoted.double.fortify.schema",
                        patterns: [
                            {
                                include: "#reliant-type-content",
                            },
                        ],
                    },
                    // Property with schema string value (single quotes)
                    {
                        name: "meta.property.fortify",
                        begin: "([a-zA-Z_$][a-zA-Z0-9_$]*)\\s*:\\s*(')",
                        end: "('),?",
                        beginCaptures: {
                            "1": {
                                name: "entity.name.tag.fortify.property",
                            },
                            "2": {
                                name: "punctuation.definition.string.begin.fortify",
                            },
                        },
                        endCaptures: {
                            "1": {
                                name: "punctuation.definition.string.end.fortify",
                            },
                        },
                        contentName: "string.quoted.single.fortify.schema",
                        patterns: [
                            {
                                include: "#reliant-type-content",
                            },
                        ],
                    },
                    // Property with schema string value (template literals)
                    {
                        name: "meta.property.fortify",
                        begin: "([a-zA-Z_$][a-zA-Z0-9_$]*)\\s*:\\s*(`)",
                        end: "(`),?",
                        beginCaptures: {
                            "1": {
                                name: "entity.name.tag.fortify.property",
                            },
                            "2": {
                                name: "punctuation.definition.string.begin.fortify",
                            },
                        },
                        endCaptures: {
                            "1": {
                                name: "punctuation.definition.string.end.fortify",
                            },
                        },
                        contentName: "string.template.fortify.schema",
                        patterns: [
                            {
                                include: "#reliant-type-content",
                            },
                            {
                                include: "#fortify-template-expressions",
                            },
                        ],
                    },
                    // Nested objects
                    {
                        name: "meta.nested-object.fortify",
                        begin: "([a-zA-Z_$][a-zA-Z0-9_$]*)\\s*:\\s*\\{",
                        end: "\\},?",
                        beginCaptures: {
                            "1": {
                                name: "entity.name.tag.fortify.property",
                            },
                        },
                        patterns: [
                            {
                                include: "#fortify-object-properties",
                            },
                        ],
                    },
                    // Comments
                    {
                        name: "comment.line.double-slash.fortify",
                        match: "//.*$",
                    },
                    {
                        name: "comment.block.fortify",
                        begin: "/\\*",
                        end: "\\*/",
                    },
                ],
            },
            "reliant-type-content": {
                patterns: [
                    // CRITICAL: Conditional syntax MUST be first and most specific
                    {
                        include: "#fortify-conditional-syntax",
                    },
                    {
                        include: "#fortify-basic-types",
                    },
                    {
                        include: "#fortify-format-types",
                    },
                    {
                        include: "#fortify-numeric-types",
                    },
                    {
                        include: "#fortify-constraints",
                    },
                    {
                        include: "#fortify-arrays",
                    },
                    {
                        include: "#fortify-optional",
                    },
                    {
                        include: "#fortify-unions",
                    },
                    {
                        include: "#fortify-constants",
                    },
                    {
                        include: "#fortify-methods",
                    },
                    {
                        include: "#fortify-operators",
                    },
                ],
            },
            // FIXED CONDITIONAL SYNTAX SECTION
            // UPDATED CONDITIONAL SYNTAX SECTION - More flexible with whitespace
            "fortify-conditional-syntax": {
                patterns: [
                    // Main conditional pattern - handles nested conditionals properly with flexible spacing
                    {
                        name: "meta.conditional.fortify.complete",
                        begin: "\\b(when)\\s+",
                        end: "(?=\\s*[,}\\]\"'`]|$)",
                        beginCaptures: {
                            "1": {
                                name: "keyword.control.fortify.when",
                            },
                        },
                        patterns: [
                            // Condition part - everything before *? (non-greedy match, flexible spacing)
                            {
                                name: "meta.conditional.condition.fortify",
                                begin: "(?<=when\\s)",
                                end: "(?=\\s*\\*\\?\\s*)",
                                patterns: [
                                    {
                                        include: "#fortify-conditional-condition",
                                    },
                                ],
                            },
                            // Conditional operator (*?) with flexible spacing
                            {
                                name: "keyword.operator.fortify.conditional-then",
                                match: "\\s*\\*\\?\\s*",
                            },
                            // Then-branch - can be a nested conditional or regular type
                            {
                                name: "meta.conditional.then-branch.fortify",
                                begin: "(?<=\\*\\?\\s*)\\s*",
                                end: "(?=\\s*:|$)",
                                patterns: [
                                    // IMPORTANT: Check for nested 'when' first with flexible spacing
                                    {
                                        name: "meta.conditional.nested.fortify",
                                        begin: "\\b(when)\\s+",
                                        end: "(?=\\s*:)",
                                        beginCaptures: {
                                            "1": {
                                                name: "keyword.control.fortify.when.nested",
                                            },
                                        },
                                        patterns: [
                                            // Nested condition with flexible spacing
                                            {
                                                name: "meta.conditional.condition.nested.fortify",
                                                begin: "(?<=when\\s)",
                                                end: "(?=\\s*\\*\\?\\s*)",
                                                patterns: [
                                                    {
                                                        include: "#fortify-conditional-condition",
                                                    },
                                                ],
                                            },
                                            // Nested operator with flexible spacing
                                            {
                                                name: "keyword.operator.fortify.conditional-then.nested",
                                                match: "\\s*\\*\\?\\s*",
                                            },
                                            // Nested then-type
                                            {
                                                name: "meta.conditional.then-type.nested.fortify",
                                                begin: "(?<=\\*\\?\\s*)\\s*",
                                                end: "(?=\\s*:|$)",
                                                patterns: [
                                                    {
                                                        include: "#fortify-type-reference",
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                    // Regular type reference if not nested conditional
                                    {
                                        include: "#fortify-type-reference",
                                    },
                                ],
                            },
                            // Else separator (:) with flexible spacing
                            {
                                name: "punctuation.separator.fortify.conditional-else",
                                match: "\\s*:\\s*",
                            },
                            // Else-branch - can also be nested conditional or regular type
                            {
                                name: "meta.conditional.else-branch.fortify",
                                begin: "(?<=:\\s*)\\s*",
                                end: "(?=\\s*[,}\\]\"'`]|$)",
                                patterns: [
                                    // Check for nested 'when' in else branch with flexible spacing
                                    {
                                        name: "meta.conditional.nested-else.fortify",
                                        begin: "\\b(when)\\s+",
                                        end: "(?=\\s*[,}\\]\"'`]|$)",
                                        beginCaptures: {
                                            "1": {
                                                name: "keyword.control.fortify.when.nested-else",
                                            },
                                        },
                                        patterns: [
                                            // Recursive include for full conditional parsing
                                            {
                                                include: "#fortify-conditional-syntax",
                                            },
                                        ],
                                    },
                                    // Regular type reference if not nested conditional
                                    {
                                        include: "#fortify-type-reference",
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            // Enhanced conditional condition parsing
            "fortify-conditional-condition": {
                patterns: [
                    // Method calls with complex property chains (user.role.$contains(admin))
                    {
                        name: "meta.method-call.complex.fortify.conditional",
                        begin: "([a-zA-Z_$][a-zA-Z0-9_$.]*)(\\.(\\$[a-zA-Z_$][a-zA-Z0-9_$]*))\\s*\\(",
                        end: "\\)",
                        beginCaptures: {
                            "1": {
                                name: "variable.other.property.fortify.chain",
                            },
                            "2": {
                                name: "punctuation.accessor.fortify",
                            },
                            "3": {
                                name: "support.function.fortify.method",
                            },
                        },
                        patterns: [
                            {
                                include: "#fortify-method-arguments",
                            },
                        ],
                    },
                    // Standalone method calls ($exists(), $empty(), etc.)
                    {
                        name: "meta.method-call.standalone.fortify.conditional",
                        begin: "(\\$[a-zA-Z_][a-zA-Z0-9_]*)\\s*\\(",
                        end: "\\)",
                        beginCaptures: {
                            "1": {
                                name: "support.function.fortify.method",
                            },
                        },
                        patterns: [
                            {
                                include: "#fortify-method-arguments",
                            },
                        ],
                    },
                    // Deep property chains (config.permissions, user.profile.settings.advanced)
                    {
                        name: "variable.other.property.fortify.deep-chain",
                        match: "\\b([a-zA-Z_$][a-zA-Z0-9_$]*(?:\\.[a-zA-Z_$][a-zA-Z0-9_$]*){2,})(?=\\s*[=!<>~$]|\\s*&&|\\s*\\|\\||$)",
                    },
                    // Medium property chains (user.email, config.theme)
                    {
                        name: "variable.other.property.fortify.chain",
                        match: "\\b([a-zA-Z_$][a-zA-Z0-9_$]*\\.[a-zA-Z_$][a-zA-Z0-9_$]*)(?=\\s*[=!<>~$]|\\s*&&|\\s*\\|\\||$)",
                    },
                    // Simple property names
                    {
                        name: "variable.other.property.fortify.simple",
                        match: "\\b([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\\s*[=!<>~]|\\s*&&|\\s*\\|\\||\\s*\\.|$)",
                    },
                    // Comparison operators (order matters - longer first)
                    {
                        name: "keyword.operator.fortify.comparison",
                        match: "(!=|>=|<=|!~|==|=|>|<|~)",
                    },
                    // Logical operators
                    {
                        name: "keyword.operator.fortify.logical",
                        match: "(&&|\\|\\|)",
                    },
                    // Property access dots
                    {
                        name: "keyword.operator.fortify.field-access",
                        match: "\\.",
                    },
                    // String literals with escaping
                    {
                        name: "string.quoted.single.fortify.condition",
                        begin: "'",
                        end: "'",
                        patterns: [
                            {
                                name: "constant.character.escape.fortify",
                                match: "\\\\.",
                            },
                        ],
                    },
                    {
                        name: "string.quoted.double.fortify.condition",
                        begin: '"',
                        end: '"',
                        patterns: [
                            {
                                name: "constant.character.escape.fortify",
                                match: "\\\\.",
                            },
                        ],
                    },
                    // Numeric literals
                    {
                        name: "constant.numeric.fortify.condition",
                        match: "\\b\\d+(?:\\.\\d+)?\\b",
                    },
                    // Boolean literals
                    {
                        name: "constant.language.boolean.fortify.condition",
                        match: "\\b(true|false)\\b",
                    },
                ],
            },
            "fortify-method-arguments": {
                patterns: [
                    // String arguments
                    {
                        name: "string.quoted.single.fortify.argument",
                        begin: "'",
                        end: "'",
                        patterns: [
                            {
                                name: "constant.character.escape.fortify",
                                match: "\\\\.",
                            },
                        ],
                    },
                    {
                        name: "string.quoted.double.fortify.argument",
                        begin: '"',
                        end: '"',
                        patterns: [
                            {
                                name: "constant.character.escape.fortify",
                                match: "\\\\.",
                            },
                        ],
                    },
                    // Numeric arguments
                    {
                        name: "constant.numeric.fortify.argument",
                        match: "\\b\\d+(?:\\.\\d+)?\\b",
                    },
                    // Boolean arguments
                    {
                        name: "constant.language.boolean.fortify.argument",
                        match: "\\b(true|false)\\b",
                    },
                    // Variable arguments
                    {
                        name: "variable.other.property.fortify.argument",
                        match: "\\b[a-zA-Z_$][a-zA-Z0-9_$]*\\b",
                    },
                    // Argument separators
                    {
                        name: "punctuation.separator.fortify.argument",
                        match: ",",
                    },
                ],
            },
            "fortify-type-reference": {
                patterns: [
                    {
                        include: "#fortify-basic-types",
                    },
                    {
                        include: "#fortify-format-types",
                    },
                    {
                        include: "#fortify-numeric-types",
                    },
                    {
                        include: "#fortify-constraints",
                    },
                    {
                        include: "#fortify-arrays",
                    },
                    {
                        include: "#fortify-unions",
                    },
                    {
                        include: "#fortify-constants",
                    },
                ],
            },
            "fortify-basic-types": {
                patterns: [
                    {
                        name: "support.type.fortify.basic",
                        match: "\\b(string|number|boolean|date|any)\\b",
                    },
                ],
            },
            "fortify-format-types": {
                patterns: [
                    {
                        name: "support.type.fortify.format",
                        match: "\\b(email|url|url\\.https|url\\.dev|phone|uuid)\\b",
                    },
                ],
            },
            "fortify-numeric-types": {
                patterns: [
                    {
                        name: "support.type.fortify.numeric",
                        match: "\\b(positive|negative|double)\\b",
                    },
                ],
            },
            "fortify-constraints": {
                patterns: [
                    // Regex patterns like (/^v\\d+\\.\\d+$/)
                    {
                        name: "meta.constraint.regex.fortify",
                        begin: "\\(",
                        end: "\\)",
                        patterns: [
                            {
                                name: "string.regexp.fortify",
                                begin: "/",
                                end: "/([gimsuy]*)",
                                beginCaptures: {
                                    "0": {
                                        name: "punctuation.definition.string.begin.regexp.fortify",
                                    },
                                },
                                endCaptures: {
                                    "0": {
                                        name: "punctuation.definition.string.end.regexp.fortify",
                                    },
                                    "1": {
                                        name: "keyword.other.regexp.flags.fortify",
                                    },
                                },
                                patterns: [
                                    {
                                        name: "constant.character.escape.regexp.fortify",
                                        match: "\\\\.",
                                    },
                                    {
                                        name: "constant.other.character-class.regexp.fortify",
                                        match: "\\[([^\\]\\\\]|\\\\.)*\\]",
                                    },
                                    {
                                        name: "keyword.operator.regexp.fortify",
                                        match: "[.*+?^${}()|\\[\\]]",
                                    },
                                ],
                            },
                            // Numeric constraints like (1,10)
                            {
                                name: "constant.numeric.fortify.constraint-value",
                                match: "\\d+(?:\\.\\d+)?",
                            },
                            {
                                name: "punctuation.separator.fortify.constraint",
                                match: ",",
                            },
                        ],
                    },
                ],
            },
            "fortify-arrays": {
                patterns: [
                    // Array with constraints like string[](1,5)
                    {
                        name: "meta.array.constrained.fortify",
                        begin: "\\[\\]\\(",
                        end: "\\)",
                        patterns: [
                            {
                                name: "constant.numeric.fortify.array-constraint",
                                match: "\\d+",
                            },
                            {
                                name: "punctuation.separator.fortify.array-constraint",
                                match: ",",
                            },
                        ],
                    },
                    // Simple array notation
                    {
                        name: "punctuation.definition.fortify.array",
                        match: "\\[\\]",
                    },
                ],
            },
            "fortify-optional": {
                patterns: [
                    {
                        name: "punctuation.definition.fortify.optional",
                        match: "\\?",
                    },
                ],
            },
            "fortify-unions": {
                patterns: [
                    {
                        name: "keyword.operator.fortify.union",
                        match: "\\|",
                    },
                ],
            },
            "fortify-constants": {
                patterns: [
                    // Make.const() function calls
                    {
                        name: "meta.function-call.make-const.fortify",
                        begin: "\\b(Make)\\.(const)\\s*\\(",
                        end: "\\)",
                        beginCaptures: {
                            "1": {
                                name: "support.class.fortify.make",
                            },
                            "2": {
                                name: "support.function.fortify.const",
                            },
                        },
                        patterns: [
                            {
                                name: "string.quoted.double.fortify.const-value",
                                begin: '"',
                                end: '"',
                                patterns: [
                                    {
                                        name: "constant.character.escape.fortify",
                                        match: "\\\\.",
                                    },
                                ],
                            },
                            {
                                name: "string.quoted.single.fortify.const-value",
                                begin: "'",
                                end: "'",
                                patterns: [
                                    {
                                        name: "constant.character.escape.fortify",
                                        match: "\\\\.",
                                    },
                                ],
                            },
                            {
                                name: "string.template.fortify.const-value",
                                begin: "`",
                                end: "`",
                                patterns: [
                                    {
                                        name: "constant.character.escape.fortify",
                                        match: "\\\\.",
                                    },
                                ],
                            },
                        ],
                    },
                    // Complex array constants like =["default","user"]
                    {
                        name: "meta.constant.array.fortify",
                        begin: "=\\[",
                        end: "\\]",
                        beginCaptures: {
                            "0": {
                                name: "constant.other.fortify.literal.equals",
                            },
                        },
                        patterns: [
                            {
                                name: "string.quoted.double.fortify.literal",
                                begin: '"',
                                end: '"',
                                patterns: [
                                    {
                                        name: "constant.character.escape.fortify",
                                        match: "\\\\.",
                                    },
                                ],
                            },
                            {
                                name: "string.quoted.single.fortify.literal",
                                begin: "'",
                                end: "'",
                                patterns: [
                                    {
                                        name: "constant.character.escape.fortify",
                                        match: "\\\\.",
                                    },
                                ],
                            },
                            {
                                name: "constant.numeric.fortify.literal",
                                match: "\\d+(?:\\.\\d+)?",
                            },
                            {
                                name: "constant.language.boolean.fortify.literal",
                                match: "\\b(true|false)\\b",
                            },
                            {
                                name: "punctuation.separator.fortify.literal",
                                match: ",",
                            },
                        ],
                    },
                    // Complex object constants like ={"mode":"light","lang":"en"}
                    {
                        name: "meta.constant.object.fortify",
                        begin: "=\\{",
                        end: "\\}",
                        beginCaptures: {
                            "0": {
                                name: "constant.other.fortify.literal.equals",
                            },
                        },
                        patterns: [
                            {
                                name: "string.quoted.double.fortify.literal.key",
                                begin: '"',
                                end: '"(?=\\s*:)',
                                patterns: [
                                    {
                                        name: "constant.character.escape.fortify",
                                        match: "\\\\.",
                                    },
                                ],
                            },
                            {
                                name: "string.quoted.single.fortify.literal.key",
                                begin: "'",
                                end: "'(?=\\s*:)",
                                patterns: [
                                    {
                                        name: "constant.character.escape.fortify",
                                        match: "\\\\.",
                                    },
                                ],
                            },
                            {
                                name: "string.quoted.double.fortify.literal.value",
                                begin: '(?<=:)\\s*"',
                                end: '"',
                                patterns: [
                                    {
                                        name: "constant.character.escape.fortify",
                                        match: "\\\\.",
                                    },
                                ],
                            },
                            {
                                name: "string.quoted.single.fortify.literal.value",
                                begin: "(?<=:)\\s*'",
                                end: "'",
                                patterns: [
                                    {
                                        name: "constant.character.escape.fortify",
                                        match: "\\\\.",
                                    },
                                ],
                            },
                            {
                                name: "constant.numeric.fortify.literal",
                                match: "\\b\\d+(?:\\.\\d+)?\\b",
                            },
                            {
                                name: "constant.language.boolean.fortify.literal",
                                match: "\\b(true|false)\\b",
                            },
                            {
                                name: "punctuation.separator.fortify.literal.colon",
                                match: ":",
                            },
                            {
                                name: "punctuation.separator.fortify.literal.comma",
                                match: ",",
                            },
                        ],
                    },
                    // Simple literal constants like =2.0, =user, =true, =false
                    {
                        name: "constant.other.fortify.literal.simple",
                        match: "=(\\w+(?:\\.\\w+)?|true|false|\\d+(?:\\.\\d+)?)",
                        captures: {
                            "1": {
                                name: "constant.other.fortify.literal.value",
                            },
                        },
                    },
                ],
            },
            "fortify-methods": {
                patterns: [
                    {
                        name: "support.function.fortify.method",
                        match: "\\$[a-zA-Z_][a-zA-Z0-9_]*",
                    },
                ],
            },
            "fortify-operators": {
                patterns: [
                    {
                        name: "keyword.operator.fortify.field-access",
                        match: "\\.",
                    },
                ],
            },
            "fortify-template-expressions": {
                patterns: [
                    {
                        name: "meta.embedded.expression.fortify",
                        begin: "\\$\\{",
                        end: "\\}",
                        beginCaptures: {
                            "0": {
                                name: "punctuation.definition.template-expression.begin.fortify",
                            },
                        },
                        endCaptures: {
                            "0": {
                                name: "punctuation.definition.template-expression.end.fortify",
                            },
                        },
                        patterns: [
                            {
                                include: "source.ts",
                            },
                        ],
                    },
                ],
            },
        },
    };
}
exports.generateFortifyGrammar = generateFortifyGrammar;
//# sourceMappingURL=generateGrammar.js.map