import { createEnum } from "../utils/arrayToEnum";

export const SUPPORTED_VALIDATOR_TYPES = [
  // String types
  "string",

  // Number types
  "number",
  "float",
  "int",
  "integer",
  "positive",
  "negative",
  "double",

  // Boolean types
  "boolean",
  "bool",

  // Date/Time types
  "date",
  "datetime",
  "timestamp",

  // Validation types
  "email",
  "uuid",
  "guid",
  "phone",
  "slug",
  "username",
  "ip",
  "password",

  // Text/Content types
  "text",
  "json",
  "json.fast",
  "json.secure",
  "object",

  // Special types
  "unknown",
  "void",
  "null",
  "undefined",
  "any",

  // New/Extended types
  "hexcolor",
  "base64",
  "jwt",
  "semver",
] as const


export const VALIDATOR_TYPES = createEnum(SUPPORTED_VALIDATOR_TYPES);

export const validatorTypeCategories = {
  string: ["string"],
  numeric: [
    "number",
    "float",
    "int",
    "integer",
    "positive",
    "negative",
    "double",
  ],
  boolean: ["boolean", "bool"],
  datetime: ["date", "datetime", "timestamp"],
  validation: [
    "email",
    "uuid",
    "guid",
    "phone",
    "slug",
    "username",
    "ip",
    "password",
  ],
  content: ["text", "json", "json.fast", "json.secure", "object"],
  special: ["unknown", "void", "null", "undefined", "any"],
  extended: ["hexcolor", "base64", "jwt", "semver"],
};

export const VALID_CONDITIONNAL_TYPES = [
  "string",
  "number",
  "boolean",
  "date",
  "uuid",
  "email",
  "url",
  "url.https",
  "url.http",
  "url.dev",
  "phone",
  "string[]",
  "number[]",
  "boolean[]",
  "date[]",
  "uuid[]",
  "email[]",
  "url[]",
  "phone[]",
];
