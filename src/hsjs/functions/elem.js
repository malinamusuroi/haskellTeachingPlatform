/* eslint-disable */

window.functions['elem'] = {
  name: 'elem',
  englishName: 'elem',
  color: 'purple',
  infix: false,
  typeSignature: 'a -> [a] -> Bool',
  isValidApplication: function (_arguments) {
    return _arguments.length === 2 &&
      _arguments[1].kind === 'list';
  },
  patterns: [
    {
      definitionLine: null,
      doesMatch: function (_arguments) {
        return true;
      },
      apply: function (_arguments) {
        return {
          id: '_' + Math.random().toString(36).substr(2, 9),
          kind: 'bool',
          value: _arguments[1].items.map(item => item.value).includes(_arguments[0].value) ? 'True' : 'False',
        };
      }
    }
  ]
};
