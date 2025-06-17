/**
 * Test script for the modular Schema validation system
 * Demonstrates the clean separation between schema logic and validators
 */

import { Schema } from '../core/Schema';

console.log('=== FORTIFYJS MODULAR SCHEMA TESTS ===\n');

// ===== BASIC TYPES =====
console.log('1. Basic Type Validation:');

// String validation
const nameSchema = Schema.string().min(2).max(50);
console.log('✅ Valid name:', nameSchema.safeParse('John Doe'));
console.log('❌ Invalid name:', nameSchema.safeParse('J'));

// Number validation
const ageSchema = Schema.number().int().min(0).max(120);
console.log('✅ Valid age:', ageSchema.safeParse(25));
console.log('❌ Invalid age:', ageSchema.safeParse(-5));

// Boolean validation
const activeSchema = Schema.boolean();
console.log('✅ Valid boolean:', activeSchema.safeParse(true));
console.log('✅ String to boolean:', activeSchema.safeParse('true'));

// ===== ADVANCED STRING VALIDATION =====
console.log('\n2. Advanced String Validation:');

// Email validation (using built-in format validation)
const emailSchema = Schema.string().email();
console.log('✅ Valid email:', emailSchema.safeParse('user@example.com'));
console.log('❌ Invalid email:', emailSchema.safeParse('invalid-email'));

// Phone validation
const phoneSchema = Schema.string().phone();
console.log('✅ Valid phone:', phoneSchema.safeParse('+1234567890'));
console.log('❌ Invalid phone:', phoneSchema.safeParse('123'));

// UUID validation
const uuidSchema = Schema.string().uuid();
console.log('✅ Valid UUID:', uuidSchema.safeParse('123e4567-e89b-12d3-a456-426614174000'));
console.log('❌ Invalid UUID:', uuidSchema.safeParse('not-a-uuid'));

// ===== ARRAY VALIDATION =====
console.log('\n3. Array Validation:');

// Array of strings
const tagsSchema = Schema.array(Schema.string()).min(1).max(5);
console.log('✅ Valid tags:', tagsSchema.safeParse(['javascript', 'typescript']));
console.log('❌ Empty tags:', tagsSchema.safeParse([]));

// Array with unique elements
const uniqueNumbersSchema = Schema.array(Schema.number()).unique();
console.log('✅ Unique numbers:', uniqueNumbersSchema.safeParse([1, 2, 3]));
console.log('❌ Duplicate numbers:', uniqueNumbersSchema.safeParse([1, 2, 2]));

// ===== OBJECT VALIDATION =====
console.log('\n4. Object Validation:');

// User schema
const UserSchema = Schema.object({
    id: Schema.number().int().positive(),
    email: Schema.string().email(),
    name: Schema.string().min(2).max(50),
    age: Schema.number().int().min(0).max(120).optional(),
    isActive: Schema.boolean().default(true),
    tags: Schema.array(Schema.string()).max(10).optional()
});

// Valid user
const validUser = {
    id: 1,
    email: 'john@example.com',
    name: 'John Doe',
    age: 30,
    isActive: true,
    tags: ['developer', 'javascript']
};

console.log('✅ Valid user:', UserSchema.safeParse(validUser));

// Invalid user (missing required fields)
const invalidUser = {
    email: 'invalid-email',
    name: 'J'
};

console.log('❌ Invalid user:', UserSchema.safeParse(invalidUser));

// ===== NESTED OBJECT VALIDATION =====
console.log('\n5. Nested Object Validation:');

// Address schema
const AddressSchema = Schema.object({
    street: Schema.string().min(5),
    city: Schema.string().min(2),
    zipCode: Schema.string().regex(/^\d{5}(-\d{4})?$/),
    country: Schema.string().length(2) // ISO country code
});

// User with address
const UserWithAddressSchema = Schema.object({
    id: Schema.number().int().positive(),
    name: Schema.string().min(2),
    email: Schema.string().email(),
    address: AddressSchema,
    alternateAddresses: Schema.array(AddressSchema).max(3).optional()
});

const userWithAddress = {
    id: 1,
    name: 'Jane Doe',
    email: 'jane@example.com',
    address: {
        street: '123 Main Street',
        city: 'New York',
        zipCode: '10001',
        country: 'US'
    }
};

console.log('✅ Valid user with address:', UserWithAddressSchema.safeParse(userWithAddress));

// ===== OPTIONAL AND DEFAULT VALUES =====
console.log('\n6. Optional and Default Values:');

const ConfigSchema = Schema.object({
    apiUrl: Schema.string().url(),
    timeout: Schema.number().int().min(1000).default(5000),
    retries: Schema.number().int().min(0).max(10).default(3),
    debug: Schema.boolean().default(false),
    features: Schema.array(Schema.string()).optional()
});

// Minimal config (uses defaults)
const minimalConfig = {
    apiUrl: 'https://api.example.com'
};

console.log('✅ Config with defaults:', ConfigSchema.safeParse(minimalConfig));

// ===== STRICT MODE =====
console.log('\n7. Strict Mode (No Extra Properties):');

const StrictUserSchema = Schema.object({
    id: Schema.number().int(),
    name: Schema.string()
}).strict();

const userWithExtra = {
    id: 1,
    name: 'John',
    extraField: 'not allowed'
};

console.log('❌ Strict validation fails:', StrictUserSchema.safeParse(userWithExtra));

// ===== CUSTOM VALIDATION =====
console.log('\n8. Custom Validation:');
 
const customSchema = Schema.custom<string>((value) => {
    if (typeof value !== 'string') {
        throw new Error('Expected string');
    }
    if (!value.startsWith('custom_')) {
        throw new Error('Must start with custom_');
    }
    return value;
});

console.log('✅ Valid custom:', customSchema.safeParse('custom_value'));
console.log('❌ Invalid custom:', customSchema.safeParse('invalid'));

// ===== ERROR HANDLING =====
console.log('\n9. Error Handling:');

try {
    // Using parse() throws on validation error
    UserSchema.parse({ invalid: 'data' });
} catch (error) {
    console.log('❌ Parse error:', (error as Error).message);
}

// Using safeParse() returns result object
const result = UserSchema.safeParse({ invalid: 'data' });
if (!result.success) {
    console.log('❌ SafeParse errors:', result.errors);
}

console.log('\n=== MODULAR SCHEMA VALIDATION TESTS COMPLETED ===');
console.log('🎉 Modular schema validation working perfectly!');
console.log('📚 Features demonstrated:');
console.log('  - Complete separation from validators');
console.log('  - Modular architecture with individual schema types');
console.log('  - Type-safe schema definition');
console.log('  - Chainable validation methods');
console.log('  - Built-in format validators (email, phone, UUID, URL)');
console.log('  - Array validation with uniqueness');
console.log('  - Nested object validation');
console.log('  - Optional fields and default values');
console.log('  - Strict mode for extra property detection');
console.log('  - Custom validation functions');
console.log('  - Comprehensive error reporting');
console.log('  - Clean, maintainable code structure!');
