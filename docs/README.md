# Fortify Schema Documentation

Welcome to the comprehensive documentation for Fortify Schema - the TypeScript-first validation library with interface-native syntax.

## 📚 Documentation Index

### **Getting Started**
- **[Installation & Setup](./GETTING-STARTED.md)** - Quick start guide and installation
- **[Basic Examples](./BASIC-EXAMPLES.md)** - Simple examples to get you started
- **[Field Types Reference](./FIELD-TYPES.md)** - Complete guide to all available field types

### **Core Features**
- **[Conditional Validation Guide](./CONDITIONAL-VALIDATION.md)** - V1 and V2 conditional validation
- **[V2 Migration Guide](./V2-MIGRATION.md)** - Migrating from V1 to V2 syntax
- **[Advanced Features](./ADVANCED-FEATURES.md)** - Schema transformations and validation modes

### **Tooling & Development**
- **[VS Code Extension](./VSCODE-EXTENSION.md)** - Complete extension guide and features
- **[API Reference](./API-REFERENCE.md)** - Complete API documentation
- **[Performance Guide](./PERFORMANCE.md)** - Optimization and benchmarking

### **Examples & References**
- **[Examples Collection](./EXAMPLES.md)** - Real-world examples and patterns
- **[Quick Reference](./QUICK-REFERENCE.md)** - Syntax cheat sheet
- **[Best Practices](./BEST-PRACTICES.md)** - Recommended patterns and practices

### **Production & Enterprise**
- **[Production Deployment](./PRODUCTION-DEPLOYMENT.md)** - Production deployment guide
- **[API Stability](./API-STABILITY.md)** - Production readiness and stability guarantees
- **[Enterprise Features](./ENTERPRISE.md)** - Enterprise-specific features and support

## 🚀 Quick Navigation

### **New to Fortify Schema?**
1. Start with **[Getting Started](./GETTING-STARTED.md)**
2. Learn the basics with **[Basic Examples](./BASIC-EXAMPLES.md)**
3. Explore **[Field Types](./FIELD-TYPES.md)** for validation options

### **Upgrading from V1?**
1. Read the **[V2 Migration Guide](./V2-MIGRATION.md)**
2. Learn **[V2 Conditional Validation](./CONDITIONAL-VALIDATION.md)**
3. Check **[API Stability](./API-STABILITY.md)** for compatibility

### **Building Production Apps?**
1. Review **[Best Practices](./BEST-PRACTICES.md)**
2. Follow **[Production Deployment](./PRODUCTION-DEPLOYMENT.md)**
3. Consider **[Enterprise Features](./ENTERPRISE.md)**

### **Need Development Tools?**
1. Install **[VS Code Extension](./VSCODE-EXTENSION.md)**
2. Check **[Performance Guide](./PERFORMANCE.md)**
3. Use **[Quick Reference](./QUICK-REFERENCE.md)** for syntax

## 🎯 Key Concepts

### **Interface-Native Syntax**
Fortify Schema uses TypeScript interface-like syntax for intuitive schema definition:

```typescript
const UserSchema = Interface({
  id: "uuid",
  email: "email",
  name: "string(2,50)",
  age: "number(18,120)?",
  role: "admin|user|guest"
});
```

### **V2 Conditional Validation**
Enhanced runtime property checking with powerful method syntax:

```typescript
const AdvancedSchema = Interface({
  config: "any?",
  
  // V2 Runtime Methods
  hasPermissions: "when config.permissions.$exists() *? boolean : =false",
  isListEmpty: "when config.items.$empty() *? boolean : =true",
  hasAdminRole: "when config.roles.$contains(admin) *? boolean : =false"
});
```

### **Type Safety**
Full TypeScript integration with perfect type inference:

```typescript
const result = UserSchema.safeParse(data);
if (result.success) {
  // result.data is fully typed!
  console.log(result.data.email); // TypeScript knows this is a string
}
```

## 🔥 What's New in V2

### **Enhanced Runtime Methods**
- **8 new runtime methods**: `$exists()`, `$empty()`, `$null()`, `$contains()`, `$startsWith()`, `$endsWith()`, `$between()`, `$in()`
- **Deep property access**: `user.profile.settings.advanced.$exists()`
- **Special character support**: `config["admin-override"].$exists()`
- **Unicode support**: `features.feature_🚀.$exists()`

### **Complex Default Values**
- **Object defaults**: `={"theme":"dark","lang":"en"}`
- **Array defaults**: `=["default","user"]`
- **Type-safe defaults**: Full TypeScript inference

### **Performance Improvements**
- **258,910 ops/sec** for array validation (1.6x faster than Zod)
- **460,214 ops/sec** for union types
- **Sub-millisecond validation** for typical schemas

## 🛠️ Development Tools

### **VS Code Extension**
Professional development experience with:
- **Syntax Highlighting** - Context-aware highlighting
- **IntelliSense** - Smart autocomplete for all features
- **Real-time Validation** - Instant error detection
- **Hover Documentation** - Detailed information on hover
- **Go-to-Definition** - Navigate to property definitions

### **Performance Monitoring**
Built-in performance tracking and optimization:
- **Validation metrics** - Track performance in production
- **Memory monitoring** - Detect memory leaks
- **Benchmark tools** - Compare with other libraries

## 📖 Learning Path

### **Beginner (0-1 hour)**
1. **[Getting Started](./GETTING-STARTED.md)** - Installation and first schema
2. **[Basic Examples](./BASIC-EXAMPLES.md)** - Simple validation patterns
3. **[Field Types](./FIELD-TYPES.md)** - Available validation types

### **Intermediate (1-3 hours)**
1. **[Conditional Validation](./CONDITIONAL-VALIDATION.md)** - Business logic validation
2. **[Advanced Features](./ADVANCED-FEATURES.md)** - Schema transformations
3. **[VS Code Extension](./VSCODE-EXTENSION.md)** - Development tools

### **Advanced (3+ hours)**
1. **[V2 Migration](./V2-MIGRATION.md)** - Upgrading existing schemas
2. **[Performance Guide](./PERFORMANCE.md)** - Optimization techniques
3. **[Production Deployment](./PRODUCTION-DEPLOYMENT.md)** - Enterprise deployment

## 🤝 Community & Support

### **Getting Help**
- **[GitHub Issues](https://github.com/Nehonix-Team/fortify-schema/issues)** - Bug reports and feature requests
- **[GitHub Discussions](https://github.com/Nehonix-Team/fortify-schema/discussions)** - Community Q&A
- **[Examples Collection](./EXAMPLES.md)** - Real-world usage patterns

### **Contributing**
- **[Contributing Guide](../CONTRIBUTING.md)** - How to contribute
- **[Best Practices](./BEST-PRACTICES.md)** - Recommended patterns
- **[API Reference](./API-REFERENCE.md)** - Complete API documentation

### **Enterprise Support**
- **[Enterprise Features](./ENTERPRISE.md)** - Enterprise-specific capabilities
- **[API Stability](./API-STABILITY.md)** - Production guarantees
- **Email**: enterprise@nehonix.space

## 🎉 Ready to Start?

Choose your path:

**🚀 New Project**: Start with **[Getting Started](./GETTING-STARTED.md)**  
**🔄 Existing Project**: Check **[V2 Migration Guide](./V2-MIGRATION.md)**  
**🏢 Enterprise**: Review **[Production Deployment](./PRODUCTION-DEPLOYMENT.md)**  
**🛠️ Development**: Install **[VS Code Extension](./VSCODE-EXTENSION.md)**

---

*Built with precision and care by the Nehonix Team*
