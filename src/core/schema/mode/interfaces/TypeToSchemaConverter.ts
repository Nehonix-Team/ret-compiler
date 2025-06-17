/**
 * Runtime Type-to-Schema Conversion System
 * 
 * This module provides runtime logic for converting TypeScript types
 * to validation schemas that work with InterfaceSchema.
 */

import { SchemaInterface } from "../../../types/SchemaValidator.type";

/**
 * Runtime type information that can be extracted from values
 */
export interface RuntimeTypeInfo {
    type: string;
    isArray: boolean;
    isOptional: boolean;
    isRecord: boolean;
    keyType?: string;
    valueType?: string;
    properties?: Record<string, RuntimeTypeInfo>;
}

/**
 * Type-to-Schema Converter
 * Converts runtime type information to schema definitions
 */
export class TypeToSchemaConverter {
    
    /**
     * Analyze a sample value to extract type information
     */
    static analyzeValue(value: any): RuntimeTypeInfo {
        if (value === null || value === undefined) {
            return {
                type: "any",
                isArray: false,
                isOptional: true,
                isRecord: false
            };
        }

        if (Array.isArray(value)) {
            const elementType = value.length > 0 ? this.analyzeValue(value[0]) : { type: "any", isArray: false, isOptional: false, isRecord: false };
            return {
                type: elementType.type,
                isArray: true,
                isOptional: false,
                isRecord: false
            };
        }

        if (typeof value === "object") {
            // Check if it's a Record-like object (all values same type)
            const values = Object.values(value);
            if (values.length > 0) {
                const firstValueType = this.analyzeValue(values[0]);
                const allSameType = values.every(v => this.analyzeValue(v).type === firstValueType.type);
                
                if (allSameType) {
                    return {
                        type: firstValueType.type,
                        isArray: false,
                        isOptional: false,
                        isRecord: true,
                        keyType: "string",
                        valueType: firstValueType.type
                    };
                }
            }

            // Complex object - analyze properties
            const properties: Record<string, RuntimeTypeInfo> = {};
            for (const [key, val] of Object.entries(value)) {
                properties[key] = this.analyzeValue(val);
            }

            return {
                type: "object",
                isArray: false,
                isOptional: false,
                isRecord: false,
                properties
            };
        }

        // Primitive types
        if (typeof value === "string") {
            // Check for special string formats
            if (this.isEmail(value)) return { type: "email", isArray: false, isOptional: false, isRecord: false };
            if (this.isUrl(value)) return { type: "url", isArray: false, isOptional: false, isRecord: false };
            if (this.isUuid(value)) return { type: "uuid", isArray: false, isOptional: false, isRecord: false };
            return { type: "string", isArray: false, isOptional: false, isRecord: false };
        }

        if (typeof value === "number") {
            if (Number.isInteger(value)) {
                if (value > 0) return { type: "positive", isArray: false, isOptional: false, isRecord: false };
                return { type: "int", isArray: false, isOptional: false, isRecord: false };
            }
            return { type: "number", isArray: false, isOptional: false, isRecord: false };
        }

        if (typeof value === "boolean") {
            return { type: "boolean", isArray: false, isOptional: false, isRecord: false };
        }

        if (value instanceof Date) {
            return { type: "date", isArray: false, isOptional: false, isRecord: false };
        }

        return { type: "any", isArray: false, isOptional: false, isRecord: false };
    }

    /**
     * Convert runtime type info to schema string
     */
    static typeInfoToSchema(typeInfo: RuntimeTypeInfo): string {
        let schema = "";

        if (typeInfo.isRecord && typeInfo.keyType && typeInfo.valueType) {
            schema = `record<${typeInfo.keyType},${typeInfo.valueType}>`;
        } else if (typeInfo.isArray) {
            schema = `${typeInfo.type}[]`;
        } else {
            schema = typeInfo.type;
        }

        if (typeInfo.isOptional) {
            schema += "?";
        }

        return schema;
    }

    /**
     * Generate schema interface from sample object
     */
    static generateSchemaFromSample(sample: any): SchemaInterface {
        const typeInfo = this.analyzeValue(sample);
        
        if (typeInfo.type === "object" && typeInfo.properties) {
            const schema: SchemaInterface = {};
            
            for (const [key, propInfo] of Object.entries(typeInfo.properties)) {
                if (propInfo.type === "object" && propInfo.properties) {
                    // Nested object
                    schema[key] = this.generateSchemaFromSample(sample[key]);
                } else {
                    // Simple property
                    schema[key] = this.typeInfoToSchema(propInfo);
                }
            }
            
            return schema;
        }

        // For non-object types, return a simple schema
        return {
            value: this.typeInfoToSchema(typeInfo)
        };
    }

    /**
     * Smart schema generation with type hints
     */
    static generateSchemaWithHints<T>(typeHints?: Partial<Record<keyof T, string>>): SchemaInterface {
        // This method can be enhanced to use type hints for better schema generation
        // For now, return a basic schema that can be extended
        return typeHints as SchemaInterface || {};
    }

    // Helper methods for format detection
    private static isEmail(value: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    private static isUrl(value: string): boolean {
        try {
            new URL(value);
            return true;
        } catch {
            return false;
        }
    }

    private static isUuid(value: string): boolean {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
    }
}

/**
 * Enhanced Make utilities with runtime type conversion
 */
export class RuntimeTypeConverter {
    
    /**
     * Generate schema from sample data
     * This provides runtime type inference from actual values
     */
    static fromSample<T>(sample: T): SchemaInterface {
        return TypeToSchemaConverter.generateSchemaFromSample(sample);
    }

    /**
     * Generate schema with type mapping
     * This allows manual type specification for better control
     */
    static fromTypeMap<T>(typeMap: Record<keyof T, string>): SchemaInterface {
        return typeMap as SchemaInterface;
    }

    /**
     * Hybrid approach: combine sample analysis with type hints
     */
    static fromSampleWithHints<T>(sample: T, hints?: Partial<Record<keyof T, string>>): SchemaInterface {
        const autoSchema = this.fromSample(sample);
        
        if (hints) {
            // Override auto-detected types with hints
            for (const [key, hintType] of Object.entries(hints)) {
                if (key in autoSchema) {
                    (autoSchema as any)[key] = hintType;
                }
            }
        }
        
        return autoSchema;
    }
}
