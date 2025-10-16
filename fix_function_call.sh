#!/bin/bash
# Add FunctionCall handling to all match statements in generator.rs

# Find line numbers of TypeNode::Identifier matches
grep -n "TypeNode::Identifier(name) =>" src/generator.rs | while read line; do
    linenum=$(echo $line | cut -d: -f1)
    echo "Found at line $linenum"
done

# Add after each TypeNode::Identifier match
sed -i '/TypeNode::Identifier(name) => name\.clone(),/a\            TypeNode::FunctionCall { name, .. } => self.expand_type_inline(&TypeNode::FunctionCall { name: name.clone(), arguments: vec![] }),' src/generator.rs

sed -i '/TypeNode::Identifier(name) => format!("\"{}\"", name),/a\            TypeNode::FunctionCall { name, arguments } => self.expand_type_inline(&TypeNode::FunctionCall { name: name.clone(), arguments: arguments.clone() }),' src/generator.rs

echo "Done"
