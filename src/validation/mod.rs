/**
 * Validation Module
 *
 * Handles file validation and semantic checking.
 */

use std::fs;
use std::path::PathBuf;

use crate::lexer;
use crate::parser;
use crate::compiler;
use crate::ast;

/// Validate AST nodes for naming conventions and best practices
pub fn validate_ast(ast_nodes: &[ast::ASTNode]) -> Result<(), Vec<String>> {
    let mut errors = Vec::new();

    for node in ast_nodes {
        match node {
            ast::ASTNode::Schema(schema) => {
                // Check schema naming conventions
                if !schema.name.chars().next().unwrap_or(' ').is_uppercase() {
                    errors.push(format!("Schema '{}' should start with uppercase letter", schema.name));
                }

                // Check field naming conventions
                for field in &schema.fields {
                    if field.name.chars().next().unwrap_or(' ').is_uppercase() {
                        errors.push(format!("Field '{}' in schema '{}' should start with lowercase letter", field.name, schema.name));
                    }
                }
            }
            ast::ASTNode::Enum(enum_node) => {
                // Check enum naming conventions
                if !enum_node.name.chars().next().unwrap_or(' ').is_uppercase() {
                    errors.push(format!("Enum '{}' should start with uppercase letter", enum_node.name));
                }
            }
            ast::ASTNode::TypeAlias(type_alias) => {
                // Check type alias naming conventions
                if !type_alias.name.chars().next().unwrap_or(' ').is_uppercase() {
                    errors.push(format!("Type alias '{}' should start with uppercase letter", type_alias.name));
                }
            }
            _ => {}
        }
    }

    if errors.is_empty() {
        Ok(())
    } else {
        Err(errors)
    }
}

/// Check .rel files without generating output
pub fn check_files(input: &PathBuf) -> Result<(), Box<dyn std::error::Error>> {
    println!("Checking rel files...");

    let compiler = compiler::relCompiler::new(compiler::CompilerOptions {
        input_dir: input.clone(),
        output_dir: None,
        watch: false,
    });

    // For check, we just validate parsing without generating output
    let rel_files = compiler.find_rel_files(input)?;

    for file_path in rel_files {
        println!("Checking: {:?}", file_path);

        let content = fs::read_to_string(&file_path)?;
        let lexer = lexer::Lexer::new(&content);
        let tokens = lexer.tokenize().map_err(|errors| {
            format!("Tokenization failed for {:?}: {:?}", file_path, errors)
        })?;

        let mut parser = parser::Parser::new(tokens);
        parser.parse().map_err(|errors| {
            format!("Parsing failed for {:?}: {:?}", file_path, errors)
        })?;
    }

    println!("✅ All files checked successfully!");
    Ok(())
}

/// Validate .rel files with enhanced semantic validation
pub fn validate_files(input: &PathBuf) -> Result<(), Box<dyn std::error::Error>> {
    println!("Validating rel files with enhanced validation...");

    let compiler = compiler::relCompiler::new(compiler::CompilerOptions {
        input_dir: input.clone(),
        output_dir: None,
        watch: false,
    });

    // For validation, we compile to check for semantic errors
    let rel_files = compiler.find_rel_files(input)?;

    for file_path in rel_files {
        println!("Validating: {:?}", file_path);

        let content = fs::read_to_string(&file_path)?;
        let lexer = lexer::Lexer::new(&content);
        let tokens = lexer.tokenize().map_err(|errors| {
            format!("Tokenization failed for {:?}: {:?}", file_path, errors)
        })?;

        let mut parser = parser::Parser::new(tokens);
        let ast_nodes = parser.parse().map_err(|errors| {
            format!("Parsing failed for {:?}: {:?}", file_path, errors)
        })?;

        // Additional semantic validation
        // Check for undefined types, circular references, etc.
        if let Err(semantic_errors) = perform_semantic_validation(&ast_nodes) {
            for error in semantic_errors {
                println!("  Semantic error at line {}, col {}: {}",
                    error.line,
                    error.column,
                    error.message
                );
            }
            return Err(format!("Semantic validation failed for {:?}", file_path).into());
        }

        println!("✅ File is syntactically and semantically valid");
    }

    println!("✅ All files validated successfully!");
    Ok(())
}

