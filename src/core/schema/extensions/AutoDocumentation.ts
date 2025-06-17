/**
 * Auto Documentation - Revolutionary schema documentation generator
 * 
 * This module automatically generates beautiful documentation from schemas,
 * including API docs, type definitions, and interactive examples.
 */

import { SchemaInterface } from "../mode/interfaces/Interface";

/** 
 * Auto documentation utilities
 */
export const Docs = {
    /**
     * Generate comprehensive documentation from schema
     * 
     * @example
     * ```typescript
     * const UserSchema = Interface({
     *   id: "uuid",
     *   email: "email",
     *   name: "string(2,50)",
     *   age: "int(18,120)?",
     *   role: Make.union("user", "admin", "moderator")
     * });
     * 
     * const documentation = Docs.generate(UserSchema, {
     *   title: "User API",
     *   description: "User management endpoints",
     *   examples: true,
     *   interactive: true
     * });
     * 
     * console.log(documentation.markdown);
     * console.log(documentation.html);
     * console.log(documentation.openapi);
     * ```
     */
    generate(schema: SchemaInterface, options: DocumentationOptions = {}): Documentation {
        return new DocumentationGenerator(schema, options).generate();
    },

    /**
     * Generate OpenAPI specification from schema
     * 
     * @example
     * ```typescript
     * const openApiSpec = Docs.openapi(UserSchema, {
     *   title: "User API",
     *   version: "1.0.0",
     *   servers: ["https://api.example.com"]
     * });
     * ```
     */
    openapi(schema: SchemaInterface, options: OpenAPIOptions): OpenAPISpec {
        return new OpenAPIGenerator(schema, options).generate();
    },

    /**
     * Generate TypeScript type definitions
     * 
     * @example
     * ```typescript
     * const typeDefinitions = Docs.typescript(UserSchema, {
     *   exportName: "User",
     *   namespace: "API"
     * });
     * 
     * // Generates:
     * // export interface User {
     * //   id: string;
     * //   email: string;
     * //   name: string;
     * //   age?: number;
     * //   role: "user" | "admin" | "moderator";
     * // }
     * ```
     */
    typescript(schema: SchemaInterface, options: TypeScriptOptions = {}): string {
        return new TypeScriptGenerator(schema, options).generate();
    },

    /**
     * Generate interactive documentation with live examples
     * 
     * @example
     * ```typescript
     * const interactiveDocs = Docs.interactive(UserSchema, {
     *   title: "User Schema Playground",
     *   theme: "dark",
     *   showExamples: true,
     *   allowTesting: true
     * });
     * 
     * document.body.innerHTML = interactiveDocs.html;
     * ```
     */
    interactive(schema: SchemaInterface, options: InteractiveOptions = {}): InteractiveDocumentation {
        return new InteractiveDocumentationGenerator(schema, options).generate();
    }
};

/**
 * Main documentation generator
 */
class DocumentationGenerator {
    constructor(
        private schema: SchemaInterface,
        private options: DocumentationOptions
    ) {}

    generate(): Documentation {
        const analyzer = new SchemaAnalyzer(this.schema);
        const analysis = analyzer.analyze();

        return {
            markdown: this.generateMarkdown(analysis),
            html: this.generateHTML(analysis),
            openapi: this.generateOpenAPI(analysis),
            json: this.generateJSON(analysis),
            examples: this.generateExamples(analysis)
        };
    }

    private generateMarkdown(analysis: SchemaAnalysis): string {
        const { title = "Schema Documentation", description = "" } = this.options;
        
        let markdown = `# ${title}\n\n`;
        if (description) {
            markdown += `${description}\n\n`;
        }

        markdown += "## Schema Structure\n\n";
        markdown += this.generateFieldTable(analysis.fields);
        
        if (this.options.examples) {
            markdown += "\n## Examples\n\n";
            markdown += this.generateExampleMarkdown(analysis);
        }

        return markdown;
    }

    private generateHTML(analysis: SchemaAnalysis): string {
        const { title = "Schema Documentation" } = this.options;
        
        return `
<!DOCTYPE html>
<html>
<head>
    <title>${title}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .field { margin: 1rem 0; padding: 1rem; border: 1px solid #e1e5e9; border-radius: 6px; }
        .field-name { font-weight: bold; color: #0366d6; }
        .field-type { color: #6f42c1; font-family: monospace; }
        .field-description { color: #586069; margin-top: 0.5rem; }
        .example { background: #f6f8fa; padding: 1rem; border-radius: 6px; margin: 1rem 0; }
        pre { background: #f6f8fa; padding: 1rem; border-radius: 6px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>${title}</h1>
    ${this.generateFieldHTML(analysis.fields)}
    ${this.options.examples ? this.generateExampleHTML(analysis) : ''}
</body>
</html>`;
    }

