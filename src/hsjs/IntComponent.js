import React from 'react';
import NodeMixins from './Mixins';

import DOM from 'react-dom-factories';

var createReactClass = require('create-react-class');

var Int = React.createFactory(createReactClass({displayName: 'Int',
  mixins: [NodeMixins],
  render: function() {
    return DOM.span({className: 'int'}, this.currentAST().value);
  }
}));

export default Int;
