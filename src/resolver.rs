use std::collections::{HashMap, HashSet};
use std::path::{Path, PathBuf};
use std::fs;
use crate::ast::{ASTNode, ImportNode, ExportNode};
use crate::lexer::Lexer;
use crate::parser::Parser;
use crate::import_tracker::{ImportTracker, analyze_imports_exports};

pub struct ModuleResolver {
    /// Map of file path -> parsed AST
    modules: HashMap<PathBuf, Vec<ASTNode>>,
    /// Set of files being processed (for circular dependency detection)
    processing: HashSet<PathBuf>,
    /// Root directory for resolving relative imports
    root_dir: PathBuf,
}

impl ModuleResolver {
    pub fn new(root_dir: PathBuf) -> Self {
        Self {
            modules: HashMap::new(),
            processing: HashSet::new(),
            root_dir,
        }
    }

    /// Resolve all dependencies for a given file
    pub fn resolve_dependencies(&mut self, file_path: &Path) -> Result<Vec<PathBuf>, String> {
        let canonical_path = self.canonicalize_path(file_path)?;
        
        // Check for circular dependencies
        if self.processing.contains(&canonical_path) {
            return Err(format!("Circular dependency detected: {:?}", canonical_path));
        }

        // If already processed, return cached result
        if self.modules.contains_key(&canonical_path) {
            return Ok(vec![canonical_path]);
        }

        self.processing.insert(canonical_path.clone());

        // Parse the file
        let ast = self.parse_file(&canonical_path)?;
        
        // Find all imports
        let imports = self.extract_imports(&ast);
        
        // Resolve each import recursively first
        let mut import_paths = Vec::new();
        let mut dependencies = Vec::new();
        for import in &imports {
            let import_path = self.resolve_import_path(&canonical_path, &import.path)?;
            import_paths.push(import_path.clone());
            let sub_deps = self.resolve_dependencies(&import_path)?;
            
            // Add sub-dependencies first (topological order)
            for dep in sub_deps {
                if !dependencies.contains(&dep) {
                    dependencies.push(dep);
                }
            }
        }
        
        // Verify imports after all dependencies are resolved
        self.verify_imports(&canonical_path, &imports)?;

        // Add current file last
        dependencies.push(canonical_path.clone());
        
        // Store parsed AST
        self.modules.insert(canonical_path.clone(), ast);
        self.processing.remove(&canonical_path);

        Ok(dependencies)
    }

    /// Get the merged AST for all dependencies in correct order
    /// Only includes schemas that are in the export chain
    pub fn get_merged_ast(&self, dependencies: &[PathBuf], main_file: &Path) -> Result<Vec<ASTNode>, String> {
        let mut merged = Vec::new();
        let mut seen_schemas = HashSet::new();
        let mut required_schemas = HashSet::new();

        // Canonicalize main_file path to match what's in modules
        let main_file_canonical = self.canonicalize_path(main_file)
            .map_err(|e| format!("Cannot canonicalize main file: {}", e))?;

        // Get the main file's exports (what we actually want to export)
        if let Some(main_ast) = self.modules.get(&main_file_canonical) {
            for node in main_ast {
                if let ASTNode::Export(export) = node {
                    for name in &export.items {
                        required_schemas.insert(name.clone());
                    }
                }
            }
        }
        

        // Build dependency graph: which schemas depend on which imported types
        let mut schema_dependencies: HashMap<String, HashSet<String>> = HashMap::new();
        
        for dep in dependencies {
            if let Some(ast) = self.modules.get(dep) {
                // Analyze imports/exports and check for unused imports
                let tracker = analyze_imports_exports(ast)
                    .map_err(|e| format!("Error in {:?}: {}", dep, e))?;

                for node in ast {
                    match node {
                        ASTNode::Schema(schema) => {
                            let mut deps = HashSet::new();
                            
                            // Track what this schema depends on
                            for field in &schema.fields {
                                self.collect_type_dependencies(&field.field_type, &mut deps);
                            }
                            
                            schema_dependencies.insert(schema.name.clone(), deps);
                        }
                        _ => {}
                    }
                }
            }
        }

        // Expand required_schemas to include all transitive dependencies
        let mut to_process: Vec<String> = required_schemas.iter().cloned().collect();
        while let Some(schema_name) = to_process.pop() {
            if let Some(deps) = schema_dependencies.get(&schema_name) {
                for dep in deps {
                    if !required_schemas.contains(dep) {
                        required_schemas.insert(dep.clone());
                        to_process.push(dep.clone());
                    }
                }
            }
        }

        // Now collect only the required schemas
        for dep in dependencies {
            if let Some(ast) = self.modules.get(dep) {
                let is_main_file = dep == &main_file_canonical;
                
                for node in ast {
                    match node {
                        ASTNode::Schema(schema) => {
                            // Only include if it's required
                            if required_schemas.contains(&schema.name) && !seen_schemas.contains(&schema.name) {
                                seen_schemas.insert(schema.name.clone());
                                merged.push(node.clone());
                            }
                        }
                        ASTNode::Enum(enum_node) => {
                            if required_schemas.contains(&enum_node.name) && !seen_schemas.contains(&enum_node.name) {
                                seen_schemas.insert(enum_node.name.clone());
                                merged.push(node.clone());
                            }
                        }
                        // Only include exports from the main file
                        ASTNode::Export(export) if is_main_file => {
                            merged.push(node.clone());
                        }
                        // Skip imports and exports from dependencies
                        ASTNode::Import(_) | ASTNode::Export(_) => {}
                        // Include other nodes
                        _ => merged.push(node.clone()),
                    }
                }
            }
        }

        Ok(merged)
    }

