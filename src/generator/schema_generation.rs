use crate::ast::*;
use std::collections::HashMap;
use crate::context::CompilationContext;

/// Schema and field generation methods for the TypeScript generator
pub struct SchemaGeneration;

impl SchemaGeneration {
    /// Generate schema with inline expansion of imported types
    pub fn generate_schema_inline(
        schema: &SchemaNode,
        schema_definitions: &HashMap<String, SchemaNode>,
        context: &mut CompilationContext,
        indent_level: &mut usize,
        generate_field_inline: &dyn Fn(&FieldNode, &mut usize, &HashMap<String, SchemaNode>, &mut CompilationContext) -> String,
    ) -> String {
        let mut output = String::new();

        // Use the schema name as-is, no "Schema" suffix
        output.push_str(&format!("export const {} = Interface({{\n", schema.name));
        *indent_level += 1;

        for field in &schema.fields {
            output.push_str(&generate_field_inline(field, indent_level, schema_definitions, context));
        }

        *indent_level -= 1;
        output.push_str("});");

        output
    }

    /// Generate a field with inline type expansion
    pub fn generate_field_inline(
        field: &FieldNode,
        indent_level: &mut usize,
        schema_definitions: &HashMap<String, SchemaNode>,
        context: &mut CompilationContext,
    ) -> String {
        let indent = "  ".repeat(*indent_level);
        let mut output = String::new();

        // Check if this field has conditionals - handle them specially
        if !field.conditionals.is_empty() {
            // This is a regular field, generate it normally
            let type_str = super::type_generation::TypeGeneration::expand_type_inline(
                &field.field_type,
                schema_definitions,
                context,
                indent_level,
                &|f, il, sd, ctx| Self::generate_field_inline(f, il, sd, ctx)
            );
            let optional = if field.optional { "?" } else { "" };
            output.push_str(&format!("{}{}{}: {},\n", indent, field.name, optional, type_str));

            // Generate conditional fields using ReliantType syntax
            for conditional in &field.conditionals {
                output.push_str(&Self::generate_conditional_fields_inline(conditional, *indent_level, schema_definitions, context));
            }
        } else {
            // Regular field without conditionals
            let type_str = super::type_generation::TypeGeneration::expand_type_inline(
                &field.field_type,
                schema_definitions,
                context,
                indent_level,
                &|f, il, sd, ctx| Self::generate_field_inline(f, il, sd, ctx)
            );
            let optional = if field.optional { "?" } else { "" };
            output.push_str(&format!("{}{}{}: {},\n", indent, field.name, optional, type_str));
        }

        output
    }

    /// Generate conditional fields using ReliantType inline syntax
    pub fn generate_conditional_fields_inline(
        conditional: &ConditionalNode,
        indent_level: usize,
        schema_definitions: &HashMap<String, SchemaNode>,
        context: &mut CompilationContext,
    ) -> String {
        let indent = "  ".repeat(indent_level);
        let mut output = String::new();

        // Generate condition expression
        let condition_str = super::expression_generation::ExpressionGeneration::generate_expression(&conditional.condition);

        // Generate then fields
        for then_field in &conditional.then_fields {
            let type_str = super::type_generation::TypeGeneration::expand_type_inline(
                &then_field.field_type,
                schema_definitions,
                context,
                &mut indent_level.clone(),
                &|f, il, sd, ctx| Self::generate_field_inline(f, il, sd, ctx)
            );
            let optional_marker = if then_field.optional { "?" } else { "" };

            // ReliantType conditional syntax: "when condition *? type : else_type"
            if !conditional.else_fields.is_empty() {
                // Find matching else field
                let else_field = conditional.else_fields.iter()
                    .find(|f| f.name == then_field.name);

                if let Some(else_f) = else_field {
                    let else_type_str = super::type_generation::TypeGeneration::expand_type_inline(
                        &else_f.field_type,
                        schema_definitions,
                        context,
                        &mut indent_level.clone(),
                        &|f, il, sd, ctx| Self::generate_field_inline(f, il, sd, ctx)
                    );
                    output.push_str(&format!(
                        "{}{}{}: \"when {} *? {} : {}\",\n",
                        indent, then_field.name, optional_marker, condition_str,
                        type_str.trim_matches('"'), else_type_str.trim_matches('"')
                    ));
                } else {
                    output.push_str(&format!(
                        "{}{}{}: \"when {} *? {} : any?\",\n",
                        indent, then_field.name, optional_marker, condition_str,
                        type_str.trim_matches('"')
                    ));
                }
            } else {
                output.push_str(&format!(
                    "{}{}{}: \"when {} *? {} : any?\",\n",
                    indent, then_field.name, optional_marker, condition_str,
                    type_str.trim_matches('"')
                ));
            }
        }

        output
    }

