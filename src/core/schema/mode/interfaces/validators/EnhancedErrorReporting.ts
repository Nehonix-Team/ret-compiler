/**
 * Enhanced Error Reporting System
 * 
 * This enhancement provides more detailed error messages for complex conditional validations
 */

export interface ConditionalValidationError {
  field: string;
  expected: string;
  received: any;
  receivedType: string;
  condition: string;
  conditionMet: boolean;
  runtimePropertyExists: boolean;
  runtimePropertyPath: string;
  suggestion: string;
}

export class EnhancedSchemaValidator {
  
  static generateDetailedError(
    field: string,
    conditionalRule: string,
    input: any,
    runtimeData: any
  ): ConditionalValidationError {
    
    // Parse the conditional rule
    const ruleMatch = conditionalRule.match(/when\s+(.+?)\.\$exists\(\)\s+\*\?\s+(\w+(?:\[\])?)\s+:\s+=(.+)/);
    
    if (!ruleMatch) {
      throw new Error(`Invalid conditional rule format: ${conditionalRule}`);
    }
    
    const [, runtimePath, expectedType, defaultValue] = ruleMatch;
    const receivedValue = input[field];
    const runtimeExists = this.checkRuntimePath(runtimeData, runtimePath);
    
    return {
      field,
      expected: expectedType,
      received: receivedValue,
      receivedType: typeof receivedValue,
      condition: `${runtimePath}.$exists()`,
      conditionMet: runtimeExists,
      runtimePropertyExists: runtimeExists,
      runtimePropertyPath: runtimePath,
      suggestion: this.generateSuggestion(field, expectedType, receivedValue, runtimeExists, defaultValue)
    };
  }
  
  private static checkRuntimePath(obj: any, path: string): boolean {
    const parts = path.split('.');
    let current = obj;
    
    for (const part of parts) {
      if (current == null || typeof current !== 'object' || !(part in current)) {
        return false;
      }
      current = current[part];
    }
    
    return current !== undefined && current !== null;
  }
  
  private static generateSuggestion(
    field: string,
    expectedType: string,
    receivedValue: any,
    runtimeExists: boolean,
    defaultValue: string
  ): string {
    if (!runtimeExists) {
      return `Since the runtime condition is not met, this field will use the default value: ${defaultValue}. You can omit this field from your input.`;
    }
    
    if (typeof receivedValue !== expectedType.replace('[]', '')) {
      return `Convert '${receivedValue}' to ${expectedType}. Expected: ${this.getTypeExample(expectedType)}`;
    }
    
    return "Value is valid";
  }
  
  private static getTypeExample(type: string): string {
    const examples: Record<string, string> = {
      'boolean': 'true or false',
      'string': '"example string"',
      'number': '42 or 3.14',
      'int': '42',
      'object': '{ key: "value" }',
      'array': '["item1", "item2"]',
      'string[]': '["item1", "item2"]',
      'number[]': '[1, 2, 3]',
      'boolean[]': '[true, false]'
    };
    
    return examples[type] || `a ${type}`;
  }
  
  static formatDetailedError(error: ConditionalValidationError): string {
    const { field, expected, received, receivedType, condition, conditionMet, suggestion } = error;
    
    return [
      `❌ Validation Error for field '${field}':`,
      `   Expected: ${expected}`,
      `   Received: ${JSON.stringify(received)} (${receivedType})`,
      `   Conditional Rule: when ${condition} → validate as ${expected}`,
      `   Runtime Condition Met: ${conditionMet ? '✅' : '❌'}`,
      `   💡 Suggestion: ${suggestion}`,
      ``
    ].join('\n');
  }
}

// Example usage in your test framework
export class TestResultAnalyzer {
  
