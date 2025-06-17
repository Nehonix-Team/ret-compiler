/**
 * TypeScript Compiler API Integration
 * 
 * This module uses TypeScript's compiler API to extract real type information
 * and generate proper validation schemas at compile-time.
 */

// Import TypeScript compiler API
// Note: This requires 'typescript' package to be installed
import * as ts from 'typescript';

/**
 * Detailed TypeScript type information extracted via compiler API
 */
export interface TypeScriptTypeInfo {
    kind: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'union' | 'literal' | 'record' | 'unknown';
    name?: string;
    isOptional: boolean;
    isArray: boolean;
    elementType?: TypeScriptTypeInfo;
    properties?: Record<string, TypeScriptTypeInfo>;
    unionTypes?: TypeScriptTypeInfo[];
    literalValue?: string | number | boolean;
    keyType?: string;
    valueType?: string;
}

/**
 * TypeScript Type Analyzer
 * 
 * Uses TypeScript's compiler API to analyze types and generate schemas
 */
export class TypeAnalyzer {
    private program: ts.Program;
    private checker: ts.TypeChecker;

    constructor(sourceFiles: string[], compilerOptions?: ts.CompilerOptions) {
        const defaultOptions: ts.CompilerOptions = {
            target: ts.ScriptTarget.ES2020,
            module: ts.ModuleKind.CommonJS,
            strict: true,
            esModuleInterop: true,
            skipLibCheck: true,
            forceConsistentCasingInFileNames: true,
            ...compilerOptions
        };

        this.program = ts.createProgram(sourceFiles, defaultOptions);
        this.checker = this.program.getTypeChecker();
    }

    /**
     * Analyze a TypeScript type and return detailed type information
     */
    analyzeType(typeName: string, sourceFile?: string): TypeScriptTypeInfo {
        try {
            const type = this.findTypeByName(typeName, sourceFile);
            if (type) {
                return this.convertTypeToInfo(type);
            }
        } catch (error) {
            console.warn(`Failed to analyze type "${typeName}":`, error);
        }

        return {
            kind: 'unknown',
            isOptional: false,
            isArray: false
        };
    }

    /**
     * Analyze a type from a specific node in the AST
     */
    analyzeTypeFromNode(node: ts.TypeNode): TypeScriptTypeInfo {
        try {
            const type = this.checker.getTypeAtLocation(node);
            return this.convertTypeToInfo(type);
        } catch (error) {
            console.warn('Failed to analyze type from node:', error);
            return {
                kind: 'unknown',
                isOptional: false,
                isArray: false
            };
        }
    }

    /**
     * Convert TypeScript type to our internal type information
     */
    private convertTypeToInfo(type: ts.Type): TypeScriptTypeInfo {
        // Handle optional types (union with undefined)
        const isOptional = this.isOptionalType(type);
        const nonOptionalType = isOptional ? this.getNonUndefinedType(type) : type;

        // Handle primitive types
        if (nonOptionalType.flags & ts.TypeFlags.String) {
            return { kind: 'string', isOptional, isArray: false };
        }

        if (nonOptionalType.flags & ts.TypeFlags.Number) {
            return { kind: 'number', isOptional, isArray: false };
        }

        if (nonOptionalType.flags & ts.TypeFlags.Boolean) {
            return { kind: 'boolean', isOptional, isArray: false };
        }

        // Handle string literals
        if (nonOptionalType.flags & ts.TypeFlags.StringLiteral) {
            const literalType = nonOptionalType as ts.StringLiteralType;
            return {
                kind: 'literal',
                isOptional,
                isArray: false,
                literalValue: literalType.value
            };
        }

        // Handle number literals
        if (nonOptionalType.flags & ts.TypeFlags.NumberLiteral) {
            const literalType = nonOptionalType as ts.NumberLiteralType;
            return {
                kind: 'literal',
                isOptional,
                isArray: false,
                literalValue: literalType.value
            };
        }

        // Handle arrays
        if (this.checker.isArrayType(nonOptionalType)) {
            const elementType = this.checker.getElementTypeOfArrayType(nonOptionalType);
            return {
                kind: 'array',
                isOptional,
                isArray: true,
                elementType: this.convertTypeToInfo(elementType)
            };
        }

        // Handle union types
        if (nonOptionalType.flags & ts.TypeFlags.Union) {
            const unionType = nonOptionalType as ts.UnionType;
            return {
                kind: 'union',
                isOptional,
                isArray: false,
                unionTypes: unionType.types.map(t => this.convertTypeToInfo(t))
            };
        }

        // Handle Record<K, V> types
        if (this.isRecordType(nonOptionalType)) {
            const recordInfo = this.getRecordTypeInfo(nonOptionalType);
            return {
                kind: 'record',
                isOptional,
                isArray: false,
                keyType: recordInfo.keyType,
                valueType: recordInfo.valueType
            };
        }

        // Handle object types
        if (nonOptionalType.flags & ts.TypeFlags.Object) {
            const properties = this.getObjectProperties(nonOptionalType);
            return {
                kind: 'object',
                isOptional,
                isArray: false,
                properties,
                name: this.getTypeName(nonOptionalType)
            };
        }

        return {
            kind: 'unknown',
            isOptional,
            isArray: false
        };
    }

    /**
     * Check if type is optional (union with undefined)
     */
    private isOptionalType(type: ts.Type): boolean {
        if (type.flags & ts.TypeFlags.Union) {
            const unionType = type as ts.UnionType;
            return unionType.types.some(t => t.flags & ts.TypeFlags.Undefined);
        }
        return false;
    }

