/**
 * TypeScript Generator - Generate TypeScript type definitions from schemas
 *
 * This module provides utilities to convert ReliantType definitions
 * to TypeScript type definitions and interfaces.
 */

import { SchemaInterface } from "../../mode/interfaces/Interface";

/**
 * TypeScript code generator for schema definitions
 */
export class TypeScriptGenerator {
    /**
     * Generate TypeScript interface from schema
     */
    static generateInterface(
        schema: SchemaInterface,
        options: TypeScriptOptions = {}
    ): string {
        const { exportName = "Schema", namespace, exportType = "interface" } = options;

        // Extract the actual field definitions from the schema
        const fieldDefinitions = this.extractFieldDefinitions(schema);

        let output = "";

        // Add namespace if specified
        if (namespace) {
            output += `export namespace ${namespace} {\n`;
        }

        // Generate interface or type
        if (exportType === "interface") {
            output += this.generateInterfaceDefinition(fieldDefinitions, exportName, namespace ? 1 : 0);
        } else {
            output += this.generateTypeDefinition(fieldDefinitions, exportName, namespace ? 1 : 0);
        }

        // Close namespace if specified
        if (namespace) {
            output += "}\n";
        }

        return output;
    }

    /**
     * Extract field definitions from schema object
     */
    private static extractFieldDefinitions(schema: any): Record<string, any> {
        // If schema has a definition property, use that
        if (schema && typeof schema === 'object' && schema.definition) {
            return schema.definition;
        }

        // Otherwise, assume the schema itself contains the field definitions
        return schema;
    }

    /**
     * Generate interface definition
     */
    private static generateInterfaceDefinition(
        schema: SchemaInterface,
        name: string,
        indentLevel: number = 0
    ): string {
        const indent = "  ".repeat(indentLevel);
        let output = `${indent}export interface ${name} {\n`;

        Object.entries(schema).forEach(([fieldName, fieldType]) => {
            const tsType = this.convertToTypeScript(fieldType);
            const optional = this.isOptionalField(fieldType) ? "?" : "";
            output += `${indent}  ${fieldName}${optional}: ${tsType};\n`;
        });

        output += `${indent}}\n`;
        return output;
    }

    /**
     * Generate type alias definition
     */
    private static generateTypeDefinition(
        schema: SchemaInterface,
        name: string,
        indentLevel: number = 0
    ): string {
        const indent = "  ".repeat(indentLevel);
        const objectType = this.convertObjectToTypeScript(schema);
        return `${indent}export type ${name} = ${objectType};\n`;
    }

    /**
     * Convert schema field to TypeScript type
     */
    private static convertToTypeScript(fieldType: any): string {
        if (typeof fieldType === "string") {
            return this.convertStringToTypeScript(fieldType);
        }

        if (typeof fieldType === "object" && !Array.isArray(fieldType)) {
            // Handle Make.union() objects
            if (fieldType.union && Array.isArray(fieldType.union)) {
                return fieldType.union.map((value: any) => `"${value}"`).join(" | ");
            }

            // Handle Make.const() objects
            if (fieldType.const !== undefined) {
                return `"${fieldType.const}"`;
            }

            return this.convertObjectToTypeScript(fieldType);
        }

        return "any";
    }

    /**
     * Convert string-based field to TypeScript type
     */
    private static convertStringToTypeScript(fieldType: string): string {
        const cleanType = fieldType.replace("?", "");

        // Handle arrays FIRST - before other checks
        if (cleanType.includes("[]")) {
            const elementType = cleanType.replace("[]", "").replace(/\([^)]*\)/, ""); // Remove constraints
            const tsElementType = this.convertStringToTypeScript(elementType);
            return `${tsElementType}[]`;
        }

        // Handle number types with constraints
        if (cleanType.startsWith("number(") || cleanType.includes("number(")) {
            return "number";
        }

        // Basic type mappings
        const typeMappings: Record<string, string> = {
            email: "string",
            url: "string",
            uuid: "string",
            phone: "string",
            date: "Date",
            number: "number",
            positive: "number",
            int: "number",
            boolean: "boolean",
            string: "string"
        };

        // Check for direct mapping
        if (typeMappings[cleanType]) {
            return typeMappings[cleanType];
        }

        // Handle string with constraints
        if (cleanType.startsWith("string")) {
            return "string";
        }

        // Handle union types (pipe-separated values)
        if (cleanType.includes("|")) {
            const unionTypes = cleanType.split("|").map(t => `"${t.trim()}"`);
            return unionTypes.join(" | ");
        }