    /// Collect type dependencies (imported types used in a type definition)
    fn collect_type_dependencies(&self, type_node: &crate::ast::TypeNode, deps: &mut HashSet<String>) {
        use crate::ast::TypeNode;
        
        match type_node {
            TypeNode::Identifier(name) => {
                // This might be an imported type
                deps.insert(name.clone());
            }
            TypeNode::Array(inner) => {
                self.collect_type_dependencies(inner, deps);
            }
            TypeNode::Union(types) => {
                for t in types {
                    self.collect_type_dependencies(t, deps);
                }
            }
            TypeNode::Generic(_, args) => {
                for arg in args {
                    self.collect_type_dependencies(arg, deps);
                }
            }
            TypeNode::Constrained { base_type, .. } => {
                self.collect_type_dependencies(base_type, deps);
            }
            TypeNode::Conditional(cond) => {
                self.collect_type_dependencies(&cond.then_value, deps);
                if let Some(else_val) = &cond.else_value {
                    self.collect_type_dependencies(else_val, deps);
                }
            }
            TypeNode::InlineObject(fields) => {
                for field in fields {
                    self.collect_type_dependencies(&field.field_type, deps);
                }
            }
            _ => {}
        }
    }

    fn parse_file(&self, path: &Path) -> Result<Vec<ASTNode>, String> {
        let content = fs::read_to_string(path)
            .map_err(|e| format!("Failed to read file {:?}: {}", path, e))?;

        let mut lexer = Lexer::new(&content);
        let tokens = lexer.tokenize()
            .map_err(|e| format!("Lexer error in {:?}: {:?}", path, e))?;

        let mut parser = Parser::new(tokens);
        let ast = parser.parse()
            .map_err(|e| format!("Parser error in {:?}: {:?}", path, e))?;

        Ok(ast)
    }

    fn extract_imports(&self, ast: &[ASTNode]) -> Vec<ImportNode> {
        ast.iter()
            .filter_map(|node| {
                if let ASTNode::Import(import) = node {
                    Some(import.clone())
                } else {
                    None
                }
            })
            .collect()
    }

    /// Verify that imported items are actually exported by the source file
    fn verify_imports(&self, file_path: &Path, imports: &[ImportNode]) -> Result<(), String> {
        for import in imports {
            let import_path = self.resolve_import_path(file_path, &import.path)?;
            
            // Get the exports from the imported file
            if let Some(imported_ast) = self.modules.get(&import_path) {
                let mut exported_names = HashSet::new();
                
                for node in imported_ast {
                    if let ASTNode::Export(export) = node {
                        for name in &export.items {
                            exported_names.insert(name.clone());
                        }
                    }
                }
                
                // Check each imported item
                for item in &import.items {
                    if !exported_names.contains(item) {
                        return Err(format!(
                            "No module '{}' exported in '{}'\nAvailable exports: {}",
                            item,
                            import.path,
                            if exported_names.is_empty() {
                                "none".to_string()
                            } else {
                                exported_names.iter().cloned().collect::<Vec<_>>().join(", ")
                            }
                        ));
                    }
                }
            }
        }
        Ok(())
    }

    fn resolve_import_path(&self, current_file: &Path, import_path: &str) -> Result<PathBuf, String> {
        // Get the directory of the current file
        let current_dir = current_file.parent()
            .ok_or_else(|| format!("Cannot get parent directory of {:?}", current_file))?;

        // Resolve relative path
        let resolved = current_dir.join(import_path);
        
        self.canonicalize_path(&resolved)
    }

    fn canonicalize_path(&self, path: &Path) -> Result<PathBuf, String> {
        // Try to canonicalize, but if file doesn't exist yet, just normalize the path
        match path.canonicalize() {
            Ok(canonical) => Ok(canonical),
            Err(_) => {
                // File might not exist yet, normalize the path manually
                let mut normalized = PathBuf::new();
                for component in path.components() {
                    match component {
                        std::path::Component::ParentDir => {
                            normalized.pop();
                        }
                        std::path::Component::CurDir => {}
                        _ => normalized.push(component),
                    }
                }
                Ok(normalized)
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_circular_dependency_detection() {
        // This would require creating test files
        // For now, we'll test the basic structure
        let resolver = ModuleResolver::new(PathBuf::from("."));
        assert!(resolver.modules.is_empty());
    }
}
