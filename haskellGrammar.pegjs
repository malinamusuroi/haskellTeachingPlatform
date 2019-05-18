start
  = functionDefinitionList

functionDefinitionList
  = functionDefinitionPlusWhitespace*

functionDefinitionPlusWhitespace
  = functionDefinition:functionDefinition whitespace_newline* { return functionDefinition; }

functionDefinition
  = typeSignature:functionDefinitionTypeSignature patterns:functionDefinitionPatternLine* { return {
    kind: "functionDefinition",
    lineNumber: location().start.line,
    startPosition: location().start.column,
    endPosition: location().end.column,
    name: typeSignature && typeSignature.functionName && typeSignature.functionName.name,
    nameStartPosition: typeSignature && typeSignature.functionName && typeSignature.functionName.startPosition,
    nameEndPosition:typeSignature && typeSignature.functionName && typeSignature.functionName.endPosition,
    typeSignature: typeSignature,
    patterns: patterns,
  }; }
 
functionDefinitionTypeSignature = functionName:functionName whitespace "::" whitespace head:type tail:arrowAndType* {
	return {
    	kind: "typeSignature",
    	types: [head].concat(tail),
        functionName: functionName
    }
}
/ "_" { return { kind: "typeSignature", isUnderscore: true } }

arrayType = "[" type:type "]" { return { kind: "arrayType", name: type.name, lineNumber: location().start.line, startPosition: location().start.column,
    endPosition: location().end.column, isUnderscore: type.isUnderscore } }
type = arrayType:arrayType { return arrayType }
     / type:[A-Za-z]+ { return {kind: "type", name: type.join(""), lineNumber: location().start.line, startPosition: location().start.column,
    endPosition: location().end.column} }
     / "_" { return { kind: "type", lineNumber: location().start.line, startPosition: location().start.column,
    endPosition: location().end.column, isUnderscore: true } }
     
arrowAndType = " -> " type:type { return type };

functionDefinitionPatternLine
  = "\n" functionName:functionName part:functionDefinitionPatternPartOfLine { return {
    kind: "pattern",
    name: functionName.name,
    isUnderscore: functionName.isUnderscore,
    lineNumber: part.lineNumber,
    startPosition: functionName.startPosition,
    endPosition: functionName.endPosition,
    arguments: part.arguments,
    expression: part.expression,
  }}
  / "\n"* "_" { return { kind: "pattern", isUnderscore: true } };

functionDefinitionPatternPartOfLine
  = patternArguments:patternWithWhitespace* whitespace? "=" whitespace exp:expressionWithFunction { return {
    kind: "pattern",
    lineNumber: location().start.line,
    startPosition: location().start.column,
    endPosition: location().end.column,
    arguments: patternArguments,
    expression: exp,
  }; }

patternWithWhitespace
  = whitespace pattern:pattern { return pattern; }

pattern
  = "[" whitespace* "]" { return { kind: "emptyListPattern", lineNumber: location().start.line, startPosition: location().start.column,
    endPosition: location().end.column, value: "[]" }; }
  / "(" whitespace* left:functionName whitespace* ":" whitespace*  right:functionName whitespace* ")" { return { kind: "listPattern", lineNumber: location().start.line, startPosition: location().start.column,
    endPosition: location().end.column, left: left, right: right }; }
  / functionName
  / integer:integer

expression
  = "(" whitespace? exp:expressionWithFunction whitespace? ")" { return { kind: "bracketedExpression", lineNumber: location().start.line, startPosition: location().start.column,
    endPosition: location().end.column, expression: exp } }
  / list
  / integer
  / functionName;

expressionWithFunction
  = infixFunctionApplication 
  / functionApplication
  / expression
  / "_" { return { kind: "expression",lineNumber: location().start.line, startPosition: location().start.column,
    endPosition: location().end.column, isUnderscore: true } }

functionApplication
  = f:functionName whitespace args:expression_list {return {kind: 'functionApplication', lineNumber: location().start.line, startPosition: location().start.column,
    endPosition: location().end.column, functionName: f, arguments: args}}
  / "_" { return { kind: "functionApplication", lineNumber: location().start.line, startPosition: location().start.column,
    endPosition: location().end.column, isUnderscore: true } };

infixFunctionApplication
  = left:expression whitespace? f:infixFunctionName whitespace? right:expressionWithFunction { return {kind: "functionApplication", lineNumber: location().start.line, functionName: f, arguments: [left, right]}}

expression_list
  = exp1:expression list:(whitespace_expression)* { list.unshift(exp1); return list; }

whitespace_expression
  = whitespace exp:expression { return exp; }

list
  = "[" whitespace? list:comma_expression_list? whitespace? "]" { return { kind: "list", lineNumber: location().start.line, items: list || [] }; }
  / "_" { return { kind: "list", isUnderscore: true } }

comma_expression_list
  = exp1:expression list:(comma_expression)* { list.unshift(exp1); return list; }

comma_expression
  = whitespace? "," whitespace? exp:expression { return exp; }

functionName
  = dollar:"$"? letters:[A-Za-z]+ { return { kind: 'functionName', lineNumber: location().start.line, startPosition: location().start.column,
    endPosition: location().end.column, name: (dollar || "") + letters.join(""), infix: false}; }
  / "_" { return { kind: "functionName", lineNumber: location().start.line, startPosition: location().start.column,
    endPosition: location().end.column, isUnderscore: true } }

infixFunctionName
  = "+" { return { kind: 'functionName', lineNumber: location().start.line, startPosition: location().start.column,
    endPosition: location().end.column, name: '+', infix: true}; }
  / "-" { return { kind: 'functionName', lineNumber: location().start.line, startPosition: location().start.column,
    endPosition: location().end.column, name: '-', infix: true}; }
  / ":" { return { kind: 'functionName', lineNumber: location().start.line, startPosition: location().start.column,
    endPosition: location().end.column, name: ':', infix: true}; }
  / "||"{ return { kind: 'functionName', lineNumber: location().start.line, startPosition: location().start.column,
    endPosition: location().end.column, name: '||', infix: true}; }
  / "_" { return { kind: "functionName", isUnderscore: true } }

integer
  = digits:[0-9]+ { return { kind: "int", lineNumber: location().start.line, startPosition: location().start.column,
    endPosition: location().end.column, value: parseInt(digits.join(""), 10)} ; }
  / "_" { return { kind: "int", isUnderscore: true } }

whitespace
  = " "+

whitespace_newline
  = [ \n]+