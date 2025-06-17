/**
 * TypeScript Transformer for Schema Generation
 * 
 * This transformer replaces Make.fromType<T>() calls with actual schema strings
 * at compile time, providing true TypeScript-to-schema conversion.
 */

import * as ts from 'typescript';
import { TypeAnalyzer } from './TypeAnalyzer';

/**
 * Configuration for the schema transformer
 */
export interface TransformerConfig {
    sourceFiles: string[];
    compilerOptions?: ts.CompilerOptions;
    debug?: boolean;
}

/**
 * Create a TypeScript transformer that converts Make.fromType<T>() calls
 * to actual schema strings at compile time
 */
export function createSchemaTransformer(config: TransformerConfig): ts.TransformerFactory<ts.SourceFile> {
    const analyzer = new TypeAnalyzer(config.sourceFiles, config.compilerOptions);

    return (context: ts.TransformationContext) => {
        return (sourceFile: ts.SourceFile) => {
            function visitor(node: ts.Node): ts.Node {
                // Look for Make.fromType<T>() calls
                if (ts.isCallExpression(node)) {
                    const result = transformMakeFromTypeCall(node, analyzer, config.debug);
                    if (result) {
                        if (config.debug) {
                            console.log(`🔄 Transformed: ${node.getText()} → ${result.getText()}`);
                        }
                        return result;
                    }
                }

                // Look for Make.fromInterface<T>() calls
                if (ts.isCallExpression(node)) {
                    const result = transformMakeFromInterfaceCall(node, analyzer, config.debug);
                    if (result) {
                        if (config.debug) {
                            console.log(`🔄 Transformed: ${node.getText()} → ${result.getText()}`);
                        }
                        return result;
                    }
                }

                return ts.visitEachChild(node, visitor, context);
            }

            return ts.visitNode(sourceFile, visitor) as ts.SourceFile;
        };
    };
}

/**
 * Transform Make.fromType<T>() calls to schema strings
 */
function transformMakeFromTypeCall(
    node: ts.CallExpression, 
    analyzer: TypeAnalyzer, 
    debug?: boolean
): ts.StringLiteral | null {
    // Check if this is a Make.fromType call
    if (!isMakeFromTypeCall(node)) {
        return null;
    }

    // Extract the type argument
    const typeArgument = node.typeArguments?.[0];
    if (!typeArgument) {
        if (debug) {
            console.warn('⚠️  Make.fromType call without type argument');
        }
        return null;
    }

    // Check if there are runtime arguments (sample data)
    if (node.arguments.length > 0) {
        // Has sample data - let runtime handle it
        if (debug) {
            console.log('ℹ️  Make.fromType has sample data - skipping transformation');
        }
        return null;
    }

    try {
        // Analyze the type and generate schema
        const typeInfo = analyzer.analyzeTypeFromNode(typeArgument);
        const schemaString = analyzer.typeInfoToSchemaString(typeInfo);

        if (debug) {
            console.log(`✅ Generated schema: ${schemaString} for type: ${typeArgument.getText()}`);
        }

        // Return the schema string literal
        return ts.factory.createStringLiteral(schemaString);
    } catch (error) {
        if (debug) {
            console.error(`❌ Failed to transform Make.fromType:`, error);
        }
        return null;
    }
}

/**
 * Transform Make.fromInterface<T>() calls to schema objects
 */
