/**
 * Error codes for different validation scenarios
 */
export enum ErrorCode {
  // Type validation errors
  TYPE_ERROR = "TYPE_ERROR",
  TYPE_MISMATCH = "TYPE_MISMATCH",
  INVALID_TYPE = "INVALID_TYPE",

  // String validation errors
  STRING_TOO_SHORT = "STRING_TOO_SHORT",
  STRING_TOO_LONG = "STRING_TOO_LONG",
  INVALID_STRING_FORMAT = "INVALID_STRING_FORMAT",
  PATTERN_MISMATCH = "PATTERN_MISMATCH",

  // Number validation errors
  NUMBER_TOO_SMALL = "NUMBER_TOO_SMALL",
  NUMBER_TOO_LARGE = "NUMBER_TOO_LARGE",
  NOT_INTEGER = "NOT_INTEGER",
  NOT_POSITIVE = "NOT_POSITIVE",
  NOT_NEGATIVE = "NOT_NEGATIVE",

  // Array validation errors
  ARRAY_TOO_SHORT = "ARRAY_TOO_SHORT",
  ARRAY_TOO_LONG = "ARRAY_TOO_LONG",
  INVALID_ARRAY_ITEM = "INVALID_ARRAY_ITEM",
  INVALID_ARRAY_LENGTH = "INVALID_ARRAY_LENGTH",
  DUPLICATE_ARRAY_ITEM = "DUPLICATE_ARRAY_ITEM",
  ARRAY_VALUES_NOT_UNIQUE = "ARRAY_VALUES_NOT_UNIQUE",

  // Object validation errors
  MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",
  INVALID_FIELD = "INVALID_FIELD",
  UNKNOWN_FIELD = "UNKNOWN_FIELD",

  // Conditional validation errors
  CONDITION_ERROR = "CONDITION_ERROR",
  SYNTAX_ERROR = "SYNTAX_ERROR",

  // URL validation errors
  INVALID_URL = "INVALID_URL",
  INVALID_URL_ARGUMENT = "INVALID_URL_ARGUMENT",

  // Email validation errors
  INVALID_EMAIL = "INVALID_EMAIL",

  // Date validation errors
  INVALID_DATE = "INVALID_DATE",
  DATE_TOO_EARLY = "DATE_TOO_EARLY",
  DATE_TOO_LATE = "DATE_TOO_LATE",

  // Union validation errors
  INVALID_UNION = "INVALID_UNION",

  // Constant validation errors
  CONSTANT_ERROR = "CONSTANT_ERROR",

  // Password validation errors
  INVALID_PASSWORD = "INVALID_PASSWORD",

  // JSON validation errors
  INVALID_JSON = "JSON_ERROR",

  // SECURITY ERRORS
  SECURITY_VIOLATION = "SECURITY_VIOLATION",

  // URL COMPONENTS VALIDATION ERRORS
  INVALID_URL_ARGS = "ERRURL_ARGS",

  // Generic errors
  VALIDATION_ERROR = "VALIDATION_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

/**
 * Configuration for error message templates and formatting
 */
export interface ErrorConfig {
  includeReceivedValue: boolean;
  maxPathDepth: number;
  maxMessageLength: number;
}
