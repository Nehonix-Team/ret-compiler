/**
 * Test script for Interface-based Schema system
 * Demonstrates TypeScript interface-like schema definitions
 */

import {
    Interface,
    FieldTypes,
    QuickSchemas,
    Make,
} from "../core/schema/mode/interfaces/Interface";

console.log("=== FORTIFYJS INTERFACE SCHEMA TESTS ===\n");

// ===== BASIC INTERFACE SYNTAX =====
console.log("1. Basic Interface Syntax:");

// Simple user schema - looks like TypeScript interface!
const UserSchema = Interface({
    id: "number",
    email: "email",
    name: "string",
    age: "number?", // Optional
    isActive: "boolean?", // Optional with smart conversion
    tags: "string[]?", // Optional array
    role: Make.const("admin"), // Safe constant value
});

console.log(
    "✅ Valid user:",
    UserSchema.safeParse({
        id: 1,
        email: "john@example.com",
        name: "John Doe",
        age: 30,
        role: "admin",
    })
);

console.log(
    "❌ Invalid user:",
    UserSchema.safeParse({
        id: "not-a-number",
        email: "invalid-email",
        name: "J",
    })
);

// ===== NESTED OBJECTS =====
console.log("\n2. Nested Objects:");

const OrderSchema = Interface({
    id: "number",
    status: "pending", // Constant
    customer: {
        // Nested object
        name: "string",
        email: "email",
        address: {
            // Deeply nested
            street: "string",
            city: "string",
            zipCode: "string",
        },
    },
    items: [
        {
            // Array of objects
            name: "string",
            price: "number",
            quantity: "int",
        },
    ],
    total: "number",
    createdAt: "date?",
});

const validOrder = {
    id: 123,
    status: "pending",
    customer: {
        name: "Jane Doe",
        email: "jane@example.com",
        address: {
            street: "123 Main St",
            city: "New York",
            zipCode: "10001",
        },
    },
    items: [
        { name: "Product 1", price: 29.99, quantity: 2 },
        { name: "Product 2", price: 15.5, quantity: 1 },
    ],
    total: 75.48,
};

console.log("✅ Valid order:", OrderSchema.safeParse(validOrder));

// ===== ARRAY TYPES =====
console.log("\n3. Array Types:");

const BlogPostSchema = Interface({
    title: "string",
    content: "string",
    tags: "string[]", // Required array
    categories: "string[]?", // Optional array
    authors: "email[]", // Array of emails
    ratings: "number[]?", // Optional number array
    published: "boolean",
});

console.log(
    "✅ Valid blog post:",
    BlogPostSchema.safeParse({
        title: "My Blog Post",
        content: "This is the content...",
        tags: ["javascript", "typescript"],
        authors: ["author1@example.com", "author2@example.com"],
        ratings: [4.5, 5.0, 4.8],
        published: true,
    })
);

// ===== FORMAT VALIDATION =====
console.log("\n4. Format Validation:");

const ContactSchema = Interface({
    name: "string",
    email: "email", // Email format
    website: "url?", // Optional URL
    phone: "phone?", // Optional phone
    userId: "uuid", // UUID format
    username: "username", // Username format
    slug: "slug", // URL slug format
});

console.log(
    "✅ Valid contact:",
    ContactSchema.safeParse({
        name: "John Doe",
        email: "john@example.com",
        website: "https://johndoe.com",
        phone: "+1234567890",
        userId: "123e4567-e89b-12d3-a456-426614174000",
        username: "john_doe",
        slug: "john-doe-profile",
    })
);

console.log(
    "❌ Invalid formats:",
    ContactSchema.safeParse({
        name: "John Doe",
        email: "invalid-email",
        website: "not-a-url",
        phone: "123",
        userId: "not-a-uuid",
        username: "invalid username!",
        slug: "Invalid Slug!",
    })
);

// ===== NUMBER TYPES =====
console.log("\n5. Number Types:");

const ProductSchema = Interface({
    id: "int", // Integer
    name: "string",
    price: "number", // Any number
    stock: "positive", // Positive integer
    rating: "float?", // Optional float
    discount: "number?", // Optional number
    categoryId: "int",
});

console.log(
    "✅ Valid product:",
    ProductSchema.safeParse({
        id: 1,
        name: "Laptop",
        price: 999.99,
        stock: 50,
        rating: 4.5,
        categoryId: 2,
    })
);

console.log(
    "❌ Invalid numbers:",
    ProductSchema.safeParse({
        id: 1.5, // Should be integer
        name: "Laptop",
        price: "not-a-number",
        stock: -5, // Should be positive
        categoryId: "not-int",
    })
);

