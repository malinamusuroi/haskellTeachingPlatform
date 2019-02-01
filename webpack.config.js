module.exports = {
  entry: './src/index.js',
   module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
       {
        test: /\.css/,
        loaders: "style-loader!css-loader",
        include: __dirname + '/src'
      }
    ]
  },
  mode: 'development',
  resolve: {
    extensions: ['*', '.js', '.jsx', '.css']
  },
  output: {
    path: __dirname + '/public',
    publicPath: '/',
    filename: 'bundle.js'
  },
  devServer: {
    contentBase: './public'
  }
};
