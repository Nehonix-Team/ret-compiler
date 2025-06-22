import { TypeDefinition } from "../../../types";

/**
 * Fortify Schema type definitions, providing a TypeScript-like validation system
 * that's simpler and more intuitive than Zod. Types support constraints, optional
 * markers, and arrays for flexible schema definitions.
 * Note: Custom types may be supported via runtime extensions (see documentation).
 */
export const FORTIFY_TYPES: TypeDefinition[] = [
  // Basic Types
  {
    name: "string",
    description:
      "Validates any text value, with optional length or regex constraints. Simpler than Zod's verbose string validation.",
    category: "basic",
    examples: [
      '"string"',
      '"string(2,50)"',
      '"string(/^[a-z]+$/)"',
      '"string?"',
      '"string[]"',
    ],
    supportsConstraints: true,
    supportsOptional: true,
    supportsArrays: true,
  },
  {
    name: "number",
    description:
      "Validates numeric values (integers or floats) with optional range constraints. Lightweight compared to Zod's number schemas.",
    category: "basic",
    examples: ['"number"', '"number(0,100)"', '"number?"', '"number[]"'],
    supportsConstraints: true,
    supportsOptional: true,
    supportsArrays: true,
  },
  {
    name: "boolean",
    description: "Validates true or false values with minimal configuration.",
    category: "basic",
    examples: ['"boolean"', '"boolean?"', '"boolean[]"'],
    supportsConstraints: false,
    supportsOptional: true,
    supportsArrays: true,
  },
  {
    name: "date",
    description:
      "Validates date strings or Date objects with straightforward syntax.",
    category: "basic",
    examples: ['"date"', '"date?"', '"date[]"'],
    supportsConstraints: false,
    supportsOptional: true,
    supportsArrays: true,
  },
  {
    name: "any",
    description:
      "Accepts any value without validation, ideal for flexible schemas.",
    category: "basic",
    examples: ['"any"', '"any?"', '"any[]"'],
    supportsConstraints: false,
    supportsOptional: true,
    supportsArrays: true,
  },

  // Format Types
  {
    name: "email",
    description:
      "Validates email address format with built-in regex, no complex setup needed.",
    category: "format",
    examples: ['"email"', '"email?"', '"email[]"'],
    supportsConstraints: false,
    supportsOptional: true,
    supportsArrays: true,
  },
  {
    name: "url",
    description: "Validates web URL format with simple declaration.",
    category: "format",
    examples: ['"url"', '"url?"', '"url[]"'],
    supportsConstraints: false,
    supportsOptional: true,
    supportsArrays: true,
  },
  {
    name: "uuid",
    description: "Validates UUID v4 format, concise and reliable.",
    category: "format",
    examples: ['"uuid"', '"uuid?"', '"uuid[]"'],
    supportsConstraints: false,
    supportsOptional: true,
    supportsArrays: true,
  },
  {
    name: "phone",
    description:
      "Validates phone number format with flexible regional support.",
    category: "format",
    examples: ['"phone"', '"phone?"', '"phone[]"'],
    supportsConstraints: false,
    supportsOptional: true,
    supportsArrays: true,
  },
  {
    name: "slug",
    description:
      "Validates URL slugs (lowercase, hyphen-separated) for clean URLs.",
    category: "format",
    examples: ['"slug"', '"slug?"', '"slug[]"'],
    supportsConstraints: false,
    supportsOptional: true,
    supportsArrays: true,
  },
  {
    name: "username",
    description:
      "Validates usernames (alphanumeric, underscores, hyphens) for user handles.",
    category: "format",
    examples: ['"username"', '"username?"', '"username[]"'],
    supportsConstraints: false,
    supportsOptional: true,
    supportsArrays: true,
  },

  // Numeric Types
  {
    name: "int",
    description: "Validates whole numbers with optional range constraints.",
    category: "numeric",
    examples: ['"int"', '"int(1,100)"', '"int?"', '"int[]"'],
    supportsConstraints: true,
    supportsOptional: true,
    supportsArrays: true,
  },
  {
    name: "positive",
    description:
      "Validates numbers greater than zero with optional upper bounds.",
    category: "numeric",
    examples: [
      '"positive"',
      '"positive(1,1000)"',
      '"positive?"',
      '"positive[]"',
    ],
    supportsConstraints: true,
    supportsOptional: true,
    supportsArrays: true,
  },
  {
    name: "negative",
    description: "Validates numbers less than zero with optional lower bounds.",
    category: "numeric",
    examples: [
      '"negative"',
      '"negative(-1000,-1)"',
      '"negative?"',
      '"negative[]"',
    ],
    supportsConstraints: true,
    supportsOptional: true,
    supportsArrays: true,
  },
  {
    name: "float",
    description: "Validates decimal numbers with optional range constraints.",
    category: "numeric",
    examples: ['"float"', '"float(0.1,99.9)"', '"float?"', '"float[]"'],
    supportsConstraints: true,
    supportsOptional: true,
    supportsArrays: true,
  },

  // Structural Types
  {
    name: "object",
    description:
      "Validates nested object schemas defined via Interface({...}), enabling TypeScript-like nested validation.",
    category: "structural",
    examples: ['"object"', '"object?"', '"object[]"'],
    supportsConstraints: false,
    supportsOptional: true,
    supportsArrays: true,
  },
];
