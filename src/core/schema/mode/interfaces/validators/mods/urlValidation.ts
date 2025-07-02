import { SchemaValidationResult } from "../../../../../types/types";
import { UrlArgs, UrlArgType } from "../../../../../utils/UrlArgs";
import {ErrorHandler } from "../../errors/ErrorHandler";
import { ErrorCode } from "../../errors/types/errors.type";

export function UrlValidation(
  value: any,
  urlArgs: UrlArgType,
  options: {
    allowedProtocols?: string[];
    allowLocalhost?: boolean;
    allowPrivateIPs?: boolean;
    maxLength?: number;
    requireTLD?: boolean;
    allowDataUrls?: boolean;
    allowIPAddresses?: boolean;
  } = {}
): SchemaValidationResult {
  const result: SchemaValidationResult = {
    success: true,
    errors: [],
    warnings: [],
    data: value,
  };
  const type = "url";
  const args = UrlArgs.selectArg(urlArgs);
  // console.log("DEBUG args: ", args);
  // console.log("DEBUG urlArgs: ", urlArgs);
  const rgx = /^url\./;
  if (rgx.test(urlArgs)) {
    const { isValid, error } = UrlArgs.isCorrectArg(urlArgs);
    if (!isValid) {
      result.success = false;
      result.errors.push(
        ErrorHandler.createUrlCValidationErr(
          [],
          error || "Invalid url arg",
          value
        )
      );
      return result;
    }
  }

  // Set default options - Security-focused for "url" type
  const {
    allowedProtocols = args.match.protocols, // Only web protocols by default for security
    allowLocalhost = args.match.allowLocalhost, // Block localhost for security
    allowPrivateIPs = args.match.allowPrivateIPs, // Block private IPs for security
    maxLength = args.match.maxLength,
    requireTLD = args.match.requireTLD, // Require TLD for security
    allowDataUrls = args.match.allowDataUrls, // Block data URLs for security
    allowIPAddresses = args.match.allowIPAddresses, // Block IP addresses for security
  } = options;

  // Check if value is a string
  if (typeof value !== "string") {
    result.success = false;
    result.errors.push(ErrorHandler.createTypeError([], "string", value));
    return result;
  }

  // Check length
  if (value.length > maxLength) {
    result.success = false;
    result.errors.push(
      ErrorHandler.createValidationError(
        [],
        `${type.toUpperCase()} exceeds maximum length of ${maxLength} characters`,
        ErrorCode.SECURITY_VIOLATION
      )
    );
    return result;
  }

  // Check for empty string
  if (!value.trim()) {
    result.success = false;
    result.errors.push(
      ErrorHandler.createUrlCValidationErr(
        [],
        "Empty string",
        ErrorCode.INVALID_URL_ARGS
      )
    );
    return result;
  }

  // Check for spaces in URL (should be encoded)
  if (value.includes(" ")) {
    result.success = false;
    result.errors.push(
      ErrorHandler.createUrlCValidationErr(
        [],
        `${type.toUpperCase()} cannot contain unencoded spaces`,
        ErrorCode.INVALID_URL_ARGS
      )
    );
    return result;
  }

  // Security: Check for malicious patterns
  const maliciousPatterns = [
    /javascript:/i, // JavaScript protocol
    /vbscript:/i, // VBScript protocol
    /data:text\/html/i, // HTML data URLs
    /data:application\/javascript/i, // JS data URLs
    /<script/i, // Script tags in URL
    /on\w+=/i, // Event handlers
  ];

  for (const pattern of maliciousPatterns) {
    if (pattern.test(value)) {
      result.success = false;
      result.errors.push(
        ErrorHandler.createUrlCValidationErr(
          [],
          `${type.toUpperCase()} contains potentially malicious content`,
          ErrorCode.INVALID_URL_ARGS
        )
      );
      return result;
    }
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(value);
  } catch (error) {
    result.success = false;
    result.errors.push(
      ErrorHandler.createUrlCValidationErr(
        [],
        `Invalid ${type.toUpperCase()} format: ${error instanceof Error ? error.message : "Unknown error"}`,
        ErrorCode.INVALID_URL_ARGS
      )
    );
    return result;
  }

  // Protocol validation
  const protocol = parsedUrl.protocol.slice(0, -1); // Remove trailing ':'

  if (allowDataUrls && protocol === "data") {
    // Basic data URL validation
    if (!/^data:[^;]+;base64,/.test(value) && !/^data:[^;]+,/.test(value)) {
      result.success = false;
      result.errors.push(
        ErrorHandler.createUrlCValidationErr(
          [],
          "Invalid data URL format",
          ErrorCode.INVALID_URL_ARGS
        )
      );
    }
    return result;
  }

  if (!allowedProtocols.includes(protocol)) {
    result.success = false;
    result.errors.push(
      ErrorHandler.createUrlCValidationErr(
        [],
        `Protocol '${protocol}' is not allowed. Allowed protocols: ${allowedProtocols.join(
          ", "
        )}`,
        ErrorCode.INVALID_URL_ARGS
      )
    );
    return result;
  }

  // Hostname validation
  const hostname = parsedUrl.hostname;

  // Check for empty hostname (except for file:// and mailto: URLs)
  if (!hostname && protocol !== "file" && protocol !== "mailto") {
    result.success = false;
    result.errors.push(
      ErrorHandler.createUrlCValidationErr(
        [],
        "Hostname is required",
        ErrorCode.INVALID_URL_ARGS
      )
    );
    return result;
  }

  if (hostname) {
    // Check for localhost
    if (
      !allowLocalhost &&
      (hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname === "::1")
    ) {
      result.success = false;
      result.errors.push(
        ErrorHandler.createUrlCValidationErr(
          [],
          "Localhost URLs are not allowed",
          ErrorCode.INVALID_URL_ARGS
        )
      );
      return result;
    }

    // IP address validation
    const isIPv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
    const isIPv6 = hostname.startsWith("[") && hostname.endsWith("]");

    if ((isIPv4 || isIPv6) && !allowIPAddresses) {
      result.success = false;
      result.errors.push(
        ErrorHandler.createUrlCValidationErr(
          [],
          "IP addresses are not allowed",
          ErrorCode.INVALID_URL_ARGS
        )
      );
      return result;
    }

    // Private IP validation
    if (!allowPrivateIPs && isIPv4) {
      const parts = hostname.split(".").map(Number);
      const isPrivate =
        parts[0] === 10 ||
        (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
        (parts[0] === 192 && parts[1] === 168) ||
        (parts[0] === 169 && parts[1] === 254); // Link-local

      if (isPrivate) {
        result.success = false;
        result.errors.push(
          ErrorHandler.createUrlCValidationErr(
            [],
            "Private IP addresses are not allowed",
            ErrorCode.INVALID_URL_ARGS
          )
        );
        return result;
      }
    }

    // TLD validation for domain names (not IP addresses)
    if (requireTLD && !isIPv4 && !isIPv6) {
      const parts = hostname.split(".");
      if (parts.length < 2 || parts[parts.length - 1].length < 2) {
        result.success = false;
        result.errors.push(
          ErrorHandler.createUrlCValidationErr(
            [],
            "Valid top-level domain (TLD) is required",
            ErrorCode.INVALID_URL_ARGS
          )
        );
        return result;
      }
    }

    // Check for suspicious patterns
    if (
      hostname.includes("..") ||
      hostname.startsWith(".") ||
      hostname.endsWith(".")
    ) {
      result.success = false;
      result.errors.push(
        ErrorHandler.createUrlCValidationErr(
          [],
          "Invalid hostname format",
          ErrorCode.INVALID_URL_ARGS
        )
      );
      return result;
    }

    // Domain name character validation
    if (!isIPv4 && !isIPv6 && !/^[a-zA-Z0-9.-]+$/.test(hostname)) {
      result.success = false;
      result.errors.push(
        ErrorHandler.createUrlCValidationErr(
          [],
          "Hostname contains invalid characters",
          ErrorCode.INVALID_URL_ARGS
        )
      );
      return result;
    }
  }

  // Port validation
  if (parsedUrl.port) {
    const port = parseInt(parsedUrl.port, 10);
    if (port < 1 || port > 65535) {
      result.success = false;
      result.errors.push(
        ErrorHandler.createUrlCValidationErr(
          [],
          "Port number must be between 1 and 65535",
          ErrorCode.INVALID_URL_ARGS
        )
      );
      return result;
    }
  }

  // Path validation - check for dangerous patterns
  const path = parsedUrl.pathname;
  if (
    path.includes("/../") ||
    path.includes("/./") ||
    path.endsWith("/..") ||
    path.endsWith("/.")
  ) {
    result.warnings.push(
      "URL path contains potentially dangerous navigation patterns"
    );
  }

  // Additional security checks
  if (value.includes(" ")) {
    result.warnings.push("URL contains spaces which may cause issues");
  }

  // Check for non-ASCII characters in the URL
  if (!/^[\x00-\x7F]*$/.test(value)) {
    result.warnings.push("URL contains non-ASCII characters");
  }
  return result;
}
