use crate::ast::*;
use crate::context::CompilationContext;

/// Expression generation methods for the TypeScript generator
pub struct ExpressionGeneration;

impl ExpressionGeneration {
    /// Convert expression to string representation with context for variable resolution
    pub fn expression_to_string(expr: &ExpressionNode, context: &CompilationContext) -> String {
        match expr {
            ExpressionNode::Identifier(id) => id.clone(),
            ExpressionNode::Number(n) => n.to_string(),
            ExpressionNode::String(s) => s.clone(),
            ExpressionNode::RawString(s) => s.clone(),
            ExpressionNode::VariableRef(name) => {
                // Resolve variable reference from context
                if let Some(value) = context.get_variable(name) {
                    Self::expression_to_string(value, context)
                } else {
                    format!("/* var: {} */", name)
                }
            }
            ExpressionNode::Boolean(b) => b.to_string(),
            _ => "".to_string(),
        }
    }

    /// Generate expression as TypeScript/JavaScript code
    /// Note: This is for generating runtime JS code, not schema strings
    /// For schema generation with variable resolution, use expression_to_string with context
    pub fn generate_expression(expr: &ExpressionNode) -> String {
        match expr {
            ExpressionNode::String(s) => format!("\"{}\"", s),
            ExpressionNode::RawString(s) => format!("\"{}\"", s), // Raw strings for regex
            ExpressionNode::Number(n) => n.to_string(),
            ExpressionNode::Boolean(b) => b.to_string(),
            ExpressionNode::Null => "null".to_string(),
            ExpressionNode::Undefined => "undefined".to_string(),
            ExpressionNode::Identifier(name) => name.clone(),
            ExpressionNode::VariableRef(name) => {
                // For runtime JS generation, variable refs should be identifiers
                // The :: prefix is a compile-time construct
                name.clone()
            }
            ExpressionNode::FieldAccess(path) => path.join("."),
            ExpressionNode::FunctionCall { name, arguments } => {
                let arg_strings: Vec<String> = arguments.iter().map(|arg| Self::generate_expression(arg)).collect();
                format!("{}({})", name, arg_strings.join(", "))
            }
            ExpressionNode::MethodCall { field, method, arguments } => {
                let field_str = if field.is_empty() { String::new() } else { format!("{}.", field.join(".")) };
                let arg_strings: Vec<String> = arguments.iter().map(|arg| Self::generate_expression(arg)).collect();
                format!("{}{}({})", field_str, method, arg_strings.join(", "))
            }
            ExpressionNode::BinaryOp { left, operator, right } => {
                let left_str = Self::generate_expression(left);
                let right_str = Self::generate_expression(right);
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
                format!("{}{}", op_str, Self::generate_expression(operand))
            }
            ExpressionNode::Group(expr) => format!("({})", Self::generate_expression(expr)),
            ExpressionNode::Array(elements) => {
                let elem_strings: Vec<String> = elements.iter().map(|e| Self::generate_expression(e)).collect();
                format!("[{}]", elem_strings.join(", "))
            }
            ExpressionNode::Object(fields) => {
                let field_strings: Vec<String> = fields.iter()
                    .map(|(key, value)| format!("{}: {}", key, Self::generate_expression(value)))
                    .collect();
                format!("{{{}}}", field_strings.join(", "))
            }
            ExpressionNode::Range { start, end } => {
                format!("{}..{}", Self::generate_expression(start), Self::generate_expression(end))
            }
        }
    }
}