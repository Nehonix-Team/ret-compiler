/**
 * rel Compiler - Main compiler class that orchestrates the compilation process
 */

use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};

use crate::ast::*;
use crate::lexer::Lexer;
use crate::parser::Parser;
use crate::generator::TypeScriptGenerator;
use crate::resolver::ModuleResolver;

#[derive(Debug)]
pub struct CompilerOptions {
    pub input_dir: PathBuf,
    pub output_dir: Option<PathBuf>,
    pub watch: bool,
}

pub struct relCompiler {
    options: CompilerOptions,
}

impl relCompiler {
    pub fn new(options: CompilerOptions) -> Self {
        Self { options }
    }

    pub fn compile(&self) -> Result<(), Box<dyn std::error::Error>> {
        println!("rel Compiler starting...");
        
        let input_path = &self.options.input_dir;
        
        // Check if input is a file or directory
        let rel_files = if input_path.is_file() {
            // Single file mode
            if input_path.extension().and_then(|s| s.to_str()) == Some("rel") {
                println!("Input file: {:?}", input_path);
                vec![input_path.clone()]
            } else {
                return Err(format!("Input file must have .rel extension: {:?}", input_path).into());
            }
        } else if input_path.is_dir() {
            // Directory mode
            println!("Input directory: {:?}", input_path);
            let files = self.find_rel_files(input_path)?;
            println!("Found {} .rel files", files.len());
            
            if files.is_empty() {
                println!("No .rel files found in {:?}", input_path);
                return Ok(());
            }
            files
        } else {
            return Err(format!("Input path does not exist: {:?}", input_path).into());
        };

        // Compile each file
        for file_path in rel_files {
            self.compile_file(&file_path)?;
        }

        println!("Compilation completed successfully!");
        Ok(())
    }

    pub fn find_rel_files(&self, dir: &Path) -> Result<Vec<PathBuf>, Box<dyn std::error::Error>> {
        let mut files = Vec::new();

        fn visit_dir(dir: &Path, files: &mut Vec<PathBuf>) -> Result<(), Box<dyn std::error::Error>> {
            if dir.is_dir() {
                for entry in fs::read_dir(dir)? {
                    let entry = entry?;
                    let path = entry.path();

                    if path.is_dir() {
                        visit_dir(&path, files)?;
                    } else if let Some(extension) = path.extension() {
                        if extension == "rel" {
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

        // Create module resolver
        let root_dir = file_path.parent()
            .ok_or("Cannot determine root directory")?
            .to_path_buf();
        let mut resolver = ModuleResolver::new(root_dir);

        // Resolve all dependencies (including imports)
        let dependencies = resolver.resolve_dependencies(file_path)
            .map_err(|e| format!("Dependency resolution failed: {}", e))?;

        // Get merged AST with all dependencies in correct order
        let ast_nodes = resolver.get_merged_ast(&dependencies);

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

// Runtime API for direct usage (like the rel class mentioned in the design)
pub struct rel {
    schemas: HashMap<String, String>, // Schema name -> TypeScript code
}

impl rel {
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
        let files = Self::find_rel_files_static(path)?;

        for file_path in files {
            self.build(file_path.to_str().unwrap())?;
        }

        Ok(())
    }

    fn find_rel_files_static(dir: &Path) -> Result<Vec<PathBuf>, Box<dyn std::error::Error>> {
        let mut files = Vec::new();

        fn visit_dir(dir: &Path, files: &mut Vec<PathBuf>) -> Result<(), Box<dyn std::error::Error>> {
            if dir.is_dir() {
                for entry in fs::read_dir(dir)? {
                    let entry = entry?;
                    let path = entry.path();

                    if path.is_dir() {
                        visit_dir(&path, files)?;
                    } else if let Some(extension) = path.extension() {
                        if extension == "rel" {
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

impl Default for rel {
    fn default() -> Self {
        Self::new()
    }
}