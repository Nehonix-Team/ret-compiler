import { Interface } from "../core/schema/mode/interfaces/Interface";

console.log("🔥 ADVANCED CONDITIONAL LOGIC STRESS TEST");
console.log("Real-world enterprise scenarios - Time to break things!");
console.log("=" + "=".repeat(80));

// SCENARIO 1: Multi-tenant SaaS Platform Schema
const SaaSPlatformSchema = Interface({
  // Core required fields
  tenantId: "string",
  userId: "string",

  // Complex nested conditional logic
  billingEnabled: "when subscription.$exists() *? boolean : =false",
  canCreateTeams: "when organization.$exists() *? boolean : =false",
  maxApiCalls: "when rateLimits.$exists() *? int : =1000",

  // Deeply nested conditions
  ssoEnabled: "when enterprise.sso.$exists() *? boolean : =false",
  auditLogging: "when compliance.requirements.$exists() *? boolean : =false",

  // Multiple field dependencies (this might break!)
  canAccessAnalytics: "when subscription.$exists() *? boolean : =false",
  analyticsRetention: "when analytics.config.$exists() *? int : =30",

  // Edge case: String with special characters as default
  customDomain: "when branding.$exists() *? string : =tenant.default.com",

  // Large number as default
  storageQuota: "when limits.storage.$exists() *? int : =107374182400",
}).allowUnknown();

// SCENARIO 2: E-commerce Platform Schema
const EcommercePlatformSchema = Interface({
  storeId: "string",
  merchantId: "string",

  // Financial conditionals (critical!)
  canProcessPayments: "when paymentGateway.$exists() *? boolean : =false",
  paymentFeesRate: "when merchantAccount.fees.$exists() *? number : =0.029",

  // Inventory management conditionals
  inventoryTracking: "when warehouse.$exists() *? boolean : =false",
  lowStockThreshold: "when inventory.alerts.$exists() *? int : =10",

  // Shipping conditionals
  freeShippingEnabled: "when shipping.policies.$exists() *? boolean : =false",
  freeShippingMinimum: "when shipping.thresholds.$exists() *? number : =50.00",

  // Multi-currency (potential float precision issues)
  supportedCurrencies: "when internationalization.$exists() *? array : =["USD"]",
  defaultCurrency: "when currencies.primary.$exists() *? string : =USD",
}).allowUnknown();

// SCENARIO 3: Healthcare Platform Schema (Compliance Critical)
const HealthcarePlatformSchema = Interface({
  providerId: "string",
  patientId: "string",

  // HIPAA compliance conditionals
  hipaaCompliant: "when compliance.hipaa.$exists() *? boolean : =true",
  auditTrailEnabled: "when security.audit.$exists() *? boolean : =true",

  // Data retention (legal requirements)
  dataRetentionYears: "when regulations.retention.$exists() *? int : =7",
  anonymizeAfterYears: "when privacy.anonymization.$exists() *? int : =10",

  // Access control
  requireMFA: "when security.mfa.$exists() *? boolean : =true",
  sessionTimeoutMinutes: "when security.sessions.$exists() *? int : =15",
}).allowUnknown();

