/* eslint-disable max-len */
/* eslint-disable no-use-before-define */
export default function visit(node1, node2, savedValue, array, isPerfect) {
  if (node1 !== undefined && node1.kind !== undefined) {
    if (!node2 || node2.isUnderscore) {
      return array;
    }
    if (!node2.isUnderscore) {
      if (node1.kind !== node2.kind) {
        if (node1.kind === 'bracketedExpression') {
          node1 = node1.expression;
        } else if (node2.kind === 'bracketedExpression') {
          node2 = node2.expression;
        } else {
          array.push({
            name: node1.kind, lineNumber: node1.lineNumber, startPosition: node1.startPosition, endPosition: node1.endPosition, message: `Unexpected kind '${node1.kind}'. Expected '${node2.kind}'.`,
          });
        }
      } else {
        switch (node1.kind) {
          case 'functionDefinition': return visitFunctionDefinition(node1, node2, savedValue, array, isPerfect);
          case 'pattern': return visitPattern(node1, node2, savedValue, array);
          case 'listPattern': return visitListPattern(node1, node2, savedValue, array);
          case 'emptyListPattern': return visitEmptyListPattern(node1, node2, savedValue, array);
          case 'typeSignature': return visitTypeSignature(node1, node2, savedValue, array);
          case 'functionApplication': return visitFunctionApplication(node1, node2, savedValue, array);
          case 'functionName': return visitFunctionName(node1, node2, savedValue, array);
          case 'bracketedExpression': return visitBracketedexpression(node1, node2, savedValue, array);
          case 'arrayType': return visitArrayType(node1, node2, savedValue, array);
          case 'type': return visitType(node1, node2, savedValue, array);
          case 'expression': return visitExpression(node1, node2, savedValue, array);
          default: return null;
        }
      }
    }
  }
  return array;
}

function checkIfDollar(value2) {
  if (value2 !== undefined && value2.name !== undefined) {
    return value2.name[0] === '$';
  }
  return false;
}

function checkDollarValues(userValue, rightValue, array, savedValue) {
  let value = false;
  Object.values(savedValue).forEach((element) => {
    if (element.dollarValue === rightValue.name) {
      value = true;
      if (element.correspondent !== userValue.name) {
        array.push({
          name: userValue.name, lineNumber: userValue.lineNumber, startPosition: userValue.startPosition, endPosition: userValue.endPosition, message: `The value '${userValue.name}' is not the expected one. Use '${element.correspondent}' instead. `,
        });
      }
    }
  });
  if (!value) {
    savedValue.push({ dollarValue: rightValue.name, correspondent: userValue.name });
  }
}
function visitTypeSignature(node1, node2, savedValue, array) {
  if (!node2.isUnderscore) {
    if (node1.types.length !== node2.types.length) {
      array.push({
        name: '', lineNumber: node1.lineNumber, startPosition: node1.startPosition, endPosition: node1.endPosition, message: `Expected ${node2.types.length} types in the type signature instead of ${node1.types.length}. `,
      });
    } else {
      for (let i = 0; i < node1.types.length; i += 1) {
        array.concat(visit(node1.types[i], node2.types[i], savedValue, array));
      }
      return array;
    }
  }
  return array;
}

function visitFunctionDefinition(node1, node2, savedValue, array, isPerfect) {
  if (!node2.isUnderscore) {
    if (checkIfDollar(node2)) {
      if (node1.name.length <= 4) {
        array.push({
          name: node1.name, lineNumber: node1.lineNumber, startPosition: node1.nameStartPosition, endPosition: node1.nameEndPosition, message: 'Choose a better function name.',
        });
      }
      checkDollarValues(node1, node2, array, savedValue);
    } else if (node1.name !== node2.name && node2.name !== undefined) {
      if (node1.name.length <= 4) {
        array.push({
          name: node1.name, lineNumber: node1.lineNumber, startPosition: node1.nameStartPosition, endPosition: node1.nameEndPosition, message: 'Choose a better function name.',
        });
      }
      array.push({
        name: node1.name, lineNumber: node1.lineNumber, startPosition: node1.nameStartPosition, endPosition: node1.nameEndPosition, message: `Wrong function name '${node1.name}'. Use '${node2.name}' instead.`,
      });
    }
  }

  array.concat(visitTypeSignature(node1.typeSignature, node2.typeSignature, savedValue, array));
  if (isPerfect) {
    if (node1.patterns.length < node2.patterns.length) {
      array.push({
        name: '', lineNumber: node1.lineNumber, startPosition: 'The function is incomplete', endPosition: node1.endPosition, message: `Expected ${node2.patterns.length} patterns in the implementation. Found ${node1.patterns.length}. `,
      });
    } else {
      return array;
    }
  }
  for (let i = 0; i < node1.patterns.length; i += 1) {
    array.concat(visit(node1.patterns[i], node2.patterns[i], savedValue, array));
  }
  return array;
}

function visitType(node1, node2, savedValue, array) {
  if (!node2.isUnderscore) {
    if (node1.name !== node2.name) {
      array.push({
        name: node1.name, lineNumber: node1.lineNumber, startPosition: node1.startPosition, endPosition: node1.endPosition, message: 'The type signature you provided is not correct.',
      });
    }
  }
  return array;
}

function visitArrayType(node1, node2, savedValue, array) {
  if (node2.isUnderscore) {
    return array;
  }
  if (node1.name !== node2.name) {
    array.push({
      name: node1.name, lineNumber: node1.lineNumber, startPosition: node1.startPosition, endPosition: node1.endPosition, message: 'The type signature you provided is not correct.',
    });
  }
  return array;
}

