import { OpenAPIOptions, OpenAPISpec } from "../../../../types/extension.type";
import { SchemaInterface } from "../../../../types/SchemaValidator.type";

/**
 * OpenAPI generator
 */
export class OpenAPIGenerator {
    constructor(
        private schema: SchemaInterface,
        private options: OpenAPIOptions
    ) {}

    generate(): OpenAPISpec {
        return {
            openapi: "3.0.0",
            info: {
                title: this.options.title,
                version: this.options.version
            },
            servers: this.options.servers?.map(url => ({ url })) || [],
            components: {
                schemas: {
                    [this.options.title]: this.convertSchema()
                }
            }
        };
    }

    private convertSchema(): any {
        const properties: any = {};
        const required: string[] = [];

        Object.entries(this.schema).forEach(([fieldName, fieldType]) => {
            const openApiProperty = this.convertFieldToOpenAPIProperty(fieldName, fieldType);
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

    private convertFieldToOpenAPIProperty(_fieldName: string, fieldType: any): { schema: any; required: boolean } {
        if (typeof fieldType === "string") {
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
            if (cleanType === "email") {
                return {
                    schema: { type: "string", format: "email" },
                    required: !isOptional
                };
            }

            if (cleanType === "url") {
                return {
                    schema: { type: "string", format: "uri" },
                    required: !isOptional
                };
            }

            if (cleanType === "uuid") {
                return {
                    schema: { type: "string", format: "uuid" },
                    required: !isOptional
                };
            }

            if (cleanType === "date") {
                return {
                    schema: { type: "string", format: "date-time" },
                    required: !isOptional
                };
            }

            // Handle number types
            if (cleanType === "number" || cleanType === "positive" || cleanType === "int") {
                const schema: any = { type: cleanType === "int" ? "integer" : "number" };
                if (cleanType === "positive") {
                    schema.minimum = 0;
                    schema.exclusiveMinimum = true;
                }
                return { schema, required: !isOptional };
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
                const itemSchema = this.convertFieldToOpenAPIProperty("item", itemType).schema;
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

        // Handle object types
        if (typeof fieldType === "object" && !Array.isArray(fieldType)) {
            const nestedProperties: any = {};
            const nestedRequired: string[] = [];

            Object.entries(fieldType).forEach(([nestedField, nestedType]) => {
                const nestedProperty = this.convertFieldToOpenAPIProperty(nestedField, nestedType);
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

        // Fallback
        return {
            schema: { type: "string" },
            required: true
        };
    }

    private parseStringConstraints(stringType: string): any {
        const constraints: any = {};

        // Parse string(min,max) format
        const match = stringType.match(/string\((\d+)?,?(\d+)?\)/);
        if (match) {
            if (match[1]) constraints.minLength = parseInt(match[1]);
            if (match[2]) constraints.maxLength = parseInt(match[2]);
        }

        return constraints;
    }
}
