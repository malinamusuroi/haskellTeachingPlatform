/* eslint-disable max-len */
/* eslint-disable no-use-before-define */
export default function visit(node1, node2, savedValue, array, isPerfect) {
  if (node1 !== undefined && node1.kind !== undefined) {
    if (!node2 || node2.isUnderscore) {
      return array;
    }
    if (!node2.isUnderscore) {
      if (node1.kind !== node2.kind) {
        array.push({
          name: node1.kind, lineNumber: node1.lineNumber, startPosition: node1.startPosition, endPosition: node1.endPosition, message: `You wrote '${node1.text}', but we're expecting ${description(node2.kind)}`,
        });
      } else {
        switch (node1.kind) {
          case 'functionDefinition': return visitFunctionDefinition(node1, node2, savedValue, array, isPerfect);
          case 'pattern': return visitPattern(node1, node2, savedValue, array);
          case 'patternGuards': return visitPatternGuards(node1, node2, savedValue, array);
          case 'patternGuard': return visitPatternGuard(node1, node2, savedValue, array);
          case 'listPattern': return visitListPattern(node1, node2, savedValue, array);
          case 'emptyListPattern': return visitEmptyListPattern(node1, node2, savedValue, array);
          case 'typeSignature': return visitTypeSignature(node1, node2, savedValue, array);
          case 'functionApplication': return visitFunctionApplication(node1, node2, savedValue, array);
          case 'functionName': return visitFunctionName(node1, node2, savedValue, array);
          case 'bracketedExpression': return visitBracketedexpression(node1, node2, savedValue, array);
          case 'arrayType': return visitArrayType(node1, node2, savedValue, array);
          case 'type': return visitType(node1, node2, savedValue, array);
          case 'bool': return visitBool(node1, node2, savedValue, array);
          case 'list': return visitList(node1, node2, savedValue, array);
          case 'expression': return visitExpression(node1, node2, savedValue, array);
          default: return null;
        }
      }
    }
  }
  return array;
}

function description(kind) {
  switch (kind) {
    case 'functionDefinition': return "a function definition";
    case 'pattern': return "a function pattern";
    case 'patternGuards': return "function pattern guards";
    case 'patternGuard': return "a function pattern guard";
    case 'listPattern': return "pattern matching over a list, such as '(x: xs)'";
    case 'emptyListPattern': return "pattern matching over an empty list, such as '[]'";
    case 'typeSignature': return "a type signature, such as 'f :: [Int] -> Int'";
    case 'functionApplication': return "a function call, such as 'f 1 2'";
    case 'functionName': return "a function name or a variable name, such as 'f' or 'x'";
    case 'bracketedExpression': return "a bracketed expression, such as '(1 + 2)'";
    case 'arrayType': return "a list type, such as '[Int]'";
    case 'type': return "a type, such as 'Int'";
    case 'bool': return "a boolean literal, such as True or False";
    case 'list': return "a list literal, such as [1,2,3]";
    case 'expression': return "an expression, such as '1 + 2'";
    default: return null;
  }
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
      if (node1.name.length < 3) {
        array.push({
          name: node1.name, lineNumber: node1.lineNumber, startPosition: node1.nameStartPosition, endPosition: node1.nameEndPosition, message: 'Your function name is too short. Use a more descriptive name',
        });
      }
      checkDollarValues(node1, node2, array, savedValue);
    } else if (node1.name !== node2.name && node2.name !== undefined) {
      if (node1.name.length < 3) {
        array.push({
          name: node1.name, lineNumber: node1.lineNumber, startPosition: node1.nameStartPosition, endPosition: node1.nameEndPosition, message: 'Your function name is too short. Use a more descriptive name',
        });
      }
      array.push({
        name: node1.name, lineNumber: node1.lineNumber, startPosition: node1.nameStartPosition, endPosition: node1.nameEndPosition, message: `You wrote '${node1.name}', but we're expecting another name`,
      });
    }
  }

  array.concat(visitTypeSignature(node1.typeSignature, node2.typeSignature, savedValue, array));
  if (isPerfect) {
    if (node1.patterns.length < node2.patterns.length) {
      array.push({
        name: '', lineNumber: node1.lineNumber, startPosition: 'The function is incomplete', endPosition: node1.endPosition, message: `Expected ${node2.patterns.length} patterns in the implementation. Found ${node1.patterns.length}`,
      });
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
        name: node1.name, lineNumber: node1.lineNumber, startPosition: node1.startPosition, endPosition: node1.endPosition, message: `You defined the type signature to be ${node1.text}, but we're expecting another type signature`,
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
      name: node1.name, lineNumber: node1.lineNumber, startPosition: node1.startPosition, endPosition: node1.endPosition, message: `You defined the type signature to be ${node1.text}, but we're expecting another type signature`,
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
        name: node1.name, lineNumber: node1.lineNumber, startPosition: node1.startPosition, endPosition: node1.endPosition, message: `You defined the function '${node1.name}', but we're expecting another function name`,
      });
    }
  }
  if (node1.arguments.length !== node2.arguments.length) {
    const { startPosition } = node1.arguments[0] || node1;
    const { endPosition } = node1.arguments[node1.arguments.length - 1] || node1;

    array.push({
      name: '', lineNumber: node1.lineNumber, startPosition, endPosition, message: `Your function has ${node1.arguments.length} arguments but we're expecting ${node2.arguments.length} arguments`,
    });
  } else {
    for (let i = 0; i < node1.arguments.length; i += 1) {
      array.concat(visit(node1.arguments[i], node2.arguments[i], savedValue, array));
    }
  }
  return array.concat(visit(node1.expression, node2.expression, savedValue, array));
}

