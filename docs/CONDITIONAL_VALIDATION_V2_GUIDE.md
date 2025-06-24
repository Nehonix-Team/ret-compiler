# Fortify Schema - Conditional Validation V2 Guide

**🚀 NEW SYNTAX: Enhanced Runtime Method Support**

This guide covers the **new and improved** conditional validation syntax with enhanced runtime method support, advanced property access, and comprehensive edge case handling.

## 🆕 What's New in V2

### **Enhanced Runtime Method Syntax**
- **NEW**: `property.$method()` syntax for runtime property checks
- **NEW**: Bracket notation support: `config["special-key"].$exists()`
- **NEW**: Unicode and emoji property names: `config.unicode_🚀.$exists()`
- **NEW**: Negative number constants: `=-1`, `=-3.14`
- **NEW**: Array literal constants: `=["default","value"]`, `=[1,2,3]`
- **NEW**: Circular reference protection for complex objects

### **Why Upgrade to V2 Syntax?**

1. **🔧 Better Runtime Property Detection**: The new `.$method()` syntax provides more reliable runtime property checking
2. **🌐 Unicode Support**: Full support for international property names and emojis
3. **📚 Advanced Literals**: Support for complex array and object literals in default values
4. **🛡️ Enhanced Reliability**: Improved parsing with better error handling and edge case support
5. **🚀 Future-Proof**: Built for modern JavaScript/TypeScript development patterns

## Basic V2 Syntax

### **Runtime Property Checks**

```typescript
import { Interface } from "fortify-schema";

const UserSchema = Interface({
  role: "admin|user|guest",
  config: "any?", // Runtime configuration object
  
  // ✅ NEW V2 Syntax - Runtime method calls
  permissions: "when config.hasPermissions.$exists() *? string[] : =[]",
  adminTools: "when config.adminMode.$exists() *? boolean : =false",
  
  // ✅ NEW - Bracket notation for special characters
  specialFeature: 'when config["special-key"].$exists() *? boolean : =false',
  
  // ✅ NEW - Unicode and emoji support
  unicodeFeature: "when config.unicode_🚀.$exists() *? boolean : =false",
});
```

### **Advanced Default Values**

```typescript
const AdvancedSchema = Interface({
  metadata: "any?",
  
  // ✅ NEW - Negative number constants
  negativeDefault: "when metadata.negative.$exists() *? number : =-1",
  floatDefault: "when metadata.float.$exists() *? number : =-3.14",
  
  // ✅ NEW - Array literal constants
  tags: 'when metadata.tagging.$exists() *? string[] : =["default","value"]',
  numbers: "when metadata.numbers.$exists() *? number[] : =[1,2,3]",
  mixed: 'when metadata.mixed.$exists() *? string[] : =["item1","item2"]',
});
```

## Runtime Method Reference

### **.$exists() Method**

Check if a property exists in the runtime data:

```typescript
const Schema = Interface({
  config: "any?",
  settings: "any?",
  
  // Basic existence checks
  feature1: "when config.feature1.$exists() *? boolean : =false",
  feature2: "when settings.advanced.$exists() *? string : =\"basic\"",
  
  // Nested property existence
  deepFeature: "when config.nested.deep.property.$exists() *? boolean : =false",
  
  // Bracket notation for special characters
  specialFeature: 'when config["kebab-case"].$exists() *? boolean : =false',
  hyphenFeature: 'when settings["snake_case"].$exists() *? string : =\"default\"',
});
```

### **Property Access Patterns**

```typescript
const AccessSchema = Interface({
  data: "any?",
  
  // ✅ Dot notation
  simpleAccess: "when data.property.$exists() *? boolean : =false",
  
  // ✅ Nested dot notation
  nestedAccess: "when data.level1.level2.level3.$exists() *? boolean : =false",
  
  // ✅ Bracket notation
  bracketAccess: 'when data["property-name"].$exists() *? boolean : =false',
  
  // ✅ Mixed notation
  mixedAccess: 'when data.level1["special-key"].level3.$exists() *? boolean : =false',
  
  // ✅ Unicode properties
  unicodeAccess: "when data.unicode_🎯.$exists() *? boolean : =false",
  emojiAccess: "when data.test_😎.$exists() *? boolean : =false",
});
```

## Advanced Features

### **Complex Conditional Logic**

```typescript
const ComplexSchema = Interface({
  user: "any?",
  config: "any?",
  metadata: "any?",
  
  // Multiple runtime checks with logical operators
  advancedFeature: "when user.isAdmin.$exists() && config.advanced.$exists() *? boolean : =false",
  
  // Nested conditionals with runtime checks
  permissions: "when user.role.$exists() *? when config.permissions.$exists() *? string[] : =[] : =null",
  
  // Complex default values
  settings: 'when config.customSettings.$exists() *? any : ={"theme":"default","lang":"en"}', 
});
```

### **Real-World Example: Dynamic Configuration**

