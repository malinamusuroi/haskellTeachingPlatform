import React from 'react';
import { parse } from './haskell-parser';
import  Lines  from './LinesComponent';

const _ = require('lodash');
//import HaskellParser from './haskell-parser';


let HaskellParser = require('./haskell-parser');

var createReactClass = require('create-react-class');


var HaskellJSProgram = createReactClass({displayName: 'HaskellJSProgram',
  getInitialState: function() {
    return {
      lines: [{ast: parse(this.props.defaultValue), clickedComputationId: null}],
      applicationHighlightId: null,
      highlightedLineIndex: null,
      editingFirstLine: false,
      showHelpText: true
    };
  },

  addLineByApplying: function(id) {
    var lines = _.cloneDeep(this.state.lines);

    lines[lines.length-1].clickedComputationId = id;

    var applyInfo = ASTTransformations.applyFunction(lines[lines.length-1].ast, id);

    lines.push({
      ast: applyInfo.ast,
      clickedComputationId: null,
      justComputedId: applyInfo.justComputedId
    });

    this.setState({lines: lines, showHelpText: false});
  },

  highlightApplicationId: function(id) {
    this.setState({applicationHighlightId: id});
  },

  highlightLine: function(index) {
    this.setState({highlightedLineIndex: index});
  },

  editFirstLine: function() {
    this.clearProgram();
    this.setState({editingFirstLine: true});
  },

  clearProgram: function() {
    this.setState({
      lines: [this.state.lines[0]],
      applicationHighlightId: null,
      highlightedLineIndex: null,
      editingFirstLine: false,
      showHelpText: false
    });
  },

  updateInitialAST: function(id, subtree) {
    var newAST = ASTTransformations.replaceSubtree(this.state.lines[0].ast, id, subtree);

    this.clearProgram();
    this.setState({
      lines: [{ast: newAST, clickedComputationId: null}],
    });
  },

  render: function() {
    return Lines(_.extend({}, this.state, {program: this}));
  }
});

export default HaskellJSProgram;
