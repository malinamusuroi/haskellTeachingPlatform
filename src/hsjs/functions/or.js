window.functions['||'] = {
    name: '||',
    englishName: 'or',
    color: 'purple',
    infix: true,
    typeSignature: 'Bool -> Bool -> Bool',
    isValidApplication: function(_arguments) {
      return _arguments.length === 2      &&
      _arguments[0].kind === 'bool' &&
      _arguments[1].kind === 'bool';
    },
    patterns: [
      {
        definitionLine: null,
        doesMatch: function(_arguments){
          return true;
        },
        apply: function(_arguments){
          return {
                   id: '_' + Math.random().toString(36).substr(2, 9),
                   kind: 'bool',
                   value: (_arguments[0].value === 'True' || _arguments[1].value === 'True') ? 'True' : 'False'
                 };
        }
      }
    ]
  };
  