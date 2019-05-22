import React from 'react';
import NodeMixins from './Mixins';

import DOM from 'react-dom-factories';

import Application from './ApplicationComponent';
import FunctionName from './FunctionNameComponent';
import List from './ListComponent';
import Int from './IntComponent';


var createReactClass = require('create-react-class');

var Node = React.createFactory(createReactClass({displayName: 'Node',
  mixins: [NodeMixins],
  innerNode: function() {
    const currentAST = this.currentAST();

    if (currentAST.type == "application") {
      return Application({lineState: this.props.lineState, id: currentAST.id});
    } else if (currentAST.type == "functionName") {
      return FunctionName({lineState: this.props.lineState, id: currentAST.id});
    } else if (currentAST.type == "list") {
      return List({lineState: this.props.lineState, id: currentAST.id});
    } else if (currentAST.type == "int") {
      return Int({lineState: this.props.lineState, id: currentAST.id});
    } else {
      return DOM.span({}, "cannot handle ast of this type");
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
