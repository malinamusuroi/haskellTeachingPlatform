/* eslint-disable no-use-before-define */
import visit from './visitor';

export default function visitWithExpression(node1, node2, array) {
  if (node1 !== undefined && node1.kind !== undefined) {
    switch (node1.kind) {
      case 'functionDefinition': return visitFunctionDefinition(node1, node2, array);
      case 'pattern': return visitPattern(node1, node2, array);
      case 'listPattern': return visitListPattern(node1, node2, array);
      case 'emptyListPattern': return visitEmptyListPattern(node1, node2, array);
      case 'functionApplication': return visitFunctionApplication(node1, node2, array);
      case 'functionName': return visitFunctionName(node1, node2, array);
      case 'bracketedExpression': return visitBracketedexpression(node1, node2, array);
      case 'list': return visitList(node1, node2, array);
      case 'expression': return visitExpression(node1, node2, array);
      case 'patternGuards': return visitPatternGuards(node1, node2, array);
      default: return null;
    }
  }
  return array;
}

function displayErrorIfSame(node1, node2) {
  if (visit(node1, node2, [], []).length === 0) {
    return {
      name: node1.name,
      lineNumber: node1.lineNumber,
      startPosition: node1.startPosition,
      endPosition: node1.endPosition,
    };
  }
  return null;
}

function visitFunctionDefinition(node1, node2, array) {
  if (node1.kind === node2.kind) {
    array.push(displayErrorIfSame(node1, node2));
  }

  visitWithExpression(node1.expression, node2, array);

  for (let i = 0; i < node1.patterns.length; i += 1) {
    visitWithExpression(node1.patterns[i], node2, array);
  }
  return array;
}

function visitListPattern(node1, node2, array) {
  if (node1.kind === node2.kind) {
    array.push(displayErrorIfSame(node1, node2));
  }
  return array;
}

function visitEmptyListPattern(node1, node2, array) {
  if (node1.kind === node2.kind) {
    array.push(displayErrorIfSame(node1, node2));
  }
  return array;
}

function visitFunctionName(node1, node2, array) {
  if (node1.kind === node2.kind) {
    array.push(displayErrorIfSame(node1, node2));
  }
  return array;
}

function visitExpression(node1, node2, array) {
  if (node1.kind === node2.kind) {
    array.push(displayErrorIfSame(node1, node2));
  }
  return array;
}

function visitPattern(node1, node2, array) {
  if (node1.kind === node2.kind) {
    array.push(displayErrorIfSame(node1, node2));
  }
  for (let i = 0; i < node1.arguments.length; i += 1) {
    visitWithExpression(node1.arguments[i], node2, array);
  }
  visitWithExpression(node1.expression, node2, array);
  return array;
}

function visitPatternGuards(node1, node2, array) {
  if (node1.kind === node2.kind) {
    array.push(displayErrorIfSame(node1, node2));
  }
  for (let i = 0; i < node1.arguments.length; i += 1) {
    visitWithExpression(node1.arguments[i], node2, array);
  }

  node1.guards.forEach((guard) => {
    visitWithExpression(guard.condition, node2, array);
    visitWithExpression(guard.expression, node2, array);
  });

  return array;
}

function visitFunctionApplication(node1, node2, array) {
  if (node1.kind === node2.kind) {
    array.push(displayErrorIfSame(node1, node2));
  }
  if (!node2.isUnderscore) {
    for (let i = 0; i < node1.arguments.length; i += 1) {
      visitWithExpression(node1.arguments[i], node2, array);
    }
    visitWithExpression(node1.functionName, node2, array);
  }
  return array;
}

function visitBracketedexpression(node1, node2, array) {
  if (node1.kind === node2.kind) {
    array.push(displayErrorIfSame(node1, node2));
  }
  if (!node2.isUnderscore) {
    visitWithExpression(node1.expression, node2, array);
  }
  return array;
}

function visitList(node1, node2, array) {
  if (node1.kind === node2.kind) {
    array.push(displayErrorIfSame(node1, node2));
  }
  if (!node2.isUnderscore) {
    for (let i = 0; i < node1.items.length; i += 1) {
      visitWithExpression(node1.items[i], node2, array);
    }
  }
  return array;
}
