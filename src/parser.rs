/**
 * rel Parser - Converts tokens to AST
 */

use crate::ast::*;
use crate::lexer::{Token, TokenType};

pub struct Parser {
    tokens: Vec<Token>,
    current: usize,
    errors: Vec<ParseError>,
}

impl Parser {
    pub fn new(tokens: Vec<Token>) -> Self {
        Self {
            tokens,
            current: 0,
            errors: Vec::new(),
        }
    }

    pub fn parse(&mut self) -> Result<Vec<ASTNode>, Vec<ParseError>> {
        let mut nodes = Vec::new();

        while !self.is_at_end() {
            match self.parse_top_level() {
                Ok(node) => nodes.push(node),
                Err(error) => {
                    self.errors.push(error);
                    // Try to recover by skipping to next statement
                    self.synchronize();
                }
            }
        }

        if self.errors.is_empty() {
            Ok(nodes)
        } else {
            Err(self.errors.clone())
        }
    }

    fn parse_top_level(&mut self) -> Result<ASTNode, ParseError> {
        match self.peek().token_type {
            TokenType::Define => self.parse_schema(),
            TokenType::Import => self.parse_import(),
            TokenType::Export => self.parse_export(),
            TokenType::Enum => self.parse_enum(),
            TokenType::Type => self.parse_type_alias(),
            TokenType::Declare => self.parse_declare(),
            TokenType::At => self.parse_decorator(),
            TokenType::Print => self.parse_print(),
            TokenType::Let => self.parse_variable(),
            TokenType::Mixin => self.parse_mixin(),
            TokenType::Identifier if self.peek().value == "validate" => self.parse_top_level_validation(),
            _ => Err(self.error("Expected top-level declaration (define, import, export, enum, type, let, mixin, or validate)")),
        }
    }

    fn parse_schema(&mut self) -> Result<ASTNode, ParseError> {
        self.consume(TokenType::Define, "Expected 'define'")?;

        let name = self.consume_identifier("Expected schema name")?;

        // Parse generic type parameters
        let generics = if self.match_token(TokenType::LessThan) {
            let mut params = Vec::new();
            loop {
                params.push(self.consume_identifier("Expected generic type parameter")?);
                if !self.match_token(TokenType::Comma) {
                    break;
                }
            }
            self.consume(TokenType::GreaterThan, "Expected '>' after generic parameters")?;
            params
        } else {
            Vec::new()
        };

        let extends = if self.match_token(TokenType::Extends) {
            Some(self.consume_identifier("Expected parent schema name")?)
        } else {
            None
        };

        let mixins = self.parse_mixins()?;

        self.consume(TokenType::LBrace, "Expected '{' after schema declaration")?;

        let mut fields = Vec::new();
        while !self.check(TokenType::RBrace) && !self.is_at_end() {
            if self.check(TokenType::When) {
                // Parse conditional block
                let conditional = self.parse_conditional()?;
                // Convert conditional to a field-like structure
                let conditional_field = FieldNode {
                    name: format!("conditional_{}", fields.len()),
                    field_type: TypeNode::Conditional(Box::new(conditional)),
                    optional: false,
                    default_value: None,
                    computed_value: None,
                    validations: Vec::new(),
                    conditionals: Vec::new(),
                };
                fields.push(conditional_field);
            } else {
                fields.push(self.parse_field()?);
                // Optional comma between fields
                self.match_token(TokenType::Comma);
            }
        }

        self.consume(TokenType::RBrace, "Expected '}' after schema body")?;

        Ok(ASTNode::Schema(SchemaNode {
            name,
            fields,
            extends,
            mixins,
            generics,
            validations: Vec::new(), // Will be populated later
        }))
    }

    fn parse_mixins(&mut self) -> Result<Vec<String>, ParseError> {
        let mut mixins = Vec::new();

        if self.match_token(TokenType::With) {
            loop {
                mixins.push(self.consume_identifier("Expected mixin name")?);
                if !self.match_token(TokenType::Comma) {
                    break;
                }
            }
        }

        Ok(mixins)
    }

