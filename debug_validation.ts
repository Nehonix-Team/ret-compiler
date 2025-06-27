// Debug validation test
import { TypeValidators } from "./src/core/schema/mode/interfaces/validators/TypeValidators";

console.log("=== DEBUGGING VALIDATION FUNCTIONS ===\n");

// Test JSON validation directly
console.log("1. Testing JSON validation directly:");
const jsonResult1 = TypeValidators.validateJson('{"valid": "json"}');
console.log("Valid JSON:", jsonResult1);

const jsonResult2 = TypeValidators.validateJson('{"invalid": "json"');
console.log("Invalid JSON:", jsonResult2);

// Test IP validation directly
console.log("\n2. Testing IP validation directly:");
const ipResult1 = TypeValidators.validateIp("192.168.1.1");
console.log("Valid IP:", ipResult1);

const ipResult2 = TypeValidators.validateIp("256.1.1.1");
console.log("Invalid IP:", ipResult2);

// Test Password validation directly
console.log("\n3. Testing Password validation directly:");
const passResult1 = TypeValidators.validatePassword("validpassword");
console.log("Valid password:", passResult1);

const passResult2 = TypeValidators.validatePassword("");
console.log("Empty password:", passResult2);

const passResult3 = TypeValidators.validatePassword(123);
console.log("Number password:", passResult3);

// Test Text validation directly
console.log("\n4. Testing Text validation directly:");
const textResult1 = TypeValidators.validateText("valid text");
console.log("Valid text:", textResult1);

const textResult2 = TypeValidators.validateText(123);
console.log("Number text:", textResult2);

// Test Object validation directly
console.log("\n5. Testing Object validation directly:");
const objResult1 = TypeValidators.validateObject({key: "value"});
console.log("Valid object:", objResult1);

const objResult2 = TypeValidators.validateObject("string");
console.log("String object:", objResult2);

// Test URL validation directly
console.log("\n6. Testing URL validation directly:");
const urlResult1 = TypeValidators.validateUrl("https://example.com");
console.log("Valid URL:", urlResult1);

const urlResult2 = TypeValidators.validateUrl("not-a-url");
console.log("Invalid URL:", urlResult2);
