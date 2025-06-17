import { ConditionalThen } from "./ConditionalThen";

/** 
 * Builder for single field conditional validation
 */
export class ConditionalBuilder {
    private conditions: Array<{
        condition: (value: any) => boolean;
        schema: any;
    }> = [];
    private defaultSchema: any = null;

    constructor(private fieldName: string) {}

    /**
     * Check if field equals specific value
     */
    is(value: any): ConditionalThen {
        return new ConditionalThen(this, (fieldValue) => fieldValue === value);
    }

    /**
     * Check if field does not equal specific value
     */
    isNot(value: any): ConditionalThen {
        return new ConditionalThen(this, (fieldValue) => fieldValue !== value);
    }

    /**
     * Check if field exists (not null/undefined)
     */
    exists(): ConditionalThen {
        return new ConditionalThen(this, (fieldValue) => fieldValue != null);
    }

    /**
     * Check if field matches pattern
     */
    matches(pattern: RegExp): ConditionalThen {
        return new ConditionalThen(this, (fieldValue) => 
            typeof fieldValue === "string" && pattern.test(fieldValue)
        );
    }

    /**
     * Check if field is in array of values
     */
    in(values: any[]): ConditionalThen {
        return new ConditionalThen(this, (fieldValue) => values.includes(fieldValue));
    }

    /**
     * Custom condition function
     */
    when(condition: (value: any) => boolean): ConditionalThen {
        return new ConditionalThen(this, condition);
    }

    addCondition(condition: (value: any) => boolean, schema: any): this {
        this.conditions.push({ condition, schema });
        return this;
    }

    default(schema: any): any {
        this.defaultSchema = schema;
        return this.build();
    }

    build(): any {
        // Return a special object that the validation engine can recognize
        return {
            __conditional: true,
            fieldName: this.fieldName,
            conditions: this.conditions,
            default: this.defaultSchema
        };
    }
}