/// Perform semantic validation on AST nodes
fn perform_semantic_validation(ast_nodes: &[ast::ASTNode]) -> Result<(), Vec<ast::ParseError>> {
    let mut errors = Vec::new();
    let mut defined_types = std::collections::HashSet::new();
    let mut used_types = std::collections::HashSet::new();

    // Collect defined types and check for basic semantic issues
    for node in ast_nodes {
        match node {
            ast::ASTNode::Schema(schema) => {
                defined_types.insert(schema.name.clone());

                // Check for duplicate field names
                let mut field_names = std::collections::HashSet::new();
                for field in &schema.fields {
                    if !field_names.insert(field.name.clone()) {
                        errors.push(ast::ParseError {
                            message: format!("Duplicate field name '{}' in schema '{}'", field.name, schema.name),
                            position: 0,
                            // Use actual line numbers from AST node location
                            line: field.location.line,
                            column: field.location.column,
                            context: Some(format!("Field '{}' already defined in schema '{}'", field.name, schema.name)),
                            file_path: field.location.file_path.clone(),
                        });
                    }

                    // Collect used types
                    collect_used_types(&field.field_type, &mut used_types);
                }
            }
            ast::ASTNode::Enum(enum_node) => {
                defined_types.insert(enum_node.name.clone());

                // Check for duplicate enum values
                let mut values = std::collections::HashSet::new();
                for value in &enum_node.values {
                    if !values.insert(value.clone()) {
                        errors.push(ast::ParseError {
                            message: format!("Duplicate enum value '{}' in enum '{}'", value, enum_node.name),
                            position: 0,
                            line: 0,
                            column: 0,
                            context: Some(format!("Value '{}' already defined in enum '{}'", value, enum_node.name)),
                            file_path: None,
                        });
                    }
                }
            }
            ast::ASTNode::TypeAlias(type_alias) => {
                defined_types.insert(type_alias.name.clone());
                collect_used_types(&type_alias.type_definition, &mut used_types);
            }
            _ => {} // Other node types don't define types
        }
    }

    // Check for undefined types
    for used_type in &used_types {
        if !defined_types.contains(used_type) && !is_builtin_type(used_type) {
            errors.push(ast::ParseError {
                message: format!("Undefined type '{}'", used_type),
                position: 0,
                line: 0,
                column: 0,
                context: Some(format!("Type '{}' is not defined in this scope", used_type)),
                file_path: None,
            });
        }
    }

    if errors.is_empty() {
        Ok(())
    } else {
        Err(errors)
    }
}

/// Collect all types used in a type definition
fn collect_used_types(type_node: &ast::TypeNode, used_types: &mut std::collections::HashSet<String>) {
    match type_node {
        ast::TypeNode::Identifier(name) => {
            used_types.insert(name.clone());
        }
        ast::TypeNode::Array(inner) => {
            collect_used_types(inner, used_types);
        }
        ast::TypeNode::Union(types) => {
            for t in types {
                collect_used_types(t, used_types);
            }
        }
        ast::TypeNode::Generic(name, type_args) => {
            used_types.insert(name.clone());
            for arg in type_args {
                collect_used_types(arg, used_types);
            }
        }
        ast::TypeNode::Conditional(conditional) => {
            collect_used_types(&conditional.then_value, used_types);
            if let Some(else_type) = &conditional.else_value {
                collect_used_types(else_type, used_types);
            }
        }
        _ => {} // Other types don't reference user-defined types
    }
}

/// Check if a type name is a built-in type
fn is_builtin_type(name: &str) -> bool {
    matches!(
        name,
        "string" | "number" | "boolean" | "object" | "array" | "date" | "email" | "url" |
        "uuid" | "positive" | "negative" | "integer" | "float" | "any" | "unknown" | "null" | "undefined"
    )
}