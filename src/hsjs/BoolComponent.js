import React from 'react';
import NodeMixins from './Mixins';

import DOM from 'react-dom-factories';

var createReactClass = require('create-react-class');

var Bool = React.createFactory(createReactClass({displayName: 'Bool',
  mixins: [NodeMixins],
  render: function() {
    return DOM.span({className: 'int'}, this.currentAST().value);
  }
}));

export default Bool;
