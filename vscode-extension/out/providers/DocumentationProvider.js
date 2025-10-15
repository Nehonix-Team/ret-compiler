"use strict";
/**
 * Documentation Provider for ReliantType
 *
 * Provides hover documentation and definition links for ReliantType types and utilities.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentationProvider = void 0;
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
class DocumentationProvider {
    /**
     * Initialize the documentation provider
     */
    static initialize(extensionPath) {
        this.documentationPath = path.join(extensionPath, "docs", "index.t.md");
        this.loadDocumentation();
    }
    /**
     * Load and parse the documentation file
     */
    static loadDocumentation() {
        try {
            console.log("Loading documentation from:", this.documentationPath);
            if (!fs.existsSync(this.documentationPath)) {
                console.warn("ReliantType documentation file not found at:", this.documentationPath);
                return;
            }
            const content = fs.readFileSync(this.documentationPath, "utf8");
            console.log("Documentation content loaded, length:", content.length);
            this.parseDocumentation(content);
            console.log("Documentation parsed, cache size:", this.documentationCache.size);
        }
        catch (error) {
            console.error("Failed to load ReliantType documentation:", error);
        }
    }
    /**
     * Parse the markdown documentation and extract entries
     */
    static parseDocumentation(content) {
        console.log("🔍 Starting documentation parsing...");
        const lines = content.split("\n");
        let currentSection = "";
        let currentEntry = {};
        let inCodeBlock = false;
        let codeLines = [];
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
                    this.saveDocumentationEntry(currentEntry);
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
                }
                else {
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
            }
            else if (line.startsWith("**Example:**")) {
                currentEntry.example = line.replace("**Example:**", "").trim();
            }
            else if (line.startsWith("**Use Cases:**")) {
                currentEntry.useCases = line.replace("**Use Cases:**", "").trim();
            }
        }
        // Save last entry
        if (currentEntry.name) {
            this.saveDocumentationEntry(currentEntry);
        }
    }
    /**
     * Save a documentation entry to the cache
     */
    static saveDocumentationEntry(entry) {
        // Store by exact name
        this.documentationCache.set(entry.name, entry);
        // Store by name without backticks
        const cleanName = entry.name.replace(/`/g, "");
        this.documentationCache.set(cleanName, entry);
        // Store variants for types with modifiers
        if (cleanName.includes("(") ||
            cleanName.includes("[") ||
            cleanName.includes("?")) {
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
    static getDocumentation(name) {
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
    static getAllDocumentation() {
        return Array.from(this.documentationCache.values());
    }
    /**
     * Get the path to the documentation file
     */
    static getDocumentationPath() {
        return this.documentationPath;
    }
    /**
     * Create a hover message for a type
     */
    static createHoverMessage(entry) {
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
            markdown.appendMarkdown(`**Code Example:**\n\`\`\`typescript\n${entry.codeExample}\n\`\`\`\n\n`);
        }
        // Link to full documentation
        const docUri = vscode.Uri.file(this.documentationPath);
        markdown.appendMarkdown(`[📖 View Full Documentation](${docUri.toString()})`);
        return markdown;
    }
    /**
     * Check if we're inside an Interface block
     */
    static isInInterfaceBlock(document, position) {
        const text = document.getText();
        const offset = document.offsetAt(position);
        // Look backwards for Interface( opening
        const beforeText = text.substring(0, offset);
        const interfaceMatches = [...beforeText.matchAll(/Interface\s*\(\s*\{/g)];
        if (interfaceMatches.length === 0)
            return false;
        // Look forwards for closing
        const afterText = text.substring(offset);
        const closingMatch = afterText.match(/\}\s*\)/);
        return closingMatch !== null;
    }
}
exports.DocumentationProvider = DocumentationProvider;
DocumentationProvider.documentationCache = new Map();
//# sourceMappingURL=DocumentationProvider.js.map