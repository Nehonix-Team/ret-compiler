import { ErrorHandler } from "../schema/mode/interfaces/errors/ErrorHandler";
import { ErrorCode } from "../schema/mode/interfaces/errors/types/errors.type";
import { ValidationError } from "../types/types";

// Helper export function for deep JSON validation
export function validateJsonDeep(
  data: any,
  options: {
    maxDepth: number;
    maxKeys: number;
    maxStringLength: number;
    maxArrayLength: number;
    allowedTypes: string[];
    forbiddenKeys: string[];
    currentDepth: number;
    keyCount: number;
  }
): { success: boolean; errors: ValidationError[]; warnings: string[] } {
  const result = {
    success: true,
    errors: [] as ValidationError[],
    warnings: [] as string[],
  };

  if (options.currentDepth > options.maxDepth) {
    result.success = false;
    result.errors.push(
      ErrorHandler.createError(
        [],
        `Maximum depth of ${options.maxDepth} exceeded`,
        ErrorCode.SECURITY_VIOLATION,
        "valid depth",
        options.currentDepth
      )
    );
    return result;
  }

  const dataType = Array.isArray(data)
    ? "array"
    : data === null
      ? "null"
      : typeof data;

  if (!options.allowedTypes.includes(dataType)) {
    result.success = false;
    result.errors.push(
      ErrorHandler.createSimpleError(
        `Type '${dataType}' is not allowed`,
        ErrorCode.SECURITY_VIOLATION
      )
    );
    return result;
  }

  if (typeof data === "string" && data.length > options.maxStringLength) {
    result.success = false;
    result.errors.push(
      ErrorHandler.createError(
        [],
        `String length exceeds maximum of ${options.maxStringLength}`,
        ErrorCode.SECURITY_VIOLATION,
        `string with length <= ${options.maxStringLength}`,
        data.length
      )
    );
  }

  if (Array.isArray(data)) {
    if (data.length > options.maxArrayLength) {
      result.success = false;
      result.errors.push(
        ErrorHandler.createError(
          [],
          `Array length exceeds maximum of ${options.maxArrayLength}`,
          ErrorCode.SECURITY_VIOLATION,
          `array with length <= ${options.maxArrayLength}`,
          data.length
        )
      );
    }

    for (const item of data) {
      const itemResult = validateJsonDeep(item, {
        ...options,
        currentDepth: options.currentDepth + 1,
      });
      result.success = result.success && itemResult.success;
      result.errors.push(...itemResult.errors);
      result.warnings.push(...itemResult.warnings);
    }
  }

  if (typeof data === "object" && data !== null && !Array.isArray(data)) {
    const keys = Object.keys(data);
    options.keyCount += keys.length;

    if (options.keyCount > options.maxKeys) {
      result.success = false;
      result.errors.push(
        ErrorHandler.createError(
          [],
          `Maximum key count of ${options.maxKeys} exceeded`,
          ErrorCode.SECURITY_VIOLATION,
          `object with <= ${options.maxKeys} keys`,
          options.keyCount
        )
      );
    }

    for (const key of keys) {
      if (options.forbiddenKeys.includes(key)) {
        result.success = false;
        result.errors.push(
          ErrorHandler.createError(
            [key],
            `Forbidden key '${key}' found`,
            ErrorCode.SECURITY_VIOLATION,
            "allowed key",
            key
          )
        );
      }

      const valueResult = validateJsonDeep(data[key], {
        ...options,
        currentDepth: options.currentDepth + 1,
      });
      result.success = result.success && valueResult.success;
      result.errors.push(...valueResult.errors);
      result.warnings.push(...valueResult.warnings);
    }
  }

  return result;
}

// Helper export function for JSON schema validation
export function validateJsonSchema(
  data: any,
  schema: any
): { success: boolean; errors: ValidationError[]; warnings: string[] } {
  // Basic schema validation - you might want to use a proper JSON schema library like Ajv
  const result = {
    success: true,
    errors: [] as ValidationError[],
    warnings: [] as string[],
  };

  if (schema.type) {
    const dataType = Array.isArray(data)
      ? "array"
      : data === null
        ? "null"
        : typeof data;
    if (dataType !== schema.type) {
      result.success = false;
      result.errors.push(
        ErrorHandler.createError(
          [],
          `Expected type '${schema.type}', got '${dataType}'`,
          ErrorCode.TYPE_MISMATCH,
          schema.type,
          data
        )
      );
    }
  }

  if (schema.properties && typeof data === "object" && data !== null) {
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      if (key in data) {
        const propResult = validateJsonSchema(data[key], propSchema);
        result.success = result.success && propResult.success;
        result.errors.push(...propResult.errors);
        result.warnings.push(...propResult.warnings);
      }
    }
  }

  return result;
}

