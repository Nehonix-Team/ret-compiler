/**
 * Tests for enhanced email validation with plus addressing support
 */

import { InterfaceSchema } from "../core/schema/mode/interfaces/InterfaceSchema";

describe("Email Validation with Plus Addressing", () => {
  const emailSchema = new InterfaceSchema({
    email: "email",
  });

  describe("Basic Email Validation", () => {
    it("should validate standard email addresses", () => {
      const validEmails = [
        "test@gmail.com",
        "user@example.org",
        "admin@company.co.uk",
        "support@domain.io",
      ];

      validEmails.forEach((email) => {
        const result = emailSchema.validate({ email });
        expect(result.success).toBe(true);
        expect(result.data.email).toBe(email);
      });
    });

    it("should reject invalid email addresses", () => {
      const invalidEmails = [
        "invalid-email",
        "@domain.com",
        "user@",
        "user..name@domain.com",
        ".user@domain.com",
        "user.@domain.com",
        "user@domain..com",
      ];

      invalidEmails.forEach((email) => {
        const result = emailSchema.validate({ email });
        expect(result.success).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Plus Addressing Support", () => {
    it("should validate emails with plus addressing", () => {
      const plusAddressingEmails = [
        "test+1@gmail.com",
        "test+newsletter@gmail.com",
        "user+shopping@example.org",
        "admin+alerts@company.co.uk",
        "support+tickets@domain.io",
        "test+multiple+tags@gmail.com",
        "user+123456@domain.com",
        "test+a@gmail.com", // Single character tag
      ];

      plusAddressingEmails.forEach((email) => {
        const result = emailSchema.validate({ email });
        expect(result.success).toBe(true);
        expect(result.data.email).toBe(email);
        expect(result.warnings).toContain(
          "email: Email uses plus addressing (alias detected)"
        );
      });
    });

    it("should handle edge cases in plus addressing", () => {
      // Empty tag should generate warning but still be valid
      const result = emailSchema.validate({ email: "test+@gmail.com" });
      expect(result.success).toBe(true);
      expect(result.warnings).toContain(
        "email: Email uses plus addressing (alias detected)"
      );
      expect(result.warnings).toContain("email: Empty tag in plus addressing");
    });

    it("should reject emails starting with plus sign", () => {
      const result = emailSchema.validate({ email: "+test@gmail.com" });
      expect(result.success).toBe(false);
      expect(result.errors).toContain(
        "email: Email local part cannot start with plus sign"
      );
    });

    it("should validate complex plus addressing scenarios", () => {
      const complexEmails = [
        "user.name+tag@domain.com",
        "first.last+newsletter@company.org",
        "test_user+123@example.co.uk",
        "admin-user+alerts@domain.io",
      ];

      complexEmails.forEach((email) => {
        const result = emailSchema.validate({ email });
        expect(result.success).toBe(true);
        expect(result.warnings).toContain(
          "email: Email uses plus addressing (alias detected)"
        );
      });
    });
  });

  describe("RFC 5322 Compliance", () => {
    it("should validate RFC 5322 compliant special characters", () => {
      const rfcCompliantEmails = [
        "test.email@domain.com",
        "test_email@domain.com",
        "test-email@domain.com",
        "test+tag@domain.com",
        "test.name+tag@domain.com",
      ];

      rfcCompliantEmails.forEach((email) => {
        const result = emailSchema.validate({ email });
        expect(result.success).toBe(true);
      });
    });

    it("should enforce length limits", () => {
      // Test email length limit (254 characters)
      const longEmail = "a".repeat(250) + "@domain.com";
      const result1 = emailSchema.validate({ email: longEmail });
      expect(result1.success).toBe(false);
      expect(result1.errors).toContain(
        "Email address is too long (max 254 characters)"
      );

      // Test local part length limit (64 characters)
      const longLocalPart = "a".repeat(65) + "@domain.com";
      const result2 = emailSchema.validate({ email: longLocalPart });
      expect(result2.success).toBe(false);
      expect(result2.errors).toContain(
        "Email local part is too long (max 64 characters)"
      );

      // Test domain length limit (253 characters)
      const longDomain = "user@" + "a".repeat(250) + ".com";
      const result3 = emailSchema.validate({ email: longDomain });
      expect(result3.success).toBe(false);
      expect(result3.errors).toContain(
        "Email domain is too long (max 253 characters)"
      );
    });

    it("should reject consecutive dots", () => {
      const consecutiveDotEmails = [
        "test..email@domain.com",
        "test@domain..com",
      ];

      consecutiveDotEmails.forEach((email) => {
        const result = emailSchema.validate({ email });
        expect(result.success).toBe(false);
        expect(
          result.errors.some((error) => error.includes("consecutive dots"))
        ).toBe(true);
      });
    });

    it("should reject emails with leading/trailing dots", () => {
      const dotEdgeEmails = [".test@domain.com", "test.@domain.com"];

      dotEdgeEmails.forEach((email) => {
        const result = emailSchema.validate({ email });
        expect(result.success).toBe(false);
        expect(result.errors).toContain(
          "Email local part cannot start or end with a dot"
        );
      });
    });
  });

  describe("Real-World Plus Addressing Examples", () => {
    it("should handle Gmail-style plus addressing", () => {
      const gmailExamples = [
        "john.doe+newsletters@gmail.com",
        "jane.smith+shopping@gmail.com",
        "user+github@gmail.com",
        "developer+stackoverflow@gmail.com",
      ];

      gmailExamples.forEach((email) => {
        const result = emailSchema.validate({ email });
        expect(result.success).toBe(true);
        expect(result.warnings).toContain(
          "Email uses plus addressing (alias detected)"
        );
      });
    });

    it("should handle business email plus addressing", () => {
      const businessExamples = [
        "support+tickets@company.com",
        "sales+leads@business.org",
        "admin+alerts@enterprise.co.uk",
        "info+contact@startup.io",
      ];

      businessExamples.forEach((email) => {
        const result = emailSchema.validate({ email });
        expect(result.success).toBe(true);
        expect(result.warnings).toContain(
          "Email uses plus addressing (alias detected)"
        );
      });
    });

    it("should handle numeric tags in plus addressing", () => {
      const numericTagExamples = [
        "user+1@domain.com",
        "test+123@example.org",
        "admin+2024@company.com",
        "support+001@business.io",
      ];

      numericTagExamples.forEach((email) => {
        const result = emailSchema.validate({ email });
        expect(result.success).toBe(true);
        expect(result.warnings).toContain(
          "Email uses plus addressing (alias detected)"
        );
      });
    });
  });

  describe("Integration with Schema Validation", () => {
    it("should work in complex schemas with conditional validation", () => {
      const userSchema = new InterfaceSchema({
        userType: "admin|user|guest",
        email: "email",
        notifications: "when email.exists *? boolean : =false",
      });

      const result = userSchema.validate({
        userType: "admin",
        email: "admin+alerts@company.com",
        notifications: true,
      });

      expect(result.success).toBe(true);
      expect(result.warnings).toContain(
        "Email uses plus addressing (alias detected)"
      );
    });

    it("should work with optional email fields", () => {
      const profileSchema = new InterfaceSchema({
        name: "string",
        email: "email?",
        backupEmail: "email?",
      });

      const result1 = profileSchema.validate({
        name: "John Doe",
        email: "john+personal@gmail.com",
        backupEmail: "john+work@company.com",
      });

      expect(result1.success).toBe(true);
      expect(
        result1.warnings.filter((w) => w.includes("plus addressing")).length
      ).toBe(2);

      const result2 = profileSchema.validate({
        name: "Jane Doe",
        email: undefined,
        backupEmail: undefined,
      });

      expect(result2.success).toBe(true);
      expect(result2.warnings.length).toBe(0);
    });
  });
});
