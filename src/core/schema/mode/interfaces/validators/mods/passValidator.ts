import { SchemaValidationResult } from "../../../../../types/types";

/**
 * Password validation with comprehensive security checks
 */
export function validatePassword(
  value: any,
  options: {
    minLength?: number;
    maxLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSpecialChars?: boolean;
    minUppercase?: number;
    minLowercase?: number;
    minNumbers?: number;
    minSpecialChars?: number;
    allowedSpecialChars?: string;
    forbiddenPatterns?: string[];
    forbiddenWords?: string[];
    preventCommonPasswords?: boolean;
    preventPersonalInfo?: string[];
    maxRepeatingChars?: number;
    maxSequentialChars?: number;
    preventKeyboardPatterns?: boolean;
    entropyThreshold?: number;
  } = {}
): SchemaValidationResult {
  const result: SchemaValidationResult = {
    success: true,
    errors: [],
    warnings: [],
    data: value,
  };

  // Set default options - Secure defaults for "password" type
  const {
    minLength = 8, // Minimum 8 characters for security
    maxLength = 128,
    requireUppercase = true, // Require uppercase for security
    requireLowercase = true, // Require lowercase for security
    requireNumbers = true, // Require numbers for security
    requireSpecialChars = true, // Require special chars for security
    minUppercase = 1,
    minLowercase = 1,
    minNumbers = 1,
    minSpecialChars = 1,
    allowedSpecialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?",
    forbiddenPatterns = [],
    forbiddenWords = [],
    preventCommonPasswords = true, // Check common passwords for security
    preventPersonalInfo = [],
    maxRepeatingChars = 3, // Prevent "aaaa" patterns
    maxSequentialChars = 3, // Prevent "1234" patterns
    preventKeyboardPatterns = true, // Prevent "qwerty" patterns
    entropyThreshold = 40, // Minimum entropy for security
  } = options;

  // Check if value is a string
  if (typeof value !== "string") {
    result.success = false;
    result.errors.push("Expected string for password");
    return result;
  }

  const password = value;

  // Length validation
  if (password.length < minLength) {
    result.success = false;
    result.errors.push(
      `Password must be at least ${minLength} characters long`
    );
  }

  if (password.length > maxLength) {
    result.success = false;
    result.errors.push(`Password must not exceed ${maxLength} characters`);
  }

  // Continue with comprehensive password validation for security

  // Character type validation
  const uppercaseCount = (password.match(/[A-Z]/g) || []).length;
  const lowercaseCount = (password.match(/[a-z]/g) || []).length;
  const numberCount = (password.match(/[0-9]/g) || []).length;
  const specialCharCount = (
    password.match(new RegExp(`[${escapeRegExp(allowedSpecialChars)}]`, "g")) ||
    []
  ).length;

  if (requireUppercase && uppercaseCount < minUppercase) {
    result.success = false;
    result.errors.push(
      `Password must contain at least ${minUppercase} uppercase letter(s)`
    );
  }

  if (requireLowercase && lowercaseCount < minLowercase) {
    result.success = false;
    result.errors.push(
      `Password must contain at least ${minLowercase} lowercase letter(s)`
    );
  }

  if (requireNumbers && numberCount < minNumbers) {
    result.success = false;
    result.errors.push(
      `Password must contain at least ${minNumbers} number(s)`
    );
  }

  if (requireSpecialChars && specialCharCount < minSpecialChars) {
    result.success = false;
    result.errors.push(
      `Password must contain at least ${minSpecialChars} special character(s): ${allowedSpecialChars}`
    );
  }

  // Check for invalid special characters
  const invalidSpecialChars = password
    .replace(/[a-zA-Z0-9]/g, "")
    .replace(new RegExp(`[${escapeRegExp(allowedSpecialChars)}]`, "g"), "");
  if (invalidSpecialChars.length > 0) {
    result.success = false;
    result.errors.push(
      `Password contains invalid special characters: ${[...new Set(invalidSpecialChars)].join("")}`
    );
  }

  // Repeating characters check
  if (maxRepeatingChars > 0) {
    const repeatingPattern = new RegExp(`(.)\\1{${maxRepeatingChars},}`, "i");
    if (repeatingPattern.test(password)) {
      result.success = false;
      result.errors.push(
        `Password cannot contain more than ${maxRepeatingChars} consecutive identical characters`
      );
    }
  }

  // Sequential characters check
  if (maxSequentialChars > 0) {
    if (hasSequentialChars(password, maxSequentialChars)) {
      result.success = false;
      result.errors.push(
        `Password cannot contain more than ${maxSequentialChars} sequential characters`
      );
    }
  }

  // Keyboard pattern check
  if (preventKeyboardPatterns && hasKeyboardPatterns(password)) {
    result.success = false;
    result.errors.push("Password cannot contain common keyboard patterns");
  }

  // Common passwords check
  if (preventCommonPasswords && isCommonPassword(password.toLowerCase())) {
    result.success = false;
    result.errors.push("Password is too common and easily guessable");
  }

  // Personal information check
  if (preventPersonalInfo.length > 0) {
    for (const info of preventPersonalInfo) {
      if (info && password.toLowerCase().includes(info.toLowerCase())) {
        result.success = false;
        result.errors.push("Password cannot contain personal information");
        break;
      }
    }
  }

  // Forbidden patterns check
  for (const pattern of forbiddenPatterns) {
    if (new RegExp(pattern, "i").test(password)) {
      result.success = false;
      result.errors.push("Password contains forbidden pattern");
      break;
    }
  }

  // Forbidden words check
  for (const word of forbiddenWords) {
    if (password.toLowerCase().includes(word.toLowerCase())) {
      result.success = false;
      result.errors.push("Password contains forbidden word");
      break;
    }
  }

  // Entropy calculation for password strength
  const entropy = calculatePasswordEntropy(password);
  if (entropy < entropyThreshold) {
    result.warnings.push(
      `Password entropy is low (${entropy.toFixed(1)} bits). Consider using a more complex password.`
    );
  }

  // Additional warnings for better security
  if (password.length < 12) {
    result.warnings.push(
      "Consider using a password with 12+ characters for better security"
    );
  }

  if (
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/[0-9]/.test(password) ||
    !new RegExp(`[${escapeRegExp(allowedSpecialChars)}]`).test(password)
  ) {
    result.warnings.push(
      "Password would be stronger with a mix of uppercase, lowercase, numbers, and special characters"
    );
  }

  // Check for dictionary words
  if (containsDictionaryWords(password)) {
    result.warnings.push(
      "Password contains dictionary words which may reduce security"
    );
  }

  return result;
}

