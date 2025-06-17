/**
 * Constraint Parser Module
 * 
 * Handles parsing of constraint syntax like "string(3,20)", "number(0,100)?", etc.
 * Extracted from InterfaceSchema to improve maintainability.
 */

export interface ParsedConstraints {
  type: string;
  constraints: any;
  optional: boolean; 
}

/**
 * Parses constraint syntax from field type strings
 */
export class ConstraintParser {
  /**
   * Parse constraint syntax like "string(3,20)", "number(0,100)?", etc.
   */
  static parseConstraints(fieldType: string): ParsedConstraints {
    let optional = false;
    let type = fieldType;
    let constraints: any = {};

    // Check if optional (ends with ?)
    if (type.endsWith("?")) {
      optional = true;
      type = type.slice(0, -1);
    }

    // Parse constraints: "string(3,20)", "number(0,100)", "string[]?(1,10)"
    const constraintMatch = type.match(/^([a-zA-Z\[\]]+)\(([^)]*)\)$/);
    if (constraintMatch) {
      const [, baseType, constraintStr] = constraintMatch;
      type = baseType;

      // Parse constraint parameters
      if (constraintStr.trim()) {
        // Handle regex patterns: "string(/^[a-z]+$/)"
        if (constraintStr.startsWith("/") && constraintStr.endsWith("/")) {
          const pattern = constraintStr.slice(1, -1);
          constraints.pattern = new RegExp(pattern);
        }
        // Handle min,max constraints: "string(3,20)", "number(0,100)"
        else if (constraintStr.includes(",")) {
          const [minStr, maxStr] = constraintStr
            .split(",")
            .map((s) => s.trim());

          if (minStr) {
            const minVal = parseFloat(minStr);
            if (!isNaN(minVal)) {
              if (baseType.includes("[]")) {
                constraints.minItems = minVal;
              } else if (baseType === "string" || baseType.includes("string")) {
                constraints.minLength = minVal;
              } else {
                constraints.min = minVal;
              }
            }
          }

          if (maxStr) {
            const maxVal = parseFloat(maxStr);
            if (!isNaN(maxVal)) {
              if (baseType.includes("[]")) {
                constraints.maxItems = maxVal;
              } else if (baseType === "string" || baseType.includes("string")) {
                constraints.maxLength = maxVal;
              } else {
                constraints.max = maxVal;
              }
            }
          }
        }
        // Handle single value: "string(20)" -> max length
        else {
          const val = parseFloat(constraintStr);
          if (!isNaN(val)) {
            if (baseType.includes("[]")) {
              constraints.maxItems = val;
            } else if (baseType === "string" || baseType.includes("string")) {
              constraints.maxLength = val;
            } else {
              constraints.max = val;
            }
          }
        }
      }
    }

    return { type, constraints, optional };
  }

  /**
   * Check if a field type has constraints
   */
  static hasConstraints(fieldType: string): boolean {
    // Remove optional marker
    const type = fieldType.endsWith("?") ? fieldType.slice(0, -1) : fieldType;
    return /^[a-zA-Z\[\]]+\([^)]*\)$/.test(type);
  }

  /**
   * Extract base type without constraints
   */
  static getBaseType(fieldType: string): string {
    const parsed = this.parseConstraints(fieldType);
    return parsed.type;
  }

  /**
   * Check if field type is optional
   */
  static isOptional(fieldType: string): boolean {
    return fieldType.endsWith("?");
  }

  /**
   * Check if field type is an array
   */
  static isArrayType(fieldType: string): boolean {
    const parsed = this.parseConstraints(fieldType);
    return parsed.type.endsWith("[]");
  }

  /**
   * Get element type for array types
   */
  static getElementType(fieldType: string): string {
    const parsed = this.parseConstraints(fieldType);
    if (parsed.type.endsWith("[]")) {
      return parsed.type.slice(0, -2);
    }
    return parsed.type;
  }

  /**
   * Validate constraint values
   */
  static validateConstraints(constraints: any, type: string): string[] {
    const errors: string[] = [];

    // Validate numeric constraints
    if (constraints.min !== undefined && constraints.max !== undefined) {
      if (constraints.min > constraints.max) {
        errors.push("Minimum value cannot be greater than maximum value");
      }
    }

    // Validate length constraints
    if (constraints.minLength !== undefined && constraints.maxLength !== undefined) {
      if (constraints.minLength > constraints.maxLength) {
        errors.push("Minimum length cannot be greater than maximum length");
      }
    }

    // Validate array constraints
    if (constraints.minItems !== undefined && constraints.maxItems !== undefined) {
      if (constraints.minItems > constraints.maxItems) {
        errors.push("Minimum items cannot be greater than maximum items");
      }
    }

    // Validate negative constraints
    if (constraints.min !== undefined && constraints.min < 0 && type === "positive") {
      errors.push("Positive type cannot have negative minimum value");
    }

    if (constraints.max !== undefined && constraints.max > 0 && type === "negative") {
      errors.push("Negative type cannot have positive maximum value");
    }

    return errors;
  }

  /**
   * Merge constraints with options
   */
  static mergeConstraints(baseOptions: any, constraints: any): any {
    return { ...baseOptions, ...constraints };
  }

  /**
   * Get constraint description for error messages
   */
  static getConstraintDescription(constraints: any, type: string): string {
    const descriptions: string[] = [];

    if (constraints.min !== undefined) {
      descriptions.push(`min: ${constraints.min}`);
    }
    if (constraints.max !== undefined) {
      descriptions.push(`max: ${constraints.max}`);
    }
    if (constraints.minLength !== undefined) {
      descriptions.push(`minLength: ${constraints.minLength}`);
    }
    if (constraints.maxLength !== undefined) {
      descriptions.push(`maxLength: ${constraints.maxLength}`);
    }
    if (constraints.minItems !== undefined) {
      descriptions.push(`minItems: ${constraints.minItems}`);
    }
    if (constraints.maxItems !== undefined) {
      descriptions.push(`maxItems: ${constraints.maxItems}`);
    }
    if (constraints.pattern) {
      descriptions.push(`pattern: ${constraints.pattern.source}`);
    }
    if (constraints.unique) {
      descriptions.push("unique: true");
    }

    return descriptions.length > 0 ? `(${descriptions.join(", ")})` : "";
  }

  /**
   * Parse complex constraint expressions
   */
  static parseComplexConstraints(constraintStr: string): any {
    const constraints: any = {};

    // Handle multiple constraints separated by semicolons
    // Example: "min:0;max:100;pattern:/^[a-z]+$/"
    if (constraintStr.includes(";")) {
      const parts = constraintStr.split(";");
      for (const part of parts) {
        const [key, value] = part.split(":").map(s => s.trim());
        if (key && value) {
          switch (key) {
            case "min":
            case "max":
            case "minLength":
            case "maxLength":
            case "minItems":
            case "maxItems":
              const numValue = parseFloat(value);
              if (!isNaN(numValue)) {
                constraints[key] = numValue;
              }
              break;
            case "pattern":
              if (value.startsWith("/") && value.endsWith("/")) {
                constraints.pattern = new RegExp(value.slice(1, -1));
              }
              break;
            case "unique":
              constraints.unique = value.toLowerCase() === "true";
              break;
          }
        }
      }
    }

    return constraints;
  }
}