function visitPatternGuards(node1, node2, savedValue, array) {
  let errors = [...array];
  if (!node2.isUnderscore) {
    if (checkIfDollar(node2)) {
      checkDollarValues(node1, node2, array, savedValue);
    } else if (node1.name !== node2.name) {
      errors.push({
        name: node1.name, lineNumber: node1.lineNumber, startPosition: node1.startPosition, endPosition: node1.endPosition, message: `You defined the function '${node1.name}', but we're expecting another function name`,
      });
    }
  }
  if (node1.arguments.length !== node2.arguments.length) {
    const { startPosition } = node1.arguments[0] || node1;
    const { endPosition } = node1.arguments[node1.arguments.length - 1] || node1;

    errors.push({
      name: '', lineNumber: node1.lineNumber, startPosition, endPosition, message: `Your function has ${node1.arguments.length} arguments but we're expecting ${node2.arguments.length} arguments`,
    });
  } else {
    for (let i = 0; i < node1.arguments.length; i += 1) {
      errors = errors.concat(visit(node1.arguments[i], node2.arguments[i], savedValue, array));
    }
  }
  for (let i = 0; i < node1.guards.length; i += 1) {
    errors = errors.concat(visit(node1.guards[i], node2.guards[i], savedValue, array));
  }
  return errors;
}

function visitPatternGuard(node1, node2, savedValue, array) {
  const errors = array.concat(visit(node1.condition, node2.condition, savedValue, array));
  return errors.concat(visit(node1.expression, node2.expression, savedValue, array));
}

function visitEmptyListPattern(node1, node2, savedValue, array) {
  if (!node2.isUnderscore) {
    if (checkIfDollar(node2)) {
      checkDollarValues(node1, node2, array, savedValue);
    } else if (node1.value !== node2.value) {
      array.push({
        name: node1.value, lineNumber: node1.lineNumber, startPosition: node1.startPosition, endPosition: node1.endPosition, message: `You used ${node1.text}, but we're expecting an empty list pattern ([])`,
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
        name: node1.left.name, lineNumber: node1.left.lineNumber, startPosition: node1.left.startPosition, endPosition: node1.left.endPosition, message: `You used ${node1.left.text} as the left operand in the list pattern match, but we're expecting something else`,
      });
    }
  }
  if (node1.left.infix !== node2.left.infix) {
    array.push({
      name: node1.left.infix, lineNumber: node1.left.lineNumber, startPosition: node1.left.startPosition, endPosition: node1.left.endPosition, message: `You've written a ${node1.left.infix ? 'infix' : 'prefix'} function call, but we're expecting it to be ${node2.left.infix ? 'infix' : 'prefix'}`,
    });
  }

  if (!node2.right.isUnderscore) {
    if (checkIfDollar(node2.right)) {
      checkDollarValues(node1.right, node2.right, array, savedValue);
    } else if (node1.right.name !== node2.right.name) {
      array.push({
        name: node1.right.name, lineNumber: node1.right.lineNumber, startPosition: node1.right.startPosition, endPosition: node1.right.endPosition, message: `You used ${node1.right.text} as the right operand in the list pattern match, but we're expecting something else`,
      });
    }
    if (node1.right.infix !== node2.right.infix) {
      array.push({
        name: node1.right.infix, lineNumber: node1.right.lineNumber, startPosition: node1.right.startPosition, endPosition: node1.right.endPosition, message: `You've written a ${node1.right.infix ? 'infix' : 'prefix'} function call, but we're expecting it to be ${node2.right.infix ? 'infix' : 'prefix'}`,
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
        name: node1.name, lineNumber: node1.lineNumber, startPosition: node1.startPosition, endPosition: node1.endPosition, message: `You used the function name '${node1.name}', but we're expecting something else`,
      });
    }
    if (node1.infix !== node2.infix) {
      array.push({
        name: node1.infix, lineNumber: node1.lineNumber, startPosition: node1.startPosition, endPosition: node1.endPosition, message: `You've written a ${node1.infix ? 'infix' : 'prefix'} function call, but we're expecting it to be ${node2.infix ? 'infix' : 'prefix'}`,
      });
    }
    return array;
  }
  return array;
}

