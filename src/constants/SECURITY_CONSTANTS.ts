export const SECURITY_CONSTANTS = {
  MAX_JSON_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_TEXT_LENGTH: 1024 * 1024, // 1MB
  MAX_VALIDATION_TIME: 5000, // 5 seconds
  DANGEROUS_PROPERTIES: new Set([
    "__proto__",
    "constructor",
    "prototype",
    "valueOf",
    "toString",
    "hasOwnProperty",
    "isPrototypeOf",
    "propertyIsEnumerable",
    "__defineGetter__",
    "__defineSetter__",
    "__lookupGetter__",
    "__lookupSetter__",
  ]),
  XSS_PATTERNS: [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:\s*[^;]*/gi,
    /on\w+\s*=\s*["'][^"']*["']/gi,
    /<iframe\b[^>]*>/gi,
    /<object\b[^>]*>/gi,
    /<embed\b[^>]*>/gi,
    /<form\b[^>]*>/gi,
    /data:\s*text\/html/gi,
    /vbscript:/gi,
    /<meta\b[^>]*http-equiv/gi,
  ],
  SQL_PATTERNS: [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|TRUNCATE|GRANT|REVOKE)\b)/gi,
    /(union\s+select|or\s+1\s*=\s*1|and\s+1\s*=\s*1)/gi,
    /('|--|\*|;|\|\|)/g,
    /(0x[0-9a-fA-F]+|char\(|ascii\(|substring\()/gi,
    /(sleep\(|benchmark\(|waitfor\s+delay)/gi,
  ],
  LDAP_PATTERNS: [/[()&|!]/g, /\*(?!\w)/g, /[\x00-\x1f\x7f]/g],
  COMMAND_INJECTION_PATTERNS: [
    /[;&|`$(){}[\]\\]/g,
    /(curl|wget|nc|netcat|telnet|ssh|ftp|tftp)/gi,
    /(\.\.|\/etc\/|\/bin\/|\/usr\/|\/var\/)/gi,
  ],
} as const;
