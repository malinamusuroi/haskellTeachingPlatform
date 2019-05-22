import React from 'react';
import NodeMixins from './Mixins';

import _ from 'underscore';

import Node from './NodeComponent';
import FunctionName from './FunctionNameComponent';

import DOM from 'react-dom-factories';

var createReactClass = require('create-react-class');

var Application = React.createFactory(createReactClass({displayName: 'Application',
  mixins: [NodeMixins],
  isApplicable: function() {
    return this.props.lineState.index === this.props.lineState.lastIndex &&
           ASTTransformations.isApplicable(this.currentAST());
  },
  apply: function(event) {
    if (this.isApplicable()) {
      this.props.lineState.program.addLineByApplying(this.currentAST().id);
      event.stopPropagation();
    }
  },
  highlight: function(e) {
    e.stopPropagation();
    if (this.isApplicable() && this.currentAST().id !== this.props.lineState.applicationHighlightId) {
      this.previousHighlightApplicationId = this.props.lineState.applicationHighlightId;
      this.props.lineState.program.highlightApplicationId(this.currentAST().id);
    }
  },
  unhighlight: function() {
    if (this.currentAST().id === this.props.lineState.applicationHighlightId) {
      this.props.lineState.program.highlightApplicationId(this.previousHighlightApplicationId);
    }
  },
  render: function() {
    var currentAST = this.currentAST();

    var funcAndArgs = _.flatten(currentAST.arguments.map((function(arg){
      return [Node({lineState: this.props.lineState, id: arg.id, key: arg.id}), (currentAST.functionName.infix ? '' : ' ')];
    }).bind(this)));
    funcAndArgs.pop(); // remove last whitespace

    if (currentAST.functionName.infix) {
      funcAndArgs.splice(1, 0, FunctionName({lineState: this.props.lineState, id: currentAST.functionName.id, key: currentAST.functionName.id}));
      funcAndArgs.splice(1, 0, ' ');
      funcAndArgs.splice(3, 0, ' ');
    } else {
      funcAndArgs.unshift(' ');
      funcAndArgs.unshift(FunctionName({lineState: this.props.lineState, id: currentAST.functionName.id, key: currentAST.functionName.id}));
    }

    funcAndArgs.unshift('(');
    funcAndArgs.push(')');

    var className = 'application';
    if (this.isApplicable() && this.currentAST().id === this.props.lineState.applicationHighlightId) {
      className += ' application-applicable';
    }
    if (this.props.lineState.highlightedLineIndex == this.props.lineState.index && this.currentAST().id === this.props.lineState.clickedComputationId) {
      className += ' application-highlight-clicked-computation';
    }

    return DOM.span({
      className: className,
      onClick: this.apply,
      onTouchStart: this.apply,
      onMouseEnter: this.highlight,
      onMouseMove: this.highlight,
      onMouseLeave: this.unhighlight,
      key: Math.random() + ""
    },
      funcAndArgs
    );
  }
}));

export default Application;
