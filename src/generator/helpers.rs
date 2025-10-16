/// Helper methods for the TypeScript generator
pub struct Helpers;

impl Helpers {
    /// Get indentation string based on level
    pub fn get_indent(indent_level: usize) -> String {
        "  ".repeat(indent_level)
    }

    /// Generate expression value as string (wrapper for type_generation method)
    pub fn generate_expression_value(expr: &Option<crate::ast::ExpressionNode>) -> String {
        super::type_generation::TypeGeneration::generate_expression_value(expr)
    }
}