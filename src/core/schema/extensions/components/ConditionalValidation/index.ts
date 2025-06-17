/**
 * Conditional Validation - Revolutionary dependent field validation
 *
 * This module provides powerful conditional validation where fields can depend
 * on other fields' values, making complex business logic validation simple.
 */

import { SchemaInterface } from "../../../mode/interfaces/Interface";
import { ConditionalBuilder } from "./ConditionalBuilder";
import { MultiConditionalBuilder } from "./MultiConditionalBuilder";
import { CustomValidator } from "./MultiConditionalThen";

/**
 * Conditional validation utilities
 */
export const When = {
    /**
     * Create conditional validation based on another field's value
     *
     * @example
     * ```typescript
     * const UserSchema = Interface({
     *   accountType: Make.union("free", "premium", "enterprise"),
     *   maxProjects: When.field("accountType").is("free").then("int(1,3)")
     *                   .is("premium").then("int(1,50)")
     *                   .is("enterprise").then("int(1,)")
     *                   .default("int(1,1)"),
     *
     *   paymentMethod: When.field("accountType").isNot("free").then("string").else("string?"),
     *   billingAddress: When.field("paymentMethod").exists().then({
     *     street: "string",
     *     city: "string",
     *     country: "string(2,2)"
     *   }).else("any?")
     * });
     * ```
     */
    field(fieldName: string): ConditionalBuilder {
        return new ConditionalBuilder(fieldName);
    },

    /**
     * Create validation that depends on multiple fields
     *
     * @example
     * ```typescript
     * const OrderSchema = Interface({
     *   orderType: Make.union("pickup", "delivery"),
     *   address: "string?",
     *   deliveryFee: "number?",
     *
     *   // Complex conditional validation
     *   ...When.fields(["orderType", "address"]).match({
     *     orderType: "delivery",
     *     address: (val) => val && val.length > 0
     *   }).then({
     *     deliveryFee: "number(0,)"  // Required for delivery with address
     *   }).else({
     *     deliveryFee: "number?"     // Optional otherwise
     *   })
     * });
     * ```
     */
    fields(fieldNames: string[]): MultiConditionalBuilder {
        return new MultiConditionalBuilder(fieldNames);
    },

    /**
     * Create custom validation logic
     *
     * @example
     * ```typescript
     * const EventSchema = Interface({
     *   startDate: "date",
     *   endDate: "date",
     *
     *   // Custom validation: endDate must be after startDate
     *   ...When.custom((data) => {
     *     if (data.endDate <= data.startDate) {
     *       return { error: "End date must be after start date" };
     *     }
     *     return { valid: true };
     *   })
     * });
     * ```
     */
    custom(validator: (data: any) => { valid: true } | { error: string }): CustomValidator {
        return new CustomValidator(validator);
    },

    // Note: Clean syntax like "when:role=admin:string:string?" is automatically
    // supported in Interface schemas without needing to import When utilities.
    // The syntax is parsed internally by the schema validation engine.
};




/**
 * Export all utilities
 */
export { ConditionalBuilder, MultiConditionalBuilder, CustomValidator };
export { ConditionalElse } from "./ConditionalElse";
export { ExtendBuilder, Extend } from "./Extend";
export default When;
