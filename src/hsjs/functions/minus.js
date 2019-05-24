window.functions['-'] = {
  name: '-',
  englishName: 'minus',
  color: 'purple',
  infix: true,
  typeSignature: 'Int -> Int -> Int',
  isValidApplication: function(_arguments) {
    return _arguments.length === 2      &&
    _arguments[0].kind === 'int' &&
    _arguments[1].kind === 'int';
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
                 kind: 'int',
                 value: _arguments[0].value - _arguments[1].value
               };
      }
    }
  ]
};