const stressTestCases = [
  {
    name: "🏢 SaaS Platform - Enterprise Customer",
    description: "Large enterprise with all premium features enabled",
    schema: SaaSPlatformSchema,
    input: {
      tenantId: "enterprise-corp-2024",
      userId: "admin@enterprise.com",

      // All runtime properties exist
      subscription: { tier: "enterprise", features: ["analytics", "sso"] },
      organization: { type: "enterprise", members: 5000 },
      rateLimits: { tier: "premium", customLimits: true },
      enterprise: { sso: { provider: "okta", enabled: true } },
      compliance: { requirements: ["sox", "gdpr", "hipaa"] },
      analytics: { config: { retention: 365, advanced: true } },
      branding: { customDomain: "api.enterprise.com", logos: [] },
      limits: { storage: { quota: 1099511627776, used: 50000000 } },

      // User provides all conditional fields
      billingEnabled: true,
      canCreateTeams: true,
      maxApiCalls: 1000000,
      ssoEnabled: true,
      auditLogging: true,
      canAccessAnalytics: true,
      analyticsRetention: 365,
      customDomain: "api.enterprise.com",
      storageQuota: 1099511627776,
    },
    expectedComplexity:
      "All conditionals should validate against runtime properties",
  },

  {
    name: "🆓 SaaS Platform - Free Tier User",
    description: "Startup on free tier with minimal features",
    schema: SaaSPlatformSchema,
    input: {
      tenantId: "startup-xyz",
      userId: "founder@startup.xyz",

      // NO runtime properties exist
      // User still provides conditional fields (should be ignored!)
      billingEnabled: true, // Should become false
      canCreateTeams: true, // Should become false
      maxApiCalls: 50000, // Should become 1000
      ssoEnabled: true, // Should become false
      auditLogging: true, // Should become false
      canAccessAnalytics: true, // Should become false
      analyticsRetention: 90, // Should become 30
      customDomain: "api.startup.xyz", // Should become "tenant.default.com"
      storageQuota: 10737418240, // Should become 107374182400
    },
    expectedComplexity: "All user inputs should be ignored, defaults used",
  },

  {
    name: "⚡ SaaS Platform - Partial Configuration",
    description: "Mixed scenario - some runtime properties exist, others don't",
    schema: SaaSPlatformSchema,
    input: {
      tenantId: "growth-company",
      userId: "ops@growth.co",

      // SOME runtime properties exist
      subscription: { tier: "pro" },
      rateLimits: { tier: "pro" },
      analytics: { config: { basic: true } },
      // Missing: organization, enterprise, compliance, branding, limits

      // User provides ALL conditional fields
      billingEnabled: true, // subscription exists → validate
      canCreateTeams: false, // organization missing → use default false
      maxApiCalls: 10000, // rateLimits exist → validate
      ssoEnabled: true, // enterprise missing → use default false
      auditLogging: false, // compliance missing → use default false
      canAccessAnalytics: true, // subscription exists → validate
      analyticsRetention: 90, // analytics exists → validate
      customDomain: "api.growth.co", // branding missing → use default
      storageQuota: 53687091200, // limits missing → use default
    },
    expectedComplexity:
      "Mixed validation - some fields validated, others defaulted",
  },

  {
    name: "💰 E-commerce - Multi-Currency Nightmare",
    description: "International store with complex payment setup",
    schema: EcommercePlatformSchema,
    input: {
      storeId: "global-electronics",
      merchantId: "merchant-789",

      // Complex nested runtime properties
      paymentGateway: {
        providers: ["stripe", "paypal", "klarna"],
        regions: ["US", "EU", "APAC"],
      },
      merchantAccount: {
        fees: {
          card: 0.029,
          international: 0.039,
          currency_conversion: 0.01,
        },
      },
      warehouse: { locations: ["US-WEST", "EU-CENTRAL", "APAC-SINGAPORE"] },
      inventory: {
        alerts: {
          low_stock: true,
          out_of_stock: true,
          threshold_overrides: {},
        },
      },
      shipping: {
        policies: { free_shipping: true, expedited: true },
        thresholds: { free: 75.0, expedited: 25.0 },
      },
      internationalization: {
        enabled: true,
        currencies: ["USD", "EUR", "GBP", "JPY", "AUD"],
      },
      currencies: {
        primary: "USD",
        secondary: ["EUR", "GBP"],
        crypto_enabled: false,
      },

      // Potential floating point precision issues
      paymentFeesRate: 0.029, // Should validate
      freeShippingMinimum: 75.0, // Should validate

      // Complex defaults
      supportedCurrencies: ["USD", "EUR", "GBP", "JPY", "AUD"],
    },
    expectedComplexity:
      "Floating point numbers, arrays, complex nested runtime checks",
  },

  {
    name: "🏥 Healthcare - HIPAA Compliance Stress Test",
    description:
      "Critical healthcare system with strict compliance requirements",
    schema: HealthcarePlatformSchema,
    input: {
      providerId: "hospital-system-001",
      patientId: "patient-encrypted-id",

      // All compliance runtime properties
      compliance: {
        hipaa: {
          enabled: true,
          baa_signed: true,
          risk_assessment_complete: true,
        },
      },
      security: {
        audit: {
          enabled: true,
          realtime: true,
          retention_years: 10,
        },
        mfa: {
          required: true,
          methods: ["sms", "app", "hardware_key"],
        },
        sessions: {
          timeout_minutes: 15,
          concurrent_limit: 1,
          ip_whitelist_required: true,
        },
      },
      regulations: {
        retention: {
          patient_records: 7,
          audit_logs: 10,
          backups: 25,
        },
      },
      privacy: {
        anonymization: {
          after_years: 10,
          method: "k_anonymity",
          k_value: 5,
        },
      },

      // Critical: These should ALL validate since runtime properties exist
      hipaaCompliant: true,
      auditTrailEnabled: true,
      dataRetentionYears: 7,
      anonymizeAfterYears: 10,
      requireMFA: true,
      sessionTimeoutMinutes: 15,
    },
    expectedComplexity:
      "Mission-critical validation - any errors could mean compliance violations",
  },

  {
    name: "🎭 Type Chaos - Wrong Types Everywhere",
    description:
      "User provides completely wrong types when runtime properties exist",
    schema: SaaSPlatformSchema,
    input: {
      tenantId: "chaos-test",
      userId: "chaos@test.com",

      // ALL runtime properties exist
      subscription: { tier: "pro" },
      organization: { type: "startup" },
      rateLimits: { tier: "pro" },
      enterprise: { sso: { enabled: false } },
      compliance: { requirements: [] },
      analytics: { config: {} },
      branding: { enabled: true },
      limits: { storage: { quota: 1000000 } },

      // ALL WRONG TYPES (should all fail!)
      billingEnabled: "yes please", // string instead of boolean
      canCreateTeams: 1, // number instead of boolean
      maxApiCalls: "unlimited", // string instead of int
      ssoEnabled: [], // array instead of boolean
      auditLogging: { enabled: true }, // object instead of boolean
      canAccessAnalytics: null, // null instead of boolean
      analyticsRetention: "3 months", // string instead of int
      customDomain: 12345, // number instead of string
      storageQuota: "1TB", // string instead of int
    },
    expectedComplexity:
      "Should fail with clear error messages for each type mismatch",
  },

  {
    name: "🕳️ Edge Case - Undefined vs Null vs Empty",
    description: "Testing edge cases with different 'empty' values",
    schema: EcommercePlatformSchema,
    input: {
      storeId: "edge-case-store",
      merchantId: "edge-merchant",

      // Runtime properties with edge case values
      paymentGateway: null, // null - does this count as existing?
      merchantAccount: undefined, // undefined - definitely doesn't exist
      warehouse: {}, // empty object - does this exist?
      inventory: { alerts: null }, // nested null
      shipping: { policies: undefined }, // nested undefined

      // Conditional fields provided
      canProcessPayments: true,
      paymentFeesRate: 0.025,
      inventoryTracking: true,
      lowStockThreshold: 5,
      freeShippingEnabled: true,
    },
    expectedComplexity:
      "How does the system handle null, undefined, and empty objects?",
  },

  {
    name: "🌊 Deep Nesting Nightmare",
    description: "Extremely deep nested runtime property checks",
    schema: Interface({
      id: "string",
      // Super deep nesting conditional
      featureEnabled:
        "when config.features.advanced.analytics.realtime.enabled.$exists() *? boolean : =false",
      maxDepthLevel:
        "when system.limits.nesting.max.depth.override.$exists() *? int : =10",
    }).allowUnknown(),
    input: {
      id: "deep-test",

      // Deep nested structure
      config: {
        features: {
          advanced: {
            analytics: {
              realtime: {
                enabled: true,
                frequency: "1s",
              },
            },
          },
        },
      },
      system: {
        limits: {
          nesting: {
            max: {
              depth: {
                override: 50,
              },
            },
          },
        },
      },

      featureEnabled: true,
      maxDepthLevel: 50,
    },
    expectedComplexity:
      "Can the system handle deeply nested property existence checks?",
  },
];

