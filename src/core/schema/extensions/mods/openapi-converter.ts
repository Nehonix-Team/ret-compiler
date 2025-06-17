/**
 * OpenAPI Converter - Convert schemas to OpenAPI specifications
 * 
 * This module provides utilities to convert Fortify Schema definitions
 * to OpenAPI 3.0 specifications for API documentation.
 */

import { SchemaInterface } from "../../mode/interfaces/Interface";

/**
 * OpenAPI converter for schema definitions
 */
export class OpenAPIConverter {
    /**
     * Convert a schema to OpenAPI format
     */
    static convertSchema(schema: SchemaInterface): OpenAPISchemaObject {
        const properties: Record<string, any> = {};
        const required: string[] = [];
        
        Object.entries(schema).forEach(([fieldName, fieldType]) => {
            const openApiProperty = this.convertField(fieldType);
            properties[fieldName] = openApiProperty.schema;
            
            if (openApiProperty.required) {
                required.push(fieldName);
            }
        });
        
        return {
            type: "object",
            properties,
            required: required.length > 0 ? required : undefined
        };
    }
    
    /**
     * Convert a single field to OpenAPI property
     */
    private static convertField(fieldType: any): { schema: any; required: boolean } {
        if (typeof fieldType === "string") {
            return this.convertStringField(fieldType);
        }
        
        if (typeof fieldType === "object" && !Array.isArray(fieldType)) {
            return this.convertObjectField(fieldType);
        }
        
        // Fallback
        return {
            schema: { type: "string" },
            required: true
        };
    }
    
    /**
     * Convert string-based field definitions
     */
    private static convertStringField(fieldType: string): { schema: any; required: boolean } {
        const isOptional = fieldType.includes("?");
        const cleanType = fieldType.replace("?", "");
        
        // Handle string types with constraints
        if (cleanType.startsWith("string")) {
            const constraints = this.parseStringConstraints(cleanType);
            return {
                schema: {
                    type: "string",
                    ...constraints
                },
                required: !isOptional
            };
        }
        
        // Handle specific string formats
        const formatMappings: Record<string, any> = {
            email: { type: "string", format: "email" },
            url: { type: "string", format: "uri" },
            uuid: { type: "string", format: "uuid" },
            date: { type: "string", format: "date-time" },
            phone: { type: "string", pattern: "^\\+?[1-9]\\d{1,14}$" }
        };
        
        if (formatMappings[cleanType]) {
            return {
                schema: formatMappings[cleanType],
                required: !isOptional
            };
        }
        
        // Handle number types
        if (cleanType === "number") {
            return {
                schema: { type: "number" },
                required: !isOptional
            };
        }
        
        if (cleanType === "positive") {
            return {
                schema: { 
                    type: "number", 
                    minimum: 0,
                    exclusiveMinimum: true
                },
                required: !isOptional
            };
        }
        
        if (cleanType === "int") {
            return {
                schema: { type: "integer" },
                required: !isOptional
            };
        }
        
        // Handle boolean
        if (cleanType === "boolean") {
            return {
                schema: { type: "boolean" },
                required: !isOptional
            };
        }
        
        // Handle arrays
        if (cleanType.includes("[]")) {
            const itemType = cleanType.replace("[]", "");
            const itemSchema = this.convertField(itemType).schema;
            return {
                schema: {
                    type: "array",
                    items: itemSchema
                },
                required: !isOptional
            };
        }
        
        // Default to string
        return {
            schema: { type: "string" },
            required: !isOptional
        };
    }
    
    /**
     * Convert object field definitions
     */
    private static convertObjectField(fieldType: any): { schema: any; required: boolean } {
        const nestedProperties: Record<string, any> = {};
        const nestedRequired: string[] = [];
        
        Object.entries(fieldType).forEach(([nestedField, nestedType]) => {
            const nestedProperty = this.convertField(nestedType);
            nestedProperties[nestedField] = nestedProperty.schema;
            if (nestedProperty.required) {
                nestedRequired.push(nestedField);
            }
        });
        
        return {
            schema: {
                type: "object",
                properties: nestedProperties,
                required: nestedRequired.length > 0 ? nestedRequired : undefined
            },
            required: true
        };
    }
    