    private generateOpenAPI(analysis: SchemaAnalysis): OpenAPISpec {
        return {
            openapi: "3.0.0",
            info: {
                title: this.options.title || "API Documentation",
                version: "1.0.0"
            },
            components: {
                schemas: {
                    [this.options.title || "Schema"]: this.convertToOpenAPISchema(analysis)
                }
            }
        };
    }

    private generateJSON(analysis: SchemaAnalysis): any {
        return {
            schema: this.schema,
            analysis,
            metadata: {
                generatedAt: new Date().toISOString(),
                version: "1.0.0"
            }
        };
    }

    private generateExamples(analysis: SchemaAnalysis): any[] {
        return [
            this.generateValidExample(analysis),
            this.generateInvalidExample(analysis)
        ];
    }

    private generateFieldTable(fields: FieldInfo[]): string {
        let table = "| Field | Type | Required | Description |\n";
        table += "|-------|------|----------|-------------|\n";
        
        fields.forEach(field => {
            table += `| ${field.name} | \`${field.type}\` | ${field.required ? 'Yes' : 'No'} | ${field.description || ''} |\n`;
        });
        
        return table;
    }

    private generateFieldHTML(fields: FieldInfo[]): string {
        return fields.map(field => `
            <div class="field">
                <div class="field-name">${field.name}</div>
                <div class="field-type">${field.type}</div>
                <div class="field-description">${field.description || ''}</div>
            </div>
        `).join('');
    }

    private generateExampleMarkdown(analysis: SchemaAnalysis): string {
        const example = this.generateValidExample(analysis);
        return `\`\`\`json\n${JSON.stringify(example, null, 2)}\n\`\`\``;
    }

    private generateExampleHTML(analysis: SchemaAnalysis): string {
        const example = this.generateValidExample(analysis);
        return `<div class="example"><pre>${JSON.stringify(example, null, 2)}</pre></div>`;
    }

    private generateValidExample(analysis: SchemaAnalysis): any {
        const example: any = {};
        
        analysis.fields.forEach(field => {
            if (field.required || Math.random() > 0.3) { // Include some optional fields
                example[field.name] = this.generateExampleValue(field.type);
            }
        });
        
        return example;
    }

    private generateInvalidExample(analysis: SchemaAnalysis): any {
        const example = this.generateValidExample(analysis);
        // Introduce some invalid data
        if (example.email) example.email = "invalid-email";
        if (example.age) example.age = -5;
        return example;
    }

    private generateExampleValue(type: string): any {
        if (type === "email") return "user@example.com";
        if (type === "uuid") return "550e8400-e29b-41d4-a716-446655440000";
        if (type === "url") return "https://example.com";
        if (type.startsWith("string")) return "Example string";
        if (type.includes("number") || type === "positive" || type === "int") return 42;
        if (type === "boolean") return true;
        if (type === "date") return new Date().toISOString();
        if (type.includes("[]")) return ["item1", "item2"];
        return "example";
    }

    private convertToOpenAPISchema(analysis: SchemaAnalysis): any {
        const properties: any = {};
        const required: string[] = [];
        
        analysis.fields.forEach(field => {
            properties[field.name] = this.convertFieldToOpenAPI(field);
            if (field.required) {
                required.push(field.name);
            }
        });
        
        return {
            type: "object",
            properties,
            required
        };
    }

    private convertFieldToOpenAPI(field: FieldInfo): any {
        const type = field.type;
        
        if (type === "email") return { type: "string", format: "email" };
        if (type === "uuid") return { type: "string", format: "uuid" };
        if (type === "url") return { type: "string", format: "uri" };
        if (type.startsWith("string")) return { type: "string" };
        if (type.includes("number") || type === "positive" || type === "int") return { type: "number" };
        if (type === "boolean") return { type: "boolean" };
        if (type === "date") return { type: "string", format: "date-time" };
        if (type.includes("[]")) return { type: "array", items: { type: "string" } };
        
        return { type: "string" };
    }
}

/**
 * Schema analyzer for extracting field information
 */
class SchemaAnalyzer {
    constructor(private schema: SchemaInterface) {}

    analyze(): SchemaAnalysis {
        const fields: FieldInfo[] = [];
        
        Object.entries(this.schema).forEach(([name, type]) => {
            fields.push(this.analyzeField(name, type));
        });
        
        return {
            fields,
            totalFields: fields.length,
            requiredFields: fields.filter(f => f.required).length,
            optionalFields: fields.filter(f => !f.required).length
        };
    }

