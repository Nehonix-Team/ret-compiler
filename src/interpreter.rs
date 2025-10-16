/**
 * rel Interpreter - Executes rel AST nodes
 * 
 * Supports:
 * - Variable declarations (declare var)
 * - Type declarations (declare type)
 * - Print statements
 * - Expression evaluation
 */

use crate::ast::*;
use std::collections::HashMap;

#[derive(Debug, Clone)]
pub enum RuntimeValue {
    String(String),
    Number(f64),
    Boolean(bool),
    Null,
    Undefined,
    Array(Vec<RuntimeValue>),
    Object(HashMap<String, RuntimeValue>),
    Type(TypeNode),
}

impl std::fmt::Display for RuntimeValue {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            RuntimeValue::String(s) => write!(f, "\"{}\"", s),
            RuntimeValue::Number(n) => write!(f, "{}", n),
            RuntimeValue::Boolean(b) => write!(f, "{}", b),
            RuntimeValue::Null => write!(f, "null"),
            RuntimeValue::Undefined => write!(f, "undefined"),
            RuntimeValue::Array(arr) => {
                write!(f, "[")?;
                for (i, val) in arr.iter().enumerate() {
                    if i > 0 {
                        write!(f, ", ")?;
                    }
                    write!(f, "{}", val)?;
                }
                write!(f, "]")
            }
            RuntimeValue::Object(obj) => {
                write!(f, "{{")?;
                for (i, (key, val)) in obj.iter().enumerate() {
                    if i > 0 {
                        write!(f, ", ")?;
                    }
                    write!(f, "{}: {}", key, val)?;
                }
                write!(f, "}}")
            }
            RuntimeValue::Type(type_node) => write!(f, "<Type: {:?}>", type_node),
        }
    }
}

#[derive(Debug)]
pub struct RuntimeError {
    pub message: String,
    pub line: usize,
    pub column: usize,
}

impl RuntimeError {
    fn new(message: String) -> Self {
        Self {
            message,
            line: 0,
            column: 0,
        }
    }
}

pub struct Interpreter {
    variables: HashMap<String, RuntimeValue>,
    types: HashMap<String, TypeNode>,
}

impl Interpreter {
    pub fn new() -> Self {
        Self {
            variables: HashMap::new(),
            types: HashMap::new(),
        }
    }

    pub fn execute(&mut self, nodes: &[ASTNode]) -> Result<(), Vec<RuntimeError>> {
        let mut errors = Vec::new();

        for node in nodes {
            if let Err(e) = self.execute_node(node) {
                errors.push(e);
            }
        }

        if errors.is_empty() {
            Ok(())
        } else {
            Err(errors)
        }
    }

    fn execute_node(&mut self, node: &ASTNode) -> Result<(), RuntimeError> {
        match node {
            ASTNode::DeclareVar(var_node) => {
                let value = self.evaluate_expression(&var_node.value)?;
                self.variables.insert(var_node.name.clone(), value);
                Ok(())
            }
            ASTNode::DeclareType(type_node) => {
                self.types.insert(type_node.name.clone(), type_node.type_def.clone());
                Ok(())
            }
            ASTNode::Print(print_node) => {
                let mut output = Vec::new();
                for arg in &print_node.arguments {
                    let value = self.evaluate_expression(arg)?;
                    output.push(format!("{}", value));
                }
                println!("{}", output.join(" "));
                Ok(())
            }
            ASTNode::Variable(var_node) => {
                let value = self.evaluate_expression(&var_node.value)?;
                self.variables.insert(var_node.name.clone(), value);
                Ok(())
            }
            // Schema definitions, imports, exports, etc. are not executed at runtime
            ASTNode::Schema(_) | ASTNode::Import(_) | ASTNode::Export(_) |
            ASTNode::Enum(_) | ASTNode::TypeAlias(_) | ASTNode::Mixin(_) |
            ASTNode::ValidationStatement(_) | ASTNode::Field(_) |
            ASTNode::Conditional(_) | ASTNode::Validation(_) |
            ASTNode::Comment(_) | ASTNode::Function(_) | ASTNode::ForLoop(_) => {
                // These are compile-time constructs, skip during runtime
                Ok(())
            }
        }
    }