    /**
     * Parse string constraints from string(min,max) format
     */
    private static parseStringConstraints(stringType: string): any {
        const constraints: any = {};
        
        const match = stringType.match(/string\((\d+)?,?(\d+)?\)/);
        if (match) {
            if (match[1]) constraints.minLength = parseInt(match[1]);
            if (match[2]) constraints.maxLength = parseInt(match[2]);
        }
        
        return constraints;
    }
    
    /**
     * Generate complete OpenAPI specification
     */
    static generateOpenAPISpec(
        schema: SchemaInterface, 
        options: OpenAPISpecOptions
    ): OpenAPISpecification {
        const schemaObject = this.convertSchema(schema);
        
        return {
            openapi: "3.0.0",
            info: {
                title: options.title,
                version: options.version,
                description: options.description
            },
            servers: options.servers?.map(url => ({ url })) || [],
            components: {
                schemas: {
                    [options.schemaName || options.title]: schemaObject
                }
            },
            paths: options.paths || {}
        };
    }
    
    /**
     * Generate schema reference for use in OpenAPI paths
     */
    static generateSchemaReference(schemaName: string): OpenAPIReference {
        return {
            $ref: `#/components/schemas/${schemaName}`
        };
    }
    
    /**
     * Generate request body specification
     */
    static generateRequestBody(
        schema: SchemaInterface,
        options: RequestBodyOptions = {}
    ): OpenAPIRequestBody {
        const schemaObject = this.convertSchema(schema);
        
        return {
            description: options.description || "Request body",
            required: options.required !== false,
            content: {
                "application/json": {
                    schema: schemaObject,
                    examples: options.examples
                }
            }
        };
    }
    
    /**
     * Generate response specification
     */
    static generateResponse(
        schema: SchemaInterface,
        options: ResponseOptions = {}
    ): OpenAPIResponse {
        const schemaObject = this.convertSchema(schema);
        
        return {
            description: options.description || "Successful response",
            content: {
                "application/json": {
                    schema: schemaObject,
                    examples: options.examples
                }
            },
            headers: options.headers
        };
    }
}

/**
 * Type definitions
 */
export interface OpenAPISchemaObject {
    type: string;
    properties?: Record<string, any>;
    required?: string[];
    items?: any;
    format?: string;
    pattern?: string;
    minimum?: number;
    maximum?: number;
    exclusiveMinimum?: boolean;
    exclusiveMaximum?: boolean;
    minLength?: number;
    maxLength?: number;
    minItems?: number;
    maxItems?: number;
}

export interface OpenAPISpecOptions {
    title: string;
    version: string;
    description?: string;
    schemaName?: string;
    servers?: string[];
    paths?: Record<string, any>;
}

export interface OpenAPISpecification {
    openapi: string;
    info: {
        title: string;
        version: string;
        description?: string;
    };
    servers?: Array<{ url: string }>;
    components: {
        schemas: Record<string, OpenAPISchemaObject>;
    };
    paths: Record<string, any>;
}

export interface OpenAPIReference {
    $ref: string;
}

export interface RequestBodyOptions {
    description?: string;
    required?: boolean;
    examples?: Record<string, any>;
}

export interface OpenAPIRequestBody {
    description: string;
    required: boolean;
    content: Record<string, {
        schema: OpenAPISchemaObject;
        examples?: Record<string, any>;
    }>;
}

export interface ResponseOptions {
    description?: string;
    examples?: Record<string, any>;
    headers?: Record<string, any>;
}

export interface OpenAPIResponse {
    description: string;
    content: Record<string, {
        schema: OpenAPISchemaObject;
        examples?: Record<string, any>;
    }>;
    headers?: Record<string, any>;
}
