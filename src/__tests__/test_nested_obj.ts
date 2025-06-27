// Fixed Enhanced test suite with proper validation and debugging

import { Interface } from "../core/schema/mode/interfaces/Interface";
import { NehoID as ID } from "nehoid";
import type {
  EnhancedValidationResult,
  TestConfiguration,
  ValidationMetrics,
} from "./types/nested_ob";

class FixedValidationTester {
  private testId: string;

  constructor() {
    this.testId = ID.generate({ prefix: "test" });
  }

  /**
   * Build a more realistic schema that works with your Interface implementation
   */
  private buildRealisticSchema(depth: number): any {
    // For very deep schemas, use a simpler structure
    if (depth > 100) {
      return this.buildSimpleDeepSchema(depth);
    }

    // For moderate depth, use detailed validation
    return this.buildDetailedSchema(depth);
  }

  private buildSimpleDeepSchema(depth: number): any {
    function buildLevel(currentDepth: number): any {
      if (currentDepth === depth) {
        return {
          treasure: "string",
          value: "any",
          timestamp: "string",
          id: "string",
          priority: "number(1,10)",
        };
      }

      // For ultra-deep schemas (>500), minimize metadata to reduce memory usage
      const levelSchema: any = {
        [`level${currentDepth}`]: buildLevel(currentDepth + 1),
      };

      // Only add metadata for shallow levels to optimize memory
      if (depth <= 500 || currentDepth <= 10) {
        levelSchema.metadata = "any?";
      }

      return levelSchema;
    }

    return {
      root: buildLevel(1),
      config: {
        maxDepth: "number",
        testId: "string",
        ultraDeep: depth > 500 ? "boolean?" : undefined,
      },
    };
  }

  private buildDetailedSchema(depth: number): any {
    function buildLevel(currentDepth: number): any {
      if (currentDepth === depth) {
        return {
          treasure: "string",
          value: "string|number|boolean",
          timestamp: "string", // Fixed: Changed from "date" to "string"
          id: "string",
          priority: "number(1,10)", // Added constraint
          tags: "string[]?",
          metadata: {
            created: "string", // Fixed: Changed from "date" to "string"
            version: "number",
          },
        };
      }

      const levelSchema: any = {
        [`level${currentDepth}`]: buildLevel(currentDepth + 1),
      };

      // Add metadata only for shallow levels to avoid performance issues
      if (currentDepth <= 10) {
        levelSchema.metadata = {
          id: "string?",
          created: "string?", // Fixed: Changed from "date" to "string"
          priority: "number(1,10)?", // Added constraint
          path: "string?",
          depth: "number?",
        };
      }

      return levelSchema;
    }

    return {
      root: buildLevel(1),
      config: {
        maxDepth: "number",
        testId: "string",
        enableOptimizations: "boolean?",
      },
      context: {
        environment: "string",
        timestamp: "string", // Fixed: Changed from "date" to "string"
        version: "string",
      },
    };
  }

  /**
   * Generate test data matching the schema - FIXED
   */
  private generateTestData(depth: number): any {
    const testData: any = {
      config: {
        maxDepth: depth,
        testId: this.testId,
        enableOptimizations: depth > 100,
      },
      context: {
        environment: "development",
        timestamp: new Date().toISOString(), // Fixed: Convert to string
        version: "1.0.0",
      },
    };

    function buildLevel(currentDepth: number): any {
      if (currentDepth === depth) {
        return {
          treasure: `Treasure found at depth ${depth}`,
          value:
            currentDepth % 3 === 0
              ? "string-value"
              : currentDepth % 3 === 1
                ? 42
                : true,
          timestamp: new Date().toISOString(),
          id: `id-${currentDepth}`,
          priority: Math.min(Math.max(1, (currentDepth % 10) + 1), 10),
          tags:
            depth <= 500 ? [`level-${currentDepth}`, "terminal"] : undefined, // Optimize for ultra-deep
          metadata:
            depth <= 500
              ? {
                  created: new Date().toISOString(),
                  version: 1,
                }
              : undefined, // Optimize for ultra-deep
        };
      }

      const levelData: any = {
        [`level${currentDepth}`]: buildLevel(currentDepth + 1),
      };

      // Only add metadata for shallow levels or non-ultra-deep schemas
      if (
        (depth <= 500 && currentDepth <= 10) ||
        (depth > 500 && currentDepth <= 5)
      ) {
        levelData.metadata = {
          id: `meta-${currentDepth}`,
          created: new Date().toISOString(),
          priority: Math.min(Math.max(1, currentDepth), 10),
          path: `root.level${currentDepth}`,
          depth: currentDepth,
        };
      }

      return levelData;
    }

    testData.root = buildLevel(1);
    return testData;
  }

