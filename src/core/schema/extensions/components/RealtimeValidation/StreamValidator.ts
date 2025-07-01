import { ValidationStats } from "../../../../types/extension.type";
import { SchemaInterface } from "../../../../types/SchemaValidator.type";
import { ValidationEngine } from "../../mods";

/**
 * Enhanced Stream Validator with full EventEmitter-like interface
 * Supports all standard stream methods (.on, .emit, .pipe, etc.)
 * Synchronized with InterfaceSchema modules
 */
export class StreamValidator {
  private validListeners: Array<(data: any) => void> = [];
  private invalidListeners: Array<
    (data: any, errors: Record<string, string[]>) => void
  > = [];
  private statsListeners: Array<(stats: ValidationStats) => void> = [];

  // Enhanced event system
  private eventListeners: Map<string, Array<(...args: any[]) => void>> =
    new Map();
  private onceListeners: Map<string, Array<(...args: any[]) => void>> =
    new Map();

  // Stream control
  private isPaused: boolean = false;
  private isDestroyed: boolean = false;
  private dataQueue: any[] = [];

  // Data transformation pipeline
  private transformers: Array<(data: any) => any> = [];
  private filters: Array<(data: any) => boolean> = [];
  private mappers: Array<(data: any) => any> = [];

  private stats: ValidationStats = {
    totalValidated: 0,
    validCount: 0,
    invalidCount: 0,
    errorRate: 0,
    startTime: new Date(),
  };

  constructor(private schema: SchemaInterface) {}

  // =================================================================
  // CORE EVENT EMITTER METHODS
  // =================================================================

  /**
   * Generic event listener (EventEmitter-like interface)
   */
  on(event: string, listener: (...args: any[]) => void): this {
    if (this.isDestroyed) throw new Error("StreamValidator is destroyed");

    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
    return this;
  }

  /**
   * One-time event listener
   */
  once(event: string, listener: (...args: any[]) => void): this {
    if (this.isDestroyed) throw new Error("StreamValidator is destroyed");

    if (!this.onceListeners.has(event)) {
      this.onceListeners.set(event, []);
    }
    this.onceListeners.get(event)!.push(listener);
    return this;
  }

