import { TypeDefinition } from "../../../types";

/**
 * Fortify Schema type definitions, providing a TypeScript-like validation system
 * that's simpler and more intuitive. Types support constraints, optional
 * markers, and arrays for flexible schema definitions.
 * Note: Custom types may be supported via runtime extensions (see documentation).
 */
export const FORTIFY_TYPES: TypeDefinition[] = [
  // Basic Types
  {
    name: "text",
    description:
      "Validates any text value, with optional length or regex constraints.",
    category: "basic",
    examples: [
      '"text"',
      '"text(2,50)"',
      '"text(/^[a-z]+$/)"',
      '"text?"',
      '"text[]"',
    ],
    supportsConstraints: true,
    supportsOptional: true,
    supportsArrays: true,
  },
  {
    name: "password",
    description:
      "Validates password complexity with optional length or regex constraints.",
    category: "basic",
    examples: [
      '"password"',
      '"password(8,20)"',
      '"password(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$/)"',
      '"password?"',
      '"password[]"',
    ],
    supportsConstraints: true,
    supportsOptional: true,
    supportsArrays: true,
  },
  // String is an alias for text
  {
    name: "string",
    description:
      "Validates any text value, with optional length or regex constraints.",
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
      "Validates numeric values (integers or floats) with optional range constraints. ",
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
    name: "bool",
    description: "Validates true or false values with minimal configuration.",
    category: "basic",
    examples: ['"bool"', '"bool?"', '"bool[]"'],
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

  {
    name: "unknown",
    description:
      "Accepts unknown value without validation, ideal for flexible schemas.",
    category: "basic",
    examples: ['"unknown"', '"unknown?"', '"unknown[]"'],
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
    name: "url.https",
    description: "Validates HTTPS URL format with simple declaration.",
    category: "format",
    examples: ['"url.https"', '"url.https?"', '"url.https[]"'],
    supportsConstraints: false,
    supportsOptional: true,
    supportsArrays: true,
  },
  {
    name: "url.http",
    description: "Validates HTTP URL format with simple declaration.",
    category: "format",
    examples: ['"url.http"', '"url.http?"', '"url.http[]"'],
    supportsConstraints: false,
    supportsOptional: true,
    supportsArrays: true,
  },
  {
    name: "url.web",
    description: "Validates web URL format with simple declaration.",
    category: "format",
    examples: ['"url.web"', '"url.web?"', '"url.web[]"'],
    supportsConstraints: false,
    supportsOptional: true,
    supportsArrays: true,
  },
  {
    name: "url.dev",
    description:
      "Validates development URL format with simple declaration - lost security features.",
    category: "format",
    examples: ['"url.dev"', '"url.dev?"', '"url.dev[]"'],
    supportsConstraints: false,
    supportsOptional: true,
    supportsArrays: true,
  },
  {
    name: "url.ftp",
    description: "Validates FTP URL format with simple declaration.",
    category: "format",
    examples: ['"url.ftp"', '"url.ftp?"', '"url.ftp[]"'],
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
  {
    name: "ip",
    description:
      "Validates IP address format (IPv4 and IPv6) for network addresses.",
    category: "format",
    examples: ['"ip"', '"ip?"', '"ip[]"'],
    supportsConstraints: false,
    supportsOptional: true,
    supportsArrays: true,
  },
  {
    name: "json",
    description: "Validates JSON string format with proper syntax checking.",
    category: "format",
    examples: ['"json"', '"json?"', '"json[]"'],
    supportsConstraints: false,
    supportsOptional: true,
    supportsArrays: true,
  },
  {
    name: "json.fast",
    description:
      "Validates JSON string format with proper syntax checking (fast mode).",
    category: "format",
    examples: ['"json.fast"', '"json.fast?"', '"json.fast[]"'],
    supportsConstraints: false,
    supportsOptional: true,
    supportsArrays: true,
  },
  {
    name: "json.secure",
    description:
      "Validates JSON string format with proper syntax checking (secure mode).",
    category: "format",
    examples: ['"json.secure"', '"json.secure?"', '"json.secure[]"'],
    supportsConstraints: false,
    supportsOptional: true,
    supportsArrays: true,
  },
  {
    name: "hexcolor",
    description:
      "Validates hex color codes in #RGB, #RRGGBB, or #RRGGBBAA format.",
    category: "format",
    examples: ['"hexcolor"', '"hexcolor?"', '"hexcolor[]"'],
    supportsConstraints: false,
    supportsOptional: true,
    supportsArrays: true,
  },
  {
    name: "base64",
    description:
      "Validates Base64 encoded strings with proper format checking.",
    category: "format",
    examples: ['"base64"', '"base64?"', '"base64[]"'],
    supportsConstraints: false,
    supportsOptional: true,
    supportsArrays: true,
  },
  {
    name: "jwt",
    description:
      "Validates JSON Web Token format with header/payload verification.",
    category: "format",
    examples: ['"jwt"', '"jwt?"', '"jwt[]"'],
    supportsConstraints: false,
    supportsOptional: true,
    supportsArrays: true,
  },
  {
    name: "semver",
    description: "Validates Semantic Versioning format (MAJOR.MINOR.PATCH).",
    category: "format",
    examples: ['"semver"', '"semver?"', '"semver[]"'],
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
  {
    name: "record",
    description:
      "Validates key-value pairs with string keys and a specified value type.",
    category: "structural",
    examples: ['"record<string, string>"'],
    supportsConstraints: false,
    supportsOptional: true,
    supportsArrays: true,
  },
];
