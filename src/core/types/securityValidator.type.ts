export interface ValidationTimeout {
  timeoutMs: number;
}

export interface SecurityValidationOptions {
  timeout?: number;
  enableMetrics?: boolean;
  customPatterns?: RegExp[];
  bypassCache?: boolean;
}
