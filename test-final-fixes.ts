import { Interface } from "./src/core/schema/mode/interfaces/Interface";

console.log("🚀 TESTING FINAL FIXES\n");

// Test 1: Array Literal Parsing
console.log("1. Testing Array Literal Parsing:");
try {
  const schema1 = Interface({
    id: "string",
    tags: 'when metadata.tagging.$exists() *? string[] : =["default"]',
    numbers: "when metadata.numbers.$exists() *? number[] : =[1,2,3]",
    complex: 'when metadata.complex.$exists() *? string[] : =["item1","item2"]',
  }).allowUnknown();
  
  const result1 = schema1.safeParse({
    id: "test",
    metadata: { tagging: true, numbers: true, complex: true },
    tags: ["custom"],
    numbers: [10, 20, 30],
    complex: ["test1", "test2"]
  });
  
  console.log(`   Result: ${result1.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  if (!result1.success) {
    console.log(`   Errors: ${result1.errors}`);
  } else {
    console.log(`   Output: ${JSON.stringify(result1.data, null, 2)}`);
  }
} catch (error: any) {
  console.log(`   ❌ EXCEPTION: ${error.message}`);
}

// Test 2: Unicode Emoji Support
console.log("\n2. Testing Unicode Emoji Support:");
try {
  const schema2 = Interface({
    id: "string",
    unicodeFeature: "when config.unicode_🚀.$exists() *? boolean : =false",
    emojiFeature: "when config.test_😎.$exists() *? boolean : =false",
  }).allowUnknown();
  
  const result2 = schema2.safeParse({
    id: "test",
    config: { "unicode_🚀": true, "test_😎": true },
    unicodeFeature: true,
    emojiFeature: true
  });
  
  console.log(`   Result: ${result2.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  if (!result2.success) {
    console.log(`   Errors: ${result2.errors}`);
  } else {
    console.log(`   Output: ${JSON.stringify(result2.data, null, 2)}`);
  }
} catch (error: any) {
  console.log(`   ❌ EXCEPTION: ${error.message}`);
}

// Test 3: Combined Complex Test
console.log("\n3. Testing Combined Complex Features:");
try {
  const schema3 = Interface({
    id: "string",
    negativeNumbers: "when config.negative.$exists() *? number : =-1",
    arrayDefaults: 'when config.arrays.$exists() *? string[] : =["default","value"]',
    bracketAccess: 'when config["special-key"].$exists() *? boolean : =false',
    unicodeProps: "when config.unicode_🎯.$exists() *? boolean : =false",
  }).allowUnknown();
  
  const result3 = schema3.safeParse({
    id: "complex-test",
    config: { 
      negative: true, 
      arrays: true, 
      "special-key": true,
      "unicode_🎯": true 
    },
    negativeNumbers: -42,
    arrayDefaults: ["custom", "array"],
    bracketAccess: true,
    unicodeProps: true
  });
  
  console.log(`   Result: ${result3.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  if (!result3.success) {
    console.log(`   Errors: ${result3.errors}`);
  } else {
    console.log(`   Output: ${JSON.stringify(result3.data, null, 2)}`);
  }
} catch (error: any) {
  console.log(`   ❌ EXCEPTION: ${error.message}`);
}

console.log("\n🎯 FINAL FIXES TESTING COMPLETE");
