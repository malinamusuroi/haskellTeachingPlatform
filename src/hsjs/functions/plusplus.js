/* eslint-disable */

window.functions['++'] = {
  name: '++',
  englishName: 'plusplus',
  color: 'purple',
  infix: true,
  typeSignature: '[Int] -> [Int] -> [Int]',
  isValidApplication: function(_arguments) {
    return _arguments.length === 2      &&
    _arguments[0].kind === 'list' &&
    _arguments[1].kind === 'list';
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
                 kind: 'list',
                 items: _arguments[0].items.concat(_arguments[1].items),
               };
      }
    }
  ]
};
