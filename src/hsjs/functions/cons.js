/* eslint-disable */

window.functions[':'] = {
  name: ':',
  englishName: 'cons',
  color: 'black',
  infix: true,
  typeSignature: 'a -> [a] -> [a]',
  isValidApplication: function(_arguments) {
    // TODO paramaterize list time
    return _arguments.length === 2 &&
    _arguments[1].kind === 'list';
  },
  astToString: function(_arguments) {
   return ":";
  },
  patterns: [
    {
      definitionLine: null,
      doesMatch: function(_arguments){
        return true;
      },
      apply: function(_arguments){
        var items = _arguments[1].items;
        items.unshift(_arguments[0]);

        return {
          id: '_' + Math.random().toString(36).substr(2, 9),
          kind: 'list',
          items: items
        };
      }
    }
  ]
};
