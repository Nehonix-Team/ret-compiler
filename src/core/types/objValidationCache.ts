import { SchemaValidationResult } from "./types";


export interface CachedValidation {
  result: SchemaValidationResult;
  structureHash: string;
  accessCount: number;
  lastAccessed: number; 
  validationTime: number;
}

export interface ValidationPath {
  path: string[];
  validator: (value: any) => SchemaValidationResult;
  isHotPath: boolean;
  avgValidationTime: number;
}