// Run all stress tests
stressTestCases.forEach((testCase, index) => {
  console.log(`\n${"🔥".repeat(30)}`);
  console.log(`STRESS TEST ${index + 1}: ${testCase.name}`);
  console.log(`Description: ${testCase.description}`);
  console.log(`Expected Complexity: ${testCase.expectedComplexity}`);
  console.log(`${"🔥".repeat(30)}`);

  console.log("\n📥 INPUT PAYLOAD:");
  console.log(JSON.stringify(testCase.input, null, 2));

  console.log("\n⚡ EXECUTION RESULT:");

  try {
    const startTime = performance.now();
    const result = testCase.schema.safeParse(testCase.input);
    const endTime = performance.now();
    const executionTime = (endTime - startTime).toFixed(2);

    console.log(`⏱️  Execution Time: ${executionTime}ms`);

    if (result.success) {
      console.log("✅ VALIDATION: SUCCESS");
      console.log("\n📤 VALIDATED OUTPUT:");
      console.log(JSON.stringify(result.data, null, 2));

      // Advanced analysis for successful validations
      console.log("\n🧠 ADVANCED ANALYSIS:");
      analyzeComplexValidation(testCase, result.data);
    } else {
      console.log("❌ VALIDATION: FAILED");
      console.log("\n🚨 DETAILED ERRORS:");
      if (result.errors && Array.isArray(result.errors)) {
        result.errors.forEach((error, idx) => {
          console.log(`  ${idx + 1}. ${error}`);
        });
      } else {
        console.log("  Error format unexpected:", result.errors);
      }

      // Analyze what should have happened
      console.log("\n🤔 FAILURE ANALYSIS:");
      analyzeValidationFailure(testCase);
    }
  } catch (error) {
    console.log("💥 CATASTROPHIC FAILURE:");
    console.log(`  ${error.message}`);
    console.log(`  Stack: ${error.stack}`);
  }
});

