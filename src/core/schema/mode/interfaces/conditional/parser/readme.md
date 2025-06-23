# Fortify Schema Conditional Parser - Complete Guide

## Overview

The `ConditionalParser` is responsible for parsing conditional validation expressions in Fortify Schema into an Abstract Syntax Tree (AST). It handles complex syntax like:

```typescript
"when role=admin *? string[] : string[]?"
"when age > 18 AND status=active *? string(1,50) : string?"
```

## Architecture Flow

```
Input String → Lexer → Tokens → Parser → AST → Validation
```

## Class Structure

### Constructor & Configuration

```typescript
constructor(config: Partial<ParserConfig> = {})
```

**Purpose**: Initialize the parser with configuration options.

**Key Properties**:
- `tokens`: Array of tokens from the lexer
- `current`: Current position in the token array
- `errors`: Collection of parsing errors
- `config`: Parser configuration settings

**Default Config**:
```typescript
{
  allowNestedConditionals: true,  // Allow "when ... *? when ... *? ..."
  maxNestingDepth: 5,            // Maximum nesting levels
  strictMode: false,             // Strict parsing rules
  enableDebug: false             // Debug output
}
```

## Main Parsing Flow

### 1. `parse(input: string)` - Entry Point

```typescript
parse(input: string): { ast?: ConditionalNode; errors: ConditionalError[] }
```

**Steps**:
1. **Tokenize**: Uses `ConditionalLexer` to convert string to tokens
2. **Parse**: Calls `parseConditional()` to build AST
3. **Validate**: Checks for remaining tokens
4. **Return**: AST and any errors found

**Example Flow**:
```
Input: "when role=admin *? string[] : string[]?"
Tokens: [WHEN, IDENTIFIER(role), EQUALS, IDENTIFIER(admin), CONDITIONAL_THEN, ...]
AST: ConditionalNode with condition and values
```

### 2. `parseConditional()` - Core Logic

```typescript
private parseConditional(): ConditionalNode
```

**Purpose**: Parse the main conditional structure: `when condition *? thenValue : elseValue`

**Steps**:
1. **Expect "when"**: Must start with WHEN token
2. **Parse condition**: Call `parseCondition()` for the condition part
3. **Expect "*?"**: Must have CONDITIONAL_THEN token
4. **Parse then value**: What to return if condition is true
5. **Parse else value** (optional): What to return if condition is false

**AST Structure Created**:
```typescript
{
  type: "conditional",
  condition: ConditionNode,
  thenValue: ValueNode,
  elseValue?: ValueNode,
  position: number
}
```

## Condition Parsing (Left Side of *?)

### 3. `parseCondition()` - Condition Entry Point

Delegates to `parseLogicalOr()` to handle operator precedence.

### 4. `parseLogicalOr()` - Handle OR Operations

```typescript
private parseLogicalOr(): ConditionNode
```

**Purpose**: Parse expressions like `condition1 OR condition2 OR condition3`

**Logic**:
1. Parse left side with `parseLogicalAnd()`
2. While OR tokens exist:
   - Parse right side
   - Create LogicalExpressionNode
   - Continue chain

**Example**: `role=admin OR role=superuser`
```
Result: LogicalExpressionNode {
  operator: "OR",
  left: ComparisonNode(role=admin),
  right: ComparisonNode(role=superuser)
}
```

### 5. `parseLogicalAnd()` - Handle AND Operations

```typescript
private parseLogicalAnd(): ConditionNode
```

**Purpose**: Parse expressions like `condition1 AND condition2`

**Higher precedence than OR**, so `A OR B AND C` becomes `A OR (B AND C)`

### 6. `parseComparison()` - Handle Comparisons & Methods

```typescript
private parseComparison(): ConditionNode
```

**Most Complex Method** - Handles:
- **Parentheses**: `(role=admin OR role=user)`
- **Field access**: `user.profile.name`
- **Method calls**: `email.contains("@company.com")`
- **Comparisons**: `age > 18`, `status = "active"`

