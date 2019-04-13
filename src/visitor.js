export default function visit(node1, node2) {
    if(node1.kind != node2.kind) return false;
    switch(node1.kind) {
        case "functionDefinition": return visitFunctionDefinition(node1, node2);
        case "pattern": return visitPattern(node1, node2);
        case "listPattern": return visitListPattern(node1, node2);
        case "emptyListPattern": return visitEmptyListPattern(node1, node2);
        case "functionApplication": return visitFunctionApplication(node1, node2);
        case "functionName": return visitFunctionName(node1, node2);
        case "bracketedExpression": return visitBracketedexpression(node1, node2);
    }
}

function visitFunctionDefinition(node1, node2) {
  let val =  (node1.name === node2.name) && (node1.typeSignature === node2.typeSignature)
  for (let i = 0; i <  node1.patterns.length; i++) {
      val = val && visit(node1.patterns[i], node2.patterns[i]);
  } 
    return val;
}

function visitPattern(node1, node2) {
    let argumentVal = true;
    for (let i = 0; i < node1.arguments.length; i++) {
            argumentVal = argumentVal && visit(node1.arguments[i], node2.arguments[i]);
    }
    return argumentVal && visit(node1.expression, node2.expression);
 }
  
function visitEmptyListPattern(node1, node2) {
    return node1.value === node2.value;
}

function visitListPattern(node1, node2) {
    return visit(node1.left, node2.left) && visit(node1.right, node2.right);
}

function visitFunctionName(node1, node2) {
    return node1.name === node2.name && node1.infix === node2.infix;
}

function visitFunctionApplication(node1, node2) {
    let argumentVal = true;
    for (let i = 0; i <  node1.arguments.length; i++) {
            argumentVal = argumentVal && visit(node1.arguments[i], node2.arguments[i]);
    }
    return visit(node1.functionName, node2.functionName) && argumentVal;
}

function visitBracketedexpression(node1, node2) {
    return visit(node1.expression, node2.expression);
}