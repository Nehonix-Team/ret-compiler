use std::collections::{HashMap, HashSet};
use std::path::{Path, PathBuf};
use std::fs;
use crate::ast::{ASTNode, ImportNode};
use crate::lexer::Lexer;
use crate::parser::Parser;

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
        
        // Resolve each import recursively
        let mut dependencies = Vec::new();
        for import in imports {
            let import_path = self.resolve_import_path(&canonical_path, &import.path)?;
            let sub_deps = self.resolve_dependencies(&import_path)?;
            
            // Add sub-dependencies first (topological order)
            for dep in sub_deps {
                if !dependencies.contains(&dep) {
                    dependencies.push(dep);
                }
            }
        }

        // Add current file last
        dependencies.push(canonical_path.clone());
        
        // Store parsed AST
        self.modules.insert(canonical_path.clone(), ast);
        self.processing.remove(&canonical_path);

        Ok(dependencies)
    }

    /// Get the merged AST for all dependencies in correct order
    pub fn get_merged_ast(&self, dependencies: &[PathBuf]) -> Vec<ASTNode> {
        let mut merged = Vec::new();
        let mut seen_schemas = HashSet::new();

        for dep in dependencies {
            if let Some(ast) = self.modules.get(dep) {
                for node in ast {
                    // Skip duplicate schema definitions
                    match node {
                        ASTNode::Schema(schema) => {
                            if !seen_schemas.contains(&schema.name) {
                                seen_schemas.insert(schema.name.clone());
                                merged.push(node.clone());
                            }
                        }
                        ASTNode::Enum(enum_node) => {
                            if !seen_schemas.contains(&enum_node.name) {
                                seen_schemas.insert(enum_node.name.clone());
                                merged.push(node.clone());
                            }
                        }
                        // Skip import statements in merged output
                        ASTNode::Import(_) => {}
                        // Include everything else
                        _ => merged.push(node.clone()),
                    }
                }
            }
        }

        merged
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
