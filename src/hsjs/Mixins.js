/* eslint-disable */

import ASTTransformations from './ast_transformations';

const NodeMixins = {
  currentAST: function(){
    return ASTTransformations.subtreeById(this.props.lineState.ast, this.props.id);
  }
}

export default NodeMixins;
