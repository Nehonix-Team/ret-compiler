/**
 * Fortify Schema VSCode Extension
 *
 * Provides syntax highlighting, autocompletion, and validation for Fortify Schema
 * - The revolutionary TypeScript validation library with interface-like syntax
 */

import * as vscode from "vscode";
import { FortifyCompletionProvider } from "./providers/CompletionProvider";
import { FortifyDiagnosticsProvider } from "./providers/FortifyDiagnostics";
import { FortifyHoverProvider } from "./providers/HoverProvider";
import { FortifySemanticTokensProvider } from "./providers/SemanticTokensProvider";
import {
  FortifyColorThemeManager,
  FortifyColorSchemes,
} from "./themes/FortifyColorTheme";

/**
 * Extension activation - called when the extension is activated
 */
export function activate(context: vscode.ExtensionContext) {
  console.log("🚀 Fortify Schema extension is now active!");

  // Register completion provider for TypeScript files
  const completionProvider = vscode.languages.registerCompletionItemProvider(
    ["typescript", "javascript"],
    new FortifyCompletionProvider(),
    '"', // Trigger on quote to provide schema type suggestions
    ":", // Trigger on colon for field definitions
    "|", // Trigger on pipe for union types
    "=", // Trigger on equals for constants
    "(", // Trigger on parentheses for constraints
    "." // Trigger on dot for method calls
  );

  // Register hover provider for type information
  const hoverProvider = vscode.languages.registerHoverProvider(
    ["typescript", "javascript"],
    new FortifyHoverProvider()
  );

  // Register semantic tokens provider for enhanced syntax highlighting
  const semanticTokensProvider =
    vscode.languages.registerDocumentSemanticTokensProvider(
      ["typescript", "javascript"],
      new FortifySemanticTokensProvider(),
      FortifySemanticTokensProvider.legend
    );

  // Register diagnostics provider for validation
  const diagnosticsProvider = new FortifyDiagnosticsProvider();

  // Watch for document changes to provide real-time validation
  const documentChangeListener = vscode.workspace.onDidChangeTextDocument(
    (event) => {
      if (
        event.document.languageId === "typescript" ||
        event.document.languageId === "javascript"
      ) {
        diagnosticsProvider.updateDiagnostics(event.document);
      }
    }
  );

  // Watch for document open to provide initial validation
  const documentOpenListener = vscode.workspace.onDidOpenTextDocument(
    (document) => {
      if (
        document.languageId === "typescript" ||
        document.languageId === "javascript"
      ) {
        diagnosticsProvider.updateDiagnostics(document);
      } 
    }
  );

  // Register commands
  const validateCommand = vscode.commands.registerCommand(
    "fortify.validateSchema",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        diagnosticsProvider.validateDocument(editor.document);
        vscode.window.showInformationMessage(
          "Fortify Schema validation completed!"
        );
      }
    }
  );

  const generateTypesCommand = vscode.commands.registerCommand(
    "fortify.generateTypes",
    () => {
      vscode.window.showInformationMessage(
        "TypeScript type generation coming soon!"
      );
    }
  );

  const formatSchemaCommand = vscode.commands.registerCommand(
    "fortify.formatSchema",
    () => {
      vscode.window.showInformationMessage("Schema formatting coming soon!");
    }
  );

  const applyColorSchemeCommand = vscode.commands.registerCommand(
    "fortify.applyColorScheme",
    async () => {
      try {
        // Show color scheme picker with all available schemes
        const schemes = FortifyColorSchemes.getAllSchemes();
        const schemeItems = schemes.map((scheme) => ({
          label: scheme.name.charAt(0).toUpperCase() + scheme.name.slice(1),
          description: scheme.description,
          detail: scheme.name,
        }));

        const selectedScheme = await vscode.window.showQuickPick(schemeItems, {
          placeHolder: "Select a Fortify color scheme",
          title: `Fortify Color Scheme (${schemes.length} available)`,
        });

        if (!selectedScheme) {
          return; // User cancelled
        }

        // Apply the selected color scheme
        const success = await FortifyColorThemeManager.applyColorScheme(
          selectedScheme.detail,
          vscode.ConfigurationTarget.Global
        );

        if (success) {
          // Update the setting
          await FortifyColorThemeManager.setCurrentScheme(
            selectedScheme.detail
          );

          vscode.window
            .showInformationMessage(
              `✨ ${selectedScheme.label} color scheme applied! Reload window to see changes.`,
              "Reload Window"
            )
            .then((selection) => {
              if (selection === "Reload Window") {
                vscode.commands.executeCommand("workbench.action.reloadWindow");
              }
            });
        } else {
          vscode.window.showErrorMessage(
            "Failed to apply color scheme. Please try again."
          );
        }
      } catch (error) {
        vscode.window.showErrorMessage(
          `Failed to apply color scheme: ${error}`
        );
      }
    }
  );

  const listColorSchemesCommand = vscode.commands.registerCommand(
    "fortify.listColorSchemes",
    () => {
      const schemes = FortifyColorSchemes.getAllSchemes();

      vscode.window.showInformationMessage(
        `Found ${schemes.length} color schemes. Check output panel for details.`
      );

      // Show in output channel for better formatting
      const outputChannel = vscode.window.createOutputChannel(
        "Fortify Color Schemes"
      );
      outputChannel.clear();
      outputChannel.appendLine("Fortify Schema - Available Color Schemes");
      outputChannel.appendLine("=".repeat(50));
      outputChannel.appendLine("");
      schemes.forEach((scheme, index) => {
        outputChannel.appendLine(`${index + 1}. ${scheme.name}`);
        outputChannel.appendLine(`   Description: ${scheme.description}`);
        outputChannel.appendLine("");
      });
      outputChannel.show();
    }
  );

  // Add all disposables to context
  context.subscriptions.push(
    completionProvider,
    hoverProvider,
    semanticTokensProvider,
    documentChangeListener,
    documentOpenListener,
    validateCommand,
    generateTypesCommand,
    formatSchemaCommand,
    applyColorSchemeCommand,
    listColorSchemesCommand
  );

  // Apply default color scheme if none is set
  const currentScheme = FortifyColorThemeManager.getCurrentScheme();
  if (currentScheme) {
    // Apply the current scheme to ensure semantic tokens are colored
    FortifyColorThemeManager.applyColorScheme(currentScheme);
  }

  // Show welcome message
  vscode.window.showInformationMessage(
    "✨ Fortify Schema extension loaded! Enhanced syntax highlighting and IntelliSense are now active."
  );
}

