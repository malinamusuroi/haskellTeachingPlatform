window.functions['+'] = {
  name: '+',
  englishName: 'plus',
  color: 'purple',
  infix: true,
  typeSignature: 'Int -> Int -> Int',
  isValidApplication: function(_arguments) {
    return _arguments.length === 2      &&
    _arguments[0].type === 'int' &&
    _arguments[1].type === 'int';
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
                 type: 'int',
                 value: _arguments[0].value  + _arguments[1].value
               };
      }
    }
  ]
};