// Helper export function for IPv4 validation
export function validateIPv4(ip: string, strict: boolean): IPValidationResult {
  const ipv4Regex = strict
    ? /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    : /^(?:\d{1,3}\.){3}\d{1,3}$/;

  if (!ipv4Regex.test(ip)) {
    return { valid: false };
  }

  if (strict) {
    const octets = ip.split(".");

    // Check for leading zeros (except for "0" itself)
    for (const octet of octets) {
      if (octet.length > 1 && octet.startsWith("0")) {
        return { valid: false }; // Leading zeros not allowed
      }

      const num = Number(octet);
      if (num < 0 || num > 255) {
        return { valid: false };
      }
    }
  }

  return { valid: true, normalized: ip };
}

// Helper export function for IPv6 validation
export function validateIPv6(ip: string, strict: boolean): IPValidationResult {
  // Improved IPv6 regex that properly handles compressed notation
  const ipv6Regex =
    /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;

  if (!ipv6Regex.test(ip)) {
    return { valid: false };
  }

  return { valid: true, normalized: normalizeIPv6(ip) };
}

// Helper export function for IPv6 normalization
export function normalizeIPv6(ip: string): string {
  // Expand compressed notation and normalize to full form
  if (ip === "::") {
    return "0000:0000:0000:0000:0000:0000:0000:0000";
  }

  if (ip === "::1") {
    return "0000:0000:0000:0000:0000:0000:0000:0001";
  }

  // Handle compressed notation
  if (ip.includes("::")) {
    const parts = ip.split("::");
    const leftParts = parts[0] ? parts[0].split(":") : [];
    const rightParts = parts[1] ? parts[1].split(":") : [];
    const missingParts = 8 - leftParts.length - rightParts.length;

    const fullParts = [
      ...leftParts,
      ...Array(missingParts).fill("0000"),
      ...rightParts,
    ];

    return fullParts.map((part) => part.padStart(4, "0")).join(":");
  }

  // Already full form, just normalize padding
  return ip
    .split(":")
    .map((part) => part.padStart(4, "0"))
    .join(":");
}

// Helper export function for deep object validation
export function validateObjectDeep(
  obj: any,
  maxDepth: number,
  currentDepth: number
): { success: boolean; errors: ValidationError[]; warnings: string[] } {
  const result = {
    success: true,
    errors: [] as ValidationError[],
    warnings: [] as string[],
  };

  if (currentDepth > maxDepth) {
    result.success = false;
    result.errors.push(
      ErrorHandler.createError(
        [],
        `Maximum object depth of ${maxDepth} exceeded`,
        ErrorCode.SECURITY_VIOLATION,
        `object with depth <= ${maxDepth}`,
        currentDepth
      )
    );
    return result;
  }

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      const deepResult = validateObjectDeep(value, maxDepth, currentDepth + 1);
      result.success = result.success && deepResult.success;
      result.errors.push(...deepResult.errors);
      result.warnings.push(...deepResult.warnings);
    }
  }

  return result;
}

// Helper export function for object schema validation
export function validateObjectSchema(
  obj: any,
  schema: any
): { success: boolean; errors: ValidationError[]; warnings: string[] } {
  const result = {
    success: true,
    errors: [] as ValidationError[],
    warnings: [] as string[],
  };

  if (schema.type && schema.type !== "object") {
    result.success = false;
    result.errors.push(
      ErrorHandler.createError(
        [],
        `Expected object type in schema`,
        ErrorCode.TYPE_MISMATCH,
        "object",
        schema.type
      )
    );
    return result;
  }

  if (schema.properties) {
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      if (key in obj) {
        const propResult = validateJsonSchema(obj[key], propSchema);
        result.success = result.success && propResult.success;
        result.errors.push(...propResult.errors);
        result.warnings.push(...propResult.warnings);
      }
    }
  }

  return result;
}

// Helper interface for IP validation results
export interface IPValidationResult {
  valid: boolean;
  normalized?: string;
}
