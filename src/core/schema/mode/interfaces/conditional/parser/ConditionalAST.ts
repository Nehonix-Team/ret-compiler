/**
 * Abstract Syntax Tree definitions for conditional expressions
 *  
 * Provides a structured representation of parsed conditional syntax
 * that can be efficiently evaluated and analyzed.
 */

import { 
  ASTNode, 
  ASTNodeType, 
  ConditionalNode, 
  LogicalExpressionNode,
  ComparisonNode,
  MethodCallNode,
  FieldAccessNode,
  LiteralNode,
  ConstantNode,
  ArrayNode,
  TokenType 
} from '../types/ConditionalTypes';

/**
 * AST Builder - Factory for creating AST nodes
 */
export class ASTBuilder {
  
  /**
   * Create a conditional node
   */
  static createConditional(
    condition: ConditionalNode['condition'],
    thenValue: ConditionalNode['thenValue'],
    elseValue?: ConditionalNode['elseValue'],
    position: number = 0
  ): ConditionalNode {
    return {
      type: ASTNodeType.CONDITIONAL,
      condition,
      thenValue,
      elseValue,
      position
    };
  }

  /**
   * Create a logical expression node (AND/OR)
   */
  static createLogicalExpression(
    operator: 'AND' | 'OR',
    left: LogicalExpressionNode['left'],
    right: LogicalExpressionNode['right'],
    position: number = 0
  ): LogicalExpressionNode {
    return {
      type: ASTNodeType.LOGICAL_EXPRESSION,
      operator,
      left,
      right,
      position
    };
  }

  /**
   * Create a comparison node
   */
  static createComparison(
    operator: TokenType,
    left: FieldAccessNode,
    right: LiteralNode,
    position: number = 0
  ): ComparisonNode {
    return {
      type: ASTNodeType.COMPARISON,
      operator,
      left,
      right,
      position
    };
  }

  /**
   * Create a method call node
   */
  static createMethodCall(
    method: TokenType,
    field: FieldAccessNode,
    args?: LiteralNode[],
    position: number = 0
  ): MethodCallNode {
    return {
      type: ASTNodeType.METHOD_CALL,
      method,
      field,
      arguments: args,
      position
    };
  }

  /**
   * Create a field access node
   */
  static createFieldAccess(
    path: string[],
    position: number = 0
  ): FieldAccessNode {
    return {
      type: ASTNodeType.FIELD_ACCESS,
      path,
      position
    };
  }

  /**
   * Create a literal node
   */
  static createLiteral(
    value: string | number | boolean,
    dataType: 'string' | 'number' | 'boolean',
    position: number = 0
  ): LiteralNode {
    return {
      type: ASTNodeType.LITERAL,
      value,
      dataType,
      position
    };
  }

  /**
   * Create a constant node
   */
  static createConstant(
    value: string,
    position: number = 0
  ): ConstantNode {
    return {
      type: ASTNodeType.CONSTANT,
      value,
      position
    };
  }

  /**
   * Create an array node
   */
  static createArray(
    elements: LiteralNode[],
    position: number = 0
  ): ArrayNode {
    return {
      type: ASTNodeType.ARRAY,
      elements,
      position
    };
  }
}

/**
 * AST Visitor pattern for traversing and analyzing AST
 */
export interface ASTVisitor<T> {
  visitConditional(node: ConditionalNode): T;
  visitLogicalExpression(node: LogicalExpressionNode): T;
  visitComparison(node: ComparisonNode): T;
  visitMethodCall(node: MethodCallNode): T;
  visitFieldAccess(node: FieldAccessNode): T;
  visitLiteral(node: LiteralNode): T;
  visitConstant(node: ConstantNode): T;
  visitArray(node: ArrayNode): T;
}

/**
 * AST Walker - Traverses AST nodes using visitor pattern
 */
export class ASTWalker {
  
  static walk<T>(node: ASTNode, visitor: ASTVisitor<T>): T {
    switch (node.type) {
      case ASTNodeType.CONDITIONAL:
        return visitor.visitConditional(node as ConditionalNode);
      
      case ASTNodeType.LOGICAL_EXPRESSION:
        return visitor.visitLogicalExpression(node as LogicalExpressionNode);
      
      case ASTNodeType.COMPARISON:
        return visitor.visitComparison(node as ComparisonNode);
      
      case ASTNodeType.METHOD_CALL:
        return visitor.visitMethodCall(node as MethodCallNode);
      
      case ASTNodeType.FIELD_ACCESS:
        return visitor.visitFieldAccess(node as FieldAccessNode);
      
      case ASTNodeType.LITERAL:
        return visitor.visitLiteral(node as LiteralNode);
      
      case ASTNodeType.CONSTANT:
        return visitor.visitConstant(node as ConstantNode);
      
      case ASTNodeType.ARRAY:
        return visitor.visitArray(node as ArrayNode);
      
      default:
        throw new Error(`Unknown AST node type: ${(node as any).type}`);
    }
  }
}

/**
 * AST Analyzer - Provides analysis utilities for AST
 */
export class ASTAnalyzer {
  
