use crate::ast::*;
use crate::context::CompilationContext;
use std::collections::HashMap;

/// Constraint generation methods for the TypeScript generator
pub struct ConstraintGeneration;

impl ConstraintGeneration {
    /// Generate constrained type inline
    pub fn generate_constrained_type_inline(base_type: &TypeNode, constraints: &[ConstraintNode], context: &CompilationContext) -> String {
        let base = match base_type {
            TypeNode::Number => "number",
            TypeNode::String => "string",
            TypeNode::Array(_) => return super::type_generation::TypeGeneration::expand_type_inline(base_type, &HashMap::new(), &mut context.clone(), &mut 0, &|_, _, _, _| String::new()),
            _ => return super::type_generation::TypeGeneration::expand_type_inline(base_type, &HashMap::new(), &mut context.clone(), &mut 0, &|_, _, _, _| String::new()),
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
            let pat_str = super::expression_generation::ExpressionGeneration::expression_to_string(&pat, context);
            return format!("\"{}({})\"", base, pat_str);
        }

        match (min_val, max_val) {
            (Some(min), Some(max)) => {
                let min_str = super::expression_generation::ExpressionGeneration::expression_to_string(&min, context);
                let max_str = super::expression_generation::ExpressionGeneration::expression_to_string(&max, context);
                format!("\"{}({},{})\"", base, min_str, max_str)
            },
            (Some(min), None) => {
                let min_str = super::expression_generation::ExpressionGeneration::expression_to_string(&min, context);
                format!("\"{}({},)\"", base, min_str)
            },
            (None, Some(max)) => {
                let max_str = super::expression_generation::ExpressionGeneration::expression_to_string(&max, context);
                format!("\"{}(,{})\"", base, max_str)
            },
            (None, None) => format!("\"{}\"", base),
        }
    }

    /// Generate constraint string representation
    pub fn generate_constraint_string(constraint: &ConstraintNode) -> String {
        match constraint.constraint_type {
            // For min/max, we need to track position in the constraint list
            // This will be handled in generate_type_schema
            ConstraintType::Min => super::type_generation::TypeGeneration::generate_expression_value(&constraint.value),
            ConstraintType::Max => super::type_generation::TypeGeneration::generate_expression_value(&constraint.value),
            ConstraintType::MinLength => super::type_generation::TypeGeneration::generate_expression_value(&constraint.value),
            ConstraintType::MaxLength => super::type_generation::TypeGeneration::generate_expression_value(&constraint.value),
            ConstraintType::Matches => super::type_generation::TypeGeneration::generate_expression_value(&constraint.value),
            ConstraintType::Contains => super::type_generation::TypeGeneration::generate_expression_value(&constraint.value),
            ConstraintType::StartsWith => super::type_generation::TypeGeneration::generate_expression_value(&constraint.value),
            ConstraintType::EndsWith => super::type_generation::TypeGeneration::generate_expression_value(&constraint.value),
            ConstraintType::HasUppercase => String::new(),
            ConstraintType::HasLowercase => String::new(),
            ConstraintType::HasNumber => String::new(),
            ConstraintType::HasSpecialChar => String::new(),
            ConstraintType::Between => super::type_generation::TypeGeneration::generate_expression_value(&constraint.value),
            ConstraintType::In => super::type_generation::TypeGeneration::generate_expression_value(&constraint.value),
            ConstraintType::NotIn => super::type_generation::TypeGeneration::generate_expression_value(&constraint.value),
            ConstraintType::Exists => String::new(),
            ConstraintType::Empty => String::new(),
            ConstraintType::Null => String::new(),
            ConstraintType::Future => String::new(),
            ConstraintType::Past => String::new(),
            ConstraintType::Before => super::type_generation::TypeGeneration::generate_expression_value(&constraint.value),
            ConstraintType::After => super::type_generation::TypeGeneration::generate_expression_value(&constraint.value),
            ConstraintType::Integer => "int".to_string(),
            ConstraintType::Positive => "positive".to_string(),
            ConstraintType::Negative => "negative".to_string(),
            ConstraintType::Float => "float".to_string(),
            ConstraintType::Literal => super::type_generation::TypeGeneration::generate_expression_value(&constraint.value),
        }
    }

    /// Generate constraint method call for fluent API
    pub fn generate_constraint(constraint: &ConstraintNode) -> String {
        match constraint.constraint_type {
            ConstraintType::Min => format!(".min({})", super::type_generation::TypeGeneration::generate_expression_value(&constraint.value)),
            ConstraintType::Max => format!(".max({})", super::type_generation::TypeGeneration::generate_expression_value(&constraint.value)),
            ConstraintType::MinLength => format!(".minLength({})", super::type_generation::TypeGeneration::generate_expression_value(&constraint.value)),
            ConstraintType::MaxLength => format!(".maxLength({})", super::type_generation::TypeGeneration::generate_expression_value(&constraint.value)),
            ConstraintType::Matches => format!(".matches({})", super::type_generation::TypeGeneration::generate_expression_value(&constraint.value)),
            ConstraintType::Contains => format!(".contains({})", super::type_generation::TypeGeneration::generate_expression_value(&constraint.value)),
            ConstraintType::StartsWith => format!(".startsWith({})", super::type_generation::TypeGeneration::generate_expression_value(&constraint.value)),
            ConstraintType::EndsWith => format!(".endsWith({})", super::type_generation::TypeGeneration::generate_expression_value(&constraint.value)),
            ConstraintType::HasUppercase => ".hasUppercase()".to_string(),
            ConstraintType::HasLowercase => ".hasLowercase()".to_string(),
            ConstraintType::HasNumber => ".hasNumber()".to_string(),
            ConstraintType::HasSpecialChar => ".hasSpecialChar()".to_string(),
            ConstraintType::Between => format!(".between({})", super::type_generation::TypeGeneration::generate_expression_value(&constraint.value)),
            ConstraintType::In => format!(".in({})", super::type_generation::TypeGeneration::generate_expression_value(&constraint.value)),
            ConstraintType::NotIn => format!(".notIn({})", super::type_generation::TypeGeneration::generate_expression_value(&constraint.value)),
            ConstraintType::Exists => ".exists()".to_string(),
            ConstraintType::Empty => ".empty()".to_string(),
            ConstraintType::Null => ".null()".to_string(),
            ConstraintType::Future => ".future()".to_string(),
            ConstraintType::Past => ".past()".to_string(),
            ConstraintType::Before => format!(".before({})", super::type_generation::TypeGeneration::generate_expression_value(&constraint.value)),
            ConstraintType::After => format!(".after({})", super::type_generation::TypeGeneration::generate_expression_value(&constraint.value)),
            ConstraintType::Integer => ".integer()".to_string(),
            ConstraintType::Positive => ".positive()".to_string(),
            ConstraintType::Negative => ".negative()".to_string(),
            ConstraintType::Float => ".float()".to_string(),
            ConstraintType::Literal => format!(".literal({})", super::type_generation::TypeGeneration::generate_expression_value(&constraint.value)),
        }
    }
}