function visitBool(node1, node2, savedValue, array) {
  if (node1.value !== node2.value) {
    array.push({
      name: " ", lineNumber: node1.lineNumber, startPosition: node1.startPosition, endPosition: node1.endPosition, message: `You used the boolean literal ${node1.text}, but we're expecting something else`,
    });
  }
  return array;
}

function visitList(node1, node2, savedValue, array) {
  let errors = [...array];

  if (node1.items.length !== node2.items.length) {
    array.push({
      name: '',
      lineNumber: node1.lineNumber,
      startPosition: node1.startPosition,
      endPosition: node1.endPosition,
      message: `You wrote a list with ${node1.items.length} items, but we're expecting a different number of items`,
    });
  } else {
    for (let i = 0; i < node1.items.length; i += 1) {
      errors = errors.concat(visit(node1.items[i], node2.items[i], savedValue, array));
    }
  }

  return errors;
}

// eslint-disable-next-line consistent-return
function visitExpression(node1, node2, savedValue, array) {
  if (node2.isUnderscore) return array;
}

function visitFunctionApplication(node1, node2, savedValue, array) {
  if (!node2.isUnderscore) {
    if (node1.arguments.length !== node2.arguments.length) {
      array.push({
        name: '', lineNumber: node1.lineNumber, startPosition: node1.startPosition, endPosition: node1.endPosition, message: `You passed ${node1.arguments.length} arguments to the '${node1.functionName.name}' function, but we expected a different number of arguments`,
      });
    } else {
      if (node1.functionName.name === '||') {
        const errors = commutativeCompare(node1, node2, savedValue, []);
        if (errors.length !== 0) {
          errors.forEach(error => array.push(error));
        }
      } else {
        for (let i = 0; i < node1.arguments.length && i < node2.arguments.length; i += 1) {
          array.concat(visit(node1.arguments[i], node2.arguments[i], savedValue, array));
        }
      }
    }
    return array.concat(visit(node1.functionName, node2.functionName, savedValue, array));
  }
  return array;
}

function commutativeCompare(node1, node2, savedValue) {
  const arguments1 = [...node1.arguments];
  const arguments2 = [...node2.arguments];

  let errors = [];

  while (arguments1.length !== 0 && arguments2.length !== 0) {
    const firstArgument = arguments1[0];
    const matchingIndex = arguments2.findIndex(arg => (
      visit(firstArgument, arg, savedValue, []).length === 0
    ));
    if (matchingIndex !== -1) {
      arguments2.splice(matchingIndex, 1); // Remove the matching argument.
    } else {
      errors = errors.concat([
        {
          name: firstArgument.name,
          lineNumber: firstArgument.lineNumber,
          startPosition: firstArgument.startPosition,
          endPosition: firstArgument.endPosition,
          message: `You used ${firstArgument.text} as the first argument, but we expected something else`,
        },
      ]);
    }
    arguments1.splice(0, 1); // Remove the first argument.
  }

  if (errors.length > 0) {
    if (errors.length > 1) {
      return [
        {
          name: node1.name,
          lineNumber: node1.lineNumber,
          startPosition: node1.startPosition,
          endPosition: node1.endPosition,
          message: `You wrote the arguments ${node1.text}, but we expected different arguments`,
        },
      ];
    }
    // errors[0].message = `Incorrect argument. Did you mean '${replaceDollars(arguments2[0].text, savedValue)}'?`;
    errors[0].message = `You wrote the arguments ${node1.text}, but we expected different arguments`;

    return errors;
  }

  if (arguments1.length !== arguments2.length) {
    return [
      {
        name: node1.name,
        lineNumber: node1.lineNumber,
        startPosition: node1.startPosition,
        endPosition: node1.endPosition,
        message: `You wrote the arguments ${node1.text}, but we're expecting a different number of arguments`,
      },
    ];
  }

  return [];
}

function replaceDollars(text, savedValue) {
  let returnValue = `${text}`;
  savedValue.forEach(({ dollarValue, correspondent }) => {
    returnValue = returnValue.replace(dollarValue, correspondent);
  });
  return returnValue;
}

function visitBracketedexpression(node1, node2, savedValue, array) {
  if (!node2.isUnderscore) {
    return array.concat(visit(node1.expression, node2.expression, savedValue, array));
  }
  return array;
}