// Advanced analysis functions
function analyzeComplexValidation(testCase: any, output: any) {
  const conditionalFields = extractConditionalFields(testCase.schema);

  conditionalFields.forEach((field) => {
    const inputValue = testCase.input[field];
    const outputValue = output[field];
    const runtimeExists = checkComplexRuntimeProperty(field, testCase.input);

    console.log(`\n  📊 ${field}:`);
    console.log(`    Runtime Property Exists: ${runtimeExists}`);
    console.log(
      `    Input: ${JSON.stringify(inputValue)} (${typeof inputValue})`
    );
    console.log(
      `    Output: ${JSON.stringify(outputValue)} (${typeof outputValue})`
    );

    if (runtimeExists) {
      const typeMatch = typeof inputValue === getExpectedType(field);
      console.log(`    Type Valid: ${typeMatch ? "✅" : "❌"}`);
      console.log(
        `    Value Preserved: ${inputValue === outputValue ? "✅" : "❌"}`
      );
    } else {
      const isDefault = outputValue === getDefaultValue(field);
      console.log(`    Used Default: ${isDefault ? "✅" : "❌"}`);
      console.log(
        `    Ignored User Input: ${inputValue !== outputValue ? "✅" : "❌"}`
      );
    }
  });
}

function analyzeValidationFailure(testCase: any) {
  console.log("  Analysis of what went wrong...");
  // This would contain detailed failure analysis logic
}

function extractConditionalFields(schema: any): string[] {
  // This would extract conditional field names from schema
  // Simplified for demo
  return [];
}

