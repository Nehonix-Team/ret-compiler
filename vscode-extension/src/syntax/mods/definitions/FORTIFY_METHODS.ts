import { MethodDefinition } from "../../../types";

/**
 * Fortify Schema methods for conditional validation, providing TypeScript-like
 * method syntax that's more intuitive.
 */
export const FORTIFY_METHODS: MethodDefinition[] = [
  {
    name: "in",
    description:
      "Checks if a field value is one of the specified literals. Supports strings, numbers, or constants.",
    syntax: "field.in(value1, value2, ...)",
    parameters: ["...values: literal"],
    returnType: "boolean",
    examples: ['"when role.in(admin, moderator) *? string : string?"'],
    supportsNegation: true,
  },
  {
    name: "contains",
    description: "Checks if a string field contains a specific substring.",
    syntax: "field.contains(substring)",
    parameters: ["substring: string"],
    returnType: "boolean",
    examples: ['"when email.contains(@company.com) *? string : string?"'],
    supportsNegation: true,
  },
  {
    name: "startsWith",
    description: "Checks if a string field starts with a given prefix.",
    syntax: "field.startsWith(prefix)",
    parameters: ["prefix: string"],
    returnType: "boolean",
    examples: ['"when name.startsWith(Dr) *? string : string?"'],
    supportsNegation: true,
  },
  {
    name: "endsWith",
    description: "Checks if a string field ends with a given suffix.",
    syntax: "field.endsWith(suffix)",
    parameters: ["suffix: string"],
    returnType: "boolean",
    examples: ['"when filename.endsWith(.pdf) *? string : string?"'],
    supportsNegation: true,
  },
  {
    name: "between",
    description:
      "Checks if a number field is within a specified range (inclusive).",
    syntax: "field.between(min, max)",
    parameters: ["min: number", "max: number"],
    returnType: "boolean",
    examples: ['"when age.between(18, 65) *? string : string?"'],
    supportsNegation: true,
  },
  {
    name: "exists",
    description: "Checks if a field is defined (not undefined).",
    syntax: "field.exists",
    parameters: [],
    returnType: "boolean",
    examples: ['"when profile.exists *? string : string?"'],
    supportsNegation: true,
  },
  {
    name: "empty",
    description:
      "Checks if a field is empty (e.g., empty string, array, or object).",
    syntax: "field.empty",
    parameters: [],
    returnType: "boolean",
    examples: ['"when description.empty *? string : string?"'],
    supportsNegation: true,
  },
  {
    name: "null",
    description: "Checks if a field is null, with simple and clear syntax.",
    syntax: "field.null",
    parameters: [],
    returnType: "boolean",
    examples: ['"when metadata.null *? string? : =null"'],
    supportsNegation: true,
  },
];
