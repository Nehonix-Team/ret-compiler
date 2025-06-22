
export interface TypeDefinition {
  name: string;
  description: string;
  category: "basic" | "format" | "numeric" | "special" | "structural";
  examples: string[];
  supportsConstraints: boolean;
  supportsOptional: boolean;
  supportsArrays: boolean;
}
 
export interface OperatorDefinition {
    symbol: string;
    name: string;
    description: string;
    category: 'comparison' | 'logical' | 'conditional' | 'special';
    precedence: number;
    examples: string[];
}

export interface MethodDefinition {
    name: string;
    description: string;
    syntax: string;
    parameters: string[];
    returnType: string;
    examples: string[];
    supportsNegation: boolean;
}

export interface ConditionalKeyword {
    keyword: string;
    description: string;
    syntax: string;
    examples: string[];
}