    fn parse_field(&mut self) -> Result<FieldNode, ParseError> {
        // Check if this is a conditional field (starts with 'when')
        if self.check(TokenType::When) {
            return self.parse_conditional_field();
        }

        let name = self.consume_identifier("Expected field name")?;
        self.consume(TokenType::Colon, "Expected ':' after field name")?;

        let field_type = self.parse_type()?;
        let optional = self.match_token(TokenType::Question);

        let default_value = if self.match_token(TokenType::Equals) {
            Some(self.parse_expression()?)
        } else {
            None
        };

        // Check for computed field (field: type = expression)
        let computed_value = if default_value.is_some() && self.is_expression_start() {
            // This is a computed field, the default_value is actually the computed expression
            default_value.clone()
        } else {
            None
        };

        let mut validations = Vec::new();
        let mut conditionals = Vec::new();

        // Parse conditionals and validations
        while self.match_token(TokenType::When) {
            conditionals.push(self.parse_conditional()?);
        }

        // Parse validations
        while self.check(TokenType::Identifier) && self.peek().value == "validate" {
            self.advance(); // consume 'validate'
            validations.push(self.parse_validation()?);
        }

        Ok(FieldNode {
            name,
            field_type,
            optional,
            default_value,
            computed_value,
            validations,
            conditionals,
        })
    }

    fn parse_conditional_field(&mut self) -> Result<FieldNode, ParseError> {
        // Parse the conditional
        let conditional = self.parse_conditional()?;

        // Create a synthetic field node for the conditional
        Ok(FieldNode {
            name: format!("conditional_{}", self.current), // temporary name
            field_type: TypeNode::Conditional(Box::new(conditional)),
            optional: false,
            default_value: None,
            computed_value: None,
            validations: Vec::new(),
            conditionals: Vec::new(),
        })
    }

    fn parse_type(&mut self) -> Result<TypeNode, ParseError> {
        // Check if we start with a constraint (e.g., &literal(value))
        if self.check(TokenType::Ampersand) {
            // Parse constraints without a base type
            let mut constraints = Vec::new();
            while self.match_token(TokenType::Ampersand) {
                constraints.push(self.parse_constraint()?);
            }
            
            // For &literal(value), convert directly to Literal type
            if constraints.len() == 1 {
                if let ConstraintType::Literal = constraints[0].constraint_type {
                    if let Some(expr) = &constraints[0].value {
                        return Ok(TypeNode::Literal(expr.clone()));
                    }
                }
            }
            
            // Otherwise, use Any as base type with constraints
            return Ok(TypeNode::Constrained {
                base_type: Box::new(TypeNode::Any),
                constraints,
            });
        }
        
        let base_type = self.parse_base_type()?;

        // Handle array types
        let base_type = if self.match_token(TokenType::LBracket) {
            self.consume(TokenType::RBracket, "Expected ']' after '['")?;
            TypeNode::Array(Box::new(base_type))
        } else {
            base_type
        };

        // Handle union types
        let base_type = if self.peek().token_type == TokenType::Pipe {
            let mut types = vec![base_type];
            while self.match_token(TokenType::Pipe) {
                types.push(self.parse_base_type()?);
            }
            TypeNode::Union(types)
        } else {
            base_type
        };

        // Handle constraints
        let mut constraints = Vec::new();
        while self.match_token(TokenType::Ampersand) {
            constraints.push(self.parse_constraint()?);
        }

        if constraints.is_empty() {
            Ok(base_type)
        } else {
            Ok(TypeNode::Constrained {
                base_type: Box::new(base_type),
                constraints,
            })
        }
    }

