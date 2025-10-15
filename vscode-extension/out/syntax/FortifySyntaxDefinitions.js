"use strict";
/**
 * Centralized ReliantType Syntax Definitions
 *
 * Single source of truth for all ReliantType syntax elements.
 * This makes it easy to add, edit, or remove syntax features across the entire extension.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FortifySyntaxUtils = void 0;
const OPERATORS_1 = require("./mods/definitions/OPERATORS");
const FORTIFY_TYPES_1 = require("./mods/definitions/FORTIFY_TYPES");
const FORTIFY_METHODS_1 = require("./mods/definitions/FORTIFY_METHODS");
/**
 * Utility functions for working with syntax definitions
 */
class FortifySyntaxUtils {
    /**
     * Get all type names
     */
    static getAllTypeNames() {
        return FORTIFY_TYPES_1.FORTIFY_TYPES.map((T) => T.name);
    }
    /**
     * Get types by category
     */
    static getTypesByCategory(category) {
        return FORTIFY_TYPES_1.FORTIFY_TYPES.filter((type) => type.category === category);
    }
    /**
     * Get all operator symbols
     */
    static getAllOperatorSymbols() {
        return OPERATORS_1.FORTIFY_OPERATORS.map((op) => op.symbol);
    }
    /**
     * Get operators by category
     */
    static getOperatorsByCategory(category) {
        return OPERATORS_1.FORTIFY_OPERATORS.filter((op) => op.category === category);
    }
    /**
     * Get all method names
     */
    static getAllMethodNames() {
        return FORTIFY_METHODS_1.FORTIFY_METHODS.map((m) => m.name);
    }
    /**
     * Get method names that support negation
     */
    static getNegatableMethodNames() {
        return FORTIFY_METHODS_1.FORTIFY_METHODS.filter((method) => method.supportsNegation).map((method) => method.name);
    }
    /**
     * Check if a string is a valid type
     */
    static isValidType(typeName) {
        const baseType = typeName.replace(/[\?\[\]]/g, "");
        return this.getAllTypeNames().includes(baseType);
    }
    /**
     * Check if a string is a valid operator
     */
    static isValidOperator(operator) {
        return this.getAllOperatorSymbols().includes(operator);
    }
    /**
     * Check if a string is a valid method
     */
    static isValidMethod(methodName) {
        const baseMethod = methodName.replace(/^!/, "");
        return this.getAllMethodNames().includes(baseMethod);
    }
    /**
     * Get type definition by name
     */
    static getTypeDefinition(typeName) {
        return FORTIFY_TYPES_1.FORTIFY_TYPES.find((type) => type.name === typeName);
    }
    /**
     * Get operator definition by symbol
     */
    static getOperatorDefinition(symbol) {
        return OPERATORS_1.FORTIFY_OPERATORS.find((op) => op.symbol === symbol);
    }
    /**
     * Get method definition by name
     */
    static getMethodDefinition(methodName) {
        const baseMethod = methodName.replace(/^!/, "");
        return FORTIFY_METHODS_1.FORTIFY_METHODS.find((method) => method.name === baseMethod);
    }
}
exports.FortifySyntaxUtils = FortifySyntaxUtils;
//# sourceMappingURL=FortifySyntaxDefinitions.js.map