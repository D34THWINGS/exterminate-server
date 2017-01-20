const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/client/index.js',
  output: {
    path: 'dist',
    filename: 'client.bundle.js',
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader' },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin(),
  ],
};
