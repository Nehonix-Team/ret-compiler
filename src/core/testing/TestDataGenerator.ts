/**
 * Test Data Generator for Conditional Validation
 *
 * Automatically generates valid test data based on conditional expressions
 * Helps developers create comprehensive test suites
 */

import { ConditionalParser } from "../schema/mode/interfaces/conditional/parser/ConditionalParser";
import {
  ASTWalker,
  ASTVisitor,
  ASTAnalyzer,
} from "../schema/mode/interfaces/conditional/parser/ConditionalAST";
import { ConditionalEvaluator } from "../schema/mode/interfaces/conditional/evaluator/ConditionalEvaluator";
import {
  ConditionalNode,
  LogicalExpressionNode,
  ComparisonNode,
  MethodCallNode,
  FieldAccessNode,
  LiteralNode,
  ConstantNode,
  ArrayNode,
  TokenType,
} from "../schema/mode/interfaces/conditional/types/ConditionalTypes";

// Test data generation options
export interface TestDataOptions {
  includeEdgeCases: boolean;
  includeInvalidCases: boolean;
  maxArrayLength: number;
  stringLength: { min: number; max: number };
  numberRange: { min: number; max: number };
  customValues?: Record<string, any[]>;
}

// Generated test case
export interface GeneratedTestCase {
  name: string;
  description: string;
  data: Record<string, any>;
  expectedResult: any;
  shouldPass: boolean;
  category: "valid" | "edge" | "invalid";
}

// Test suite
export interface GeneratedTestSuite {
  expression: string;
  fieldTypes: Record<string, string>;
  testCases: GeneratedTestCase[];
  coverage: {
    totalPaths: number;
    coveredPaths: number;
    percentage: number;
  };
}

/**
 * Test Data Generator
 */
export class TestDataGenerator {
  private parser: ConditionalParser;
  private options: TestDataOptions;

  constructor(options: Partial<TestDataOptions> = {}) {
    this.parser = new ConditionalParser({
      allowNestedConditionals: true,
      maxNestingDepth: 5,
      strictMode: false,
      enableDebug: false,
    });

    this.options = {
      includeEdgeCases: true,
      includeInvalidCases: true,
      maxArrayLength: 5,
      stringLength: { min: 3, max: 20 },
      numberRange: { min: 0, max: 100 },
      ...options,
    };
  }

  /**
   * Generate comprehensive test suite for conditional expression
   */
  generateTestSuite(expression: string): GeneratedTestSuite {
    const { ast, errors } = this.parser.parse(expression);

    if (errors.length > 0 || !ast) {
      throw new Error(
        `Cannot generate tests for invalid expression: ${errors[0]?.message}`
      );
    }

    // Analyze the AST to understand structure
    const fieldTypes = this.extractFieldTypes(ast);
    const testCases = this.generateTestCases(ast, fieldTypes);
    const coverage = this.calculateCoverage(ast, testCases);

    return {
      expression,
      fieldTypes,
      testCases,
      coverage,
    };
  }

  /**
   * Generate test cases that cover all paths
   */
  private generateTestCases(
    ast: ConditionalNode,
    fieldTypes: Record<string, string>
  ): GeneratedTestCase[] {
    const testCases: GeneratedTestCase[] = [];

    // Generate cases for true condition path
    const trueCases = this.generateCasesForCondition(ast, fieldTypes, true);
    testCases.push(...trueCases);

    // Generate cases for false condition path
    const falseCases = this.generateCasesForCondition(ast, fieldTypes, false);
    testCases.push(...falseCases);

    // Generate edge cases
    if (this.options.includeEdgeCases) {
      const edgeCases = this.generateEdgeCases(ast, fieldTypes);
      testCases.push(...edgeCases);
    }

    // Generate invalid cases
    if (this.options.includeInvalidCases) {
      const invalidCases = this.generateInvalidCases(ast, fieldTypes);
      testCases.push(...invalidCases);
    }

    return testCases;
  }

  /**
   * Generate test cases for specific condition result
   */
  private generateCasesForCondition(
    ast: ConditionalNode,
    fieldTypes: Record<string, string>,
    conditionResult: boolean
  ): GeneratedTestCase[] {
    const testCases: GeneratedTestCase[] = [];
    const constraints = this.extractConstraints(ast.condition, conditionResult);

    // Generate multiple variations
    for (let i = 0; i < 3; i++) {
      const data = this.generateDataFromConstraints(constraints, fieldTypes);
      const result = ConditionalEvaluator.evaluate(ast, data);

      if (result.success) {
        testCases.push({
          name: `${conditionResult ? "True" : "False"} condition case ${i + 1}`,
          description: `Test case where condition evaluates to ${conditionResult}`,
          data,
          expectedResult: result.value,
          shouldPass: true,
          category: "valid",
        });
      }
    }

    return testCases;
  }

