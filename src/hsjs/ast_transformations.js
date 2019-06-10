
window.functions = {};
window.astNodeTypes = {};
const _ = require('lodash');

require('./functions/plus');
require('./functions/minus');
require('./functions/cons');
require('./functions/elem');
require('./functions/or');

var _isValidApplication = function(functionName, _arguments) {  // TODO REMOVE THIS METHOD
  // if (window.functions[functionName] != undefined){
  //   return window.functions[functionName].isValidApplication(_arguments);
  // } else {
  //   return false;
  // }
  return true;
};

var _matchingPatternIndex = function(func, _arguments){
  for (var i = 0; i < func.patterns.length; i ++){
    if (func.patterns[i].doesMatch(_arguments)){
      return i;
    }
  }
  throw "Inexhaustive pattern matching for function '" + func.name + "'.";
};

var _verifyApplication = function(node) {
  let node2 = node.kind === 'bracketedExpression' ? node.expression : node;

  if (node2.kind !== 'functionApplication') {
    throw 'node needs to be an application';
  }

  console.log("isVALidAPPPPPPPppp", node2.kind, node2.functionName.name, node2.arguments)
  if (!_isValidApplication(node2.functionName.name, node2.arguments)) {
    throw 'invalid application';
  }

  if (!window.functions[node2.functionName.name]) {
    throw 'function not defined for application';
  }
};

var _applyFunction = function(node) {
  _verifyApplication(node);

  var func = window.functions[node.functionName.name];
  var index = _matchingPatternIndex(func, node.arguments);
  return func.patterns[index].apply(node.arguments);
}

var _giveDifferentIds = function(AST) {
  if (AST.id) AST.id = '_' + Math.random().toString(36).substr(2, 9);
  var keys = Object.keys(AST)
  for (var i=0; i<keys.length; i++) {
    var value = AST[keys[i]];
    if (_.isArray(value)) {
      for(var j=0; j<value.length; j++) {
        _giveDifferentIds(value[j]);
      }
    } else if (_.isObject(value)) {
      _giveDifferentIds(value);
    }
  };
  return AST;
};

var _convertListPatternToSeparateArguments = function(patternArguments, functionArguments) {
  var newPatternArguments = [], newFunctionArguments = [];
  for (var i=0; i<patternArguments.length; i++) {
    var patternArgument = patternArguments[i];
    var functionArgument = functionArguments[i];
    if (patternArgument.kind === 'functionName') {
      newPatternArguments.push(patternArgument);
      newFunctionArguments.push(functionArgument);
    } else if (patternArgument.kind === 'emptyListPattern') {
      if (functionArgument.kind !== 'list' || functionArgument.items.length !== 0) {
        throw 'invalid empty list pattern';
      }
    } else if (patternArgument.kind === 'listPattern') {
      if (functionArgument.kind !== 'list' || functionArgument.items.length <= 0) {
        throw 'invalid list pattern';
      }
      newPatternArguments.push(patternArgument.left);
      newFunctionArguments.push(functionArgument.items[0]);
      newPatternArguments.push(patternArgument.right);
      newFunctionArguments.push({
        id: '_' + Math.random().toString(36).substr(2, 9),
        kind: 'list',
        items: functionArgument.items.slice(1)
      });
    }
  }

  return {patternArguments: newPatternArguments, functionArguments: newFunctionArguments};
};

function _fillInArgumentsInternal(AST, patternArguments, functionArguments) {
  var newAST = _giveDifferentIds(_.cloneDeep(AST));

  if (newAST.kind === 'bracketedExpression') {
    newAST = newAST.expression;
  }

  if (newAST.kind === 'functionName' && _.map(patternArguments, 'name').indexOf(newAST.name) >= 0) {
    newAST = _giveDifferentIds(_.cloneDeep(functionArguments[_.map(patternArguments, 'name').indexOf(newAST.name)]));
    newAST.id = '_' + Math.random().toString(36).substr(2, 9);
  } else if (_.isArray(newAST)) {
    newAST = newAST.map(function(item) {
      return _fillInArgumentsInternal(item, patternArguments, functionArguments);
    });
  } else if (newAST.kind === 'functionApplication') {
    newAST.functionName = _fillInArgumentsInternal(newAST.functionName, patternArguments, functionArguments);
    newAST.arguments = _fillInArgumentsInternal(newAST.arguments, patternArguments, functionArguments);
  } else if (newAST.kind === 'list') {
    newAST.items = _fillInArgumentsInternal(newAST.items, patternArguments, functionArguments);
  }
  return newAST;
};

