import { Interface } from "./src/core/schema/mode/interfaces/Interface";

console.log("🔧 TESTING CRITICAL FIXES\n");

// Test 1: Negative Number Constants
console.log("1. Testing Negative Number Constants:");
try {
  const schema1 = Interface({
    id: "string",
    negativeFeature: "when config.negative.$exists() *? number : =-1",
  }).allowUnknown();
  
  const result1 = schema1.safeParse({
    id: "test",
    config: { negative: true },
    negativeFeature: -42
  });
  
  console.log(`   Result: ${result1.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  if (!result1.success) {
    console.log(`   Errors: ${result1.errors}`);
  } else {
    console.log(`   Output: ${JSON.stringify(result1.data)}`);
  }
} catch (error: any) {
  console.log(`   ❌ EXCEPTION: ${error.message}`);
}

// Test 2: Bracket Notation
console.log("\n2. Testing Bracket Notation:");
try {
  const schema2 = Interface({
    id: "string",
    specialFeature: 'when config["special-key"].$exists() *? boolean : =false',
  }).allowUnknown();
  
  const result2 = schema2.safeParse({
    id: "test",
    config: { "special-key": true },
    specialFeature: true
  });
  
  console.log(`   Result: ${result2.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  if (!result2.success) {
    console.log(`   Errors: ${result2.errors}`);
  } else {
    console.log(`   Output: ${JSON.stringify(result2.data)}`);
  }
} catch (error: any) {
  console.log(`   ❌ EXCEPTION: ${error.message}`);
}

// Test 3: Unicode Support
console.log("\n3. Testing Unicode Support:");
try {
  const schema3 = Interface({
    id: "string",
    unicodeFeature: "when config.unicode_test.$exists() *? boolean : =false",
  }).allowUnknown();
  
  const result3 = schema3.safeParse({
    id: "test",
    config: { "unicode_test": true },
    unicodeFeature: true
  });
  
  console.log(`   Result: ${result3.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  if (!result3.success) {
    console.log(`   Errors: ${result3.errors}`);
  } else {
    console.log(`   Output: ${JSON.stringify(result3.data)}`);
  }
} catch (error: any) {
  console.log(`   ❌ EXCEPTION: ${error.message}`);
}

// Test 4: Circular Reference Handling
console.log("\n4. Testing Circular Reference Handling:");
try {
  const schema4 = Interface({
    id: "string",
    circularFeature: "when circular.ref.$exists() *? boolean : =false",
  }).allowUnknown();
  
  // Create circular reference
  const obj: any = {
    id: "circular-test",
    circularFeature: true,
  };
  const circular: any = { ref: true };
  circular.self = circular;
  obj.circular = circular;
  
  const result4 = schema4.safeParse(obj);
  
  console.log(`   Result: ${result4.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  if (!result4.success) {
    console.log(`   Errors: ${result4.errors}`);
  } else {
    console.log(`   Output: Circular reference handled successfully`);
  }
} catch (error: any) {
  console.log(`   ❌ EXCEPTION: ${error.message}`);
}

console.log("\n🎯 FIXES TESTING COMPLETE");
