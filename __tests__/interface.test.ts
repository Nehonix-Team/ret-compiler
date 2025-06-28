import { Interface, Make } from '../index';

describe('Interface Schema', () => {
  describe('Basic Types', () => {
    it('should validate string types', () => {
      const schema = Interface({
        name: 'string',
        bio: 'string?'
      });

      const result = schema.safeParse({
        name: 'John Doe'
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ name: 'John Doe' });
    });

    it('should validate number types', () => {
      const schema = Interface({
        age: 'number',
        score: 'number?'
      });

      const result = schema.safeParse({
        age: 25
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ age: 25 });
    });

    it('should validate boolean types', () => {
      const schema = Interface({
        active: 'boolean',
        verified: 'boolean?'
      });

      const result = schema.safeParse({
        active: true
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ active: true });
    });
  });

  describe('Format Validation', () => {
    it('should validate email format', () => {
      const schema = Interface({
        email: 'email'
      });

      const validResult = schema.safeParse({
        email: 'user@example.com'
      });

      const invalidResult = schema.safeParse({
        email: 'invalid-email'
      });

      expect(validResult.success).toBe(true);
      expect(invalidResult.success).toBe(false);
    });

    it('should validate URL format', () => {
      const schema = Interface({
        website: 'url'
      });

      const validResult = schema.safeParse({
        website: 'https://example.com'
      });

      const invalidResult = schema.safeParse({
        website: 'not-a-url'
      });

      expect(validResult.success).toBe(true);
      expect(invalidResult.success).toBe(false);
    });
  });

  describe('Array Types', () => {
    it('should validate string arrays', () => {
      const schema = Interface({
        tags: 'string[]',
        categories: 'string[]?'
      });

      const result = schema.safeParse({
        tags: ['javascript', 'typescript']
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        tags: ['javascript', 'typescript']
      });
    });

    it('should validate number arrays', () => {
      const schema = Interface({
        scores: 'number[]'
      });

      const result = schema.safeParse({
        scores: [85, 92, 78]
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        scores: [85, 92, 78]
      });
    });
  });

  describe('Safe Constants', () => {
    it('should validate constant values', () => {
      const schema = Interface({
        version: Make.const('1.0'),
        status: Make.const(200),
        enabled: Make.const(true)
      });

      const validResult = schema.safeParse({
        version: '1.0',
        status: 200,
        enabled: true
      });

      const invalidResult = schema.safeParse({
        version: '2.0', // Wrong version
        status: 200,
        enabled: true
      });

      expect(validResult.success).toBe(true);
      expect(invalidResult.success).toBe(false);
      expect(invalidResult.errors).toContain('version: Expected constant value 1.0, got 2.0');
    });
  });

  describe('Union Types', () => {
    it('should validate union values', () => {
      const schema = Interface({
        status: Make.union('pending', 'accepted', 'rejected'),
        priority: Make.union('low', 'medium', 'high')
      });

      const validResult = schema.safeParse({
        status: 'pending',
        priority: 'high'
      });

      const invalidResult = schema.safeParse({
        status: 'invalid_status',
        priority: 'high'
      });

      expect(validResult.success).toBe(true);
      expect(invalidResult.success).toBe(false);
      expect(invalidResult.errors[0]).toContain('Expected one of: pending, accepted, rejected');
    });

    it('should validate optional union values', () => {
      const schema = Interface({
        type: Make.unionOptional('standard', 'express', 'overnight')
      });

      const validResult = schema.safeParse({
        type: 'express'
      });

      const validEmptyResult = schema.safeParse({});

      expect(validResult.success).toBe(true);
      expect(validEmptyResult.success).toBe(true);
    });
  });

  describe('Nested Objects', () => {
    it('should validate nested objects', () => {
      const schema = Interface({
        user: {
          name: 'string',
          email: 'email',
          profile: {
            bio: 'string?',
            avatar: 'url?'
          }
        }
      });

      const result = schema.safeParse({
        user: {
          name: 'John Doe',
          email: 'john@example.com',
          profile: {
            bio: 'Software developer'
          }
        }
      });

      expect(result.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should provide detailed error messages', () => {
      const schema = Interface({
        id: 'number',
        email: 'email',
        status: Make.union('active', 'inactive')
      });

      const result = schema.safeParse({
        id: 'not-a-number',
        email: 'invalid-email',
        status: 'invalid-status'
      });

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(3);
      expect(result.errors[0]).toContain('id: Expected number');
      expect(result.errors[1]).toContain('email: Invalid email format');
      expect(result.errors[2]).toContain('status: Expected one of: active, inactive');
    });
  });

  describe('Strict Mode', () => {
    it('should reject extra properties in strict mode', () => {
      const schema = Interface({
        id: 'number',
        name: 'string'
      }).strict();

      const result = schema.safeParse({
        id: 1,
        name: 'John',
        extraField: 'not allowed'
      });

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('Unexpected properties: extraField');
    });
  });
});
