import { Documentation, DocumentationOptions, InteractiveDocumentation, InteractiveOptions } from "../../../../types/extension.type";
import { SchemaInterface } from "../../../../types/SchemaValidator.type";
import { OpenAPIConverter, OpenAPISpecification, OpenAPISpecOptions } from "../../mods";
import { TSGenerator ,  TypeScriptOptions as TSOptions} from "../../mods/typescript-generator";
import { DocumentationGenerator, InteractiveDocumentationGenerator } from ".";

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
    openapi(schema: SchemaInterface, options: OpenAPISpecOptions): OpenAPISpecification {
        return OpenAPIConverter.generateOpenAPISpec(schema, options);
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
    typescript(schema: SchemaInterface, options: TSOptions = {}): string {
        return TSGenerator.generateInterface(schema, options);
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