    fn parse_base_type(&mut self) -> Result<TypeNode, ParseError> {
        // Check for literal values (=value syntax)
        if self.match_token(TokenType::Equals) {
            let literal_expr = self.parse_expression()?;
            return Ok(TypeNode::Literal(literal_expr));
        }
        
        // Check for inline object syntax { field: type, ... }
        if self.check(TokenType::LBrace) {
            return self.parse_inline_object();
        }
        
        // Accept both Identifier and TypeName tokens
        let type_name = if self.check(TokenType::TypeName) {
            self.advance().value
        } else {
            self.consume_identifier("Expected type name")?
        };

        match type_name.as_str() {
            "string" => Ok(TypeNode::String),
            "number" => Ok(TypeNode::Number),
            "boolean" => Ok(TypeNode::Boolean),
            "object" => Ok(TypeNode::Object),
            "null" => Ok(TypeNode::Null),
            "undefined" => Ok(TypeNode::Undefined),
            "any" => Ok(TypeNode::Any),
            "unknown" => Ok(TypeNode::Unknown),
            _ => {
                // Check if this is a generic type (like record<string, any>)
                if self.match_token(TokenType::LessThan) {
                    let mut type_args = Vec::new();
                    loop {
                        type_args.push(self.parse_type()?);
                        if !self.match_token(TokenType::Comma) {
                            break;
                        }
                    }
                    self.consume(TokenType::GreaterThan, "Expected '>' after generic type arguments")?;
                    Ok(TypeNode::Generic(type_name, type_args))
                } else if self.check(TokenType::LParen) {
                    // Function call: Ranged(0, 100)
                    self.advance(); // consume '('
                    let mut args = Vec::new();
                    
                    if !self.check(TokenType::RParen) {
                        loop {
                            args.push(self.parse_expression()?);
                            if !self.match_token(TokenType::Comma) {
                                break;
                            }
                        }
                    }
                    
                    self.consume(TokenType::RParen, "Expected ')' after function arguments")?;
                    Ok(TypeNode::FunctionCall { name: type_name, arguments: args })
                } else {
                    Ok(TypeNode::Identifier(type_name))
                }
            }
        }
    }
    
    fn parse_inline_object(&mut self) -> Result<TypeNode, ParseError> {
        self.consume(TokenType::LBrace, "Expected '{'")?;
        
        let mut fields = Vec::new();
        while !self.check(TokenType::RBrace) && !self.is_at_end() {
            let field = self.parse_field()?;
            fields.push(field);
            
            // Optional comma between fields
            self.match_token(TokenType::Comma);
        }
        
        self.consume(TokenType::RBrace, "Expected '}' after inline object")?;
        
        Ok(TypeNode::InlineObject(fields))
    }

    fn parse_constraint(&mut self) -> Result<ConstraintNode, ParseError> {
        // Accept Identifier, Constraint, and TypeName tokens (for dual-use tokens like 'positive')
        let name = if self.check(TokenType::Constraint) {
            self.advance().value
        } else if self.check(TokenType::TypeName) {
            self.advance().value
        } else {
            self.consume_identifier("Expected constraint name")?
        };
        let constraint_type = match name.as_str() {
            "min" => ConstraintType::Min,
            "max" => ConstraintType::Max,
            "minLength" => ConstraintType::MinLength,
            "maxLength" => ConstraintType::MaxLength,
            "matches" => ConstraintType::Matches,
            "contains" => ConstraintType::Contains,
            "startsWith" => ConstraintType::StartsWith,
            "endsWith" => ConstraintType::EndsWith,
            "hasUppercase" => ConstraintType::HasUppercase,
            "hasLowercase" => ConstraintType::HasLowercase,
            "hasNumber" => ConstraintType::HasNumber,
            "hasSpecialChar" => ConstraintType::HasSpecialChar,
            "between" => ConstraintType::Between,
            "in" => ConstraintType::In,
            "notIn" => ConstraintType::NotIn,
            "exists" => ConstraintType::Exists,
            "empty" => ConstraintType::Empty,
            "null" => ConstraintType::Null,
            "future" => ConstraintType::Future,
            "past" => ConstraintType::Past,
            "before" => ConstraintType::Before,
            "after" => ConstraintType::After,
            "integer" => ConstraintType::Integer,
            "positive" => ConstraintType::Positive,
            "negative" => ConstraintType::Negative,
            "float" => ConstraintType::Float,
            "literal" => ConstraintType::Literal,
            _ => return Err(self.error("Unknown constraint")),
        };

        let value = if self.match_token(TokenType::LParen) {
            let expr = self.parse_expression()?;
            self.consume(TokenType::RParen, "Expected ')' after constraint argument")?;
            Some(expr)
        } else {
            None
        };

        Ok(ConstraintNode {
            constraint_type,
            value,
        })
    }
fn parse_conditional(&mut self) -> Result<ConditionalNode, ParseError> {
    let condition = self.parse_expression()?;
    self.consume(TokenType::LBrace, "Expected '{' after condition")?;

    // Parse multiple fields in the conditional block
    let mut then_fields = Vec::new();
    while !self.check(TokenType::RBrace) && !self.is_at_end() {
        then_fields.push(self.parse_field()?);
        // Optional comma between fields
        self.match_token(TokenType::Comma);
    }

    self.consume(TokenType::RBrace, "Expected '}' after then block")?;

    // Create type node for then value
    let then_value = if then_fields.len() == 1 {
        // Single field - use its type
        then_fields[0].field_type.clone()
    } else {
        // Multiple fields - use Object as placeholder
        TypeNode::Object
    };

    let (else_value, else_fields) = if self.match_token(TokenType::Else) {
        if self.match_token(TokenType::When) {
            // else when condition - recursively parse another conditional
            let nested_conditional = self.parse_conditional()?;
            (Some(TypeNode::Conditional(Box::new(nested_conditional))), Vec::new())
        } else {
            // else block - parse fields
            self.consume(TokenType::LBrace, "Expected '{' after else")?;
            let mut else_fields = Vec::new();
            while !self.check(TokenType::RBrace) && !self.is_at_end() {
                else_fields.push(self.parse_field()?);
                // Optional comma between fields
                self.match_token(TokenType::Comma);
            }
            self.consume(TokenType::RBrace, "Expected '}' after else block")?;

            (Some(TypeNode::Object), else_fields)
        }
    } else {
        (None, Vec::new())
    };

    Ok(ConditionalNode {
        condition,
        then_value,
        else_value,
        then_fields,
        else_fields,
    })
}

