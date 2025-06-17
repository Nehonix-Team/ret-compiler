import { MultiConditionalBuilder } from "./MultiConditionalBuilder";

/**
 * Builder for multi-field "then" part
 */
export class MultiConditionalThen {
    constructor(
        private builder: MultiConditionalBuilder,
        private conditions: Record<string, any>
    ) {}

    then(schema: any): MultiConditionalElse {
        return new MultiConditionalElse(schema, null);
    }
}




/**
 * Builder for multi-field "else" part
 */
export class MultiConditionalElse {
    constructor(
        private thenSchema: any,
        private elseSchema: any
    ) {}

    else(schema: any): any {
        return {
            __multiConditional: true,
            then: this.thenSchema,
            else: schema
        };
    }
}

/**
 * Custom validator builder
 */
export class CustomValidator {
    constructor(private validator: (data: any) => { valid: true } | { error: string }) {}

    build(): any {
        return {
            __customValidator: true,
            validator: this.validator
        };
    }
}