  /**
   * Generate edge cases
   */
  private generateEdgeCases(
    ast: ConditionalNode,
    fieldTypes: Record<string, string>
  ): GeneratedTestCase[] {
    const testCases: GeneratedTestCase[] = [];

    // Boundary value cases for numeric fields
    Object.entries(fieldTypes).forEach(([field, type]) => {
      if (type === "number") {
        // Test with 0, negative, very large numbers
        const edgeValues = [
          0,
          -1,
          Number.MAX_SAFE_INTEGER,
          Number.MIN_SAFE_INTEGER,
        ];

        edgeValues.forEach((value, i) => {
          const data = this.generateBaseData(fieldTypes);
          this.setFieldValue(data, field, value);

          const result = ConditionalEvaluator.evaluate(ast, data);

          testCases.push({
            name: `Edge case: ${field} = ${value}`,
            description: `Test boundary value for numeric field ${field}`,
            data,
            expectedResult: result.success ? result.value : undefined,
            shouldPass: result.success,
            category: "edge",
          });
        });
      }

      if (type === "string") {
        // Test with empty string, very long string
        const edgeValues = ["", "a".repeat(1000), "   ", "\n\t"];

        edgeValues.forEach((value, i) => {
          const data = this.generateBaseData(fieldTypes);
          this.setFieldValue(data, field, value);

          const result = ConditionalEvaluator.evaluate(ast, data);

          testCases.push({
            name: `Edge case: ${field} = "${value.substring(0, 20)}${value.length > 20 ? "..." : ""}"`,
            description: `Test edge string value for field ${field}`,
            data,
            expectedResult: result.success ? result.value : undefined,
            shouldPass: result.success,
            category: "edge",
          });
        });
      }
    });

    return testCases;
  }

  /**
   * Generate invalid test cases
   */
  private generateInvalidCases(
    ast: ConditionalNode,
    fieldTypes: Record<string, string>
  ): GeneratedTestCase[] {
    const testCases: GeneratedTestCase[] = [];

    // Test with missing fields
    Object.keys(fieldTypes).forEach((field) => {
      const data = this.generateBaseData(fieldTypes);
      this.removeField(data, field);

      const result = ConditionalEvaluator.evaluate(ast, data);

      testCases.push({
        name: `Missing field: ${field}`,
        description: `Test case with missing required field ${field}`,
        data,
        expectedResult: result.success ? result.value : undefined,
        shouldPass: result.success,
        category: "invalid",
      });
    });

    // Test with null values
    Object.entries(fieldTypes).forEach(([field, type]) => {
      const data = this.generateBaseData(fieldTypes);
      this.setFieldValue(data, field, null);

      const result = ConditionalEvaluator.evaluate(ast, data);

      testCases.push({
        name: `Null field: ${field}`,
        description: `Test case with null value for field ${field}`,
        data,
        expectedResult: result.success ? result.value : undefined,
        shouldPass: result.success,
        category: "invalid",
      });
    });

    return testCases;
  }

  /**
   * Extract field types from AST
   */
  private extractFieldTypes(ast: ConditionalNode): Record<string, string> {
    const fieldTypes: Record<string, string> = {};

    const visitor: ASTVisitor<void> = {
      visitConditional: (node) => {
        ASTWalker.walk(node.condition, visitor);
        ASTWalker.walk(node.thenValue, visitor);
        if (node.elseValue) ASTWalker.walk(node.elseValue, visitor);
      },

      visitLogicalExpression: (node) => {
        ASTWalker.walk(node.left, visitor);
        ASTWalker.walk(node.right, visitor);
      },

      visitComparison: (node) => {
        const fieldPath = node.left.path.join(".");
        fieldTypes[fieldPath] = this.inferTypeFromComparison(node);
      },

      visitMethodCall: (node) => {
        const fieldPath = node.field.path.join(".");
        fieldTypes[fieldPath] = this.inferTypeFromMethod(node);
      },

      visitFieldAccess: () => {},
      visitLiteral: () => {},
      visitConstant: () => {},
      visitArray: () => {},
    };

    ASTWalker.walk(ast, visitor);
    return fieldTypes;
  }

  /**
   * Extract constraints from condition
   */
  private extractConstraints(
    condition: any,
    targetResult: boolean
  ): Record<string, any> {
    const constraints: Record<string, any> = {};

    // This would implement constraint extraction logic
    // For now, return empty constraints
    return constraints;
  }

  /**
   * Generate data from constraints
   */
  private generateDataFromConstraints(
    constraints: Record<string, any>,
    fieldTypes: Record<string, string>
  ): Record<string, any> {
    const data = this.generateBaseData(fieldTypes);

    // Apply constraints to generate specific values
    Object.entries(constraints).forEach(([field, constraint]) => {
      const value = this.generateValueForConstraint(
        constraint,
        fieldTypes[field]
      );
      this.setFieldValue(data, field, value);
    });

    return data;
  }

