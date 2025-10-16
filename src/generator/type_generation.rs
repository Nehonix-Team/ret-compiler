use crate::ast::*;
use crate::context::CompilationContext;
use std::collections::HashMap;
use crate::generator::constraint_generation::ConstraintGeneration;
use crate::generator::expression_generation::ExpressionGeneration;

/// Type generation methods for the TypeScript generator
pub struct TypeGeneration;

impl TypeGeneration {
    /// Expand a type inline - if it's a reference to another schema, inline its definition
    pub fn expand_type_inline(
        type_node: &TypeNode,
        schema_definitions: &HashMap<String, SchemaNode>,
        context: &mut CompilationContext,
        indent_level: &mut usize,
        generate_field_inline: &dyn Fn(&FieldNode, &mut usize, &HashMap<String, SchemaNode>, &mut CompilationContext) -> String,
    ) -> String {
        match type_node {
            TypeNode::FunctionCall { name, arguments } => {
                // Look up the function and expand it
                if let Some(func) = context.get_function(name).cloned() {
                    if let Some(body_type) = &func.body_type {
                        // Save current variables
                        let old_vars = context.variables.clone();

                        // Bind arguments to parameters
                        for (param, arg) in func.params.iter().zip(arguments.iter()) {
                            context.add_variable(param.name.clone(), arg.clone());
                        }

                        // Process body statements (declare var, etc.)
                        for stmt in &func.body_statements {
                            if let ASTNode::DeclareVar(var_node) = stmt {
                                // Evaluate the variable's value expression with current context
                                let value = Self::evaluate_expression_in_context(&var_node.value, context);
                                context.add_variable(var_node.name.clone(), value);
                            }
                        }

                        // Expand the body type (NOT recursively calling expand_type_inline)
                        let result = match body_type {
                            TypeNode::Constrained { base_type, constraints } => {
                                ConstraintGeneration::generate_constrained_type_inline(base_type, constraints, context)
                            }
                            _ => Self::expand_type_inline(body_type, schema_definitions, context, indent_level, generate_field_inline)
                        };

                        // Restore variables
                        context.variables = old_vars;
                        return result;
                    }
                }
                "\"unknown\"".to_string()
            }
            TypeNode::Identifier(name) => {
                // First check if it's a type alias
                if let Some(type_def) = context.get_type_alias(name).cloned() {
                    // Recursively expand the type alias
                    return Self::expand_type_inline(&type_def, schema_definitions, context, indent_level, generate_field_inline);
                }

                // Check if this is a reference to another schema
                if let Some(schema) = schema_definitions.get(name).cloned() {
                    // Inline expand the schema
                    let mut output = String::from("{\n");
                    *indent_level += 1;

                    for field in &schema.fields {
                        output.push_str(&generate_field_inline(field, indent_level, schema_definitions, context));
                    }

                    *indent_level -= 1;
                    let indent = "  ".repeat(*indent_level);
                    output.push_str(&format!("{}}}", indent));
                    output
                } else {
                    // It's a primitive type
                    format!("\"{}\"", name)
                }
            }
            TypeNode::String => "\"string\"".to_string(),
            TypeNode::Number => "\"number\"".to_string(),
            TypeNode::Boolean => "\"boolean\"".to_string(),
            TypeNode::Array(inner) => {
                let inner_type = Self::expand_type_inline(inner, schema_definitions, context, indent_level, generate_field_inline);
                format!("{}[]", inner_type)
            }
            TypeNode::Union(types) => {
                let type_strs: Vec<String> = types.iter()
                    .map(|t| {
                        match t {
                            TypeNode::Identifier(name) => name.clone(),
                            _ => Self::expand_type_inline(t, schema_definitions, context, indent_level, generate_field_inline).trim_matches('"').to_string()
                        }
                    })
                    .collect();
                format!("\"{}\"", type_strs.join("|"))
            }
            TypeNode::Constrained { base_type, constraints } => {
                ConstraintGeneration::generate_constrained_type_inline(base_type, constraints, context)
            }
            TypeNode::InlineObject(fields) => {
                let mut output = String::from("{\n");
                *indent_level += 1;

                for field in fields {
                    output.push_str(&generate_field_inline(field, indent_level, schema_definitions, context));
                }

                *indent_level -= 1;
                let indent = "  ".repeat(*indent_level);
                output.push_str(&format!("{}}}", indent));
                output
            }
            _ => Self::generate_type(type_node)
        }
    }

