import { Interface } from "./src/core/schema/mode/interfaces/Interface";

console.log("🚀 COMPREHENSIVE FORTIFY SCHEMA TEST SUITE");
console.log("=" + "=".repeat(60));

const tests = [
  {
    name: "🔢 Negative Number Constants",
    test: () => {
      const schema = Interface({
        id: "string",
        negativeFeature: "when config.negative.$exists() *? number : =-1",
        floatFeature: "when config.float.$exists() *? number : =-3.14",
      }).allowUnknown();
      
      return schema.safeParse({
        id: "test",
        config: { negative: true, float: true },
        negativeFeature: -42,
        floatFeature: -2.71
      });
    }
  },
  
  {
    name: "📚 Array Literal Parsing",
    test: () => {
      const schema = Interface({
        id: "string",
        tags: 'when metadata.tagging.$exists() *? string[] : =["default","value"]',
        numbers: "when metadata.numbers.$exists() *? number[] : =[1,2,3]",
        objects: 'when metadata.objects.$exists() *? string[] : =["item1","item2"]',
      }).allowUnknown();
      
      return schema.safeParse({
        id: "test",
        metadata: { tagging: true, numbers: true, objects: true },
        tags: ["custom"],
        numbers: [10, 20],
        objects: ["test1", "test2"]
      });
    }
  },
  
  {
    name: "🚫 Bracket Notation",
    test: () => {
      const schema = Interface({
        id: "string",
        specialFeature: 'when config["special-key"].$exists() *? boolean : =false',
        hyphenFeature: 'when config["kebab-case"].$exists() *? boolean : =false',
      }).allowUnknown();
      
      return schema.safeParse({
        id: "test",
        config: { "special-key": true, "kebab-case": true },
        specialFeature: true,
        hyphenFeature: true
      });
    }
  },
  
  {
    name: "🌐 Unicode Emoji Support",
    test: () => {
      const schema = Interface({
        id: "string",
        rocketFeature: "when config.unicode_🚀.$exists() *? boolean : =false",
        coolFeature: "when config.test_😎.$exists() *? boolean : =false",
        targetFeature: "when config.aim_🎯.$exists() *? boolean : =false",
      }).allowUnknown();
      
      return schema.safeParse({
        id: "test",
        config: { "unicode_🚀": true, "test_😎": true, "aim_🎯": true },
        rocketFeature: true,
        coolFeature: true,
        targetFeature: true
      });
    }
  },
  
  {
    name: "🌀 Circular Reference Handling",
    test: () => {
      const schema = Interface({
        id: "string",
        circularFeature: "when circular.ref.$exists() *? boolean : =false",
      }).allowUnknown();
      
      const obj: any = {
        id: "circular-test",
        circularFeature: true,
      };
      const circular: any = { ref: true };
      circular.self = circular;
      obj.circular = circular;
      
      return schema.safeParse(obj);
    }
  },
  
  {
    name: "🔥 Combined Complex Features",
    test: () => {
      const schema = Interface({
        id: "string",
        negativeNumbers: "when config.negative.$exists() *? number : =-1",
        arrayDefaults: 'when config.arrays.$exists() *? string[] : =["default","value"]',
        bracketAccess: 'when config["special-key"].$exists() *? boolean : =false',
        unicodeProps: "when config.unicode_🎯.$exists() *? boolean : =false",
        deepNested: "when data.level1.level2.deep.$exists() *? string : =\"found\"",
      }).allowUnknown();
      
      return schema.safeParse({
        id: "complex-test",
        config: { 
          negative: true, 
          arrays: true, 
          "special-key": true,
          "unicode_🎯": true 
        },
        data: {
          level1: {
            level2: {
              deep: "treasure"
            }
          }
        },
        negativeNumbers: -42,
        arrayDefaults: ["custom", "array"],
        bracketAccess: true,
        unicodeProps: true,
        deepNested: "treasure"
      });
    }
  }
];

// Run all tests
let passed = 0;
let total = tests.length;

tests.forEach((testCase, index) => {
  console.log(`\n${index + 1}. ${testCase.name}`);
  
  try {
    const startTime = performance.now();
    const result = testCase.test();
    const endTime = performance.now();
    
    if (result.success) {
      console.log(`   ✅ SUCCESS (${(endTime - startTime).toFixed(2)}ms)`);
      passed++;
    } else {
      console.log(`   ❌ FAILED`);
      console.log(`   Errors: ${result.errors}`);
    }
  } catch (error: any) {
    console.log(`   💥 EXCEPTION: ${error.message}`);
  }
});

console.log("\n" + "=".repeat(70));
console.log(`🎯 FINAL RESULTS: ${passed}/${total} tests passed`);

if (passed === total) {
  console.log("🎉 ALL TESTS PASSED! Fortify Schema is now PRODUCTION-READY! 🚀");
} else {
  console.log(`⚠️  ${total - passed} tests still need attention`);
}

console.log("=" + "=".repeat(70));