    fn evaluate_expression(&self, expr: &ExpressionNode) -> Result<RuntimeValue, RuntimeError> {
        match expr {
            ExpressionNode::String(s) => Ok(RuntimeValue::String(s.clone())),
            ExpressionNode::RawString(s) => Ok(RuntimeValue::String(s.clone())),
            ExpressionNode::Number(n) => Ok(RuntimeValue::Number(*n)),
            ExpressionNode::Boolean(b) => Ok(RuntimeValue::Boolean(*b)),
            ExpressionNode::Null => Ok(RuntimeValue::Null),
            ExpressionNode::Undefined => Ok(RuntimeValue::Undefined),
            
            ExpressionNode::Identifier(name) => {
                self.variables.get(name)
                    .cloned()
                    .ok_or_else(|| RuntimeError::new(format!("Undefined variable: {}", name)))
            }
            
            ExpressionNode::VariableRef(name) => {
                self.variables.get(name)
                    .cloned()
                    .ok_or_else(|| RuntimeError::new(format!("Undefined variable: {}", name)))
            }
            
            ExpressionNode::Array(elements) => {
                let mut values = Vec::new();
                for elem in elements {
                    values.push(self.evaluate_expression(elem)?);
                }
                Ok(RuntimeValue::Array(values))
            }
            
            ExpressionNode::Object(fields) => {
                let mut obj = HashMap::new();
                for (key, value_expr) in fields {
                    let value = self.evaluate_expression(value_expr)?;
                    obj.insert(key.clone(), value);
                }
                Ok(RuntimeValue::Object(obj))
            }
            
            ExpressionNode::BinaryOp { left, operator, right } => {
                let left_val = self.evaluate_expression(left)?;
                let right_val = self.evaluate_expression(right)?;
                self.evaluate_binary_op(&left_val, operator, &right_val)
            }
            
            ExpressionNode::UnaryOp { operator, operand } => {
                let operand_val = self.evaluate_expression(operand)?;
                self.evaluate_unary_op(operator, &operand_val)
            }
            
            ExpressionNode::Group(inner) => {
                self.evaluate_expression(inner)
            }
            
            ExpressionNode::FieldAccess(path) => {
                // For now, just return the path as a string
                Ok(RuntimeValue::String(path.join(".")))
            }
            
            ExpressionNode::FunctionCall { name, arguments } => {
                // Evaluate built-in functions
                self.evaluate_function_call(name, arguments)
            }
            
            ExpressionNode::MethodCall { field, method, arguments } => {
                // For now, return a placeholder
                Ok(RuntimeValue::String(format!("{}.{}(...)", field.join("."), method)))
            }
            
            ExpressionNode::Range { start, end } => {
                let start_val = self.evaluate_expression(start)?;
                let end_val = self.evaluate_expression(end)?;
                Ok(RuntimeValue::String(format!("{}..{}", start_val, end_val)))
            }
        }
    }

