import React from 'react';
import DOM from 'react-dom-factories';
var createReactClass = require('create-react-class');

import Line from './LineComponent';

var Lines = React.createFactory(createReactClass({displayName: 'Lines',
  render: function() {
    return (
      DOM.div({className: "lines"}, [
          this.props.lines.map((function(line, index) {
            return Line({lineState: {
              ast: line.ast,
              pattern: line.pattern,
              condition: line.condition,
              index: index,
              lastIndex: this.props.lines.length-1,
              clickedComputationId: line.clickedComputationId,
              justComputedId: line.justComputedId,
              applicationHighlightId: this.props.applicationHighlightId,
              highlightedLineIndex: this.props.highlightedLineIndex,
              editing: this.props.editingFirstLine && index === 0,
              program: this.props.program
            }, key: index});
          }).bind(this)),
        (this.props.showHelpText ? DOM.div({className: 'help-text', key: 'help-text'}, "\u2191 click to expand execution") : undefined)
      ])
    );
  }
}));

export default Lines;
