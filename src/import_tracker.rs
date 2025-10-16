use std::collections::{HashMap, HashSet};
use crate::ast::{ASTNode, SchemaNode, FieldNode, TypeNode, ImportNode, ExportNode};

/// Tracks which imported types are actually used in schemas
pub struct ImportTracker {
    /// Map of imported type name -> source file
    imports: HashMap<String, String>,
    /// Set of types that are actually used
    used_types: HashSet<String>,
    /// Set of types that should be exported
    exports: HashSet<String>,
}

impl ImportTracker {
    pub fn new() -> Self {
        Self {
            imports: HashMap::new(),
            used_types: HashSet::new(),
            exports: HashSet::new(),
        }
    }

    /// Register an import statement
    pub fn add_import(&mut self, import: &ImportNode) {
        for name in &import.items {
            self.imports.insert(name.clone(), import.path.clone());
        }
    }

    /// Register an export statement
    pub fn add_export(&mut self, export: &ExportNode) {
        for name in &export.items {
            self.exports.insert(name.clone());
        }
    }

    /// Track usage of a type in a schema
    pub fn track_type_usage(&mut self, type_node: &TypeNode) {
        match type_node {
            TypeNode::Identifier(name) => {
                // Check if this is an imported type
                if self.imports.contains_key(name) {
                    self.used_types.insert(name.clone());
                }
            }
            TypeNode::Array(inner) => {
                self.track_type_usage(inner);
            }
            TypeNode::Union(types) => {
                for t in types {
                    self.track_type_usage(t);
                }
            }
            TypeNode::Generic(_, args) => {
                for arg in args {
                    self.track_type_usage(arg);
                }
            }
            TypeNode::Constrained { base_type, .. } => {
                self.track_type_usage(base_type);
            }
            TypeNode::Conditional(cond) => {
                self.track_type_usage(&cond.then_value);
                if let Some(else_val) = &cond.else_value {
                    self.track_type_usage(else_val);
                }
            }
            TypeNode::InlineObject(fields) => {
                for field in fields {
                    self.track_field_usage(field);
                }
            }
            _ => {}
        }
    }

    /// Track usage in a field
    fn track_field_usage(&mut self, field: &FieldNode) {
        self.track_type_usage(&field.field_type);
        
        // Track types in conditionals
        for conditional in &field.conditionals {
            for then_field in &conditional.then_fields {
                self.track_field_usage(then_field);
            }
            for else_field in &conditional.else_fields {
                self.track_field_usage(else_field);
            }
        }
    }

    /// Track usage in a schema
    pub fn track_schema_usage(&mut self, schema: &SchemaNode) {
        for field in &schema.fields {
            self.track_field_usage(field);
        }
    }

    /// Get unused imports (imports that were never used)
    pub fn get_unused_imports(&self) -> Vec<String> {
        self.imports.keys()
            .filter(|name| !self.used_types.contains(*name))
            .cloned()
            .collect()
    }

    /// Check if a type should be exported
    pub fn should_export(&self, name: &str) -> bool {
        self.exports.contains(name)
    }

    /// Get all types that should be exported
    pub fn get_exports(&self) -> &HashSet<String> {
        &self.exports
    }

    /// Check if a type is imported
    pub fn is_imported(&self, name: &str) -> bool {
        self.imports.contains_key(name)
    }
}

/// Analyze AST and build import/export tracking
pub fn analyze_imports_exports(ast: &[ASTNode]) -> Result<ImportTracker, String> {
    let mut tracker = ImportTracker::new();

    // First pass: collect imports and exports
    for node in ast {
        match node {
            ASTNode::Import(import) => {
                tracker.add_import(import);
            }
            ASTNode::Export(export) => {
                tracker.add_export(export);
            }
            _ => {}
        }
    }

    // Second pass: track type usage
    for node in ast {
        match node {
            ASTNode::Schema(schema) => {
                tracker.track_schema_usage(schema);
            }
            _ => {}
        }
    }

    // Check for unused imports
    let unused = tracker.get_unused_imports();
    if !unused.is_empty() {
        return Err(format!(
            "Unused imports detected: {}. Remove them or use them in your schemas.",
            unused.join(", ")
        ));
    }

    Ok(tracker)
}
