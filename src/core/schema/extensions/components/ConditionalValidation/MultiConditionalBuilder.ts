import { MultiConditionalThen } from "./MultiConditionalThen";

/**
 * Builder for multi-field conditional validation
 */
export class MultiConditionalBuilder {
    private matchConditions: any = {};

    constructor(private fieldNames: string[]) {}

    match(conditions: Record<string, any>): MultiConditionalThen {
        this.matchConditions = conditions;
        return new MultiConditionalThen(this, conditions);
    }
}
  