    /**
     * Get non-undefined type from optional union
     */
    private getNonUndefinedType(type: ts.Type): ts.Type {
        if (type.flags & ts.TypeFlags.Union) {
            const unionType = type as ts.UnionType;
            const nonUndefinedTypes = unionType.types.filter(t => !(t.flags & ts.TypeFlags.Undefined));
            if (nonUndefinedTypes.length === 1) {
                return nonUndefinedTypes[0];
            }
            // If multiple non-undefined types, return the union of them
            return this.checker.getUnionType(nonUndefinedTypes);
        }
        return type;
    }

    /**
     * Check if type is Record<K, V>
     */
    private isRecordType(type: ts.Type): boolean {
        const symbol = type.getSymbol();
        return symbol?.getName() === 'Record' || 
               (type.flags & ts.TypeFlags.Object && this.hasStringIndexSignature(type));
    }

    /**
     * Check if type has string index signature
     */
    private hasStringIndexSignature(type: ts.Type): boolean {
        const stringIndexType = this.checker.getIndexTypeOfType(type, ts.IndexKind.String);
        return stringIndexType !== undefined;
    }

    /**
     * Get Record<K, V> type information
     */
    private getRecordTypeInfo(type: ts.Type): { keyType: string; valueType: string } {
        if (type.symbol?.getName() === 'Record') {
            // Handle Record<K, V> generic type
            const typeArgs = this.checker.getTypeArguments(type as ts.TypeReference);
            if (typeArgs && typeArgs.length >= 2) {
                const keyTypeInfo = this.convertTypeToInfo(typeArgs[0]);
                const valueTypeInfo = this.convertTypeToInfo(typeArgs[1]);
                return {
                    keyType: this.typeInfoToSchemaString(keyTypeInfo),
                    valueType: this.typeInfoToSchemaString(valueTypeInfo)
                };
            }
        }

        // Handle object with string index signature
        const stringIndexType = this.checker.getIndexTypeOfType(type, ts.IndexKind.String);
        if (stringIndexType) {
            const valueTypeInfo = this.convertTypeToInfo(stringIndexType);
            return {
                keyType: 'string',
                valueType: this.typeInfoToSchemaString(valueTypeInfo)
            };
        }

        return { keyType: 'string', valueType: 'any' };
    }

    /**
     * Get object properties
     */
    private getObjectProperties(type: ts.Type): Record<string, TypeScriptTypeInfo> {
        const properties: Record<string, TypeScriptTypeInfo> = {};
        const symbol = type.getSymbol();

        if (symbol) {
            for (const prop of this.checker.getPropertiesOfType(type)) {
                const propType = this.checker.getTypeOfSymbolAtLocation(prop, prop.valueDeclaration!);
                properties[prop.getName()] = this.convertTypeToInfo(propType);
            }
        }

        return properties;
    }

    /**
     * Get type name
     */
    private getTypeName(type: ts.Type): string | undefined {
        const symbol = type.getSymbol();
        return symbol?.getName();
    }

    /**
     * Find type by name in source files
     */
    private findTypeByName(typeName: string, sourceFile?: string): ts.Type | undefined {
        const sourceFiles = sourceFile ? 
            [this.program.getSourceFile(sourceFile)].filter(Boolean) : 
            this.program.getSourceFiles();

        for (const file of sourceFiles) {
            if (!file) continue;
            
            const result = this.findTypeInSourceFile(file, typeName);
            if (result) return result;
        }

        return undefined;
    }

    /**
     * Find type in specific source file
     */
    private findTypeInSourceFile(sourceFile: ts.SourceFile, typeName: string): ts.Type | undefined {
        let foundType: ts.Type | undefined;

        const visit = (node: ts.Node) => {
            if (ts.isTypeAliasDeclaration(node) && node.name.text === typeName) {
                foundType = this.checker.getTypeAtLocation(node.type);
                return;
            }
            if (ts.isInterfaceDeclaration(node) && node.name.text === typeName) {
                foundType = this.checker.getTypeAtLocation(node);
                return;
            }
            ts.forEachChild(node, visit);
        };

        visit(sourceFile);
        return foundType;
    }

    /**
     * Convert type info to schema string
     */
    typeInfoToSchemaString(typeInfo: TypeScriptTypeInfo): string {
        let schema = '';

        switch (typeInfo.kind) {
            case 'string':
                schema = 'string';
                break;
            case 'number':
                schema = 'number';
                break;
            case 'boolean':
                schema = 'boolean';
                break;
            case 'array':
                if (typeInfo.elementType) {
                    const elementSchema = this.typeInfoToSchemaString(typeInfo.elementType);
                    schema = `${elementSchema}[]`;
                } else {
                    schema = 'any[]';
                }
                break;
            case 'record':
                schema = `record<${typeInfo.keyType || 'string'},${typeInfo.valueType || 'any'}>`;
                break;
            case 'union':
                if (typeInfo.unionTypes) {
                    const unionSchemas = typeInfo.unionTypes
                        .filter(t => t.kind === 'literal')
                        .map(t => String(t.literalValue));
                    schema = unionSchemas.length > 0 ? unionSchemas.join('|') : 'any';
                } else {
                    schema = 'any';
                }
                break;
            case 'literal':
                schema = String(typeInfo.literalValue);
                break;
            case 'object':
                // For complex objects, return the type name or 'object'
                schema = typeInfo.name || 'object';
                break;
            default:
                schema = 'any';
        }

        if (typeInfo.isOptional) {
            schema += '?';
        }

        return schema;
    }
}