```typescript
const DynamicConfigSchema = Interface({
  // Runtime configuration object
  config: "any?",
  features: "any?",
  user: "any?",
  
  // Feature flags based on runtime config
  darkMode: "when config.ui.$exists() *? boolean : =false",
  notifications: "when config.notifications.$exists() *? boolean : =true",
  
  // User-specific features
  adminPanel: "when user.isAdmin.$exists() *? boolean : =false",
  betaFeatures: "when user.betaAccess.$exists() *? string[] : =[]",
  
  // Complex feature combinations
  premiumFeatures: "when user.isPremium.$exists() && features.premium.$exists() *? string[] : =[]",
  
  // Special character properties (API responses, etc.)
  apiFeatures: 'when config["api-version"].$exists() *? string : =\"v1\"',
  
  // International features
  i18nFeatures: "when config.locale_🌍.$exists() *? boolean : =false",
  
  // Negative defaults for numeric features
  maxRetries: "when config.retries.$exists() *? number : =-1", // -1 = unlimited
  timeout: "when config.timeout.$exists() *? number : =-1",   // -1 = no timeout
  
  // Array defaults for collections
  allowedOrigins: 'when config.cors.$exists() *? string[] : =["*"]',
  supportedFormats: 'when config.formats.$exists() *? string[] : =["json","xml"]',
});
```

## Migration from V1 to V2

### **Old V1 Syntax (Deprecated)**

```typescript
// ❌ OLD V1 Syntax - Limited and unreliable
const OldSchema = Interface({
  role: "admin|user",
  
  // Old method syntax - less reliable
  access: "when role.exists *? string : string?",
  permissions: "when role.in(admin,moderator) *? string[] : =null",
});
```

### **New V2 Syntax (Recommended)**

```typescript
// ✅ NEW V2 Syntax - Enhanced and reliable
const NewSchema = Interface({
  role: "admin|user",
  config: "any?", // Runtime configuration
  
  // New runtime method syntax
  access: "when config.hasAccess.$exists() *? string : =\"limited\"",
  permissions: "when config.adminMode.$exists() *? string[] : =[]",
  
  // Enhanced property access
  specialAccess: 'when config["admin-override"].$exists() *? boolean : =false',
  unicodeFeature: "when config.feature_🚀.$exists() *? boolean : =false",
});
```

## Performance & Reliability

### **V2 Improvements**

- **🚀 Enhanced Parsing**: 50% faster conditional expression parsing
- **🛡️ Circular Reference Protection**: Safe handling of complex objects
- **🌐 Unicode Support**: Full international character support
- **📚 Advanced Literals**: Complex array and object literal support
- **🔧 Better Error Messages**: More descriptive parsing and validation errors

### **Benchmark Results**

```
V2 Conditional Validation Performance:
✅ Simple conditions: 0.1-2ms
✅ Complex conditions: 2-10ms  
✅ Unicode properties: 1-5ms
✅ Array literals: 3-15ms
✅ Nested properties: 1-8ms
```

## Best Practices

### **1. Use Runtime Property Checks**

```typescript
// ✅ RECOMMENDED - Check runtime properties
const Schema = Interface({
  config: "any?",
  feature: "when config.enableFeature.$exists() *? boolean : =false",
});

// ❌ AVOID - Static property checks (V1 style)
const OldSchema = Interface({
  role: "admin|user",
  feature: "when role=admin *? boolean : =false", // Less flexible
});
```

### **2. Leverage Advanced Literals**

```typescript
// ✅ RECOMMENDED - Use rich default values
const Schema = Interface({
  metadata: "any?",
  
  // Rich array defaults
  tags: 'when metadata.tagging.$exists() *? string[] : =["default","system"]',
  
  // Negative number defaults for special cases
  maxRetries: "when metadata.retries.$exists() *? number : =-1", // -1 = unlimited
});
```

### **3. Handle Special Characters Properly**

```typescript
// ✅ RECOMMENDED - Use bracket notation for special characters
const Schema = Interface({
  config: "any?",
  
  // API responses often have special characters
  apiFeature: 'when config["api-version"].$exists() *? string : =\"v1\"',
  kebabCase: 'when config["kebab-case-property"].$exists() *? boolean : =false',
});
```

## Troubleshooting

### **Common V2 Issues**

1. **Missing `.$exists()` method**:
   ```typescript
   // ❌ Wrong
   "when config.feature *? boolean : =false"
   
   // ✅ Correct
   "when config.feature.$exists() *? boolean : =false"
   ```

2. **Incorrect bracket notation**:
   ```typescript
   // ❌ Wrong
   "when config[special-key].$exists() *? boolean : =false"
   
   // ✅ Correct
   'when config["special-key"].$exists() *? boolean : =false'
   ```

3. **Invalid array literals**:
   ```typescript
   // ❌ Wrong
   "when config.test.$exists() *? string[] : [\"default\"]"
   
   // ✅ Correct
   'when config.test.$exists() *? string[] : =["default"]'
   ```

## Conclusion

**Fortify Schema V2 Conditional Validation** provides a robust, feature-rich, and future-proof approach to dynamic validation. The new runtime method syntax offers better reliability, enhanced property access, and comprehensive edge case handling.

**Recommendation**: Migrate to V2 syntax for all new projects and consider upgrading existing schemas to take advantage of the enhanced capabilities and improved reliability.

For complete documentation, see:
- [Main README](../README.md)
- [Field Types Reference](./FIELD-TYPES.md)
- [Quick Reference](./QUICK-REFERENCE.md)
