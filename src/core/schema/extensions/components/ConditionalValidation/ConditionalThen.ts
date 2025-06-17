import { ConditionalBuilder } from "./ConditionalBuilder";
import { ConditionalElse } from "./ConditionalElse";

/**
 * Builder for the "then" part of conditional validation
 */
export class ConditionalThen {
    constructor(
        private builder: ConditionalBuilder,
        private condition: (value: any) => boolean
    ) {}

    then(schema: any): ConditionalElse {
        return new ConditionalElse(this.builder, this.condition, schema);
    }
}
