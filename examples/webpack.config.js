const path = require('path')

module.exports = {
  watch: false,
  context: __dirname,
  target: 'electron-renderer',
  mode: 'development',
  devtool: 'inline-source-map',
  entry: {
    renderer: './src/renderer/index',
    node: './src/node/index',
    preload: './src/node/preload',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      ['@portal-windows/core']: path.resolve(__dirname, '../src/core'),
      ['@portal-windows/node']: path.resolve(__dirname, '../src/node'),
      ['@portal-windows/renderer']: path.resolve(__dirname, '../src/renderer'),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          projectReferences: true,
        },
      },
    ],
  },
}
