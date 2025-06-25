/**
 * Test file for VSCode Extension Completion Provider
 * 
 * This file demonstrates the enhanced completion functionality:
 * 1. Property suggestions when typing conditions
 * 2. Nested property suggestions  
 * 3. Method suggestions when $ is detected
 */

import { Interface } from "../src/core/schema/mode/interfaces/Interface";

// Test schema with various property types
const UserSchema = Interface({
  // Basic properties
  id: "string",
  name: "string",
  email: "email",
  age: "number(13,120)",
  
  // Nested object properties
  profile: "any", // In real usage, this would be an object
  settings: "any", // In real usage, this would be an object
  config: "any",   // In real usage, this would be an object
  
  // Conditional fields to test completion
  // Type "when " and you should see property suggestions: id, name, email, age, profile, settings, config
  isAdult: "when age>=18 *? boolean : boolean?",
  
  // Type "when p" and you should see: profile
  hasProfile: "when profile.$exists() *? boolean : =false",
  
  // Type "when profile." and you should see nested suggestions: firstName, lastName, avatar, bio, dateOfBirth
  profileComplete: "when profile.firstName.$exists() && profile.lastName.$exists() *? boolean : =false",
  
  // Type "when settings." and you should see: theme, language, notifications, privacy
  darkMode: "when settings.theme=dark *? boolean : =false",
  
  // Type "when config.value.$" and you should see all method suggestions
  hasValidConfig: "when config.value.$exists() && !config.value.$empty() *? boolean : =false",
  
  // Test various method completions
  emailVerified: "when email.$contains(@) *? boolean : =false",
  nameNotEmpty: "when name.$empty() *? =invalid : =valid",
  profileExists: "when profile.$exists() *? =yes : =no",
});

// Test data
const userData = {
  id: "user123",
  name: "John Doe", 
  email: "john@example.com",
  age: 25,
  profile: {
    firstName: "John",
    lastName: "Doe",
    avatar: "avatar.jpg"
  },
  settings: {
    theme: "dark",
    language: "en"
  },
  config: {
    value: "some-config"
  }
};

// Validate
const result = UserSchema.safeParse(userData);

if (result.success) {
  console.log("✅ Validation passed:", result.data);
} else {
  console.log("❌ Validation failed:", result.errors);
}

/**
 * COMPLETION TESTING SCENARIOS:
 * 
 * 1. Basic Property Completion:
 *    - Type: "when " → Should suggest: id, name, email, age, profile, settings, config
 *    - Type: "when p" → Should suggest: profile
 *    - Type: "when n" → Should suggest: name
 * 
 * 2. Nested Property Completion:
 *    - Type: "when profile." → Should suggest: firstName, lastName, avatar, bio, dateOfBirth
 *    - Type: "when settings." → Should suggest: theme, language, notifications, privacy
 *    - Type: "when config." → Should suggest: enabled, value, options, metadata
 * 
 * 3. Method Completion:
 *    - Type: "when name.$" → Should suggest: exists(), empty(), null(), contains(), etc.
 *    - Type: "when profile.firstName.$" → Should suggest all methods
 *    - Type: "when email.$" → Should suggest all methods
 * 
 * 4. Operator Completion:
 *    - Type: "when age" → Should suggest: =, !=, >, >=, <, <=, .$exists(), etc.
 *    - Type: "when name" → Should suggest: =, !=, .$exists(), .$empty(), etc.
 */