  /**
   * Generate base data with random values
   */
  private generateBaseData(
    fieldTypes: Record<string, string>
  ): Record<string, any> {
    const data: Record<string, any> = {};

    Object.entries(fieldTypes).forEach(([field, type]) => {
      const value = this.generateRandomValue(type, field);
      this.setFieldValue(data, field, value);
    });

    return data;
  }

  /**
   * Generate random value for type
   */
  private generateRandomValue(type: string, field: string): any {
    // Check for custom values first
    if (this.options.customValues?.[field]) {
      const customValues = this.options.customValues[field];
      return customValues[Math.floor(Math.random() * customValues.length)];
    }

    switch (type) {
      case "string":
        return this.generateRandomString();

      case "number":
        return this.generateRandomNumber();

      case "boolean":
        return Math.random() > 0.5;

      case "array":
        return this.generateRandomArray();

      default:
        // Try to infer from field name
        if (field.includes("email")) return this.generateRandomEmail();
        if (field.includes("age")) return Math.floor(Math.random() * 80) + 18;
        if (field.includes("role"))
          return this.getRandomFromArray(["admin", "user", "guest"]);
        if (field.includes("status"))
          return this.getRandomFromArray(["active", "inactive", "pending"]);

        return this.generateRandomString();
    }
  }

  /**
   * Generate random string
   */
  private generateRandomString(): string {
    const length =
      Math.floor(
        Math.random() *
          (this.options.stringLength.max - this.options.stringLength.min)
      ) + this.options.stringLength.min;
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";

    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
  }

  /**
   * Generate random number
   */
  private generateRandomNumber(): number {
    return (
      Math.floor(
        Math.random() *
          (this.options.numberRange.max - this.options.numberRange.min)
      ) + this.options.numberRange.min
    );
  }

  /**
   * Generate random array
   */
  private generateRandomArray(): any[] {
    const length = Math.floor(Math.random() * this.options.maxArrayLength) + 1;
    const array = [];

    for (let i = 0; i < length; i++) {
      array.push(this.generateRandomString());
    }

    return array;
  }

  /**
   * Generate random email
   */
  private generateRandomEmail(): string {
    const domains = ["example.com", "test.org", "demo.net"];
    const username = this.generateRandomString().toLowerCase();
    const domain = domains[Math.floor(Math.random() * domains.length)];
    return `${username}@${domain}`;
  }

  /**
   * Get random item from array
   */
  private getRandomFromArray<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Set field value in nested object
   */
  private setFieldValue(
    data: Record<string, any>,
    fieldPath: string,
    value: any
  ): void {
    const parts = fieldPath.split(".");
    let current = data;

    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }

    current[parts[parts.length - 1]] = value;
  }

  /**
   * Remove field from nested object
   */
  private removeField(data: Record<string, any>, fieldPath: string): void {
    const parts = fieldPath.split(".");
    let current = data;

    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) return;
      current = current[parts[i]];
    }

    delete current[parts[parts.length - 1]];
  }

  /**
   * Infer type from comparison
   */
  private inferTypeFromComparison(node: ComparisonNode): string {
    switch (node.operator) {
      case TokenType.GREATER_THAN:
      case TokenType.GREATER_EQUAL:
      case TokenType.LESS_THAN:
      case TokenType.LESS_EQUAL:
        return "number";

      case TokenType.MATCHES:
        return "string";

      default:
        return node.right.dataType;
    }
  }

  /**
   * Infer type from method
   */
  private inferTypeFromMethod(node: MethodCallNode): string {
    switch (node.method) {
      case TokenType.CONTAINS:
      case TokenType.STARTS_WITH:
      case TokenType.ENDS_WITH:
        return "string";

      case TokenType.BETWEEN:
        return "number";

      case TokenType.IN:
      case TokenType.NOT_IN:
        return node.arguments && node.arguments.length > 0
          ? node.arguments[0].dataType
          : "string";

      default:
        return "any";
    }
  }

  /**
   * Generate value for specific constraint
   */
  private generateValueForConstraint(constraint: any, type: string): any {
    // This would implement constraint-specific value generation
    return this.generateRandomValue(type, "");
  }

  /**
   * Calculate test coverage
   */
  private calculateCoverage(
    ast: ConditionalNode,
    testCases: GeneratedTestCase[]
  ): {
    totalPaths: number;
    coveredPaths: number;
    percentage: number;
  } {
    // This would implement path coverage analysis
    const totalPaths = this.countPaths(ast);
    const coveredPaths = testCases.filter((tc) => tc.shouldPass).length;

    return {
      totalPaths,
      coveredPaths,
      percentage: totalPaths > 0 ? (coveredPaths / totalPaths) * 100 : 0,
    };
  }

  /**
   * Count total paths in conditional
   */
  private countPaths(ast: ConditionalNode): number {
    // Simple implementation - count then/else branches
    let paths = 2; // then and else

    if (ASTAnalyzer.hasNestedConditionals(ast)) {
      paths *= 2; // Multiply for nested conditions
    }

    return paths;
  }
}
