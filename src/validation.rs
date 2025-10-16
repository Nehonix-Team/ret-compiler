/**
 * Validation Rules for rel Schemas
 * 
 * Enforces naming conventions and best practices
 */

use crate::ast::*;

#[derive(Debug, Clone)]
pub struct ValidationError {
    pub message: String,
    pub line: Option<usize>,
    pub column: Option<usize>,
}

impl ValidationError {
    pub fn new(message: String) -> Self {
        Self {
            message,
            line: None,
            column: None,
        }
    }
}

/// Validate schema naming conventions
pub fn validate_schema_names(ast: &[ASTNode]) -> Result<(), Vec<ValidationError>> {
    let mut errors = Vec::new();

    for node in ast {
        match node {
            ASTNode::Schema(schema) => {
                // Rule: Schema names must start with uppercase letter
                if let Some(first_char) = schema.name.chars().next() {
                    if !first_char.is_uppercase() {
                        errors.push(ValidationError::new(format!(
                            "Schema name '{}' must start with an uppercase letter. Did you mean '{}{}'?",
                            schema.name,
                            first_char.to_uppercase(),
                            &schema.name[1..]
                        )));
                    }
                }

                // Rule: Schema names should be PascalCase (no underscores, no hyphens)
                if schema.name.contains('_') || schema.name.contains('-') {
                    errors.push(ValidationError::new(format!(
                        "Schema name '{}' should use PascalCase (no underscores or hyphens)",
                        schema.name
                    )));
                }
            }
            ASTNode::Enum(enum_node) => {
                // Rule: Enum names must start with uppercase letter
                if let Some(first_char) = enum_node.name.chars().next() {
                    if !first_char.is_uppercase() {
                        errors.push(ValidationError::new(format!(
                            "Enum name '{}' must start with an uppercase letter",
                            enum_node.name
                        )));
                    }
                }
            }
            ASTNode::TypeAlias(type_alias) => {
                // Rule: Type alias names must start with uppercase letter
                if let Some(first_char) = type_alias.name.chars().next() {
                    if !first_char.is_uppercase() {
                        errors.push(ValidationError::new(format!(
                            "Type alias name '{}' must start with an uppercase letter",
                            type_alias.name
                        )));
                    }
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

/// Validate field naming conventions
pub fn validate_field_names(ast: &[ASTNode]) -> Result<(), Vec<ValidationError>> {
    let mut errors = Vec::new();

    for node in ast {
        if let ASTNode::Schema(schema) = node {
            for field in &schema.fields {
                // Rule: Field names should be camelCase (start with lowercase)
                if let Some(first_char) = field.name.chars().next() {
                    if first_char.is_uppercase() {
                        errors.push(ValidationError::new(format!(
                            "Field name '{}' in schema '{}' should start with a lowercase letter (use camelCase)",
                            field.name, schema.name
                        )));
                    }
                }
            }
        }
    }

    if errors.is_empty() {
        Ok(())
    } else {
        Err(errors)
    }
}

/// Run all validation rules
pub fn validate_ast(ast: &[ASTNode]) -> Result<(), Vec<ValidationError>> {
    let mut all_errors = Vec::new();

    // Run schema name validation
    if let Err(mut errors) = validate_schema_names(ast) {
        all_errors.append(&mut errors);
    }

    // Run field name validation
    if let Err(mut errors) = validate_field_names(ast) {
        all_errors.append(&mut errors);
    }

    if all_errors.is_empty() {
        Ok(())
    } else {
        Err(all_errors)
    }
}