  /**
   * Apply corruption with COMPLETELY FIXED targeting logic
   */
  private applyCorruption(
    data: any,
    corruptionType: string,
    depth: number,
    targetDepth: number | string
  ): {
    corruptedData: any;
    corruptionLocation: string;
    corruptionDetails: any;
  } {
    const corruptedData = JSON.parse(JSON.stringify(data));

    let actualTargetDepth: number;
    if (targetDepth === "last") {
      actualTargetDepth = depth;
    } else if (targetDepth === "random") {
      actualTargetDepth = Math.floor(Math.random() * Math.min(depth, 20)) + 1;
    } else {
      actualTargetDepth = Math.min(targetDepth as number, depth, 20);
    }

    const corruptionDetails = {
      type: corruptionType,
      appliedAt: new Date(),
      targetDepth: actualTargetDepth,
      modifications: [] as any[],
    };

    // COMPLETELY REWRITTEN navigation logic
    let current = corruptedData.root;
    let path = "root";
    let navigationSuccess = true;

    // Navigate through the nested levels to reach the target depth
    // IMPORTANT: The final properties are at level (depth-1), not level (depth)
    // For depth N, we navigate to level1.level2...level(N-1) to find the properties
    const targetLevel = actualTargetDepth - 1; // The actual level that contains the properties

    for (let i = 1; i <= targetLevel && current && navigationSuccess; i++) {
      const levelKey = `level${i}`;

      if (current[levelKey]) {
        current = current[levelKey];
        path += `.${levelKey}`;
      } else {
        navigationSuccess = false;
        break;
      }
    }

    if (!navigationSuccess || !current) {
      return {
        corruptedData,
        corruptionLocation: `${path} (navigation failed - could not reach depth ${actualTargetDepth})`,
        corruptionDetails,
      };
    }

    // Apply corruption based on type - COMPLETELY REWRITTEN
    const modification: any = {
      path,
      type: corruptionType,
      before: null,
      after: null,
    };

    // Debug: Log what we found at the target location
    // console.log(
    //   `   🔧 Corruption Debug: At ${path}, found properties:`,
    //   Object.keys(current)
    // );

    switch (corruptionType) {
      case "type-mismatch":
        // Try multiple properties to find a suitable target
        if (current.treasure !== undefined) {
          modification.before = current.treasure;
          current.treasure = 12345; // string → number
          modification.after = current.treasure;
          modification.property = "treasure";
          corruptionDetails.modifications.push(modification);
          // console.log(
          //   `   ✅ Applied type-mismatch corruption: ${path}.treasure (${typeof modification.before} → ${typeof modification.after})`
          // );
          return {
            corruptedData,
            corruptionLocation: `${path}.treasure (string → number)`,
            corruptionDetails,
          };
        } else if (current.priority !== undefined) {
          modification.before = current.priority;
          current.priority = "not-a-number"; // number → string
          modification.after = current.priority;
          modification.property = "priority";
          corruptionDetails.modifications.push(modification);
          console.log(
            `   ✅ Applied type-mismatch corruption: ${path}.priority (${typeof modification.before} → ${typeof modification.after})`
          );
          return {
            corruptedData,
            corruptionLocation: `${path}.priority (number → string)`,
            corruptionDetails,
          };
        } else if (current.value !== undefined) {
          modification.before = current.value;
          current.value = { invalid: "object" }; // should be string|number|boolean
          modification.after = current.value;
          modification.property = "value";
          corruptionDetails.modifications.push(modification);
          console.log(
            `   ✅ Applied type-mismatch corruption: ${path}.value (${typeof modification.before} → ${typeof modification.after})`
          );
          return {
            corruptedData,
            corruptionLocation: `${path}.value (valid type → object)`,
            corruptionDetails,
          };
        }
        break;

      case "missing-property":
        if (current.treasure !== undefined) {
          modification.before = current.treasure;
          delete current.treasure;
          modification.after = undefined;
          modification.property = "treasure";
          corruptionDetails.modifications.push(modification);
          console.log(
            `   ✅ Applied missing-property corruption: deleted ${path}.treasure`
          );
          return {
            corruptedData,
            corruptionLocation: `${path}.treasure (deleted)`,
            corruptionDetails,
          };
        } else if (current.priority !== undefined) {
          modification.before = current.priority;
          delete current.priority;
          modification.after = undefined;
          modification.property = "priority";
          corruptionDetails.modifications.push(modification);
          console.log(
            `   ✅ Applied missing-property corruption: deleted ${path}.priority`
          );
          return {
            corruptedData,
            corruptionLocation: `${path}.priority (deleted)`,
            corruptionDetails,
          };
        } else if (current.id !== undefined) {
          modification.before = current.id;
          delete current.id;
          modification.after = undefined;
          modification.property = "id";
          corruptionDetails.modifications.push(modification);
          console.log(
            `   ✅ Applied missing-property corruption: deleted ${path}.id`
          );
          return {
            corruptedData,
            corruptionLocation: `${path}.id (deleted)`,
            corruptionDetails,
          };
        }
        break;

      case "constraint-violation":
        if (current.priority !== undefined) {
          modification.before = current.priority;
          current.priority = -5; // violates number(1,10) constraint
          modification.after = current.priority;
          modification.property = "priority";
          corruptionDetails.modifications.push(modification);
          console.log(
            `   ✅ Applied constraint-violation corruption: ${path}.priority (${modification.before} → ${modification.after})`
          );
          return {
            corruptedData,
            corruptionLocation: `${path}.priority (constraint violation: -5 not in range 1-10)`,
            corruptionDetails,
          };
        }
        break;

      case "invalid-format":
        if (current.timestamp !== undefined) {
          modification.before = current.timestamp;
          current.timestamp = "invalid-date-format";
          modification.after = current.timestamp;
          modification.property = "timestamp";
          corruptionDetails.modifications.push(modification);
          console.log(
            `   ✅ Applied invalid-format corruption: ${path}.timestamp`
          );
          return {
            corruptedData,
            corruptionLocation: `${path}.timestamp (invalid format)`,
            corruptionDetails,
          };
        }
        break;
    }

    console.log(
      `   ❌ No suitable target found for ${corruptionType} at ${path}`
    );
    return {
      corruptedData,
      corruptionLocation: `${path} (no suitable target found for ${corruptionType})`,
      corruptionDetails,
    };
  }

