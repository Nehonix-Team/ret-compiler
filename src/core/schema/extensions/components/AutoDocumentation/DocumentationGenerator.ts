import { Documentation, DocumentationOptions, FieldInfo, OpenAPISpec, SchemaAnalysis } from "../../../../types/extension.type";
import { SchemaInterface } from "../../../../types/SchemaValidator.type";
import { SchemaAnalyzer } from "./SchemaAnalyzer";

/**
 * Main documentation generator
 */
export class DocumentationGenerator {
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