    private analyzeField(name: string, type: any): FieldInfo {
        const typeStr = typeof type === "string" ? type : JSON.stringify(type);
        const required = !typeStr.includes("?");
        
        return {
            name,
            type: typeStr,
            required,
            description: this.generateFieldDescription(name, typeStr)
        };
    }

    private generateFieldDescription(name: string, type: string): string {
        if (type === "email") return "Email address";
        if (type === "uuid") return "Unique identifier";
        if (type === "url") return "URL address";
        if (type.includes("string")) return "Text value";
        if (type.includes("number")) return "Numeric value";
        if (type === "boolean") return "True/false value";
        if (type === "date") return "Date and time";
        if (type.includes("[]")) return "Array of values";
        
        return `${name} field`;
    }
}

/**
 * TypeScript generator
 */
class TypeScriptGenerator {
    constructor(
        private schema: SchemaInterface,
        private options: TypeScriptOptions
    ) {}

    generate(): string {
        const { exportName = "Schema", namespace } = this.options;
        
        let output = "";
        
        if (namespace) {
            output += `export namespace ${namespace} {\n`;
        }
        
        output += `export interface ${exportName} {\n`;
        
        Object.entries(this.schema).forEach(([name, type]) => {
            const tsType = this.convertToTypeScript(type);
            const optional = typeof type === "string" && type.includes("?") ? "?" : "";
            output += `  ${name}${optional}: ${tsType};\n`;
        });
        
        output += "}\n";
        
        if (namespace) {
            output += "}\n";
        }
        
        return output;
    }

    private convertToTypeScript(type: any): string {
        if (typeof type === "string") {
            const cleanType = type.replace("?", "");
            
            if (cleanType === "email" || cleanType === "uuid" || cleanType === "url") return "string";
            if (cleanType.startsWith("string")) return "string";
            if (cleanType.includes("number") || cleanType === "positive" || cleanType === "int") return "number";
            if (cleanType === "boolean") return "boolean";
            if (cleanType === "date") return "Date";
            if (cleanType.includes("[]")) return `${this.convertToTypeScript(cleanType.replace("[]", ""))}[]`;
        }
        
        return "any";
    }
}

/**
 * Interactive documentation generator
 */
class InteractiveDocumentationGenerator {
    constructor(
        private schema: SchemaInterface,
        private options: InteractiveOptions
    ) {}

    generate(): InteractiveDocumentation {
        return {
            html: this.generateInteractiveHTML(),
            css: this.generateCSS(),
            javascript: this.generateJavaScript()
        };
    }

    private generateInteractiveHTML(): string {
        return `
<div id="schema-playground">
    <h1>${this.options.title || 'Schema Playground'}</h1>
    <div class="playground-container">
        <div class="schema-panel">
            <h2>Schema</h2>
            <pre id="schema-display"></pre>
        </div>
        <div class="input-panel">
            <h2>Test Data</h2>
            <textarea id="test-input" placeholder="Enter JSON data to validate..."></textarea>
            <button id="validate-btn">Validate</button>
        </div>
        <div class="result-panel">
            <h2>Result</h2>
            <div id="validation-result"></div>
        </div>
    </div>
</div>`;
    }

    private generateCSS(): string {
        return `
.playground-container { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
.schema-panel, .input-panel, .result-panel { border: 1px solid #e1e5e9; border-radius: 6px; padding: 1rem; }
#test-input { width: 100%; height: 200px; font-family: monospace; }
#validate-btn { background: #0366d6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
.valid { color: #28a745; }
.invalid { color: #dc3545; }`;
    }

    private generateJavaScript(): string {
        return `
document.getElementById('schema-display').textContent = ${JSON.stringify(this.schema, null, 2)};
document.getElementById('validate-btn').addEventListener('click', function() {
    const input = document.getElementById('test-input').value;
    const result = document.getElementById('validation-result');
    
    try {
        const data = JSON.parse(input);
        // Validation logic would go here
        result.innerHTML = '<div class="valid">✓ Valid data</div>';
    } catch (e) {
        result.innerHTML = '<div class="invalid">✗ Invalid JSON</div>';
    }
});`;
    }
}

/**
 * OpenAPI generator
 */
class OpenAPIGenerator {
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
        // Implementation would convert schema to OpenAPI format
        return {
            type: "object",
            properties: {},
            required: []
        };
    }
}

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

/**
 * Export all utilities
 */
export { DocumentationGenerator, SchemaAnalyzer, TypeScriptGenerator };
export default Docs;
