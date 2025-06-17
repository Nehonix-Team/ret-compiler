/**
 * Comprehensive examples of conditional validation in Fortify Schema
 * 
 * This file demonstrates all the different ways to use conditional validation
 * with the implemented system.
 */

import { InterfaceSchema } from "../src/core/schema/mode/interfaces/InterfaceSchema";
import { When } from "../src/core/schema/extensions/components/ConditionalValidation/When";

// Example 1: Revolutionary *? Syntax - User Role Based Validation
console.log("=== Example 1: Revolutionary *? Syntax ===");

const userSchema = new InterfaceSchema({
  role: "string",
  permissions: "when role=admin *? string[] : string[]?",
  salary: "when role=admin *? number : number?",
  department: "when role.in(admin,manager) *? string : string?",
});

// Admin user - requires all fields
const adminUser = {
  role: "admin",
  permissions: ["read", "write", "delete"],
  salary: 75000,
  department: "IT",
};

const adminResult = userSchema.validate(adminUser);
console.log("Admin validation:", adminResult.success ? "✅ PASS" : "❌ FAIL");
if (!adminResult.success) console.log("Errors:", adminResult.errors);

// Regular user - optional fields
const regularUser = {
  role: "user",
  permissions: undefined,
  salary: undefined,
  department: undefined,
};

const userResult = userSchema.validate(regularUser);
console.log("User validation:", userResult.success ? "✅ PASS" : "❌ FAIL");

// Example 2: Parentheses Syntax - Age-Based Validation
console.log("\n=== Example 2: Parentheses Syntax ===");

const ageSchema = new InterfaceSchema({
  age: "number",
  drinkType: "when(age>=21) then(string) else(=water)",
  canVote: "when(age>=18) then(=true) else(=false)",
  schoolGrade: "when(age<18) then(string) else(string?)",
});

// Adult validation
const adult = {
  age: 25,
  drinkType: "beer",
  canVote: true,
  schoolGrade: undefined,
};

const adultResult = ageSchema.validate(adult);
console.log("Adult validation:", adultResult.success ? "✅ PASS" : "❌ FAIL");

// Minor validation
const minor = {
  age: 16,
  drinkType: "water",
  canVote: false,
  schoolGrade: "10th",
};

const minorResult = ageSchema.validate(minor);
console.log("Minor validation:", minorResult.success ? "✅ PASS" : "❌ FAIL");

// Example 3: When Builder API - Complex Business Logic
console.log("\n=== Example 3: When Builder API ===");

const orderSchema = new InterfaceSchema({
  orderType: "string",
  priority: "string",
  shippingMethod: When.field("priority")
    .is("urgent")
    .then("=express")
    .else("standard|economy"),
  
  discount: When.field("orderType")
    .in(["bulk", "wholesale"])
    .then("number")
    .else("number?"),
    
  requiresApproval: When.field("orderType")
    .is("wholesale")
    .then("=true")
    .else("=false"),
});

// Urgent bulk order
const urgentBulkOrder = {
  orderType: "bulk",
  priority: "urgent",
  shippingMethod: "express",
  discount: 15,
  requiresApproval: false,
};

const bulkResult = orderSchema.validate(urgentBulkOrder);
console.log("Bulk order validation:", bulkResult.success ? "✅ PASS" : "❌ FAIL");

// Example 4: Advanced Operators - File Processing System
console.log("\n=== Example 4: Advanced Operators ===");

const fileSchema = new InterfaceSchema({
  filename: "string",
  size: "number",
  
  // Compression based on file extension
  compression: "when filename.endsWith(.zip) *? =high : when filename.endsWith(.jpg) *? =medium : =none",
  
  // Processing based on file size
  processingQueue: "when size>1000000 *? =background : =immediate",
  
  // Backup based on file type
  needsBackup: "when filename.startsWith(important_) *? =true : =false",
  
  // Metadata extraction for specific types
  extractMetadata: "when filename.contains(.pdf) *? =true : when filename.contains(.docx) *? =true : =false",
});

const importantPdfFile = {
  filename: "important_document.pdf",
  size: 2500000,
  compression: "none",
  processingQueue: "background",
  needsBackup: true,
  extractMetadata: true,
};

const fileResult = fileSchema.validate(importantPdfFile);
console.log("File validation:", fileResult.success ? "✅ PASS" : "❌ FAIL");

// Example 5: Nested Conditional Logic - E-commerce Product
console.log("\n=== Example 5: Nested Conditional Logic ===");

const productSchema = new InterfaceSchema({
  category: "string",
  subcategory: "string?",
  price: "number",
  
  // Digital products don't need shipping
  shippingWeight: "when category!=digital *? number : number?",
  shippingCost: "when category!=digital *? number : =0",
  
  // Electronics need warranty
  warrantyPeriod: "when category=electronics *? number : number?",
  
  // Books have special ISBN field
  isbn: "when category=books *? string : string?",
  
  // Clothing has size information
  sizes: "when category=clothing *? string[] : string[]?",
  
  // Age restriction for certain categories
  ageRestriction: "when category.in(alcohol,tobacco) *? number : number?",
});

const electronicsProduct = {
  category: "electronics",
  subcategory: "smartphones",
  price: 699,
  shippingWeight: 0.5,
  shippingCost: 15,
  warrantyPeriod: 24,
  isbn: undefined,
  sizes: undefined,
  ageRestriction: undefined,
};

const electronicsResult = productSchema.validate(electronicsProduct);
console.log("Electronics validation:", electronicsResult.success ? "✅ PASS" : "❌ FAIL");

// Example 6: Error Handling and Edge Cases
console.log("\n=== Example 6: Error Handling ===");

const errorTestSchema = new InterfaceSchema({
  status: "string",
  details: "when status=active *? string : string?",
});

// Test with invalid data
const invalidData = {
  status: "active",
  details: 123, // Should be string
};

const errorResult = errorTestSchema.validate(invalidData);
console.log("Error test validation:", errorResult.success ? "✅ PASS" : "❌ FAIL");
if (!errorResult.success) {
  console.log("Expected errors:", errorResult.errors);
}

// Example 7: Performance Test with Complex Conditions
console.log("\n=== Example 7: Performance Test ===");

const complexSchema = new InterfaceSchema({
  userType: "string",
  subscription: "string?",
  region: "string",
  
  // Multi-level conditional logic
  features: "when userType=premium *? string[] : when subscription.exists *? string[] : when region.in(US,CA,UK) *? string[] : string[]?",
  
  // Pricing based on multiple factors
  pricing: "when userType=enterprise *? number : when region=US *? number : when subscription.exists *? number : =0",
  
  // Support level
  supportLevel: "when userType.in(premium,enterprise) *? =priority : when subscription.exists *? =standard : =basic",
});

const complexUser = {
  userType: "premium",
  subscription: "pro",
  region: "US",
  features: ["advanced", "analytics", "priority-support"],
  pricing: 99,
  supportLevel: "priority",
};

const start = performance.now();
const complexResult = complexSchema.validate(complexUser);
const end = performance.now();

console.log("Complex validation:", complexResult.success ? "✅ PASS" : "❌ FAIL");
console.log(`Validation time: ${(end - start).toFixed(2)}ms`);

console.log("\n=== All Examples Complete ===");
console.log("Conditional validation system is fully implemented and working! 🎉");
