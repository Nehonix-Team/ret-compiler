/**
 * Validation Engine - Core validation logic for schema extensions
 * 
 * This module provides the core validation engine that powers all schema extensions.
 * It handles type checking, constraint validation, and error reporting.
 */

import { SchemaInterface } from "../../mode/interfaces/Interface";

/**
 * Core validation engine for schema validation
 */
export class ValidationEngine {
    /**
     * Validate a value against a schema field definition
     */
    static validateField(fieldSchema: any, value: any): ValidationFieldResult {
        const errors: string[] = [];
        
        if (typeof fieldSchema === "string") {
            const result = this.validateStringSchema(fieldSchema, value);
            return result;
        }
        
        if (typeof fieldSchema === "object" && !Array.isArray(fieldSchema)) {
            return this.validateObjectSchema(fieldSchema, value);
        }
        
        // Default: accept any value
        return { isValid: true, errors: [] };
    }
    
    /**
     * Validate against string-based schema definitions
     */
    private static validateStringSchema(fieldSchema: string, value: any): ValidationFieldResult {
        const errors: string[] = [];
        const isOptional = fieldSchema.includes("?");
        const cleanType = fieldSchema.replace("?", "");
        
        // Handle null/undefined for optional fields
        if (isOptional && (value === null || value === undefined)) {
            return { isValid: true, errors: [] };
        }
        
        // Required field cannot be null/undefined
        if (!isOptional && (value === null || value === undefined)) {
            errors.push(`Field is required but received ${value}`);
            return { isValid: false, errors };
        }
        
        // Type-specific validation
        switch (cleanType) {
            case "email":
                return this.validateEmail(value);
            case "url":
                return this.validateUrl(value);
            case "uuid":
                return this.validateUuid(value);
            case "number":
                return this.validateNumber(value);
            case "positive":
                return this.validatePositiveNumber(value);
            case "int":
                return this.validateInteger(value);
            case "boolean":
                return this.validateBoolean(value);
            case "date":
                return this.validateDate(value);
            case "string":
                return this.validateString(value);
            default:
                // Handle string constraints and arrays
                if (cleanType.startsWith("string")) {
                    return this.validateStringWithConstraints(cleanType, value);
                }
                
                if (cleanType.includes("[]")) {
                    return this.validateArray(cleanType, value);
                }
                
                return { isValid: true, errors: [] };
        }
    }
    
    /**
     * Validate against object schema definitions
     */
    private static validateObjectSchema(fieldSchema: any, value: any): ValidationFieldResult {
        const errors: string[] = [];
        
        if (typeof value !== "object" || value === null) {
            errors.push("Expected object but received " + typeof value);
            return { isValid: false, errors };
        }
        
        // Validate all nested fields
        for (const [nestedField, nestedSchema] of Object.entries(fieldSchema)) {
            const nestedResult = this.validateField(nestedSchema, value[nestedField]);
            if (!nestedResult.isValid) {
                errors.push(...nestedResult.errors.map(err => `${nestedField}: ${err}`));
            }
        }
        
        return { isValid: errors.length === 0, errors };
    }
    
    /**
     * Email validation
     */
    private static validateEmail(value: any): ValidationFieldResult {
        if (typeof value !== "string") {
            return { isValid: false, errors: ["Email must be a string"] };
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            return { isValid: false, errors: ["Invalid email format"] };
        }
        
        return { isValid: true, errors: [] };
    }
    
    /**
     * URL validation
     */
    private static validateUrl(value: any): ValidationFieldResult {
        if (typeof value !== "string") {
            return { isValid: false, errors: ["URL must be a string"] };
        }
        
        try {
            new URL(value);
            return { isValid: true, errors: [] };
        } catch {
            return { isValid: false, errors: ["Invalid URL format"] };
        }
    }
    
    /**
     * UUID validation
     */
    private static validateUuid(value: any): ValidationFieldResult {
        if (typeof value !== "string") {
            return { isValid: false, errors: ["UUID must be a string"] };
        }
        
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(value)) {
            return { isValid: false, errors: ["Invalid UUID format"] };
        }
        
