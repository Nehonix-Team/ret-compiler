import { ConditionalBuilder } from "./ConditionalBuilder";

/**
 * Builder for the "else" part of conditional validation
 * This class is returned after calling .then() and provides the .else() method
 */
export class ConditionalElse {
    constructor(
        private builder: ConditionalBuilder,
        private condition: (value: any) => boolean,
        private thenSchema: any
    ) {}

    /**
     * Specify the schema to use when the condition is false
     */
    else(elseSchema: any): any {
        // Add the condition with the "then" schema
        this.builder.addCondition(this.condition, this.thenSchema);

        // Set the default schema (used when condition is false)
        return this.builder.default(elseSchema);
    }

    /**
     * Alias for else() - for backward compatibility
     */
    default(defaultSchema: any): any {
        return this.else(defaultSchema);
    }

    /**
     * Build without else clause (same as calling .else(undefined))
     */
    build(): any {
        this.builder.addCondition(this.condition, this.thenSchema);
        return this.builder.build();
    }
}
