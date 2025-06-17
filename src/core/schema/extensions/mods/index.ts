/**
 *  Extensions Index - Centralized exports for all extension modules
 * 
 * This module provides a clean, organized way to access all extension
 * functionality through specialized modules.
 */

import { OpenAPIConverter } from "./openapi-converter";
import { TypeScriptGenerator } from "./typescript-generator";
import { ValidationEngine } from "./validation-engine";

// Core validation engine
export { ValidationEngine } from "./validation-engine";
export type { 
    ValidationFieldResult, 
    ValidationResult 
} from "./validation-engine";

// OpenAPI converter
export { OpenAPIConverter } from "./openapi-converter";
export type {
    OpenAPISchemaObject,
    OpenAPISpecOptions,
    OpenAPISpecification,
    OpenAPIReference,
    RequestBodyOptions,
    OpenAPIRequestBody,
    ResponseOptions,
    OpenAPIResponse
} from "./openapi-converter";

// TypeScript generator
export { TypeScriptGenerator } from "./typescript-generator";
export type {
    TypeScriptOptions,
    ModuleOptions
} from "./typescript-generator";

/**
 *  Extensions Bundle
 * 
 * Provides easy access to all  extension functionality
 */
export const Extensions = {
    /**
     * Validation utilities
     */
    Validation: {
        validateField: ValidationEngine.validateField,
        validateObject: ValidationEngine.validateObject
    },
    
    /**
     * OpenAPI utilities
     */
    OpenAPI: {
        convertSchema: OpenAPIConverter.convertSchema,
        generateSpec: OpenAPIConverter.generateOpenAPISpec,
        generateRequestBody: OpenAPIConverter.generateRequestBody,
        generateResponse: OpenAPIConverter.generateResponse,
        generateReference: OpenAPIConverter.generateSchemaReference
    },
    
    /**
     * TypeScript utilities
     */
    TypeScript: {
        generateInterface: TypeScriptGenerator.generateInterface,
        generateUtilityTypes: TypeScriptGenerator.generateUtilityTypes,
        generateValidationTypes: TypeScriptGenerator.generateValidationTypes,
        generateModule: TypeScriptGenerator.generateModule,
        generateJSDoc: TypeScriptGenerator.generateJSDoc
    }
};

/**
 * Extension utilities for common use cases
 */
export const ExtensionUtils = {
    /**
     * Check if  extensions are available
     */
    isAvailable(): boolean {
        return true;
    },
    
    /**
     * Get list of available  extensions
     */
    getAvailableModules(): string[] {
        return ['ValidationEngine', 'OpenAPIConverter', 'TypeScriptGenerator'];
    },
    
    /**
     * Get extension version information
     */
    getVersionInfo(): ExtensionVersionInfo {
        return {
            version: '2.0.0',
            architecture: '',
            modules: {
                ValidationEngine: '2.0.0',
                OpenAPIConverter: '2.0.0', 
                TypeScriptGenerator: '2.0.0'
            },
            features: [
                ' architecture for better maintainability',
                'Real validation engine with comprehensive type checking',
                'Full OpenAPI 3.0 specification generation',
                'Advanced TypeScript code generation',
                'Utility type generation',
                'JSDoc documentation generation'
            ]
        };
    }
};

/**
 * Type definitions
 */
interface ExtensionVersionInfo {
    version: string;
    architecture: string;
    modules: Record<string, string>;
    features: string[];
}

/**
 * Default export -  Extensions bundle
 */
export default Extensions;
