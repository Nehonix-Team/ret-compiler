/**
 * Documentation Provider for ReliantType
 *
 * Provides hover documentation and definition links for ReliantType types and utilities.
 */

import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

export interface DocumentationEntry {
  name: string;
  description: string;
  example: string;
  useCases: string;
  codeExample?: string;
  section: string;
}

export class DocumentationProvider {
  private static documentationCache: Map<string, DocumentationEntry> =
    new Map();
  private static documentationPath: string;

  /**
   * Initialize the documentation provider
   */
  static initialize(extensionPath: string) {
    this.documentationPath = path.join(extensionPath, "docs", "index.t.md");
    this.loadDocumentation();
  }

  /**
   * Load and parse the documentation file
   */
  private static loadDocumentation() {
    try {
      console.log("Loading documentation from:", this.documentationPath);
      if (!fs.existsSync(this.documentationPath)) {
        console.warn(
          "ReliantType documentation file not found at:",
          this.documentationPath
        );
        return;
      }

      const content = fs.readFileSync(this.documentationPath, "utf8");
      console.log("Documentation content loaded, length:", content.length);
      this.parseDocumentation(content);
      console.log(
        "Documentation parsed, cache size:",
        this.documentationCache.size
      );
    } catch (error) {
      console.error("Failed to load ReliantType documentation:", error);
    }
  }

  /**
   * Parse the markdown documentation and extract entries
   */
  private static parseDocumentation(content: string) {
    console.log("🔍 Starting documentation parsing...");
    const lines = content.split("\n");
    let currentSection = "";
    let currentEntry: Partial<DocumentationEntry> = {};
    let inCodeBlock = false;
    let codeLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Track sections
      if (line.startsWith("## ")) {
        currentSection = line
          .replace("## ", "")
          .replace(/\s+/g, "-")
          .toLowerCase();
        continue;
      }

      // Track subsections (type definitions)
      if (line.startsWith("### ")) {
        // Save previous entry if exists
        if (currentEntry.name) {
          console.log("💾 Saving entry:", currentEntry.name);
          this.saveDocumentationEntry(currentEntry as DocumentationEntry);
        }

        // Start new entry
        const name = line.replace("### ", "").replace(/`/g, "");
        console.log("📝 Found new entry:", name);
        currentEntry = {
          name: name,
          section: currentSection,
          description: "",
          example: "",
          useCases: "",
          codeExample: "",
        };
        continue;
      }

      // Track code blocks
      if (line.startsWith("```")) {
        if (inCodeBlock) {
          // End of code block
          currentEntry.codeExample = codeLines.join("\n");
          codeLines = [];
          inCodeBlock = false;
        } else {
          // Start of code block
          inCodeBlock = true;
        }
        continue;
      }

      if (inCodeBlock) {
        codeLines.push(lines[i]); // Keep original indentation
        continue;
      }

      // Parse content
      if (line.startsWith("**Description:**")) {
        currentEntry.description = line.replace("**Description:**", "").trim();
      } else if (line.startsWith("**Example:**")) {
        currentEntry.example = line.replace("**Example:**", "").trim();
      } else if (line.startsWith("**Use Cases:**")) {
        currentEntry.useCases = line.replace("**Use Cases:**", "").trim();
      }
    }

    // Save last entry
    if (currentEntry.name) {
      this.saveDocumentationEntry(currentEntry as DocumentationEntry);
    }
  }

  /**
   * Save a documentation entry to the cache
   */
  private static saveDocumentationEntry(entry: DocumentationEntry) {
    // Store by exact name
    this.documentationCache.set(entry.name, entry);

    // Store by name without backticks
    const cleanName = entry.name.replace(/`/g, "");
    this.documentationCache.set(cleanName, entry);

    // Store variants for types with modifiers
    if (
      cleanName.includes("(") ||
      cleanName.includes("[") ||
      cleanName.includes("?")
    ) {
      const baseName = cleanName.split(/[\(\[\?]/)[0];
      if (!this.documentationCache.has(baseName)) {
        this.documentationCache.set(baseName, entry);
      }
    }

    // Special handling for Make.const
    if (cleanName.includes("Make.const")) {
      this.documentationCache.set("Make.const", entry);
      this.documentationCache.set("const", entry);
    }

    // Special handling for record types
    if (cleanName.includes("record<")) {
      this.documentationCache.set("record", entry);
    }
  }

  /**
   * Get documentation for a specific type or utility
   */
  static getDocumentation(name: string): DocumentationEntry | undefined {
    console.log("🔍 Looking for documentation for:", name);
    console.log("📚 Cache keys:", Array.from(this.documentationCache.keys()));

    // Try exact match first
    let entry = this.documentationCache.get(name);
    if (entry) {
      console.log("✅ Found exact match for:", name);
      return entry;
    }

    // Try without modifiers
    const baseName = name.replace(/[\?\[\]]/g, "").split("(")[0];
    entry = this.documentationCache.get(baseName);
    if (entry) {
      console.log("✅ Found base name match for:", baseName);
      return entry;
    }

    // Try case-insensitive match
    const lowerName = name.toLowerCase();
    for (const [key, value] of this.documentationCache.entries()) {
      if (key.toLowerCase() === lowerName) {
        console.log("✅ Found case-insensitive match for:", name);
        return value;
      }
    }

    console.log("❌ No documentation found for:", name);
    return undefined;
  }

  /**
   * Get all available documentation entries
   */
  static getAllDocumentation(): DocumentationEntry[] {
    return Array.from(this.documentationCache.values());
  }

  /**
   * Get the path to the documentation file
   */
  static getDocumentationPath(): string {
    return this.documentationPath;
  }

  /**
   * Create a hover message for a type
   */
  static createHoverMessage(entry: DocumentationEntry): vscode.MarkdownString {
    const markdown = new vscode.MarkdownString();
    markdown.isTrusted = true;

    // Title
    markdown.appendMarkdown(`### \`${entry.name}\`\n\n`);

    // Description
    if (entry.description) {
      markdown.appendMarkdown(`**Description:** ${entry.description}\n\n`);
    }

    // Example
    if (entry.example) {
      markdown.appendMarkdown(`**Example:** \`${entry.example}\`\n\n`);
    }

    // Use Cases
    if (entry.useCases) {
      markdown.appendMarkdown(`**Use Cases:** ${entry.useCases}\n\n`);
    }

    // Code Example
    if (entry.codeExample) {
      markdown.appendMarkdown(
        `**Code Example:**\n\`\`\`typescript\n${entry.codeExample}\n\`\`\`\n\n`
      );
    }

    // Link to full documentation
    const docUri = vscode.Uri.file(this.documentationPath);
    markdown.appendMarkdown(
      `[📖 View Full Documentation](${docUri.toString()})`
    );

    return markdown;
  }

  /**
   * Check if we're inside an Interface block
   */
  static isInInterfaceBlock(
    document: vscode.TextDocument,
    position: vscode.Position
  ): boolean {
    const text = document.getText();
    const offset = document.offsetAt(position);

    // Look backwards for Interface( opening
    const beforeText = text.substring(0, offset);
    const interfaceMatches = [...beforeText.matchAll(/Interface\s*\(\s*\{/g)];

    if (interfaceMatches.length === 0) return false;

    // Look forwards for closing
    const afterText = text.substring(offset);
    const closingMatch = afterText.match(/\}\s*\)/);

    return closingMatch !== null;
  }
}
