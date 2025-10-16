/**
 * Project Management Module
 *
 * Handles project initialization and setup.
 */

use std::fs;
use std::path::PathBuf;

/// Initialize a new rel project with default structure
pub fn init_project(dir: &PathBuf) -> Result<(), Box<dyn std::error::Error>> {
    println!("Creating rel project structure...");

    // Create schemas directory
    let schemas_dir = dir.join("schemas");
    fs::create_dir_all(&schemas_dir)?;

    // Create example schema file
    let example_schema = schemas_dir.join("User.rel");
    let example_content = r#"# Example User Schema
define User {
  id: number
  email: string & matches(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
  name: string & minLength(2)
  age: number & positive & integer & min(13) & max(120)
  role: admin | user | guest
  createdAt: date
  isActive: boolean = true
}

export User
"#;
    fs::write(&example_schema, example_content)?;

    // Create rel.json config file
    let config_content = r#"{
  "name": "my-rel-project",
  "version": "1.0.0",
  "schemas": "./schemas",
  "output": "./generated"
}"#;
    fs::write(dir.join("rel.json"), config_content)?;

    // Create README
    let readme_content = r#"# rel Project

This is a ReliantType Compiler project.

## Usage

```bash
# Build schemas
rel build

# Watch for changes
rel watch

# Validate schemas
rel check
```

## Project Structure

- `schemas/` - Your .rel schema files
- `generated/` - Generated TypeScript interfaces and schemas
- `rel.json` - Project configuration
"#;
    fs::write(dir.join("README.md"), readme_content)?;

    println!("✅ rel project initialized successfully!");
    println!("📁 Created directories: schemas/");
    println!("📄 Created files: schemas/User.rel, rel.json, README.md");

    Ok(())
}