//! Generator module for TypeScript code generation
//!
//! This module contains all the components needed for generating TypeScript
//! interfaces and validation schemas from AST nodes.

pub mod constraint_generation;
pub mod expression_generation;
pub mod helpers;
pub mod schema_generation;
pub mod statement_generation;
pub mod type_generation;

// Re-export main structs for easier access
pub use constraint_generation::ConstraintGeneration;
pub use expression_generation::ExpressionGeneration;
pub use helpers::Helpers;
pub use schema_generation::SchemaGeneration;
pub use statement_generation::StatementGeneration;
pub use type_generation::TypeGeneration;

/// Main TypeScript generator that orchestrates code generation
pub struct TypeScriptGenerator {
    indent_level: usize,
    /// Map of schema name -> schema definition for inline expansion
    schema_definitions: std::collections::HashMap<String, crate::ast::SchemaNode>,
    /// Set of schemas that should be exported
    exported_schemas: std::collections::HashSet<String>,
    /// Compilation context for variables, types, and functions
    context: crate::context::CompilationContext,
}

impl TypeScriptGenerator {
    pub fn new() -> Self {
        Self {
            indent_level: 0,
            schema_definitions: std::collections::HashMap::new(),
            exported_schemas: std::collections::HashSet::new(),
            context: crate::context::CompilationContext::new(),
        }
    }

    // ========================================================================
    // SECTION: Main Generation Method
    // ========================================================================

    pub fn generate(&mut self, ast: &[crate::ast::ASTNode]) -> String {
        // First pass: collect variables, types, schemas, and exports
        for node in ast {
            match node {
                crate::ast::ASTNode::DeclareVar(var) => {
                    self.context.add_variable(var.name.clone(), var.value.clone());
                }
                crate::ast::ASTNode::DeclareType(type_decl) => {
                    self.context.add_type_alias(type_decl.name.clone(), type_decl.type_def.clone());
                }
                crate::ast::ASTNode::Function(func) => {
                    self.context.add_function(func.name.clone(), func.clone());
                }
                crate::ast::ASTNode::Schema(schema) => {
                    self.schema_definitions.insert(schema.name.clone(), schema.clone());
                }
                crate::ast::ASTNode::Export(export) => {
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
                output.push_str(&SchemaGeneration::generate_schema_inline(
                    &schema,
                    &self.schema_definitions,
                    &mut self.context,
                    &mut self.indent_level,
                    &SchemaGeneration::generate_field_inline
                ));
                output.push_str("\n\n");
            }
        }

        output.trim_end().to_string()
    }

    // ========================================================================
    // SECTION: Helper Methods
    // ========================================================================

    fn get_indent(&self) -> String {
        Helpers::get_indent(self.indent_level)
    }
}