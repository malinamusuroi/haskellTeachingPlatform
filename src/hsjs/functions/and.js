/* eslint-disable */

window.functions['&&'] = {
    name: '&&',
    englishName: 'and',
    color: 'purple',
    infix: true,
    typeSignature: 'Bool -> Bool -> Bool',
    isValidApplication: function(_arguments) {
      return _arguments.length === 2      &&
      (_arguments[0].kind === 'bool' ||
      _arguments[1].kind === 'bool');
    },
    patterns: [
      {
        definitionLine: null,
        doesMatch: function(_arguments){
          return true;
        },
        apply: function(_arguments){
            if (_arguments[0].value === 'False' || _arguments[1].value === 'False') {
                return {
                   id: '_' + Math.random().toString(36).substr(2, 9),
                   kind: 'bool',
                   value: 'False',
                 };
            } else if (_arguments[0].value === 'True') {
                return {
                    ..._arguments[1],
                    id: '_' + Math.random().toString(36).substr(2, 9),
                  };
            } else if (_arguments[1].value === 'True') {
                return {
                    ..._arguments[0],
                    id: '_' + Math.random().toString(36).substr(2, 9),
                  };
            }
        }
      }
    ]
  };
  