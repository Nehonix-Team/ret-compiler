import { ValidationStats } from "../../../../types/extension.type";
import { SchemaInterface } from "../../../../types/SchemaValidator.type";
import { ValidationEngine } from "../../mods";

/**
 * Stream validator for continuous data validation
 */
export class StreamValidator {
    private validListeners: Array<(data: any) => void> = [];
    private invalidListeners: Array<(data: any, errors: Record<string, string[]>) => void> = [];
    private statsListeners: Array<(stats: ValidationStats) => void> = [];

    private stats: ValidationStats = {
        totalValidated: 0,
        validCount: 0,
        invalidCount: 0,
        errorRate: 0,
        startTime: new Date()
    };

    constructor(private schema: SchemaInterface) {}

    /**
     * Validate streaming data
     */
    validate(data: any): void {
        this.stats.totalValidated++;

        // Use modular validation engine
        const validationResult = ValidationEngine.validateObject(this.schema, data);

        if (validationResult.isValid) {
            this.stats.validCount++;
            this.validListeners.forEach(listener => listener(data));
        } else {
            this.stats.invalidCount++;
            this.invalidListeners.forEach(listener => listener(data, validationResult.errors));
        }

        this.updateStats();
    }

    /**
     * Listen for valid data
     */
    onValid(listener: (data: any) => void): void {
        this.validListeners.push(listener);
    }

    /**
     * Listen for invalid data
     */
    onInvalid(listener: (data: any, errors: Record<string, string[]>) => void): void {
        this.invalidListeners.push(listener);
    }

    /**
     * Listen for validation statistics
     */
    onStats(listener: (stats: ValidationStats) => void): void {
        this.statsListeners.push(listener);
    }

    /**
     * Get current validation statistics
     */
    getStats(): ValidationStats {
        return { ...this.stats };
    }



    private updateStats(): void {
        this.stats.errorRate = this.stats.totalValidated > 0
            ? this.stats.invalidCount / this.stats.totalValidated
            : 0;

        this.statsListeners.forEach(listener => listener(this.stats));
    }
}