window.ASTTransformations = {
  subtreeById: function(AST, id) {
    if (AST.id === id) {
      return AST;
    }

    var keys = Object.keys(AST)
    for (var i=0; i<keys.length; i++) {
      var value = AST[keys[i]];
      if (_.isArray(value)) {
        for(var j=0; j<value.length; j++) {
          var returnedAST = ASTTransformations.subtreeById(value[j], id);
          if (returnedAST) return returnedAST;
        }
      } else if (_.isObject(value)) {
        var returnedAST = ASTTransformations.subtreeById(value, id);
        if (returnedAST) return returnedAST;
      }
    };

    return null;
  },

  isApplicable: function(node) {
    return node.kind === 'functionApplication' &&
           _isValidApplication(node.functionName.name, node.arguments);
  },

  getContextHTML: function(AST, id) {
    var node = ASTTransformations.subtreeById(AST, id);
    if (!node) return '';
    _verifyApplication(node);
    return ' '

    // var func = window.functions[node.functionName.name];
    // var index = _matchingPatternIndex(func, node.arguments);
    // var functionName = '<em>' + (func.infix ? '(' : '') + func.name + (func.infix ? ')' : '') + '</em>';

    // //var html = functionName + ' :: ' + func.typeSignature;
    // if (func.patterns[index].definitionLine) {
    //  // html += '<br>' + functionName + ' ' + func.patterns[index].definitionLine
    // }
    // return html;
  },

  replaceSubtree: function(oldAST, id, newSubtree) {
    var newAST = _.cloneDeep(oldAST);
    var subtree = ASTTransformations.subtreeById(newAST, id);

    // delete all keys of subtree
    var keys = Object.keys(subtree)
    for (var i=0; i<keys.length; i++) {
      delete subtree[keys[i]];
    }

    _.extend(subtree, newSubtree);

    return newAST;
  },

  applyFunction: function(oldAST, id) {
    var subtree = ASTTransformations.subtreeById(oldAST, id);
    var newSubtree = _applyFunction(_giveDifferentIds(_.cloneDeep(subtree)));
    var newAST = ASTTransformations.replaceSubtree(oldAST, id, newSubtree);

    return {ast: newAST, justComputedId: newSubtree.id};
  },

  astToString: function(node) {
    var astNodeTypes = Object.keys(window.astNodeTypes);

    if ((astNodeTypes.indexOf(node.kind)) >= 0){
      return window.astNodeTypes[node.kind].astToString(node);
    } else {
      throw "cannot convert type '" + node.kind + "' to String";
    }
  },

  fillInArguments: function(AST, patternArguments, functionArguments) {
    var converted = _convertListPatternToSeparateArguments(patternArguments, functionArguments);
    return _fillInArgumentsInternal(AST, converted.patternArguments, converted.functionArguments);
  },

  fillInArgumentsGuard(guards, patternArguments, functionArguments) {
    var converted = _convertListPatternToSeparateArguments(patternArguments, functionArguments);

    for (const guard of guards) {
      const { condition } = guard;
      const { text: conditionText } = condition;

      if (conditionText.indexOf("otherwise") !== -1) {
        return _fillInArgumentsInternal(guard.expression, converted.patternArguments, converted.functionArguments);
      }

      converted.patternArguments.forEach((argument, index) => {
        const variable = argument.text;
        const value = converted.functionArguments[index].text;
        conditionText = conditionText.replace(variable, value);
      });
      const isConditionTrue = eval(conditionText);

      if (isConditionTrue) {
        return _fillInArgumentsInternal(guard.expression, converted.patternArguments, converted.functionArguments);
      }
    }
  }
};

export default window.ASTTransformations;