  static analyzeConditionalValidation(
    testCase: any,
    validationResult: any,
    schema: any
  ): void {
    console.log(`\n🔍 DETAILED CONDITIONAL ANALYSIS for ${testCase.name}:`);
    
    // Extract conditional fields from schema definition
    const conditionalFields = this.extractConditionalFieldsFromSchema(schema);
    
    conditionalFields.forEach(fieldInfo => {
      const { fieldName, rule } = fieldInfo;
      const inputValue = testCase.input[fieldName];
      const outputValue = validationResult.data?.[fieldName];
      const runtimeExists = this.checkRuntimeCondition(fieldInfo.runtimePath, testCase.input);
      
      console.log(`\n  📊 Field: ${fieldName}`);
      console.log(`     Rule: ${rule}`);
      console.log(`     Runtime Condition (${fieldInfo.runtimePath}): ${runtimeExists ? '✅ EXISTS' : '❌ MISSING'}`);
      
      if (runtimeExists) {
        // Should validate user input
        const typeValid = typeof inputValue === fieldInfo.expectedType;
        console.log(`     Input Validation: ${typeValid ? '✅' : '❌'} (${typeof inputValue} vs ${fieldInfo.expectedType})`);
        console.log(`     Value: ${JSON.stringify(inputValue)} → ${JSON.stringify(outputValue)}`);
        console.log(`     Preserved: ${inputValue === outputValue ? '✅' : '❌'}`);
      } else {
        // Should use default
        const usedDefault = outputValue === fieldInfo.defaultValue;
        console.log(`     Default Applied: ${usedDefault ? '✅' : '❌'}`);
        console.log(`     Expected Default: ${JSON.stringify(fieldInfo.defaultValue)}`);
        console.log(`     Actual Output: ${JSON.stringify(outputValue)}`);
        console.log(`     User Input Ignored: ${inputValue !== outputValue ? '✅' : '❌'}`);
      }
    });
  }
  
  private static extractConditionalFieldsFromSchema(schema: any): Array<{
    fieldName: string;
    rule: string;
    runtimePath: string;
    expectedType: string;
    defaultValue: any;
  }> {
    // This would parse your schema definition to extract conditional field info
    // Implementation depends on your schema structure
    return [];
  }
  
  private static checkRuntimeCondition(path: string, input: any): boolean {
    const parts = path.split('.');
    let current = input;
    
    for (const part of parts) {
      if (current == null || typeof current !== 'object' || !(part in current)) {
        return false;
      }
      current = current[part];
    }
    
    return current !== undefined && current !== null;
  }
}

// Performance monitoring enhancement
export class PerformanceProfiler {
  
  static profileConditionalValidation(testCase: any, schema: any): {
    totalTime: number;
    conditionCheckTime: number;
    validationTime: number;
    breakdown: Array<{ field: string; time: number; }>;
  } {
    const start = performance.now();
    
    // Simulate detailed timing
    const conditionStart = performance.now();
    // ... condition checking logic
    const conditionEnd = performance.now();
    
    const validationStart = performance.now();
    const result = schema.safeParse(testCase.input);
    const validationEnd = performance.now();
    
    const end = performance.now();
    
    return {
      totalTime: end - start,
      conditionCheckTime: conditionEnd - conditionStart,
      validationTime: validationEnd - validationStart,
      breakdown: [] // Field-by-field timing
    };
  }
  
  static reportPerformanceBottlenecks(profiles: any[]): void {
    console.log('\n⚡ PERFORMANCE ANALYSIS:');
    
    const avgTime = profiles.reduce((sum, p) => sum + p.totalTime, 0) / profiles.length;
    const slowest = profiles.reduce((max, p) => p.totalTime > max.totalTime ? p : max);
    
    console.log(`   Average Execution Time: ${avgTime.toFixed(2)}ms`);
    console.log(`   Slowest Test: ${slowest.totalTime.toFixed(2)}ms`);
    
    if (avgTime > 5) {
      console.log('   ⚠️  Consider optimizing for better performance');
    } else if (avgTime < 1) {
      console.log('   🚀 Excellent performance!');
    }
  }
}