    /// Generate a TypeScript type from AST
    pub fn generate_type(type_node: &TypeNode) -> String {
        match type_node {
            TypeNode::String => "string".to_string(),
            TypeNode::Number => "number".to_string(),
            TypeNode::Boolean => "boolean".to_string(),
            TypeNode::Object => "Record<string, any>".to_string(),
            TypeNode::Null => "null".to_string(),
            TypeNode::Undefined => "undefined".to_string(),
            TypeNode::Any => "any".to_string(),
            TypeNode::Unknown => "unknown".to_string(),
            TypeNode::Identifier(name) => name.clone(),
            TypeNode::FunctionCall { .. } => {
                // Use generate_type_schema to avoid infinite recursion
                Self::generate_type_schema(type_node).trim_matches('"').to_string()
            }
            TypeNode::Array(inner) => format!("{}[]", Self::generate_type(inner)),
            TypeNode::Union(types) => {
                let type_strings: Vec<String> = types.iter().map(|t| Self::generate_type(t)).collect();
                type_strings.join(" | ")
            }
            TypeNode::Generic(name, type_args) => {
                let arg_strings: Vec<String> = type_args.iter().map(|t| Self::generate_type(t)).collect();
                format!("{}<{}>", name, arg_strings.join(", "))
            }
            TypeNode::Constrained { base_type, .. } => Self::generate_type(base_type),
            TypeNode::Conditional(conditional) => Self::generate_conditional_type(conditional),
            TypeNode::Literal(expr) => {
                // Generate literal value for types
                let value_str = Self::generate_expression_value(&Some(expr.clone()));
                format!("={}", value_str)
            }
            TypeNode::InlineObject(fields) => {
                // Generate nested object type as TypeScript interface
                let mut obj_str = String::from("{\n");
                for field in fields {
                    let field_type = Self::generate_type(&field.field_type);
                    let optional = if field.optional { "?" } else { "" };
                    obj_str.push_str(&format!("  {}{}: {};\n", field.name, optional, field_type));
                }
                obj_str.push_str("}");
                obj_str
            }
        }
    }

    /// Generate type schema string for ReliantType
    pub fn generate_type_schema(type_node: &TypeNode) -> String {
        match type_node {
            TypeNode::String => "\"string\"".to_string(),
            TypeNode::Number => "\"number\"".to_string(),
            TypeNode::Boolean => "\"boolean\"".to_string(),
            TypeNode::Object => "\"object\"".to_string(),
            TypeNode::Null => "\"null\"".to_string(),
            TypeNode::Undefined => "\"undefined\"".to_string(),
            TypeNode::Any => "\"any\"".to_string(),
            TypeNode::Unknown => "\"unknown\"".to_string(),
            TypeNode::Identifier(name) => format!("\"{}\"", name),
            TypeNode::FunctionCall { name, .. } => {
                // Function calls should be expanded before reaching here
                // If we get here, it means the function wasn't found
                // Return the function name as a type reference
                format!("\"{}\"" , name)
            }
            TypeNode::Array(inner) => format!("\"{}[]\"", Self::generate_type_name(inner)),
            TypeNode::Union(types) => {
                let union_parts: Vec<String> = types.iter().map(|t| {
                    match t {
                        TypeNode::Identifier(name) => name.clone(),
                        _ => Self::generate_type_name(t),
                    }
                }).collect();
                format!("\"{}\"", union_parts.join("|"))
            }
            TypeNode::Generic(name, type_args) => {
                let arg_strings: Vec<String> = type_args.iter().map(|t| Self::generate_type_name(t)).collect();
                format!("\"{}<{}>\"", name, arg_strings.join(","))
            }
            TypeNode::Constrained { base_type, constraints } => {
                Self::generate_constrained_type_schema(base_type, constraints)
            }
            TypeNode::Conditional(conditional) => Self::generate_conditional_schema(conditional),
            TypeNode::Literal(expr) => {
                // Generate literal value: =value
                let value_str = Self::generate_expression_value(&Some(expr.clone()));
                format!("\"={}\"", value_str)
            }
            TypeNode::InlineObject(fields) => {
                // Generate inline object schema - simplified version
                // For proper schema generation, use expand_type_inline instead
                if fields.is_empty() {
                    "\"object\"".to_string()
                } else {
                    // Return object with field count hint
                    format!("\"object /* {} fields */\"", fields.len())
                }
            }
        }
    }