    fn parse_validation(&mut self) -> Result<ValidationNode, ParseError> {
        let rule = self.parse_validation_rule()?;
        let message = if self.match_token(TokenType::String) {
            Some(self.previous().value)
        } else {
            None
        };

        Ok(ValidationNode { rule, message })
    }

    fn parse_validation_rule(&mut self) -> Result<ValidationRule, ParseError> {
        // Parse validation expressions like:
        // validate email != "test@example.com"
        // validate age >= 13 if role != admin
        // validate permissions.length() > 0 if role = admin
        // validate total = subtotal + tax - discount

        let left = self.parse_expression()?;

        // Check for comparison operators
        if self.is_comparison_operator() {
            let operator = self.comparison_operator()?;
            let right = self.parse_expression()?;

            // Check for optional conditional part (if ...)
            let _condition = if self.match_token(TokenType::If) {
                Some(self.parse_expression()?)
            } else {
                None
            };

            // Extract field name from the left expression
            let field_name = match &left {
                ExpressionNode::Identifier(name) => name.clone(),
                ExpressionNode::FieldAccess(path) => path.join("."),
                _ => return Err(self.error("Left side of validation must be a field reference")),
            };

            return Ok(ValidationRule::FieldComparison {
                field: field_name,
                operator: match operator {
                    BinaryOperator::Equals => ComparisonOperator::Equals,
                    BinaryOperator::NotEquals => ComparisonOperator::NotEquals,
                    BinaryOperator::GreaterThan => ComparisonOperator::GreaterThan,
                    BinaryOperator::GreaterEqual => ComparisonOperator::GreaterEqual,
                    BinaryOperator::LessThan => ComparisonOperator::LessThan,
                    BinaryOperator::LessEqual => ComparisonOperator::LessEqual,
                    BinaryOperator::Matches => ComparisonOperator::Matches,
                    BinaryOperator::NotMatches => ComparisonOperator::NotMatches,
                    BinaryOperator::In => ComparisonOperator::In,
                    BinaryOperator::NotIn => ComparisonOperator::NotIn,
                    BinaryOperator::Contains => ComparisonOperator::Contains,
                    BinaryOperator::NotContains => ComparisonOperator::NotContains,
                    _ => return Err(self.error("Invalid comparison operator for validation")),
                },
                value: right,
            });
        }

        // Check for function calls
        if let ExpressionNode::FunctionCall { name, arguments } = &left {
            return Ok(ValidationRule::FunctionCall {
                name: name.clone(),
                arguments: arguments.clone(),
            });
        }

        // Default to custom validation
        Ok(ValidationRule::Custom(format!("{:?}", left)))
    }

