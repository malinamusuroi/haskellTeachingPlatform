{
  function randomId() { return '_' + Math.random().toString(36).substr(2, 9) }
}

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
    endLineNumber: location().end.line,
    name: typeSignature && typeSignature.functionName && typeSignature.functionName.name,
    nameStartPosition: typeSignature && typeSignature.functionName && typeSignature.functionName.startPosition,
    nameEndPosition:typeSignature && typeSignature.functionName && typeSignature.functionName.endPosition,
    typeSignature: typeSignature,
    patterns: patterns,
    isValidApplication: function(functionArguments) { return functionArguments.length === patterns[0].arguments.length}
  }; }
 
functionDefinitionTypeSignature = functionName:functionName whitespace* "::" whitespace* head:type tail:arrowAndType* whitespace* {
	return {
    	kind: "typeSignature",
        lineNumber: location().start.line,
        startPosition: location().start.column,
        endPosition: location().end.column,
    	types: [head].concat(tail),
        functionName: functionName
    }
}
/ "_" { return { kind: "typeSignature", isUnderscore: true } }

arrayType = "["whitespace* type:type whitespace* "]" { return { kind: "arrayType", name: type.name, lineNumber: location().start.line, startPosition: location().start.column,
    endPosition: location().end.column, isUnderscore: type.isUnderscore } }
type = arrayType:arrayType { return arrayType }
     / type:[A-Za-z]+ { return {kind: "type", name: type.join(""), lineNumber: location().start.line, startPosition: location().start.column,
    endPosition: location().end.column} }
     / "_" { return { kind: "type", lineNumber: location().start.line, startPosition: location().start.column,
    endPosition: location().end.column, isUnderscore: true } }
     
arrowAndType = whitespace* "->" whitespace* type:type { return type };

functionDefinitionPatternLine
  = "\n" functionName:functionName part:functionDefinitionPatternPartOfLine whitespace* { return {
    kind: "pattern",
    name: functionName.name,
    isUnderscore: functionName.isUnderscore,
    lineNumber: part.lineNumber,
    startPosition: functionName.startPosition,
    endPosition: functionName.endPosition,
    arguments: part.arguments,
    expression: part.expression,
    doesMatch: part.doesMatch,
    apply: part.apply,
  }}
  / "\n"* "_" { return { kind: "pattern", isUnderscore: true } };

functionDefinitionPatternPartOfLine
  = patternArguments:patternWithWhitespace* whitespace? "=" whitespace* exp:expressionWithFunction { return {
    definitionLine: text(),
    numberOfArguments: patternArguments.length,
    kind: "pattern",
    lineNumber: location().start.line,
    startPosition: location().start.column,
    endPosition: location().end.column,
    arguments: patternArguments,
    expression: exp,
    doesMatch: function(args) {
      for (var i=0; i<patternArguments.length; i++) {
        if(patternArguments[i].doesMatch && !patternArguments[i].doesMatch(args[i])) return false;
      }
      return true;
    },
    apply: function(functionArguments) { return ASTTransformations.fillInArguments(exp, patternArguments, functionArguments); }
  }; }

patternWithWhitespace
  = whitespace pattern:pattern { return pattern; }

pattern
  = "[" whitespace* "]" { return {id: randomId(), kind: "emptyListPattern", lineNumber: location().start.line, startPosition: location().start.column,
    endPosition: location().end.column, value: "[]", doesMatch: function(arg) { return arg.kind === "list" && arg.items.length === 0}}}
  / "(" whitespace* left:functionName whitespace* ":" whitespace*  right:functionName whitespace* ")" { return {id: randomId(), kind: "listPattern", lineNumber: location().start.line, startPosition: location().start.column,
    endPosition: location().end.column, left: left, right: right, doesMatch: function(arg) { return arg.kind === "list" && arg.items.length > 0 } }; }
  / functionName
  / integer:integer {integer.doesMatch = function(arg) { return arg.kind === "int" && arg.value === integer.value; }; return integer; }

expression
  = "(" whitespace? exp:expressionWithFunction whitespace? ")" { return { kind: "bracketedExpression", lineNumber: location().start.line, startPosition: location().start.column,
    endPosition: location().end.column, expression: exp } }
  / functionApplication
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
  = f:functionName whitespace args:expression_list {return { id: randomId(), kind: 'functionApplication', lineNumber: location().start.line, startPosition: location().start.column,
    endPosition: location().end.column, functionName: f, arguments: args}}
  / "_" { return { id: randomId(), kind: "functionApplication", lineNumber: location().start.line, startPosition: location().start.column,
    endPosition: location().end.column, isUnderscore: true } };

infixFunctionApplication
  = left:expression whitespace? f:infixFunctionName whitespace? right:expressionWithFunction { return { id: randomId(), kind: "functionApplication", lineNumber: location().start.line, startPosition: location().start.column, endPosition: location().end.column, functionName: f, arguments: [left, right]}}

expression_list
  = exp1:expression list:(whitespace_expression)* { list.unshift(exp1); return list; }

whitespace_expression
  = whitespace exp:expression { return exp; }

list
  = "[" whitespace? list:comma_expression_list? whitespace? "]" { return { id: randomId(), kind: "list", lineNumber: location().start.line, startPosition: location().start.column, endPosition: location().end.column, items: list || [] }; }
  / "_" { return { kind: "list", isUnderscore: true } }

comma_expression_list
  = exp1:expression list:(comma_expression)* { list.unshift(exp1); return list; }

comma_expression
  = whitespace? "," whitespace? exp:expression { return exp; }

functionName
  = dollar:"$"? letters:[A-Za-z]+ { return { id: randomId(),  kind: 'functionName', lineNumber: location().start.line, startPosition: location().start.column,
    endPosition: location().end.column, name: (dollar || "") + letters.join(""), infix: false}; }
  / "_" { return { id: randomId(), kind: "functionName", lineNumber: location().start.line, startPosition: location().start.column,
    endPosition: location().end.column, isUnderscore: true } }

infixFunctionName
  = "+" { return {id: randomId(), kind: 'functionName', lineNumber: location().start.line, startPosition: location().start.column,
    endPosition: location().end.column, name: '+', infix: true}; }
  / "-" { return {id: randomId(), kind: 'functionName', lineNumber: location().start.line, startPosition: location().start.column,
    endPosition: location().end.column, name: '-', infix: true}; }
  / ":" { return {id: randomId(), kind: 'functionName', lineNumber: location().start.line, startPosition: location().start.column,
    endPosition: location().end.column, name: ':', infix: true}; }
  / "||"{ return {id: randomId(), kind: 'functionName', lineNumber: location().start.line, startPosition: location().start.column,
    endPosition: location().end.column, name: '||', infix: true}; }
  / "_" { return {id: randomId(), kind: "functionName", isUnderscore: true } }

integer
  = digits:[0-9]+ { return { id: randomId(),  kind: "int", lineNumber: location().start.line, startPosition: location().start.column,
    endPosition: location().end.column, value: parseInt(digits.join(""), 10)} ; }
  / "_" { return { id: randomId(), kind: "int", isUnderscore: true } }

whitespace
  = " "+

whitespace_newline
  = [ \n]+