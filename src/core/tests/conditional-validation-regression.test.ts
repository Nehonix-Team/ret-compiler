/**
 * Conditional Validation Regression Tests
 * 
 * Comprehensive test suite to ensure all conditional validation features
 * work correctly and prevent regression bugs.
 */

import { Interface } from "../schema/mode/interfaces/Interface";

describe("Conditional Validation Regression Tests", () => {
  
  describe("Constraint Syntax in Conditionals", () => {
    const schema = Interface({
      accountType: "free|premium|enterprise",
      age: "int(13,120)",
      maxProjects: "when accountType=free *? int(1,3) : int(1,100)",
      storageLimit: "when accountType=premium *? int(100,) : int(10,50)",
      nameLength: "when accountType=enterprise *? string(10,100) : string(3,50)",
      discount: "when age>=65 *? number(0.1,0.3) : number(0,0.1)",
    });

    it("should validate free account with correct constraints", () => {
      const result = schema.safeParse({
        accountType: "free",
        age: 30,
        maxProjects: 2,
        storageLimit: 25,
        nameLength: "John",
        discount: 0.05,
      });
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.maxProjects).toBe(2);
        expect(result.data.storageLimit).toBe(25);
      }
    });

    it("should reject free account with invalid constraints", () => {
      const result = schema.safeParse({
        accountType: "free",
        age: 30,
        maxProjects: 5, // Too high for free (max 3)
        storageLimit: 60, // Too high for free (max 50)
        nameLength: "John",
        discount: 0.05,
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toContain("maxProjects: Integer must be at most 3");
        expect(result.errors).toContain("storageLimit: Integer must be at most 50");
      }
    });

    it("should validate premium account with correct constraints", () => {
      const result = schema.safeParse({
        accountType: "premium",
        age: 70,
        maxProjects: 50,
        storageLimit: 150, // Premium gets 100+
        nameLength: "John Doe",
        discount: 0.2, // Senior discount
      });
      
      expect(result.success).toBe(true);
    });
  });

  describe("Method Calls", () => {
    const schema = Interface({
      role: "admin|manager|user|guest",
      email: "email?",
      tags: "string[]?",
      permissions: "string[]?",
      elevatedAccess: "when role.in(admin,manager) *? =granted : =denied",
      notifications: "when email.exists *? =email : =none",
      premiumFeatures: "when tags.contains(premium) *? =enabled : =disabled",
      adminTools: "when permissions.contains(admin) *? =available : =restricted",
    });

    it("should grant elevated access to admin and manager", () => {
      const adminResult = schema.safeParse({
        role: "admin",
        email: "admin@test.com",
        tags: ["premium"],
        permissions: ["admin", "read"],
      });
      
      expect(adminResult.success).toBe(true);
      if (adminResult.success) {
        expect(adminResult.data.elevatedAccess).toBe("granted");
        expect(adminResult.data.adminTools).toBe("available");
      }

      const managerResult = schema.safeParse({
        role: "manager",
        email: "manager@test.com",
        tags: null,
        permissions: ["read", "write"],
      });
      
      expect(managerResult.success).toBe(true);
      if (managerResult.success) {
        expect(managerResult.data.elevatedAccess).toBe("granted");
        expect(managerResult.data.adminTools).toBe("restricted");
      }
    });

    it("should deny elevated access to user and guest", () => {
      const userResult = schema.safeParse({
        role: "user",
        email: null,
        tags: ["basic"],
        permissions: ["read"],
      });
      
      expect(userResult.success).toBe(true);
      if (userResult.success) {
        expect(userResult.data.elevatedAccess).toBe("denied");
        expect(userResult.data.notifications).toBe("none");
        expect(userResult.data.premiumFeatures).toBe("disabled");
      }
    });
  });

  describe("Logical Operators", () => {
    const schema = Interface({
      role: "admin|manager|user|guest",
      age: "int(13,120)",
      status: "active|inactive|pending",
      fullAccess: "when role=admin && age>=18 *? =granted : =denied",
      managerAccess: "when role=admin || role=manager *? =granted : =denied",
      specialFeatures: "when role.in(admin,manager) || age>=65 *? =enabled : =disabled",
    });

    it("should handle AND operator correctly", () => {
      // Adult admin should get full access
      const adultAdmin = schema.safeParse({
        role: "admin",
        age: 25,
        status: "active",
      });
      
      expect(adultAdmin.success).toBe(true);
      if (adultAdmin.success) {
        expect(adultAdmin.data.fullAccess).toBe("granted");
      }

      // Minor admin should be denied full access
      const minorAdmin = schema.safeParse({
        role: "admin",
        age: 16,
        status: "active",
      });
      
      expect(minorAdmin.success).toBe(true);
      if (minorAdmin.success) {
        expect(minorAdmin.data.fullAccess).toBe("denied");
      }
    });

    it("should handle OR operator correctly", () => {
      // Senior user should get special features
      const seniorUser = schema.safeParse({
        role: "user",
        age: 70,
        status: "active",
      });
      
      expect(seniorUser.success).toBe(true);
      if (seniorUser.success) {
        expect(seniorUser.data.specialFeatures).toBe("enabled");
        expect(seniorUser.data.managerAccess).toBe("denied");
      }
    });
  });

  describe("Nested Conditionals", () => {
    const schema = Interface({
      status: "active|inactive|pending",
      role: "admin|user|guest",
      level: "int(1,10)",
      access: "when status=active *? when role=admin *? =full : =limited : =none",
      features: "when status=active *? when role=admin *? when level>=5 *? =all : =admin : =user : =none",
    });

    it("should handle complex nested conditionals", () => {
      // Active admin with high level should get all features
      const result1 = schema.safeParse({
        status: "active",
        role: "admin",
        level: 8,
      });
      
      expect(result1.success).toBe(true);
      if (result1.success) {
        expect(result1.data.access).toBe("full");
        expect(result1.data.features).toBe("all");
      }

      // Active admin with low level should get admin features
      const result2 = schema.safeParse({
        status: "active",
        role: "admin",
        level: 3,
      });
      
      expect(result2.success).toBe(true);
      if (result2.success) {
        expect(result2.data.access).toBe("full");
        expect(result2.data.features).toBe("admin");
      }

      // Inactive admin should get no access
      const result3 = schema.safeParse({
        status: "inactive",
        role: "admin",
        level: 10,
      });
      
      expect(result3.success).toBe(true);
      if (result3.success) {
        expect(result3.data.access).toBe("none");
        expect(result3.data.features).toBe("none");
      }
    });
  });
});