function transformMakeFromInterfaceCall(
    node: ts.CallExpression, 
    analyzer: TypeAnalyzer, 
    debug?: boolean
): ts.ObjectLiteralExpression | null {
    // Check if this is a Make.fromInterface call
    if (!isMakeFromInterfaceCall(node)) {
        return null;
    }

    // Extract the type argument
    const typeArgument = node.typeArguments?.[0];
    if (!typeArgument) {
        if (debug) {
            console.warn('⚠️  Make.fromInterface call without type argument');
        }
        return null;
    }

    // Check if there are runtime arguments (sample data)
    if (node.arguments.length > 0) {
        // Has sample data - let runtime handle it
        if (debug) {
            console.log('ℹ️  Make.fromInterface has sample data - skipping transformation');
        }
        return null;
    }

    try {
        // Analyze the type and generate schema object
        const typeInfo = analyzer.analyzeTypeFromNode(typeArgument);
        
        if (typeInfo.kind === 'object' && typeInfo.properties) {
            // Generate object literal with schema properties
            const properties: ts.PropertyAssignment[] = [];
            
            for (const [propName, propInfo] of Object.entries(typeInfo.properties)) {
                const schemaString = analyzer.typeInfoToSchemaString(propInfo);
                properties.push(
                    ts.factory.createPropertyAssignment(
                        ts.factory.createStringLiteral(propName),
                        ts.factory.createStringLiteral(schemaString)
                    )
                );
            }

            if (debug) {
                console.log(`✅ Generated interface schema for: ${typeArgument.getText()}`);
            }

            return ts.factory.createObjectLiteralExpression(properties, true);
        } else {
            if (debug) {
                console.warn(`⚠️  Type is not an object interface: ${typeArgument.getText()}`);
            }
            return null;
        }
    } catch (error) {
        if (debug) {
            console.error(`❌ Failed to transform Make.fromInterface:`, error);
        }
        return null;
    }
}

/**
 * Check if a call expression is Make.fromType<T>()
 */
function isMakeFromTypeCall(node: ts.CallExpression): boolean {
    // Check for Make.fromType pattern
    if (ts.isPropertyAccessExpression(node.expression)) {
        const { expression, name } = node.expression;
        return ts.isIdentifier(expression) && 
               expression.text === 'Make' && 
               name.text === 'fromType';
    }
    return false;
}

/**
 * Check if a call expression is Make.fromInterface<T>()
 */
function isMakeFromInterfaceCall(node: ts.CallExpression): boolean {
    // Check for Make.fromInterface pattern
    if (ts.isPropertyAccessExpression(node.expression)) {
        const { expression, name } = node.expression;
        return ts.isIdentifier(expression) && 
               expression.text === 'Make' && 
               name.text === 'fromInterface';
    }
    return false;
}

/**
 * Utility function to transform TypeScript files with the schema transformer
 */
export function transformSourceFile(
    sourceFile: ts.SourceFile, 
    config: TransformerConfig
): ts.SourceFile {
    const transformer = createSchemaTransformer(config);
    const transformationContext: ts.TransformationContext = {
        getCompilerOptions: () => config.compilerOptions || {},
        startLexicalEnvironment: () => {},
        suspendLexicalEnvironment: () => {},
        resumeLexicalEnvironment: () => {},
        endLexicalEnvironment: () => [],
        hoistFunctionDeclaration: () => {},
        hoistVariableDeclaration: () => {},
        requestEmitHelper: () => {},
        readEmitHelpers: () => [],
        enableSubstitution: () => {},
        isSubstitutionEnabled: () => false,
        onSubstituteNode: (hint, node) => node,
        enableEmitNotification: () => {},
        isEmitNotificationEnabled: () => false,
        onEmitNode: () => {},
        factory: ts.factory
    };

    const result = transformer(transformationContext)(sourceFile);
    return result;
}

/**
 * Transform multiple source files
 */
export function transformFiles(filePaths: string[], config: Partial<TransformerConfig> = {}): void {
    const fullConfig: TransformerConfig = {
        sourceFiles: filePaths,
        debug: true,
        ...config
    };

    const program = ts.createProgram(filePaths, fullConfig.compilerOptions || {});
    
    for (const sourceFile of program.getSourceFiles()) {
        if (filePaths.includes(sourceFile.fileName)) {
            console.log(`🔄 Transforming: ${sourceFile.fileName}`);
            
            const transformed = transformSourceFile(sourceFile, fullConfig);
            
            // Print the transformed result (in a real implementation, you'd write to file)
            const printer = ts.createPrinter();
            const result = printer.printFile(transformed);
            
            console.log(`✅ Transformed result:\n${result}`);
        }
    }
}

/**
 * CLI utility for testing the transformer
 */
export function runTransformerCLI(): void {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('Usage: node transformer.js <file1.ts> [file2.ts] ...');
        process.exit(1);
    }

    console.log('🚀 Running Schema Transformer');
    console.log('============================');
    
    transformFiles(args, { debug: true });
}
