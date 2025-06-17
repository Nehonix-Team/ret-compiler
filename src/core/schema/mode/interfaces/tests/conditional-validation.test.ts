/**
 * Comprehensive tests for conditional validation implementation
 */

import { InterfaceSchema } from "../InterfaceSchema";
import { When } from "../../../extensions/components/ConditionalValidation/When";

describe("Conditional Validation Implementation", () => {
  describe("Revolutionary *? Syntax", () => {
    it("should validate when condition *? then : else syntax", () => {
      const schema = new InterfaceSchema({
        role: "string",
        permissions: "when role=admin *? string[] : string[]?",
      });

      // Admin should require permissions array
      const adminResult = schema.validate({
        role: "admin",
        permissions: ["read", "write"],
      });
      expect(adminResult.success).toBe(true);

      // Non-admin can have optional permissions
      const userResult = schema.validate({
        role: "user",
        permissions: undefined,
      });
      expect(userResult.success).toBe(true);

      // Admin without permissions should fail
      const adminNoPermResult = schema.validate({
        role: "admin",
        permissions: undefined,
      });
      expect(adminNoPermResult.success).toBe(false);
    });

    it("should handle numeric conditions with *? syntax", () => {
      const schema = new InterfaceSchema({
        age: "number",
        drinkType: "when age>=21 *? string : =water",
      });

      // Adult can have any drink
      const adultResult = schema.validate({
        age: 25,
        drinkType: "beer",
      });
      expect(adultResult.success).toBe(true);

      // Minor must have water
      const minorResult = schema.validate({
        age: 18,
        drinkType: "water",
      });
      expect(minorResult.success).toBe(true);

      // Minor with alcohol should fail
      const minorAlcoholResult = schema.validate({
        age: 18,
        drinkType: "beer",
      });
      expect(minorAlcoholResult.success).toBe(false);
    });
  });

  describe("Parentheses Syntax", () => {
    it("should validate when(condition) then(schema) else(schema) syntax", () => {
      const schema = new InterfaceSchema({
        userType: "string",
        accessLevel: "when(userType=premium) then(number) else(=1)",
      });

      // Premium user can have any access level
      const premiumResult = schema.validate({
        userType: "premium",
        accessLevel: 5,
      });
      expect(premiumResult.success).toBe(true);

      // Regular user must have access level 1
      const regularResult = schema.validate({
        userType: "regular",
        accessLevel: 1,
      });
      expect(regularResult.success).toBe(true);

      // Regular user with higher access should fail
      const regularHighResult = schema.validate({
        userType: "regular",
        accessLevel: 5,
      });
      expect(regularHighResult.success).toBe(false);
    });
  });

  describe("When Builder API", () => {
    it("should validate using When.field() builder", () => {
      const schema = new InterfaceSchema({
        status: "string",
        details: When.field("status").is("active").then("string").else("string?"),
      });

      // Active status requires details
      const activeResult = schema.validate({
        status: "active",
        details: "System is running",
      });
      expect(activeResult.success).toBe(true);

      // Inactive status can have optional details
      const inactiveResult = schema.validate({
        status: "inactive",
        details: undefined,
      });
      expect(inactiveResult.success).toBe(true);

      // Active without details should fail
      const activeNoDetailsResult = schema.validate({
        status: "active",
        details: undefined,
      });
      expect(activeNoDetailsResult.success).toBe(false);
    });

    it("should handle complex conditions with When builder", () => {
      const schema = new InterfaceSchema({
        category: "string",
        price: "number",
        discount: When.field("category")
          .in(["electronics", "books"])
          .then("number")
          .else("number?"),
      });

      // Electronics should have discount
      const electronicsResult = schema.validate({
        category: "electronics",
        price: 100,
        discount: 10,
      });
      expect(electronicsResult.success).toBe(true);

      // Clothing can have optional discount
      const clothingResult = schema.validate({
        category: "clothing",
        price: 50,
        discount: undefined,
      });
      expect(clothingResult.success).toBe(true);
    });
  });

  describe("Advanced Operators", () => {
    it("should handle exists/!exists operators", () => {
      const schema = new InterfaceSchema({
        email: "string?",
        notifications: "when email.exists *? boolean : =false",
      });

      // With email, notifications can be boolean
      const withEmailResult = schema.validate({
        email: "user@example.com",
        notifications: true,
      });
      expect(withEmailResult.success).toBe(true);

      // Without email, notifications must be false
      const withoutEmailResult = schema.validate({
        email: undefined,
        notifications: false,
      });
      expect(withoutEmailResult.success).toBe(true);
    });

    it("should handle string operators (startsWith, contains)", () => {
      const schema = new InterfaceSchema({
        filename: "string",
        compression: "when filename.endsWith(.zip) *? =high : =none",
      });

      // ZIP files should have high compression
      const zipResult = schema.validate({
        filename: "archive.zip",
        compression: "high",
      });
      expect(zipResult.success).toBe(true);

      // Other files should have no compression
      const txtResult = schema.validate({
        filename: "document.txt",
        compression: "none",
      });
      expect(txtResult.success).toBe(true);
    });
  });

  describe("Error Handling", () => {
    it("should provide meaningful error messages for conditional validation failures", () => {
      const schema = new InterfaceSchema({
        role: "string",
        permissions: "when role=admin *? string[] : string[]?",
      });

      const result = schema.validate({
        role: "admin",
        permissions: "invalid",
      });

      expect(result.success).toBe(false);
      expect(result.errors).toContain(
        expect.stringMatching(/permissions.*Expected array/)
      );
    });

    it("should handle invalid conditional syntax gracefully", () => {
      const schema = new InterfaceSchema({
        field: "when invalid syntax",
      });

      const result = schema.validate({
        field: "value",
      });

      // Should fall back to basic validation or provide clear error
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe("Performance and Edge Cases", () => {
    it("should handle nested conditional validation", () => {
      const schema = new InterfaceSchema({
        userType: "string",
        subscription: "string?",
        features: "when userType=premium *? string[] : when subscription.exists *? string[] : string[]?",
      });

      // Premium user should have features
      const premiumResult = schema.validate({
        userType: "premium",
        subscription: undefined,
        features: ["advanced", "priority"],
      });
      expect(premiumResult.success).toBe(true);
    });

    it("should validate conditional fields without full data context", () => {
      const schema = new InterfaceSchema({
        conditionalField: When.field("otherField").is("value").then("string").else("number"),
      });

      // Should handle gracefully when dependent field is missing
      const result = schema.validate({
        conditionalField: "test",
      });

      // Should either pass with warning or provide clear error
      expect(result.warnings.length > 0 || result.errors.length > 0).toBe(true);
    });
  });
});