    fn parse_expression(&mut self) -> Result<ExpressionNode, ParseError> {
        self.parse_logical_or()
    }

    fn parse_logical_or(&mut self) -> Result<ExpressionNode, ParseError> {
        let mut expr = self.parse_logical_and()?;

        while self.match_token(TokenType::Or) {
            let operator = BinaryOperator::Or;
            let right = self.parse_logical_and()?;
            expr = ExpressionNode::BinaryOp {
                left: Box::new(expr),
                operator,
                right: Box::new(right),
            };
        }

        Ok(expr)
    }

    fn parse_logical_and(&mut self) -> Result<ExpressionNode, ParseError> {
        let mut expr = self.parse_comparison()?;

        while self.match_token(TokenType::And) {
            let operator = BinaryOperator::And;
            let right = self.parse_comparison()?;
            expr = ExpressionNode::BinaryOp {
                left: Box::new(expr),
                operator,
                right: Box::new(right),
            };
        }

        Ok(expr)
    }

    fn parse_comparison(&mut self) -> Result<ExpressionNode, ParseError> {
        let mut expr = self.parse_term()?;

        if self.is_comparison_operator() {
            let operator = self.comparison_operator()?;
            let right = self.parse_term()?;
            expr = ExpressionNode::BinaryOp {
                left: Box::new(expr),
                operator,
                right: Box::new(right),
            };
        }

        Ok(expr)
    }

    fn parse_term(&mut self) -> Result<ExpressionNode, ParseError> {
        // Check for :: variable reference
        if self.check(TokenType::DoubleColon) {
            self.advance(); // consume '::'
            // Accept Identifier, TypeName, or Constraint as variable name
            let var_name = if self.check(TokenType::Identifier) || self.check(TokenType::TypeName) || self.check(TokenType::Constraint) {
                self.advance().value
            } else {
                return Err(self.error("Expected variable name after '::'"));
            };
            return Ok(ExpressionNode::VariableRef(var_name));
        }
        
        match self.peek().token_type {
            TokenType::String => {
                let value = self.advance().value;
                Ok(ExpressionNode::String(value))
            }
            TokenType::RawString => {
                let value = self.advance().value;
                Ok(ExpressionNode::RawString(value))
            }
            TokenType::Number => {
                let value: f64 = self.advance().value.parse().map_err(|_| self.error("Invalid number"))?;
                Ok(ExpressionNode::Number(value))
            }
            TokenType::Boolean => {
                let value = self.advance().value == "true";
                Ok(ExpressionNode::Boolean(value))
            }
            TokenType::Null => {
                self.advance();
                Ok(ExpressionNode::Null)
            }
            TokenType::Undefined => {
                self.advance();
                Ok(ExpressionNode::Undefined)
            }
            TokenType::Identifier => {
                let name = self.advance().value;
                if self.match_token(TokenType::LParen) {
                    // Function call
                    let mut arguments = Vec::new();
                    if !self.check(TokenType::RParen) {
                        loop {
                            arguments.push(self.parse_expression()?);
                            if !self.match_token(TokenType::Comma) {
                                break;
                            }
                        }
                    }
                    self.consume(TokenType::RParen, "Expected ')' after function arguments")?;
                    Ok(ExpressionNode::FunctionCall { name, arguments })
                } else if self.match_token(TokenType::Dot) {
                    let mut path = vec![name];
                    loop {
                        if self.match_token(TokenType::LParen) {
                            // Method call
                            let method = path.pop().unwrap();
                            let mut arguments = Vec::new();
                            if !self.check(TokenType::RParen) {
                                loop {
                                    arguments.push(self.parse_expression()?);
                                    if !self.match_token(TokenType::Comma) {
                                        break;
                                    }
                                }
                            }
                            self.consume(TokenType::RParen, "Expected ')' after method arguments")?;
                            return Ok(ExpressionNode::MethodCall {
                                field: path,
                                method,
                                arguments,
                            });
                        } else {
                            path.push(self.consume_identifier("Expected identifier after '.'")?);
                            if !self.match_token(TokenType::Dot) {
                                break;
                            }
                        }
                    }
                    Ok(ExpressionNode::FieldAccess(path))
                } else {
                    Ok(ExpressionNode::Identifier(name))
                }
            }
            TokenType::LParen => {
                self.advance();
                let expr = self.parse_expression()?;
                self.consume(TokenType::RParen, "Expected ')' after expression")?;
                Ok(ExpressionNode::Group(Box::new(expr)))
            }
            TokenType::LBracket => {
                self.advance();
                let mut elements = Vec::new();
                if !self.check(TokenType::RBracket) {
                    loop {
                        elements.push(self.parse_expression()?);
                        if !self.match_token(TokenType::Comma) {
                            break;
                        }
                    }
                }
                self.consume(TokenType::RBracket, "Expected ']' after array")?;
                Ok(ExpressionNode::Array(elements))
            }
            _ => Err(self.error("Expected expression")),
        }
    }

