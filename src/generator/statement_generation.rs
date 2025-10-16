use crate::ast::*;

/// Statement generation methods for the TypeScript generator
pub struct StatementGeneration;

impl StatementGeneration {
    /// Generate enum statement
    pub fn generate_enum(enum_node: &EnumNode) -> String {
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

    /// Generate type alias statement
    pub fn generate_type_alias(type_alias: &TypeAliasNode) -> String {
        let mut output = format!("export type {} = {};\n\n", type_alias.name, super::type_generation::TypeGeneration::generate_type(&type_alias.type_definition));

        // Generate schema
        output.push_str(&format!("export const {}Schema = {};\n", type_alias.name, super::type_generation::TypeGeneration::generate_type_schema(&type_alias.type_definition)));

        output
    }

    /// Generate import statement
    pub fn generate_import(import: &ImportNode) -> String {
        let items_str = import.items.join(", ");
        format!("import {{ {} }} from \"{}\";", items_str, import.path)
    }

    /// Generate export statement
    pub fn generate_export(export: &ExportNode) -> String {
        // This method is no longer used - exports are handled inline
        let items_str = export.items.join(", ");
        format!("export {{ {} }};", items_str)
    }

    /// Generate variable statement
    pub fn generate_variable(variable: &VariableNode) -> String {
        format!("const {} = {};", variable.name, super::expression_generation::ExpressionGeneration::generate_expression(&variable.value))
    }

    /// Generate mixin statement
    pub fn generate_mixin(mixin: &MixinNode) -> String {
        let mut output = format!("// Mixin: {}\n", mixin.name);
        output.push_str("// Note: Mixins are expanded inline during compilation\n");
        output
    }

    /// Generate comment statement
    pub fn generate_comment(comment: &CommentNode) -> String {
        format!("//{}", comment.text)
    }

    /// Generate validation statement
    pub fn generate_validation(validation: &ValidationNode) -> String {
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
                format!("// Validate: {} {} {}", field, op_str, super::expression_generation::ExpressionGeneration::generate_expression(value))
            }
            ValidationRule::FunctionCall { name, arguments } => {
                let args_str = arguments.iter()
                    .map(|arg| super::expression_generation::ExpressionGeneration::generate_expression(arg))
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
}