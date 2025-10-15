/**
 * rlt Compiler - Main compiler class that orchestrates the compilation process
 */

use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};

use crate::ast::*;
use crate::lexer::Lexer;
use crate::parser::Parser;
use crate::generator::TypeScriptGenerator;

#[derive(Debug)]
pub struct CompilerOptions {
    pub input_dir: PathBuf,
    pub output_dir: Option<PathBuf>,
    pub watch: bool,
}

pub struct rltCompiler {
    options: CompilerOptions,
}

impl rltCompiler {
    pub fn new(options: CompilerOptions) -> Self {
        Self { options }
    }

    pub fn compile(&self) -> Result<(), Box<dyn std::error::Error>> {
        println!("rlt Compiler starting...");
        println!("Input directory: {:?}", self.options.input_dir);

        // Find all .rlt files
        let rlt_files = self.find_rlt_files(&self.options.input_dir)?;
        println!("Found {} .rlt files", rlt_files.len());

        if rlt_files.is_empty() {
            println!("No .rlt files found in {:?}", self.options.input_dir);
            return Ok(());
        }

        // Compile each file
        for file_path in rlt_files {
            self.compile_file(&file_path)?;
        }

        println!("Compilation completed successfully!");
        Ok(())
    }

    pub fn find_rlt_files(&self, dir: &Path) -> Result<Vec<PathBuf>, Box<dyn std::error::Error>> {
        let mut files = Vec::new();

        fn visit_dir(dir: &Path, files: &mut Vec<PathBuf>) -> Result<(), Box<dyn std::error::Error>> {
            if dir.is_dir() {
                for entry in fs::read_dir(dir)? {
                    let entry = entry?;
                    let path = entry.path();

                    if path.is_dir() {
                        visit_dir(&path, files)?;
                    } else if let Some(extension) = path.extension() {
                        if extension == "rlt" {
                            files.push(path);
                        }
                    }
                }
            }
            Ok(())
        }

        visit_dir(dir, &mut files)?;
        Ok(files)
    }

    fn compile_file(&self, file_path: &Path) -> Result<(), Box<dyn std::error::Error>> {
        println!("Compiling: {:?}", file_path);

        // Read file content
        let content = fs::read_to_string(file_path)?;
        println!("File size: {} bytes", content.len());

        // Tokenize
        let lexer = Lexer::new(&content);
        let tokens = lexer.tokenize().map_err(|errors| {
            format!("Tokenization failed: {:?}", errors)
        })?;

        // Parse
        let mut parser = Parser::new(tokens);
        let ast_nodes = parser.parse().map_err(|errors| {
            format!("Parsing failed: {:?}", errors)
        })?;

        // Generate TypeScript
        let mut generator = TypeScriptGenerator::new();
        let ts_code = generator.generate(&ast_nodes);

        // Determine output path
        let output_path = self.get_output_path(file_path)?;
        fs::create_dir_all(output_path.parent().unwrap())?;

        // Write output
        fs::write(&output_path, ts_code)?;
        println!("Generated: {:?}", output_path);

        Ok(())
    }

    fn get_output_path(&self, input_path: &Path) -> Result<PathBuf, Box<dyn std::error::Error>> {
        let file_stem = input_path.file_stem()
            .ok_or("Invalid file name")?
            .to_str()
            .ok_or("Invalid file name encoding")?;

        let output_dir = self.options.output_dir
            .as_ref()
            .unwrap_or(&self.options.input_dir);

        // Create output path with .ts extension
        let mut output_path = output_dir.join(file_stem);
        output_path.set_extension("ts");

        Ok(output_path)
    }
}

// Runtime API for direct usage (like the rlt class mentioned in the design)
pub struct rlt {
    schemas: HashMap<String, String>, // Schema name -> TypeScript code
}

impl rlt {
    pub fn new() -> Self {
        Self {
            schemas: HashMap::new(),
        }
    }

    pub fn build(&mut self, file_path: &str) -> Result<String, Box<dyn std::error::Error>> {
        let content = fs::read_to_string(file_path)?;

        let lexer = Lexer::new(&content);
        let tokens = lexer.tokenize().map_err(|errors| {
            format!("Tokenization failed: {:?}", errors)
        })?;

        let mut parser = Parser::new(tokens);
        let ast_nodes = parser.parse().map_err(|errors| {
            format!("Parsing failed: {:?}", errors)
        })?;

        let mut generator = TypeScriptGenerator::new();
        let ts_code = generator.generate(&ast_nodes);

        // Extract schema names and store them
        for node in &ast_nodes {
            if let ASTNode::Schema(schema) = node {
                self.schemas.insert(schema.name.clone(), ts_code.clone());
            }
        }

        Ok(ts_code)
    }

    pub fn get(&self, schema_name: &str) -> Option<&String> {
        self.schemas.get(schema_name)
    }

    pub fn load(&mut self, dir_path: &str) -> Result<(), Box<dyn std::error::Error>> {
        let path = Path::new(dir_path);
        let files = Self::find_rlt_files_static(path)?;

        for file_path in files {
            self.build(file_path.to_str().unwrap())?;
        }

        Ok(())
    }

    fn find_rlt_files_static(dir: &Path) -> Result<Vec<PathBuf>, Box<dyn std::error::Error>> {
        let mut files = Vec::new();

        fn visit_dir(dir: &Path, files: &mut Vec<PathBuf>) -> Result<(), Box<dyn std::error::Error>> {
            if dir.is_dir() {
                for entry in fs::read_dir(dir)? {
                    let entry = entry?;
                    let path = entry.path();

                    if path.is_dir() {
                        visit_dir(&path, files)?;
                    } else if let Some(extension) = path.extension() {
                        if extension == "rlt" {
                            files.push(path);
                        }
                    }
                }
            }
            Ok(())
        }

        visit_dir(dir, &mut files)?;
        Ok(files)
    }
}

impl Default for rlt {
    fn default() -> Self {
        Self::new()
    }
}