        return { isValid: true, errors: [] };
    }
    
    /**
     * Number validation
     */
    private static validateNumber(value: any): ValidationFieldResult {
        if (typeof value !== "number" || isNaN(value)) {
            return { isValid: false, errors: ["Must be a valid number"] };
        }
        
        return { isValid: true, errors: [] };
    }
    
    /**
     * Positive number validation
     */
    private static validatePositiveNumber(value: any): ValidationFieldResult {
        const numberResult = this.validateNumber(value);
        if (!numberResult.isValid) return numberResult;
        
        if (value <= 0) {
            return { isValid: false, errors: ["Must be a positive number"] };
        }
        
        return { isValid: true, errors: [] };
    }
    
    /**
     * Integer validation
     */
    private static validateInteger(value: any): ValidationFieldResult {
        const numberResult = this.validateNumber(value);
        if (!numberResult.isValid) return numberResult;
        
        if (!Number.isInteger(value)) {
            return { isValid: false, errors: ["Must be an integer"] };
        }
        
        return { isValid: true, errors: [] };
    }
    
    /**
     * Boolean validation
     */
    private static validateBoolean(value: any): ValidationFieldResult {
        if (typeof value !== "boolean") {
            return { isValid: false, errors: ["Must be a boolean"] };
        }
        
        return { isValid: true, errors: [] };
    }
    
    /**
     * Date validation
     */
    private static validateDate(value: any): ValidationFieldResult {
        if (value instanceof Date) {
            return { isValid: true, errors: [] };
        }
        
        if (typeof value === "string" && !isNaN(Date.parse(value))) {
            return { isValid: true, errors: [] };
        }
        
        return { isValid: false, errors: ["Must be a valid date"] };
    }
    
    /**
     * String validation
     */
    private static validateString(value: any): ValidationFieldResult {
        if (typeof value !== "string") {
            return { isValid: false, errors: ["Must be a string"] };
        }
        
        return { isValid: true, errors: [] };
    }
    
    /**
     * String validation with constraints
     */
    private static validateStringWithConstraints(cleanType: string, value: any): ValidationFieldResult {
        const stringResult = this.validateString(value);
        if (!stringResult.isValid) return stringResult;
        
        const errors: string[] = [];
        const match = cleanType.match(/string\((\d+)?,?(\d+)?\)/);
        
        if (match) {
            const minLength = match[1] ? parseInt(match[1]) : 0;
            const maxLength = match[2] ? parseInt(match[2]) : Infinity;
            
            if (value.length < minLength) {
                errors.push(`String must be at least ${minLength} characters long`);
            }
            
            if (value.length > maxLength) {
                errors.push(`String must be at most ${maxLength} characters long`);
            }
        }
        
        return { isValid: errors.length === 0, errors };
    }
    
    /**
     * Array validation
     */
    private static validateArray(cleanType: string, value: any): ValidationFieldResult {
        if (!Array.isArray(value)) {
            return { isValid: false, errors: ["Must be an array"] };
        }
        
        const elementType = cleanType.replace("[]", "");
        const errors: string[] = [];
        
        value.forEach((item, index) => {
            const itemResult = this.validateField(elementType, item);
            if (!itemResult.isValid) {
                errors.push(...itemResult.errors.map(err => `[${index}]: ${err}`));
            }
        });
        
        return { isValid: errors.length === 0, errors };
    }
    
    /**
     * Validate entire object against schema
     */
    static validateObject(schema: SchemaInterface, data: any): ValidationResult {
        const errors: Record<string, string[]> = {};
        let isValid = true;
        
        if (!data || typeof data !== "object") {
            return {
                isValid: false,
                data,
                errors: { _root: ["Expected object but received " + typeof data] },
                timestamp: new Date()
            };
        }
        
        // Validate each field in the schema
        for (const [fieldName, fieldSchema] of Object.entries(schema)) {
            const fieldResult = this.validateField(fieldSchema, data[fieldName]);
            
            if (!fieldResult.isValid) {
                errors[fieldName] = fieldResult.errors;
                isValid = false;
            }
        }
        
        return {
            isValid,
            data,
            errors,
            timestamp: new Date()
        };
    }
}

/**
 * Type definitions
 */
export interface ValidationFieldResult {
    isValid: boolean;
    errors: string[];
}

export interface ValidationResult {
    isValid: boolean;
    data: any;
    errors: Record<string, string[]>;
    timestamp: Date;
}