    /// Generate type name for internal use
    pub fn generate_type_name(type_node: &TypeNode) -> String {
        match type_node {
            TypeNode::String => "string".to_string(),
            TypeNode::Number => "number".to_string(),
            TypeNode::Boolean => "boolean".to_string(),
            TypeNode::Object => "object".to_string(),
            TypeNode::Null => "null".to_string(),
            TypeNode::Undefined => "undefined".to_string(),
            TypeNode::Any => "any".to_string(),
            TypeNode::Unknown => "unknown".to_string(),
            TypeNode::Identifier(name) => name.clone(),
            TypeNode::FunctionCall { .. } => {
                // Use generate_type_schema and strip quotes
                Self::generate_type_schema(type_node).trim_matches('"').to_string()
            }
            TypeNode::Array(inner) => format!("{}[]", Self::generate_type_name(inner)),
            TypeNode::Union(types) => {
                let union_parts: Vec<String> = types.iter().map(|t| Self::generate_type_name(t)).collect();
                union_parts.join("|")
            }
            TypeNode::Generic(name, type_args) => {
                let arg_strings: Vec<String> = type_args.iter().map(|t| Self::generate_type_name(t)).collect();
                format!("{}<{}>", name, arg_strings.join(", "))
            }
            TypeNode::Constrained { base_type, constraints } => {
                let base_str = Self::generate_type_name(base_type);
                let mut constraint_strs = Vec::new();

                for constraint in constraints {
                    constraint_strs.push(ConstraintGeneration::generate_constraint_string(constraint));
                }

                if constraint_strs.is_empty() {
                    base_str
                } else {
                    format!("{}({})", base_str, constraint_strs.join(","))
                }
            }
            TypeNode::Conditional(_) => "any".to_string(), // Fallback for conditional types
            TypeNode::Literal(expr) => {
                // Generate literal value without quotes for type names
                let value_str = Self::generate_expression_value(&Some(expr.clone()));
                format!("={}", value_str)
            }
            TypeNode::InlineObject(_) => "object".to_string(),
        }
    }

    /// Generate conditional type syntax
    pub fn generate_conditional_type(conditional: &ConditionalNode) -> String {
        // Generate proper TypeScript conditional type syntax
        let condition_expr = ExpressionGeneration::generate_expression(&conditional.condition);
        let then_type = Self::generate_type(&conditional.then_value);

        if let Some(else_type) = &conditional.else_value {
            let else_type_str = Self::generate_type(else_type);
            // Generate TypeScript conditional type: condition ? then : else
            format!("{} extends true ? {} : {}", condition_expr, then_type, else_type_str)
        } else {
            // If no else branch, use conditional with undefined
            format!("{} extends true ? {} : undefined", condition_expr, then_type)
        }
    }

    /// Generate conditional schema
    pub fn generate_conditional_schema(conditional: &ConditionalNode) -> String {
        // Generate conditional schema validation with proper conditional logic
        let condition_expr = ExpressionGeneration::generate_expression(&conditional.condition);
        let then_schema = Self::generate_type_schema(&conditional.then_value);

        if let Some(else_type) = &conditional.else_value {
            let else_schema = Self::generate_type_schema(else_type);
            // Generate conditional schema: if condition then then_schema else else_schema
            format!("conditional({}, {}, {})", condition_expr, then_schema, else_schema)
        } else {
            // If no else branch, use conditional with optional/undefined
            format!("conditional({}, {}, undefined)", condition_expr, then_schema)
        }
    }