**Flow**:
1. **Check parentheses**: If `(`, parse grouped condition
2. **Parse field**: Get field path like `user.profile.name`
3. **Check for method**: If `.methodName`, parse method call
4. **Parse comparison**: Handle operators like `=`, `>`, `<`, etc.

## Field & Method Parsing

### 7. `parseFieldAccess()` - Parse Field Paths

```typescript
private parseFieldAccess(): FieldAccessNode
```

**Purpose**: Parse field paths like `user.profile.name`

**Logic**:
1. Start with identifier (field name)
2. While seeing `.identifier` (not method):
   - Add to path
3. Stop when hitting method name or end

**Result**: `FieldAccessNode { path: ["user", "profile", "name"] }`

### 8. `parseMethodCall()` - Parse Method Invocations

```typescript
private parseMethodCall(field: FieldAccessNode, position: number): MethodCallNode
```

**Purpose**: Parse method calls like `.exists`, `.contains("value")`, `.!empty`

**Supported Methods**:
- **No arguments**: `.exists`, `.empty`, `.null`
- **With arguments**: `.contains("text")`, `.in(["a", "b"])`
- **Negated**: `.!exists`, `.!empty`, `.!null`

**Special Handling**:
- Methods starting with `!` (negation)
- Methods without parentheses
- Argument parsing for parameterized methods

## Value Parsing (Right Side of *?)

### 9. `parseValue()` - Parse Return Values

```typescript
private parseValue(): ValueNode
```

**Purpose**: Parse what the conditional should return

**Handles**:
- **Nested conditionals**: `when ... *? when ... *? value : value : value`
- **Constants**: `=admin` (literal value)
- **Arrays**: `["value1", "value2"]`
- **Literals**: `"string"`, `42`, `true`

### 10. `parseArray()` - Parse Array Values

```typescript
private parseArray(position: number): ArrayNode
```

**Purpose**: Parse array literals like `["admin", "user", "guest"]`

**Logic**:
1. Expect `[`
2. Parse comma-separated literals
3. Expect `]`

### 11. `parseLiteral()` - Parse Basic Values

```typescript
private parseLiteral(): LiteralNode
```

**Purpose**: Parse primitive values and complex patterns

**Handles**:
- **Strings**: `"hello world"`
- **Numbers**: `42`, `3.14`
- **Booleans**: `true`, `false`
- **Complex patterns**: `.tmp`, `@(company|org|gov)`
- **Schema types**: `string[]`, `number(1,10)`

## Pattern Parsing

### 12. `parseComplexPattern()` - Handle Regex-like Patterns

```typescript
private parseComplexPattern(): LiteralNode
```

**Purpose**: Parse complex patterns like:
- `@(company|org|gov)` - Email domain patterns
- `(temp|disposable|10min)` - Choice patterns
- `^[A-Z]+$` - Regex patterns

**Logic**:
1. Track parentheses depth
2. Build pattern string token by token
3. Stop at conditional operators or balanced parentheses

### 13. `parseComparisonValue()` - Parse Right Side of Comparisons

```typescript
private parseComparisonValue(): LiteralNode
```

**Purpose**: Parse values used in comparisons, with special handling for patterns

**Special Cases**:
- Regex patterns
- Complex patterns with parentheses
- Pattern building until delimiter

## Utility Methods

### Token Navigation

```typescript
private match(...types: TokenType[]): boolean    // Check and consume token
private check(type: TokenType): boolean          // Check without consuming
private advance(): Token                         // Move to next token
private peek(): Token                           // Look at current token
private peekNext(): Token | undefined          // Look ahead one token
private previous(): Token                       // Get previous token
private isAtEnd(): boolean                      // Check if at end
```

### Method Resolution

```typescript
private getMethodTokenType(methodName: string): TokenType | undefined
private isMethodName(name: string): boolean
```

**Purpose**: Map method names to token types for validation

