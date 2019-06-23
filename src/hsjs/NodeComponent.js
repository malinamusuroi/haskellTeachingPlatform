/* eslint-disable */

import React from 'react';
import NodeMixins from './Mixins';

import DOM from 'react-dom-factories';

import Application from './ApplicationComponent';
import FunctionName from './FunctionNameComponent';
import List from './ListComponent';
import Int from './IntComponent';
import Bool from './BoolComponent';

var createReactClass = require('create-react-class');

var Node = React.createFactory(createReactClass({displayName: 'Node',
  mixins: [NodeMixins],
  innerNode: function() {
    let currentAST = this.currentAST();

    if (currentAST.kind == 'bracketedExpression') {
      currentAST = currentAST.expression;
    }

    if (currentAST.kind == "functionApplication") {
      return Application({lineState: this.props.lineState, id: currentAST.id});
    } else if (currentAST.kind == "functionName") {
      return FunctionName({lineState: this.props.lineState, id: currentAST.id});
    } else if (currentAST.kind == "list") {
      return List({lineState: this.props.lineState, id: currentAST.id});
    } else if (currentAST.kind == "int") {
      return Int({lineState: this.props.lineState, id: currentAST.id});
    } else if (currentAST.kind == "bool") {
      return Bool({lineState: this.props.lineState, id: currentAST.id});
    } else {
      return DOM.span({}, "cannot handle ast of this kind");
    }
  },
  render: function() {
    var className = '';
    if (this.props.lineState.highlightedLineIndex !== null &&
        this.props.lineState.highlightedLineIndex+1 == this.props.lineState.index &&
        this.currentAST().id === this.props.lineState.justComputedId) {
      className += ' node-highlight-just-computed';
    }
    return DOM.span({className: className}, this.innerNode());
  }
}));

export default Node;
