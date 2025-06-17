import { FieldInfo, SchemaAnalysis } from "../../../../types/extension.type";
import { SchemaInterface } from "../../../../types/SchemaValidator.type";

/**
 * Schema analyzer for extracting field information
 */
export class SchemaAnalyzer {
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
