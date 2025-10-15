/**
 * Centralized ReliantType Syntax Definitions
 *
 * Single source of truth for all ReliantType syntax elements.
 * This makes it easy to add, edit, or remove syntax features across the entire extension.
 */

import { FORTIFY_OPERATORS } from "./mods/definitions/OPERATORS";
import { MethodDefinition, OperatorDefinition, TypeDefinition } from "../types";
import { FORTIFY_TYPES } from "./mods/definitions/FORTIFY_TYPES";
import { FORTIFY_METHODS } from "./mods/definitions/FORTIFY_METHODS";

/**
 * Utility functions for working with syntax definitions
 */
export class FortifySyntaxUtils {
  /**
   * Get all type names
   */
  static getAllTypeNames(): string[] {
    return FORTIFY_TYPES.map((T) => T.name);
  }

  /**
   * Get types by category
   */
  static getTypesByCategory(
    category: TypeDefinition["category"]
  ): TypeDefinition[] {
    return FORTIFY_TYPES.filter((type) => type.category === category);
  }

  /**
   * Get all operator symbols
   */
  static getAllOperatorSymbols(): string[] {
    return FORTIFY_OPERATORS.map((op) => op.symbol);
  }

  /**
   * Get operators by category
   */
  static getOperatorsByCategory(
    category: OperatorDefinition["category"]
  ): OperatorDefinition[] {
    return FORTIFY_OPERATORS.filter((op) => op.category === category);
  }

  /**
   * Get all method names
   */
  static getAllMethodNames(): string[] {
    return FORTIFY_METHODS.map((m) => m.name);
  }

  /**
   * Get method names that support negation
   */
  static getNegatableMethodNames(): string[] {
    return FORTIFY_METHODS.filter((method) => method.supportsNegation).map(
      (method) => method.name
    );
  }

  /**
   * Check if a string is a valid type
   */
  static isValidType(typeName: string): boolean {
    const baseType = typeName.replace(/[\?\[\]]/g, "");
    return this.getAllTypeNames().includes(baseType);
  }

  /**
   * Check if a string is a valid operator
   */
  static isValidOperator(operator: string): boolean {
    return this.getAllOperatorSymbols().includes(operator);
  }

  /**
   * Check if a string is a valid method
   */
  static isValidMethod(methodName: string): boolean {
    const baseMethod = methodName.replace(/^!/, "");
    return this.getAllMethodNames().includes(baseMethod);
  }

  /**
   * Get type definition by name
   */
  static getTypeDefinition(typeName: string): TypeDefinition | undefined {
    return FORTIFY_TYPES.find((type) => type.name === typeName);
  }

  /**
   * Get operator definition by symbol
   */
  static getOperatorDefinition(symbol: string): OperatorDefinition | undefined {
    return FORTIFY_OPERATORS.find((op) => op.symbol === symbol);
  }

  /**
   * Get method definition by name
   */
  static getMethodDefinition(methodName: string): MethodDefinition | undefined {
    const baseMethod = methodName.replace(/^!/, "");
    return FORTIFY_METHODS.find((method) => method.name === baseMethod);
  }
}