  /**
   * Remove event listener
   */
  off(event: string, listener?: (...args: any[]) => void): this {
    if (listener) {
      // Remove specific listener
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        const index = listeners.indexOf(listener);
        if (index > -1) listeners.splice(index, 1);
      }

      const onceListeners = this.onceListeners.get(event);
      if (onceListeners) {
        const index = onceListeners.indexOf(listener);
        if (index > -1) onceListeners.splice(index, 1);
      }
    } else {
      // Remove all listeners for event
      this.eventListeners.delete(event);
      this.onceListeners.delete(event);
    }
    return this;
  }

  /**
   * Emit event to all listeners
   */
  emit(event: string, ...args: any[]): boolean {
    if (this.isDestroyed) return false;

    let hasListeners = false;

    // Regular listeners
    const listeners = this.eventListeners.get(event);
    if (listeners && listeners.length > 0) {
      hasListeners = true;
      listeners.forEach((listener) => {
        try {
          listener(...args);
        } catch (error) {
          this.emit("error", error);
        }
      });
    }

    // Once listeners
    const onceListeners = this.onceListeners.get(event);
    if (onceListeners && onceListeners.length > 0) {
      hasListeners = true;
      onceListeners.forEach((listener) => {
        try {
          listener(...args);
        } catch (error) {
          this.emit("error", error);
        }
      });
      this.onceListeners.delete(event); // Clear once listeners
    }

    return hasListeners;
  }

  // =================================================================
  // ENHANCED VALIDATION WITH STREAM CONTROL
  // =================================================================

  /**
   * Enhanced validate method with stream control and InterfaceSchema sync
   */
  validate(data: any): void {
    if (this.isDestroyed) {
      this.emit("error", new Error("Cannot validate on destroyed stream"));
      return;
    }

    if (this.isPaused) {
      this.dataQueue.push(data);
      this.emit("queued", data);
      return;
    }

    this._processData(data);
  }

  private _processData(data: any): void {
    this.stats.totalValidated++;
    this.emit("data", data);

    try {
      // Apply data transformation pipeline
      let processedData = this._applyTransformations(data);

      // Apply filters
      if (!this._passesFilters(processedData)) {
        this.emit("filtered", processedData);
        return;
      }

      // FIXED: Use InterfaceSchema.safeParse for proper validation sync
      let validationResult;
      if (typeof this.schema.safeParse === "function") {
        // Use InterfaceSchema validation
        const result = this.schema.safeParse(processedData);
        validationResult = {
          isValid: result.success,
          errors: result.success ? {} : this._formatErrors(result.errors),
        };
      } else {
        // Fallback to ValidationEngine
        validationResult = ValidationEngine.validateObject(
          this.schema,
          processedData
        );
      }

      if (validationResult.isValid) {
        this.stats.validCount++;
        this.validListeners.forEach((listener) => listener(processedData));
        this.emit("valid", processedData);
      } else {
        this.stats.invalidCount++;
        this.invalidListeners.forEach((listener) =>
          listener(processedData, validationResult.errors)
        );
        this.emit("invalid", processedData, validationResult.errors);
      }

      this.updateStats();
      this.emit("validated", processedData, validationResult);
    } catch (error) {
      this.emit("error", error);
    }
  }

  private _formatErrors(errors: any[]): Record<string, string[]> {
    const formatted: Record<string, string[]> = {};
    errors.forEach((error) => {
      const field = error.path || "unknown";
      if (!formatted[field]) formatted[field] = [];
      formatted[field].push(error.message || error.toString());
    });
    return formatted;
  }

  private _applyTransformations(data: any): any {
    let result = data;
    for (const transformer of this.transformers) {
      result = transformer(result);
    }
    for (const mapper of this.mappers) {
      result = mapper(result);
    }
    return result;
  }

  private _passesFilters(data: any): boolean {
    return this.filters.every((filter) => filter(data));
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
  onInvalid(
    listener: (data: any, errors: Record<string, string[]>) => void
  ): void {
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
    this.stats.errorRate =
      this.stats.totalValidated > 0
        ? this.stats.invalidCount / this.stats.totalValidated
        : 0;

    this.statsListeners.forEach((listener) => listener(this.stats));
  }

  // =================================================================
  // DATA TRANSFORMATION METHODS
  // =================================================================

  /**
   * Add data transformer to pipeline
   */
  transform(transformer: (data: any) => any): this {
    if (this.isDestroyed) throw new Error("StreamValidator is destroyed");
    this.transformers.push(transformer);
    return this;
  }

  /**
   * Add data filter to pipeline
   */
  filter(predicate: (data: any) => boolean): this {
    if (this.isDestroyed) throw new Error("StreamValidator is destroyed");
    this.filters.push(predicate);
    return this;
  }

  /**
   * Add data mapper to pipeline
   */
  map(mapper: (data: any) => any): this {
    if (this.isDestroyed) throw new Error("StreamValidator is destroyed");
    this.mappers.push(mapper);
    return this;
  }

  /**
   * Pipe data to another stream validator
   */
  pipe(destination: StreamValidator) {
    if (this.isDestroyed) throw new Error("StreamValidator is destroyed");

    this.on("valid", (data) => {
      destination.validate(data);
    });

    this.on("error", (error) => {
      destination.emit("error", error);
    });

    return destination; 
  } 

  // =================================================================
  // STREAM CONTROL METHODS
  // =================================================================

  /**
   * Pause the stream (queue incoming data)
   */
  pause(): this {
    this.isPaused = true;
    this.emit("pause");
    return this;
  }

  /**
   * Resume the stream (process queued data)
   */
  resume(): this {
    if (this.isDestroyed) throw new Error("StreamValidator is destroyed");

    this.isPaused = false;
    this.emit("resume");

    // Process queued data
    const queuedData = [...this.dataQueue];
    this.dataQueue = [];

    queuedData.forEach((data) => this._processData(data));

    return this;
  }

  /**
   * Destroy the stream (cleanup and prevent further use)
   */
  destroy(): this {
    if (this.isDestroyed) return this;

    this.isDestroyed = true;
    this.isPaused = false;

    // Clear all data
    this.dataQueue = [];
    this.transformers = [];
    this.filters = [];
    this.mappers = [];

    // Clear all listeners
    this.validListeners = [];
    this.invalidListeners = [];
    this.statsListeners = [];
    this.eventListeners.clear();
    this.onceListeners.clear();

    this.emit("destroy");
    return this;
  }

  /**
   * Check if stream is destroyed
   */
  get destroyed(): boolean {
    return this.isDestroyed;
  }

  /**
   * Check if stream is paused
   */
  get paused(): boolean {
    return this.isPaused;
  }

  /**
   * Get queue length
   */
  get queueLength(): number {
    return this.dataQueue.length;
  }
}
