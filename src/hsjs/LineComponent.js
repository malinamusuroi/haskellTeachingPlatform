import React from 'react';
import DOM from 'react-dom-factories';
var createReactClass = require('create-react-class');
import { parse } from '../parser';
import Node from './NodeComponent';

import ReactDOM from 'react-dom';

var LineContext = React.createFactory(createReactClass({displayName: 'LineContext',
  render: function() {
    var contextId = this.props.lineState.clickedComputationId || this.props.lineState.applicationHighlightId;
    return DOM.div({className: 'line-context', dangerouslySetInnerHTML: {__html: ASTTransformations.getContextHTML(this.props.lineState.ast, contextId)}});
  }
}));


var Line = React.createFactory(createReactClass({displayName: 'Line',
  getInitialState: function() {
    return {editingError: false, textLength: null};
  },
  onTextChange: function(event) {
    this.setState({textLength: event.target.value.length});
    try {
      parse(event.target.value);
      this.setState({editingError: false});
    } catch (e) {
      this.setState({editingError: e});
    }
  },
  componentDidUpdate: function(){
    if (ReactDOM.findDOMNode(this).tagName === "INPUT"){
      ReactDOM.findDOMNode(this).focus();
    }
  },
  saveText: function(event) {
    try {
      event.preventDefault();
      this.props.lineState.program.updateInitialAST(this.props.lineState.ast.id, parse(event.target.value));
      this.setState({editingError: false});
    } catch (e) {
      this.setState({editingError: e});
    }
  },
  onKeyDown: function(event) {
    if (event.keyCode === 13) {
      this.saveText(event);
    }
  },
  listText: function() {
    return window.ASTTransformations.astToString(this.props.lineState.ast);
  },
  highlight: function() {
    this.props.lineState.program.highlightLine(this.props.lineState.index);
  },
  unhighlight: function() {
    if (this.props.lineState.highlightedLineIndex == this.props.lineState.index) {
      this.props.lineState.program.highlightLine(null);
    }
  },
  render: function() {
    var className = "line";
    var lineContext, lineEditButton, lineClearButton;
    if (this.props.lineState.highlightedLineIndex == this.props.lineState.index) {
      className += " line-highlight";
      lineContext = LineContext({lineState: this.props.lineState, key: this.props.lineState.index});
    }
    if (this.props.lineState.index === 0 && !this.props.lineState.editing) {
      // lineEditButton = DOM.span({
      //   className: 'lines-edit',
      //   onClick: this.props.lineState.program.editFirstLine,
      //   key: 3
      // }, '(edit)');
      // lineClearButton = DOM.span({
      //   className: 'lines-edit',
      //   onClick: this.props.lineState.program.clearProgram,
      //   key: 4
      // }, '(clear)');
    }

    var errorDiv;
    if (this.state.editingError) {
      errorDiv = DOM.div({
        className: 'line-editing-error',
        style: {left: 8*this.state.editingError.offset},
        key: 1
      }, "\u2191 " + this.state.editingError.message);
    }

    if (this.props.lineState.editing) {
      return DOM.div({className: 'line-editing-container'}, [
        DOM.input({
          defaultValue: this.listText(),
          onBlur: this.saveText,
          onClick: function(event){event.stopPropagation();},
          onChange: this.onTextChange,
          onKeyDown: this.onKeyDown,
          className: (this.state.editingError ? 'input-error' : ''),
          style: {width: Math.max(100, (this.state.textLength || this.listText().length)*10)},
          key: 0
        }),
        errorDiv
      ]);
    } else {
      let patternSpan = this.props.lineState.pattern ? (
        DOM.span({key: this.props.lineState.pattern, className: "lineExtra"}, ` matched pattern at line ${this.props.lineState.pattern}`)
      ) : null;
      let conditionSpan = this.props.lineState.condition ? (
        DOM.span({key: this.props.lineState.condition, className: "lineExtra"}, `, condition ${this.props.lineState.condition} is true`)
      ) : null;
      return DOM.div({
        className: className,
        onTouchStart: this.highlight,
        onMouseEnter: this.highlight,
        onMouseLeave: this.unhighlight
      },
        DOM.div({className: 'line-inner'},
          [
            Node({lineState: this.props.lineState, id: this.props.lineState.ast.id, key: this.props.lineState.ast.id}),
            lineContext,
            patternSpan,
            conditionSpan,
          ]
        )
      );
    }
  }
}));

export default Line;