    /// Generate constrained type schema
    pub fn generate_constrained_type_schema(base_type: &TypeNode, constraints: &[ConstraintNode]) -> String {
        let base_str = Self::generate_type_name(base_type);

        if constraints.is_empty() {
            return format!("\"{}\"", base_str);
        }

        // Build constraint string based on ReliantType syntax
        let mut min_val = None;
        let mut max_val = None;
        let mut has_special_type = false;
        let mut special_type = String::new();
        let mut matches_pattern = None;

        for constraint in constraints {
            match constraint.constraint_type {
                ConstraintType::Min => min_val = Some(ConstraintGeneration::generate_constraint_string(constraint)),
                ConstraintType::Max => max_val = Some(ConstraintGeneration::generate_constraint_string(constraint)),
                ConstraintType::Matches => {
                    // Extract regex pattern from matches constraint
                    if let Some(expr) = &constraint.value {
                        // For RawString, wrap with / delimiters for ReliantType regex syntax
                        let pattern_str = match expr {
                            ExpressionNode::RawString(s) => format!("/{}/", s),
                            _ => Self::generate_expression_value(&Some(expr.clone()))
                        };
                        matches_pattern = Some(pattern_str);
                    }
                }
                // These are standalone types in ReliantType, not constraints
                ConstraintType::Positive => {
                    has_special_type = true;
                    special_type = "positive".to_string();
                }
                ConstraintType::Negative => {
                    has_special_type = true;
                    special_type = "negative".to_string();
                }
                ConstraintType::Integer => {
                    has_special_type = true;
                    special_type = "int".to_string();
                }
                ConstraintType::Float => {
                    has_special_type = true;
                    special_type = "double".to_string();
                }
                ConstraintType::Literal => {
                    // Handle &literal(value) - convert to =value
                    if let Some(expr) = &constraint.value {
                        let value_str = Self::generate_expression_value(&Some(expr.clone()));
                        // Return early with literal type
                        return format!("\"={}\"", value_str);
                    }
                }
                _ => {
                    // Other constraints not yet handled
                }
            }
        }

        // Generate proper ReliantType constraint syntax
        if let Some(pattern) = matches_pattern {
            // Regex pattern: "string(/pattern/)"
            format!("\"{}({})\"", base_str, pattern)
        } else if has_special_type {
            // Special types like "positive", "negative", "int", "double" are standalone
            // If there are also min/max constraints, combine them
            if min_val.is_some() || max_val.is_some() {
                let min = min_val.unwrap_or_else(|| String::new());
                let max = max_val.unwrap_or_else(|| String::new());
                format!("\"{}({},{})\"", special_type, min, max)
            } else {
                format!("\"{}\"", special_type)
            }
        } else if min_val.is_some() || max_val.is_some() {
            // Min/max constraints: "number(min,max)"
            let min = min_val.unwrap_or_else(|| String::new());
            let max = max_val.unwrap_or_else(|| String::new());
            format!("\"{}({},{})\"", base_str, min, max)
        } else {
            format!("\"{}\"", base_str)
        }
    }

    /// Evaluate an expression in the current context and return the resolved expression
    pub fn evaluate_expression_in_context(expr: &ExpressionNode, context: &CompilationContext) -> ExpressionNode {
        match expr {
            ExpressionNode::Identifier(name) => {
                // Check if this identifier refers to a parameter/variable
                if let Some(value) = context.get_variable(name) {
                    value.clone()
                } else {
                    expr.clone()
                }
            }
            ExpressionNode::VariableRef(name) => {
                // Resolve variable reference
                if let Some(value) = context.get_variable(name) {
                    value.clone()
                } else {
                    expr.clone()
                }
            }
            _ => expr.clone(),
        }
    }

    /// Generate expression value as string
    pub fn generate_expression_value(expr: &Option<ExpressionNode>) -> String {
        match expr {
            Some(expr) => ExpressionGeneration::generate_expression(expr),
            None => "\"\"".to_string(), // Default fallback
        }
    }
}

// Note: ExpressionGeneration is re-exported from the mod.rs file