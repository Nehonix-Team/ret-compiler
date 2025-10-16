/**
 * rel TypeScript Code Generator
 *
 * Converts AST nodes to ReliantType interfaces and validation schemas
 */

use crate::ast::*;
use crate::context::CompilationContext;
use std::collections::{HashMap, HashSet};

pub struct TypeScriptGenerator {
    indent_level: usize,
    /// Map of schema name -> schema definition for inline expansion
    schema_definitions: HashMap<String, SchemaNode>,
    /// Set of schemas that should be exported
    exported_schemas: HashSet<String>,
    /// Compilation context for variables, types, and functions
    context: CompilationContext,
}

impl TypeScriptGenerator {
    pub fn new() -> Self {
        Self { 
            indent_level: 0, 
            schema_definitions: HashMap::new(), 
            exported_schemas: HashSet::new(),
            context: CompilationContext::new(),
        }
    }

    pub fn generate(&mut self, ast: &[ASTNode]) -> String {
        // First pass: collect variables, types, schemas, and exports
        for node in ast {
            match node {
                ASTNode::DeclareVar(var) => {
                    self.context.add_variable(var.name.clone(), var.value.clone());
                }
                ASTNode::DeclareType(type_decl) => {
                    self.context.add_type_alias(type_decl.name.clone(), type_decl.type_def.clone());
                }
                ASTNode::Function(func) => {
                    self.context.add_function(func.name.clone(), func.clone());
                }
                ASTNode::Schema(schema) => {
                    self.schema_definitions.insert(schema.name.clone(), schema.clone());
                }
                ASTNode::Export(export) => {
                    for name in &export.items {
                        self.exported_schemas.insert(name.clone());
                    }
                }
                _ => {}
            }
        }

        let mut output = String::from("import { Interface } from 'reliant-type';\n\n");

        // Second pass: only generate exported schemas with inline expansion
        let exported_list: Vec<String> = self.exported_schemas.iter().cloned().collect();
        for schema_name in exported_list {
            if let Some(schema) = self.schema_definitions.get(&schema_name).cloned() {
                output.push_str(&self.generate_schema_inline(&schema));
                output.push_str("\n\n");
            }
        }

        output.trim_end().to_string()
    }

    fn generate_schema(&mut self, schema: &SchemaNode) -> String {
        let mut output = String::new();

        // Generate schema only (no TypeScript interface)
        output.push_str(&format!("export const {}Schema = Interface({{\n", schema.name));
        self.indent_level += 1;

        for field in &schema.fields {
            // Handle conditional fields specially
            if field.name.starts_with("conditional_") {
                // Generate inline conditional syntax for ReliantType
                if let TypeNode::Conditional(conditional) = &field.field_type {
                    output.push_str(&self.generate_conditional_fields(conditional));
                }
            } else {
                output.push_str(&self.generate_field_schema(field));
            }
        }

        self.indent_level -= 1;
        output.push_str("});\n");

        output
    }

    /// Generate schema with inline expansion of imported types
    fn generate_schema_inline(&mut self, schema: &SchemaNode) -> String {
        let mut output = String::new();

        // Use the schema name as-is, no "Schema" suffix
        output.push_str(&format!("export const {} = Interface({{\n", schema.name));
        self.indent_level += 1;

        for field in &schema.fields {
            output.push_str(&self.generate_field_inline(field));
        }

        self.indent_level -= 1;
        output.push_str("});");

        output
    }

    /// Generate a field with inline type expansion
    fn generate_field_inline(&mut self, field: &FieldNode) -> String {
        let indent = "  ".repeat(self.indent_level);
        let mut output = String::new();

        // Check if this field has conditionals - handle them specially
        if !field.conditionals.is_empty() {
            // This is a regular field, generate it normally
            let type_str = self.expand_type_inline(&field.field_type);
            let optional = if field.optional { "?" } else { "" };
            output.push_str(&format!("{}{}{}: {},\n", indent, field.name, optional, type_str));
            
            // Generate conditional fields using ReliantType syntax
            for conditional in &field.conditionals {
                output.push_str(&self.generate_conditional_fields_inline(conditional));
            }
        } else {
            // Regular field without conditionals
            let type_str = self.expand_type_inline(&field.field_type);
            let optional = if field.optional { "?" } else { "" };
            output.push_str(&format!("{}{}{}: {},\n", indent, field.name, optional, type_str));
        }

        output
    }

