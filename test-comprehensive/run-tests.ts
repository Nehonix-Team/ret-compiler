#!/usr/bin/env bun
/**
 * Test runner for generated ReliantType schemas
 * Run with: bun run test-comprehensive/run-tests.ts
 */

console.log('🧪 Testing Generated ReliantType Schemas\n');

// Import generated schemas
import { AllFormatTypesSchema } from './all-format-types';
import { LiteralValuesSchema } from './test-literals';
import { RegexPatternsSchema } from './test-regex';
import { ArrayConstraintsSchema } from './test-array-constraints';

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error}`);
    failed++;
  }
}

// Test 1: Literal Values
test('Literal Values - Correct values', () => {
  const result = LiteralValuesSchema.safeParse({
    role: 'admin',
    environment: 'production',
    version: 1,
    apiVersion: 2,
    isEnabled: true,
    isLegacy: false
  });
  if (!result.success) throw new Error('Should accept correct literal values');
});

test('Literal Values - Wrong value should fail', () => {
  const result = LiteralValuesSchema.safeParse({
    role: 'user', // Wrong! Should be 'admin'
    environment: 'production',
    version: 1,
    apiVersion: 2,
    isEnabled: true,
    isLegacy: false
  });
  if (result.success) throw new Error('Should reject wrong literal value');
});

// Test 2: Regex Patterns
test('Regex Patterns - Valid zip code', () => {
  const result = RegexPatternsSchema.safeParse({
    zipCode: '12345',
    username: 'john_doe123',
    hexColor: '#FF5733',
    email: 'test@example.com'
  });
  if (!result.success) throw new Error('Should accept valid patterns');
});

test('Regex Patterns - Invalid zip code', () => {
  const result = RegexPatternsSchema.safeParse({
    zipCode: 'ABCDE', // Invalid!
    username: 'john_doe123',
    hexColor: '#FF5733',
    email: 'test@example.com'
  });
  if (result.success) throw new Error('Should reject invalid zip code');
});

// Test 3: Array Constraints
test('Array Constraints - Valid array sizes', () => {
  const result = ArrayConstraintsSchema.safeParse({
    tags: ['tag1'],
    categories: ['cat1', 'cat2'],
    scores: [1, 2, 3],
    permissions: ['read']
  });
  if (!result.success) throw new Error('Should accept valid array sizes');
});

test('Array Constraints - Too many categories', () => {
  const result = ArrayConstraintsSchema.safeParse({
    tags: ['tag1'],
    categories: Array(15).fill('cat'), // Too many! Max is 10
    scores: [1, 2, 3],
    permissions: ['read']
  });
  if (result.success) throw new Error('Should reject array exceeding max');
});

test('Array Constraints - Too few scores', () => {
  const result = ArrayConstraintsSchema.safeParse({
    tags: ['tag1'],
    categories: ['cat1'],
    scores: [1], // Too few! Min is 3
    permissions: ['read']
  });
  if (result.success) throw new Error('Should reject array below min');
});

// Test 4: Format Types
test('Format Types - Valid email', () => {
  const result = AllFormatTypesSchema.safeParse({
    name: 'John',
    age: 30,
    active: true,
    created: new Date(),
    data: {},
    obj: {},
    unknown: 'anything',
    email: 'test@example.com',
    website: 'https://example.com',
    id: '550e8400-e29b-41d4-a716-446655440000',
    mobile: '+1234567890',
    server: '192.168.1.1',
    config: '{"key":"value"}',
    color: '#FF5733',
    encoded: 'SGVsbG8=',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.Et9HFtf9R3GEMA0IICOfFMVXY7kkTX1wr4qCyhIf58U',
    version: '1.0.0',
    urlSlug: 'my-slug',
    description: 'A description',
    userPass: 'Password123!',
    username: 'john_doe',
    count: 42,
    positiveNum: 100,
    negativeNum: -50,
    floatNum: 3.14,
    doubleNum: 2.718,
    integerNum: 999,
    metadata: { key: 'value' },
    headers: { 'Content-Type': 'application/json' },
    counts: { users: 100 }
  });
  if (!result.success) {
    console.log('Errors:', result.errors);
    throw new Error('Should accept valid format types');
  }
});

test('Format Types - Invalid email', () => {
  const result = AllFormatTypesSchema.safeParse({
    name: 'John',
    age: 30,
    active: true,
    created: new Date(),
    data: {},
    obj: {},
    unknown: 'anything',
    email: 'not-an-email', // Invalid!
    website: 'https://example.com',
    id: '550e8400-e29b-41d4-a716-446655440000',
    mobile: '+1234567890',
    server: '192.168.1.1',
    config: '{"key":"value"}',
    color: '#FF5733',
    encoded: 'SGVsbG8=',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.Et9HFtf9R3GEMA0IICOfFMVXY7kkTX1wr4qCyhIf58U',
    version: '1.0.0',
    urlSlug: 'my-slug',
    description: 'A description',
    userPass: 'Password123!',
    username: 'john_doe',
    count: 42,
    positiveNum: 100,
    negativeNum: -50,
    floatNum: 3.14,
    doubleNum: 2.718,
    integerNum: 999,
    metadata: { key: 'value' },
    headers: { 'Content-Type': 'application/json' },
    counts: { users: 100 }
  });
  if (result.success) throw new Error('Should reject invalid email');
});

// Summary
console.log(`\n📊 Test Results:`);
console.log(`   ✅ Passed: ${passed}`);
console.log(`   ❌ Failed: ${failed}`);
console.log(`   📈 Total: ${passed + failed}`);

if (failed > 0) {
  console.log(`\n❌ Some tests failed!`);
  process.exit(1);
} else {
  console.log(`\n🎉 All tests passed!`);
  process.exit(0);
}