  /**
   * Enhanced validation with proper metrics
   */
  async validateWithMetrics(
    schema: any,
    data: any,
    timeoutMs: number = 30000
  ): Promise<EnhancedValidationResult> {
    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Validation timeout after ${timeoutMs}ms`));
      }, timeoutMs);

      try {
        const testSchema = Interface(schema);
        const result = testSchema.safeParse(data);

        clearTimeout(timeoutId);

        const endTime = performance.now();
        const endMemory = this.getMemoryUsage();

        // Calculate actual depth reached by analyzing errors - FIXED
        const maxDepthReached = this.calculateActualDepthFromErrors(
          result.errors || [],
          schema
        );

        const metrics: ValidationMetrics = {
          duration: endTime - startTime,
          memoryUsed: Math.max(0, endMemory - startMemory),
          maxDepthReached,
          validationSteps: result.errors ? result.errors.length : 1,
          errorPathLength: result.errors ? result.errors.join("").length : 0,
          actualErrors: result.errors || [],
        };

        resolve({
          success: result.success,
          data: result.data,
          errors: result.errors,
          metrics,
        });
      } catch (error) {
        clearTimeout(timeoutId);

        const endTime = performance.now();
        const endMemory = this.getMemoryUsage();

        const metrics: ValidationMetrics = {
          duration: endTime - startTime,
          memoryUsed: Math.max(0, endMemory - startMemory),
          maxDepthReached: 0,
          validationSteps: 0,
          errorPathLength: 0,
          actualErrors: [error.message],
        };

        resolve({
          success: false,
          errors: [error.message],
          metrics,
        });
      }
    });
  }

  /**
   * Calculate actual depth reached from error messages - FIXED
   */
  private calculateActualDepthFromErrors(
    errors: string[],
    schema: any
  ): number {
    if (!errors.length) {
      // If no errors, try to calculate max depth from schema
      return this.calculateSchemaDepth(schema);
    }

    let maxDepth = 0;

    for (const error of errors) {
      // Count the number of nested levels in the error path
      // Look for patterns like "root: level1: level2: level3: ..."
      const levelMatches = error.match(/level\d+/g);
      if (levelMatches) {
        maxDepth = Math.max(maxDepth, levelMatches.length);
      }

      // Also check for direct path counting
      const pathParts = error.split(":").map((part) => part.trim());
      let currentDepth = 0;
      for (const part of pathParts) {
        if (part.startsWith("level")) {
          currentDepth++;
        }
      }
      maxDepth = Math.max(maxDepth, currentDepth);
    }

    return maxDepth;
  }

  /**
   * Calculate schema depth - NEW METHOD
   */
  private calculateSchemaDepth(schema: any, currentDepth: number = 0): number {
    if (!schema || typeof schema !== "object") {
      return currentDepth;
    }

    let maxDepth = currentDepth;

    for (const [key, value] of Object.entries(schema)) {
      if (key.startsWith("level") && typeof value === "object") {
        maxDepth = Math.max(
          maxDepth,
          this.calculateSchemaDepth(value, currentDepth + 1)
        );
      } else if (typeof value === "object" && value !== null) {
        maxDepth = Math.max(
          maxDepth,
          this.calculateSchemaDepth(value, currentDepth)
        );
      }
    }

    return maxDepth;
  }

  /**
   * Get memory usage (improved)
   */
  private getMemoryUsage(): number {
    if (typeof process !== "undefined" && process.memoryUsage) {
      return process.memoryUsage().heapUsed / 1024 / 1024;
    }

    // Fallback for browser environments
    if (typeof performance !== "undefined" && (performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024;
    }

    return 0;
  }

  /**
   * Run individual test with better analysis
   */
  async runTest(config: TestConfiguration): Promise<EnhancedValidationResult> {
    console.log(`\n🧪 Running: ${config.name}`);
    console.log(
      `   Depth: ${config.maxDepth}, Expected: ${config.expectedOutcome.toUpperCase()}`
    );

    try {
      // Build schema and data
      const schema = this.buildRealisticSchema(config.maxDepth);
      let testData = this.generateTestData(config.maxDepth);
      let corruptionDetails = null;

      // Apply corruption if specified
      if (config.corruptionType && config.corruptionDepth !== undefined) {
        const corruption = this.applyCorruption(
          testData,
          config.corruptionType,
          config.maxDepth,
          config.corruptionDepth
        );

        testData = corruption.corruptedData;
        corruptionDetails = corruption.corruptionDetails;

        console.log(
          `   🔬 Applied corruption: ${config.corruptionType} at ${corruption.corruptionLocation.substring(0, 50) + "..."}`
        );
      }

      // Debug: Log schema structure for first few tests
      if (config.maxDepth <= 5) {
        console.log(
          `   🔍 Schema structure preview:`,
          JSON.stringify(schema, null, 2).substring(0, 200) + "..."
        );
      }

      // Run validation
      const result = await this.validateWithMetrics(schema, testData);

      // Analyze results
      const analysis = this.analyzeResults(result, config, corruptionDetails);

      // Log results with better formatting
      this.logResults(result, analysis, config);

      return {
        ...result,
        integrityTest: analysis.integrityTest,
      };
    } catch (error) {
      console.log(`   💥 Test failed with error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Analyze results with improved logic
   */
  private analyzeResults(
    result: EnhancedValidationResult,
    config: TestConfiguration,
    corruptionDetails: any
  ): any {
    const analysis: any = {
      performanceScore: this.calculatePerformanceScore(result.metrics, config),
      integrityTest: null,
    };

    if (corruptionDetails) {
      const expectedToFail = config.expectedOutcome === "fail";
      const actuallyFailed = !result.success;
      const validationReachedTarget = this.checkValidationReach(
        result,
        corruptionDetails
      );
      const errorAccuracy = this.calculateErrorAccuracy(
        result,
        corruptionDetails
      );

      analysis.integrityTest = {
        corruptionApplied: true,
        corruptionLocation: corruptionDetails.modifications
          .map((m: any) => `${m.path}.${m.property || "unknown"}`)
          .join(", "),
        expectedToFail,
        actuallyFailed,
        validationReachedTarget,
        errorAccuracy,
      };
    }

    return analysis;
  }

  private calculatePerformanceScore(
    metrics: ValidationMetrics,
    config: TestConfiguration
  ): number {
    const durationScore = Math.max(
      0,
      100 - (metrics.duration / config.performanceThreshold) * 100
    );
    const memoryScore = Math.max(
      0,
      100 - (metrics.memoryUsed / config.memoryThreshold) * 100
    );
    return Math.round((durationScore + memoryScore) / 2);
  }

  private checkValidationReach(
    result: EnhancedValidationResult,
    corruptionDetails: any
  ): boolean {
    if (!result.errors || !corruptionDetails.modifications) return false;

    const errorText = result.errors.join(" ").toLowerCase();
    return corruptionDetails.modifications.some((mod: any) => {
      const pathParts = mod.path.split(".");
      const propertyName = mod.property;
      return (
        pathParts.some((part: string) =>
          errorText.includes(part.toLowerCase())
        ) ||
        (propertyName && errorText.includes(propertyName.toLowerCase()))
      );
    });
  }

  private calculateErrorAccuracy(
    result: EnhancedValidationResult,
    corruptionDetails: any
  ): number {
    if (!result.errors || !corruptionDetails.modifications) return 0;

    let accuracyScore = 0;
    const totalModifications = corruptionDetails.modifications.length;

    for (const mod of corruptionDetails.modifications) {
      const errorText = result.errors.join(" ").toLowerCase();
      const propertyName = mod.property?.toLowerCase() || "";
      const pathParts = mod.path.toLowerCase().split(".");

      // Check if error mentions the corrupted property
      if (propertyName && errorText.includes(propertyName)) {
        accuracyScore += 0.4;
      }

      // Check if error mentions the path
      if (pathParts.some((part) => errorText.includes(part))) {
        accuracyScore += 0.3;
      }

      // Check for type-specific error messages
      if (mod.type === "type-mismatch" && errorText.includes("expected")) {
        accuracyScore += 0.2;
      }

      // Check if error mentions the corrupted value
      if (mod.after && errorText.includes(String(mod.after).toLowerCase())) {
        accuracyScore += 0.1;
      }
    }

    return Math.min(1, accuracyScore / totalModifications);
  }

  /**
   * Improved logging with better error display
   */
  private logResults(
    result: EnhancedValidationResult,
    analysis: any,
    config: TestConfiguration
  ): void {
    const status = result.success ? "✅ PASSED" : "❌ FAILED";
    const expected = config.expectedOutcome === "pass" ? "✅ PASS" : "❌ FAIL";
    const correct =
      (result.success && config.expectedOutcome === "pass") ||
      (!result.success && config.expectedOutcome === "fail");

    console.log(
      `   Result: ${status} (Expected: ${expected}) ${correct ? "✅" : "⚠️"}`
    );
    console.log(`   Duration: ${result.metrics.duration.toFixed(2)}ms`);
    console.log(`   Memory: ${result.metrics.memoryUsed.toFixed(2)}MB`);
    console.log(`   Max Depth Reached: ${result.metrics.maxDepthReached}`);
    console.log(`   Error Count: ${result.metrics.actualErrors.length}`);
    console.log(`   Performance Score: ${analysis.performanceScore}/100`);

    if (analysis.integrityTest) {
      const integrity = analysis.integrityTest;
      console.log(
        `   Integrity: ${integrity.validationReachedTarget ? "✅" : "⚠️"} (Accuracy: ${(integrity.errorAccuracy * 100).toFixed(1)}%)`
      );
    }

    // Show first few errors in a more readable format
    if (result.errors && result.errors.length > 0) {
      console.log(`   Sample Errors:`);
      result.errors.slice(0, 2).forEach((error, i) => {
        // Format the error path more readably
        const formattedError = error.replace(/: /g, " → ");
        console.log(
          `     ${i + 1}. ${formattedError.substring(0, 100)}${formattedError.length > 100 ? "..." : ""}`
        );
      });
      if (result.errors.length > 2) {
        console.log(`     ... and ${result.errors.length - 2} more errors`);
      }
    }
  }

  /**
   * Run comprehensive test suite
   */
  async runTestSuite(): Promise<void> {
    console.log("🚀 Fixed Deep Validation Test Suite");
    console.log("====================================\n");

    const testConfigurations: TestConfiguration[] = [
      {
        name: "Shallow Validation Baseline",
        maxDepth: 5,
        expectedOutcome: "pass",
        performanceThreshold: 50,
        memoryThreshold: 10,
      },
      {
        name: "Medium Depth Validation",
        maxDepth: 15,
        expectedOutcome: "pass",
        performanceThreshold: 100,
        memoryThreshold: 20,
      },
      {
        name: "Type Mismatch at Final Level",
        maxDepth: 10,
        corruptionType: "type-mismatch",
        corruptionDepth: "last", // Target the final level where properties exist
        expectedOutcome: "fail",
        performanceThreshold: 150,
        memoryThreshold: 25,
      },
      {
        name: "Missing Property Detection",
        maxDepth: 12,
        corruptionType: "missing-property",
        corruptionDepth: "last", // Target the final level where properties exist
        expectedOutcome: "fail",
        performanceThreshold: 200,
        memoryThreshold: 30,
      },
      {
        name: "Constraint Violation Test",
        maxDepth: 8,
        corruptionType: "constraint-violation",
        corruptionDepth: "last", // Target the final level where properties exist
        expectedOutcome: "fail",
        performanceThreshold: 150,
        memoryThreshold: 25,
      },
      {
        name: "Deep Validation Test",
        maxDepth: 25,
        expectedOutcome: "pass",
        performanceThreshold: 300,
        memoryThreshold: 50,
      },
      {
        name: "Extreme Depth Test",
        maxDepth: 50,
        expectedOutcome: "pass",
        performanceThreshold: 1000,
        memoryThreshold: 100,
      },
      {
        name: "🚀 ULTIMATE POWER TEST - 1000 DEPTH",
        maxDepth: 1000,
        expectedOutcome: "pass",
        performanceThreshold: 10000, // 10 seconds max
        memoryThreshold: 500, // 500MB max
      },
      {
        name: "🔥 CORRUPTION AT 1000 DEPTH",
        maxDepth: 1000,
        corruptionType: "type-mismatch",
        corruptionDepth: "last",
        expectedOutcome: "fail",
        performanceThreshold: 10000, // 10 seconds max
        memoryThreshold: 500, // 500MB max
      },
    ];

    const results: EnhancedValidationResult[] = [];
    let passCount = 0;
    let failCount = 0;
    let correctPredictions = 0;

    for (const config of testConfigurations) {
      try {
        const result = await this.runTest(config);
        results.push(result);

        if (result.success) passCount++;
        else failCount++;

        const expectedPass = config.expectedOutcome === "pass";
        if (
          (result.success && expectedPass) ||
          (!result.success && !expectedPass)
        ) {
          correctPredictions++;
        }
      } catch (error) {
        console.log(`   💥 Test crashed: ${error.message}`);
        failCount++;
      }
    }

    this.printSummary(
      testConfigurations,
      results,
      passCount,
      failCount,
      correctPredictions
    );
  }

  private printSummary(
    configs: TestConfiguration[],
    results: EnhancedValidationResult[],
    passCount: number,
    failCount: number,
    correctPredictions: number
  ): void {
    console.log("\n📊 Test Suite Summary");
    console.log("=====================");
    console.log(`Total Tests: ${configs.length}`);
    console.log(`Passed: ${passCount}`);
    console.log(`Failed: ${failCount}`);
    console.log(
      `Prediction Accuracy: ${correctPredictions}/${configs.length} (${((correctPredictions / configs.length) * 100).toFixed(1)}%)`
    );

    if (results.length > 0) {
      const avgDuration =
        results.reduce((sum, r) => sum + r.metrics.duration, 0) /
        results.length;
      const avgMemory =
        results.reduce((sum, r) => sum + r.metrics.memoryUsed, 0) /
        results.length;
      const maxDepthTested = Math.max(
        ...results.map((r) => r.metrics.maxDepthReached)
      );

      console.log(`Average Duration: ${avgDuration.toFixed(2)}ms`);
      console.log(`Average Memory: ${avgMemory.toFixed(2)}MB`);
      console.log(`Maximum Depth Validated: ${maxDepthTested}`);

      // Enhanced analysis
      const depthDistribution = results.reduce(
        (acc, r) => {
          const depth = r.metrics.maxDepthReached;
          acc[depth] = (acc[depth] || 0) + 1;
          return acc;
        },
        {} as Record<number, number>
      );

      console.log(`\n📈 Depth Distribution:`, depthDistribution);
    }

    console.log("\n🎯 Analysis Complete!");

    // Enhanced recommendations
    console.log("\n💡 Recommendations:");

    const zeroDepthResults = results.filter(
      (r) => r.metrics.maxDepthReached === 0
    );
    if (zeroDepthResults.length > 0) {
      console.log(
        `   ⚠️  ${zeroDepthResults.length} tests show depth 0 - check Interface nested object handling`
      );
    }

    const slowResults = results.filter((r) => r.metrics.duration > 500);
    if (slowResults.length > 0) {
      console.log(
        `   ⚠️  ${slowResults.length} tests are slow (>500ms) - consider optimizing deep validation`
      );
    }

    const earlyFailures = results.filter(
      (r) => !r.success && r.metrics.maxDepthReached < 5
    );
    if (earlyFailures.length > 0) {
      console.log(
        `   ⚠️  ${earlyFailures.length} tests fail early (<5 depth) - check schema definitions`
      );
    }

    const maxDepthReached = Math.max(
      ...results.map((r) => r.metrics.maxDepthReached)
    );
    if (maxDepthReached > 0) {
      console.log(
        `   ✅ Validation successfully reaches depth ${maxDepthReached}`
      );
    }
  }
}

// Export for use
export { FixedValidationTester, EnhancedValidationResult, TestConfiguration };

// Usage
async function runFixedTests() {
  const tester = new FixedValidationTester();
  await tester.runTestSuite();
}

// Run the fixed tests
runFixedTests().catch(console.error);