// Helper functions
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasSequentialChars(password: string, maxSequential: number): boolean {
  const sequences = [
    "abcdefghijklmnopqrstuvwxyz",
    "0123456789",
    "qwertyuiop",
    "asdfghjkl",
    "zxcvbnm",
  ];

  for (const sequence of sequences) {
    for (let i = 0; i <= sequence.length - maxSequential - 1; i++) {
      const forward = sequence.substr(i, maxSequential + 1);
      const backward = forward.split("").reverse().join("");

      if (
        password.toLowerCase().includes(forward) ||
        password.toLowerCase().includes(backward)
      ) {
        return true;
      }
    }
  }
  return false;
}

function hasKeyboardPatterns(password: string): boolean {
  const patterns = [
    "qwerty",
    "qwertz",
    "azerty",
    "asdfgh",
    "zxcvbn",
    "123456",
    "654321",
    "abcdef",
    "fedcba",
    "qweasd",
    "asdzxc",
    "147258",
    "741852",
  ];

  const lowerPassword = password.toLowerCase();
  return patterns.some((pattern) => lowerPassword.includes(pattern));
}

function isCommonPassword(password: string): boolean {
  const commonPasswords = [
    "password",
    "123456",
    "123456789",
    "qwerty",
    "abc123",
    "password123",
    "admin",
    "letmein",
    "welcome",
    "monkey",
    "1234567890",
    "dragon",
    "sunshine",
    "princess",
    "football",
    "baseball",
    "superman",
    "hello",
    "freedom",
    "whatever",
    "batman",
    "shadow",
    "master",
    "love",
    "lovely",
    "flower",
    "jesus",
    "charlie",
    "donald",
    "trustno1",
  ];

  return (
    commonPasswords.includes(password) ||
    commonPasswords.some((common) => password.includes(common))
  );
}

function containsDictionaryWords(password: string): boolean {
  const commonWords = [
    "love",
    "hate",
    "good",
    "bad",
    "home",
    "work",
    "life",
    "time",
    "year",
    "day",
    "night",
    "morning",
    "evening",
    "family",
    "friend",
  ];

  const lowerPassword = password.toLowerCase();
  return commonWords.some((word) => lowerPassword.includes(word));
}

function calculatePasswordEntropy(password: string): number {
  let charset = 0;

  if (/[a-z]/.test(password)) charset += 26;
  if (/[A-Z]/.test(password)) charset += 26;
  if (/[0-9]/.test(password)) charset += 10;
  if (/[^a-zA-Z0-9]/.test(password)) charset += 32;

  return Math.log2(Math.pow(charset, password.length));
}