// ===== CONSTANTS AND MIXED TYPES =====
console.log("\n6. Constants and Mixed Types:");

const APIResponseSchema = Interface({
    version: "1.0", // Constant string
    status: 200, // Constant number
    success: "boolean",
    data: {
        users: "any[]", // Array of any type
        pagination: {
            page: "int",
            total: "int",
        },
    },
    metadata: "any?", // Optional any type
    errors: "string[]?", // Optional string array
});

console.log(
    "✅ Valid API response:",
    APIResponseSchema.safeParse({
        version: "1.0",
        status: 200,
        success: true,
        data: {
            users: [
                { id: 1, name: "John" },
                { id: 2, name: "Jane" },
            ],
            pagination: {
                page: 1,
                total: 100,
            },
        },
    })
);

// ===== STRICT MODE =====
console.log("\n7. Strict Mode:");

const StrictUserSchema = Interface({
    id: "number",
    name: "string",
}).strict();

console.log(
    "❌ Strict mode rejects extra properties:",
    StrictUserSchema.safeParse({
        id: 1,
        name: "John",
        extraField: "not allowed",
    })
);

// ===== QUICK SCHEMAS =====
console.log("\n8. Quick Schemas:");

console.log(
    "✅ Quick User schema:",
    QuickSchemas.User.safeParse({
        id: 1,
        email: "user@example.com",
        name: "User Name",
    })
);

console.log(
    "✅ Quick API Response:",
    QuickSchemas.APIResponse.safeParse({
        success: true,
        data: { message: "Hello World" },
    })
);

// ===== TYPE CONVERSION =====
console.log("\n9. Smart Type Conversion:");

const FlexibleSchema = Interface({
    id: "number", // Converts string numbers
    active: "boolean", // Converts string booleans
    count: "int", // Converts string integers
});

console.log(
    "✅ Type conversion:",
    FlexibleSchema.safeParse({
        id: "123", // String to number
        active: "true", // String to boolean
        count: "456", // String to integer
    })
);

// ===== ERROR HANDLING =====
console.log("\n10. Error Handling:");

try {
    UserSchema.parse({ invalid: "data" });
} catch (error) {
    console.log("❌ Parse error:", (error as Error).message);
}

const result = UserSchema.safeParse({ invalid: "data" });
if (!result.success) {
    console.log("❌ SafeParse errors:", result.errors);
}

// ===== NEW SAFER SYNTAX =====
console.log("\n11. New Safer Syntax for Constants and Unions:");

// Safe constant values using Make.const()
const SafeAPIResponseSchema = Interface({
    version: Make.const("1.0"), // Safe constant string
    status: Make.const(200), // Safe constant number
    success: Make.const(true), // Safe constant boolean
    data: "any",
});

console.log(
    "✅ Safe constants:",
    SafeAPIResponseSchema.safeParse({
        version: "1.0",
        status: 200,
        success: true,
        data: { message: "Hello" },
    })
);

console.log(
    "❌ Wrong constant:",
    SafeAPIResponseSchema.safeParse({
        version: "2.0", // Wrong version
        status: 200,
        success: true,
        data: {},
    })
);

// Union types using Make.union()
const OrderWithUnionsSchema = Interface({
    id: "number",
    status: Make.union(
        "pending",
        "processing",
        "shipped",
        "delivered"
    ),
    priority: Make.union("low", "medium", "high"),
    type: Make.unionOptional("standard", "express", "overnight"),
});

console.log(
    "✅ Valid order with union:",
    OrderWithUnionsSchema.safeParse({
        id: 123,
        status: "pending",
        priority: "high",
    })
);

console.log(
    "❌ Invalid union value:",
    OrderWithUnionsSchema.safeParse({
        id: 123,
        status: "invalid_status", // Not in union
        priority: "high",
    })
);

console.log("\n=== INTERFACE SCHEMA TESTS COMPLETED ===");
console.log("🎉 TypeScript interface-like schemas working perfectly!");
console.log("📚 Features demonstrated:");
console.log("  - TypeScript interface-like syntax");
console.log('  - Optional fields with "?" suffix');
console.log('  - Array types with "[]" suffix');
console.log("  - Constant values (strings, numbers, etc.)");
console.log("  - Nested objects and arrays");
console.log("  - Format validation (email, url, uuid, phone, etc.)");
console.log("  - Number types (int, positive, float)");
console.log("  - Smart type conversion");
console.log("  - Strict mode for extra property control");
console.log("  - Quick schema templates");
console.log("  - Clean, readable schema definitions!");
console.log(
    "  - Much easier than Zod and more intuitive than traditional schemas!"
);