    /// Generate schema only (no TypeScript interface)
    pub fn generate_schema(schema: &SchemaNode, indent_level: &mut usize) -> String {
        let mut output = String::new();

        // Generate schema only (no TypeScript interface)
        output.push_str(&format!("export const {}Schema = Interface({{\n", schema.name));
        *indent_level += 1;

        for field in &schema.fields {
            // Handle conditional fields specially
            if field.name.starts_with("conditional_") {
                // Generate inline conditional syntax for ReliantType
                if let TypeNode::Conditional(conditional) = &field.field_type {
                    output.push_str(&Self::generate_conditional_fields(conditional, *indent_level));
                }
            } else {
                output.push_str(&Self::generate_field_schema(field, *indent_level));
            }
        }

        *indent_level -= 1;
        output.push_str("});\n");

        output
    }

    /// Generate a field for schema
    pub fn generate_field(field: &FieldNode, indent_level: usize) -> String {
        let indent = "  ".repeat(indent_level);
        let mut output = format!("{}{}", indent, field.name);

        if field.optional {
            output.push('?');
        }

        output.push_str(": ");
        output.push_str(&super::type_generation::TypeGeneration::generate_type(&field.field_type));

        if let Some(computed) = &field.computed_value {
            output.push_str(" = ");
            output.push_str(&super::expression_generation::ExpressionGeneration::generate_expression(computed));
        }

        output.push_str(";\n");

        output
    }

    /// Generate field schema
    pub fn generate_field_schema(field: &FieldNode, indent_level: usize) -> String {
        let indent = "  ".repeat(indent_level);
        let mut output = String::new();

        // Generate the main field
        output.push_str(&format!("{}{}: ", indent, field.name));

        let mut type_str = super::type_generation::TypeGeneration::generate_type_schema(&field.field_type);

        // Add optional marker if field is optional
        // For quoted types, insert ? before the closing quote
        if field.optional {
            if type_str.starts_with('"') && type_str.ends_with('"') {
                // Remove closing quote, add ?, then add quote back
                type_str.pop();
                type_str.push('?');
                type_str.push('"');
            } else {
                // For non-quoted types (shouldn't happen in Interface mode)
                type_str.push('?');
            }
        }

        output.push_str(&type_str);
        output.push_str(",\n");

        // Generate conditional fields if any
        for conditional in &field.conditionals {
            output.push_str(&Self::generate_conditional_fields(conditional, indent_level));
        }

        output
    }

    /// Generate conditional fields using ReliantType inline syntax
    pub fn generate_conditional_fields(conditional: &ConditionalNode, indent_level: usize) -> String {
        // Generate fields from conditional block with inline ReliantType syntax
        // Format: "when <condition> *? <thenType> : <elseType>"
        let indent = "  ".repeat(indent_level);
        let mut output = String::new();

        // Generate condition expression
        let condition_str = super::expression_generation::ExpressionGeneration::generate_expression(&conditional.condition);

        // Generate each field from the then block with inline conditional syntax
        for field in &conditional.then_fields {
            let field_name = &field.name;
            let then_type = super::type_generation::TypeGeneration::generate_type_schema(&field.field_type);

            // Check if there's an else value
            let else_type = if conditional.else_fields.is_empty() {
                // No else block - field is optional in else case
                format!("\"any?\"")
            } else {
                // Find matching field in else block
                let else_field = conditional.else_fields.iter()
                    .find(|f| f.name == *field_name);

                if let Some(else_f) = else_field {
                    super::type_generation::TypeGeneration::generate_type_schema(&else_f.field_type)
                } else {
                    format!("\"any?\"")
                }
            };

            // Generate inline conditional: "when condition *? thenType : elseType"
            // Remove quotes from types for inline syntax
            let then_clean = then_type.trim_matches('"');
            let else_clean = else_type.trim_matches('"');

            output.push_str(&format!(
                "{}{}: \"when {} *? {} : {}\",\n",
                indent, field_name, condition_str, then_clean, else_clean
            ));
        }

        // Generate fields that only exist in else block
        for field in &conditional.else_fields {
            if !conditional.then_fields.iter().any(|f| f.name == field.name) {
                let field_name = &field.name;
                let else_type = super::type_generation::TypeGeneration::generate_type_schema(&field.field_type);
                let else_clean = else_type.trim_matches('"');

                // Field only in else: when NOT condition *? elseType : any?
                output.push_str(&format!(
                    "{}{}: \"when !({}) *? {} : any?\",\n",
                    indent, field_name, condition_str, else_clean
                ));
            }
        }

        // Handle nested conditionals (else when blocks)
        if let Some(TypeNode::Conditional(nested)) = &conditional.else_value {
            output.push_str(&Self::generate_conditional_fields(nested, indent_level));
        }

        output
    }
}