function checkComplexRuntimeProperty(field: string, input: any): boolean {
  // Complex logic to check nested runtime properties
  const runtimeMap: { [key: string]: string } = {
    billingEnabled: "subscription",
    canCreateTeams: "organization",
    maxApiCalls: "rateLimits",
    ssoEnabled: "enterprise.sso",
    auditLogging: "compliance.requirements",
    canAccessAnalytics: "subscription",
    analyticsRetention: "analytics.config",
    customDomain: "branding",
    storageQuota: "limits.storage",
    canProcessPayments: "paymentGateway",
    paymentFeesRate: "merchantAccount.fees",
    inventoryTracking: "warehouse",
    lowStockThreshold: "inventory.alerts",
    freeShippingEnabled: "shipping.policies",
    freeShippingMinimum: "shipping.thresholds",
    supportedCurrencies: "internationalization",
    defaultCurrency: "currencies.primary",
    hipaaCompliant: "compliance.hipaa",
    auditTrailEnabled: "security.audit",
    dataRetentionYears: "regulations.retention",
    anonymizeAfterYears: "privacy.anonymization",
    requireMFA: "security.mfa",
    sessionTimeoutMinutes: "security.sessions",
    featureEnabled: "config.features.advanced.analytics.realtime.enabled",
    maxDepthLevel: "system.limits.nesting.max.depth.override",
  };

  const path = runtimeMap[field];
  if (!path) return false;

  return checkNestedPath(input, path);
}

function checkNestedPath(obj: any, path: string): boolean {
  const parts = path.split(".");
  let current = obj;

  for (const part of parts) {
    if (current == null || typeof current !== "object" || !(part in current)) {
      return false;
    }
    current = current[part];
  }

  return current !== undefined && current !== null;
}

function getExpectedType(field: string): string {
  const typeMap: { [key: string]: string } = {
    billingEnabled: "boolean",
    canCreateTeams: "boolean",
    maxApiCalls: "number",
    ssoEnabled: "boolean",
    auditLogging: "boolean",
    canAccessAnalytics: "boolean",
    analyticsRetention: "number",
    customDomain: "string",
    storageQuota: "number",
    canProcessPayments: "boolean",
    paymentFeesRate: "number",
    inventoryTracking: "boolean",
    lowStockThreshold: "number",
    freeShippingEnabled: "boolean",
    freeShippingMinimum: "number",
    supportedCurrencies: "object",
    defaultCurrency: "string",
    hipaaCompliant: "boolean",
    auditTrailEnabled: "boolean",
    dataRetentionYears: "number",
    anonymizeAfterYears: "number",
    requireMFA: "boolean",
    sessionTimeoutMinutes: "number",
    featureEnabled: "boolean",
    maxDepthLevel: "number",
  };
  return typeMap[field] || "unknown";
}

function getDefaultValue(field: string): any {
  const defaultMap: { [key: string]: any } = {
    billingEnabled: false,
    canCreateTeams: false,
    maxApiCalls: 1000,
    ssoEnabled: false,
    auditLogging: false,
    canAccessAnalytics: false,
    analyticsRetention: 30,
    customDomain: "tenant.default.com",
    storageQuota: 107374182400,
    canProcessPayments: false,
    paymentFeesRate: 0.029,
    inventoryTracking: false,
    lowStockThreshold: 10,
    freeShippingEnabled: false,
    freeShippingMinimum: 50.0,
    supportedCurrencies: ["USD"],
    defaultCurrency: "USD",
    hipaaCompliant: true,
    auditTrailEnabled: true,
    dataRetentionYears: 7,
    anonymizeAfterYears: 10,
    requireMFA: true,
    sessionTimeoutMinutes: 15,
    featureEnabled: false,
    maxDepthLevel: 10,
  };
  return defaultMap[field];
}

console.log(`\n${"🎯".repeat(30)}`);
console.log("🔥 STRESS TEST SUITE COMPLETE");
console.log("Time to see what breaks! 💪");
console.log(`${"🎯".repeat(30)}`);
