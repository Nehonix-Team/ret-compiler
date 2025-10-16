/**
 * Compilation Context - Stores variables, types, and functions during compilation
 */

use crate::ast::*;
use std::collections::HashMap;

#[derive(Debug, Clone)]
pub struct CompilationContext {
    /// Declared variables: name -> value
    pub variables: HashMap<String, ExpressionNode>,
    
    /// Declared types: name -> type definition
    pub type_aliases: HashMap<String, TypeNode>,
    
    /// Declared functions: name -> function definition
    pub functions: HashMap<String, FunctionNode>,
}

impl CompilationContext {
    pub fn new() -> Self {
        Self {
            variables: HashMap::new(),
            type_aliases: HashMap::new(),
            functions: HashMap::new(),
        }
    }
    
    /// Add a variable declaration
    pub fn add_variable(&mut self, name: String, value: ExpressionNode) {
        self.variables.insert(name, value);
    }
    
    /// Get a variable value
    pub fn get_variable(&self, name: &str) -> Option<&ExpressionNode> {
        self.variables.get(name)
    }
    
    /// Add a type alias
    pub fn add_type_alias(&mut self, name: String, type_def: TypeNode) {
        self.type_aliases.insert(name, type_def);
    }
    
    /// Get a type alias
    pub fn get_type_alias(&self, name: &str) -> Option<&TypeNode> {
        self.type_aliases.get(name)
    }
    
    /// Add a function
    pub fn add_function(&mut self, name: String, func: FunctionNode) {
        self.functions.insert(name, func);
    }
    
    /// Get a function
    pub fn get_function(&self, name: &str) -> Option<&FunctionNode> {
        self.functions.get(name)
    }
}

impl Default for CompilationContext {
    fn default() -> Self {
        Self::new()
    }
}
