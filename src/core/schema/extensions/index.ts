/**
 * ReliantType Extensions - Advanced Features
 *
 * This module exports all advanced extensions that make ReliantType
 * a powerful schema validation library.
 *
 * Features real, functional implementations without placeholders.
 */

import Docs from './components/AutoDocumentation';
import When from './components/ConditionalValidation';
import Live from './components/RealtimeValidation';
import Smart from './SmartInference';

// Import specialized utilities
import { ValidationEngine } from './mods/validation-engine';
import { OpenAPIConverter } from './mods/openapi-converter';
import { TypeScriptGenerator } from './mods/typescript-generator';

// Smart Inference - Automatic schema generation
export { Smart } from './SmartInference';

// Conditional Validation - Dependent field validation
export { When, Extend } from './components/ConditionalValidation';

// Real-time Validation - Live validation system (DOM features disabled for Node.js compatibility)
export { Live, LiveValidator, StreamValidator } from './components/RealtimeValidation';

// Auto Documentation - Automatic documentation generation
export { Docs, DocumentationGenerator, SchemaAnalyzer, TypeScriptGenerator } from './components/AutoDocumentation';

/**
 * Extensions Bundle
 *
 * All extensions in one convenient object for easy access
 */
export const Extensions = {
    Smart: { fromSample: Smart.fromSample, fromJsonSchema: Smart.fromJsonSchema, fromType: Smart.fromType },
    When: { field: When.field, custom: When.custom },
    Live: { validator: Live.validator, stream: Live.stream },
    Docs: { generate: Docs.generate, typescript: Docs.typescript, openapi: Docs.openapi },

    // Advanced utilities for specialized use cases
    Utils: {
        ValidationEngine,
        OpenAPIConverter,
        TypeScriptGenerator
    }
};

/**
 * Quick access to most commonly used extensions
 */
export const Quick = {
    // Smart inference shortcuts
    fromSample: Smart.fromSample,
    fromJsonSchema: Smart.fromJsonSchema,

    // Conditional validation shortcuts
    when: When.field,

    // Real-time validation shortcuts
    live: Live.validator,
    stream: Live.stream,

    // Documentation shortcuts
    docs: Docs.generate,
    typescript: Docs.typescript,
    openapi: Docs.openapi
};


/**
 * Default export - Extensions bundle
 */
export default Extensions;
