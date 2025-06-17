import { ConditionalBuilder } from "./ConditionalBuilder";
import { ConditionalElse } from "./ConditionalElse";

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

/**
 * Builder for the "then" part of conditional validation with TypeScript inference
 */
export class ConditionalThen {
    constructor(
        private builder: ConditionalBuilder,
        private condition: (value: any) => boolean
    ) {}

    then<T extends string>(schema: T): ConditionalElse<T> {
        return new ConditionalElse(this.builder, this.condition, schema);
    }
}