    fn evaluate_binary_op(
        &self,
        left: &RuntimeValue,
        operator: &BinaryOperator,
        right: &RuntimeValue,
    ) -> Result<RuntimeValue, RuntimeError> {
        match (left, operator, right) {
            // Arithmetic operations
            (RuntimeValue::Number(l), BinaryOperator::Plus, RuntimeValue::Number(r)) => {
                Ok(RuntimeValue::Number(l + r))
            }
            (RuntimeValue::Number(l), BinaryOperator::Minus, RuntimeValue::Number(r)) => {
                Ok(RuntimeValue::Number(l - r))
            }
            (RuntimeValue::Number(l), BinaryOperator::Multiply, RuntimeValue::Number(r)) => {
                Ok(RuntimeValue::Number(l * r))
            }
            (RuntimeValue::Number(l), BinaryOperator::Divide, RuntimeValue::Number(r)) => {
                if *r == 0.0 {
                    Err(RuntimeError::new("Division by zero".to_string()))
                } else {
                    Ok(RuntimeValue::Number(l / r))
                }
            }
            (RuntimeValue::Number(l), BinaryOperator::Modulo, RuntimeValue::Number(r)) => {
                Ok(RuntimeValue::Number(l % r))
            }
            
            // String concatenation
            (RuntimeValue::String(l), BinaryOperator::Plus, RuntimeValue::String(r)) => {
                Ok(RuntimeValue::String(format!("{}{}", l, r)))
            }
            
            // Comparison operations
            (RuntimeValue::Number(l), BinaryOperator::Equals, RuntimeValue::Number(r)) => {
                Ok(RuntimeValue::Boolean((l - r).abs() < f64::EPSILON))
            }
            (RuntimeValue::String(l), BinaryOperator::Equals, RuntimeValue::String(r)) => {
                Ok(RuntimeValue::Boolean(l == r))
            }
            (RuntimeValue::Boolean(l), BinaryOperator::Equals, RuntimeValue::Boolean(r)) => {
                Ok(RuntimeValue::Boolean(l == r))
            }
            
            (RuntimeValue::Number(l), BinaryOperator::NotEquals, RuntimeValue::Number(r)) => {
                Ok(RuntimeValue::Boolean((l - r).abs() >= f64::EPSILON))
            }
            (RuntimeValue::String(l), BinaryOperator::NotEquals, RuntimeValue::String(r)) => {
                Ok(RuntimeValue::Boolean(l != r))
            }
            
            (RuntimeValue::Number(l), BinaryOperator::GreaterThan, RuntimeValue::Number(r)) => {
                Ok(RuntimeValue::Boolean(l > r))
            }
            (RuntimeValue::Number(l), BinaryOperator::GreaterEqual, RuntimeValue::Number(r)) => {
                Ok(RuntimeValue::Boolean(l >= r))
            }
            (RuntimeValue::Number(l), BinaryOperator::LessThan, RuntimeValue::Number(r)) => {
                Ok(RuntimeValue::Boolean(l < r))
            }
            (RuntimeValue::Number(l), BinaryOperator::LessEqual, RuntimeValue::Number(r)) => {
                Ok(RuntimeValue::Boolean(l <= r))
            }
            
            // Logical operations
            (RuntimeValue::Boolean(l), BinaryOperator::And, RuntimeValue::Boolean(r)) => {
                Ok(RuntimeValue::Boolean(*l && *r))
            }
            (RuntimeValue::Boolean(l), BinaryOperator::Or, RuntimeValue::Boolean(r)) => {
                Ok(RuntimeValue::Boolean(*l || *r))
            }
            
            _ => Err(RuntimeError::new(format!(
                "Invalid binary operation: {:?} {:?} {:?}",
                left, operator, right
            ))),
        }
    }

    fn evaluate_unary_op(
        &self,
        operator: &UnaryOperator,
        operand: &RuntimeValue,
    ) -> Result<RuntimeValue, RuntimeError> {
        match (operator, operand) {
            (UnaryOperator::Not, RuntimeValue::Boolean(b)) => {
                Ok(RuntimeValue::Boolean(!b))
            }
            (UnaryOperator::Negate, RuntimeValue::Number(n)) => {
                Ok(RuntimeValue::Number(-n))
            }
            _ => Err(RuntimeError::new(format!(
                "Invalid unary operation: {:?} {:?}",
                operator, operand
            ))),
        }
    }

    fn evaluate_function_call(
        &self,
        name: &str,
        arguments: &[ExpressionNode],
    ) -> Result<RuntimeValue, RuntimeError> {
        match name {
            "len" | "length" => {
                if arguments.len() != 1 {
                    return Err(RuntimeError::new(format!(
                        "Function '{}' expects 1 argument, got {}",
                        name,
                        arguments.len()
                    )));
                }
                let arg = self.evaluate_expression(&arguments[0])?;
                match arg {
                    RuntimeValue::String(s) => Ok(RuntimeValue::Number(s.len() as f64)),
                    RuntimeValue::Array(arr) => Ok(RuntimeValue::Number(arr.len() as f64)),
                    _ => Err(RuntimeError::new(format!(
                        "Function '{}' expects a string or array",
                        name
                    ))),
                }
            }
            _ => Err(RuntimeError::new(format!("Unknown function: {}", name))),
        }
    }

    pub fn get_variable(&self, name: &str) -> Option<&RuntimeValue> {
        self.variables.get(name)
    }

    pub fn get_type(&self, name: &str) -> Option<&TypeNode> {
        self.types.get(name)
    }
}