/**
 * Extension deactivation - called when the extension is deactivated
 */
export function deactivate() {
  console.log("👋 Fortify Schema extension deactivated");
}

/**
 * Utility function to check if a string contains Fortify Schema syntax
 */
export function isFortifySchema(text: string): boolean {
  // Check for common Fortify patterns
  const patterns = [
    /\b(string|number|boolean|date|email|url|uuid|phone|slug|username|int|positive|negative|float|any)\b/,
    /\b(string|number|int|float)\s*\(\s*\d*\s*,?\s*\d*\s*\)/,
    /\b\w+\s*\|\s*\w+/, // Union types
    /=\w+/, // Constants
    /when\s+\w+/, // Conditional syntax
    /\*\?/, // Conditional then operator
    /\.(in|contains|startsWith|endsWith|exists|empty|null)\b/, // Method calls
    /\[\](\?|\(\d*,?\d*\))?/, // Array notation
  ];

  return patterns.some((pattern) => pattern.test(text));
}

/**
 * Extract Fortify schema strings from TypeScript code
 */
export function extractSchemaStrings(
  text: string
): Array<{ value: string; start: number; end: number }> {
  const results: Array<{ value: string; start: number; end: number }> = [];

  // Handle regular string literals
  const stringRegex = /"([^"\\]|\\.)*"/g;
  let match;

  while ((match = stringRegex.exec(text)) !== null) {
    const stringValue = match[0].slice(1, -1); // Remove quotes
    if (isFortifySchema(stringValue)) {
      results.push({
        value: stringValue,
        start: match.index,
        end: match.index + match[0].length,
      });
    }
  }

  // Handle template literals (backticks) for dynamic properties
  const templateRegex = /`([^`\\]|\\.)*`/g;
  templateRegex.lastIndex = 0; // Reset regex state

  while ((match = templateRegex.exec(text)) !== null) {
    const templateValue = match[0].slice(1, -1); // Remove backticks
    if (isFortifySchema(templateValue)) {
      results.push({
        value: templateValue,
        start: match.index,
        end: match.index + match[0].length,
      });
    }
  }

  return results;
}