    /// Generate conditional fields using ReliantType inline syntax
    fn generate_conditional_fields_inline(&mut self, conditional: &ConditionalNode) -> String {
        let indent = "  ".repeat(self.indent_level);
        let mut output = String::new();

        // Generate condition expression
        let condition_str = self.generate_expression(&conditional.condition);

        // Generate then fields
        for then_field in &conditional.then_fields {
            let type_str = self.expand_type_inline(&then_field.field_type);
            let optional_marker = if then_field.optional { "?" } else { "" };
            
            // ReliantType conditional syntax: "when condition *? type : else_type"
            if !conditional.else_fields.is_empty() {
                // Find matching else field
                let else_field = conditional.else_fields.iter()
                    .find(|f| f.name == then_field.name);
                
                if let Some(else_f) = else_field {
                    let else_type_str = self.expand_type_inline(&else_f.field_type);
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

    /// Expand a type inline - if it's a reference to another schema, inline its definition
    fn expand_type_inline(&mut self, type_node: &TypeNode) -> String {
        match type_node {
            TypeNode::Identifier(name) => {
                // Check if this is a reference to another schema
                if let Some(schema) = self.schema_definitions.get(name).cloned() {
                    // Inline expand the schema
                    let mut output = String::from("{\n");
                    self.indent_level += 1;
                    
                    for field in &schema.fields {
                        output.push_str(&self.generate_field_inline(field));
                    }
                    
                    self.indent_level -= 1;
                    let indent = "  ".repeat(self.indent_level);
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
                let inner_type = self.expand_type_inline(inner);
                format!("{}[]", inner_type)
            }
            TypeNode::Union(types) => {
                let type_strs: Vec<String> = types.iter()
                    .map(|t| {
                        match t {
                            TypeNode::Identifier(name) => name.clone(),
                            _ => self.expand_type_inline(t).trim_matches('"').to_string()
                        }
                    })
                    .collect();
                format!("\"{}\"", type_strs.join("|"))
            }
            TypeNode::Constrained { base_type, constraints } => {
                self.generate_constrained_type_inline(base_type, constraints)
            }
            TypeNode::InlineObject(fields) => {
                let mut output = String::from("{\n");
                self.indent_level += 1;
                
                for field in fields {
                    output.push_str(&self.generate_field_inline(field));
                }
                
                self.indent_level -= 1;
                let indent = "  ".repeat(self.indent_level);
                output.push_str(&format!("{}}}", indent));
                output
            }
            _ => self.generate_type(type_node)
        }
    }

    fn generate_constrained_type_inline(&mut self, base_type: &TypeNode, constraints: &[ConstraintNode]) -> String {
        let base = match base_type {
            TypeNode::Number => "number",
            TypeNode::String => "string",
            TypeNode::Array(_) => return self.expand_type_inline(base_type),
            _ => return self.expand_type_inline(base_type),
        };

        // Check for special number types
        if base == "number" {
            for constraint in constraints {
                match constraint.constraint_type {
                    ConstraintType::Positive => return "\"positive\"".to_string(),
                    ConstraintType::Negative => return "\"negative\"".to_string(),
                    ConstraintType::Integer => return "\"int\"".to_string(),
                    ConstraintType::Float => return "\"float\"".to_string(),
                    _ => {}
                }
            }
        }

        // Handle min/max constraints
        let mut min_val = None;
        let mut max_val = None;
        let mut pattern = None;

        for constraint in constraints {
            match &constraint.constraint_type {
                ConstraintType::Min => min_val = constraint.value.clone(),
                ConstraintType::Max => max_val = constraint.value.clone(),
                ConstraintType::MinLength => min_val = constraint.value.clone(),
                ConstraintType::MaxLength => max_val = constraint.value.clone(),
                ConstraintType::Matches => pattern = constraint.value.clone(),
                _ => {}
            }
        }

        if let Some(pat) = pattern {
            let pat_str = self.expression_to_string(&pat);
            return format!("\"{}({})\"", base, pat_str);
        }

        match (min_val, max_val) {
            (Some(min), Some(max)) => {
                let min_str = self.expression_to_string(&min);
                let max_str = self.expression_to_string(&max);
                format!("\"{}({},{})\"", base, min_str, max_str)
            },
            (Some(min), None) => {
                let min_str = self.expression_to_string(&min);
                format!("\"{}({},)\"", base, min_str)
            },
            (None, Some(max)) => {
                let max_str = self.expression_to_string(&max);
                format!("\"{}(,{})\"", base, max_str)
            },
            (None, None) => format!("\"{}\"", base),
        }
    }

    fn expression_to_string(&self, expr: &ExpressionNode) -> String {
        match expr {
            ExpressionNode::Identifier(id) => id.clone(),
            ExpressionNode::Number(n) => n.to_string(),
            ExpressionNode::String(s) => s.clone(),
            ExpressionNode::RawString(s) => s.clone(),
            ExpressionNode::VariableRef(name) => {
                // Resolve variable reference
                if let Some(value) = self.context.get_variable(name) {
                    self.expression_to_string(value)
                } else {
                    format!("/* undefined var: {} */", name)
                }
            }
            ExpressionNode::Boolean(b) => b.to_string(),
            _ => "".to_string(),
        }
    }

    fn generate_field(&mut self, field: &FieldNode) -> String {
        let indent = self.get_indent();
        let mut output = format!("{}{}", indent, field.name);

        if field.optional {
            output.push('?');
        }

        output.push_str(": ");
        output.push_str(&self.generate_type(&field.field_type));

        if let Some(computed) = &field.computed_value {
            output.push_str(" = ");
            output.push_str(&self.generate_expression(computed));
        }

        output.push_str(";\n");

        output
    }

    fn generate_field_schema(&mut self, field: &FieldNode) -> String {
        let indent = self.get_indent();
        let mut output = String::new();
        
        // Generate the main field
        output.push_str(&format!("{}{}: ", indent, field.name));

        let mut type_str = self.generate_type_schema(&field.field_type);
        
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
            output.push_str(&self.generate_conditional_fields(conditional));
        }
        
        output
    }

    fn generate_type(&mut self, type_node: &TypeNode) -> String {
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
            TypeNode::Array(inner) => format!("{}[]", self.generate_type(inner)),
            TypeNode::Union(types) => {
                let type_strings: Vec<String> = types.iter().map(|t| self.generate_type(t)).collect();
                type_strings.join(" | ")
            }
            TypeNode::Generic(name, type_args) => {
                let arg_strings: Vec<String> = type_args.iter().map(|t| self.generate_type(t)).collect();
                format!("{}<{}>", name, arg_strings.join(", "))
            }
            TypeNode::Constrained { base_type, .. } => self.generate_type(base_type),
            TypeNode::Conditional(conditional) => self.generate_conditional_type(conditional),
            TypeNode::Literal(expr) => {
                // Generate literal value for types
                let value_str = self.generate_expression_value(&Some(expr.clone()));
                format!("={}", value_str)
            }
            TypeNode::InlineObject(fields) => {
                // Generate nested object type
                let mut obj_str = String::from("{\n");
                self.indent_level += 1;
                for field in fields {
                    obj_str.push_str(&self.generate_field(field));
                }
                self.indent_level -= 1;
                obj_str.push_str(&format!("{}}}", self.get_indent()));
                obj_str
            }
        }
    }

    fn generate_conditional_type(&mut self, conditional: &ConditionalNode) -> String {
        // Generate proper TypeScript conditional type syntax
        let condition_expr = self.generate_expression(&conditional.condition);
        let then_type = self.generate_type(&conditional.then_value);

        if let Some(else_type) = &conditional.else_value {
            let else_type_str = self.generate_type(else_type);
            // Generate TypeScript conditional type: condition ? then : else
            format!("{} extends true ? {} : {}", condition_expr, then_type, else_type_str)
        } else {
            // If no else branch, use conditional with undefined
            format!("{} extends true ? {} : undefined", condition_expr, then_type)
        }
    }

    fn generate_type_schema(&mut self, type_node: &TypeNode) -> String {
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
            TypeNode::Array(inner) => format!("\"{}[]\"", self.generate_type_name(inner)),
            TypeNode::Union(types) => {
                let union_parts: Vec<String> = types.iter().map(|t| {
                    match t {
                        TypeNode::Identifier(name) => name.clone(),
                        _ => self.generate_type_name(t),
                    }
                }).collect();
                format!("\"{}\"", union_parts.join("|"))
            }
            TypeNode::Generic(name, type_args) => {
                let arg_strings: Vec<String> = type_args.iter().map(|t| self.generate_type_name(t)).collect();
                format!("\"{}<{}>\"", name, arg_strings.join(","))
            }
            TypeNode::Constrained { base_type, constraints } => {
                let base_str = self.generate_type_name(base_type);
                
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
                        ConstraintType::Min => min_val = Some(self.generate_constraint_string(constraint)),
                        ConstraintType::Max => max_val = Some(self.generate_constraint_string(constraint)),
                        ConstraintType::Matches => {
                            // Extract regex pattern from matches constraint
                            if let Some(expr) = &constraint.value {
                                // For RawString, wrap with / delimiters for ReliantType regex syntax
                                let pattern_str = match expr {
                                    ExpressionNode::RawString(s) => format!("/{}/", s),
                                    _ => self.generate_expression_value(&Some(expr.clone()))
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
                                let value_str = self.generate_expression_value(&Some(expr.clone()));
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
            TypeNode::Conditional(conditional) => self.generate_conditional_schema(conditional),
            TypeNode::Literal(expr) => {
                // Generate literal value: =value
                let value_str = self.generate_expression_value(&Some(expr.clone()));
                format!("\"={}\"", value_str)
            }
            TypeNode::InlineObject(fields) => {
                // Generate nested object schema
                let mut obj_str = String::from("{\n");
                self.indent_level += 1;
                for field in fields {
                    obj_str.push_str(&self.generate_field_schema(field));
                }
                self.indent_level -= 1;
                obj_str.push_str(&format!("{}}}", self.get_indent()));
                obj_str
            }
        }
    }

    fn generate_type_name(&mut self, type_node: &TypeNode) -> String {
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
            TypeNode::Array(inner) => format!("{}[]", self.generate_type_name(inner)),
            TypeNode::Union(types) => {
                let union_parts: Vec<String> = types.iter().map(|t| self.generate_type_name(t)).collect();
                union_parts.join("|")
            }
            TypeNode::Generic(name, type_args) => {
                let arg_strings: Vec<String> = type_args.iter().map(|t| self.generate_type_name(t)).collect();
                format!("{}<{}>", name, arg_strings.join(", "))
            }
            TypeNode::Constrained { base_type, constraints } => {
                let base_str = self.generate_type_name(base_type);
                let mut constraint_strs = Vec::new();

                for constraint in constraints {
                    constraint_strs.push(self.generate_constraint_string(constraint));
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
                let value_str = self.generate_expression_value(&Some(expr.clone()));
                format!("={}", value_str)
            }
            TypeNode::InlineObject(_) => "object".to_string(),
        }
    }

    fn generate_constraint_string(&mut self, constraint: &ConstraintNode) -> String {
        match constraint.constraint_type {
            // For min/max, we need to track position in the constraint list
            // This will be handled in generate_type_schema
            ConstraintType::Min => self.generate_expression_value(&constraint.value),
            ConstraintType::Max => self.generate_expression_value(&constraint.value),
            ConstraintType::MinLength => self.generate_expression_value(&constraint.value),
            ConstraintType::MaxLength => self.generate_expression_value(&constraint.value),
            ConstraintType::Matches => self.generate_expression_value(&constraint.value),
            ConstraintType::Contains => self.generate_expression_value(&constraint.value),
            ConstraintType::StartsWith => self.generate_expression_value(&constraint.value),
            ConstraintType::EndsWith => self.generate_expression_value(&constraint.value),
            ConstraintType::HasUppercase => String::new(),
            ConstraintType::HasLowercase => String::new(),
            ConstraintType::HasNumber => String::new(),
            ConstraintType::HasSpecialChar => String::new(),
            ConstraintType::Between => self.generate_expression_value(&constraint.value),
            ConstraintType::In => self.generate_expression_value(&constraint.value),
            ConstraintType::NotIn => self.generate_expression_value(&constraint.value),
            ConstraintType::Exists => String::new(),
            ConstraintType::Empty => String::new(),
            ConstraintType::Null => String::new(),
            ConstraintType::Future => String::new(),
            ConstraintType::Past => String::new(),
            ConstraintType::Before => self.generate_expression_value(&constraint.value),
            ConstraintType::After => self.generate_expression_value(&constraint.value),
            ConstraintType::Integer => "int".to_string(),
            ConstraintType::Positive => "positive".to_string(),
            ConstraintType::Negative => "negative".to_string(),
            ConstraintType::Float => "float".to_string(),
            ConstraintType::Literal => self.generate_expression_value(&constraint.value),
        }
    }

    fn generate_conditional_fields(&mut self, conditional: &ConditionalNode) -> String {
        // Generate fields from conditional block with inline ReliantType syntax
        // Format: "when <condition> *? <thenType> : <elseType>"
        let indent = self.get_indent();
        let mut output = String::new();
        
        // Generate condition expression
        let condition_str = self.generate_expression(&conditional.condition);
        
        // Generate each field from the then block with inline conditional syntax
        for field in &conditional.then_fields {
            let field_name = &field.name;
            let then_type = self.generate_type_schema(&field.field_type);
            
            // Check if there's an else value
            let else_type = if conditional.else_fields.is_empty() {
                // No else block - field is optional in else case
                format!("\"any?\"")
            } else {
                // Find matching field in else block
                let else_field = conditional.else_fields.iter()
                    .find(|f| f.name == *field_name);
                
                if let Some(else_f) = else_field {
                    self.generate_type_schema(&else_f.field_type)
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
                let else_type = self.generate_type_schema(&field.field_type);
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
            output.push_str(&self.generate_conditional_fields(nested));
        }
        
        output
    }

    fn generate_conditional_schema(&mut self, conditional: &ConditionalNode) -> String {
        // Generate conditional schema validation with proper conditional logic
        let condition_expr = self.generate_expression(&conditional.condition);
        let then_schema = self.generate_type_schema(&conditional.then_value);

        if let Some(else_type) = &conditional.else_value {
            let else_schema = self.generate_type_schema(else_type);
            // Generate conditional schema: if condition then then_schema else else_schema
            format!("conditional({}, {}, {})", condition_expr, then_schema, else_schema)
        } else {
            // If no else branch, use conditional with optional/undefined
            format!("conditional({}, {}, undefined)", condition_expr, then_schema)
        }
    }


    fn generate_constraint(&mut self, constraint: &ConstraintNode) -> String {
        match constraint.constraint_type {
            ConstraintType::Min => format!(".min({})", self.generate_expression_value(&constraint.value)),
            ConstraintType::Max => format!(".max({})", self.generate_expression_value(&constraint.value)),
            ConstraintType::MinLength => format!(".minLength({})", self.generate_expression_value(&constraint.value)),
            ConstraintType::MaxLength => format!(".maxLength({})", self.generate_expression_value(&constraint.value)),
            ConstraintType::Matches => format!(".matches({})", self.generate_expression_value(&constraint.value)),
            ConstraintType::Contains => format!(".contains({})", self.generate_expression_value(&constraint.value)),
            ConstraintType::StartsWith => format!(".startsWith({})", self.generate_expression_value(&constraint.value)),
            ConstraintType::EndsWith => format!(".endsWith({})", self.generate_expression_value(&constraint.value)),
            ConstraintType::HasUppercase => ".hasUppercase()".to_string(),
            ConstraintType::HasLowercase => ".hasLowercase()".to_string(),
            ConstraintType::HasNumber => ".hasNumber()".to_string(),
            ConstraintType::HasSpecialChar => ".hasSpecialChar()".to_string(),
            ConstraintType::Between => format!(".between({})", self.generate_expression_value(&constraint.value)),
            ConstraintType::In => format!(".in({})", self.generate_expression_value(&constraint.value)),
            ConstraintType::NotIn => format!(".notIn({})", self.generate_expression_value(&constraint.value)),
            ConstraintType::Exists => ".exists()".to_string(),
            ConstraintType::Empty => ".empty()".to_string(),
            ConstraintType::Null => ".null()".to_string(),
            ConstraintType::Future => ".future()".to_string(),
            ConstraintType::Past => ".past()".to_string(),
            ConstraintType::Before => format!(".before({})", self.generate_expression_value(&constraint.value)),
            ConstraintType::After => format!(".after({})", self.generate_expression_value(&constraint.value)),
            ConstraintType::Integer => ".integer()".to_string(),
            ConstraintType::Positive => ".positive()".to_string(),
            ConstraintType::Negative => ".negative()".to_string(),
            ConstraintType::Float => ".float()".to_string(),
            ConstraintType::Literal => format!(".literal({})", self.generate_expression_value(&constraint.value)),
        }
    }

    fn generate_expression(&mut self, expr: &ExpressionNode) -> String {
        match expr {
            ExpressionNode::String(s) => format!("\"{}\"", s),
            ExpressionNode::RawString(s) => format!("\"{}\"", s), // Raw strings for regex
            ExpressionNode::Number(n) => n.to_string(),
            ExpressionNode::Boolean(b) => b.to_string(),
            ExpressionNode::Null => "null".to_string(),
            ExpressionNode::Undefined => "undefined".to_string(),
            ExpressionNode::Identifier(name) => name.clone(),
            ExpressionNode::VariableRef(name) => format!("{{/* var: {} */}}", name),  // TODO: resolve variable
            ExpressionNode::FieldAccess(path) => path.join("."),
            ExpressionNode::FunctionCall { name, arguments } => {
                let arg_strings: Vec<String> = arguments.iter().map(|arg| self.generate_expression(arg)).collect();
                format!("{}({})", name, arg_strings.join(", "))
            }
            ExpressionNode::MethodCall { field, method, arguments } => {
                let field_str = if field.is_empty() { String::new() } else { format!("{}.", field.join(".")) };
                let arg_strings: Vec<String> = arguments.iter().map(|arg| self.generate_expression(arg)).collect();
                format!("{}{}({})", field_str, method, arg_strings.join(", "))
            }
            ExpressionNode::BinaryOp { left, operator, right } => {
                let left_str = self.generate_expression(left);
                let right_str = self.generate_expression(right);
                let op_str = match operator {
                    BinaryOperator::And => "&&",
                    BinaryOperator::Or => "||",
                    BinaryOperator::Equals => "===",
                    BinaryOperator::NotEquals => "!==",
                    BinaryOperator::GreaterThan => ">",
                    BinaryOperator::GreaterEqual => ">=",
                    BinaryOperator::LessThan => "<",
                    BinaryOperator::LessEqual => "<=",
                    BinaryOperator::Matches => "~",
                    BinaryOperator::NotMatches => "!~",
                    BinaryOperator::In => "in",
                    BinaryOperator::NotIn => "not in",
                    BinaryOperator::Contains => "contains",
                    BinaryOperator::NotContains => "not contains",
                    BinaryOperator::Plus => "+",
                    BinaryOperator::Minus => "-",
                    BinaryOperator::Multiply => "*",
                    BinaryOperator::Divide => "/",
                    BinaryOperator::Modulo => "%",
                };
                format!("{} {} {}", left_str, op_str, right_str)
            }
            ExpressionNode::UnaryOp { operator, operand } => {
                let op_str = match operator {
                    UnaryOperator::Not => "!",
                    UnaryOperator::Negate => "-",
                };
                format!("{}{}", op_str, self.generate_expression(operand))
            }
            ExpressionNode::Group(expr) => format!("({})", self.generate_expression(expr)),
            ExpressionNode::Array(elements) => {
                let elem_strings: Vec<String> = elements.iter().map(|e| self.generate_expression(e)).collect();
                format!("[{}]", elem_strings.join(", "))
            }
            ExpressionNode::Object(fields) => {
                let field_strings: Vec<String> = fields.iter()
                    .map(|(key, value)| format!("{}: {}", key, self.generate_expression(value)))
                    .collect();
                format!("{{{}}}", field_strings.join(", "))
            }
            ExpressionNode::Range { start, end } => {
                format!("{}..{}", self.generate_expression(start), self.generate_expression(end))
            }
        }
    }

    fn generate_expression_value(&mut self, expr: &Option<ExpressionNode>) -> String {
        match expr {
            Some(expr) => self.generate_expression(expr),
            None => "\"\"".to_string(), // Default fallback
        }
    }

    fn generate_enum(&mut self, enum_node: &EnumNode) -> String {
        let mut output = String::new();
        
        // Generate TypeScript type
        output.push_str(&format!("export type {} = ", enum_node.name));
        let value_strings: Vec<String> = enum_node.values.iter()
            .map(|v| format!("\"{}\"", v))
            .collect();
        output.push_str(&value_strings.join(" | "));
        output.push_str(";\n\n");

        // Generate schema as a simple union type string
        let union_str = enum_node.values.join("|");
        output.push_str(&format!("export const {}Schema = \"{}\";\n", enum_node.name, union_str));

        output
    }

    fn generate_type_alias(&mut self, type_alias: &TypeAliasNode) -> String {
        let mut output = format!("export type {} = {};\n\n", type_alias.name, self.generate_type(&type_alias.type_definition));

        // Generate schema
        output.push_str(&format!("export const {}Schema = {};\n", type_alias.name, self.generate_type_schema(&type_alias.type_definition)));

        output
    }

    fn generate_import(&mut self, import: &ImportNode) -> String {
        let items_str = import.items.join(", ");
        format!("import {{ {} }} from \"{}\";", items_str, import.path)
    }

    fn generate_export(&mut self, export: &ExportNode) -> String {
        // This method is no longer used - exports are handled inline
        let items_str = export.items.join(", ");
        format!("export {{ {} }};", items_str)
    }

    fn generate_variable(&mut self, variable: &VariableNode) -> String {
        format!("const {} = {};", variable.name, self.generate_expression(&variable.value))
    }

    fn generate_mixin(&mut self, mixin: &MixinNode) -> String {
        let mut output = format!("// Mixin: {}\n", mixin.name);
        output.push_str("// Note: Mixins are expanded inline during compilation\n");
        output
    }

    fn generate_comment(&mut self, comment: &CommentNode) -> String {
        format!("//{}", comment.text)
    }

    fn generate_validation(&mut self, validation: &ValidationNode) -> String {
        let rule_str = match &validation.rule {
            ValidationRule::Custom(rule) => format!("// Custom validation: {}", rule),
            ValidationRule::FieldComparison { field, operator, value } => {
                let op_str = match operator {
                    ComparisonOperator::Equals => "===",
                    ComparisonOperator::NotEquals => "!==",
                    ComparisonOperator::GreaterThan => ">",
                    ComparisonOperator::GreaterEqual => ">=",
                    ComparisonOperator::LessThan => "<",
                    ComparisonOperator::LessEqual => "<=",
                    ComparisonOperator::Matches => "~",
                    ComparisonOperator::NotMatches => "!~",
                    ComparisonOperator::In => "in",
                    ComparisonOperator::NotIn => "not in",
                    ComparisonOperator::Contains => "contains",
                    ComparisonOperator::NotContains => "not contains",
                };
                format!("// Validate: {} {} {}", field, op_str, self.generate_expression(value))
            }
            ValidationRule::FunctionCall { name, arguments } => {
                let args_str = arguments.iter()
                    .map(|arg| self.generate_expression(arg))
                    .collect::<Vec<_>>()
                    .join(", ");
                format!("// Validate: {}({})", name, args_str)
            }
        };

        if let Some(message) = &validation.message {
            format!("{} // Message: {}", rule_str, message)
        } else {
            rule_str
        }
    }

    fn get_indent(&self) -> String {
        "  ".repeat(self.indent_level)
    }
}