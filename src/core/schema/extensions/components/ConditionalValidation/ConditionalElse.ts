import { ConditionalBuilder } from "./ConditionalBuilder";

// Type helper to infer field types from schema strings
type InferFieldType<T extends string> =
    T extends "string" ? string :
    T extends "string?" ? string | undefined :
    T extends "number" ? number :
    T extends "number?" ? number | undefined :
    T extends "boolean" ? boolean :
    T extends "boolean?" ? boolean | undefined :
    T extends "string[]" ? string[] :
    T extends "string[]?" ? string[] | undefined :
    T extends "number[]" ? number[] :
    T extends "number[]?" ? number[] | undefined :
    T extends "boolean[]" ? boolean[] :
    T extends "boolean[]?" ? boolean[] | undefined :
    T extends `${string}|${string}` ? string :
    any;

// Type-safe conditional result with proper inference
type ConditionalResult<TThen extends string, TElse extends string> = {
    __conditional: true;
    __inferredType: InferFieldType<TThen> | InferFieldType<TElse>;
};

/**
 * Builder for the "else" part of conditional validation with TypeScript inference
 * This class is returned after calling .then() and provides the .else() method
 */
export class ConditionalElse<TThen extends string = string> {
    constructor(
        private builder: ConditionalBuilder,
        private condition: (value: any) => boolean,
        private thenSchema: TThen
    ) {}

    /**
     * Specify the schema to use when the condition is false
     */
    else<TElse extends string>(elseSchema: TElse): ConditionalResult<TThen, TElse> {
        // Add the condition with the "then" schema
        this.builder.addCondition(this.condition, this.thenSchema);

        // Set the default schema (used when condition is false)
        const result = this.builder.default(elseSchema);

        // Return with type information for TypeScript inference
        return result as ConditionalResult<TThen, TElse>;
    }

    /**
     * Alias for else() - for backward compatibility
     */
    default<TElse extends string>(defaultSchema: TElse): ConditionalResult<TThen, TElse> {
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