        return "string";
    }

    /**
     * Convert object to TypeScript type
     */
    private static convertObjectToTypeScript(obj: any): string {
        if (typeof obj !== "object" || obj === null) {
            return "any";
        }

        const properties: string[] = [];

        Object.entries(obj).forEach(([key, value]) => {
            const tsType = this.convertToTypeScript(value);
            const optional = this.isOptionalField(value) ? "?" : "";
            properties.push(`${key}${optional}: ${tsType}`);
        });

        return `{\n  ${properties.join(";\n  ")};\n}`;
    }

    /**
     * Check if field is optional
     */
    private static isOptionalField(fieldType: any): boolean {
        if (typeof fieldType === "string") {
            return fieldType.includes("?");
        }
        return false;
    }

    /**
     * Generate utility types for schema
     */
    static generateUtilityTypes(
        schema: SchemaInterface,
        baseName: string
    ): string {
        let output = "";

        // Generate partial type
        output += `export type Partial${baseName} = Partial<${baseName}>;\n\n`;

        // Generate required type
        output += `export type Required${baseName} = Required<${baseName}>;\n\n`;

        // Generate pick types for common field combinations
        const fields = Object.keys(schema);
        if (fields.length > 1) {
            output += `export type ${baseName}Keys = keyof ${baseName};\n\n`;

            // Generate create type (without optional fields)
            const requiredFields = fields.filter(field =>
                !this.isOptionalField(schema[field])
            );

            if (requiredFields.length > 0 && requiredFields.length < fields.length) {
                output += `export type Create${baseName} = Pick<${baseName}, ${
                    requiredFields.map(f => `"${f}"`).join(" | ")
                }>;\n\n`;
            }
        }

        return output;
    }

    /**
     * Generate validation function types
     */
    static generateValidationTypes(baseName: string): string {
        return `
export interface ${baseName}ValidationResult {
  isValid: boolean;
  data: ${baseName};
  errors: Record<string, string[]>;
}

export type ${baseName}Validator = (data: any) => ${baseName}ValidationResult;

export interface ${baseName}ParseResult {
  success: boolean;
  data?: ${baseName};
  error?: {
    issues: Array<{
      path: string[];
      message: string;
    }>;
  };
}
`;
    }

    /**
     * Generate complete TypeScript module
     */
    static generateModule(
        schema: SchemaInterface,
        options: ModuleOptions
    ): string {
        const {
            moduleName,
            exportName = "Schema",
            includeUtilities = true,
            includeValidation = true,
            header
        } = options;

        let output = "";

        // Add header comment
        if (header) {
            output += `/**\n * ${header}\n */\n\n`;
        }

        // Generate main interface
        output += this.generateInterface(schema, { exportName });
        output += "\n";

        // Generate utility types
        if (includeUtilities) {
            output += this.generateUtilityTypes(schema, exportName);
        }

        // Generate validation types
        if (includeValidation) {
            output += this.generateValidationTypes(exportName);
        }

        // Add module export
        if (moduleName) {
            output += `\nexport const ${moduleName} = {\n`;
            output += `  name: "${exportName}",\n`;
            output += `  fields: ${JSON.stringify(Object.keys(schema), null, 2)}\n`;
            output += "};\n";
        }

        return output;
    }

    /**
     * Generate JSDoc comments for schema fields
     */
    static generateJSDoc(schema: SchemaInterface): Record<string, string> {
        const docs: Record<string, string> = {};

        Object.entries(schema).forEach(([fieldName, fieldType]) => {
            docs[fieldName] = this.generateFieldJSDoc(fieldName, fieldType);
        });

        return docs;
    }

    /**
     * Generate JSDoc for a single field
     */
    private static generateFieldJSDoc(fieldName: string, fieldType: any): string {
        if (typeof fieldType === "string") {
            const cleanType = fieldType.replace("?", "");
            const isOptional = fieldType.includes("?");

            let description = `${fieldName} field`;

            // Add type-specific descriptions
            if (cleanType === "email") description = "Email address";
            else if (cleanType === "url") description = "URL address";
            else if (cleanType === "uuid") description = "Unique identifier";
            else if (cleanType === "date") description = "Date and time";
            else if (cleanType === "positive") description = "Positive number";
            else if (cleanType.startsWith("string")) description = "Text value";
            else if (cleanType.includes("[]")) description = "Array of values";

            let jsdoc = `/**\n * ${description}`;

            if (isOptional) {
                jsdoc += "\n * @optional";
            }

            // Add constraints info
            if (cleanType.includes("(")) {
                const match = cleanType.match(/\(([^)]+)\)/);
                if (match) {
                    jsdoc += `\n * @constraints ${match[1]}`;
                }
            }

            jsdoc += "\n */";
            return jsdoc;
        }

        return `/**\n * ${fieldName} field\n */`;
    }
}

/**
 * Type definitions
 */
export interface TypeScriptOptions {
    exportName?: string;
    namespace?: string;
    exportType?: "interface" | "type";
}

export interface ModuleOptions {
    moduleName?: string;
    exportName?: string;
    includeUtilities?: boolean;
    includeValidation?: boolean;
    header?: string;
}

export {TypeScriptGenerator as TSGenerator}