# ReliantType Extensions

Advanced extensions for the ReliantType validation library, providing powerful features for schema validation, documentation generation, and real-time validation.

## Architecture

The extensions are built with a clean, maintainable architecture:

- **Core Extensions**: High-level APIs for common use cases
- **Specialized Modules**: Focused utilities in the `mods/` directory

## Available Extensions

### Smart Inference (`Smart`)

Automatically infer schema definitions from sample data or TypeScript types.

```typescript
import { Smart } from 'reliant-type';

// Infer from sample data
const sampleUser = {
  id: 1,
  email: "user@example.com",
  name: "John Doe",
  tags: ["developer", "typescript"]
};

const UserSchema = Smart.fromSample(sampleUser);
// Generates: { id: "positive", email: "email", name: "string", tags: "string[]" }

// Infer from TypeScript interface with sample
interface User {
  id: number;
  email: string;
  name?: string;
}

const schema = Smart.fromType<User>({
  id: 1,
  email: "user@example.com",
  name: "John"
});
```

### Conditional Validation (`When`)

Create complex validation rules based on field dependencies.

```typescript
import { When } from 'reliant-type';

const OrderSchema = Interface({
  orderType: Make.union("pickup", "delivery"),
  address: "string?",
  
  // Conditional validation
  deliveryFee: When.field("orderType")
    .is("delivery")
    .then("number(0,)")
    .default("number?")
});
```

### Real-time Validation (`Live`)

Reactive validation for forms and streaming data.

```typescript
import { Live } from 'reliant-type';

// Form validation
const formValidator = Live.form(UserSchema);
formValidator.bindField('email', emailInput);
formValidator.enableAutoValidation();

// Stream validation
const streamValidator = Live.stream(DataSchema);
streamValidator.onValid(data => processData(data));
streamValidator.onInvalid((data, errors) => logErrors(errors));
```

### Auto Documentation (`Docs`)

Generate comprehensive documentation from schemas.

```typescript
import { Docs } from 'reliant-type';

// Generate OpenAPI specification
const openApiSpec = Docs.openapi(UserSchema, {
  title: "User API",
  version: "1.0.0",
  servers: ["https://api.example.com"]
});

// Generate TypeScript definitions
const typeDefinitions = Docs.typescript(UserSchema, {
  exportName: "User",
  namespace: "API"
});

// Generate interactive documentation
const interactiveDocs = Docs.interactive(UserSchema, {
  title: "User Schema Playground",
  allowTesting: true
});
```

## Specialized Modules


### OpenAPICo nverter

Convert schemas to OpenAPI 3.0 specifications.

```typescript
import { OpenAPIConverter } from 'reliant-type';

const openApiSchema = OpenAPIConverter.convertSchema(schema);
const fullSpec = OpenAPIConverter.generateOpenAPISpec(schema, options);
```

### TypeScriptGenerator

Generate TypeScript code from schemas.

```typescript
import { TypeScriptGenerator } from 'reliant-type';

const interface = TypeScriptGenerator.generateInterface(schema, options);
const utilityTypes = TypeScriptGenerator.generateUtilityTypes(schema, "User");
const module = TypeScriptGenerator.generateModule(schema, options);
```

## Quick Access

Use the `Quick` object for common operations:

```typescript
import { Quick } from 'reliant-type';

// Quick schema inference
const schema = Quick.fromSample(sampleData);

// Quick conditional validation
const conditionalField = Quick.when("status").is("active").then("string");

// Quick documentation
const docs = Quick.docs(schema);
const typescript = Quick.typescript(schema);
```


## Features

- **Type Safety**: Full TypeScript support with proper type inference
- **Performance**: Optimized validation engine with early termination
- **Extensibility**: Clean architecture for adding new features
- **Browser & Node.js**: Works in both environments
- **Zero Dependencies**: Built on existing Fortify utilities

## Best Practices

1. **Use Smart Inference**: Start with `Smart.fromSample()` for rapid prototyping
2. **Leverage Conditional Validation**: Use `When` for complex business rules
3. **Real-time Feedback**: Implement `Live` validation for better UX
4. **Document Everything**: Generate docs with `Docs` for API documentation
5. **Type Generation**: Use TypeScript generation for type-safe APIs

The extensions provide a powerful, flexible foundation for advanced schema validation while maintaining simplicity and performance.