    fn is_comparison_operator(&self) -> bool {
        matches!(
            self.peek().token_type,
            TokenType::Equals
                | TokenType::NotEquals
                | TokenType::GreaterThan
                | TokenType::GreaterEqual
                | TokenType::LessThan
                | TokenType::LessEqual
                | TokenType::Matches
                | TokenType::NotMatches
        )
    }

    fn comparison_operator(&mut self) -> Result<BinaryOperator, ParseError> {
        let operator = match self.advance().token_type {
            TokenType::Equals => BinaryOperator::Equals,
            TokenType::NotEquals => BinaryOperator::NotEquals,
            TokenType::GreaterThan => BinaryOperator::GreaterThan,
            TokenType::GreaterEqual => BinaryOperator::GreaterEqual,
            TokenType::LessThan => BinaryOperator::LessThan,
            TokenType::LessEqual => BinaryOperator::LessEqual,
            TokenType::Matches => BinaryOperator::Matches,
            TokenType::NotMatches => BinaryOperator::NotMatches,
            _ => return Err(self.error("Expected comparison operator")),
        };
        Ok(operator)
    }

    fn parse_import(&mut self) -> Result<ASTNode, ParseError> {
        self.consume(TokenType::Import, "Expected 'import'")?;
        let items = self.parse_import_items()?;
        self.consume(TokenType::From, "Expected 'from'")?;
        let path = self.consume_string("Expected import path")?;

        // Handle optional alias
        let alias = if self.match_token(TokenType::As) {
            Some(self.consume_identifier("Expected alias name")?)
        } else {
            None
        };

        Ok(ASTNode::Import(ImportNode {
            path,
            items,
            alias,
        }))
    }

    fn parse_import_items(&mut self) -> Result<Vec<String>, ParseError> {
        let mut items = Vec::new();
        self.consume(TokenType::LBrace, "Expected '{' after import")?;

        loop {
            items.push(self.consume_identifier("Expected import item")?);
            if !self.match_token(TokenType::Comma) {
                break;
            }
        }

        self.consume(TokenType::RBrace, "Expected '}' after import items")?;
        Ok(items)
    }

    fn parse_export(&mut self) -> Result<ASTNode, ParseError> {
        self.consume(TokenType::Export, "Expected 'export'")?;
        let mut items = Vec::new();

        loop {
            items.push(self.consume_identifier("Expected export item")?);
            if !self.match_token(TokenType::Comma) {
                break;
            }
        }

        Ok(ASTNode::Export(ExportNode { items }))
    }

    fn parse_enum(&mut self) -> Result<ASTNode, ParseError> {
        self.consume(TokenType::Enum, "Expected 'enum'")?;
        let name = self.consume_identifier("Expected enum name")?;
        self.consume(TokenType::LBrace, "Expected '{' after enum name")?;

        let mut values = Vec::new();
        while !self.check(TokenType::RBrace) && !self.is_at_end() {
            values.push(self.consume_identifier("Expected enum value")?);
            // Optional comma between values
            self.match_token(TokenType::Comma);
        }

        self.consume(TokenType::RBrace, "Expected '}' after enum values")?;

        Ok(ASTNode::Enum(EnumNode { name, values }))
    }