  /**
   * Get all field references in the AST
   */
  static getFieldReferences(node: ASTNode): string[] {
    const fields: string[] = [];
    
    const visitor: ASTVisitor<void> = {
      visitConditional: (n) => {
        ASTWalker.walk(n.condition, visitor);
        ASTWalker.walk(n.thenValue, visitor);
        if (n.elseValue) ASTWalker.walk(n.elseValue, visitor);
      },
      
      visitLogicalExpression: (n) => {
        ASTWalker.walk(n.left, visitor);
        ASTWalker.walk(n.right, visitor);
      },
      
      visitComparison: (n) => {
        ASTWalker.walk(n.left, visitor);
        ASTWalker.walk(n.right, visitor);
      },
      
      visitMethodCall: (n) => {
        ASTWalker.walk(n.field, visitor);
        if (n.arguments) {
          n.arguments.forEach(arg => ASTWalker.walk(arg, visitor));
        }
      },
      
      visitFieldAccess: (n) => {
        fields.push(n.path.join('.'));
      },
      
      visitLiteral: () => {},
      visitConstant: () => {},
      visitArray: (n) => {
        n.elements.forEach(el => ASTWalker.walk(el, visitor));
      }
    };
    
    ASTWalker.walk(node, visitor);
    return [...new Set(fields)]; // Remove duplicates
  }

  /**
   * Get complexity score of the AST
   */
  static getComplexityScore(node: ASTNode): number {
    let score = 0;
    
    const visitor: ASTVisitor<number> = {
      visitConditional: (n) => {
        score += 2; // Base complexity for conditional
        score += ASTWalker.walk(n.condition, visitor);
        score += ASTWalker.walk(n.thenValue, visitor);
        if (n.elseValue) score += ASTWalker.walk(n.elseValue, visitor);
        return score;
      },
      
      visitLogicalExpression: (n) => {
        score += 1; // Logical operators add complexity
        score += ASTWalker.walk(n.left, visitor);
        score += ASTWalker.walk(n.right, visitor);
        return score;
      },
      
      visitComparison: (n) => {
        score += 1; // Simple comparison
        return score;
      },
      
      visitMethodCall: (n) => {
        score += 2; // Method calls are more complex
        if (n.arguments) score += n.arguments.length;
        return score;
      },
      
      visitFieldAccess: () => 0,
      visitLiteral: () => 0,
      visitConstant: () => 0,
      visitArray: (n) => n.elements.length * 0.5 // Arrays add some complexity
    };
    
    return ASTWalker.walk(node, visitor);
  }

  /**
   * Check if AST contains nested conditionals
   */
  static hasNestedConditionals(node: ASTNode): boolean {
    let hasNested = false;
    let depth = 0;
    
    const visitor: ASTVisitor<void> = {
      visitConditional: (n) => {
        depth++;
        if (depth > 1) hasNested = true;
        
        ASTWalker.walk(n.condition, visitor);
        ASTWalker.walk(n.thenValue, visitor);
        if (n.elseValue) ASTWalker.walk(n.elseValue, visitor);
        
        depth--;
      },
      
      visitLogicalExpression: (n) => {
        ASTWalker.walk(n.left, visitor);
        ASTWalker.walk(n.right, visitor);
      },
      
      visitComparison: (n) => {
        ASTWalker.walk(n.left, visitor);
        ASTWalker.walk(n.right, visitor);
      },
      
      visitMethodCall: (n) => {
        ASTWalker.walk(n.field, visitor);
        if (n.arguments) {
          n.arguments.forEach(arg => ASTWalker.walk(arg, visitor));
        }
      },
      
      visitFieldAccess: () => {},
      visitLiteral: () => {},
      visitConstant: () => {},
      visitArray: (n) => {
        n.elements.forEach(el => ASTWalker.walk(el, visitor));
      }
    };
    
    ASTWalker.walk(node, visitor);
    return hasNested;
  }

  /**
   * Validate AST structure
   */
  static validateAST(node: ASTNode): string[] {
    const errors: string[] = [];
    
    const visitor: ASTVisitor<void> = {
      visitConditional: (n) => {
        if (!n.condition) {
          errors.push('Conditional node missing condition');
        }
        if (!n.thenValue) {
          errors.push('Conditional node missing then value');
        }
        
        if (n.condition) ASTWalker.walk(n.condition, visitor);
        if (n.thenValue) ASTWalker.walk(n.thenValue, visitor);
        if (n.elseValue) ASTWalker.walk(n.elseValue, visitor);
      },
      
      visitLogicalExpression: (n) => {
        if (!n.left || !n.right) {
          errors.push('Logical expression missing operands');
        }
        if (!['AND', 'OR'].includes(n.operator)) {
          errors.push(`Invalid logical operator: ${n.operator}`);
        }
        
        if (n.left) ASTWalker.walk(n.left, visitor);
        if (n.right) ASTWalker.walk(n.right, visitor);
      },
      
      visitComparison: (n) => {
        if (!n.left || !n.right) {
          errors.push('Comparison missing operands');
        }
        
        if (n.left) ASTWalker.walk(n.left, visitor);
        if (n.right) ASTWalker.walk(n.right, visitor);
      },
      
      visitMethodCall: (n) => {
        if (!n.field) {
          errors.push('Method call missing field');
        }
        
        if (n.field) ASTWalker.walk(n.field, visitor);
        if (n.arguments) {
          n.arguments.forEach(arg => ASTWalker.walk(arg, visitor));
        }
      },
      
      visitFieldAccess: (n) => {
        if (!n.path || n.path.length === 0) {
          errors.push('Field access missing path');
        }
      },
      
      visitLiteral: (n) => {
        if (n.value === undefined || n.value === null) {
          errors.push('Literal node missing value');
        }
      },
      
      visitConstant: (n) => {
        if (!n.value) {
          errors.push('Constant node missing value');
        }
      },
      
      visitArray: (n) => {
        if (!n.elements) {
          errors.push('Array node missing elements');
        }
      }
    };
     
    ASTWalker.walk(node, visitor);
    return errors;
  }
}
