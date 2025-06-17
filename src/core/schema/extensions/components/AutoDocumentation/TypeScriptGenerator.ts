import { SchemaInterface } from "../../../../types/SchemaValidator.type";
import { TypeScriptOptions } from "../../mods";

/**
 * TypeScript generator
 */
export class TypeScriptGenerator {
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

