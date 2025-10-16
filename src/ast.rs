/**
 * rel AST (Abstract Syntax Tree) definitions
 */

#[derive(Debug, Clone, PartialEq)]
pub enum ASTNode {
    // Schema definition
    Schema(SchemaNode),

    // Top-level declarations
    Import(ImportNode),
    Export(ExportNode),
    Enum(EnumNode),
    TypeAlias(TypeAliasNode),
    Variable(VariableNode),
    Mixin(MixinNode),

    // Schema components
    Field(FieldNode),
    Conditional(ConditionalNode),
    Validation(ValidationNode),
    Comment(CommentNode),
}

#[derive(Debug, Clone, PartialEq)]
pub struct SchemaNode {
    pub name: String,
    pub fields: Vec<FieldNode>,
    pub extends: Option<String>,
    pub mixins: Vec<String>,
    pub generics: Vec<String>, // Generic type parameters like <T, U>
}

#[derive(Debug, Clone, PartialEq)]
pub struct FieldNode {
    pub name: String,
    pub field_type: TypeNode,
    pub optional: bool,
    pub default_value: Option<ExpressionNode>,
    pub computed_value: Option<ExpressionNode>, // For computed fields like tax: number = subtotal * taxRate
    pub validations: Vec<ValidationNode>,
    pub conditionals: Vec<ConditionalNode>,
}

#[derive(Debug, Clone, PartialEq)]
pub enum TypeNode {
    // Built-in types
    String,
    Number,
    Boolean,
    Object,
    Array(Box<TypeNode>),
    Null,
    Undefined,
    Any,
    Unknown,

    // Custom types
    Identifier(String),

    // Complex types
    Union(Vec<TypeNode>),
    Generic(String, Vec<TypeNode>),

    // Constrained types (with validation constraints)
    Constrained {
        base_type: Box<TypeNode>,
        constraints: Vec<ConstraintNode>,
    },

    // Conditional types
    Conditional(Box<ConditionalNode>),
}

#[derive(Debug, Clone, PartialEq)]
pub struct ConstraintNode {
    pub constraint_type: ConstraintType,
    pub value: Option<ExpressionNode>,
}

#[derive(Debug, Clone, PartialEq)]
pub enum ConstraintType {
    Min,
    Max,
    MinLength,
    MaxLength,
    Matches,
    Contains,
    StartsWith,
    EndsWith,
    HasUppercase,
    HasLowercase,
    HasNumber,
    HasSpecialChar,
    Between,
    In,
    NotIn,
    Exists,
    Empty,
    Null,
    Future,
    Past,
    Before,
    After,
    Integer,
    Positive,
    Negative,
    Float,
}

#[derive(Debug, Clone, PartialEq)]
pub struct ConditionalNode {
    pub condition: ExpressionNode,
    pub then_value: TypeNode,
    pub else_value: Option<TypeNode>,
}

#[derive(Debug, Clone, PartialEq)]
pub struct ValidationNode {
    pub rule: ValidationRule,
    pub message: Option<String>,
}

#[derive(Debug, Clone, PartialEq)]
pub enum ValidationRule {
    Custom(String),
    FieldComparison {
        field: String,
        operator: ComparisonOperator,
        value: ExpressionNode,
    },
    FunctionCall {
        name: String,
        arguments: Vec<ExpressionNode>,
    },
}

#[derive(Debug, Clone, PartialEq)]
pub enum ComparisonOperator {
    Equals,
    NotEquals,
    GreaterThan,
    GreaterEqual,
    LessThan,
    LessEqual,
    Matches,
    NotMatches,
    In,
    NotIn,
    Contains,
    NotContains,
}

#[derive(Debug, Clone, PartialEq)]
pub enum ExpressionNode {
    // Literals
    String(String),
    RawString(String), // r"pattern" for regex
    Number(f64),
    Boolean(bool),
    Null,
    Undefined,

    // Identifiers and field access
    Identifier(String),
    FieldAccess(Vec<String>), // e.g., ["user", "profile", "name"]

    // Method calls and function calls
    MethodCall {
        field: Vec<String>,
        method: String,
        arguments: Vec<ExpressionNode>,
    },
    FunctionCall {
        name: String,
        arguments: Vec<ExpressionNode>,
    },

    // Operators
    BinaryOp {
        left: Box<ExpressionNode>,
        operator: BinaryOperator,
        right: Box<ExpressionNode>,
    },

    UnaryOp {
        operator: UnaryOperator,
        operand: Box<ExpressionNode>,
    },

    // Grouping
    Group(Box<ExpressionNode>),

    // Arrays and objects
    Array(Vec<ExpressionNode>),
    Object(Vec<(String, ExpressionNode)>),

    // Range expressions
    Range {
        start: Box<ExpressionNode>,
        end: Box<ExpressionNode>,
    },
}

#[derive(Debug, Clone, PartialEq)]
pub enum BinaryOperator {
    And,
    Or,
    Equals,
    NotEquals,
    GreaterThan,
    GreaterEqual,
    LessThan,
    LessEqual,
    Matches,
    NotMatches,
    In,
    NotIn,
    Contains,
    NotContains,
    Plus,
    Minus,
    Multiply,
    Divide,
    Modulo,
}

#[derive(Debug, Clone, PartialEq)]
pub enum UnaryOperator {
    Not,
    Negate,
}

#[derive(Debug, Clone, PartialEq)]
pub struct ImportNode {
    pub path: String,
    pub items: Vec<String>,
    pub alias: Option<String>,
}

#[derive(Debug, Clone, PartialEq)]
pub struct ExportNode {
    pub items: Vec<String>,
}

#[derive(Debug, Clone, PartialEq)]
pub struct EnumNode {
    pub name: String,
    pub values: Vec<String>,
}

#[derive(Debug, Clone, PartialEq)]
pub struct TypeAliasNode {
    pub name: String,
    pub type_definition: TypeNode,
}

#[derive(Debug, Clone, PartialEq)]
pub struct VariableNode {
    pub name: String,
    pub value: ExpressionNode,
}

#[derive(Debug, Clone, PartialEq)]
pub struct MixinNode {
    pub name: String,
    pub fields: Vec<FieldNode>,
}

#[derive(Debug, Clone, PartialEq)]
pub struct ParseError {
    pub message: String,
    pub position: usize,
    pub line: usize,
    pub column: usize,
    pub context: Option<String>,
}

#[derive(Debug, Clone, PartialEq)]
pub struct CommentNode {
    pub text: String,
}