    fn parse_type_alias(&mut self) -> Result<ASTNode, ParseError> {
        self.consume(TokenType::Type, "Expected 'type'")?;
        let name = self.consume_identifier("Expected type alias name")?;
        self.consume(TokenType::Equals, "Expected '=' after type alias name")?;
        let type_definition = self.parse_type()?;

        Ok(ASTNode::TypeAlias(TypeAliasNode {
            name,
            type_definition,
        }))
    }

    fn parse_variable(&mut self) -> Result<ASTNode, ParseError> {
        self.consume(TokenType::Let, "Expected 'let'")?;
        let name = self.consume_identifier("Expected variable name")?;
        self.consume(TokenType::Equals, "Expected '=' after variable name")?;
        let value = self.parse_expression()?;

        Ok(ASTNode::Variable(VariableNode { name, value }))
    }

    fn parse_mixin(&mut self) -> Result<ASTNode, ParseError> {
        self.consume(TokenType::Mixin, "Expected 'mixin'")?;
        let name = self.consume_identifier("Expected mixin name")?;
        self.consume(TokenType::LBrace, "Expected '{' after mixin name")?;

        let mut fields = Vec::new();
        while !self.check(TokenType::RBrace) && !self.is_at_end() {
            fields.push(self.parse_field()?);
            self.match_token(TokenType::Comma);
        }

        self.consume(TokenType::RBrace, "Expected '}' after mixin body")?;

        Ok(ASTNode::Mixin(MixinNode { name, fields }))
    }

    fn parse_top_level_validation(&mut self) -> Result<ASTNode, ParseError> {
        self.consume_identifier("Expected 'validate'")?; // consume 'validate'
        let validation = self.parse_validation()?;
        Ok(ASTNode::ValidationStatement(validation))
    }

    /// Parse decorators (@fn, @for, etc.)
    fn parse_decorator(&mut self) -> Result<ASTNode, ParseError> {
        self.advance(); // consume '@'
        
        if self.check(TokenType::Fn) {
            return self.parse_function();
        }
        
        Err(self.error("Expected 'fn' after '@'"))
    }
    
    /// Parse: @fn Name(params) -> type { return TypeExpr }
    fn parse_function(&mut self) -> Result<ASTNode, ParseError> {
        self.advance(); // consume 'fn'
        
        let name = self.consume_identifier("Expected function name")?;
        
        // Parse parameters
        self.consume(TokenType::LParen, "Expected '(' after function name")?;
        let mut params = Vec::new();
        
        if !self.check(TokenType::RParen) {
            loop {
                // Accept Identifier, TypeName, or Constraint tokens for parameter names
                let param_name = if self.check(TokenType::Identifier) || self.check(TokenType::TypeName) || self.check(TokenType::Constraint) {
                    self.advance().value
                } else {
                    return Err(self.error("Expected parameter name"));
                };
                self.consume(TokenType::Colon, "Expected ':' after parameter name")?;
                let param_type = self.parse_type()?;
                
                params.push(FunctionParam {
                    name: param_name,
                    param_type,
                });
                
                if !self.match_token(TokenType::Comma) {
                    break;
                }
            }
        }
        
        self.consume(TokenType::RParen, "Expected ')' after parameters")?;
        
        // Parse return type
        self.consume(TokenType::Arrow, "Expected '->' after parameters")?;
        // Accept "type" keyword as return type identifier
        let return_type = if self.check(TokenType::Type) {
            self.advance().value
        } else {
            self.consume_identifier("Expected return type")?
        };
        
        // Parse body
        self.consume(TokenType::LBrace, "Expected '{' to start function body")?;
        
        // Look for "return" keyword
        let body_type = if self.check(TokenType::Return) {
            self.advance(); // consume 'return'
            Some(self.parse_type()?)
        } else {
            None
        };
        
        self.consume(TokenType::RBrace, "Expected '}' to end function body")?;
        
        Ok(ASTNode::Function(FunctionNode {
            name,
            params,
            return_type,
            body_type,
        }))
    }

