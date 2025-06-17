
/**
 * Type definitions
 */
interface DocumentationOptions {
    title?: string;
    description?: string;
    examples?: boolean;
    interactive?: boolean;
}

interface OpenAPIOptions {
    title: string;
    version: string;
    servers?: string[];
}

interface TypeScriptOptions {
    exportName?: string;
    namespace?: string;
}

interface InteractiveOptions {
    title?: string;
    theme?: "light" | "dark";
    showExamples?: boolean;
    allowTesting?: boolean;
}

interface Documentation {
    markdown: string;
    html: string;
    openapi: OpenAPISpec;
    json: any;
    examples: any[];
}

interface InteractiveDocumentation {
    html: string;
    css: string;
    javascript: string;
}

interface OpenAPISpec {
    openapi: string;
    info: {
        title: string;
        version: string;
    };
    servers?: Array<{ url: string }>;
    components: {
        schemas: Record<string, any>;
    };
}

interface SchemaAnalysis {
    fields: FieldInfo[];
    totalFields: number;
    requiredFields: number;
    optionalFields: number;
}

interface FieldInfo {
    name: string;
    type: string;
    required: boolean;
    description: string;
}


export type {
    DocumentationOptions,
    OpenAPIOptions,
    TypeScriptOptions,
    InteractiveOptions,
    Documentation,
    InteractiveDocumentation,
    OpenAPISpec,
    SchemaAnalysis,
    FieldInfo
};




/**
 * Type definitions
 */
export interface ValidationResult {
    isValid: boolean;
    data: any;
    errors: Record<string, string[]>;
    timestamp: Date;
}

export interface FieldValidationResult {
    field: string;
    value: any;
    isValid: boolean;
    errors: string[];
}

export interface ValidationStats {
    totalValidated: number;
    validCount: number;
    invalidCount: number;
    errorRate: number;
    startTime: Date;
}
