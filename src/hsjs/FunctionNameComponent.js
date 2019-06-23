/* eslint-disable */
import React from 'react';
import NodeMixins from './Mixins';

import DOM from 'react-dom-factories';

var createReactClass = require('create-react-class');

var FunctionName = React.createFactory(createReactClass({displayName: 'FunctionName',
  mixins: [NodeMixins],
  render: function() {
    var functionName = this.currentAST().name;
    var func = window.functions[functionName];


    if (functionName === "map"){
      var color = 'red';
    } else if (functionName === "foldl"){
      var color = 'green';
    } else if (functionName === "foldr"){
      var color = 'rgb(255, 100, 224)';
    }
    else {
      var color = func ? func.color : 'gray';
    }

    return DOM.span({className: "functionName", style: {color: color}, key: this.currentAST().id},
      functionName
    );
  }
}));

export default FunctionName;