function visitPattern(node1, node2, savedValue, array) {
  if (!node2.isUnderscore) {
    if (checkIfDollar(node2)) {
      checkDollarValues(node1, node2, array, savedValue);
    } else if (node1.name !== node2.name) {
      array.push({
        name: node1.name, lineNumber: node1.lineNumber, startPosition: node1.startPosition, endPosition: node1.endPosition, message: `The name of the function '${node1.name}' is not correct. Use '${node2.name}' instead.`,
      });
    }
  }
  if (node1.arguments.length !== node2.arguments.length) {
    const { startPosition } = node1.arguments[0] || node1;
    const { endPosition } = node1.arguments[node1.arguments.length - 1] || node1;

    array.push({
      name: '', lineNumber: node1.lineNumber, startPosition, endPosition, message: `Expected ${node2.arguments.length} arguments for this function. Found ${node1.arguments.length}. `,
    });
  } else {
    for (let i = 0; i < node1.arguments.length; i += 1) {
      array.concat(visit(node1.arguments[i], node2.arguments[i], savedValue, array));
    }
  }
  return array.concat(visit(node1.expression, node2.expression, savedValue, array));
}

function visitEmptyListPattern(node1, node2, savedValue, array) {
  if (!node2.isUnderscore) {
    if (checkIfDollar(node2)) {
      checkDollarValues(node1, node2, array, savedValue);
    } else if (node1.value !== node2.value) {
      array.push({
        name: node1.value, lineNumber: node1.lineNumber, startPosition: node1.startPosition, endPosition: node1.endPosition, message: 'Expected empty list pattern.',
      });
      return array;
    }
  }
  return array;
}

function visitListPattern(node1, node2, savedValue, array) {
  if (!node2.left.isUnderscore) {
    if (checkIfDollar(node2.left)) {
      checkDollarValues(node1.left, node2.left, array, savedValue);
    } else if (node1.left.name !== node2.left.name) {
      array.push({
        name: node1.left.name, lineNumber: node1.left.lineNumber, startPosition: node1.left.startPosition, endPosition: node1.left.endPosition, message: `Unexpected left argument for list '${node1.left.name}'. Use '${node2.left.name}' instead.`,
      });
    }
  }
  if (node1.left.infix !== node2.left.infix) {
    array.push({
      name: node1.left.infix, lineNumber: node1.left.lineNumber, startPosition: node1.left.startPosition, endPosition: node1.left.endPosition, message: `Expected '${node2.left.infix ? 'infix' : 'prefix'}'.`,
    });
  }

  if (!node2.right.isUnderscore) {
    if (checkIfDollar(node2.right)) {
      checkDollarValues(node1.right, node2.right, array, savedValue);
    } else if (node1.right.name !== node2.right.name) {
      array.push({
        name: node1.right.name, lineNumber: node1.right.lineNumber, startPosition: node1.right.startPosition, endPosition: node1.right.endPosition, message: `Unexpected right argument for list '${node1.right.name}'. Use '${node2.right.name}' instead.`,
      });
    }
    if (node1.right.infix !== node2.right.infix) {
      array.push({
        name: node1.right.infix, lineNumber: node1.right.lineNumber, startPosition: node1.right.startPosition, endPosition: node1.right.endPosition, message: `Expected '${node2.right.infix ? 'infix' : 'prefix'}'.`,
      });
    }
  }
  return array;
}

function visitFunctionName(node1, node2, savedValue, array) {
  if (!node2.isUnderscore) {
    if (checkIfDollar(node2)) {
      checkDollarValues(node1, node2, array, savedValue);
    } else if (node1.name !== node2.name) {
      array.push({
        name: node1.name, lineNumber: node1.lineNumber, startPosition: node1.startPosition, endPosition: node1.endPosition, message: `Unexpected function name '${node1.name}'. Use '${node2.name}' instead.`,
      });
    }
    if (node1.infix !== node2.infix) {
      array.push({
        name: node1.infix, lineNumber: node1.lineNumber, startPosition: node1.startPosition, endPosition: node1.endPosition, message: `Expected function '${node1.name}' to be applied '${node2.infix ? 'infix' : 'prefix'}'.`,
      });
    }
    return array;
  }
  return array;
}

// eslint-disable-next-line consistent-return
function visitExpression(node1, node2, savedValue, array) {
  if (node2.isUnderscore) return array;
}

function visitFunctionApplication(node1, node2, savedValue, array) {
  if (!node2.isUnderscore) {
    if (node1.arguments.length !== node2.arguments.length) {
      array.push({
        name: '', lineNumber: node1.lineNumber, startPosition: node1.startPosition, endPosition: node1.endPosition, message: `Expected ${node2.arguments.length} arguments for this function. Found ${node1.arguments.length}. `,
      });
    } else {
      for (let i = 0; i < node1.arguments.length && i < node2.arguments.length; i += 1) {
        array.concat(visit(node1.arguments[i], node2.arguments[i], savedValue, array));
      }
    }
    return array.concat(visit(node1.functionName, node2.functionName, savedValue, array));
  }
  return array;
}

function visitBracketedexpression(node1, node2, savedValue, array) {
  if (!node2.isUnderscore) {
    return array.concat(visit(node1.expression, node2.expression, savedValue, array));
  }
  return array;
}
