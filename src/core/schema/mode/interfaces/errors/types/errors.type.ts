/**
 * Error codes for different validation scenarios
 */
/**
 * Error codes for different validation scenarios
 */
export enum ErrorCode {
  // Type validation errors
  TYPE_ERROR = "ETYPE",
  TYPE_MISMATCH = "ETYPEMISMATCH",
  INVALID_TYPE = "EINVALIDTYPE",

  // String validation errors
  STRING_TOO_SHORT = "ESTRINGSHORT",
  STRING_TOO_LONG = "ESTRINGLONG",
  INVALID_STRING_FORMAT = "ESTRINGFORMAT",
  PATTERN_MISMATCH = "EPATTERNMISMATCH",

  // Number validation errors
  NUMBER_TOO_SMALL = "ENUMSMALL",
  NUMBER_TOO_LARGE = "ENUMLARGE",
  NOT_INTEGER = "ENOTINTEGER",
  NOT_POSITIVE = "ENOTPOSITIVE",
  NOT_NEGATIVE = "ENOTNEGATIVE",

  // Array validation errors
  ARRAY_TOO_SHORT = "EARRAYSHORT",
  ARRAY_TOO_LONG = "EARRAYLONG",
  INVALID_ARRAY_ITEM = "EARRAYITEM",
  INVALID_ARRAY_LENGTH = "EARRAYLENGTH",
  DUPLICATE_ARRAY_ITEM = "EARRDUPLICATE",
  ARRAY_VALUES_NOT_UNIQUE = "EARRAYNOTUNIQUE",

  // Object validation errors
  MISSING_REQUIRED_FIELD = "EMISSINGFIELD",
  INVALID_FIELD = "EINVALIDFIELD",
  UNKNOWN_FIELD = "EUNKNOWNFIELD",

  // Conditional validation errors
  CONDITION_ERROR = "ECONDITION",
  SYNTAX_ERROR = "ESYNTAX",

  // URL validation errors
  INVALID_URL = "EINVALIDURL",
  INVALID_URL_ARGUMENT = "EINVALIDURLARG",

  // Email validation errors
  INVALID_EMAIL = "EINVALIDEMAIL",

  // Date validation errors
  INVALID_DATE = "EINVALIDDATE",
  DATE_TOO_EARLY = "EDATEEARLY",
  DATE_TOO_LATE = "EDATELATE",

  // Union validation errors
  INVALID_UNION = "EINVALIDUNION",

  // Constant validation errors
  CONSTANT_ERROR = "ECONSTANT",

  // Password validation errors
  INVALID_PASSWORD = "EPWDVIOLATION",

  // JSON validation errors
  INVALID_JSON = "EINVALIDJSON",

  // Security errors
  SECURITY_VIOLATION = "ESECVIOLATION",

  // URL components validation errors
  INVALID_URL_ARGS = "EINVALIDURLARGS",

  // Network and connection errors
  CONNECTION_REFUSED = "ECONNREFUSED",
  CONNECTION_TIMEOUT = "ECONNECTIONTIMEOUT",
  CONNECTION_RESET = "ECONNRESET",
  NETWORK_UNREACHABLE = "ENETUNREACH",
  HOST_UNREACHABLE = "EHOSTUNREACH",
  ADDRESS_NOT_AVAILABLE = "EADDRNOTAVAIL",

  // HTTP errors
  HTTP_ERROR = "EHTTPERROR",
  REQUEST_TIMEOUT = "EREQUESTTIMEOUT",
  BAD_REQUEST = "EBADREQUEST",
  UNAUTHORIZED = "EUNAUTHORIZED",
  FORBIDDEN = "EFORBIDDEN",
  NOT_FOUND = "ENOTFOUND",
  INTERNAL_SERVER_ERROR = "ESERVERERROR",

  // Generic errors
  VALIDATION_ERROR = "EVALIDATION",
  UNKNOWN_ERROR = "EUNKNOWN",
}

/**
 * Configuration for error message templates and formatting
 */
export interface ErrorConfig {
  includeReceivedValue: boolean;
  maxPathDepth: number;
  maxMessageLength: number;
}