**Method Mapping**:
```typescript
{
  "in": TokenType.IN,
  "!in": TokenType.NOT_IN,
  "exists": TokenType.EXISTS,
  "!exists": TokenType.NOT_EXISTS,
  "contains": TokenType.CONTAINS,
  "!contains": TokenType.NOT_CONTAINS,
  // ... more methods
}
```

### Error Handling

```typescript
private addError(type: ErrorType, message: string, suggestion?: string): void
```

**Purpose**: Add detailed error information with context

**Error Context Includes**:
- Token position and line/column
- Nearby tokens for context
- Suggestions for fixing
- Error type classification

## Complete Example Walkthrough

Let's trace through parsing: `"when role=admin AND age > 18 *? string[] : string?"`

### Step 1: Tokenization
```
[WHEN, IDENTIFIER(role), EQUALS, IDENTIFIER(admin), AND, 
 IDENTIFIER(age), GREATER_THAN, NUMBER(18), CONDITIONAL_THEN,
 IDENTIFIER(string), LBRACKET, RBRACKET, COLON, 
 IDENTIFIER(string), UNKNOWN(?), EOF]
```

### Step 2: Parse Flow
1. **parseConditional()**: Expects WHEN ✓
2. **parseCondition()** → **parseLogicalOr()**:
   - **parseLogicalAnd()**: 
     - **parseComparison()**: `role=admin` → ComparisonNode
     - See AND token, continue
     - **parseComparison()**: `age > 18` → ComparisonNode
     - Create LogicalExpressionNode(AND, left, right)
3. Expect CONDITIONAL_THEN (*?) ✓
4. **parseValue()**: `string[]` → LiteralNode("string[]")
5. See COLON, parse else value
6. **parseValue()**: `string?` → LiteralNode("string?")

### Step 3: Final AST
```typescript
ConditionalNode {
  condition: LogicalExpressionNode {
    operator: "AND",
    left: ComparisonNode {
      operator: "EQUALS",
      left: FieldAccessNode { path: ["role"] },
      right: LiteralNode { value: "admin" }
    },
    right: ComparisonNode {
      operator: "GREATER_THAN", 
      left: FieldAccessNode { path: ["age"] },
      right: LiteralNode { value: 18 }
    }
  },
  thenValue: LiteralNode { value: "string[]" },
  elseValue: LiteralNode { value: "string?" }
}
```

## Key Design Patterns

### 1. Recursive Descent Parser
- Each grammar rule has its own method
- Methods call each other recursively
- Operator precedence handled by method hierarchy

### 2. Error Recovery
- Errors collected rather than throwing immediately
- Context preserved for better error messages
- Parsing continues when possible

### 3. Token Lookahead
- `peek()` and `peekNext()` for decision making
- No backtracking needed
- Efficient single-pass parsing

### 4. AST Builder Pattern
- Centralized AST node creation in `ASTBuilder`
- Consistent node structure
- Position tracking for error reporting

## Contributing Tips

### Understanding the Code Flow
1. **Start with `parse()`** - the entry point
2. **Follow the grammar** - each method represents a grammar rule
3. **Trace with examples** - use simple examples to understand flow
4. **Check error handling** - see how errors are collected and reported

### Common Areas for Contribution
1. **New operators** - Add support for new comparison operators
2. **New methods** - Add field methods like `.matches()`, `.length()`
3. **Better error messages** - Improve error context and suggestions
4. **Performance** - Optimize token consumption and lookahead
5. **Type inference** - Enhance TypeScript type inference from AST

### Testing Strategy
```typescript
// Test individual parsing methods
const parser = new ConditionalParser();
const result = parser.parse("when field=value *? string : string?");

// Test error cases
const errorResult = parser.parse("when field= *? string"); // Missing value

// Test complex nested cases
const nestedResult = parser.parse("when a=1 *? when b=2 *? string : number : boolean");
```

This parser is the core of Fortify Schema's conditional validation system, enabling powerful, readable validation logic with full TypeScript support.