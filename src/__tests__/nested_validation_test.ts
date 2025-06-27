// ====================================================================
// NESTED OBJECT VALIDATION TEST
// Testing nested object validation with proper error detection
// ====================================================================

import { Interface } from "../core/schema/mode/interfaces/Interface";

console.log("🧪 Nested Object Validation Test");
console.log("=================================\n");

// Test 1: Simple nested validation
console.log("Test 1: Simple nested validation");
const SimpleSchema = Interface({
  user: {
    name: "string",
    role: "admin|user",
  },
});

const simpleValid = { user: { name: "John", role: "admin" } };
const simpleInvalid = { user: { name: "John", role: "admins" } }; // Invalid role

console.log("✅ Valid data:");
const result1 = SimpleSchema.safeParse(simpleValid);
console.log(`Result: ${result1.success ? "PASS ✅" : "FAIL ❌"}`);

console.log("\n❌ Invalid data:");
const result2 = SimpleSchema.safeParse(simpleInvalid);
console.log(`Result: ${result2.success ? "PASS ❌" : "FAIL ✅"}`);
if (!result2.success) {
  console.log("Errors:", result2.errors);
}

// Test 2: Medium depth validation (10 levels)
console.log("\n\nTest 2: Medium depth validation (10 levels)");
const MediumSchema = Interface({
  l1: {
    l2: {
      l3: {
        l4: {
          l5: {
            l6: {
              l7: {
                l8: {
                  l9: {
                    l10: {
                      value: "string[]", // Should be array
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
});

const mediumValid = {
  l1: {
    l2: {
      l3: {
        l4: {
          l5: {
            l6: {
              l7: {
                l8: {
                  l9: {
                    l10: {
                      value: ["correct", "array", "data"],
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

const mediumInvalid = {
  l1: {
    l2: {
      l3: {
        l4: {
          l5: {
            l6: {
              l7: {
                l8: {
                  l9: {
                    l10: {
                      value: "wrong type - should be array",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

console.log("✅ Valid nested data:");
const result3 = MediumSchema.safeParse(mediumValid);
console.log(`Result: ${result3.success ? "PASS ✅" : "FAIL ❌"}`);

console.log("\n❌ Invalid nested data:");
const result4 = MediumSchema.safeParse(mediumInvalid);
console.log(`Result: ${result4.success ? "PASS ❌" : "FAIL ✅"}`);
if (!result4.success) {
  console.log("Errors:", result4.errors);
} else {
  console.log("❌ CRITICAL: Should have failed but passed!");
}

// Test 3: Deep nesting with conditional validation
console.log("\n\nTest 3: Deep nesting with conditional validation");
const ConditionalSchema = Interface({
  config: {
    settings: {
      advanced: {
        features: {
          enabled: "boolean",
          options: {
            mode: "dev|prod",
            debug: "boolean",
          },
        },
      },
    },
  },
  // Conditional based on nested property
  debugMode:
    "when config.settings.advanced.features.options.debug = true *? string : =disabled",
});

const conditionalValid = {
  config: {
    settings: {
      advanced: {
        features: {
          enabled: true,
          options: {
            mode: "dev",
            debug: true,
          },
        },
      },
    },
  },
  debugMode: "verbose",
};

const conditionalInvalid = {
  config: {
    settings: {
      advanced: {
        features: {
          enabled: true,
          options: {
            mode: "development", // Invalid - should be "dev" or "prod"
            debug: true,
          },
        },
      },
    },
  },
  debugMode: "verbose",
};

console.log("✅ Valid conditional data:");
const result5 = ConditionalSchema.safeParse(conditionalValid);
console.log(`Result: ${result5.success ? "PASS ✅" : "FAIL ❌"}`);

console.log("\n❌ Invalid conditional data:");
const result6 = ConditionalSchema.safeParse(conditionalInvalid);
console.log(`Result: ${result6.success ? "PASS ❌" : "FAIL ✅"}`);
if (!result6.success) {
  console.log("Errors:", result6.errors);
} else {
  console.log("❌ CRITICAL: Should have failed but passed!");
}

// Summary
console.log("\n\n🎯 Test Summary:");
console.log("================");
const allTests = [
  { name: "Simple valid", result: result1.success, expected: true },
  { name: "Simple invalid", result: !result2.success, expected: true },
  { name: "Medium valid", result: result3.success, expected: true },
  { name: "Medium invalid", result: !result4.success, expected: true },
  { name: "Conditional valid", result: result5.success, expected: true },
  { name: "Conditional invalid", result: !result6.success, expected: true },
];

let passed = 0;
allTests.forEach((test, i) => {
  const status = test.result === test.expected ? "✅" : "❌";
  console.log(`${i + 1}. ${test.name}: ${status}`);
  if (test.result === test.expected) passed++;
});

console.log(`\nPassed: ${passed}/${allTests.length}`);
if (passed === allTests.length) {
  console.log("🎉 All nested validation tests passed!");
} else {
  console.log("⚠️ Some tests failed - nested validation needs attention");
}
