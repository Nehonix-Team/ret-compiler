/**
 * rel TypeScript Code Generator
 *
 * Converts AST nodes to TypeScript interfaces and validation schemas
 */

use crate::ast::*;

pub struct TypeScriptGenerator {
    indent_level: usize,
}

impl TypeScriptGenerator {
    pub fn new() -> Self {
        Self { indent_level: 0 }
    }

    pub fn generate(&mut self, nodes: &[ASTNode]) -> String {
        let mut output = String::new();

        for node in nodes {
            match node {
                ASTNode::Schema(schema) => {
                    output.push_str(&self.generate_schema(schema));
                    output.push_str("\n\n");
                }
                ASTNode::Enum(enum_node) => {
                    output.push_str(&self.generate_enum(enum_node));
                    output.push_str("\n\n");
                }
                ASTNode::TypeAlias(type_alias) => {
                    output.push_str(&self.generate_type_alias(type_alias));
                    output.push_str("\n\n");
                }
                ASTNode::Variable(variable) => {
                    output.push_str(&self.generate_variable(variable));
                    output.push_str("\n\n");
                }
                ASTNode::Mixin(mixin) => {
                    output.push_str(&self.generate_mixin(mixin));
                    output.push_str("\n\n");
                }
                ASTNode::Import(import) => {
                    output.push_str(&self.generate_import(import));
                    output.push_str("\n");
                }
                ASTNode::Export(export) => {
                    output.push_str(&self.generate_export(export));
                    output.push_str("\n");
                }
                ASTNode::Comment(comment) => {
                    output.push_str(&self.generate_comment(comment));
                    output.push_str("\n");
                }
                ASTNode::Validation(validation) => {
                    output.push_str(&self.generate_validation(validation));
                    output.push_str("\n");
                }
                _ => {} // TODO: Skip other node types for now
            }
        }

        output.trim_end().to_string()
    }

    fn generate_schema(&mut self, schema: &SchemaNode) -> String {
        let mut output = String::new();

        // Generate interface
        output.push_str(&format!("export interface {} {{\n", schema.name));
        self.indent_level += 1;

        for field in &schema.fields {
            output.push_str(&self.generate_field(field));
        }

        self.indent_level -= 1;
        output.push_str("}\n\n");

        // Generate schema
        output.push_str(&format!("export const {}Schema = Interface({{\n", schema.name));
        self.indent_level += 1;

        for field in &schema.fields {
            output.push_str(&self.generate_field_schema(field));
        }

        self.indent_level -= 1;
        output.push_str("});\n");

        output
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
        let mut output = format!("{}{}: ", indent, field.name);

        output.push_str(&self.generate_type_schema(&field.field_type));

        if field.optional {
            output.push_str(".optional()");
        }

        output.push_str(",\n");
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
            TypeNode::String => "string()".to_string(),
            TypeNode::Number => "number()".to_string(),
            TypeNode::Boolean => "boolean()".to_string(),
            TypeNode::Object => "object({})".to_string(),
            TypeNode::Null => "null()".to_string(),
            TypeNode::Undefined => "undefined()".to_string(),
            TypeNode::Any => "any()".to_string(),
            TypeNode::Unknown => "unknown()".to_string(),
            TypeNode::Identifier(name) => format!("{}Schema", name),
            TypeNode::Array(inner) => format!("array({})", self.generate_type_schema(inner)),
            TypeNode::Union(types) => {
                let schema_strings: Vec<String> = types.iter().map(|t| {
                    match t {
                        TypeNode::Identifier(name) => format!("literal(\"{}\")", name),
                        _ => self.generate_type_schema(t),
                    }
                }).collect();
                format!("union([{}])", schema_strings.join(", "))
            }
            TypeNode::Generic(name, type_args) => {
                let arg_strings: Vec<String> = type_args.iter().map(|t| self.generate_type_schema(t)).collect();
                format!("{}Schema({})", name, arg_strings.join(", "))
            }
            TypeNode::Constrained { base_type, constraints } => {
                let mut schema = self.generate_type_schema(base_type);
                for constraint in constraints {
                    schema.push_str(&self.generate_constraint(constraint));
                }
                schema
            }
            TypeNode::Conditional(conditional) => self.generate_conditional_schema(conditional),
        }
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
        let mut output = format!("export type {} = ", enum_node.name);

        let value_strings: Vec<String> = enum_node.values.iter()
            .map(|v| format!("\"{}\"", v))
            .collect();

        output.push_str(&value_strings.join(" | "));
        output.push_str(";\n\n");

        // Generate enum schema
        output.push_str(&format!("export const {}Schema = union([\n", enum_node.name));
        self.indent_level += 1;

        for value in &enum_node.values {
            let indent = self.get_indent();
            output.push_str(&format!("{}{}(\"{}\"),\n", indent, "literal", value));
        }

        self.indent_level -= 1;
        output.push_str("]);\n");

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