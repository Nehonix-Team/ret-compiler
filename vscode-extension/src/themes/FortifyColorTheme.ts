/**
 * Fortify Color Theme Module
 *
 * Manages semantic token colors and theme configurations for Fortify Schema
 * - Provides multiple color schemes (default, vibrant, minimal)
 * - Handles automatic theme application
 * - Maintains color consistency across different VSCode themes
 */

import * as vscode from "vscode";
import { FortifyColorScheme } from "./color.scheme";
import { DEFAULT_COLOR_SCHEME } from "./scheme/DEFAULT_COLOR_SCHEME";
import { DEFAULT_MINIMAL, DEFAULT_VIBRANT } from "./scheme/VIBRANT&Minimal";
import { AllSchemsByName } from "./scheme";
import { default_scheme } from "../constants/default";

/**
 * Predefined color schemes
 */
export class FortifyColorSchemes {
  private static readonly SCHEMES = AllSchemsByName;

  /**
   * Get all available color schemes
   */
  static getAllSchemes(): FortifyColorScheme[] {
    return Object.values(this.SCHEMES);
  }

  /**
   * Get color scheme by name
   */
  static getScheme(name: string): FortifyColorScheme | undefined {
    return FortifyColorSchemes.getAllSchemes().find(
      (scheme) => scheme.name === name
    );
  }
}

/**
 * Color theme manager for Fortify Schema
 */
export class FortifyColorThemeManager {
  /**
   * Apply a color scheme to VSCode settings
   */
  public static async applyColorScheme(
    schemeName: string = default_scheme,
    target: vscode.ConfigurationTarget = vscode.ConfigurationTarget.Global
  ): Promise<boolean> {
    try {
      // const schemeName = "SYNTHWAVE_COLOR_SCHEME";
      const scheme = FortifyColorSchemes.getScheme(schemeName);
      if (!scheme) {
        throw new Error(`Color scheme '${schemeName}' not found`);
      }

      const config = vscode.workspace.getConfiguration();
      const currentColors =
        (config.get("editor.semanticTokenColorCustomizations") as any) || {};

      // Create semantic token color rules
      const semanticTokenColors = {
        rules: {
          // Core types
          type: scheme.colors.basicType,
          "type.fortify.basicType": scheme.colors.basicType,
          "type.fortify.formatType": scheme.colors.formatType,
          "type.fortify.numericType": scheme.colors.numericType,

          // Keywords and operators
          keyword: scheme.colors.conditionalKeyword,
          "keyword.fortify.conditionalKeyword":
            scheme.colors.conditionalKeyword,
          operator: scheme.colors.conditionalOperator,
          "operator.fortify.conditionalOperator":
            scheme.colors.conditionalOperator,
          "operator.fortify.logicalOperator": scheme.colors.logicalOperator,
          "operator.fortify.comparisonOperator":
            scheme.colors.comparisonOperator,

          // Functions and methods
          function: scheme.colors.method,
          "function.fortify.method": scheme.colors.method,
          "function.fortify.methodCall": scheme.colors.methodCall,

          // Variables and constants
          variable: scheme.colors.constant,
          "variable.fortify.constant": scheme.colors.constant,
          "variable.readonly": scheme.colors.constant,

          // Enum members (union literals and constants)
          enumMember: scheme.colors.constant,
          "enumMember.fortify.unionLiteral": scheme.colors.constant,
          "enumMember.fortify.constant": scheme.colors.constant,

          // Structural elements
          punctuation: scheme.colors.constraint,
          "punctuation.fortify.constraint": scheme.colors.constraint,
          "punctuation.fortify.array": scheme.colors.array,
          "punctuation.fortify.optional": scheme.colors.optional,
          "punctuation.fortify.unionSeparator": scheme.colors.unionSeparator,

          // Literals
          number: scheme.colors.numericLiteral,
          "number.fortify.numericLiteral": scheme.colors.numericLiteral,
          string: scheme.colors.stringLiteral,
          "string.fortify.stringLiteral": scheme.colors.stringLiteral,
        },
      };

      // Merge with existing semantic token colors
      const mergedColors = {
        ...currentColors,
        rules: {
          ...(currentColors.rules || {}),
          ...semanticTokenColors.rules,
        },
      };

      // Apply the configuration
      await config.update(
        "editor.semanticTokenColorCustomizations",
        mergedColors,
        target
      );

      return true;
    } catch (error) {
      console.error("Failed to apply Fortify color scheme:", error);
      return false;
    }
  }

  /**
   * Remove Fortify color customizations
   */
  static async removeColorScheme(
    target: vscode.ConfigurationTarget = vscode.ConfigurationTarget.Global
  ): Promise<boolean> {
    try {
      const config = vscode.workspace.getConfiguration();
      const currentColors =
        (config.get("editor.semanticTokenColorCustomizations") as any) || {};

      if (currentColors.rules) {
        // Remove Fortify-specific rules
        const filteredRules = Object.keys(currentColors.rules)
          .filter((key) => !key.includes("fortify"))
          .reduce((obj: any, key) => {
            obj[key] = currentColors.rules[key];
            return obj;
          }, {});

        const updatedColors = {
          ...currentColors,
          rules: filteredRules,
        };

        await config.update(
          "editor.semanticTokenColorCustomizations",
          updatedColors,
          target
        );
      }

      return true;
    } catch (error) {
      console.error("Failed to remove Fortify color scheme:", error);
      return false;
    }
  }

  /**
   * Get current color scheme name from settings
   */
  static getCurrentScheme(): string {
    const config = vscode.workspace.getConfiguration("fortify");
    const schemeName = config.get("colorTheme", "default");

    // Validate that the scheme exists, fallback to default if not
    const scheme = FortifyColorSchemes.getScheme(schemeName);
    if (!scheme) {
      console.warn(
        `Fortify color scheme '${schemeName}' not found, falling back to 'default'`
      );
      return "default";
    }

    return schemeName;
  }

  /**
   * Get all available scheme names
   */
  static getAvailableSchemeNames(): string[] {
    return FortifyColorSchemes.getAllSchemes().map((scheme) => scheme.name);
  }

  /**
   * Set current color scheme in settings
   */
  static async setCurrentScheme(schemeName: string): Promise<void> {
    const config = vscode.workspace.getConfiguration("fortify");
    await config.update(
      "colorTheme",
      schemeName,
      vscode.ConfigurationTarget.Global
    );
  }
}