    /// Parse: print(arg1, arg2, ...)
    fn parse_print(&mut self) -> Result<ASTNode, ParseError> {
        self.advance(); // consume 'print'
        
        self.consume(TokenType::LParen, "Expected '(' after 'print'")?;
        
        let mut arguments = Vec::new();
        if !self.check(TokenType::RParen) {
            loop {
                arguments.push(self.parse_expression()?);
                if !self.match_token(TokenType::Comma) {
                    break;
                }
            }
        }
        
        self.consume(TokenType::RParen, "Expected ')' after print arguments")?;
        
        Ok(ASTNode::Print(PrintNode { arguments }))
    }

    /// Parse: declare var name: type = value
    fn parse_declare(&mut self) -> Result<ASTNode, ParseError> {
        self.advance(); // consume 'declare'
        
        if self.check(TokenType::Var) {
            self.advance(); // consume 'var'
            
            let name = self.consume_identifier("Expected variable name")?;
            
            // Optional type annotation
            let var_type = if self.match_token(TokenType::Colon) {
                Some(self.parse_type()?)
            } else {
                None
            };
            
            // Require assignment
            self.consume(TokenType::Equals, "Expected '=' in variable declaration")?;
            let value = self.parse_expression()?;
            
            Ok(ASTNode::DeclareVar(DeclareVarNode {
                name,
                var_type,
                value,
            }))
        } else if self.check(TokenType::Type) {
            self.advance(); // consume 'type'
            
            let name = self.consume_identifier("Expected type name")?;
            self.consume(TokenType::Equals, "Expected '=' in type declaration")?;
            let type_def = self.parse_type()?;
            
            Ok(ASTNode::DeclareType(DeclareTypeNode {
                name,
                type_def,
            }))
        } else {
            Err(self.error("Expected 'var' or 'type' after 'declare'"))
        }
    }

    fn is_expression_start(&self) -> bool {
        matches!(
            self.peek().token_type,
            TokenType::String
                | TokenType::RawString
                | TokenType::Number
                | TokenType::Boolean
                | TokenType::Null
                | TokenType::Undefined
                | TokenType::Identifier
                | TokenType::LParen
                | TokenType::LBracket
                | TokenType::Minus
                | TokenType::Not
        )
    }

    // Helper methods
    fn match_token(&mut self, token_type: TokenType) -> bool {
        if self.check(token_type) {
            self.advance();
            true
        } else {
            false
        }
    }

    fn check(&self, token_type: TokenType) -> bool {
        !self.is_at_end() && self.peek().token_type == token_type
    }

    fn advance(&mut self) -> Token {
        if !self.is_at_end() {
            self.current += 1;
        }
        self.previous()
    }

    fn peek(&self) -> &Token {
        &self.tokens[self.current]
    }

    fn previous(&self) -> Token {
        self.tokens[self.current - 1].clone()
    }

    fn is_at_end(&self) -> bool {
        self.current >= self.tokens.len() || self.peek().token_type == TokenType::Eof
    }

    fn consume(&mut self, token_type: TokenType, message: &str) -> Result<String, ParseError> {
        if self.check(token_type) {
            Ok(self.advance().value)
        } else {
            Err(self.error(message))
        }
    }

    fn consume_identifier(&mut self, message: &str) -> Result<String, ParseError> {
        // Accept both Identifier and TypeName tokens as identifiers
        // This allows using type names as field names (e.g., email: email)
        if self.check(TokenType::Identifier) || self.check(TokenType::TypeName) {
            Ok(self.advance().value)
        } else {
            Err(self.error(message))
        }
    }

    fn consume_string(&mut self, message: &str) -> Result<String, ParseError> {
        if self.check(TokenType::String) {
            Ok(self.advance().value)
        } else {
            Err(self.error(message))
        }
    }

    fn error(&self, message: &str) -> ParseError {
        let token = self.peek();
        ParseError {
            message: message.to_string(),
            position: token.position,
            line: token.line,
            column: token.column,
            context: None,
            file_path: None,
        }
    }

    fn synchronize(&mut self) {
        self.advance();

        while !self.is_at_end() {
            if self.previous().token_type == TokenType::Semicolon {
                return;
            }

            match self.peek().token_type {
                TokenType::Define | TokenType::Import | TokenType::Export |
                TokenType::Enum | TokenType::Type => {
                    return;
                }
                _ => {
                    self.advance();
                }
            }
        }
    }
}